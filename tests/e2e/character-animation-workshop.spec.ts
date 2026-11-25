import { test, expect, _electron, type ElectronApplication, type Page } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { newActor, newCinematic, upgradeCinematicFormat, type Asset, type AssetRef } from '../../src/shared/model.js';
import { seedProject } from '../fixtures/seed40.js';
import { fixturePresentation } from '../presentation-fixture.js';
import { resolveCinematicActor } from '../../src/shared/presentation/cinematicMotion.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SAMPLE = path.join(ROOT, 'example-library/01_europe/lunaria/exterieur_et_entree/aube_sur_la_boutique_lunaria_v01.png');

let app: ElectronApplication;
let page: Page;
let folder: string;
let profile: string;
let library: string;
let projectFile: string;
let errors: string[];

async function boot() {
  const env = {
    ...process.env,
    LUNARIA_E2E: '1',
    LUNARIA_TEST_USER_DATA: profile,
    LUNARIA_E2E_ANIMATION_RESULT: path.join(profile, 'walk-sheet.png'),
  };
  delete env.LUNARIA_DEV_URL;
  app = await _electron.launch({ args: [ROOT], env });
  page = await app.firstWindow();
  page.on('pageerror', e => errors.push(e.message));
  await page.waitForURL('app://studio/index.html');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.studio-project-state')).toContainText(path.basename(projectFile));
}

async function stop() {
  if (!app) return;
  await app.evaluate(({ BrowserWindow }) => {
    for (const win of BrowserWindow.getAllWindows()) win.destroy();
  }).catch(() => undefined);
  await app.close().catch(() => undefined);
}

test.beforeEach(async () => {
  errors = [];
  folder = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-char-anim-e2e-'));
  profile = path.join(folder, 'profile');
  library = path.join(profile, 'library');
  projectFile = path.join(folder, 'project.game.json');
  await fs.mkdir(path.join(library, '02_characters/radis/stage_01'), { recursive: true });
  const masterPath = path.join(library, '02_characters/radis/stage_01/radis_stage_01_master_v01.png');
  const scaredPosePath = path.join(library, '02_characters/radis/stage_01/radis_effraye_v01.png');
  await fs.copyFile(SAMPLE, masterPath);
  await fs.copyFile(SAMPLE, scaredPosePath);
  await fs.writeFile(
    path.join(profile, 'codex-models.json'),
    JSON.stringify([{ id: 'codex-test-model', label: 'Codex Test', description: '', isDefault: true }]),
  );
  await fs.writeFile(
    path.join(profile, 'gemini-models.json'),
    JSON.stringify([{ id: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image', description: '', isDefault: true, provider: 'gemini' }]),
  );
  await fs.writeFile(path.join(profile, 'settings.json'), JSON.stringify({ libraryRoot: library }));

  const masterRef = 'library://02_characters/radis/stage_01/radis_stage_01_master_v01.png' as AssetRef;
  const actorAsset: Asset = {
    ref: masterRef,
    path: masterRef.slice(10),
    folder: '02_characters/radis/stage_01',
    name: 'Radis',
    kind: 'character',
    bytes: 100,
    modified: 0,
    url: '',
    thumbnail: '',
  };
  const film = newCinematic();
  film.title = 'Test marche';
  const actor = newActor(actorAsset, 1);
  actor.name = 'Radis';
  actor.movement = { enabled: true, dx: 0.25, dy: 0, duration: 2, delay: 0, easing: 'smooth', repeat: 'once' };
  film.shots[0].actors = [actor];
  upgradeCinematicFormat(film);

  const project = fixturePresentation(seedProject(), masterRef);
  project.cinematics = [film];
  await fs.writeFile(projectFile, JSON.stringify(project));
  await fs.writeFile(
    path.join(profile, 'game-recents.json'),
    JSON.stringify([{ path: projectFile, title: project.title, updatedAt: new Date().toISOString() }]),
  );
  await boot();
  const walkSheet = await app.evaluate(({ nativeImage }) => {
    const cell = 48, width = 4 * cell, height = 2 * cell;
    const pixels = Buffer.alloc(width * height * 4).fill(Buffer.from([255, 0, 255, 255]));
    for (let frame = 0; frame < 8; frame++) {
      const left = (frame % 4) * cell;
      const top = Math.floor(frame / 4) * cell;
      for (let y = 8; y < 40; y++) {
        for (let x = 10; x < 38; x++) {
          const step = (frame + y) % 6;
          if (y >= 30 && x >= 20 + step && x < 25 + step) continue;
          pixels.set(y < 28 ? [40, 60, 220, 255] : [40, 185, 90, 255], ((top + y) * width + left + x) * 4);
        }
      }
    }
    return Array.from(nativeImage.createFromBitmap(pixels, { width, height }).toPNG());
  });
  await fs.writeFile(path.join(profile, 'walk-sheet.png'), Buffer.from(walkSheet));
});

test.afterEach(async () => {
  await stop();
  await fs.rm(folder, { recursive: true, force: true }).catch(() => undefined);
});

test('incurve le trajet sur la scène, prévisualise, annule et enregistre la courbure', async () => {
  const sceneActor = page.getByTestId('scene').locator('[data-testid^="actor-"]').first();
  await sceneActor.click();
  const handle = page.getByTestId('movement-bend');
  const line = page.getByTestId('movement-curve-line');
  const destination = page.getByTestId('movement-destination');
  const straight = await line.getAttribute('d');
  const end = await destination.locator('circle').getAttribute('cy');
  const box = (await handle.boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 42, { steps: 6 });
  await expect(line).not.toHaveAttribute('d', straight!);
  await page.mouse.up();
  await expect(destination.locator('circle')).toHaveAttribute('cy', end!);

  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(line).toHaveAttribute('d', straight!);
  await page.getByText('Ajuster la trajectoire', { exact: true }).click();
  const bend = page.getByLabel('Courbure de la trajectoire');
  await bend.fill('-12');
  await bend.press('Enter');
  await expect(line).not.toHaveAttribute('d', straight!);
  const actorY = () => sceneActor.evaluate(g => (g as SVGGElement).transform.baseVal.getItem(0).matrix.f);
  const startY = await actorY();
  await page.getByRole('button', { name: 'Aperçu des mouvements' }).click();
  await expect.poll(actorY).toBeLessThan(startY - 10);
  await page.getByRole('button', { name: 'Retour au placement' }).click();
  await page.keyboard.press('Control+s');
  await expect.poll(async () => {
    const saved = JSON.parse(await fs.readFile(projectFile, 'utf8')) as ReturnType<typeof seedProject>;
    return saved.cinematics?.[0].shots[0].actors[0].movement;
  }).toMatchObject({ dx: 0.25, dy: 0, duration: 2, bend: -0.12 });
  await page.getByRole('button', { name: 'Rétablir la ligne droite' }).click();
  await expect(line).toHaveAttribute('d', straight!);
  expect(errors).toEqual([]);
});

test('le catalogue Codex se charge pendant une recherche Gemini et reste affiché si Gemini échoue', async () => {
  await app.evaluate(({ app }, fixture) => {
    const fileSystem = process.getBuiltinModule('node:fs')!.promises;
    const readFile = fileSystem.readFile;
    const release = new Promise<void>(resolve => app.once('release-test-gemini-catalog', resolve));
    fileSystem.readFile = (async (...args: Parameters<typeof readFile>) => {
      if (args[0] !== fixture) return readFile(...args);
      fileSystem.readFile = readFile;
      await release;
      throw new Error('Catalogue Gemini temporairement indisponible.');
    }) as typeof readFile;
  }, path.join(profile, 'gemini-models.json'));

  await page.locator('[data-testid^="actor-"]').first().click();
  await page.getByRole('button', { name: 'Produire une marche par l’IA' }).click();
  const dialog = page.getByRole('dialog', { name: 'Produire une marche par l’IA' });
  const codex = dialog.getByLabel('Modèle Codex');
  await expect(codex.locator('option[value="codex-test-model"]')).toHaveCount(1);

  await dialog.getByRole('button', { name: 'Google Gemini' }).click();
  const gemini = dialog.getByLabel('Modèle Gemini');
  await expect(gemini).toBeDisabled();
  await expect(gemini.locator('option[value="codex-test-model"]')).toHaveCount(0);

  await dialog.getByRole('button', { name: 'OpenAI (Codex)' }).click();
  await expect(codex).toBeEnabled();
  await expect(codex.locator('option[value="codex-test-model"]')).toHaveCount(1);
  await app.evaluate(({ app }) => app.emit('release-test-gemini-catalog'));
  await expect(dialog.getByRole('alert')).toHaveCount(0);
  await expect(codex.locator('option[value="gemini-2.5-flash-image"]')).toHaveCount(0);

  await dialog.getByRole('button', { name: 'Google Gemini' }).click();
  await expect(gemini.locator('option[value="gemini-2.5-flash-image"]')).toHaveCount(1);
  await expect(dialog.getByRole('alert')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('produire une marche par l’IA depuis Déplacement A → B isole strictement les animations de cinématiques des animations de niveaux', async () => {
  // Select Radis in the shot (movement is already enabled in fixture)
  await page.locator('[data-testid^="actor-"]').first().click();

  // 0. Before generating any cinematic animation, ZERO gameplay level animations should appear in Cinématiques!
  await expect(page.getByLabel('Animation de marche')).toHaveCount(0);
  await expect(page.locator('.inspector')).not.toContainText('marche alternée');
  await expect(page.locator('.inspector')).not.toContainText('lance-pierre');

  // 1. Single clean button directly inside Déplacement A → B
  await page.getByRole('button', { name: 'Produire une marche par l’IA' }).click();
  const genDialog = page.getByRole('dialog', { name: 'Produire une marche par l’IA' });
  await expect(genDialog).toBeVisible();

  // 2. Switch provider from OpenAI (Codex) to Google Gemini
  await genDialog.getByRole('button', { name: 'Google Gemini' }).click();
  await expect(genDialog.getByLabel('Modèle Gemini')).toBeVisible();
  await genDialog.getByLabel('Modèle Gemini').selectOption('gemini-2.5-flash-image');

  // 3. Produce the eight-pose walk in an isolated profile.
  await genDialog.getByRole('button', { name: 'Produire la marche' }).click();
  await expect.poll(async () => {
    const tasks = await page.evaluate(() => window.lunaria!.listImageTasks());
    return tasks.find(t => t.kind === 'animation')?.job.status;
  }, { timeout: 15000 }).toBe('ready');

  // Verify live cycle preview appears
  await expect(genDialog.getByLabel('Aperçu animé du cycle généré')).toBeVisible();
  await expect(genDialog.getByText('Aperçu du cycle généré · 8 poses', { exact: false })).toBeVisible();
  await genDialog.getByRole('button', { name: 'Pause', exact: true }).click();
  const frameLabel = genDialog.locator('.anim-frame-badge');
  const currentPose = await frameLabel.innerText();
  await genDialog.getByRole('button', { name: 'Pose suivante' }).click();
  await expect(frameLabel).not.toHaveText(currentPose);
  await expect(genDialog.getByRole('checkbox', { name: 'Voir la planche' })).toBeInViewport();

  // 4. One-click apply: registers as a CINEMATIC animation (NOT overwriting gameplay level slots!)
  await genDialog.getByRole('button', { name: 'Utiliser cette marche dans le plan' }).click();
  await expect(genDialog).toBeHidden();

  // 5. Verify the walk selector inside Déplacement A → B now shows ONLY the cinematic walk + Image fixe glissée
  const walkSelect = page.getByLabel('Animation de marche');
  await expect(walkSelect).toBeVisible();
  await expect(walkSelect).toHaveValue(/^anim:/);
  const walkOptions = await walkSelect.locator('option').allTextContents();
  expect(walkOptions).toEqual(['Image fixe glissée', 'Radis — Marche']);

  // 6. Switch directly to Plantes → Radis → Animations et sons and confirm the cinematic walk NEVER leaks into Niveaux!
  await page.locator('.studio-sections').getByRole('button', { name: /^Plantes/ }).click();
  await page.locator('.gd-catalog').getByRole('button', { name: /Radis/ }).first().click();
  await page.getByRole('button', { name: /Animations et sons/ }).click();
  await page.getByRole('button', { name: /^Ses animations/ }).click();
  await expect(page.locator('.lp-owned-section')).not.toContainText('Radis — Marche');

  expect(errors).toEqual([]);
});

test('produire une marche en cinématique utilise l’image statique sélectionnée (et non le Master) comme référence', async () => {
  // Replace the shot actor with a specific static expression pose while the Master also exists in the same folder.
  await stop();
  const raw = JSON.parse(await fs.readFile(projectFile, 'utf8'));
  const scaredRef = 'library://02_characters/radis/stage_01/radis_effraye_v01.png';
  raw.cinematics[0].shots[0].actors[0].asset = scaredRef;
  raw.cinematics[0].shots[0].actors[0].name = '14467b47-737e-4bb2-b680-61d0c4c40b33';
  await fs.writeFile(projectFile, JSON.stringify(raw));
  await boot();

  await page.locator('[data-testid^="actor-"]').first().click();
  await page.getByRole('button', { name: 'Produire une marche par l’IA' }).click();
  const genDialog = page.getByRole('dialog', { name: 'Produire une marche par l’IA' });
  await expect(genDialog).toBeVisible();

  // Reference must be the selected static pose (radis_effraye_v01.png), NOT silently replaced by the Master!
  await expect(genDialog).toContainText('Image statique de référence');
  await expect(genDialog.locator('.anim-gen-intro')).toContainText('pour Radis');
  await expect(genDialog).toContainText('Image sélectionnée dans le plan · radis_effraye_v01.png');

  // Optional switch to Master and back works cleanly without hiding the control
  await genDialog.getByRole('button', { name: 'Utiliser le Master à la place' }).click();
  await expect(genDialog).toContainText('Autre image de référence · radis_stage_01_master_v01.png');
  await genDialog.getByRole('button', { name: 'Revenir à l’image du plan' }).click();
  await expect(genDialog).toContainText('Image sélectionnée dans le plan · radis_effraye_v01.png');

  // Produce the walk and confirm the queued/completed task actually used the selected static image as sourceRef
  await expect(genDialog.getByLabel('Modèle Codex')).toBeVisible();
  await genDialog.getByRole('button', { name: 'Produire la marche' }).click();
  await expect.poll(async () => {
    const tasks = await page.evaluate(() => window.lunaria!.listImageTasks());
    return tasks.find(t => t.kind === 'animation')?.job.status;
  }, { timeout: 15000 }).toBe('ready');

  const taskSourceRef = await page.evaluate(async () => {
    const tasks = await window.lunaria!.listImageTasks();
    const animTask = tasks.find(t => t.kind === 'animation');
    return animTask?.kind === 'animation' ? animTask.job.sourceRef : '';
  });
  expect(taskSourceRef).toBe(scaredRef);

  // Apply to shot and verify the walk option reflects the static pose and saves sourceAssetRef
  await genDialog.getByRole('button', { name: 'Utiliser cette marche dans le plan' }).click();
  await expect(genDialog).toBeHidden();

  const walkSelect = page.getByLabel('Animation de marche');
  await expect(walkSelect).toBeVisible();
  const walkOptions = await walkSelect.locator('option').allTextContents();
  expect(walkOptions).toEqual(['Image fixe glissée', 'Radis effraye — Marche']);

  await page.keyboard.press('Control+s');
  await expect.poll(async () => {
    const saved = JSON.parse(await fs.readFile(projectFile, 'utf8'));
    const cineAnim = saved.presentation.animations.find((a: { scope?: string }) => a.scope === 'cinematic');
    return cineAnim?.sourceAssetRef ?? '';
  }, { timeout: 10000 }).toBe(scaredRef);

  expect(errors).toEqual([]);
});

test('la cadence locale et les essais du personnage restent accessibles après réouverture', async () => {
  test.setTimeout(90_000);
  const actorOnStage = () => page.locator('[data-testid^="actor-"]').first();
  const generation = () => page.getByRole('dialog', { name: 'Produire une marche par l’IA' });
  const openGenerator = () => page.getByRole('button', { name: 'Produire une marche par l’IA' }).click();
  const speedInput = () => page.getByLabel('Cadence des pas', { exact: true });
  const applyInPlan = (dialog: ReturnType<typeof generation>) => dialog.getByRole('button', { name: 'Utiliser cette marche dans le plan' }).click();
  const savedProject = async () => JSON.parse(await fs.readFile(projectFile, 'utf8')) as ReturnType<typeof seedProject>;

  await actorOnStage().click();
  await openGenerator();
  const first = generation();
  await expect(first.getByLabel('Cadence en images par seconde')).toHaveValue('12');
  await first.getByRole('button', { name: 'Produire la marche' }).click();
  await expect(first.getByLabel('Aperçu animé du cycle généré')).toBeVisible({ timeout: 15_000 });

  // Delay the real atlas request across the static-to-walk transition.
  await app.evaluate(({ app, session }) => {
    const requests: (() => void)[] = [];
    const webRequest = session.defaultSession.webRequest;
    webRequest.onBeforeRequest({ urls: ['lunaria-asset://library/*'] }, ({ url }, proceed) => {
      const atlas = new URL(url);
      if (atlas.pathname.includes('/animations/cinematics/') && !atlas.searchParams.has('thumb')) {
        requests.push(() => proceed({}));
      } else proceed({});
    });
    app.once('release-test-walk-atlas', () => {
      webRequest.onBeforeRequest(null);
      requests.forEach(proceed => proceed());
    });
  });
  await applyInPlan(first);
  await expect(first).toBeHidden();
  const visibleSprite = actorOnStage().locator('image:visible');
  const actorX = () => actorOnStage().evaluate(g => (g as SVGGElement).transform.baseVal.getItem(0).matrix.e);
  const startX = await actorX();
  await page.getByRole('button', { name: 'Aperçu des mouvements' }).click();
  await page.getByRole('button', { name: 'Pause des mouvements' }).click();
  const previewTime = page.getByLabel('Temps de l’aperçu des mouvements');
  await previewTime.press('Home');
  await previewTime.press('PageUp');
  await expect.poll(actorX).toBeGreaterThan(startX + 6);
  await expect(visibleSprite).toHaveAttribute('href', /radis_stage_01_master_v01\.png/);
  await app.evaluate(({ app }) => app.emit('release-test-walk-atlas'));
  await expect(visibleSprite).toHaveAttribute('href', /animations.*cinematics/);
  await previewTime.press('Home');
  await expect(visibleSprite).toHaveAttribute('href', /radis_stage_01_master_v01\.png/);
  await page.getByRole('button', { name: 'Retour au placement' }).click();

  const firstBinding = await page.getByLabel('Animation de marche').inputValue();
  await speedInput().fill('2');
  await speedInput().press('Enter');
  await page.keyboard.press('Control+s');

  await expect.poll(async () => {
    const saved = await savedProject();
    const actor = saved.cinematics?.[0].shots[0].actors[0];
    const clip = saved.presentation?.animations.find(item => item.id === actor?.animation?.animationId);
    return { speed: actor?.animation?.speed, duration: actor?.movement?.duration, stride: clip?.stridePx, frameDuration: clip?.frames[0].duration };
  }).toEqual({ speed: 2, duration: 2, stride: undefined, frameDuration: 0.0833 });
  const saved = await savedProject();
  const movingActor = saved.cinematics![0].shots[0].actors[0];
  const normal = resolveCinematicActor({ ...movingActor, animation: { ...movingActor.animation!, speed: 1 } }, saved, 0.11)!;
  const quicker = resolveCinematicActor(movingActor, saved, 0.11)!;
  expect(normal.time).toBeGreaterThan(0);
  expect(quicker.time).toBeCloseTo(normal.time * 2);

  await page.getByTestId('play-from-current').click();
  const playing = page.locator('svg.scene-svg.is-playing');
  await expect(playing).toBeVisible();
  await expect(playing.locator('[data-testid^="actor-"] image:visible')).toHaveAttribute('href', /animations.*cinematics/);
  await page.getByRole('button', { name: 'Quitter l’aperçu' }).click();
  await actorOnStage().click();

  await page.getByRole('button', { name: 'Modifier le cycle de marche' }).click();
  const workshop = page.getByRole('dialog', { name: 'Animations de cinématiques par personnage' });
  const clipName = workshop.getByLabel('Nom du clip dans l’atelier');
  await expect(clipName).toHaveValue('Radis — Marche');
  await clipName.fill('Radis — Premier essai');
  await workshop.getByRole('button', { name: 'Fermer', exact: true }).click();
  await expect(speedInput()).toHaveValue('2');
  await page.keyboard.press('Control+s');
  await expect.poll(async () => (await savedProject()).presentation?.animations
    .find(item => item.id === firstBinding.slice(5))?.name).toBe('Radis — Premier essai');

  await openGenerator();
  const second = generation();
  await second.getByLabel('Cadence en images par seconde').fill('16');
  await second.getByRole('button', { name: 'Produire la marche' }).click();
  await expect(second.getByLabel('Aperçu animé du cycle généré')).toBeVisible({ timeout: 15_000 });
  await second.getByRole('button', { name: 'Fermer', exact: true }).last().click();

  const otherJob = await page.evaluate(async () => {
    const tasks = await window.lunaria!.listImageTasks();
    const source = tasks.find(item => item.kind === 'animation' && item.context);
    if (!source || source.kind !== 'animation' || !source.context) throw Error('Missing source job.');
    return window.lunaria!.startAnimationGeneration({
      ...source.request,
      context: { ...source.context, shotId: 'another-shot' },
    });
  });
  await expect.poll(async () => (await page.evaluate(id => window.lunaria!.getAnimationGeneration(id), otherJob.id)).status).toBe('ready');

  await stop();
  await boot();
  await actorOnStage().click();
  await expect(speedInput()).toHaveValue('2');
  await page.getByRole('button', { name: 'Historique des marches' }).click();
  const history = page.getByRole('dialog', { name: 'Historique des marches' });
  const attempts = history.getByLabel('Essai de marche');
  await expect(attempts.locator('option')).toHaveCount(2);
  await expect(history.getByLabel('Cadence dans le plan')).toHaveValue('2');
  const firstJobId = await attempts.inputValue();
  await attempts.selectOption({ index: 0 });
  await expect(attempts).not.toHaveValue(firstJobId);
  await history.getByLabel('Cadence dans le plan').fill('1.5');
  await applyInPlan(history);
  await expect(history).toBeHidden();
  await expect(speedInput()).toHaveValue('1.5');
  await expect(page.getByLabel('Animation de marche')).not.toHaveValue(firstBinding);

  await page.getByRole('button', { name: 'Historique des marches' }).click();
  await history.getByLabel('Essai de marche').selectOption(firstJobId);
  await applyInPlan(history);
  await expect(history).toBeHidden();
  await expect(page.getByLabel('Animation de marche')).toHaveValue(firstBinding);
  await page.keyboard.press('Control+s');
  await expect.poll(async () => (await savedProject()).presentation?.animations
    .filter(item => item.scope === 'cinematic').map(item => item.frames[0].duration).sort()).toEqual([0.0625, 0.0833]);
  expect(errors).toEqual([]);
});
