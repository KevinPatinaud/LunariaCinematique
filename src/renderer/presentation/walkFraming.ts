import type { Asset, AssetRef } from '../../shared/model.js';
import type { WalkFraming } from '../../shared/presentation/cinematicMotion.js';
import type { AnimationDefinition, Region } from '../../shared/presentation/types.js';

interface FramingRequest {
  key: string;
  stillUrl: string;
  frames: { url: string; region: Region }[];
}

const results = new Map<string, WalkFraming | null>();
const pending = new Map<string, Promise<void>>();

export function walkFramingRequest(still: AssetRef, animation: AnimationDefinition, assets: Asset[]): FramingRequest | undefined {
  const stillUrl = assets.find(asset => asset.ref === still)?.url;
  if (!stillUrl) return;
  const frames: FramingRequest['frames'] = [];
  for (const frame of animation.frames) {
    const url = assets.find(asset => asset.ref === frame.asset)?.url;
    if (!url || !frame.region) return;
    frames.push({ url, region: frame.region });
  }
  return { key: JSON.stringify([stillUrl, frames]), stillUrl, frames };
}

export function walkFraming(request: FramingRequest | undefined) {
  return request && results.get(request.key);
}

async function readPixels(url: string): Promise<ImageData> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = url;
  await image.decode();
  const width = image.naturalWidth, height = image.naturalHeight;
  if (width * height > 16 * 1024 * 1024) throw Error('Image exceeds silhouette analysis limits');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw Error('Cannot read silhouette pixels');
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, width, height);
}

function verticalBounds(pixels: ImageData, region: Region = { x: 0, y: 0, width: pixels.width, height: pixels.height }) {
  const left = Math.max(0, Math.floor(region.x)), right = Math.min(pixels.width, Math.ceil(region.x + region.width));
  const top = Math.max(0, Math.floor(region.y)), bottom = Math.min(pixels.height, Math.ceil(region.y + region.height));
  let min = bottom, max = top;
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      if (pixels.data[(y * pixels.width + x) * 4 + 3] === 0) continue;
      min = Math.min(min, y);
      max = y + 1;
      break;
    }
  }
  if (max <= min) throw Error('Empty silhouette');
  return { height: (max - min) / region.height, bottom: (max - region.y) / region.height };
}

const median = (values: number[]) => {
  values.sort((a, b) => a - b);
  const middle = Math.floor(values.length / 2);
  return (values[middle] + values[Math.floor((values.length - 1) / 2)]) / 2;
};

export function loadWalkFraming(request: FramingRequest) {
  if (results.has(request.key) || pending.has(request.key)) return;
  const work = (async () => {
    const still = verticalBounds(await readPixels(request.stillUrl));
    const bounds = [];
    for (const url of new Set(request.frames.map(frame => frame.url))) {
      const pixels = await readPixels(url);
      for (const frame of request.frames.filter(frame => frame.url === url)) bounds.push(verticalBounds(pixels, frame.region));
    }
    const frameHeight = median(bounds.map(bound => bound.height));
    if (frameHeight < 0.1) return null;
    return { staticHeight: still.height, staticBottom: still.bottom,
      frameHeight, frameBottom: median(bounds.map(bound => bound.bottom)) };
  })().catch(() => null).then(framing => {
    pending.delete(request.key);
    if (results.size >= 128) results.delete(results.keys().next().value!);
    results.set(request.key, framing);
    window.dispatchEvent(new Event('lunaria-image-size'));
  });
  pending.set(request.key, work);
}
