import React, { useRef, useState } from 'react';
interface Props { width: number; maxWidth: number; resize: (width: number) => void }
export function LibraryResizeHandle({ width, maxWidth, resize }: Props) {
  const drag = useRef<{ x: number; width: number } | null>(null);
  const [active, setActive] = useState(false);
  const apply = (next: number) => resize(Math.round(Math.max(280, Math.min(maxWidth, next))));
  return <div className={`library-resizer ${active ? 'dragging' : ''}`} role="separator" tabIndex={0}
    aria-label="Largeur de la bibliothèque" aria-orientation="vertical" aria-valuemin={280} aria-valuemax={maxWidth} aria-valuenow={width}
    title="Glisser pour élargir · Double-clic pour réinitialiser · Flèches gauche / droite"
    onPointerDown={event => {
      if (event.button !== 0) return;
      event.preventDefault(); drag.current = { x: event.clientX, width }; setActive(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={event => { if (drag.current) apply(drag.current.width + event.clientX - drag.current.x); }}
    onPointerUp={event => { drag.current = null; setActive(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
    onPointerCancel={() => { drag.current = null; setActive(false); }}
    onLostPointerCapture={() => { drag.current = null; setActive(false); }}
    onDoubleClick={() => apply(368)}
    onKeyDown={event => {
      const step = event.shiftKey ? 48 : 16;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); apply(width + (event.key === 'ArrowRight' ? step : -step)); }
      if (event.key === 'Home') { event.preventDefault(); apply(280); }
      if (event.key === 'End') { event.preventDefault(); apply(maxWidth); }
    }}><span/></div>;
}
