import { STAGE, type Actor, type Box } from './model.js';
import { actorAnchor, actorVisualBox } from './motion.js';
import { clamp } from './geometry.js';
export const MIN_DIMENSION = 0.03, MAX_DIMENSION = 2;
/** Preserve aspect ratio in both normalized axes; never clamp only one dimension. */
export function proportionalSize(width: number, height: number, scale: number) {
  if (![width, height, scale].every(Number.isFinite) || width <= 0 || height <= 0) throw new Error('Dimensions de l’image invalides.');
  const lower = Math.max(MIN_DIMENSION / width, MIN_DIMENSION / height);
  const upper = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
  if (lower > upper) throw new Error('Image trop allongée pour un objet statique. Utilise une image individuelle plutôt qu’une planche de sprites.');
  const factor = clamp(scale, lower, upper);
  return { width: clamp(width * factor, MIN_DIMENSION, MAX_DIMENSION), height: clamp(height * factor, MIN_DIMENSION, MAX_DIMENSION) };
}
export function resizeBox(box: Box, kind: 'actor' | 'bubble', corner: string, dx: number, dy: number): Box {
  const west = corner.includes('w'), north = corner.includes('n');
  let width: number, height: number;
  if (kind === 'actor') {
    // Project the pointer onto the diagonal in logical pixels: vertical gestures also resize.
    const w = box.width * STAGE.width, h = box.height * STAGE.height;
    const scale = 1 + ((west ? -dx : dx) * STAGE.width * w + (north ? -dy : dy) * STAGE.height * h) / (w*w + h*h);
    ({width, height} = proportionalSize(box.width, box.height, scale));
  } else {
    width = clamp(box.width + (west ? -dx : dx), 0.16, MAX_DIMENSION);
    height = clamp(box.height + (north ? -dy : dy), 0.07, MAX_DIMENSION);
  }
  return { width, height, x: clamp(west ? box.x + box.width - width : box.x, -1, 2),
    y: clamp(north ? box.y + box.height - height : box.y, -1, 2) };
}
export function centeredObject(box: Box): Pick<Actor, 'x' | 'y'> {
  if ('asset' in box && 'entry' in box) {
    const visual = actorVisualBox(box as Actor);
    return {x: clamp(box.x + (1 - visual.width)/2 - visual.x,-1,2), y: clamp(box.y + (1 - visual.height)/2 - visual.y,-1,2)};
  }
  return { x: (1 - box.width) / 2, y: (1 - box.height) / 2 };
}
export function parseNumericInput(text: string, min: number, max: number): number | null {
  const normalized = text.trim().replace(',', '.');
  if (!normalized || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? clamp(value, min, max) : null;
}

/** Resize in local axes, keeping the opposite visual corner fixed for any pivot. */
export function resizeActor(actor: Actor, corner: string, dx: number, dy: number): Box {
  const angle = (actor.rotation ?? 0) * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  const localX = (dx * STAGE.width * c + dy * STAGE.height * s) / STAGE.width;
  const localY = (-dx * STAGE.width * s + dy * STAGE.height * c) / STAGE.height;
  const box = resizeBox(actor, 'actor', corner, localX, localY);
  // The selection rectangle itself is not flipped, only the rendered texture is.
  const u = corner.includes('w') ? 1 : 0, v = corner.includes('n') ? 1 : 0;
  const before = actorAnchor({...actor, flipX:false}, 0, false, u, v);
  const after = actorAnchor({...actor, ...box, flipX:false}, 0, false, u, v);
  return {...box, x: clamp(box.x + (before.x-after.x)/STAGE.width,-1,2), y: clamp(box.y + (before.y-after.y)/STAGE.height,-1,2)};
}
