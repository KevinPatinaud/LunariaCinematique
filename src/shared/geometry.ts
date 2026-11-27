import { STAGE, copy, upgradeCinematicFormat, type Actor, type Box, type Bubble, type Cinematic, type Shot } from './model.js';
import { graphemes } from './textSegments.js';
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const smooth = (t: number) => { const v = clamp(t, 0, 1); return v * v * (3 - 2 * v); };
export function cameraTransform(shot: Shot, elapsed: number) {
  const t = smooth(elapsed / shot.duration), amount = shot.camera.intensity * 0.18;
  let zoom = 1, x = 0, y = 0;
  switch (shot.camera.preset) {
    case 'zoom_in': zoom += amount * t; break;
    case 'zoom_out': zoom += amount * (1 - t); break;
    case 'pan_left': zoom += amount; x = (1 - 2 * t) * amount * STAGE.width / 2; break;
    case 'pan_right': zoom += amount; x = (2 * t - 1) * amount * STAGE.width / 2; break;
    case 'pan_up': zoom += amount; y = (1 - 2 * t) * amount * STAGE.height / 2; break;
    case 'pan_down': zoom += amount; y = (2 * t - 1) * amount * STAGE.height / 2; break;
  }
  return { zoom, x: STAGE.width * (1 - zoom) / 2 + x, y: STAGE.height * (1 - zoom) / 2 + y };
}
export { actorPose, actorAnchor, actorTransform } from './motion.js';
import { actorPose, actorAnchor } from './motion.js';
/** Deliberately deterministic. Exported explicit lines are reused by Godot. */
export function charWidth(char: string, size: number) {
  if (/\s/.test(char)) return size * 0.28;
  if (/[ilI1.,'’!:;|]/.test(char)) return size * 0.28;
  if (/[MW@%&]/.test(char)) return size * 0.90;
  return size * (char.charCodeAt(0) > 0x2fff ? 1 : /[A-Z]/.test(char) ? 0.68 : 0.56);
}
export function wrapText(text: string, maxWidth: number, fontSize: number,
  options: {measure?: (text: string, fontSize: number) => number} = {}): string[] {
  const measure = (s: string) => options.measure?.(s, fontSize) ?? [...s].reduce((n, c) => n + charWidth(c, fontSize), 0);
  const lines: string[] = [];
  // Outer blank paragraphs carry no visible text, but reserving line boxes for
  // them would shrink the font and move the visible dialogue off centre.
  // Keep internal paragraph breaks and leave the authored text untouched.
  for (const paragraph of text.replace(/\r/g, '').trim().split('\n')) {
    let line = '';
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      if (line && measure(line + ' ' + word) <= maxWidth) { line += ' ' + word; continue; }
      if (line) { lines.push(line); line = ''; }
      if (measure(word) <= maxWidth) { line = word; continue; }
      for (const char of graphemes(word)) {
        if (line && measure(line + char) > maxWidth) { lines.push(line); line = ''; }
        line += char;
      }
    }
    lines.push(line);
  }
  return lines.length ? lines : [''];
}
export function bubbleLayout(bubble: Bubble) {
  const textured = bubble.style === 'simple' || bubble.style === 'ornate';
  const width = bubble.width * STAGE.width;
  const paper = bubble.kind === 'thought' && bubble.style === 'parchment';
  const paddingX = paper ? Math.min(62, width * 0.34) : textured ? 58 : 28;
  const paddingY = textured ? 48 : 22;
  const contentWidth = width - paddingX * 2;
  const layoutAt = (fontSize: number) => {
    const lines = wrapText(bubble.text, Math.max(1, contentWidth), fontSize);
    return { lines, fontSize, lineHeight: fontSize * 1.32 };
  };
  let text = layoutAt(bubble.fontSize);
  // Automatic height follows the authored size; fitting never changes the bubble's box.
  const required = wrapText(bubble.text, Math.max(20, contentWidth), bubble.fontSize).length * bubble.fontSize * 1.32 + paddingY * 2;
  const height = bubble.autoHeight ? Math.min(STAGE.height * 2, Math.max(textured ? 156 : 98, required)) : bubble.height * STAGE.height;
  const contentHeight = height - paddingY * 2;
  const fits = (candidate: typeof text) => candidate.lines.length * candidate.lineHeight <= contentHeight + 1e-7 &&
    candidate.lines.every(line => [...line].reduce((n, char) => n + charWidth(char, candidate.fontSize), 0) <= contentWidth + 1e-7);
  if (!fits(text)) {
    // Largest fitting integer size, retaining all text and hard paragraph breaks.
    text = layoutAt(1);
    let low = 1, high = Math.ceil(bubble.fontSize) - 1;
    while (low <= high) {
      const size = Math.floor((low + high) / 2), candidate = layoutAt(size);
      if (fits(candidate)) { text = candidate; low = size + 1; }
      else high = size - 1;
    }
  }
  return { width, height, ...text, paddingX, paddingY, overflow: !fits(text) };
}
export function prepareCinematic(input: Cinematic): Cinematic {
  const cinematic = copy(input);
  upgradeCinematicFormat(cinematic);
  for (const shot of cinematic.shots) for (const bubble of shot.bubbles) {
    const layout = bubbleLayout(bubble);
    bubble.lines = layout.lines;
    bubble.height = layout.height / STAGE.height;
  }
  return cinematic;
}
export function tailPoints(box: Box, target: { x: number; y: number }): number[] | null {
  const x = box.x, y = box.y, w = box.width, h = box.height;
  if (target.x >= x && target.x <= x + w && target.y >= y && target.y <= y + h) return null;
  const cx = x + w / 2, cy = y + h / 2, dx = target.x - cx, dy = target.y - cy;
  if (Math.abs(dx / w) > Math.abs(dy / h)) {
    const bx = dx > 0 ? x + w - 3 : x + 3;
    const by = clamp(cy + dy * Math.abs((w / 2) / dx), y + 28, y + h - 28);
    return [bx, by - 14, target.x, target.y, bx, by + 14];
  }
  const by = dy > 0 ? y + h - 3 : y + 3;
  const bx = clamp(cx + dx * Math.abs((h / 2) / dy), x + 34, x + w - 34);
  return [bx - 17, by, target.x, target.y, bx + 17, by];
}
export function thoughtTrail(box: Box, target: { x: number; y: number }) {
  const centerX = box.x + box.width / 2, centerY = box.y + box.height / 2;
  const dx = target.x - centerX, dy = target.y - centerY;
  const relativeDistance = 2 * Math.max(Math.abs(dx / box.width), Math.abs(dy / box.height));
  if (relativeDistance <= 1) return [];

  const distance = Math.hypot(dx, dy);
  const edgeDistance = distance / relativeDistance;
  const trailLength = Math.min(96, distance - edgeDistance);
  if (trailLength < 18) return [];

  const scale = Math.min(1, trailLength / 72);
  return [[0.18, 10], [0.46, 6.5], [0.71, 4]].map(([fraction, radius]) => {
    const progress = (edgeDistance + trailLength * fraction) / distance;
    return { x: centerX + dx * progress, y: centerY + dy * progress, radius: radius * scale };
  });
}
export function bubbleTarget(bubble: Bubble, shot: Shot, elapsed: number, playing: boolean, animateCamera = playing) {
  const actor = shot.actors.find(a => a.id === bubble.speakerId);
  if (bubble.tail.mode === 'auto' && actor) {
    const head = actorAnchor(actor, elapsed, playing, 0.5, 0.22);
    const camera = animateCamera ? cameraTransform(shot, elapsed) : { x: 0, y: 0, zoom: 1 };
    return { x: head.x * camera.zoom + camera.x, y: head.y * camera.zoom + camera.y };
  }
  return { x: bubble.tail.x * STAGE.width, y: bubble.tail.y * STAGE.height };
}
/** Source regions of the user's original PNGs. No modified image files are written. */
export const FRAME_SPECS = {
  simple: { imageWidth: 1536, imageHeight: 1024, x: 58, y: 170, width: 1420, height: 600, left: 190, right: 190, top: 120, bottom: 180, bottomX: 320, bottomWidth: 260, scale: 0.35 },
  ornate: { imageWidth: 1536, imageHeight: 1024, x: 36, y: 131, width: 1482, height: 605, left: 235, right: 245, top: 155, bottom: 155, bottomX: 340, bottomWidth: 260, scale: 0.35 },
  // Keep the fern in the bottom-left patch. The plain paper above and beside it stretches.
  thought: { imageWidth: 2172, imageHeight: 724, x: 18, y: 85, width: 2135, height: 566, left: 340, right: 315, top: 100, bottom: 390, bottomX: 358, bottomWidth: 1480, scale: 0.235 }
} as const;
export type FrameStyle = keyof typeof FRAME_SPECS;
export interface Patch { sx: number; sy: number; sw: number; sh: number; x: number; y: number; width: number; height: number }
export function framePatches(style: FrameStyle, width: number, height: number): Patch[] {
  const s = FRAME_SPECS[style], scale = Math.min(s.scale, width / (s.left + s.right + 100), height / (s.top + s.bottom + 100));
  const dx = [0, s.left * scale, width - s.right * scale, width];
  const dy = [0, s.top * scale, height - s.bottom * scale, height];
  const sx = [s.x, s.x + s.left, s.x + s.width - s.right, s.x + s.width];
  const sy = [s.y, s.y + s.top, s.y + s.height - s.bottom, s.y + s.height];
  const result: Patch[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) result.push({
    sx: r === 2 && c === 1 ? s.bottomX : sx[c], sy: sy[r],
    sw: r === 2 && c === 1 ? s.bottomWidth : sx[c + 1] - sx[c], sh: sy[r + 1] - sy[r],
    x: dx[c], y: dy[r], width: dx[c + 1] - dx[c], height: dy[r + 1] - dy[r]
  });
  return result;
}
