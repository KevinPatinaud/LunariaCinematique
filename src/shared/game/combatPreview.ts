import type { GameProject, DamageType } from './types.js';
import { damageAfterProtection } from './types.js';
import { effectAmount, abilityInterval, abilityRange, type AbilityDefinition } from './combat.js';
export interface PreviewRow {at:number;label:string;raw:number;effective:number;hp:number}
export interface AbilityPreview {rows:PreviewRow[];interval:number;range:number;maxHp:number;remainingHp:number;notes:string[]}
/** Single-target algebraic probe, NOT a second game simulator or win predictor. */
export function previewAbility(p:GameProject,ability:AbilityDefinition,sourceId:string,targetId:string):AbilityPreview{
 const source=p.balance.plants.find(x=>x.id===sourceId)??p.balance.enemies.find(x=>x.id===sourceId);
 const target=p.balance.plants.find(x=>x.id===targetId)??p.balance.enemies.find(x=>x.id===targetId);
 if(!source||!target)throw Error('Choisis une espèce du catalogue.');
 const stats={attack:'damage' in source?source.damage:source.attack,strength:'effect_strength' in source?source.effect_strength:1,rate:'rate' in source?source.rate:1,range:'range' in source?source.range:source.reach};
 const maxHp='max_hp' in target?target.max_hp:target.hp;let hp=maxHp,brokenUntil=0;
 const notes:string[]=[],events:{at:number;order:number;label:string;amount:number;type:DamageType;kind:string;duration:number}[]=[];
 for(const [order,id] of ability.effects.entries()){
  const e=p.combat?.effects.find(x=>x.id===id);if(!e){notes.push('Effet absent : '+id);continue;}
  const amount=effectAmount(e,stats),type=e.damageType==='inherit'?source.damage_type:e.damageType;
  if(['damage','heal','armor_break'].includes(e.kind))events.push({at:0,order,label:e.name,amount,type,kind:e.kind,duration:e.duration});
  else if(['poison','regeneration'].includes(e.kind))for(let i=1;i*e.tickInterval<=e.duration+1e-8;i++)events.push({at:i*e.tickInterval,order,label:e.name,amount,type,kind:e.kind,duration:e.duration});
  else notes.push(`${e.name} : ${e.duration} s`);
 }
 const rows:PreviewRow[]=[];
 for(const e of events.sort((a,b)=>a.at-b.at||a.order-b.order)){
  if(e.kind==='armor_break'){brokenUntil=Math.max(brokenUntil,e.at+e.duration);notes.push('Armure ignorée pour les effets suivants de cette utilisation.');continue;}
  // This probe intentionally excludes interactions between expiring statuses and other casts.
  if(hp<=0)break;
  const healing=['heal','regeneration'].includes(e.kind);const actual=healing?Math.min(maxHp-hp,e.amount):Math.min(hp,damageAfterProtection(e.amount,e.type,target,e.at<brokenUntil));
  hp=Math.min(maxHp,Math.max(0,hp+(healing?actual:-actual)));rows.push({at:e.at,label:e.label,raw:e.amount,effective:actual,hp});
 }
 return {rows,interval:abilityInterval(ability,stats),range:abilityRange(ability,stats),maxHp,remainingHp:hp,notes};
}
