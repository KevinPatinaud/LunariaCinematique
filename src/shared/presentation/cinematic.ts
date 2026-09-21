import type {Shot} from '../model.js';
import type {GameProject} from '../game/types.js';
import type {Attachment} from './types.js';
import {resolveActor,crossedMarkers} from './runtime.js';
/** Presentation-only events. This module deliberately has no simulation dependency. */
export interface FilmCue {actorId:string;at:number;type:'sound'|'vfx';ref:string;attach:Attachment}
export function filmCues(project:GameProject,shot:Shot,from:number,to:number):FilmCue[]{
 if(!Number.isFinite(from)||!Number.isFinite(to)||to<from||to<0)return [];
 const result:FilmCue[]=[];
 for(const actor of shot.actors){const binding=actor.animation;if(!binding)continue;
  const animation=resolveActor(project,binding).animation;if(!animation)continue;
  const delay=actor.entry.delay;if(to<delay)continue;
  for(const entry of crossedMarkers(animation,(from-delay)*binding.speed,(to-delay)*binding.speed)){
   const marker=entry.marker;if(marker.type==='release')continue;
   const at=entry.at/binding.speed+delay;
   if(actor.exit&&actor.exit.preset!=='none'&&at>=actor.exit.start+actor.exit.duration)continue;
   result.push({actorId:actor.id,at,type:marker.type,ref:marker.ref,attach:marker.attach});
  }
 }
 return result.sort((a,b)=>a.at-b.at);
}
