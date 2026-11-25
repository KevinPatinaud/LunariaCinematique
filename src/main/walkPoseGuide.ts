type Point = readonly [x: number, y: number];
type Color = readonly [blue: number, green: number, red: number, alpha: number];
type LegPose = { knee: Point; heel: Point; toe: Point };

const cellWidth = 192;
const cellHeight = 218;
const near: Color = [44, 122, 218, 255];
const far: Color = [192, 103, 43, 255];
const body: Color = [209, 210, 210, 255];
const ground: Color = [169, 177, 180, 255];

const steps: ReadonlyArray<{ drop: number; support: LegPose; swing: LegPose }> = [
  { drop: 0, support: { knee: [116, 163], heel: [126, 196], toe: [146, 189] },
    swing: { knee: [76, 160], heel: [49, 186], toe: [67, 196] } },
  { drop: 4, support: { knee: [116, 161], heel: [112, 196], toe: [134, 196] },
    swing: { knee: [79, 156], heel: [55, 176], toe: [66, 188] } },
  { drop: 0, support: { knee: [94, 163], heel: [84, 196], toe: [107, 196] },
    swing: { knee: [120, 154], heel: [90, 170], toe: [107, 179] } },
  { drop: -4, support: { knee: [76, 163], heel: [62, 186], toe: [79, 196] },
    swing: { knee: [132, 155], heel: [122, 177], toe: [142, 180] } },
];

/** Rasterize a motion diagram for the provider, separate from the character artwork. */
export function walkPoseGuide(columns: number, facing: 'left' | 'right') {
  const width = cellWidth * columns;
  const height = cellHeight * 2;
  const pixels = Buffer.alloc(width * height * 4, 250);
  for (let i = 3; i < pixels.length; i += 4) pixels[i] = 255;
  const samples = columns === 3 ? [0, 2, 3] : [0, 1, 2, 3];

  for (let row = 0; row < 2; row++) {
    for (const [column, phase] of samples.entries()) {
      const { support, swing, drop } = steps[phase];
      const foreground = row === 0 ? support : swing;
      const background = row === 0 ? swing : support;
      const paint = (x: number, y: number, color: Color) => {
        const localX = facing === 'left' ? cellWidth - 1 - x : x;
        pixels.set(color, ((row * cellHeight + y) * width + column * cellWidth + localX) * 4);
      };
      const ellipse = ([cx, cy]: Point, rx: number, ry: number, color: Color) => {
        for (let y = cy - ry; y <= cy + ry; y++) {
          for (let x = cx - rx; x <= cx + rx; x++) {
            if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) paint(x, y, color);
          }
        }
      };
      const stroke = ([ax, ay]: Point, [bx, by]: Point, radius: number, color: Color) => {
        const dx = bx - ax, dy = by - ay, length = dx * dx + dy * dy;
        for (let y = Math.min(ay, by) - radius; y <= Math.max(ay, by) + radius; y++) {
          for (let x = Math.min(ax, bx) - radius; x <= Math.max(ax, bx) + radius; x++) {
            const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / length));
            if ((x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2 <= radius ** 2) paint(x, y, color);
          }
        }
      };
      const leg = (pose: LegPose, hip: Point, color: Color) => {
        stroke(hip, pose.knee, 6, color);
        stroke(pose.knee, pose.heel, 5, color);
        stroke(pose.heel, pose.toe, 5, color);
      };
      const arm = (pose: LegPose, shoulder: Point, color: Color) => {
        const endX = shoulder[0] + Math.round((96 - pose.heel[0]) * 0.38);
        stroke(shoulder, [endX - 5, 127 + drop], 5, color);
        stroke([endX - 5, 127 + drop], [endX + 5, 123 + drop], 5, color);
      };

      stroke([25, 202], [166, 202], 1, ground);
      arm(background, [137, 102 + drop], far);
      leg(background, [106, 136 + drop], far);
      ellipse([95, 86 + drop], 47, 54, body);
      ellipse([125, 76 + drop], 5, 6, [98, 98, 98, 255]);
      leg(foreground, [89, 134 + drop], near);
      arm(foreground, [65, 102 + drop], near);
    }
  }
  return { pixels, width, height };
}
