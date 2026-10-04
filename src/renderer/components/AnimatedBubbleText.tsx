import React, {useMemo} from 'react';
import type {Bubble} from '../../shared/model.js';
import {bubbleLayout, charWidth, wrapText} from '../../shared/geometry.js';
import {bubbleTextUnits, glyphPose, fitGlyphPose} from '../../shared/textAnimation.js';
import {unitsForLines} from '../../shared/textSegments.js';
/** Same full layout at every frame. Hidden letters keep their positions, never reflowing the bubble. */
export function AnimatedBubbleText({bubble, elapsed, completed=false}: {bubble: Bubble; elapsed?: number; completed?: boolean}) {
  const layout = useMemo(() => bubbleLayout(bubble), [bubble.text, bubble.width, bubble.fontSize, bubble.style, bubble.height, bubble.autoHeight]);
  const clockUnits = useMemo(() => bubbleTextUnits(bubble), [bubble.text, bubble.width, bubble.fontSize, bubble.style, bubble.height, bubble.autoHeight]);
  const width = Math.max(1, layout.width - 2 * layout.paddingX);
  const height = Math.max(1, layout.height - layout.paddingY * 2);
  const metrics = useMemo(() => {
    const ctx = document.createElement('canvas').getContext('2d');
    const measure = (text: string, size: number) => ctx?.measureText(text).width ?? Array.from(text).reduce((n,c) => n + charWidth(c,size), 0);
    const layoutAt = (fontSize: number) => {
      if (ctx) ctx.font = `${fontSize}px Georgia, serif`;
      // Rewrap the original text at each measured size. Reusing estimated lines
      // after shrinking would leave avoidable space and choose a smaller font.
      const lines = wrapText(bubble.text, width, fontSize, {measure});
      const lineHeight = fontSize * 1.32, units = unitsForLines(lines);
      const lineMetrics = lines.map(line => ctx?.measureText(line));
      const blankMetrics = ctx?.measureText('Hg');
      let prefix = '', row = -1;
      const glyphs = units.map(unit => {
        if (row !== unit.line) { row = unit.line; prefix = ''; }
        const advance = measure(unit.text, fontSize), x = measure(prefix + unit.text, fontSize) - advance;
        const measured = ctx?.measureText(unit.text);
        prefix += unit.text;
        return {x, y: unit.line * lineHeight,
          left: measured?.actualBoundingBoxLeft ?? 0, right: measured?.actualBoundingBoxRight ?? advance,
          ascent: measured?.actualBoundingBoxAscent ?? fontSize * .8,
          descent: measured?.actualBoundingBoxDescent ?? fontSize * .2};
      });
      // Serif side bearings can extend beyond the advance (a leading j, for example).
      // Include both complete-line and separated-glyph ink, used during animation.
      const drawn = glyphs.filter((_, index) => /\S/u.test(units[index].text));
      const insetX = Math.max(0, ...lineMetrics.map(m => m?.actualBoundingBoxLeft ?? 0),
        ...drawn.map(g => g.left - g.x));
      const measuredWidth = insetX + Math.max(0, ...lines.map((line, index) =>
        Math.max(measure(line, fontSize), lineMetrics[index]?.actualBoundingBoxRight ?? 0)),
        ...drawn.map(g => g.x + g.right));
      const inkTop = Math.min(...lineMetrics.map((m, index) => index * lineHeight - ((lines[index] ? m : blankMetrics)?.actualBoundingBoxAscent ?? fontSize * .8)));
      const inkBottom = Math.max(...lineMetrics.map((m, index) => index * lineHeight + ((lines[index] ? m : blankMetrics)?.actualBoundingBoxDescent ?? fontSize * .2)));
      const textHeight = inkBottom - inkTop;
      const blockTop = Math.max(0, (height - textHeight) / 2), offsetY = blockTop - inkTop;
      return {lines, units, glyphs, fontSize, lineHeight, insetX, offsetY, blockTop, textHeight,
        fits: measuredWidth <= width + 1e-7 && textHeight <= height + 1e-7};
    };
    // The authored size wins whenever it fits. Otherwise choose the largest
    // measured integer size; the bubble's box and exported font size stay intact.
    let fitted = layoutAt(bubble.fontSize);
    for (let size = Math.ceil(bubble.fontSize) - 1; !fitted.fits && size >= 1; size--) fitted = layoutAt(size);
    // Real wrapping can move spaces/line breaks. Keep the shared reveal/effect
    // clock for each visible grapheme while retaining its real row and column.
    const visibleClock = clockUnits.filter(unit => /\S/u.test(unit.text));
    let clockIndex = 0;
    fitted.units = fitted.units.map(unit => {
      if (!/\S/u.test(unit.text)) return unit;
      const clock = visibleClock[clockIndex++];
      return clock ? {...unit, index: clock.index, word: clock.word} : unit;
    });
    return fitted;
  }, [clockUnits, bubble.text, bubble.fontSize, width, height]);
  if (elapsed === undefined || !bubble.textAnimation) return <text data-testid="bubble-text" fill="#342e24" fontSize={metrics.fontSize} fontFamily="Georgia, serif" textRendering="geometricPrecision">
    {metrics.lines.map((line,index) => <tspan key={index} x={metrics.insetX} y={metrics.offsetY + index * metrics.lineHeight}>{line || ' '}</tspan>)}
  </text>;
  return <g data-testid="animated-text" aria-label={bubble.text}>
    {metrics.units.map((unit,index) => {
      if (/^\s+$/u.test(unit.text)) return null;
      const m = metrics.glyphs[index], x = metrics.insetX + m.x, y = metrics.offsetY + m.y;
      const cx = x + (m.right - m.left) / 2, cy = y + (m.descent - m.ascent) / 2;
      const pose = fitGlyphPose(glyphPose(bubble,unit,elapsed,cx,cy - metrics.blockTop,width,metrics.textHeight,completed),
        cx, cy, m.left + m.right, m.ascent + m.descent, width, height);
      return <g key={index} data-text-unit={unit.index} data-visible={pose.opacity > 0 ? 'true' : 'false'}
        opacity={pose.opacity} transform={`translate(${cx + pose.dx},${cy + pose.dy}) rotate(${pose.rotation}) scale(${pose.scale}) translate(${-cx},${-cy})`}>
        <text x={x} y={y} fill="#342e24" fontSize={metrics.fontSize} fontFamily="Georgia, serif" textRendering="geometricPrecision">{unit.text}</text>
      </g>;
    })}
  </g>;
}
