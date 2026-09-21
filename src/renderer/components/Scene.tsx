import {CinematicCues} from '../presentation/PreviewCues.js';
import type {GameProject} from '../../shared/game/types.js';
import {CinematicSprite,cinematicSpriteGeometry} from '../presentation/CinematicSprite.js';
import { AnimatedBubbleText } from './AnimatedBubbleText.js';
import { isLibraryTab } from '../../shared/libraryBrowser.js';
import React, { useEffect, useRef, useState, useId } from 'react';
import type { Actor, Asset, Box, Bubble, Shot } from '../../shared/model.js';
import { ASSET_MIME, ASSET_KIND_MIME } from '../../shared/assets.js';
import { applyObjectChanges, moveObjects, selectionBounds, snapMove, objectBox, intersectionArea, type ObjectChange } from '../../shared/studio.js';
import { copy } from '../../shared/model.js';
import { restPose, actorTransform, actorAnchor, setMovementDestination } from '../../shared/motion.js';
import { resizeBox, resizeActor } from '../../shared/editing.js';
import type { LibraryTab } from '../../shared/libraryBrowser.js';
import { STAGE } from '../../shared/model.js';
import { actorPose, bubbleLayout, bubbleTarget, cameraTransform, clamp, framePatches, tailPoints } from '../../shared/geometry.js';
export type Selection = { kind: 'shot' } | { kind: 'actor' | 'bubble'; id: string };
interface Props {
  presentationProject?:GameProject;catalogMatches?:boolean;presentationRunning?:boolean;
  selectionIds?: readonly string[]; lockedIds?: ReadonlySet<string>; hiddenIds?: ReadonlySet<string>; snap?: boolean;
  onGroupSelect?: (ids: string[], additive?: boolean) => void; onBatchUpdate?: (changes: ObjectChange[], label: string) => void;
  motionTime?: number; previewBubbleId?: string; dialogueElapsed?: number; textCompleted?: boolean;
  disabled?: boolean; shot: Shot; assets: Asset[]; selection: Selection; onSelect: (s: Selection, additive?: boolean) => void;
  onUpdate: (kind: 'actor' | 'bubble', id: string, patch: Partial<Actor> | Partial<Bubble>) => void;
  playing: boolean; elapsed: number; activeBubble: number; onAdvance: () => void;
  onDropAsset: (ref: string, as?: LibraryTab, position?: { x: number; y: number }) => void; guides: boolean;
}
interface Drag { kind: 'actor' | 'bubble' | 'marquee'; id: string; ids: string[]; mode: string; start: { x: number; y: number }; box: Box; changes: ObjectChange[]; additive?: boolean; moved?: boolean }
function Frame({ asset, style, width, height }: { asset: Asset; style: 'simple' | 'ornate'; width: number; height: number }) {
  return <g pointerEvents="none">{framePatches(style, width, height).map((p, index) => <svg key={index}
    x={p.x} y={p.y} width={p.width + 0.35} height={p.height + 0.35}
    viewBox={`${p.sx} ${p.sy} ${p.sw} ${p.sh}`} preserveAspectRatio="none" overflow="hidden">
    <image href={asset.url} width="1536" height="1024"/>
  </svg>)}</g>;
}
export function Scene(props: Props) {
  const { shot, assets, selection, onSelect, onUpdate, playing, elapsed, activeBubble, onAdvance } = props;
  const [,setImageRevision]=useState(0);
  useEffect(()=>{const redraw=()=>setImageRevision(n=>n+1);window.addEventListener('lunaria-image-size',redraw);return()=>window.removeEventListener('lunaria-image-size',redraw);},[]);
  const animated = playing || props.motionTime !== undefined;
  const animationTime = playing ? elapsed : props.motionTime ?? 0;
  const svg = useRef<SVGSVGElement>(null), drag = useRef<Drag | null>(null);
  const [draft, setDraft] = useState<ObjectChange[] | null>(null);
  const [marquee, setMarquee] = useState<Box|null>(null), [snapLines, setSnapLines] = useState<{xLine:number|null;yLine:number|null}|null>(null);
  const chosen = props.selectionIds ?? (selection.kind==='shot'?[]:[selection.id]);
  const locked = props.lockedIds ?? new Set<string>(), hidden = props.hiddenIds ?? new Set<string>();
  const clearDraft = () => { drag.current=null; setDraft(null); setMarquee(null); setSnapLines(null); };
  const clipId = useId().replace(/:/g, '');
  const [failed, setFailed] = useState<Set<string>>(new Set());
  useEffect(() => { setFailed(new Set()); }, [assets]);
  useEffect(() => {
    const cancel = (e: KeyboardEvent) => { if (e.key === 'Escape' && drag.current) { e.preventDefault(); e.stopImmediatePropagation(); clearDraft(); } };
    window.addEventListener('keydown', cancel, true); return () => window.removeEventListener('keydown', cancel, true);
  }, []);
  useEffect(() => { if (playing || props.disabled) { clearDraft(); } }, [playing, props.disabled]);
  useEffect(() => { clearDraft(); }, [shot]);
  const asset = (ref: string | null) => assets.find(a => a.ref === ref);
  const effectiveShot = draft ? copy(shot) : shot;
  if (draft) applyObjectChanges(effectiveShot,draft);
  const camera = playing ? cameraTransform(shot, elapsed) : { x: 0, y: 0, zoom: 1 };
  const point = (event: React.PointerEvent<SVGElement>) => {
    const matrix = svg.current?.getScreenCTM();
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : { x: 0, y: 0 };
  };
  function begin(event: React.PointerEvent<SVGElement>, kind: 'actor' | 'bubble', id: string, mode = 'move') {
    if (playing || props.disabled || event.button !== 0) return;
    event.stopPropagation();
    if (mode==='move' && (event.shiftKey||event.ctrlKey||event.metaKey)) {onSelect({kind,id},true); return;}
    const already = chosen.includes(id);
    if (!already || mode!=='move') onSelect({kind,id});
    if (locked.has(id) || hidden.has(id)) return;
    const object = kind==='actor'?effectiveShot.actors.find(a=>a.id===id):effectiveShot.bubbles.find(b=>b.id===id);
    if (!object) return;
    const ids = mode==='move' && already ? chosen.filter(id=>!locked.has(id)&&!hidden.has(id)) : [id];
    const box = mode==='move' ? selectionBounds(effectiveShot,ids)! : objectBox(object);
    drag.current={kind,id,ids,mode,start:point(event),box,changes:[]}; svg.current?.setPointerCapture(event.pointerId);
  }
  function beginMarquee(event:React.PointerEvent<SVGSVGElement>) {
    const p=point(event);
    drag.current={kind:'marquee',id:'',ids:[],mode:'marquee',start:p,box:{x:p.x/STAGE.width,y:p.y/STAGE.height,width:0,height:0},changes:[],additive:event.shiftKey||event.ctrlKey||event.metaKey};
    svg.current?.setPointerCapture(event.pointerId);
  }
  function move(event: React.PointerEvent<SVGSVGElement>) {
    const d=drag.current; if(!d||playing||props.disabled)return;
    const p=point(event); let dx=(p.x-d.start.x)/STAGE.width, dy=(p.y-d.start.y)/STAGE.height;
    d.moved=d.moved||Math.abs(p.x-d.start.x)+Math.abs(p.y-d.start.y)>4;
    if(d.kind==='marquee') {
      const box={x:Math.min(d.start.x,p.x)/STAGE.width,y:Math.min(d.start.y,p.y)/STAGE.height,width:Math.abs(p.x-d.start.x)/STAGE.width,height:Math.abs(p.y-d.start.y)/STAGE.height};
      d.box=box;setMarquee(box);return;
    }
    if(d.mode==='tail') d.changes=[{kind:'bubble',id:d.id,patch:{tail:{mode:'manual',x:clamp(p.x/STAGE.width,0,1),y:clamp(p.y/STAGE.height,0,1)}}}];
    else if(d.mode==='destination') {
      const a = shot.actors.find(a => a.id === d.id);
      if (a?.movement) d.changes = [{kind:'actor', id:a.id, patch:{movement:setMovementDestination(a, a.x+a.movement.dx+dx, a.y+a.movement.dy+dy)}}];
    }
    else if(d.mode==='move') {
      if(props.snap&&!event.altKey) {
        const others=[...shot.actors,...shot.bubbles].filter(o=>!d.ids.includes(o.id)&&!hidden.has(o.id)).map(objectBox);
        const snapped=snapMove(d.box,dx,dy,others);dx=snapped.dx;dy=snapped.dy;setSnapLines(snapped);
      } else setSnapLines(null);
      d.changes=moveObjects(shot,d.ids,dx,dy);
    } else {
      const actor = d.kind === 'actor' ? shot.actors.find(a => a.id === d.id) : undefined;
      const box = actor ? resizeActor(actor,d.mode,dx,dy) : resizeBox(d.box,'bubble',d.mode,dx,dy);
      d.changes=[{kind:d.kind,id:d.id,patch:{...box,...(d.kind==='bubble'?{autoHeight:false}:{})}}];
    }
    setDraft(d.changes);
  }
  function end(event:React.PointerEvent<SVGSVGElement>,cancel=false) {
    const d=drag.current;if(!d)return;
    if(!cancel&&!playing&&!props.disabled) {
      if(d.kind==='marquee') {
        if(d.moved) {
          const ids=[...shot.actors,...shot.bubbles].filter(o=>!hidden.has(o.id)&&!locked.has(o.id)&&intersectionArea(objectBox(o),d.box)>0).map(o=>o.id);
          props.onGroupSelect?.(ids,d.additive);
        } else if(!d.additive)onSelect({kind:'shot'});
      } else if(d.moved&&d.changes.length) {
        if(props.onBatchUpdate)props.onBatchUpdate(d.changes,d.ids.length>1?'Déplacer la sélection':d.mode==='destination'?'Définir la destination':d.mode==='tail'?'Orienter la queue':d.mode==='move'?'Déplacer un élément':'Redimensionner un élément');
        else for(const c of d.changes)onUpdate(c.kind,c.id,c.patch);
      }
    }
    clearDraft();if(svg.current?.hasPointerCapture(event.pointerId))svg.current.releasePointerCapture(event.pointerId);
  }
  const bg = asset(shot.background.asset);
  const selected = selection.kind === 'actor' ? effectiveShot.actors.find(a => a.id === selection.id)
    : selection.kind === 'bubble' ? effectiveShot.bubbles.find(b => b.id === selection.id) : undefined;
  const selectionBox = selected ? { x: selected.x * STAGE.width, y: selected.y * STAGE.height,
    width: selected.width * STAGE.width, height: selection.kind === 'bubble' ? bubbleLayout(selected as Bubble).height : selected.height * STAGE.height } : null;
  const missing = (name: string, width: number, height: number) => <g><rect data-background="true" width={width} height={height} fill="#223632" stroke="#c99254" strokeDasharray="10 8" strokeWidth="3"/><text x={width / 2} y={height / 2} textAnchor="middle" fill="#e4d9bd" fontSize="22">{name.slice(0, 30)}</text></g>;
  return <svg ref={svg} className={`scene-svg ${playing ? 'is-playing' : ''}`} data-testid="scene" viewBox="0 0 1600 900" role="img" aria-label={`Plan : ${shot.name}`}
    onPointerMove={move} onPointerUp={e => end(e)} onPointerCancel={e => end(e, true)} onLostPointerCapture={() => { clearDraft(); }}
    onPointerDown={e => { if (e.button !== 0 || props.disabled) return; if (playing) onAdvance(); else if (e.target === svg.current || (e.target as SVGElement).dataset.background) beginMarquee(e); }}
    onDragOver={e => { if (e.dataTransfer.types.includes(ASSET_MIME)) e.preventDefault(); }} onDrop={e => {
      e.preventDefault(); e.stopPropagation(); if (playing || props.disabled) return;
      const ref = e.dataTransfer.getData(ASSET_MIME), kind = e.dataTransfer.getData(ASSET_KIND_MIME);
      const p = svg.current?.getScreenCTM();
      const local = p ? new DOMPoint(e.clientX, e.clientY).matrixTransform(p.inverse()) : null;
      if (ref) props.onDropAsset(ref, isLibraryTab(kind) ? kind : undefined, local ? { x: local.x / STAGE.width, y: local.y / STAGE.height } : undefined);
    }}>
    <defs><clipPath id={clipId}><rect width="1600" height="900"/></clipPath></defs>
    <g clipPath={`url(#${clipId})`}>
      <rect data-background="true" width="1600" height="900" fill="#121a18"/>
      <g transform={`translate(${camera.x},${camera.y}) scale(${camera.zoom})`}>
        {bg && !failed.has(bg.url) ? <image data-background="true" href={bg.url} width="1600" height="900"
          preserveAspectRatio={shot.background.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
          onError={() => setFailed(prev => new Set(prev).add(bg.url))}/> : shot.background.asset ? missing('Décor à reconnecter', 1600, 900) : null}
        {effectiveShot.actors.filter(a=>playing||!hidden.has(a.id)).map(a => {
          const pose = animated ? actorPose(a, animationTime) : restPose(a);
          const image = asset(a.asset), w = a.width * STAGE.width, h = a.height * STAGE.height;
          return <g key={a.id} data-testid={`actor-${a.id}`} transform={actorTransform(pose)} opacity={pose.opacity}
            onPointerDown={e => begin(e, 'actor', a.id)} className={playing ? '' : locked.has(a.id) ? 'object-locked' : 'movable'}>
            <rect width={w} height={h} fill="transparent"/>
            <g transform={a.flipX ? `translate(${w},0) scale(-1,1)` : undefined} pointerEvents="none">
              {a.animation && props.presentationProject ? props.catalogMatches!==false?<CinematicSprite actor={a} project={props.presentationProject} assets={assets} elapsed={animationTime}/>:missing('Catalogue à relier',w,h):image && !failed.has(image.url) ? <image href={image.url} width={w} height={h} preserveAspectRatio="none" onError={() => setFailed(prev => new Set(prev).add(image.url))}/> : missing(a.name, w, h)}
            </g>
          </g>;
        })}
      </g>
      {props.guides && !animated && <g pointerEvents="none" stroke="white" strokeWidth="1" opacity="0.2" strokeDasharray="8 10"><path d="M533 0v900M1067 0v900M0 300h1600M0 600h1600"/><rect x="48" y="36" width="1504" height="828" fill="none"/></g>}
      <g transform={`translate(${camera.x},${camera.y}) scale(${camera.zoom})`}><CinematicCues project={props.catalogMatches===false?undefined:props.presentationProject} shot={shot} assets={assets} elapsed={elapsed} playing={playing} running={props.presentationRunning??playing}/></g>
      {effectiveShot.bubbles.map((b, i) => {
        if (!animated && hidden.has(b.id)) return null;
        if (!playing && props.previewBubbleId && b.id !== props.previewBubbleId) return null;
        if (playing && (i !== activeBubble || elapsed < shot.dialogueStart)) return null;
        const l = bubbleLayout(b), x = b.x * STAGE.width, y = b.y * STAGE.height;
        let target = bubbleTarget(b, effectiveShot, animationTime, animated, playing);
        const speaker=effectiveShot.actors.find(a=>a.id===b.speakerId);
        if(b.tail.mode==='auto'&&speaker?.animation&&props.presentationProject&&props.catalogMatches!==false){
          const geometry=cinematicSpriteGeometry(speaker,props.presentationProject,assets,animationTime);
          if(geometry){const local=geometry.point('head'),head=actorAnchor(speaker,animationTime,animated,local.x/geometry.w,local.y/geometry.h);target={x:head.x*camera.zoom+camera.x,y:head.y*camera.zoom+camera.y};}
        }
        const tail = b.kind === 'speech' && b.tail.mode !== 'none' ? tailPoints({ x, y, width: l.width, height: l.height }, target) : null;
        const frame = asset(b.frameAsset), textured = (b.style === 'simple' || b.style === 'ornate') && !!frame;
        const fill = b.style === 'plain' ? '#fffdf6' : '#f0e1bf', stroke = b.style === 'plain' ? '#353b33' : '#ad8b4b';
        return <g key={b.id} data-testid={`bubble-${b.id}`}>
          {tail && <polygon points={tail.join(' ')} fill={fill} stroke={stroke} strokeWidth="4" strokeLinejoin="round" pointerEvents="none"/>}
          <g transform={`translate(${x},${y})`} onPointerDown={e => begin(e, 'bubble', b.id)} className={playing ? '' : locked.has(b.id) ? 'object-locked' : 'movable'}>
            <rect width={l.width} height={l.height} rx={b.kind === 'narration' ? 10 : 26} fill={textured ? "transparent" : fill} stroke={stroke} strokeWidth={textured ? 0 : 3}/>
            {textured ? <Frame asset={frame!} style={b.style as 'simple' | 'ornate'} width={l.width} height={l.height}/>
              : b.style !== 'plain' && <rect x="7" y="7" width={l.width - 14} height={l.height - 14} rx={b.kind === 'narration' ? 6 : 20} fill="none" stroke="#bba677" strokeWidth="1" pointerEvents="none"/>}
            <svg x={l.paddingX} y={l.paddingY - 2} width={Math.max(1, l.width - l.paddingX * 2)} height={Math.max(1, l.height - l.paddingY * 2 + 7)} pointerEvents="none" overflow="hidden">
              <AnimatedBubbleText bubble={b} elapsed={playing ? (props.dialogueElapsed ?? Math.max(0, elapsed - shot.dialogueStart)) : props.previewBubbleId === b.id ? props.motionTime : undefined} completed={playing && props.textCompleted}/>
            </svg>
          </g>
          {!animated && <g pointerEvents="none"><circle cx={x + 12} cy={y - 12} r="15" fill={selection.kind === 'bubble' && selection.id === b.id ? '#b9d5a0' : '#2e4239'}/><text x={x + 12} y={y - 7} textAnchor="middle" fontSize="16" fill="#101b14">{i + 1}</text></g>}

        </g>;
      })}
      {!animated && selectionBox && selection.kind !== 'shot' && chosen.length<=1 && !hidden.has(selection.id) && <g transform={selection.kind === 'actor' && selected ? (() => {
        const pose = restPose(selected as Actor), x = pose.x + pose.pivotX, y = pose.y + pose.pivotY;
        return `translate(${x},${y}) rotate(${pose.rotation}) translate(${-x},${-y})`;
      })() : undefined}>
        <rect x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height} fill="none" stroke="#c5dea9" strokeWidth="2" strokeDasharray="8 5" pointerEvents="none"/>
        {!locked.has(selection.id) && (['nw', 'ne', 'sw', 'se'] as const).map(corner => <rect key={corner} data-testid={`resize-${corner}`}
          x={selectionBox.x + (corner.includes('e') ? selectionBox.width : 0) - 7}
          y={selectionBox.y + (corner.includes('s') ? selectionBox.height : 0) - 7}
          width="14" height="14" rx="3" fill="#d4e7bd" stroke="#344631" strokeWidth="2" className={`resize-${corner}`}
          onPointerDown={e => begin(e, selection.kind as 'actor' | 'bubble', selection.id, corner)}/>)}
      </g>}
      {!animated && selected && selection.kind === 'actor' && chosen.length === 1 && !hidden.has(selected.id) && !locked.has(selected.id) && (() => {
        const actor = selected as Actor, m = actor.movement;
        if (!m?.enabled) return null;
        const start = actorAnchor(actor,0,false,0.5,0.5);
        const end = {x: start.x + m.dx*1600, y: start.y + m.dy*900};
        const ghost = restPose(actor); ghost.x += m.dx*1600; ghost.y += m.dy*900;
        const source = asset(actor.asset), w=actor.width*1600, h=actor.height*900;
        return <g data-testid="movement-path">
          <g pointerEvents="none" opacity="0.28" transform={actorTransform(ghost)}>
            <rect width={w} height={h} fill="none" stroke="#e5c989" strokeWidth="3" strokeDasharray="10 6"/>
            {source && <g transform={actor.flipX ? `translate(${w},0) scale(-1,1)` : undefined}><image href={source.url} width={w} height={h} preserveAspectRatio="none"/></g>}
          </g>
          <path d={`M${start.x} ${start.y} L${end.x} ${end.y}`} stroke="#e5c989" strokeWidth="3" strokeDasharray="10 7" pointerEvents="none"/>
          <g pointerEvents="none"><circle cx={start.x} cy={start.y} r="14" fill="#c4dbaa"/><text className="motion-path-label" x={start.x} y={start.y+6} textAnchor="middle">A</text></g>
          <g className="destination-handle" data-testid="movement-destination" onPointerDown={e => begin(e,'actor',actor.id,'destination')}>
            <circle cx={clamp(end.x,18,1582)} cy={clamp(end.y,18,882)} r="19" fill="#e5c989" stroke="#283723" strokeWidth="3"/>
            <text className="motion-path-label" x={clamp(end.x,18,1582)} y={clamp(end.y,18,882)+6} textAnchor="middle">B</text>
          </g>
        </g>;
      })()}
      {!animated && chosen.length===1 && selected && !locked.has(selected.id) && !hidden.has(selected.id) && selection.kind === 'bubble' && (selected as Bubble).kind === 'speech' && (selected as Bubble).tail.mode !== 'none' && (() => {
        const target = bubbleTarget(selected as Bubble, effectiveShot, elapsed, false);
        return <circle data-testid="tail-handle" cx={target.x} cy={target.y} r="13" fill="#cde0b4" stroke="#24362e" strokeWidth="3" className="tail-handle" onPointerDown={e => begin(e, 'bubble', selected.id, 'tail')}/>;
      })()}
      {!animated && chosen.length>1 && <g pointerEvents="none">{[...effectiveShot.actors,...effectiveShot.bubbles].filter(o=>chosen.includes(o.id)&&!hidden.has(o.id)).map(o=>{const b=objectBox(o);return <rect key={o.id} x={b.x*1600} y={b.y*900} width={b.width*1600} height={b.height*900} fill="none" stroke="#c5dea9" strokeWidth="2" strokeDasharray="8 5"/>;})}</g>}
      {!animated && snapLines && <g pointerEvents="none" stroke="#e3c785" strokeWidth="2" strokeDasharray="6 4">{snapLines.xLine!==null&&<path d={`M${snapLines.xLine*1600} 0v900`}/>} {snapLines.yLine!==null&&<path d={`M0 ${snapLines.yLine*900}h1600`}/>}</g>}
      {!animated && marquee && <rect pointerEvents="none" data-testid="marquee" x={marquee.x*1600} y={marquee.y*900} width={marquee.width*1600} height={marquee.height*900} fill="#b9d5a022" stroke="#c5dea9" strokeWidth="2"/>}
      {playing && shot.transition.type === 'fade' && elapsed < shot.transition.duration && <rect width="1600" height="900" fill="black" opacity={1 - elapsed / Math.max(0.01, shot.transition.duration)} pointerEvents="none"/>}
    </g>
  </svg>;
}
