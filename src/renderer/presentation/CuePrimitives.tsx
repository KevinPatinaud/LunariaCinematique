import React from 'react';
import type {Asset} from '../../shared/model.js';
import type {VfxDefinition,PresentationCatalog} from '../../shared/presentation/types.js';
/** UI-only pool: cannot create a battle, modify HP, emit an ability, or touch a save. */
export class PreviewSoundPool {
 private voices:{id:string;owner:string;audio:HTMLAudioElement}[]=[];
 play(c:PresentationCatalog,assets:Asset[],id:string,owner:string){
  this.voices=this.voices.filter(v=>!v.audio.ended);
  const def=c.audio.find(s=>s.id===id),asset=assets.find(a=>a.ref===def?.asset);
  if(!def||def.volume<=0||!asset||this.voices.length>=32||this.voices.filter(v=>v.id===id).length>=def.maxInstances||def.loop&&this.voices.some(v=>v.id===id&&v.owner===owner))return;
  const audio=new Audio(asset.url);audio.volume=def.volume;audio.loop=def.loop;audio.playbackRate=1+(Math.random()*2-1)*def.pitchVariation;audio.preservesPitch=false;
  this.voices.push({id,owner,audio});void audio.play().catch(()=>{audio.pause();this.voices=this.voices.filter(v=>v.audio!==audio);});
 }
 pause(paused:boolean){for(const v of this.voices){if(paused)v.audio.pause();else if(v.audio.paused&&!v.audio.ended)void v.audio.play().catch(()=>{});}}
 retain(owners:Set<string>){this.voices=this.voices.filter(v=>{if(owners.has(v.owner))return true;v.audio.pause();v.audio.removeAttribute('src');return false;});}
 clear(){for(const v of this.voices){v.audio.pause();v.audio.removeAttribute('src');}this.voices=[];}
}
export function VfxGlyph({definition:d,age,assets}:{definition:VfxDefinition;age:number;assets:Asset[]}){
 const u=Math.max(0,Math.min(1,age/d.duration)),size=d.size,opacity=(1-u)*d.intensity,image=assets.find(a=>a.ref===d.asset);
 if(image)return <image href={image.url} x={-size*.5} y={-size*.5} width={size} height={size} opacity={opacity}/>;
 if(['halo','flash'].includes(d.preset))return <circle r={Math.max(1,size*(.25+u*.25))} fill="none" stroke={d.color} strokeWidth={Math.max(1,size*.06)} opacity={opacity}/>;
 return <g fill={d.color} opacity={opacity}>{Array.from({length:Math.min(64,d.quantity)},(_,i)=>{const a=i*2.399963,r=size*u*(.25+.5*(i*17%31)/31),x=Math.cos(a)*r,y=Math.sin(a)*r+(['dust','leaves'].includes(d.preset)?u*u*size*.4:0);return <circle key={i} cx={x} cy={y} r={Math.max(1,size*.05*(1-u))}/>;})}</g>;
}
