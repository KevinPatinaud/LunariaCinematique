import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { newActor, newCinematic, type Asset, type AssetRef } from '../src/shared/model.js';
import { parseCinematic } from '../src/shared/schema.js';
import { parseGameProject } from '../src/shared/game/validation.js';
import {
  animationOwnerId,
  animationScope,
  isCinematicAnimation,
  isGameAnimation,
  registerSpeciesAnimation,
  setSpeciesAnimation,
} from '../src/shared/presentation/ownership.js';
import { presentationIssues } from '../src/shared/presentation/validation.js';
import { resolveAnimation } from '../src/shared/presentation/runtime.js';
import {
  cinematicWalkOptionsForActor,
  inferActorSpecies,
  movementTimingAt,
  resolveCinematicActor,
} from '../src/shared/presentation/cinematicMotion.js';
import {
  ANIMATION_PRESETS,
  animationPresetSpec,
  animationFramesFromSheet,
  animationGenerationPrompt,
  animationOutputRef,
  defaultAnimationName,
  defaultAnimationReference,
  usesWalkPoseGuide,
  type AnimationGenerationRequest,
} from '../src/shared/animationGeneration.js';
import { ensureTransparentBackground, MissingNativeAlphaError, stabilizeSpritesheet } from '../src/main/animationSheets.js';
import { walkPoseGuide } from '../src/main/walkPoseGuide.js';
import { AnimationGenerations, type AnimationGenerator } from '../src/main/animationGenerations.js';
import { ImageTaskQueue } from '../src/main/imageJobs.js';
import { seedProject } from './fixtures/seed40.js';

const asset = (ref: string, name = 'Radis'): Asset => ({
  ref: ref as AssetRef,
  path: ref.slice(10),
  folder: '',
  name,
  kind: 'character',
  bytes: 100,
  modified: 0,
  url: '',
  thumbnail: '',
});

test('Step 1: reusable character animation registration isolates profiles and validates stridePx + syncWithMovement', () => {
  const project = seedProject();
  const sheetRef = 'library://02_characters/radis/stage_01/animations/generated/walk-demo.png' as AssetRef;
  const frames = animationFramesFromSheet(sheetRef, { width: 1024, height: 512 }, 4, 2, 10);
  assert.equal(frames.length, 8);
  assert.deepEqual(frames[0].region, { x: 0, y: 0, width: 256, height: 256 });
  assert.deepEqual(frames[7].region, { x: 768, y: 256, width: 256, height: 256 });

  const animId = registerSpeciesAnimation(project, {
    speciesId: 'radish',
    slot: 'move',
    name: 'Radis — Marche réutilisable',
    frames,
    loop: true,
    stridePx: 120,
    assignSlot: true,
  });

  const radish = project.balance.plants.find(p => p.id === 'radish')!;
  const rose = project.balance.plants.find(p => p.id === 'rose')!;
  const resolvedRadish = resolveAnimation(project, radish, 'move')!;
  const resolvedRose = resolveAnimation(project, rose, 'move')!;

  assert.equal(resolvedRadish.id, animId);
  assert.equal(resolvedRadish.stridePx, 120);
  assert.equal(animationOwnerId(project, resolvedRadish), 'radish');
  assert.notEqual(resolvedRose.id, animId, 'Assigning a walk to Radis must never overwrite Rose');

  // Validate both GameProject schema and Cinematic schema with new optional fields.
  parseGameProject(project);

  const film = newCinematic();
  film.schemaVersion = 4;
  film.presentationCatalog = { projectId: project.id, file: '' };
  const actor = newActor(asset('library://02_characters/radis/stage_01/radis_master.png', 'Radis gaze 02'), 1);
  actor.movement = { enabled: true, dx: 0.3, dy: 0, duration: 2, delay: 0.5, easing: 'linear', repeat: 'once' };
  actor.animation = { mode: 'species', speciesId: 'radish', slot: 'move', animationId: '', speed: 1, syncWithMovement: true, autoFlip: true };
  film.shots[0].actors = [actor];
  parseCinematic(film);
});

test('Step 1: syncWithMovement switches idle ↔ walk, honors stridePx and autoFlip on pingpong', () => {
  const project = seedProject();
  const sheetRef = 'library://02_characters/radis/stage_01/animations/generated/walk-sync.png' as AssetRef;
  registerSpeciesAnimation(project, {
    speciesId: 'radish',
    slot: 'move',
    name: 'Radis — Marche',
    frames: animationFramesFromSheet(sheetRef, { width: 512, height: 256 }, 4, 2, 10),
    loop: true,
    stridePx: 100,
    assignSlot: true,
  });

  const actor = newActor(asset('library://02_characters/radis/stage_01/radis.png', 'Radis'), 1);
  actor.movement = { enabled: true, dx: -0.25, dy: 0, duration: 2, delay: 0.5, easing: 'linear', repeat: 'pingpong' };
  actor.animation = { mode: 'species', speciesId: 'radish', slot: 'move', animationId: '', speed: 1, syncWithMovement: true, autoFlip: true };

  // Before delay -> idle fallback
  const before = resolveCinematicActor(actor, project, 0.2)!;
  assert.equal(before.traveling, false);
  assert.equal(before.usingIdleFallback, true);
  assert.equal(before.autoFlipX, false);

  // Moving left (dx = -0.25 -> -400px) -> walk clip + autoFlipX true
  const movingLeft = resolveCinematicActor(actor, project, 1.5)!;
  assert.equal(movingLeft.traveling, true);
  assert.equal(movingLeft.usingIdleFallback, false);
  assert.equal(movingLeft.autoFlipX, true);
  assert.ok(movingLeft.time > 0);

  // Return leg on pingpong (t = 3.0 -> moving right) -> autoFlipX false
  const returningRight = resolveCinematicActor(actor, project, 3.0)!;
  assert.equal(returningRight.traveling, true);
  assert.equal(returningRight.autoFlipX, false);
  assert.ok(returningRight.time > movingLeft.time, 'Cumulative stride time continues forward smoothly');

  // Once repeat returns to idle after arrival
  actor.movement.repeat = 'once';
  const arrived = resolveCinematicActor(actor, project, 4.0)!;
  assert.equal(arrived.traveling, false);
  assert.equal(arrived.usingIdleFallback, true);
  assert.equal(movementTimingAt(actor, 4.0).traveledPx, 400);

  // Species inference finds radish from asset or display name
  const unnamed = newActor(asset('library://02_characters/radis/stage_01/radis_gaze.png', 'Radis gaze 02'), 1);
  assert.equal(inferActorSpecies(unnamed, project)?.id, 'radish');
});

test('cinematic walking without an authored stride follows distance and preserves the cadence multiplier', () => {
  const project = seedProject();
  const actor = newActor(asset('library://characters/radis.png'), 1);
  actor.width = 120 / 1600;
  actor.height = 120 / 900;
  actor.movement = { enabled: true, dx: 48 / 1600, dy: 0, duration: 3, delay: 0, easing: 'smooth', repeat: 'once' };
  const animationId = registerSpeciesAnimation(project, {
    slot: 'move',
    name: 'Marche',
    frames: animationFramesFromSheet('library://characters/walk.png' as AssetRef, { width: 320, height: 200 }, 4, 2, 12),
    loop: true,
    scope: 'cinematic',
  });
  actor.animation = { mode: 'animation', animationId, speciesId: '', slot: 'move', speed: 1, syncWithMovement: true };
  const progress = (elapsed: number) => resolveCinematicActor(actor, project, elapsed)!.time;
  // The 80×100 frame occupies 96 stage pixels, yielding a 76.8-pixel stride.
  assert.ok(Math.abs(progress(1.5) - (24 / 76.8) * (8 * 0.0833)) < 1e-8);
  assert.ok(progress(0.15) < progress(1.5) / 30, 'The feet stay near the initial contact at a smooth start');
  const normal = progress(1.5);
  actor.animation.speed = 2;
  assert.equal(progress(1.5), normal * 2);
  assert.equal(resolveCinematicActor(actor, project, 3)?.usingIdleFallback, true);
});

test('a generated cinematic walk keeps the placed pose size and aligns its visible feet', () => {
  const project = seedProject();
  const actor = newActor(asset('library://characters/rose.png', 'Rose'), 2 / 3);
  actor.width = 174 / 1600;
  actor.height = 261 / 900;
  actor.movement = { enabled: true, dx: 0.2, dy: 0, duration: 2, delay: 1, easing: 'linear', repeat: 'once' };
  const animationId = registerSpeciesAnimation(project, {
    speciesId: 'rose', slot: 'move', name: 'Marche de Rose', scope: 'cinematic', sourceAssetRef: actor.asset,
    frames: animationFramesFromSheet('library://characters/rose-walk.png', { width: 1168, height: 884 }, 4, 2, 12),
    loop: true,
  });
  actor.animation = { mode: 'animation', speciesId: 'rose', slot: 'move', animationId, speed: 1, syncWithMovement: true };
  const framing = { staticHeight: 0.98, staticBottom: 0.99, frameHeight: 0.88, frameBottom: 0.97 };
  const rest = resolveCinematicActor(actor, project, 0, framing)!;
  const walking = resolveCinematicActor(actor, project, 2, framing)!;
  const arrived = resolveCinematicActor(actor, project, 4, framing)!;
  assert.equal(rest.stretchStatic, true);
  assert.equal(rest.scale, 1);
  assert.equal(rest.visual.width, 174);
  assert.equal(rest.visual.height, 261);
  assert.deepEqual(arrived.visual, rest.visual);
  const renderedHeight = walking.scale * walking.visual.height;
  assert.ok(Math.abs(renderedHeight * framing.frameHeight - 261 * framing.staticHeight) < 1e-8);
  assert.ok(Math.abs(walking.anchorY - (1 - framing.frameBottom) * renderedHeight - 261 * framing.staticBottom) < 1e-8);
});

test('Scope isolation: cinematic animations never leak into gameplay level profiles, projectiles, or idle fallbacks', () => {
  const project = seedProject();
  const radish = project.balance.plants.find(p => p.id === 'radish')!;
  const originalGameMove = resolveAnimation(project, radish, 'move')!;
  assert.equal(animationScope(originalGameMove), 'game');
  assert.equal(isGameAnimation(originalGameMove), true);
  assert.equal(isCinematicAnimation(originalGameMove), false);

  const cineSheetRef = 'library://02_characters/radis/stage_01/animations/cinematics/walk-cine.png' as AssetRef;
  const cineId = registerSpeciesAnimation(project, {
    speciesId: 'radish',
    slot: 'move',
    name: 'Radis — Marche cinématique',
    frames: animationFramesFromSheet(cineSheetRef, { width: 960, height: 640 }, 3, 2, 8),
    loop: true,
    stridePx: 110,
    scope: 'cinematic',
    assignSlot: true, // Even if true is passed, cinematic scope must NEVER overwrite gameplay slots!
  });

  const cineAnim = project.presentation!.animations.find(a => a.id === cineId)!;
  assert.equal(animationScope(cineAnim), 'cinematic');
  assert.equal(isCinematicAnimation(cineAnim), true);
  assert.equal(isGameAnimation(cineAnim), false);
  // Gameplay move slot MUST remain untouched!
  assert.equal(resolveAnimation(project, radish, 'move')?.id, originalGameMove.id);
  // Trying to bind a cinematic animation to a gameplay profile slot throws!
  assert.throws(() => setSpeciesAnimation(project, 'radish', 'move', cineId), /cinématique/);
  // Valid game project passes validation cleanly
  parseGameProject(project);
  assert.deepEqual(presentationIssues(project).filter(i => i.severity === 'error'), []);

  // Stationary cinematic walk rests on actor.asset, never pulling gameplay idle animation!
  const actor = newActor(asset('library://02_characters/radis/stage_01/radis_gaze_02.png', 'Radis'), 1);
  actor.movement = { enabled: true, dx: 0.3, dy: 0, duration: 2, delay: 0.5, easing: 'linear', repeat: 'once' };
  actor.animation = { mode: 'animation', speciesId: 'radish', slot: 'move', animationId: cineId, speed: 1, syncWithMovement: true, autoFlip: true };
  const resting = resolveCinematicActor(actor, project, 0.2)!;
  assert.equal(resting.traveling, false);
  assert.equal(resting.usingIdleFallback, true);
  assert.equal(resting.animation.frames[0]?.asset, actor.asset);
  const walking = resolveCinematicActor(actor, project, 1.0)!;
  assert.equal(walking.traveling, true);
  assert.equal(walking.animation.id, cineId);

  // Output ref separates cinematics folder from gameplay generated folder
  assert.match(
    animationOutputRef({ ref: actor.asset, preset: 'walk', slot: 'move', scope: 'cinematic' }, 'xyz'),
    /^library:\/\/02_characters\/radis\/stage_01\/animations\/cinematics\/walk-xyz\.png$/,
  );
  assert.match(
    animationOutputRef({ ref: actor.asset, preset: 'walk', slot: 'move', scope: 'game' }, 'xyz'),
    /^library:\/\/02_characters\/radis\/stage_01\/animations\/generated\/walk-xyz\.png$/,
  );

  // Validation catches any hand-edited gameplay profile or projectile referencing a cinematic animation
  project.presentation!.profiles[0].slots.push({ slot: 'custom_cine_leak', animationId: cineId });
  assert.ok(presentationIssues(project).some(i => i.message.includes('Animation de cinématique utilisée dans un profil de niveau')));
});

test('Step 3: ensureTransparentBackground removes solid exterior while preserving interior white eyes', () => {
  const w = 24, h = 24;
  // Solid white background everywhere (RGBA = 255,255,255,255)
  const buf = Buffer.alloc(w * h * 4, 255);
  // Draw a red body from (6..17, 6..17) with a white eye at (10..12, 9..11)
  for (let y = 6; y <= 17; y++) {
    for (let x = 6; x <= 17; x++) {
      const idx = (y * w + x) * 4;
      const isEye = x >= 10 && x <= 12 && y >= 9 && y <= 11;
      buf[idx] = isEye ? 255 : 210;
      buf[idx + 1] = isEye ? 255 : 30;
      buf[idx + 2] = isEye ? 255 : 40;
      buf[idx + 3] = 255;
    }
  }
  const cleaned = ensureTransparentBackground(buf, w, h);
  assert.equal(cleaned[3], 0, 'Exterior white background pixel must become transparent');
  const bodyIdx = (7 * w + 7) * 4;
  assert.equal(cleaned[bodyIdx + 3], 255, 'Character body remains opaque');
  const eyeIdx = (10 * w + 11) * 4;
  assert.equal(cleaned[eyeIdx + 3], 255, 'Interior white eye must NOT be keyed out');
});

test('Step 3: magenta chroma-key removes exterior AND enclosed leg holes while preserving lavender petals and despilling fringe', () => {
  const w = 36, h = 36;
  // Pure flat magenta #FF00FF everywhere (works identically in RGBA and BGRA)
  const buf = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    buf[i * 4] = 255;
    buf[i * 4 + 1] = 0;
    buf[i * 4 + 2] = 255;
    buf[i * 4 + 3] = 255;
  }

  // Draw a closed ring of green/red/lavender character pixels around an ENCLOSED #FF00FF pocket at (15..20, 18..25)
  for (let y = 8; y <= 29; y++) {
    for (let x = 10; x <= 25; x++) {
      const isEnclosedHole = x >= 15 && x <= 20 && y >= 18 && y <= 25;
      if (isEnclosedHole) continue;
      const idx = (y * w + x) * 4;
      if (y <= 13) {
        // Lavender petal (purple-blue) — must NEVER be keyed out!
        buf[idx] = 170;
        buf[idx + 1] = 90;
        buf[idx + 2] = 240;
      } else if (x === 14 && y === 15) {
        // White eye
        buf[idx] = 255;
        buf[idx + 1] = 255;
        buf[idx + 2] = 255;
      } else {
        // Red/green radish body & legs
        buf[idx] = 220;
        buf[idx + 1] = 45;
        buf[idx + 2] = 50;
      }
      buf[idx + 3] = 255;
    }
  }
  // Paint an anti-aliased pink-magenta spill fringe pixel directly bordering the exterior at (9, 16)
  const fringeIdx = (16 * w + 9) * 4;
  buf[fringeIdx] = 210;
  buf[fringeIdx + 1] = 95;
  buf[fringeIdx + 2] = 205;
  buf[fringeIdx + 3] = 255;

  const cleaned = ensureTransparentBackground(buf, w, h);
  assert.equal(cleaned[3], 0, 'Exterior magenta must be transparent');
  assert.equal(cleaned[(21 * w + 17) * 4 + 3], 0, 'Enclosed interior magenta pocket between legs MUST become transparent');
  assert.equal(cleaned[(10 * w + 17) * 4 + 3], 255, 'Lavender purple petal must remain opaque');
  assert.equal(cleaned[(15 * w + 14) * 4 + 3], 255, 'White eye must remain opaque');
  assert.equal(cleaned[(16 * w + 12) * 4 + 3], 255, 'Red body must remain opaque');
  // Fringe pixel must either be transparent or strongly despilled (no neon pink rim left)
  const fringeExcess = Math.min(cleaned[fringeIdx], cleaned[fringeIdx + 2]) - cleaned[fringeIdx + 1];
  assert.ok(cleaned[fringeIdx + 3] === 0 || fringeExcess <= 40, 'Magenta edge spill must be suppressed');
});

test('Step 3: stabilizeSpritesheet keeps torso rock-steady despite swinging arms and normalizes per-frame scale drift', () => {
  const cols = 3, rows = 2, rawCellW = 48, rawCellH = 48;
  const w = cols * rawCellW, h = rows * rawCellH;
  const pixels = Buffer.alloc(w * h * 4, 0);

  const paintRect = (x0: number, y0: number, rw: number, rh: number, r = 220, g = 50, b = 50) => {
    for (let y = y0; y < y0 + rh; y++) {
      for (let x = x0; x < x0 + rw; x++) {
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const idx = (y * w + x) * 4;
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255;
      }
    }
  };

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      const cellX = col * rawCellW;
      const cellY = row * rawCellH;
      // Frame 4 is drawn ~20% taller to test scale normalization; all others have height 20
      const tall = idx === 4;
      const bodyH = tall ? 24 : 20;
      const bodyW = tall ? 12 : 10;
      const bodyX = cellX + 18 + (idx % 3) * 2;
      const bodyY = cellY + 12;
      paintRect(bodyX, bodyY, bodyW, bodyH, 220, 40, 40);
      // On frame 1, extend a long thin leaf/arm far to the right outside the torso band (near top)
      if (idx === 1) {
        paintRect(bodyX + bodyW, bodyY + 1, 12, 3, 60, 190, 60);
      }
    }
  }

  const stabilized = stabilizeSpritesheet(pixels, w, h, cols, rows);
  assert.equal(stabilized.frameCount, 6);

  // Measure torso horizontal center (middle vertical band) and overall height of every stabilized frame
  const torsoCenters: number[] = [];
  const heights: number[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let minY = stabilized.cellHeight, maxY = -1;
      for (let y = 0; y < stabilized.cellHeight; y++) {
        for (let x = 0; x < stabilized.cellWidth; x++) {
          const i = ((row * stabilized.cellHeight + y) * stabilized.width + (col * stabilized.cellWidth + x)) * 4;
          if (stabilized.pixels[i + 3] > 64) {
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      heights.push(maxY - minY + 1);
      // Red body center in middle band (y = minY + 40%..70%)
      let sx = 0, cnt = 0;
      for (let y = minY + Math.floor((maxY - minY) * 0.4); y <= minY + Math.ceil((maxY - minY) * 0.7); y++) {
        for (let x = 0; x < stabilized.cellWidth; x++) {
          const i = ((row * stabilized.cellHeight + y) * stabilized.width + (col * stabilized.cellWidth + x)) * 4;
          if (stabilized.pixels[i + 3] > 64) {
            sx += x;
            cnt++;
          }
        }
      }
      torsoCenters.push(sx / cnt);
    }
  }

  const maxJitterX = Math.max(...torsoCenters) - Math.min(...torsoCenters);
  assert.ok(maxJitterX <= 1.5, `Torso X jitter must stay <= 1.5px even with extended arm (got ${maxJitterX.toFixed(2)}px)`);
  const maxHeightDrift = Math.max(...heights) - Math.min(...heights);
  assert.ok(maxHeightDrift <= 2, `Scale normalization must bring tall frame back to median height (drift=${maxHeightDrift}px)`);
});

test('walk prompts request native alpha first from Codex and magenta for keying', () => {
  assert.equal(ANIMATION_PRESETS.walk.columns, 3);
  assert.equal(ANIMATION_PRESETS.walk.rows, 2);
  assert.equal(ANIMATION_PRESETS.walk.fps, 8);
  const request: AnimationGenerationRequest = {
    speciesId: 'radish',
    characterName: 'Radis',
    preset: 'walk',
    slot: 'move',
    ref: 'library://02_characters/radis/stage_01/radis_stage_01_master_v01.png' as AssetRef,
    columns: 3,
    rows: 2,
    fps: 8,
    loop: true,
    facing: 'right',
    instructions: 'Marche fluide.',
  };
  for (const provider of ['codex', 'gemini'] as const) {
    const prompt = animationGenerationPrompt(request, provider);
    assert.match(prompt, /3 colonnes × 2 lignes/);
    assert.match(prompt, /JAMBE PROCHE/);
    assert.match(prompt, /JAMBE LOINTAINE/);
    assert.match(prompt, /LA LIGNE 2 NE DOIT JAMAIS COPIER LA LIGNE 1/);
  }
  assert.match(animationGenerationPrompt(request, 'gemini'), /MAGENTA PUR UNI \(#FF00FF/);
  const codexPrompt = animationGenerationPrompt(request, 'codex');
  assert.match(codexPrompt, /transparent_background=true/);
  assert.match(codexPrompt, /Renvoie le vrai PNG dès que l’outil l’a produit/);
  const fallback = animationGenerationPrompt(request, 'codex', 'magenta');
  assert.match(fallback, /transparent_background=false/);
  assert.match(fallback, /MAGENTA PUR UNI \(#FF00FF/);
  const cinematic = { ...request, scope: 'cinematic' as const, columns: 4 };
  assert.deepEqual([animationPresetSpec('walk', 'cinematic').columns, animationPresetSpec('walk', 'cinematic').rows], [4, 2]);
  assert.equal(usesWalkPoseGuide(request), false);
  assert.equal(usesWalkPoseGuide(cinematic), true);
  assert.match(animationGenerationPrompt(cinematic, 'codex'), /IMAGE 2 — GUIDE DE MOUVEMENT/);
});

test('walk guide alternates the foreground support foot and mirrors the requested direction', () => {
  const right = walkPoseGuide(4, 'right');
  const left = walkPoseGuide(4, 'left');
  const pixel = (guide: typeof right, x: number, y: number) => {
    const start = (y * guide.width + x) * 4;
    return [...guide.pixels.subarray(start, start + 4)];
  };
  assert.deepEqual(pixel(right, 146, 189), [44, 122, 218, 255]);
  assert.deepEqual(pixel(right, 146, 189 + right.height / 2), [192, 103, 43, 255]);
  assert.deepEqual(pixel(left, right.width / 4 - 1 - 146, 189), pixel(right, 146, 189));
});

test('native alpha is preserved before keying and an opaque matte is detected', () => {
  const width = 32;
  const height = 32;
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 4; y < 28; y++) {
    for (let x = 8; x < 24; x++) pixels.set([255, 0, 255, 255], (y * width + x) * 4);
  }
  assert.deepEqual(ensureTransparentBackground(pixels, width, height, true), pixels);
  assert.throws(() => ensureTransparentBackground(Buffer.alloc(pixels.length, 255), width, height, true), MissingNativeAlphaError);
});

test('stabilizeSpritesheet rejects a green backdrop obscuring the gutters', () => {
  const width = 192;
  const height = 128;
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const shade = Math.round(150 * Math.sin(Math.PI * x / width) * Math.sin(Math.PI * y / height));
      const offset = (y * width + x) * 4;
      pixels.set([15 + Math.round(shade / 3), 35 + shade, 10, 255], offset);
      if (x % 64 >= 18 && x % 64 < 46 && y % 64 >= 10 && y % 64 < 54) {
        pixels.set([220, 50, 45, 255], offset);
      }
    }
  }
  assert.throws(() => stabilizeSpritesheet(pixels, width, height, 3, 2), /Impossible de séparer les poses/);
});

test('Step 3: stabilizeSpritesheet aligns shifted cells onto a uniform foot baseline and rejects empty cells', () => {
  const cols = 4, rows = 2, rawCellW = 32, rawCellH = 32;
  const w = cols * rawCellW, h = rows * rawCellH;
  const pixels = Buffer.alloc(w * h * 4, 0);

  // Paint an 8x12 character in every cell at intentionally shifted X/Y offsets
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const ox = c * rawCellW + 4 + (index % 5) * 3;
      const oy = r * rawCellH + 3 + (index % 4) * 4;
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 8; x++) {
          const idx = ((oy + y) * w + (ox + x)) * 4;
          pixels[idx] = 200;
          pixels[idx + 1] = 60;
          pixels[idx + 2] = 60;
          pixels[idx + 3] = 255;
        }
      }
    }
  }

  const stabilized = stabilizeSpritesheet(pixels, w, h, cols, rows);
  assert.equal(stabilized.frameCount, 8);
  assert.equal(stabilized.width, stabilized.cellWidth * cols);
  assert.equal(stabilized.height, stabilized.cellHeight * rows);

  // Every stabilized cell must now have its bottom-most opaque pixel at the EXACT same local Y!
  const bottomYs = new Set<number>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let maxY = -1;
      for (let y = 0; y < stabilized.cellHeight; y++) {
        for (let x = 0; x < stabilized.cellWidth; x++) {
          const idx = ((r * stabilized.cellHeight + y) * stabilized.width + (c * stabilized.cellWidth + x)) * 4;
          if (stabilized.pixels[idx + 3] > 24) maxY = Math.max(maxY, y);
        }
      }
      bottomYs.add(maxY);
    }
  }
  assert.equal(bottomYs.size, 1, 'All stabilized frames must share the exact same foot baseline');

  // Empty cell should be rejected clearly
  const broken = Buffer.alloc(w * h * 4, 0);
  assert.throws(() => stabilizeSpritesheet(broken, w, h, cols, rows), /case 1.*vide/);
});

test('Step 3: AnimationGenerations durable lifecycle (start, stabilize, apply, provenance, restart recovery)', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-anim-gen-'));
  try {
    const libraryRoot = path.join(dir, 'library');
    const jobsRoot = path.join(dir, 'jobs');
    const masterRel = '02_characters/radis/stage_01/radis_stage_01_master_v01.png';
    const masterFile = path.join(libraryRoot, masterRel);
    await fs.mkdir(path.dirname(masterFile), { recursive: true });
    await fs.writeFile(masterFile, Buffer.from('fake-master-png'));

    const fakeOutputPng = Buffer.from('fake-stabilized-spritesheet-png');
    let capturedProvider = '';
    const generate: AnimationGenerator = async task => {
      capturedProvider = task.request.aiProvider ?? 'openai';
      const out = path.join(task.folder, 'raw-sheet.png');
      await fs.writeFile(out, Buffer.from('fake-raw-sheet-png'));
      return out;
    };

    const processor = new AnimationGenerations({
      jobsRoot,
      generatedRoot: dir,
      queue: new ImageTaskQueue(),
      generate,
      inspect: () => ({ width: 1024, height: 512 }),
      png: bytes => bytes,
      stabilize: () => ({
        png: fakeOutputPng,
        width: 1024,
        height: 512,
        cellWidth: 256,
        cellHeight: 256,
        frameCount: 8,
        recommendedStridePx: 110,
      }),
    });

    const req: AnimationGenerationRequest = {
      speciesId: 'radish',
      characterName: 'Radis',
      preset: 'walk',
      slot: 'move',
      ref: `library://${masterRel}` as AssetRef,
      columns: 4,
      rows: 2,
      fps: 10,
      loop: true,
      facing: 'right',
      instructions: 'Marche sautillante joyeuse.',
      aiProvider: 'gemini',
      codexModel: 'gemini-2.5-flash-image',
    };
    assert.match(animationGenerationPrompt(req, 'gemini'), /4 colonnes × 2 lignes/);
    assert.match(animationOutputRef(req, 'abc'), /^library:\/\/02_characters\/radis\/stage_01\/animations\/generated\/walk-abc\.png$/);

    const started = await processor.start(libraryRoot, req);
    for (let i = 0; i < 40 && ['queued', 'generating'].includes(processor.get(started.id).status); i++) {
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    const ready = processor.get(started.id);
    assert.equal(ready.status, 'ready');
    assert.equal(ready.aiProvider, 'gemini');
    assert.equal(capturedProvider, 'gemini');
    assert.equal(ready.frameCount, 8);

    const applied = await processor.apply(libraryRoot, started.id);
    assert.equal(applied.status, 'applied');
    assert.ok(applied.sheetRef);
    const savedFile = path.join(libraryRoot, applied.sheetRef!.slice('library://'.length));
    assert.deepEqual(await fs.readFile(savedFile), fakeOutputPng);
    const provenance = JSON.parse(await fs.readFile(`${savedFile}.json`, 'utf8'));
    assert.equal(provenance.aiProvider, 'gemini');
    assert.equal(provenance.preset, 'walk');

    // Restart recovery preserves applied job cleanly
    const reloaded = new AnimationGenerations({
      jobsRoot,
      generatedRoot: dir,
      queue: new ImageTaskQueue(),
      generate,
      inspect: () => ({ width: 1024, height: 512 }),
      png: bytes => bytes,
      stabilize: () => ({ png: fakeOutputPng, width: 1024, height: 512, cellWidth: 256, cellHeight: 256, frameCount: 8, recommendedStridePx: 110 }),
    });
    await reloaded.ready;
    const tasks = await reloaded.list();
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].kind, 'animation');
    assert.equal(tasks[0].job.status, 'applied');
    await processor.close();
    await reloaded.close();
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('Cinematic walk uses the selected static image as reference, preserves expression/shape in prompt, and prioritizes exact sourceAssetRef matches', () => {
  const masterRef = 'library://02_characters/radis/stage_01/radis_stage_01_master_v01.png' as AssetRef;
  const scaredRef = 'library://02_characters/radis/stage_01/radis_effraye_v01.png' as AssetRef;
  const npcRef = 'library://02_characters/guide/guide_ruines.png' as AssetRef;
  const otherNpcRef = 'library://02_characters/marchand/marchand.png' as AssetRef;
  const assets: Asset[] = [
    asset(masterRef, 'Radis'),
    asset(scaredRef, 'Radis effrayé'),
    asset(npcRef, 'Guide des ruines'),
    asset(otherNpcRef, 'Marchand'),
  ];

  const scaredActor = newActor(assets[1], 1);
  scaredActor.name = 'Radis';

  // 1. In cinematic scope, the selected static image MUST be used as reference (NOT silently replaced by Master)
  const cineRef = defaultAnimationReference({
    scope: 'cinematic',
    actor: scaredActor,
    actorSpeciesId: 'radish',
    speciesId: 'radish',
    speciesSpriteRef: masterRef,
    assets,
  });
  assert.equal(cineRef.ref, scaredRef);
  assert.equal(cineRef.masterRef, masterRef);
  assert.equal(cineRef.fromActorAsset, true);

  // 2. In game scope, Master remains the default reference
  const gameRef = defaultAnimationReference({
    scope: 'game',
    speciesId: 'radish',
    speciesSpriteRef: masterRef,
    assets,
  });
  assert.equal(gameRef.ref, masterRef);
  assert.equal(gameRef.fromActorAsset, false);

  // 3. Switching to another species from workshop uses that requested species's reference, not the selected actor
  const roseRef = 'library://02_characters/rose/rose_master.png' as AssetRef;
  const workshopOtherSpecies = defaultAnimationReference({
    scope: 'cinematic',
    actor: scaredActor,
    actorSpeciesId: 'radish',
    speciesId: 'rose',
    speciesSpriteRef: roseRef,
    assets,
  });
  assert.equal(workshopOtherSpecies.ref, roseRef);
  assert.equal(workshopOtherSpecies.fromActorAsset, false);

  // 4. Default animation naming preserves clean names for Master, specific poses, and standalone NPCs
  assert.equal(
    defaultAnimationName({ characterName: 'Radis', preset: 'walk', scope: 'cinematic', ref: masterRef, assetName: 'Radis' }),
    'Radis — Marche',
  );
  assert.equal(
    defaultAnimationName({ characterName: 'Radis', preset: 'walk', scope: 'cinematic', ref: scaredRef, assetName: 'Radis effrayé' }),
    'Radis effrayé — Marche',
  );
  assert.equal(
    defaultAnimationName({ characterName: 'Radis', preset: 'walk', scope: 'cinematic', ref: 'library://02_characters/radis/stage_01/poses/triste.png' as AssetRef, assetName: 'Triste' }),
    'Radis (Triste) — Marche',
  );
  assert.equal(
    defaultAnimationName({ characterName: 'Guide des ruines', preset: 'walk', scope: 'cinematic', ref: npcRef, assetName: 'Guide des ruines' }),
    'Guide des ruines — Marche',
  );

  // 5. Cinematic prompt enforces strict preservation of the selected static image's expression and shape
  const cinePrompt = animationGenerationPrompt({
    speciesId: 'radish',
    characterName: 'Radis',
    preset: 'walk',
    slot: 'move',
    scope: 'cinematic',
    ref: scaredRef,
    columns: 3,
    rows: 2,
    fps: 8,
    loop: true,
    facing: 'right',
    instructions: ANIMATION_PRESETS.walk.defaultInstructions,
  }, 'gemini');
  assert.match(cinePrompt, /image statique préalablement sélectionnée/i);
  assert.match(cinePrompt, /expression faciale et son émotion exactes/i);
  assert.match(cinePrompt, /ne remplace JAMAIS son expression par un sourire neutre/i);
  assert.doesNotMatch(cinePrompt, /Master officiel/);

  // 6. Registration stores sourceAssetRef, supports standalone NPCs without speciesId, and prioritizes exact matches
  const project = seedProject();
  const masterWalkId = registerSpeciesAnimation(project, {
    speciesId: 'radish',
    slot: 'move',
    name: 'Radis — Marche',
    frames: animationFramesFromSheet('library://02_characters/radis/stage_01/animations/cinematics/walk-master.png' as AssetRef, { width: 960, height: 640 }, 3, 2, 8),
    loop: true,
    stridePx: 110,
    scope: 'cinematic',
    sourceAssetRef: masterRef,
  });
  const scaredWalkId = registerSpeciesAnimation(project, {
    speciesId: 'radish',
    slot: 'move',
    name: 'Radis effrayé — Marche',
    frames: animationFramesFromSheet('library://02_characters/radis/stage_01/animations/cinematics/walk-scared.png' as AssetRef, { width: 960, height: 640 }, 3, 2, 8),
    loop: true,
    stridePx: 110,
    scope: 'cinematic',
    sourceAssetRef: scaredRef,
  });
  const npcWalkId = registerSpeciesAnimation(project, {
    slot: 'move',
    name: 'Guide des ruines — Marche',
    frames: animationFramesFromSheet('library://studio_generated/characters/animations/cinematics/walk-guide.png' as AssetRef, { width: 960, height: 640 }, 3, 2, 8),
    loop: true,
    stridePx: 110,
    scope: 'cinematic',
    sourceAssetRef: npcRef,
  });

  parseGameProject(project);
  assert.deepEqual(presentationIssues(project).filter(i => i.severity === 'error'), []);

  // Exact static image match comes FIRST, other pose of the same species is clearly tagged "(autre pose)", NPC walk never leaks
  const scaredOptions = cinematicWalkOptionsForActor(scaredActor, project, 'radish');
  assert.deepEqual(scaredOptions, [
    { value: `anim:${scaredWalkId}`, label: 'Radis effrayé — Marche', matchesSource: true },
    { value: `anim:${masterWalkId}`, label: 'Radis — Marche (autre pose)', matchesSource: false },
  ]);

  // Standalone NPC sees ONLY its own static image's walk (never Radis's walk, never another NPC's walk)
  const npcActor = newActor(assets[2], 1);
  npcActor.movement = { enabled: true, dx: 0.2, dy: 0, duration: 2, delay: 0.5, easing: 'linear', repeat: 'once' };
  npcActor.animation = { mode: 'animation', speciesId: '', slot: 'move', animationId: npcWalkId, speed: 1, syncWithMovement: true, autoFlip: true };
  assert.deepEqual(cinematicWalkOptionsForActor(npcActor, project), [
    { value: `anim:${npcWalkId}`, label: 'Guide des ruines — Marche', matchesSource: true },
  ]);
  assert.deepEqual(cinematicWalkOptionsForActor(newActor(assets[3], 1), project), []);

  // NPC playback rests on npcActor.asset before movement and plays npcWalkId while moving
  const npcRest = resolveCinematicActor(npcActor, project, 0.1)!;
  assert.equal(npcRest.traveling, false);
  assert.equal(npcRest.animation.frames[0]?.asset, npcRef);
  const npcWalk = resolveCinematicActor(npcActor, project, 1.0)!;
  assert.equal(npcWalk.traveling, true);
  assert.equal(npcWalk.animation.id, npcWalkId);

  // Validation rejects non-image sourceAssetRef
  const brokenAnim = project.presentation!.animations.find(a => a.id === npcWalkId)!;
  brokenAnim.sourceAssetRef = 'library://02_characters/guide/notes.txt' as AssetRef;
  assert.ok(presentationIssues(project).some(i => i.message.includes('L’image statique de référence doit être une image.')));
});
