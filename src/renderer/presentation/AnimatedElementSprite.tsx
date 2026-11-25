import { useEffect, useState } from 'react';
import type { Asset } from '../../shared/model.js';
import type { ActorAnimation } from '../../shared/presentation/types.js';
import { sampleElement, type ElementClip } from '../../shared/presentation/animatedElements.js';
import { useImageSize } from './AnimationPreview.js';

export function AnimatedElementSprite({ clip, assets, width, height, time, binding, editing = false, showOrigin = false }: {
  clip: ElementClip; assets: Asset[]; width: number; height: number; time: number;
  binding?: ActorAnimation; editing?: boolean; showOrigin?: boolean;
}) {
  const { x, y } = clip.element.pivot;
  const px = width * x, py = height * y;
  const layers = sampleElement(clip, editing ? binding?.elementPlayback?.start ?? 0 : time, binding, editing);
  return <g data-element-preset={clip.element.preset}>
    {layers.map((layer, index) => {
      const asset = assets.find(item => item.ref === layer.asset);
      if (!asset) return null;
      return <image key={index} href={asset.url} width={width} height={height}
        preserveAspectRatio="xMidYMax meet" opacity={layer.opacity}
        transform={`translate(${px + layer.x * height},${py + layer.y * height}) rotate(${layer.angle}) scale(${layer.scaleX},${layer.scaleY}) translate(${-px},${-py})`}/>;
    })}
    {showOrigin && <circle data-element-origin cx={px} cy={py} r={Math.max(3, height * 0.035)}
      stroke="white" strokeWidth="1.5" fill="#233127" vectorEffect="non-scaling-stroke"/>}
  </g>;
}

export function AnimatedElementPreview({ clip, assets, playing, showPivot = false }: {
  clip: ElementClip; assets: Asset[]; playing: boolean; showPivot?: boolean;
}) {
  const [elapsed, setElapsed] = useState(0);
  const asset = assets.find(item => item.ref === clip.frames[0]?.asset);
  const size = useImageSize(asset?.url ?? '');
  const ratio = (size?.width ?? 1) / (size?.height ?? 1);
  const width = Math.min(100, 100 * ratio), height = width / ratio;
  const exhale = clip.element.preset === 'exhale';
  const drift = clip.element.preset === 'float' ? (clip.element.drift ?? 0) * height : 0;
  const top = clip.element.preset === 'float' ? -height * (clip.element.travel + 0.8)
    : exhale ? -height * (0.5 + clip.element.travel * 0.3) : -height * 0.4;
  const bottom = height * (clip.element.preset === 'fall' ? clip.element.travel + 1.3 : 1.4);
  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const time = (now - start) / 1000;
      setElapsed(clip.loop ? time : time % (clip.duration + 0.5));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, clip.duration, clip.loop]);
  return <svg className="animated-element-preview" role="img" aria-label="Aperçu de l’élément animé"
    viewBox={`${-width + Math.min(0, drift)} ${top} ${exhale ? width * 2.2 + height * clip.element.travel : width * 3 + Math.abs(drift)} ${bottom - top}`}>
    <AnimatedElementSprite clip={clip} assets={assets} width={width} height={height}
      time={elapsed} editing={!playing} showOrigin={showPivot && (exhale || (!playing && clip.element.preset === 'rotate'))}/>
  </svg>;
}
