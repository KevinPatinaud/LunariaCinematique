import type { ImageSize } from '../shared/backgroundCorrection.js';

export function validatePosePixels(pixels: Uint8Array, size: ImageSize) {
  if (!Number.isInteger(size.width) || !Number.isInteger(size.height) || size.width < 1 || size.height < 1 || size.width * size.height > 64 * 1024 * 1024 || pixels.length !== size.width * size.height * 4)
    throw Error('Image de pose illisible ou trop grande.');
  let transparent = 0, visible = 0;
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) transparent++;
    if (pixels[i] > 8) visible++;
  }
  if (!visible) throw Error('La pose générée est entièrement transparente.');
  if (transparent < size.width * size.height * .01) throw Error('La pose doit avoir un véritable fond transparent. Relance une proposition.');
}
