/**
 * High-precision bitmap post-processing for generated character spritesheets:
 * 1) Preserves native alpha if already transparent.
 * 2) Detects solid magenta (#FF00FF) and keys out
 *    BOTH exterior AND enclosed interior holes (between legs, under arms, between leaves) with
 *    smooth alpha feathering and chroma despill (zero halos, zero trapped background triangles).
 * 3) Falls back cleanly on white/neutral solid backgrounds (exterior BFS + lower-body enclosed hole cleanup).
 * 4) Slices the grid, normalizes frame scale against the median body size, and aligns every frame
 *    by its TORSO centroid X (eliminating horizontal head jitter from swinging arms/leaves) and
 *    a stable foot ground line.
 *
 * Byte order note: Electron `nativeImage.toBitmap()` outputs BGRA on Windows/macOS/Linux,
 * while generic RGBA buffers use RGBA. Notice that magenta (#FF00FF) has R=255, G=0, B=255 —
 * so channels 0 and 2 are IDENTICAL (both 255) and channel 1 is ALWAYS Green (0) in BOTH BGRA and RGBA!
 * That makes magenta chroma detection and despill 100% channel-order independent!
 */

export interface StabilizedSheet {
  pixels: Buffer;
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  frameCount: number;
  recommendedStridePx: number;
}

export class MissingNativeAlphaError extends Error {
  constructor() {
    super('La planche ne possède pas de fond transparent natif.');
  }
}

interface FrameMetrics {
  left: number;
  top: number;
  width: number;
  height: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  contentW: number;
  contentH: number;
  torsoCenterX: number;
  footY: number;
  count: number;
}

function colorDist(
  pixels: Uint8Array,
  offset: number,
  bg0: number,
  bg1: number,
  bg2: number,
): number {
  const d0 = pixels[offset] - bg0;
  const d1 = pixels[offset + 1] - bg1;
  const d2 = pixels[offset + 2] - bg2;
  return Math.sqrt(d0 * d0 + d1 * d1 + d2 * d2);
}

/** Magenta score works identically in both RGBA and BGRA because channel 1 is always G and 0/2 are R/B. */
function isMagentaColor(c0: number, c1: number, c2: number): boolean {
  const rbMin = Math.min(c0, c2);
  const rbDiff = Math.abs(c0 - c2);
  return rbMin >= 150 && c1 <= 115 && (rbMin - c1) >= 75 && rbDiff <= 70;
}

function magentaExcess(c0: number, c1: number, c2: number): number {
  return Math.min(c0, c2) - c1;
}

function detectBorderColor(
  pixels: Uint8Array,
  width: number,
  height: number,
  alphaThreshold: number,
): { alreadyTransparent: boolean; bg0: number; bg1: number; bg2: number; isMagenta: boolean } {
  const borderSamples: number[] = [];
  let transparentBorder = 0;
  let totalBorder = 0;
  const samplePoint = (x: number, y: number) => {
    const idx = (y * width + x) * 4;
    totalBorder++;
    if (pixels[idx + 3] < alphaThreshold) transparentBorder++;
    else borderSamples.push(idx);
  };
  const stepX = Math.max(1, Math.floor(width / 160));
  const stepY = Math.max(1, Math.floor(height / 160));
  for (let x = 0; x < width; x += stepX) {
    samplePoint(x, 0);
    if (height > 1) samplePoint(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += stepY) {
    samplePoint(0, y);
    if (width > 1) samplePoint(width - 1, y);
  }

  if (totalBorder > 0 && transparentBorder / totalBorder >= 0.35) {
    return { alreadyTransparent: true, bg0: 0, bg1: 0, bg2: 0, isMagenta: false };
  }
  if (!borderSamples.length) {
    return { alreadyTransparent: false, bg0: 255, bg1: 255, bg2: 255, isMagenta: false };
  }

  const buckets = new Map<number, { count: number; s0: number; s1: number; s2: number }>();
  for (const idx of borderSamples) {
    const c0 = pixels[idx], c1 = pixels[idx + 1], c2 = pixels[idx + 2];
    const key = ((c0 >> 4) << 8) | ((c1 >> 4) << 4) | (c2 >> 4);
    const bucket = buckets.get(key) ?? { count: 0, s0: 0, s1: 0, s2: 0 };
    bucket.count++;
    bucket.s0 += c0;
    bucket.s1 += c1;
    bucket.s2 += c2;
    buckets.set(key, bucket);
  }
  let best = { count: 0, s0: 0, s1: 0, s2: 0 };
  for (const bucket of buckets.values()) {
    if (bucket.count > best.count) best = bucket;
  }
  const bg0 = Math.round(best.s0 / best.count);
  const bg1 = Math.round(best.s1 / best.count);
  const bg2 = Math.round(best.s2 / best.count);
  return {
    alreadyTransparent: false,
    bg0,
    bg1,
    bg2,
    isMagenta: isMagentaColor(bg0, bg1, bg2),
  };
}

/**
 * Remove solid exterior (and enclosed interior) background pixels cleanly.
 * - Native transparent PNGs are returned untouched.
 * - Pure magenta chroma-key (#FF00FF) removes ALL exterior + interior enclosed holes + despills edge halos.
 * - Solid white/neutral fallback removes exterior via BFS + soft edge feathering, preserving interior eyes.
 */
export function ensureTransparentBackground(
  source: Uint8Array,
  width: number,
  height: number,
  requireNativeAlpha = false,
): Buffer {
  if (width < 1 || height < 1 || source.length !== width * height * 4) {
    throw new Error('Bitmap de spritesheet invalide.');
  }
  const pixels = Buffer.from(source);
  const border = detectBorderColor(pixels, width, height, requireNativeAlpha ? 1 : 16);
  if (border.alreadyTransparent) return pixels;
  if (requireNativeAlpha) throw new MissingNativeAlphaError();

  const { bg0, bg1, bg2, isMagenta } = border;
  const total = width * height;

  if (isMagenta) {
    // 1) Exterior BFS from image borders with generous chroma tolerance (catches JPEG ringing & edge blend).
    const visited = new Uint8Array(total);
    const removed = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const isExteriorMagenta = (idx: number): boolean => {
      const c0 = pixels[idx], c1 = pixels[idx + 1], c2 = pixels[idx + 2], a = pixels[idx + 3];
      if (a < 16) return true;
      const dist = colorDist(pixels, idx, bg0, bg1, bg2);
      const excess = magentaExcess(c0, c1, c2);
      const rbDiff = Math.abs(c0 - c2);
      return dist <= 95 || (excess >= 85 && rbDiff <= 65 && c1 <= 135);
    };

    const enqueue = (p: number) => {
      if (visited[p]) return;
      visited[p] = 1;
      removed[p] = 1;
      queue[tail++] = p;
    };

    for (let x = 0; x < width; x++) {
      if (isExteriorMagenta(x * 4)) enqueue(x);
      const bottom = (height - 1) * width + x;
      if (isExteriorMagenta(bottom * 4)) enqueue(bottom);
    }
    for (let y = 1; y < height - 1; y++) {
      const left = y * width;
      if (isExteriorMagenta(left * 4)) enqueue(left);
      const right = y * width + (width - 1);
      if (isExteriorMagenta(right * 4)) enqueue(right);
    }

    // 2) Strict pure-neon-magenta seeds inside enclosed pockets (between legs, under arms, between leaves).
    // Includes a second narrow-pocket clause for JPEG-darkened #FF00FF slivers (very low G, high symmetric R/B)
    // while keeping purple/lavender petals (higher G, asymmetric B >> R) completely safe.
    for (let p = 0; p < total; p++) {
      if (visited[p]) continue;
      const idx = p * 4;
      const c0 = pixels[idx], c1 = pixels[idx + 1], c2 = pixels[idx + 2], a = pixels[idx + 3];
      if (a < 16) {
        enqueue(p);
        continue;
      }
      const dist = colorDist(pixels, idx, bg0, bg1, bg2);
      const rbMin = Math.min(c0, c2);
      const rbDiff = Math.abs(c0 - c2);
      const excess = rbMin - c1;
      const brightNeonPocket = dist <= 62 && c1 <= 80 && rbMin >= 180 && rbDiff <= 48;
      const narrowDarkenedPocket = c1 <= 50 && excess >= 95 && rbDiff <= 38;
      if (brightNeonPocket || narrowDarkenedPocket) {
        enqueue(p);
      }
    }

    // Expand both exterior and enclosed interior magenta pockets through their anti-aliased transition pixels.
    while (head < tail) {
      const p = queue[head++];
      const x = p % width;
      const y = (p - x) / width;
      const neighbors = [
        x > 0 ? p - 1 : -1,
        x + 1 < width ? p + 1 : -1,
        y > 0 ? p - width : -1,
        y + 1 < height ? p + width : -1,
      ];
      for (const next of neighbors) {
        if (next < 0 || visited[next]) continue;
        if (isExteriorMagenta(next * 4)) {
          enqueue(next);
        } else {
          visited[next] = 1;
        }
      }
    }

    for (let p = 0; p < total; p++) {
      if (removed[p]) {
        const idx = p * 4;
        pixels[idx] = pixels[idx + 1] = pixels[idx + 2] = pixels[idx + 3] = 0;
      }
    }

    // 3) 3-ring boundary distance map from removed magenta pixels (captures 2×2 JPEG chroma bleed + AA rim).
    const ring = new Uint8Array(total); // 0 = interior, 1..3 = pixel distance from removed background
    let frontier: number[] = [];
    for (let p = 0; p < total; p++) {
      if (removed[p]) continue;
      const x = p % width;
      const y = (p - x) / width;
      if (
        (x > 0 && removed[p - 1]) ||
        (x + 1 < width && removed[p + 1]) ||
        (y > 0 && removed[p - width]) ||
        (y + 1 < height && removed[p + width])
      ) {
        ring[p] = 1;
        frontier.push(p);
      }
    }
    for (let distRing = 2; distRing <= 3 && frontier.length > 0; distRing++) {
      const nextFrontier: number[] = [];
      for (const p of frontier) {
        const x = p % width;
        const y = (p - x) / width;
        const neighbors = [
          x > 0 ? p - 1 : -1,
          x + 1 < width ? p + 1 : -1,
          y > 0 ? p - width : -1,
          y + 1 < height ? p + width : -1,
        ];
        for (const next of neighbors) {
          if (next >= 0 && !removed[next] && ring[next] === 0) {
            ring[next] = distRing;
            nextFrontier.push(next);
          }
        }
      }
      frontier = nextFrontier;
    }

    // 4) Additive magenta un-spill & ring-1 soft alpha feathering.
    // Subtracting `s = (min(c0, c2) - c1) * weight` from BOTH c0 and c2 mathematically removes
    // #FF00FF bleed while preserving true underlying hues (red stays red, dark brown stays dark brown).
    for (let p = 0; p < total; p++) {
      const rDist = ring[p];
      if (rDist === 0) continue;
      const idx = p * 4;
      const c0 = pixels[idx], c1 = pixels[idx + 1], c2 = pixels[idx + 2];
      const excess = magentaExcess(c0, c1, c2);
      if (excess <= 10) continue;
      const dist = colorDist(pixels, idx, bg0, bg1, bg2);
      const rbDiff = Math.abs(c0 - c2);

      // Softly feather outermost AA pixels that are heavily mixed with #FF00FF.
      if (rDist === 1 && ((dist < 175 && excess > 35 && rbDiff < 75) || (excess >= 52 && c1 <= 45 && rbDiff <= 45))) {
        const alphaScale = Math.max(0, Math.min(1, Math.min((dist - 95) / 85, (92 - excess) / 44)));
        pixels[idx + 3] = Math.round(pixels[idx + 3] * alphaScale);
        if (pixels[idx + 3] < 24) {
          pixels[idx] = pixels[idx + 1] = pixels[idx + 2] = pixels[idx + 3] = 0;
          continue;
        }
      }

      // Un-spill JPEG chroma bleed across rings 1..3 (strongest at outer boundary, gentler inward).
      // When R and B are close (dark/neutral/green outline), subtract equally from both c0 & c2;
      // when one channel dominates (e.g. bright red cheek touching #FF00FF), subtract fully from the
      // contaminated minor channel and lightly from the dominant channel so vibrant reds stay red!
      const spillWeight = rDist === 1 ? 1.0 : rDist === 2 ? 0.92 : 0.68;
      const subFull = Math.round(excess * spillWeight);
      if (rbDiff <= 45) {
        pixels[idx] = Math.max(0, c0 - subFull);
        pixels[idx + 2] = Math.max(0, c2 - subFull);
      } else {
        const subMajor = Math.round(subFull * 0.25);
        if (c0 < c2) {
          pixels[idx] = Math.max(0, c0 - subFull);
          pixels[idx + 2] = Math.max(0, c2 - subMajor);
        } else {
          pixels[idx] = Math.max(0, c0 - subMajor);
          pixels[idx + 2] = Math.max(0, c2 - subFull);
        }
      }
    }
    return pixels;
  }

  // Fallback for non-magenta solid backgrounds (white/grey): edge-connected BFS.
  const hardThreshold = 36;
  const softThreshold = 74;
  const visited = new Uint8Array(total);
  const removed = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const trySeed = (x: number, y: number) => {
    const p = y * width + x;
    if (visited[p]) return;
    const idx = p * 4;
    if (pixels[idx + 3] < 16 || colorDist(pixels, idx, bg0, bg1, bg2) <= hardThreshold) {
      visited[p] = 1;
      removed[p] = 1;
      queue[tail++] = p;
    }
  };
  for (let x = 0; x < width; x++) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = (p - x) / width;
    const neighbors = [
      x > 0 ? p - 1 : -1,
      x + 1 < width ? p + 1 : -1,
      y > 0 ? p - width : -1,
      y + 1 < height ? p + width : -1,
    ];
    for (const next of neighbors) {
      if (next < 0 || visited[next]) continue;
      visited[next] = 1;
      const idx = next * 4;
      if (pixels[idx + 3] < 16 || colorDist(pixels, idx, bg0, bg1, bg2) <= hardThreshold) {
        removed[next] = 1;
        queue[tail++] = next;
      }
    }
  }

  for (let p = 0; p < total; p++) {
    const idx = p * 4;
    if (removed[p]) {
      pixels[idx] = pixels[idx + 1] = pixels[idx + 2] = pixels[idx + 3] = 0;
      continue;
    }
    const x = p % width;
    const y = (p - x) / width;
    const touchesRemoved =
      (x > 0 && removed[p - 1]) ||
      (x + 1 < width && removed[p + 1]) ||
      (y > 0 && removed[p - width]) ||
      (y + 1 < height && removed[p + width]);
    if (touchesRemoved) {
      const dist = colorDist(pixels, idx, bg0, bg1, bg2);
      if (dist < softThreshold) {
        const factor = Math.max(0, Math.min(1, (dist - hardThreshold) / (softThreshold - hardThreshold)));
        pixels[idx + 3] = Math.round(pixels[idx + 3] * factor);
      }
    }
  }

  return pixels;
}

/**
 * Remove tiny isolated noise specks (<0.08% of cell area) and compute torso-anchored metrics.
 * Using the horizontal centroid of the core vertical torso band (28%..68% of sprite height)
 * keeps the character's head & body rock-steady instead of vibrating when arms/feet swing!
 */
function measureCell(
  pixels: Uint8Array,
  width: number,
  left: number,
  top: number,
  cellW: number,
  cellH: number,
): FrameMetrics | null {
  let minX = cellW, minY = cellH, maxX = -1, maxY = -1, count = 0;
  for (let y = 0; y < cellH; y++) {
    const rowStart = ((top + y) * width + left) * 4;
    for (let x = 0; x < cellW; x++) {
      if (pixels[rowStart + x * 4 + 3] > 28) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        count++;
      }
    }
  }
  if (count < 12 || maxX < minX || maxY < minY) return null;

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;

  // Horizontal centroid of the torso/head core band (28% to 68% from sprite top).
  const bandTop = minY + Math.floor(contentH * 0.28);
  const bandBottom = minY + Math.ceil(contentH * 0.68);
  let sumX = 0;
  let bandCount = 0;
  for (let y = bandTop; y <= Math.min(maxY, bandBottom); y++) {
    const rowStart = ((top + y) * width + left) * 4;
    for (let x = minX; x <= maxX; x++) {
      if (pixels[rowStart + x * 4 + 3] > 64) {
        sumX += x;
        bandCount++;
      }
    }
  }
  const torsoCenterX = bandCount > 0 ? sumX / bandCount : (minX + maxX) * 0.5;

  // Foot baseline: lowest row with solid visible pixels (ignoring 1px stray dust).
  let footY = maxY;
  for (let y = maxY; y >= minY; y--) {
    const rowStart = ((top + y) * width + left) * 4;
    let rowPixels = 0;
    for (let x = minX; x <= maxX; x++) {
      if (pixels[rowStart + x * 4 + 3] > 48) rowPixels++;
    }
    if (rowPixels >= 2) {
      footY = y;
      break;
    }
  }

  return {
    left,
    top,
    width: cellW,
    height: cellH,
    minX,
    minY,
    maxX,
    maxY,
    contentW,
    contentH,
    torsoCenterX,
    footY,
    count,
  };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Bilinear-resampled blit with optional uniform scale factor around torso anchor & foot baseline. */
function blitScaledFrame(
  src: Uint8Array,
  srcW: number,
  frame: FrameMetrics,
  scale: number,
  dst: Buffer,
  dstW: number,
  dstCellLeft: number,
  dstCellTop: number,
  dstCellW: number,
  dstCellH: number,
  targetAnchorX: number,
  targetFootY: number,
): void {
  const outMinX = Math.max(0, Math.floor(targetAnchorX + (frame.minX - frame.torsoCenterX) * scale));
  const outMaxX = Math.min(dstCellW - 1, Math.ceil(targetAnchorX + (frame.maxX - frame.torsoCenterX) * scale));
  const outMinY = Math.max(0, Math.floor(targetFootY + (frame.minY - frame.footY) * scale));
  const outMaxY = Math.min(dstCellH - 1, Math.ceil(targetFootY + (frame.maxY - frame.footY) * scale));

  for (let dy = outMinY; dy <= outMaxY; dy++) {
    const syLocal = frame.footY + (dy - targetFootY) / scale;
    const sy0 = Math.floor(syLocal);
    const sy1 = sy0 + 1;
    const fy = syLocal - sy0;
    if (sy1 < frame.minY || sy0 > frame.maxY) continue;
    const cy0 = Math.max(frame.minY, Math.min(frame.maxY, sy0));
    const cy1 = Math.max(frame.minY, Math.min(frame.maxY, sy1));

    for (let dx = outMinX; dx <= outMaxX; dx++) {
      const sxLocal = frame.torsoCenterX + (dx - targetAnchorX) / scale;
      const sx0 = Math.floor(sxLocal);
      const sx1 = sx0 + 1;
      const fx = sxLocal - sx0;
      if (sx1 < frame.minX || sx0 > frame.maxX) continue;
      const cx0 = Math.max(frame.minX, Math.min(frame.maxX, sx0));
      const cx1 = Math.max(frame.minX, Math.min(frame.maxX, sx1));

      const i00 = ((frame.top + cy0) * srcW + (frame.left + cx0)) * 4;
      const i10 = ((frame.top + cy0) * srcW + (frame.left + cx1)) * 4;
      const i01 = ((frame.top + cy1) * srcW + (frame.left + cx0)) * 4;
      const i11 = ((frame.top + cy1) * srcW + (frame.left + cx1)) * 4;

      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;

      const a00 = src[i00 + 3], a10 = src[i10 + 3], a01 = src[i01 + 3], a11 = src[i11 + 3];
      const alpha = w00 * a00 + w10 * a10 + w01 * a01 + w11 * a11;
      if (alpha < 1) continue;

      // Premultiplied interpolation avoids dark/bright halos on transparent edges.
      const dstIdx = ((dstCellTop + dy) * dstW + (dstCellLeft + dx)) * 4;
      const denom = Math.max(1e-3, alpha);
      dst[dstIdx] = Math.min(255, Math.round((w00 * src[i00] * a00 + w10 * src[i10] * a10 + w01 * src[i01] * a01 + w11 * src[i11] * a11) / denom));
      dst[dstIdx + 1] = Math.min(255, Math.round((w00 * src[i00 + 1] * a00 + w10 * src[i10 + 1] * a10 + w01 * src[i01 + 1] * a01 + w11 * src[i11 + 1] * a11) / denom));
      dst[dstIdx + 2] = Math.min(255, Math.round((w00 * src[i00 + 2] * a00 + w10 * src[i10 + 2] * a10 + w01 * src[i01 + 2] * a01 + w11 * src[i11 + 2] * a11) / denom));
      dst[dstIdx + 3] = Math.min(255, Math.round(alpha));
    }
  }
}

/** Find optimal cut coordinates near nominal grid divisions by picking the emptiest transparent gutter. */
function findCutLines(
  pixels: Uint8Array,
  width: number,
  height: number,
  divisions: number,
  axis: 'x' | 'y',
): number[] {
  const length = axis === 'x' ? width : height;
  const cross = axis === 'x' ? height : width;
  const cuts = [0];
  if (divisions <= 1) {
    cuts.push(length);
    return cuts;
  }
  const counts = new Uint32Array(length);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      if (pixels[rowOffset + x * 4 + 3] > 28) {
        counts[axis === 'x' ? x : y]++;
      }
    }
  }
  const searchRadius = Math.max(2, Math.round((length / divisions) * 0.12));
  for (let i = 1; i < divisions; i++) {
    const nominal = Math.round((i * length) / divisions);
    const minPos = Math.max(cuts[i - 1] + 8, nominal - searchRadius);
    const maxPos = Math.min(length - 8 * (divisions - i), nominal + searchRadius);
    let bestPos = nominal;
    let bestScore = Infinity;
    for (let pos = minPos; pos <= maxPos; pos++) {
      // Score prefers zero-pixel gutters closest to the nominal grid line (tie-broken by centered gutter).
      const density = counts[pos] / Math.max(1, cross);
      const drift = Math.abs(pos - nominal) / Math.max(1, searchRadius);
      const score = density * 100 + drift * 0.05;
      if (density <= 0.02 && score < bestScore) {
        bestScore = score;
        bestPos = pos;
      }
    }
    if (bestScore === Infinity) {
      throw new Error('Impossible de séparer les poses : le fond doit être transparent ou magenta uni (#FF00FF) et laisser une marge entre les cases.');
    }
    cuts.push(bestPos);
  }
  cuts.push(length);
  return cuts;
}

/**
 * Slice a columns×rows spritesheet, key out solid/magenta background cleanly,
 * find exact transparent gutters, normalize scale drift across frames, and anchor
 * every frame by its torso center X and shared ground baseline Y.
 */
export function stabilizeSpritesheet(
  source: Uint8Array,
  width: number,
  height: number,
  columns: number,
  rows: number,
  requireNativeAlpha = false,
): StabilizedSheet {
  if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns < 1 || rows < 1 || columns * rows > 64) {
    throw new Error('Grille de spritesheet invalide.');
  }
  if (width < columns * 8 || height < rows * 8) {
    throw new Error('Planche d’animation trop petite pour la grille demandée.');
  }
  const cleaned = ensureTransparentBackground(source, width, height, requireNativeAlpha);
  const colCuts = findCutLines(cleaned, width, height, columns, 'x');
  const rowCuts = findCutLines(cleaned, width, height, rows, 'y');

  const cells: FrameMetrics[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const left = colCuts[col];
      const top = rowCuts[row];
      const cw = colCuts[col + 1] - left;
      const ch = rowCuts[row + 1] - top;
      const metrics = measureCell(cleaned, width, left, top, cw, ch);
      if (!metrics) {
        throw new Error(`La case ${row * columns + col + 1} de la planche générée est vide. Relance une proposition.`);
      }
      cells.push(metrics);
    }
  }

  // Normalize accidental per-frame scale drift (e.g. one frame drawn 12% bigger than the others).
  const medianH = median(cells.map(c => c.contentH));
  const scales = cells.map(c => {
    const ratio = medianH / Math.max(1, c.contentH);
    // Keep subtle natural squash/stretch (±4%), only correct noticeable size drift (clamped 0.82..1.22).
    if (Math.abs(ratio - 1) <= 0.04) return 1;
    return Math.max(0.82, Math.min(1.22, ratio));
  });

  // Compute unified cell dimensions around the torso-centered anchor and shared foot baseline.
  let maxLeftExtent = 1;
  let maxRightExtent = 1;
  let maxUpExtent = 1;
  let maxDownExtent = 0;
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i], s = scales[i];
    maxLeftExtent = Math.max(maxLeftExtent, Math.ceil((c.torsoCenterX - c.minX) * s));
    maxRightExtent = Math.max(maxRightExtent, Math.ceil((c.maxX - c.torsoCenterX + 1) * s));
    maxUpExtent = Math.max(maxUpExtent, Math.ceil((c.footY - c.minY + 1) * s));
    maxDownExtent = Math.max(maxDownExtent, Math.ceil(Math.max(0, c.maxY - c.footY) * s));
  }

  const halfW = Math.max(maxLeftExtent, maxRightExtent);
  const padX = Math.max(4, Math.round(halfW * 0.1));
  const padTop = Math.max(4, Math.round(maxUpExtent * 0.08));
  const padBottom = Math.max(2, Math.round(maxUpExtent * 0.03));

  const cellWidth = Math.max(16, (halfW + padX) * 2);
  const cellHeight = Math.max(16, maxUpExtent + maxDownExtent + padTop + padBottom);
  const outWidth = cellWidth * columns;
  const outHeight = cellHeight * rows;
  if (outWidth * outHeight > 64 * 1024 * 1024) {
    throw new Error('La planche d’animation stabilisée dépasse la taille maximale autorisée.');
  }

  const out = Buffer.alloc(outWidth * outHeight * 4);
  const targetAnchorX = cellWidth / 2;
  const targetFootY = cellHeight - padBottom - maxDownExtent;

  for (let index = 0; index < cells.length; index++) {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const cell = cells[index];
    const scale = scales[index];

    if (scale === 1) {
      const destLeft = col * cellWidth + Math.round(targetAnchorX - cell.torsoCenterX);
      const destTop = row * cellHeight + Math.round(targetFootY - cell.footY);
      for (let y = cell.minY; y <= cell.maxY; y++) {
        const dy = destTop + y;
        if (dy < row * cellHeight || dy >= (row + 1) * cellHeight) continue;
        for (let x = cell.minX; x <= cell.maxX; x++) {
          const dx = destLeft + x;
          if (dx < col * cellWidth || dx >= (col + 1) * cellWidth) continue;
          const srcIdx = ((cell.top + y) * width + (cell.left + x)) * 4;
          if (cleaned[srcIdx + 3] === 0) continue;
          const dstIdx = (dy * outWidth + dx) * 4;
          out[dstIdx] = cleaned[srcIdx];
          out[dstIdx + 1] = cleaned[srcIdx + 1];
          out[dstIdx + 2] = cleaned[srcIdx + 2];
          out[dstIdx + 3] = cleaned[srcIdx + 3];
        }
      }
    } else {
      blitScaledFrame(
        cleaned,
        width,
        cell,
        scale,
        out,
        outWidth,
        col * cellWidth,
        row * cellHeight,
        cellWidth,
        cellHeight,
        targetAnchorX,
        targetFootY,
      );
    }
  }

  const recommendedStridePx = Math.max(40, Math.min(400, Math.round((cellWidth / Math.max(1, cellHeight)) * 110)));

  return {
    pixels: out,
    width: outWidth,
    height: outHeight,
    cellWidth,
    cellHeight,
    frameCount: cells.length,
    recommendedStridePx,
  };
}
