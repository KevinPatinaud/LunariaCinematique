import type { AssetRef } from '../model.js';
import type { ActorAnimation, AnimationDefinition } from './types.js';

export const ELEMENT_PRESETS = ['rotate', 'float', 'fall', 'exhale'] as const;
export type ElementPreset = typeof ELEMENT_PRESETS[number];
export const ELEMENT_LABELS: Record<ElementPreset, string> = {
  rotate: 'Rotation', float: 'Flottement', fall: 'Chute', exhale: 'Fumée soufflée',
};

export interface AnimatedElement {
  preset: ElementPreset;
  pivot: { x: number; y: number };
  travel: number;
  drift?: number;
  sway?: number;
  placementHeight?: number;
}

export type ElementClip = AnimationDefinition & { element: AnimatedElement };

export function isElementClip(clip: AnimationDefinition | undefined): clip is ElementClip {
  return !!clip?.element;
}

export interface ElementPlayback {
  start: number;
  loop: boolean;
}

interface ElementLayer {
  asset: AssetRef;
  x: number;
  y: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

/** Offsets are expressed in element heights, so an instance can be rescaled freely. */
export function sampleElement(
  clip: ElementClip,
  elapsed: number,
  binding?: Pick<ActorAnimation, 'speed' | 'elementPlayback'>,
  still = false,
): ElementLayer[] {
  const [primary, secondary] = clip.frames;
  if (!primary) return [];
  const rest = { asset: primary.asset, x: 0, y: 0, angle: 0, scaleX: 1, scaleY: 1, opacity: 1 };
  const time = (elapsed - (binding?.elementPlayback?.start ?? 0)) * (binding?.speed ?? 1);
  if (time < 0) return [];
  const loop = binding?.elementPlayback?.loop ?? clip.loop;
  const { preset, travel, drift = 0, sway = 0 } = clip.element;
  const cycles = time / clip.duration;
  if (!loop && cycles >= 1) return preset === 'rotate' ? [rest] : [];
  if (still) return [rest];
  const t = cycles % 1;

  if (preset === 'rotate') return [{ ...rest, angle: 360 * t }];
  if (preset === 'exhale') {
    const breath = (asset: AssetRef, phase: number, reach: number): ElementLayer => {
      const released = Math.max(0, (phase - 0.12) / 0.88);
      const forward = 1 - (1 - released) ** 3;
      const spread = 1 - (1 - phase) ** 2;
      return {
        asset, x: reach * forward, y: -reach * 0.28 * released ** 1.5, angle: -18 * released,
        scaleX: 0.12 + 1.16 * spread, scaleY: 0.065 + 0.95 * spread,
        opacity: 0.82 * Math.min(1, phase / 0.06) * (1 - phase ** 2) ** 1.45,
      };
    };
    const layers = [breath(primary.asset, t, travel)];
    if (secondary && t >= 0.17) {
      layers.push(breath(secondary.asset, (t - 0.17) / 0.83, travel * 0.63));
    }
    return layers;
  }
  if (preset === 'float') {
    const plume = (asset: AssetRef, phase: number): ElementLayer => ({
      ...rest, asset, x: drift * phase, y: -travel * phase, angle: sway * Math.sin(Math.PI * 2 * phase),
      scaleX: 0.75 + phase * 0.75,
      scaleY: 0.75 + phase * 0.75, opacity: Math.max(0, Math.sin(Math.PI * phase)),
    });
    const layers = [plume(primary.asset, t)];
    if (secondary && cycles >= 0.5) layers.push(plume(secondary.asset, loop ? (cycles - 0.5) % 1 : (t - 0.5) * 2));
    return layers;
  }

  const impact = 0.72;
  if (t < impact) return [{ ...rest, y: travel * (t / impact) ** 2 }];
  const flash = (t - impact) / (1 - impact);
  return [{ ...rest, asset: secondary?.asset ?? primary.asset, y: travel,
    scaleX: (secondary ? 1 : 0.65) + flash * 0.7,
    scaleY: secondary ? 1 + flash * 0.15 : 0.25, opacity: 1 - flash }];
}
