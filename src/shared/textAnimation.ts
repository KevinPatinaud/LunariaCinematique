/** Pure, seekable animation. No CSS clocks, random values or mutation of the text. */
import type { Bubble, TextAnimation, TextEffect, TextReveal } from './model.js';
import { bubbleLayout } from './geometry.js';
import { unitsForLines, type TextUnit } from './textSegments.js';
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
export const revealLabels: Record<TextReveal, string> = {
  instant: 'Tout le texte immédiatement', typewriter: 'Écriture progressive', words: 'Mot par mot', fade: 'Fondu du texte'
};
export const textEffectLabels: Record<TextEffect, string> = {
  none: 'Aucun', shout: 'Cri · explosion des lettres', wave: 'Vague', shake: 'Tremblement', bounce: 'Lettres bondissantes'
};
export function newTextAnimation(reveal: TextReveal = 'typewriter', effect: TextEffect = 'none'): TextAnimation {
  return { reveal, effect, speed: reveal === 'words' ? 3 : 32, delay: 0,
    duration: effect === 'shout' ? 0.65 : effect === 'none' ? 0.6 : 1.5,
    intensity: effect === 'shout' ? 0.7 : 0.35, loop: effect === 'wave' || effect === 'shake' || effect === 'bounce' };
}
const unitsCache = new WeakMap<Bubble, { key: string; units: TextUnit[] }>();
export function bubbleTextUnits(bubble: Bubble): TextUnit[] {
  const key = JSON.stringify([bubble.text, bubble.width, bubble.fontSize, bubble.style]);
  const cached = unitsCache.get(bubble);
  if (cached?.key === key) return cached.units;
  const units = unitsForLines(bubbleLayout(bubble).lines);
  unitsCache.set(bubble, {key, units});
  return units;
}
function revealLength(a: TextAnimation, units: readonly TextUnit[]): number {
  if (!units.some(u => /\S/u.test(u.text))) return 0;
  if (a.reveal === 'typewriter') return units.length / a.speed;
  if (a.reveal === 'words') return (Math.max(...units.map(u => u.word)) + 1) / a.speed;
  if (a.reveal === 'fade') return a.duration;
  return 0;
}
/** Auto mode keeps advance.seconds of reading time AFTER the reveal/first effect cycle. */
export function textIntroDuration(bubble: Bubble): number {
  const a = bubble.textAnimation, units = bubbleTextUnits(bubble);
  if (!a || !units.some(u => /\S/u.test(u.text))) return 0;
  return a.delay + Math.max(revealLength(a, units), a.effect === 'none' ? 0 : a.duration);
}
/** A first click completes a reveal (or a one-shot expressive entrance), not a loop. */
export function textNeedsCompletion(bubble: Bubble, elapsed: number, completedAt?: number): boolean {
  const a = bubble.textAnimation;
  if (!a || completedAt !== undefined || !bubble.text.trim()) return false;
  const intro = a.delay + Math.max(revealLength(a, bubbleTextUnits(bubble)), a.effect !== 'none' && (a.effect === 'shout' || !a.loop) ? a.duration : 0);
  return elapsed + 1e-9 < intro;
}
export function autoDialogueDuration(bubble: Bubble, completedAt?: number): number {
  return Math.min(textIntroDuration(bubble), completedAt ?? Infinity) + bubble.advance.seconds;
}
export interface GlyphPose { opacity: number; dx: number; dy: number; rotation: number; scale: number }
/** Coordinates x/y are centres in the text's content box; effect never moves the frame. */
export function glyphPose(bubble: Bubble, unit: TextUnit, elapsed: number, x: number, y: number,
  width: number, height: number, completed = false): GlyphPose {
  const result: GlyphPose = {opacity: 1, dx: 0, dy: 0, rotation: 0, scale: 1};
  const a = bubble.textAnimation;
  if (!a) return result;
  const time = (Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0) - a.delay;
  if (!completed) {
    if (time < 0) result.opacity = 0;
    else if (a.reveal === 'typewriter') result.opacity = unit.index < Math.floor(time * a.speed + 1e-9) ? 1 : 0;
    else if (a.reveal === 'words') result.opacity = unit.word < Math.floor(time * a.speed + 1e-9) ? 1 : 0;
    else if (a.reveal === 'fade') result.opacity = smooth(time / a.duration);
  }
  if (time < 0 || a.effect === 'none' || (completed && (a.effect === 'shout' || !a.loop))) return result;
  const cycles = time / a.duration;
  // "Shout" is always a single readable impact, never a flashing loop.
  if ((a.effect === 'shout' || !a.loop) && cycles >= 1) return result;
  const t = cycles % 1, phase = t * Math.PI * 2, strength = clamp(a.intensity);
  // One-shot oscillations ease in/out. Looping ones remain continuous across a cycle.
  const envelope = a.loop ? Math.min(1, time / Math.min(0.12, a.duration * 0.2)) : Math.sin(Math.PI * t) ** 2;
  switch (a.effect) {
    case 'shout': {
      // Compact start -> explosive expansion -> settling, without destroying the words.
      const burst = t < 0.24 ? smooth(t / 0.24) : 1 - smooth((t - 0.24) / 0.76);
      const direction = ((unit.index * 37) % 11 - 5) / 5;
      result.dx = (x - width / 2) * 0.12 * strength * burst;
      result.dy = ((y - height / 2) * 0.1 + direction * 9) * strength * burst;
      result.rotation = direction * 16 * strength * burst;
      result.scale = 1 + 0.7 * strength * burst - 0.45 * strength * (1 - smooth(t / 0.12));
      break;
    }
    case 'wave': result.dy = Math.sin(phase - unit.index * 0.55) * 10 * strength * envelope; break;
    case 'shake':
      result.dx = (0.65 * Math.sin(phase * 5 + unit.index * 1.7) + 0.35 * Math.sin(phase * 11 + unit.index)) * 6 * strength * envelope;
      result.dy = Math.sin(phase * 7 + unit.index * 2.3) * 4 * strength * envelope;
      result.rotation = Math.sin(phase * 3 + unit.index) * 7 * strength * envelope; break;
    case 'bounce': result.dy = -16 * strength * Math.sin((phase - unit.index * 0.5) / 2) ** 2 * envelope; break;
  }
  return result;
}

/** Keep animated glyph bounds inside the text area, without reflowing or touching the frame.
 * Bounds use one em vertically so ascenders/descenders remain visible near the edges.
 * A resting glyph is never moved: authored overflow is still reported by diagnostics. */
export function fitGlyphPose(pose: GlyphPose, x: number, y: number, glyphWidth: number, fontSize: number,
  width: number, height: number): GlyphPose {
  if (pose.dx === 0 && pose.dy === 0 && pose.rotation === 0 && pose.scale === 1) return pose;
  const p = {...pose}, angle = p.rotation * Math.PI / 180;
  const halfX = (Math.abs(Math.cos(angle)) * glyphWidth + Math.abs(Math.sin(angle)) * fontSize) / 2;
  const halfY = (Math.abs(Math.sin(angle)) * glyphWidth + Math.abs(Math.cos(angle)) * fontSize) / 2;
  p.scale = Math.min(p.scale, width / Math.max(1, halfX * 2), height / Math.max(1, halfY * 2));
  const hx = halfX * p.scale, hy = halfY * p.scale;
  p.dx = Math.max(hx, Math.min(width - hx, x + p.dx)) - x;
  p.dy = Math.max(hy, Math.min(height - hy, y + p.dy)) - y;
  return p;
}
