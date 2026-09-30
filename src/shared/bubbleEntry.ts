import type { Bubble, BubbleEntry, BubbleEntryPreset } from './model.js';

export const defaultBubbleEntry: BubbleEntry = { preset: 'pop', duration: 0.3 };
export const shoutBubbleEntry: BubbleEntry = { preset: 'burst', duration: 0.65 };
export const bubbleEntryLabels: Record<BubbleEntryPreset, string> = {
  none: 'Sans animation', pop: 'Surgissement doux', left: 'Glissement depuis la gauche', right: 'Glissement depuis la droite',
  burst: 'Explosion de cri', shake: 'Secousse', bounce: 'Rebond'
};
export const effectiveBubbleEntry = (bubble: Bubble): BubbleEntry =>
  bubble.bubbleEntry ?? (bubble.textAnimation?.effect === 'shout' ? shoutBubbleEntry : defaultBubbleEntry);
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

/** The frame, tail and text share this seekable transform during a dialogue. */
export function bubbleEntryPose(bubble: Bubble, elapsed: number, completed = false) {
  const entry = effectiveBubbleEntry(bubble);
  const rest = { dx: 0, dy: 0, scale: 1, rotation: 0, burst: 0 };
  if (entry.preset === 'none' || completed) return rest;
  const t = clamp((Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0) / entry.duration);
  if (t >= 1) return rest;
  if (entry.preset === 'pop') {
    const scale = t < 0.7 ? 0.82 + 0.23 * smooth(t / 0.7) : 1.05 - 0.05 * smooth((t - 0.7) / 0.3);
    return { ...rest, scale };
  }
  if (entry.preset === 'left' || entry.preset === 'right')
    return { ...rest, dx: (entry.preset === 'left' ? -36 : 36) * (1 - smooth(t)) };
  if (entry.preset === 'burst') {
    const scale = t < 0.24 ? 0.62 + 0.56 * smooth(t / 0.24)
      : t < 0.55 ? 1.18 - 0.24 * smooth((t - 0.24) / 0.31)
      : 0.94 + 0.06 * smooth((t - 0.55) / 0.45);
    return { ...rest, scale, rotation: t < 0.55 ? 3 * Math.sin(4 * Math.PI * t) * (1 - t / 0.55) : 0,
      burst: t < 0.6 ? Math.sin(Math.PI * t / 0.6) : 0 };
  }
  if (entry.preset === 'shake') {
    const fade = 1 - smooth(t);
    return { ...rest, dx: 14 * Math.sin(12 * Math.PI * t) * fade,
      dy: 6 * Math.sin(16 * Math.PI * t) * fade,
      rotation: 3.5 * Math.sin(10 * Math.PI * t) * fade,
      scale: 1 + 0.06 * Math.sin(6 * Math.PI * t) * fade };
  }
  if (t < 0.6) return { ...rest, dy: -50 * (1 - smooth(t / 0.6)), scale: 0.88 + 0.12 * smooth(t / 0.6) };
  const landing = Math.sin(Math.PI * (t - 0.6) / 0.4);
  return { ...rest, dy: 12 * landing, scale: 1 - 0.06 * landing };
}

export function bubbleEntryDuration(bubble: Bubble): number {
  const entry = effectiveBubbleEntry(bubble);
  return entry.preset === 'none' ? 0 : entry.duration;
}
