import React, {useMemo} from 'react';
import type {Bubble} from '../../shared/model.js';
import {bubbleLayout, charWidth} from '../../shared/geometry.js';
import {bubbleTextUnits, glyphPose, fitGlyphPose} from '../../shared/textAnimation.js';
/** Same full layout at every frame. Hidden letters keep their positions, never reflowing the bubble. */
export function AnimatedBubbleText({bubble, elapsed, completed=false}: {bubble: Bubble; elapsed?: number; completed?: boolean}) {
  const layout = useMemo(() => bubbleLayout(bubble), [bubble.text, bubble.width, bubble.fontSize, bubble.style, bubble.height, bubble.autoHeight]);
  const units = useMemo(() => bubbleTextUnits(bubble), [bubble.text, bubble.width, bubble.fontSize, bubble.style]);
  const metrics = useMemo(() => {
    const ctx = document.createElement('canvas').getContext('2d');
    if (ctx) ctx.font = `${bubble.fontSize}px Georgia, serif`;
    const measure = (text: string) => ctx?.measureText(text).width ?? Array.from(text).reduce((n,c) => n + charWidth(c,bubble.fontSize), 0);
    let prefix = '', row = -1;
    return units.map(unit => {
      if (row !== unit.line) { row = unit.line; prefix = ''; }
      // Using the width of the complete prefix preserves kerning positions at rest.
      const width = measure(unit.text), end = measure(prefix + unit.text), x = end - width;
      prefix += unit.text;
      return {x, width, y: bubble.fontSize + unit.line * layout.lineHeight};
    });
  }, [units, bubble.fontSize, layout.lineHeight]);
  if (elapsed === undefined || !bubble.textAnimation) return <text fill="#342e24" fontSize={bubble.fontSize} fontFamily="Georgia, serif">
    {layout.lines.map((line,index) => <tspan key={index} x="0" y={bubble.fontSize + index * layout.lineHeight}>{line || ' '}</tspan>)}
  </text>;
  const width = Math.max(1, layout.width - 2 * layout.paddingX);
  const height = Math.max(1, layout.height - layout.paddingY * 2 + 7);
  return <g data-testid="animated-text" aria-label={bubble.text}>
    {units.map((unit,index) => {
      if (/^\s+$/u.test(unit.text)) return null;
      const m = metrics[index], cx = m.x + m.width / 2, cy = m.y - bubble.fontSize * 0.35;
      const pose = fitGlyphPose(glyphPose(bubble,unit,elapsed,cx,cy,width,layout.lines.length * layout.lineHeight,completed), cx, cy, m.width, bubble.fontSize, width, height);
      return <g key={index} data-text-unit={index} data-visible={pose.opacity > 0 ? 'true' : 'false'}
        opacity={pose.opacity} transform={`translate(${cx + pose.dx},${cy + pose.dy}) rotate(${pose.rotation}) scale(${pose.scale}) translate(${-cx},${-cy})`}>
        <text x={m.x} y={m.y} fill="#342e24" fontSize={bubble.fontSize} fontFamily="Georgia, serif">{unit.text}</text>
      </g>;
    })}
  </g>;
}
