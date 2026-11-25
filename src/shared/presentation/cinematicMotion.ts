/** Pure cinematic animation-to-movement synchronization shared by Studio and mirrored by CinematicPresentation.gd. */
import { STAGE, type Actor } from '../model.js';
import { entryEnd, sampleMovementPath } from '../motion.js';
import type { GameProject } from '../game/types.js';
import { IDENTITY, type ActorAnimation, type AnimationDefinition, type SpeciesVisual } from './types.js';
import { animationOwnerId, isCinematicAnimation } from './ownership.js';
import { duration, resolveActor, resolveAnimation, species, type Species } from './runtime.js';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

export interface MovementTiming {
  hasMovement: boolean;
  traveling: boolean;
  /** Cumulative distance traveled along the A→B path in logical 1600×900 stage pixels. */
  traveledPx: number;
  /** Elapsed time spent actively moving (seconds). */
  travelElapsed: number;
  /** Instantaneous horizontal travel direction (-1 left, 1 right, 0 stationary or purely vertical). */
  directionX: -1 | 0 | 1;
}

export function movementTimingAt(actor: Actor, elapsed: number): MovementTiming {
  const m = actor.movement;
  if (!m?.enabled) {
    return { hasMovement: false, traveling: false, traveledPx: 0, travelElapsed: 0, directionX: 0 };
  }
  const time = Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  const exit = actor.exit;
  const effectiveTime = exit && exit.preset !== 'none' && time >= exit.start ? exit.start : time;
  const local = effectiveTime - entryEnd(actor) - m.delay;
  if (local <= 0 || Math.hypot(m.dx * STAGE.width, m.dy * STAGE.height) < 1e-3) {
    return { hasMovement: true, traveling: false, traveledPx: 0, travelElapsed: 0, directionX: 0 };
  }
  const legDuration = Math.max(0.1, m.duration);
  const cycles = local / legDuration;
  const repeats = m.repeat === 'pingpong';
  const completedLegs = repeats ? Math.floor(cycles) : 0;
  const legFraction = repeats ? cycles - completedLegs : clamp01(cycles);
  const forward = completedLegs % 2 === 0;
  const eased = m.easing === 'linear' ? legFraction : smooth(legFraction);
  const { tangentX, length } = sampleMovementPath(m, forward ? eased : 1 - eased);
  const signedDx = forward ? tangentX : -tangentX;
  const directionX: -1 | 0 | 1 = Math.abs(signedDx) < 1e-3 ? 0 : signedDx > 0 ? 1 : -1;
  return {
    hasMovement: true,
    traveling: repeats || cycles < 1 - 1e-6,
    traveledPx: length * (completedLegs + eased),
    travelElapsed: repeats ? local : Math.min(local, legDuration),
    directionX,
  };
}

export interface ResolvedCinematicActor {
  animation: AnimationDefinition;
  visual: SpeciesVisual;
  scale: number;
  time: number;
  autoFlipX: boolean;
  traveling: boolean;
  usingIdleFallback: boolean;
  anchorY: number;
  stretchStatic?: boolean;
}

export interface WalkFraming {
  staticHeight: number;
  staticBottom: number;
  frameHeight: number;
  frameBottom: number;
}

export function usesCinematicWalkFraming(animation: AnimationDefinition, binding: ActorAnimation): boolean {
  return animation.scope === 'cinematic' && animation.kind === 'frames' && !!animation.sourceAssetRef &&
    ['move', 'walk', 'run'].includes(binding.slot) && animation.frames.length > 0 &&
    animation.frames.every(frame => !!frame.region);
}

function movementClipTime(animation: AnimationDefinition, visual: SpeciesVisual, slot: string, scale: number, timing: MovementTiming, speed: number): number {
  let stride = animation.stridePx ?? 0;
  if (stride <= 0 && animation.scope === 'cinematic' && animation.kind === 'frames' &&
    animation.loop && animation.frames.length > 1 && (slot === 'move' || slot === 'walk')) {
    const crop = animation.frames[0].region;
    const drawnWidth = crop ? Math.min(visual.width, visual.height * crop.width / crop.height) : visual.width;
    // A complete cycle covers two steps, estimated from the displayed frame width.
    stride = 0.8 * drawnWidth;
  }
  return stride > 0
    ? timing.traveledPx * Math.max(0.01, duration(animation)) * speed / (stride * Math.max(0.1, scale))
    : timing.travelElapsed * speed;
}

/**
 * Resolve the active clip, playback clock and horizontal facing for an animated cinematic actor.
 * Preserves legacy behavior verbatim when syncWithMovement/autoFlip are not enabled.
 */
export function resolveCinematicActor(
  actor: Actor,
  project: GameProject,
  elapsed: number,
  framing?: WalkFraming | null,
): ResolvedCinematicActor | undefined {
  const binding = actor.animation;
  if (!binding) return undefined;
  const resolved = resolveActor(project, binding);
  if (!resolved.animation) return undefined;

  const baseVisual: SpeciesVisual = resolved.visual ?? {
    sprite: { asset: actor.asset },
    width: 100,
    height: 100,
    baseline: 0,
    mirror: false,
    tint: '#ffffff',
    note: '',
  };
  const w = actor.width * STAGE.width;
  const h = actor.height * STAGE.height;
  const framed = usesCinematicWalkFraming(resolved.animation, binding);
  // Generated walks use the authored pose's apparent height. A wide step can extend outside its box.
  const visual = framed ? { ...baseVisual, width: baseVisual.height * Math.max(...resolved.animation.frames
    .map(({ region }) => region!.width / region!.height)) } : baseVisual;
  const scale = framed ? h / visual.height * ((framing?.staticHeight ?? 1) / (framing?.frameHeight ?? 1))
    : Math.min(w / visual.width, h / visual.height);
  const frameAnchor = resolved.animation.frames[0]?.anchor ?? resolved.animation.anchor;
  const anchorY = framed && framing
    ? h * framing.staticBottom + (frameAnchor.y - framing.frameBottom) * visual.height * scale : h;
  const timing = movementTimingAt(actor, elapsed);
  const speed = binding.speed;
  const baseTime = Math.max(0, elapsed - actor.entry.delay) * speed;

  // Auto-flip mirrors the actor when traveling opposite to its native/authored facing.
  let autoFlipX = false;
  if (binding.autoFlip && timing.directionX !== 0) {
    const baseFacingRight = !(actor.flipX !== visual.mirror);
    autoFlipX = timing.directionX < 0 ? baseFacingRight : !baseFacingRight;
  }

  if (!binding.syncWithMovement || !timing.hasMovement) {
    return {
      animation: resolved.animation,
      visual,
      scale,
      time: baseTime,
      autoFlipX,
      traveling: timing.traveling,
      usingIdleFallback: false,
      anchorY,
    };
  }

  if (!timing.traveling) {
    if (resolved.animation.scope === 'cinematic') {
      // Never pull gameplay level idle clips for cinematic animations; rest cleanly on the actor's placed pose.
      const restClip: AnimationDefinition = {
        ...resolved.animation,
        kind: 'frames',
        frames: [{ asset: actor.asset, duration: 1, anchor: { x: 0.5, y: 1 } }],
        duration: 1,
        loop: true,
        motion: { preset: 'none', amplitude: 0, period: 1 },
        transform: framed ? IDENTITY : resolved.animation.transform,
        markers: [],
      };
      return {
        animation: restClip,
        visual: framed ? { ...baseVisual, width: w, height: h, tint: '#ffffff',
          rollingDrums: undefined, rollingParts: undefined, mirror: timing.directionX !== 0 && visual.mirror } : visual,
        scale: framed ? 1 : scale,
        time: 0,
        autoFlipX,
        traveling: false,
        usingIdleFallback: true,
        anchorY: h,
        stretchStatic: framed,
      };
    }
    const owner = binding.speciesId ? species(project, binding.speciesId) : undefined;
    const idleClip = owner ? resolveAnimation(project, owner, 'idle') : undefined;
    if (idleClip && idleClip.id !== resolved.animation.id) {
      return {
        animation: idleClip,
        visual,
        scale,
        time: baseTime,
        autoFlipX,
        traveling: false,
        usingIdleFallback: true,
        anchorY: h,
      };
    }
    return {
      animation: resolved.animation,
      visual,
      scale,
      time: 0,
      autoFlipX,
      traveling: false,
      usingIdleFallback: true,
      anchorY: h,
    };
  }

  const time = movementClipTime(resolved.animation, visual, binding.slot, scale, timing, speed);

  return {
    animation: resolved.animation,
    visual,
    scale,
    time,
    autoFlipX,
    traveling: true,
    usingIdleFallback: false,
    anchorY,
  };
}

function normalizeToken(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Best-effort species inference from an actor's existing binding, asset path or display name. */
export function inferActorSpecies(actor: Pick<Actor, 'asset' | 'name' | 'animation'>, project: GameProject): Species | undefined {
  const all: Species[] = [...project.balance.plants, ...project.balance.enemies];
  if (actor.animation?.speciesId) {
    const bound = all.find(item => item.id === actor.animation?.speciesId);
    if (bound) return bound;
  }
  const refLower = actor.asset.toLowerCase();
  const exactVisual = all.find(item => item.visual?.sprite.asset.toLowerCase() === refLower);
  if (exactVisual) return exactVisual;

  const assetTokens = new Set(normalizeToken(actor.asset).split(' ').filter(Boolean));
  const nameTokens = new Set(normalizeToken(actor.name).split(' ').filter(Boolean));
  for (const item of all) {
    const idTokens = normalizeToken(item.id).split(' ').filter(t => t.length >= 3);
    const labelTokens = normalizeToken(item.name).split(' ').filter(t => t.length >= 3);
    if (
      idTokens.some(token => assetTokens.has(token) || nameTokens.has(token)) ||
      labelTokens.some(token => assetTokens.has(token) || nameTokens.has(token))
    ) {
      return item;
    }
  }
  return undefined;
}

export interface CinematicWalkOption {
  value: string;
  label: string;
  matchesSource: boolean;
}

/**
 * List cinematic walk options for an actor, prioritizing animations generated from
 * the actor's exact static image (`sourceAssetRef === actor.asset`) so expression
 * and shape continuity is immediately visible.
 */
export function cinematicWalkOptionsForActor(
  actor: Pick<Actor, 'asset' | 'name' | 'animation'>,
  project: GameProject,
  speciesId?: string,
): CinematicWalkOption[] {
  const catalog = project.presentation;
  if (!catalog) return [];
  const exact: CinematicWalkOption[] = [];
  const unattributed: CinematicWalkOption[] = [];
  const otherPoses: CinematicWalkOption[] = [];

  for (const anim of catalog.animations) {
    if (!isCinematicAnimation(anim) || anim.element) continue;
    if (anim.kind === 'procedural' && anim.motion.preset !== 'walk') continue;
    const owner = animationOwnerId(project, anim);
    const matchesSource = Boolean(anim.sourceAssetRef && anim.sourceAssetRef === actor.asset);
    if (matchesSource) {
      exact.push({ value: `anim:${anim.id}`, label: anim.name, matchesSource: true });
      continue;
    }
    if (anim.sourceAssetRef) {
      if (speciesId && owner === speciesId) {
        otherPoses.push({
          value: `anim:${anim.id}`,
          label: `${anim.name} (autre pose)`,
          matchesSource: false,
        });
      }
      continue;
    }
    if (owner && speciesId && owner !== speciesId) continue;
    if (owner && !speciesId) continue;
    unattributed.push({ value: `anim:${anim.id}`, label: anim.name, matchesSource: false });
  }

  return [...exact, ...unattributed, ...otherPoses];
}
