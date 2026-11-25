import React, { useEffect, useMemo, useState } from 'react';
import type { Actor, Asset } from '../../shared/model.js';
import type { GameProject } from '../../shared/game/types.js';
import type { AnimationDefinition } from '../../shared/presentation/types.js';
import { frameAt, attachmentPoint, resolveActor } from '../../shared/presentation/runtime.js';
import { resolveCinematicActor, usesCinematicWalkFraming, type WalkFraming } from '../../shared/presentation/cinematicMotion.js';
import { SpriteGlyph, sourceGeometry, useImageSize } from './AnimationPreview.js';
import { loadWalkFraming, walkFraming, walkFramingRequest } from './walkFraming.js';

export function cinematicSpriteGeometry(actor: Actor, project: GameProject, assets: Asset[], elapsed: number) {
  const clip = actor.animation && resolveActor(project, actor.animation).animation;
  const request = clip && actor.animation && usesCinematicWalkFraming(clip, actor.animation)
    ? walkFramingRequest(actor.asset, clip, assets) : undefined;
  return spriteGeometry(actor, project, assets, elapsed, walkFraming(request));
}

function spriteGeometry(actor: Actor, project: GameProject, assets: Asset[], elapsed: number, framing?: WalkFraming | null) {
  const resolved = resolveCinematicActor(actor, project, elapsed, framing);
  if (!resolved) return;
  const { animation, scale, time, autoFlipX, anchorY, stretchStatic } = resolved;
  const visual = autoFlipX ? { ...resolved.visual, mirror: !resolved.visual.mirror } : resolved.visual;
  const w = actor.width * 1600;
  const h = actor.height * 900;
  const source = frameAt(animation, time).frame ?? visual.sprite;
  const size = sourceGeometry(source, assets, visual, stretchStatic);
  const point = (name: string) => {
    const local = attachmentPoint(animation, time, name, { x: size.width, y: size.height }, visual.mirror, source.anchor);
    return { x: w * 0.5 + local.x * scale, y: anchorY + local.y * scale };
  };
  return { animation, visual, scale, time, w, h, point, autoFlipX, anchorY, stretchStatic, usingIdleFallback: resolved.usingIdleFallback };
}

type SpriteGeometry = NonNullable<ReturnType<typeof cinematicSpriteGeometry>>;

function CinematicGlyph({ geometry, assets }: { geometry: SpriteGeometry; assets: Asset[] }) {
  return <g transform={`translate(${geometry.w * 0.5},${geometry.anchorY}) scale(${geometry.scale})`}>
    <SpriteGlyph animation={geometry.animation} visual={geometry.visual} assets={assets} time={geometry.time}
      stretch={geometry.stretchStatic} />
  </g>;
}

function CinematicWalkGlyph({ geometry, rest, walk, assets, framingReady }: {
  geometry: SpriteGeometry; rest: SpriteGeometry; walk: AnimationDefinition; assets: Asset[]; framingReady: boolean;
}) {
  const atRest = geometry.usingIdleFallback;
  const time = atRest ? 0 : geometry.time;
  const walkUrl = assets.find(asset => asset.ref === walk.frames[0].asset)?.url ?? '';
  const natural = useImageSize(walkUrl);
  const [loadedUrl, setLoadedUrl] = useState('');
  if (loadedUrl && loadedUrl !== walkUrl) setLoadedUrl('');
  const showWalk = !atRest && !!natural && loadedUrl === walkUrl && framingReady;
  const cycle = atRest ? { ...geometry, animation: walk, time, stretchStatic: false } : geometry;

  // Mount the first frame while the actor is standing. Keep the static SVG image
  // mounted until the actual walking SVG image has loaded at the current URL.
  return <>
    <g display={showWalk ? 'none' : undefined}>
      <CinematicGlyph geometry={atRest ? geometry : rest} assets={assets} />
    </g>
    <g display={showWalk ? undefined : 'none'} onLoadCapture={event => {
      if (event.target instanceof SVGImageElement && event.target.href.baseVal === walkUrl) setLoadedUrl(walkUrl);
    }}>
      <CinematicGlyph key={walkUrl} geometry={cycle} assets={assets} />
    </g>
  </>;
}

export function CinematicSprite({ actor, project, assets, elapsed, exporting }: {
  actor: Actor; project: GameProject; assets: Asset[]; elapsed: number; exporting?: boolean;
}) {
  const binding = actor.animation;
  const clip = useMemo(() => binding && resolveActor(project, binding).animation, [binding, project]);
  const request = useMemo(() => !exporting && clip && binding && usesCinematicWalkFraming(clip, binding)
    ? walkFramingRequest(actor.asset, clip, assets) : undefined, [actor.asset, assets, binding, clip, exporting]);
  useEffect(() => { if (request) loadWalkFraming(request); }, [request]);
  const framing = walkFraming(request);
  const geometry = spriteGeometry(actor, project, assets, elapsed, framing);
  const movementEnabled = actor.movement?.enabled;
  const walk = useMemo(() => {
    if (exporting || !movementEnabled || !binding?.syncWithMovement) return;
    const atlas = clip?.frames[0]?.asset;
    if (clip?.scope === 'cinematic' && clip.kind === 'frames' && atlas &&
      clip.frames.every(frame => frame.asset === atlas)) return clip;
  }, [binding, clip, exporting, movementEnabled]);
  const rest = useMemo(() => walk && spriteGeometry(actor, project, assets, 0, framing), [walk, actor, project, assets, framing]);
  if (!geometry) return <text y="30" fill="white">Animation à relier</text>;
  return walk && rest?.usingIdleFallback ? <CinematicWalkGlyph geometry={geometry} rest={rest} walk={walk} assets={assets}
    framingReady={!request || framing !== undefined} /> : <CinematicGlyph geometry={geometry} assets={assets} />;
}
