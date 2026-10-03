/** Pure animation math shared by editor/preview; mirrored by CinematicMotion.gd.
 * Times are seconds, travel offsets are normalised stage coordinates, angles degrees.
 * No requestAnimationFrame, randomness or accumulated deltas: any time can be scrubbed.
 */
import { STAGE, type Actor, type MotionEffect, type MotionPreset, type ObjectMovement } from './model.js';
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp01(value); return t * t * (3 - 2 * t); };
/** Falling arrival: three diminishing rebounds, ending exactly at the authored pose. */
const bounceOut = (value: number) => {
  let t = clamp01(value);
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75; }
  if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375; }
  t -= 2.625 / 2.75; return 7.5625 * t * t + 0.984375;
};
export const motionLabels: Record<MotionPreset, string> = {
  none: 'Aucun effet', float: 'Flottement', sway: 'Balancement', pulse: 'Respiration',
  spin: 'Rotation continue', shake: 'Tremblement', bounce: 'Petit bond',
  nod: 'Acquiescement', recoil: 'Recul · impact', heartbeat: 'Battement', flutter: 'Virevolte',
  orbit: 'Orbite', figure8: 'Vol en huit', zigzag: 'Zigzag', tumble: 'Roulade',
  surprise: 'Sursaut', jelly: 'Oscillation élastique'
};
export function newMotion(preset: MotionPreset = 'float'): MotionEffect {
  const period = preset === 'spin' ? 8 : preset === 'recoil' ? 0.7 : preset === 'surprise' ? 0.9 :
    preset === 'shake' ? 1 : preset === 'bounce' ? 1.8 : preset === 'jelly' ? 1.6 : preset === 'tumble' ? 2 : 3;
  return { preset, intensity: 0.35, period, delay: 0,
    loop: !['recoil', 'nod', 'tumble', 'surprise'].includes(preset), reverse: false };
}
export function newMovement(actor: Pick<Actor, 'x' | 'width'>): ObjectMovement {
  return { enabled: true, dx: actor.x + actor.width / 2 > 0.55 ? -0.2 : 0.2, dy: 0,
    duration: 3, delay: 0, easing: 'smooth', repeat: 'once' };
}
export function entryEnd(actor: Actor): number {
  return actor.entry.preset === 'none' ? 0 : actor.entry.delay + actor.entry.duration;
}
export interface ActorPose { x: number; y: number; opacity: number; rotation: number; scale: number; pivotX: number; pivotY: number }
export function restPose(actor: Actor): ActorPose {
  return { x: actor.x * STAGE.width, y: actor.y * STAGE.height, opacity: actor.opacity,
    rotation: actor.rotation ?? 0, scale: 1, pivotX: actor.width * STAGE.width / 2,
    pivotY: actor.height * STAGE.height * (actor.pivot === 'top' ? 0 : actor.pivot === 'bottom' ? 1 : 0.5) };
}
/** Travel starts after the entrance finishes. A one-way trip holds its destination. */
export function travelOffset(actor: Actor, elapsed: number): { x: number; y: number } {
  const m = actor.movement;
  if (!m?.enabled) return { x: 0, y: 0 };
  const time = elapsed - entryEnd(actor) - m.delay;
  if (time <= 0) return { x: 0, y: 0 };
  const cycles = time / Math.max(0.1, m.duration);
  const linear = m.repeat === 'pingpong' ? 1 - Math.abs((cycles % 2) - 1) : clamp01(cycles);
  const t = m.easing === 'linear' ? linear : smooth(linear);
  return { x: m.dx * STAGE.width * t, y: m.dy * STAGE.height * t };
}
/** Scene-time envelope. An exit freezes travel/effects at its start, then leaves cleanly. */
export function actorPose(actor: Actor, elapsed: number): ActorPose {
  const time = Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0;
  const exit = actor.exit, leaving = !!exit && exit.preset !== 'none' && time >= exit.start;
  const pose = activePose(actor, leaving ? exit!.start : time);
  if (!leaving) return pose;
  const t = smooth((time - exit!.start) / Math.max(0.1, exit!.duration));
  switch (exit!.preset) {
    case 'fade': pose.opacity *= 1 - t; break;
    case 'left': pose.x += (-actor.width * STAGE.width - pose.x) * t; break;
    case 'right': pose.x += (STAGE.width - pose.x) * t; break;
    case 'top': pose.y += (-actor.height * STAGE.height - pose.y) * t; break;
    case 'bottom': pose.y += (STAGE.height - pose.y) * t; break;
    case 'shrink': pose.scale *= 1 - t; pose.opacity *= 1 - t; break;
    case 'spiral': pose.rotation += 360 * t; pose.scale *= 1 - t; pose.opacity *= 1 - t; break;
    case 'rise': pose.y -= 240 * t; pose.opacity *= 1 - t; break;
    case 'fall': pose.y += 240 * t; pose.opacity *= 1 - t; break;
  }
  // Rotated silhouettes may still overlap the frame, so explicitly hide the completed exit.
  if (t >= 1) pose.opacity = 0;
  return pose;
}
function activePose(actor: Actor, time: number): ActorPose {
  const pose = restPose(actor);
  const raw = clamp01((time - actor.entry.delay) / Math.max(0.01, actor.entry.duration));
  const p = smooth(raw);
  if (actor.entry.preset !== 'none' && time < actor.entry.delay) pose.opacity = 0;
  switch (actor.entry.preset) {
    case 'fade': pose.opacity *= p; break;
    case 'left': pose.x = -actor.width * STAGE.width + (pose.x + actor.width * STAGE.width) * p; break;
    case 'right': pose.x = STAGE.width + (pose.x - STAGE.width) * p; break;
    case 'bottom': pose.y = STAGE.height + (pose.y - STAGE.height) * p; break;
    case 'top': pose.y = -actor.height * STAGE.height + (pose.y + actor.height * STAGE.height) * p; break;
    case 'zoom': pose.scale = 0.2 + 0.8 * p; pose.opacity *= p; break;
    case 'pop': {
      const c = 1.70158, u = raw - 1;
      pose.scale = Math.max(0, 1 + (c + 1) * u ** 3 + c * u ** 2);
      pose.opacity *= clamp01(raw * 4); break;
    }
    case 'drop':
      pose.y = -actor.height * STAGE.height + (pose.y + actor.height * STAGE.height) * bounceOut(raw);
      pose.opacity *= clamp01(raw * 8); break;
    case 'spiral': pose.rotation -= 360 * (1 - p); pose.scale = 0.15 + 0.85 * p; pose.opacity *= p; break;
    case 'rise': pose.y += 100 * (1 - p); pose.scale = 0.25 + 0.75 * p; pose.opacity *= p; break;
  }
  const travel = travelOffset(actor, time);
  pose.x += travel.x; pose.y += travel.y;
  const m = actor.motion;
  if (!m || m.preset === 'none') return pose;
  const local = time - entryEnd(actor) - m.delay;
  if (local <= 0) return pose;
  const cycles = local / Math.max(0.2, m.period);
  if (!m.loop && cycles >= 1) return pose;
  const phase = (cycles % 1) * Math.PI * 2 * (m.reverse ? -1 : 1);
  const sin = Math.sin(phase), strength = clamp01(m.intensity);
  switch (m.preset) {
    case 'float': pose.y -= 45 * strength * sin; break;
    case 'sway': pose.rotation += 20 * strength * sin; break;
    case 'pulse': pose.scale *= 1 + 0.12 * strength * sin; break;
    case 'spin': pose.rotation += phase * 180 / Math.PI; break;
    case 'shake':
      pose.x += 18 * strength * (0.65 * Math.sin(phase * 5) + 0.35 * Math.sin(phase * 11));
      pose.y += 9 * strength * Math.sin(phase * 7); break;
    case 'bounce': pose.y -= 90 * strength * Math.sin(phase / 2) ** 2; break;
    case 'nod': pose.rotation += 12 * strength * sin; pose.y += 5 * strength * Math.sin(phase / 2) ** 2; break;
    case 'recoil': {
      const impulse = Math.sin((cycles % 1) * Math.PI) ** 2;
      const direction = (actor.flipX ? 1 : -1) * (m.reverse ? -1 : 1);
      pose.x += 65 * strength * impulse * direction;
      pose.rotation += 12 * strength * impulse * direction; break;
    }
    case 'heartbeat': pose.scale *= 1 + 0.22 * strength * sin ** 8; break;
    case 'flutter': pose.y -= 25 * strength * sin; pose.rotation += 15 * strength * Math.sin(phase * 3); break;
    case 'orbit': pose.x += 65 * strength * sin; pose.y -= 40 * strength * (1 - Math.cos(phase)); break;
    case 'figure8': pose.x += 75 * strength * sin; pose.y -= 35 * strength * Math.sin(phase * 2); break;
    case 'zigzag':
      pose.x += 70 * strength * (2 / Math.PI) * Math.asin(Math.sin(phase * 2));
      pose.y -= 35 * strength * Math.sin(phase / 2) ** 2; break;
    case 'tumble': {
      // Roll out and back: even partial intensity returns to the original angle without a snap.
      const roll = Math.sin(phase / 2) ** 2 * strength * (m.reverse ? -1 : 1);
      pose.x += 120 * roll; pose.rotation += 360 * roll; break;
    }
    case 'surprise': {
      const jump = Math.sin(phase / 2) ** 2 * strength;
      pose.y -= 95 * jump; pose.scale *= 1 + 0.18 * jump;
      pose.rotation += 16 * sin * jump; break;
    }
    case 'jelly': {
      const elastic = Math.sin(phase * 3) * Math.sin(phase / 2) ** 2 * (1 - cycles % 1) * strength;
      pose.scale *= 1 + 0.24 * elastic; pose.rotation += 14 * elastic; break;
    }
  }
  return pose;
}
/** Exact same order as SVG/Godot: pivot, rotation, uniform scale, local flip. */
export function actorAnchor(actor: Actor, elapsed: number, animated = true, u = 0.5, v = 0.22) {
  const pose = animated ? actorPose(actor, elapsed) : restPose(actor);
  const x = ((actor.flipX ? 1 - u : u) * actor.width * STAGE.width - pose.pivotX) * pose.scale;
  const y = (v * actor.height * STAGE.height - pose.pivotY) * pose.scale;
  const radians = pose.rotation * Math.PI / 180, c = Math.cos(radians), s = Math.sin(radians);
  return { x: pose.x + pose.pivotX + x * c - y * s, y: pose.y + pose.pivotY + x * s + y * c };
}
export function actorTransform(pose: ActorPose): string {
  return `translate(${pose.x},${pose.y}) translate(${pose.pivotX},${pose.pivotY}) rotate(${pose.rotation}) scale(${pose.scale}) translate(${-pose.pivotX},${-pose.pivotY})`;
}
/** Bounds use the visual, rotated/scaled corners, not only the original PNG box. */
export function actorVisualBox(actor: Actor, elapsed = 0, animated = false) {
  const corners = [[0,0], [1,0], [1,1], [0,1]].map(([u,v]) => actorAnchor(actor, elapsed, animated, u,v));
  const x = Math.min(...corners.map(p => p.x)), y = Math.min(...corners.map(p => p.y));
  return { x: x / STAGE.width, y: y / STAGE.height,
    width: (Math.max(...corners.map(p => p.x)) - x) / STAGE.width,
    height: (Math.max(...corners.map(p => p.y)) - y) / STAGE.height };
}
/** Editing destinations never changes the resting position or the source image. */
export function setMovementDestination(actor: Actor, x: number, y: number): ObjectMovement {
  const m = actor.movement ?? newMovement(actor);
  const limit = (v: number, fallback: number) => Number.isFinite(v) ? Math.max(-1, Math.min(2, v)) : fallback;
  return { ...m, enabled: true, dx: limit(x, actor.x) - actor.x, dy: limit(y, actor.y) - actor.y };
}
