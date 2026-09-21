import type { GameProject, PlantDefinition, EnemyDefinition } from '../game/types.js';
import type { AbilityDefinition } from '../game/combat.js';
import { DEFAULT_ABILITY_PRESENTATION, IDENTITY, type AnimationDefinition,type AnimationFrame,type SpeciesVisual,type Point,type LocalTransform,type ActorAnimation,type Cue,type PresentationEvent } from './types.js';
export type Species=PlantDefinition|EnemyDefinition;
export function species(project:GameProject,id:string):Species|undefined{return [...project.balance.plants,...project.balance.enemies].find(x=>x.id===id);}
export function resolveAnimation(project:GameProject,entity:Species|undefined,slot:string):AnimationDefinition|undefined{
 const c=project.presentation;if(!c)return;
 const profile=c.profiles.find(x=>x.id===entity?.animationProfileId),defaults=c.profiles.find(x=>x.id===c.defaultProfileId);
 const binding=profile?.slots.find(x=>x.slot===slot)??defaults?.slots.find(x=>x.slot===slot);
 return c.animations.find(x=>x.id===binding?.animationId);
}
export function resolveActor(project:GameProject,binding:ActorAnimation):{animation:AnimationDefinition|undefined;visual:SpeciesVisual|undefined}{
 const s=species(project,binding.speciesId);return {animation:binding.mode==='species'?resolveAnimation(project,s,binding.slot):project.presentation?.animations.find(x=>x.id===binding.animationId),visual:s?.visual};
}
export const duration=(a:AnimationDefinition):number=>a.kind==='procedural'?a.duration:a.frames.reduce((n,f)=>n+f.duration,0);
export function frameAt(a:AnimationDefinition,time:number):{frame:AnimationFrame|undefined;index:number;time:number}{
 const d=duration(a),t=a.loop&&d>0?Math.max(0,time)%d:Math.min(Math.max(0,time),Math.max(0,d-1e-9));let end=0;
 for(let i=0;i<a.frames.length;i++){end+=a.frames[i].duration;if(t<end)return {frame:a.frames[i],index:i,time:t};}
 return {frame:a.frames.at(-1),index:Math.max(0,a.frames.length-1),time:t};
}
/** Pure sampler: scrubbing cannot emit cues or mutate gameplay. Units: nominal 100px character box. */
export function sample(a:AnimationDefinition,time:number,quiet=false):LocalTransform{
 const result={...a.transform},d=duration(a),t=a.loop?Math.max(0,time)%Math.max(.001,d):Math.min(d,Math.max(0,time));
 if(a.kind==='frames'||quiet)return result;
 const u=t/Math.max(.001,d),wave=a.loop?Math.sin(t/a.motion.period*Math.PI*2):Math.sin(u*Math.PI),amp=a.motion.amplitude;
 switch(a.motion.preset){
 case 'breath':result.scaleX*=1-wave*amp*.012;result.scaleY*=1+wave*amp*.012;break;
 case 'sway':result.rotation+=wave*amp*3;break;
 case 'bounce':result.y-=Math.abs(wave)*amp*8;break;
 case 'shake':result.x+=Math.sin(t*81)*amp*3*(a.loop?1:1-u);break;
 case 'recoil':result.x-=wave*amp*7;result.rotation-=wave*amp*5;break;
 case 'spin':result.rotation+=360*amp*u;break;
 case 'pulse':result.scaleX*=1+wave*amp*.06;result.scaleY*=1+wave*amp*.06;break;
 case 'fade_in':result.opacity*=u;break;
 case 'fade_out':result.opacity*=1-u;break;
 }
 return result;
}
export function attachmentPoint(a:AnimationDefinition,time:number,id:string,size:Point,mirror=false,anchor?:Point,quiet=false):Point{
 const p=a.attachments.find(x=>x.id===id)??{x:.5,y:.5},pivot=anchor??frameAt(a,time).frame?.anchor??a.anchor,tr=sample(a,time,quiet);
 const x=(p.x-pivot.x)*size.x*tr.scaleX*(mirror?-1:1),y=(p.y-pivot.y)*size.y*tr.scaleY,r=tr.rotation*Math.PI/180;
 return {x:tr.x+Math.cos(r)*x-Math.sin(r)*y,y:tr.y+Math.sin(r)*x+Math.cos(r)*y};
}
/** Missing release marker -> explicit fallback delay. Short cadence scales BOTH clip and delay. */
export function releasePlan(project:GameProject,entity:Species,ability:AbilityDefinition,interval:number){
 const p=ability.presentation??DEFAULT_ABILITY_PRESENTATION,a=resolveAnimation(project,entity,p.slot),d=a?duration(a):0;
 const marker=a?.markers.find(m=>m.type==='release');const raw=p.release==='immediate'?0:p.release==='marker'?(marker?.at??p.delay):p.delay;
 const scale=p.fitCadence&&d>interval&&interval>0?d/interval:1;
 return {slot:p.slot,animationId:a?.id??'',delay:raw/scale,duration:d/scale,speed:scale};
}
/** One source per cue channel, species > ability > projectile > defaults. Empty field inherits; absence everywhere is silence. */
export function eventCue(project:GameProject,s:Species,event:PresentationEvent,...fallbacks:(Cue|undefined)[]):Cue{
 const c=project.presentation,own=c?.profiles.find(x=>x.id===s.animationProfileId)?.events.find(x=>x.event===event),def=c?.profiles.find(x=>x.id===c.defaultProfileId)?.events.find(x=>x.event===event);
 const all=[own,...fallbacks,def].filter((x):x is Cue=>!!x);return {soundId:all.find(x=>x.soundId)?.soundId??'',vfxId:all.find(x=>x.vfxId)?.vfxId??'',attach:all.find(x=>x.soundId||x.vfxId)?.attach??'center'};
}
export function animationUsages(project:GameProject,section:string,id:string):string[]{
 const out:string[]=[];const visit=(v:unknown,path:string)=>{if(!v||typeof v!=='object')return;for(const [k,x] of Object.entries(v)){if(typeof x==='string'&&x===id&&['animationId','animationProfileId','defaultProfileId','soundId','vfxId','trailVfxId','ref'].includes(k))out.push(path+'.'+k);else if(x&&typeof x==='object')visit(x,path+'.'+k);}};
 visit(project,'projet');return out;
}
export function presentationAssets(project:GameProject):string[]{
 const refs=new Set<string>();const visit=(v:unknown)=>{if(typeof v==='string'&&v.startsWith('library://'))refs.add(v);else if(v&&typeof v==='object')Object.values(v).forEach(visit);};
 visit(project.presentation);for(const s of [...project.balance.plants,...project.balance.enemies])visit(s.visual);for(const x of project.combat?.projectiles??[])visit(x.presentation);return [...refs];
}
export function crossedMarkers(a:AnimationDefinition,from:number,to:number){
 if(to<from||to<0)return [];const d=duration(a),result:{marker:AnimationDefinition['markers'][number];at:number}[]=[];
 const first=a.loop?Math.max(0,Math.floor(Math.max(0,from)/d)):0,last=a.loop?Math.floor(to/d):0;
 for(let cycle=first;cycle<=Math.min(last,first+64);cycle++)for(const marker of a.markers){const at=cycle*d+marker.at;if(at>from&&at<=to)result.push({marker,at});}return result.sort((a,b)=>a.at-b.at);
}
export { IDENTITY };
