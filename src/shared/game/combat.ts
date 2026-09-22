import { DEFAULT_ABILITY_PRESENTATION, EMPTY_CUE, type AbilityPresentation, type ProjectilePresentation } from '../presentation/types.js';
import { logicReferences } from './logic.js';
import type { GameProject, DamageType } from './types.js';
import { newId } from './types.js';
export const EFFECT_KINDS = ['damage','heal','poison','regeneration','slow','root','stun','weaken','armor_break','damage_boost','protection','cleanse','reward_mark'] as const;
export type EffectKind = typeof EFFECT_KINDS[number];
export const EFFECT_LABELS:Record<EffectKind,string> = {damage:'Dégâts immédiats',heal:'Soin immédiat',poison:'Poison périodique',regeneration:'Régénération',slow:'Ralentissement',root:'Immobilisation',stun:'Étourdissement',weaken:'Affaiblissement',armor_break:'Brise-armure',damage_boost:'Bonus de dégâts temporaire',protection:'Protection temporaire',cleanse:'Purification',reward_mark:'Bonus de recyclage'};
export const BENEFICIAL:EffectKind[]=['heal','regeneration','damage_boost','protection','cleanse'];
export const PERIODIC:EffectKind[]=['poison','regeneration'];
export const INSTANT:EffectKind[]=['damage','heal','cleanse'];
export const FRACTION:EffectKind[]=['slow','weaken','damage_boost','protection'];
export interface EffectDefinition {id:string;name:string;description:string;kind:EffectKind;valueSource:'fixed'|'attack'|'strength';amount:number;damageType:DamageType|'inherit';duration:number;tickInterval:number}
export interface ProjectileDefinition {presentation?:ProjectilePresentation;id:string;name:string;description:string;speed:number;lifetime:number;maxHits:number;hitRadius:number;splashRadius:number;rowRadius:number;color:string;size:number}
export interface AbilityDefinition {presentation?:AbilityPresentation;id:string;name:string;description:string;delivery:'instant'|'projectile';projectileId:string;target:'opponent'|'ally'|'self';selection:'one'|'all';priority:'nearest'|'strongest'|'wounded';rangeSource:'species'|'fixed';range:number;rowRadius:number;cooldownSource:'species'|'fixed';cooldown:number;initialDelay:number;effects:string[]}
export interface CombatCatalog {abilities:AbilityDefinition[];effects:EffectDefinition[];projectiles:ProjectileDefinition[]}
export type CombatSection='abilities'|'effects'|'projectiles';
/** Plain-language summary used by the Studio. The storage contract stays normalized. */
export function attackTypeLabel(ability:AbilityDefinition,catalog:CombatCatalog):string{
 if(ability.target==='ally')return 'Soutien des alliés';
 if(ability.target==='self')return 'Soutien personnel';
 if(ability.delivery==='instant')return ability.selection==='all'?'Attaque de zone immédiate':'Attaque directe';
 const projectile=catalog.projectiles.find(p=>p.id===ability.projectileId);
 if(!projectile)return 'Tir à distance';
 if(projectile.splashRadius>0||projectile.rowRadius>0)return 'Projectile de zone';
 if(projectile.maxHits>1)return 'Projectile traversant';
 return 'Projectile simple';
}
export function newEffect(kind:EffectKind='damage'):EffectDefinition{return {id:newId('fx'),name:EFFECT_LABELS[kind],description:'',kind,valueSource:'fixed',amount:FRACTION.includes(kind) ? .2 : ['root','stun','armor_break','cleanse'].includes(kind) ? 0 : 10,damageType:'inherit',duration:3,tickInterval:1};}
export function newProjectile():ProjectileDefinition{return {presentation:{asset:'',animationId:'',trailVfxId:'',impact:{...EMPTY_CUE,attach:'center'}},id:newId('proj'),name:'Nouveau projectile',description:'',speed:4.8,lifetime:3,maxHits:1,hitRadius:.18,splashRadius:0,rowRadius:0,color:'#d4b88a',size:.09};}
export function newAbility(effectId:string):AbilityDefinition{return {presentation:structuredClone(DEFAULT_ABILITY_PRESENTATION),id:newId('ab'),name:'Nouvelle attaque',description:'',delivery:'instant',projectileId:'',target:'opponent',selection:'one',priority:'nearest',rangeSource:'species',range:5,rowRadius:0,cooldownSource:'species',cooldown:1,initialDelay:.35,effects:[effectId]};}
export function combatReferences(p:GameProject,section:CombatSection,id:string):string[]{
 if(section==='abilities')return [...new Set([...p.balance.plants,...p.balance.enemies].filter(x=>x.ability_ids?.includes(id)).map(x=>x.name).concat(logicReferences(p,'abilities',id)))];
 return [...new Set(p.combat!.abilities.filter(a=>section==='effects'?a.effects.includes(id):a.projectileId===id).map(a=>a.name).concat(section==='effects'?logicReferences(p,'effects',id):[]))];
}
export function deleteCombatItem(p:GameProject,section:CombatSection,id:string):void{
 const refs=combatReferences(p,section,id);if(refs.length)throw Error('Encore utilisé par : '+refs.join(', '));
 if(p.combat![section].length<=1)throw Error('Conserve au moins une entrée dans ce catalogue.');
 const index=p.combat![section].findIndex(x=>x.id===id);if(index>=0)p.combat![section].splice(index,1);
}
/** Values are resolved when a hit is delivered. No level or experience multiplier exists. */
export function effectAmount(effect:EffectDefinition,stats:{attack:number;strength:number},power=1):number{
 const base=effect.valueSource==='fixed'?1:effect.valueSource==='attack'?stats.attack:stats.strength;
 return Math.max(0,effect.amount*base)*(['damage','poison'].includes(effect.kind)?power:1);
}
export function abilityInterval(a:AbilityDefinition,stats:{rate:number}):number{return a.cooldownSource==='species'?stats.rate:a.cooldown;}
export function abilityRange(a:AbilityDefinition,stats:{range:number}):number{return a.rangeSource==='species'?stats.range:a.range;}
