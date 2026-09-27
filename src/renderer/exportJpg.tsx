import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { Asset, Shot } from '../shared/model.js';
import type { GameProject } from '../shared/game/types.js';
import { Scene } from './components/Scene.js';
import { api } from './browserBridge.js';

const WIDTH = 1600, HEIGHT = 900;

function dataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossible de lire une image de la bibliothèque.'));
    reader.readAsDataURL(blob);
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Impossible de composer le JPG du plan.'));
    image.src = url;
  });
}

/** Rasterize the same SVG composition as the editor, with all dialogue visible. */
export async function renderShotJpg(shot: Shot, assets: Asset[], project: GameProject, catalogMatches: boolean, imageCache = new Map<string, string>()): Promise<string> {
  const available = new Set(assets.map(asset => asset.ref));
  const needed = [shot.background.asset, ...shot.actors.map(actor => actor.asset), ...shot.bubbles.map(bubble => bubble.frameAsset)];
  const missing = needed.filter((ref): ref is NonNullable<typeof ref> => !!ref && !available.has(ref));
  if (missing.length) throw new Error(`Export impossible pour « ${shot.name} » : image absente de la bibliothèque (${missing[0]}).`);
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:1600px;height:900px;pointer-events:none';
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<Scene exporting shot={shot} assets={assets} presentationProject={project}
      catalogMatches={catalogMatches} selection={{ kind: 'shot' }} onSelect={() => undefined}
      onUpdate={() => undefined} playing={false} elapsed={0} activeBubble={0}
      onAdvance={() => undefined} onDropAsset={() => undefined} guides={false}/>));
    const source = host.querySelector('svg.scene-svg');
    if (!source) throw new Error('Scène du plan introuvable.');
    const svg = source.cloneNode(true) as SVGSVGElement;
    svg.setAttribute('width', String(WIDTH));
    svg.setAttribute('height', String(HEIGHT));
    const references = new Map(assets.map(asset => [asset.url, asset.ref]));
    for (const image of svg.querySelectorAll('image')) {
      const href = image.getAttribute('href');
      if (!href) continue;
      let embedded = imageCache.get(href);
      if (!embedded) {
        const ref = references.get(href);
        if (ref && window.lunaria) embedded = await api.imageDataForJpg(ref);
        else {
          const response = await fetch(href);
          if (!response.ok) throw new Error(`Image introuvable pour « ${shot.name} » : ${href}`);
          embedded = await dataUrl(await response.blob());
        }
        if (imageCache.size >= 8) imageCache.delete(imageCache.keys().next().value!);
        imageCache.set(href, embedded);
      }
      image.setAttribute('href', embedded);
    }
    const xml = new XMLSerializer().serializeToString(svg);
    const svgUrl = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const rendered = await loadImage(svgUrl);
      const canvas = document.createElement('canvas');
      canvas.width = WIDTH; canvas.height = HEIGHT;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canevas JPG indisponible.');
      context.fillStyle = '#121a18';
      context.fillRect(0, 0, WIDTH, HEIGHT);
      context.drawImage(rendered, 0, 0, WIDTH, HEIGHT);
      return canvas.toDataURL('image/jpeg', 0.92);
    } finally { URL.revokeObjectURL(svgUrl); }
  } finally {
    root.unmount();
    host.remove();
  }
}
