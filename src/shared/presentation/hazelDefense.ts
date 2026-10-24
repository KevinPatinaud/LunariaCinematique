import type { AnimationDefinition } from './types.js';

/** A damage reaction only: self regeneration keeps the idle or walking pose. */
export const HAZEL_DEFENSE: AnimationDefinition = {
  id: 'hazel_defense',
  ownerSpeciesId: 'hazel',
  name: 'Noisetier — garde au bouclier et absorption du choc',
  kind: 'combined',
  frames: [
    { asset: 'library://02_characters/noisetier/stage_01/animations/hazel_defense_sheet_v01.png', region: { x: 0, y: 0, width: 627, height: 612 }, anchor: { x: 0.47, y: 0.995 }, duration: 0.07 },
    { asset: 'library://02_characters/noisetier/stage_01/animations/hazel_defense_sheet_v01.png', region: { x: 627, y: 0, width: 627, height: 612 }, anchor: { x: 0.47, y: 0.995 }, duration: 0.12 },
    { asset: 'library://02_characters/noisetier/stage_01/animations/hazel_defense_sheet_v01.png', region: { x: 0, y: 612, width: 627, height: 612 }, anchor: { x: 0.47, y: 0.995 }, duration: 0.18 },
    { asset: 'library://02_characters/noisetier/stage_01/animations/hazel_defense_sheet_v01.png', region: { x: 627, y: 612, width: 627, height: 612 }, anchor: { x: 0.47, y: 0.995 }, duration: 0.15 },
  ],
  duration: 0.52,
  loop: false,
  anchor: { x: 0.47, y: 0.995 },
  transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 },
  motion: { preset: 'recoil', amplitude: 0.25, period: 0.52 },
  attachments: [
    { id: 'feet', x: 0.47, y: 0.995 },
    { id: 'center', x: 0.5, y: 0.55 },
    { id: 'head', x: 0.5, y: 0.25 },
    { id: 'launch', x: 0.78, y: 0.6 },
  ],
  markers: [],
};
