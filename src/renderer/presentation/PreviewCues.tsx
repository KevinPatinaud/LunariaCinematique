import React,{useEffect,useRef,useState} from 'react';
import type {Asset,Shot} from '../../shared/model.js';
import type {GameProject} from '../../shared/game/types.js';
import type {VfxDefinition,PresentationCatalog} from '../../shared/presentation/types.js';
import {filmCues,type FilmCue} from '../../shared/presentation/cinematic.js';
import {actorAnchor} from '../../shared/motion.js';
import {cinematicSpriteGeometry} from './CinematicSprite.js';
import {PreviewSoundPool,VfxGlyph} from './CuePrimitives.js';
interface Active extends FilmCue {serial:number}
export function CinematicCues({project,shot,assets,elapsed,playing,running}:{project?:GameProject;shot:Shot;assets:Asset[];elapsed:number;playing:boolean;running:boolean}){
 const pool=useRef<PreviewSoundPool>(new PreviewSoundPool()),previous=useRef(-1e-7),sequence=useRef(0),[effects,setEffects]=useState<Active[]>([]);
 useEffect(()=>()=>pool.current.clear(),[]);
 useEffect(()=>{pool.current.clear();previous.current=-1e-7;setEffects([]);},[shot.id,project?.id]);
 useEffect(()=>{
  if(!playing||!project){pool.current.clear();previous.current=-1e-7;setEffects([]);return;}
  pool.current.pause(!running);if(!running)return;
  if(elapsed<previous.current){pool.current.clear();setEffects([]);previous.current=-1e-7;}
  const cues=filmCues(project,shot,previous.current,elapsed);previous.current=elapsed;
  const owners=new Set(shot.actors.filter(a=>elapsed>=a.entry.delay&&!(a.exit&&a.exit.preset!=='none'&&elapsed>=a.exit.start+a.exit.duration)).map(a=>a.id));
  pool.current.retain(owners);
  for(const cue of cues)if(cue.type==='sound')pool.current.play(project.presentation!,assets,cue.ref,cue.actorId);
  setEffects(old=>{const next=old.filter(e=>{const d=project.presentation!.vfx.find(v=>v.id===e.ref);return d&&elapsed-e.at<d.duration;});
   for(const cue of cues){if(cue.type!=='vfx')continue;const d=project.presentation!.vfx.find(v=>v.id===cue.ref);if(!d||elapsed-cue.at>=d.duration||next.length>=96||next.filter(e=>e.ref===cue.ref).length>=d.maxInstances)continue;next.push({...cue,serial:++sequence.current});}return next;
  });
 },[playing,running,elapsed,project,shot,assets]);
 if(!project)return null;
 return <g pointerEvents="none" aria-label="Effets visuels de présentation">{effects.map(e=>{const actor=shot.actors.find(a=>a.id===e.actorId),def=project.presentation!.vfx.find(v=>v.id===e.ref);if(!actor||!def)return null;
  const at=['halo','flash','trail'].includes(def.preset)?elapsed:e.at,g=cinematicSpriteGeometry(actor,project,assets,at);if(!g)return null;
  const local=g.point(e.attach),point=actorAnchor(actor,at,true,local.x/g.w,local.y/g.h);
  return <g key={e.serial} transform={`translate(${point.x},${point.y})`}><VfxGlyph definition={def} age={Math.max(0,elapsed-e.at)} assets={assets}/></g>;
 })}</g>;
}
