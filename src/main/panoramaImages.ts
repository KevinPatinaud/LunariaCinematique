import { nativeImage } from 'electron';
import type { CoreRect, ImageSize, PanoramaResolution } from '../shared/backgroundCorrection.js';

function decode(bytes: Buffer) {
  const image = nativeImage.createFromBuffer(bytes), size = image.getSize();
  if (image.isEmpty() || size.width * size.height > 64 * 1024 * 1024) throw new Error('Image illisible ou trop grande.');
  return image;
}
function fit(bytes: Buffer, size: ImageSize) {
  const image = decode(bytes), original = image.getSize();
  const scale = Math.max(size.width / original.width, size.height / original.height);
  const resized = image.resize({ width: Math.max(size.width, Math.round(original.width * scale)), height: Math.max(size.height, Math.round(original.height * scale)), quality: 'best' });
  const actual = resized.getSize();
  return resized.crop({ x: Math.floor((actual.width - size.width) / 2), y: Math.floor((actual.height - size.height) / 2), ...size });
}
export function cropPanoramaCore(bytes: Buffer, rect: CoreRect): Buffer { return decode(bytes).crop(rect).toPNG(); }
export function panoramaCanvas(core: Buffer): Buffer {
  const image = decode(core), { width: coreWidth, height } = image.getSize();
  // Keep all source detail in the image sent to Codex, including when the
  // author requests a smaller final export. Only add empty side bands here.
  const width = Math.max(coreWidth, Math.round(height * 20 / 9)), left = Math.floor((width - coreWidth) / 2);
  if (width * height > 64 * 1024 * 1024) throw new Error('Le canevas du panorama est trop grand.');
  const source = image.toBitmap();
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) source.copy(pixels, (y * width + left) * 4, y * coreWidth * 4, (y + 1) * coreWidth * 4);
  return nativeImage.createFromBitmap(pixels, { width, height }).toPNG();
}
export function finalizePanorama(generated: Buffer, resolution: PanoramaResolution): Buffer {
  const image = decode(generated), size = image.getSize();
  if (Math.abs(size.width / size.height / (20 / 9) - 1) > .01) throw new Error('Codex n’a pas respecté les proportions 20:9. Relance une proposition.');
  const pixels = image.toBitmap();
  for (let p = 3; p < pixels.length; p += 4) if (pixels[p] !== 255) throw new Error('Codex a laissé une zone transparente. Relance la génération des côtés.');
  // Use the entire generated scene. Pasting the source centre back over it
  // would undo coherent edits and introduce new seams at the side bands.
  if (resolution === 'native') {
    const isPng = generated.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    return isPng ? generated : image.toPNG();
  }
  return fit(generated, { width: resolution, height: resolution * 9 / 20 }).toPNG();
}
