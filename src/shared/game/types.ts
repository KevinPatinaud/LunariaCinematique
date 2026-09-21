import type { PresentationCatalog, SpeciesVisual } from '../presentation/types.js';
import type { LogicCatalog, LevelEvent } from './logic.js';
import type { CombatCatalog } from './combat.js';
import type { OpenResult } from '../model.js';
/** Game authoring contract. Level records contain references, never combat-stat overrides. */
export const DAMAGE_TYPES = ['physical','piercing','toxic','pure'] as const;
export type DamageType = typeof DAMAGE_TYPES[number];
export const DAMAGE_LABELS: Record<DamageType,string> = {physical:'Physique',piercing:'Perforant',toxic:'Toxique',pure:'Pur (ignore les protections)'};
export const CONTINENTS = ['Europe','Afrique','Asie','Océanie','Amériques'] as const;
export const BEHAVIORS = ['projectile','guard','pierce','splash','sniper','spores','thorns','healer','repair','buffer','water','slow','snare','weaken','recycler'] as const;
export type Behavior = typeof BEHAVIORS[number];
export type Resistances = {physical:number;piercing:number;toxic:number};
export interface PlantDefinition {
 animationProfileId?:string;visual?:SpeciesVisual;behaviorId?:string;ability_ids?:string[];id:string;name:string;role:string;description:string;ability:string;personality:string;
 cost:number;cooldown:number;max_hp:number;rate:number;damage:number;range:number;behavior:Behavior;
 effect_radius:number;effect_strength:number;color:string;chapter:number;unlock:number;
 damage_type:DamageType;armor:number;resistances:Resistances;
}
export interface EnemyDefinition {animationProfileId?:string;visual?:SpeciesVisual;behaviorId?:string;ability_ids?:string[];id:string;name:string;hp:number;speed:number;attack:number;leak:number;reward:number;reach:number;damage_type:DamageType;armor:number;resistances:Resistances;special_damage:number}
export const OBJECTIVES = ['defend','escort','repair','water','smog','tide','rescue','containment'] as const;
export const OBJECTIVE_LABELS:Record<typeof OBJECTIVES[number],string>={defend:'Repousser les vagues',escort:'Escorte',repair:'Travaux',water:'Remise en eau',smog:'Refuge',tide:'Refuge des marées',rescue:'Sauvetage',containment:'Confinement'};
export interface SpawnGroup {id:string;enemyId:string;count:number;lane:number;start:number;interval:number}
export interface WaveDefinition {id:string;groups:SpawnGroup[]}
export interface StoryLine {speaker:string;text:string}
export interface OptionalGoal {id:string;title:string;target:number}
export interface LevelDefinition {
 events?:LevelEvent[];id:string;title:string;subtitle:string;act:number;location:string;startingEnergy:number;allowedPlants:string[];
 objective:{type:typeof OBJECTIVES[number];target:number};objectiveText:string;tip:string;waves:WaveDefinition[];
 briefing:StoryLine[];outro:StoryLine[];midDialogue:StoryLine[];midWave:number;optionalGoals:OptionalGoal[];restoration:string;
}
export interface CampaignFilm {id:string;title:string;file:string;documentId:string}
export type CampaignStep = {id:string;kind:'level';levelId:string} | {id:string;kind:'cinematic';cinematicId:string;skippable:boolean};
export interface CampaignSequence {steps:CampaignStep[];cinematics:CampaignFilm[]}
export interface CampaignCheck {films:number;assets:number;steps:number;levels:number;warnings:string[]}
export interface GameProject {schemaVersion:1|2|3|4;presentation?:PresentationCatalog;logic?:LogicCatalog;combat?:CombatCatalog;kind:'lunaria-game-project';id:string;title:string;balance:{plants:PlantDefinition[];enemies:EnemyDefinition[]};levels:LevelDefinition[];campaign?:CampaignSequence}
export interface GameFile {project:GameProject;path:string;token:string}
export interface GameRecent {path:string;title:string;updatedAt:string}
export interface GameBootstrap {recovery:GameProject|null;recent:GameRecent[]}
export interface GameAPI {
 bootstrap():Promise<GameBootstrap>;
 open():Promise<GameFile|null>;openRecent(path:string):Promise<GameFile>;save(project:GameProject,token:string,saveAs:boolean):Promise<GameFile|null>;
 recover(project:GameProject):Promise<void>;clearRecovery():Promise<void>;
 publish(project:GameProject):Promise<{path:string;films?:number;assets?:number;steps?:number}|null>;
 campaignFolder():Promise<string>;
 chooseCampaignFolder():Promise<string|null>;
 addCampaignFilm():Promise<CampaignFilm|null>;
 editCampaignFilm(file:string,documentId:string):Promise<OpenResult>;
 checkCampaign(project:GameProject):Promise<CampaignCheck>;
 presentationUsages(project:GameProject):Promise<{references:Record<string,string[]>;errors:string[]}>;
}
export const newId = (prefix:string) => `${prefix}_${globalThis.crypto.randomUUID().replaceAll('-','').slice(0,12)}`;
export function newLevel(plants:string[], enemyId:string):LevelDefinition {
 return {events:[],id:newId('level'),title:'Nouveau niveau',subtitle:'',act:0,location:'',startingEnergy:520,allowedPlants:plants.slice(0,2),
 objective:{type:'defend',target:0},objectiveText:'Repousser les vagues.',tip:'',waves:[{id:newId('wave'),groups:[{id:newId('group'),enemyId,count:5,lane:-1,start:.25,interval:3.5}]}],
 briefing:[],outro:[],midDialogue:[],midWave:0,optionalGoals:[],restoration:''};
}
export function cloneLevel(level:LevelDefinition):LevelDefinition {
 const copy=structuredClone(level);copy.id=newId('level');copy.title=(copy.title+' — copie').slice(0,160);
 for(const event of copy.events??[])event.id=newId('event');
 for(const wave of copy.waves){wave.id=newId('wave');for(const group of wave.groups)group.id=newId('group');}return copy;
}
export const totalEnemies = (level:LevelDefinition) => level.waves.reduce((sum,w)=>sum+w.groups.reduce((n,g)=>n+g.count,0),0);
export function waveSchedule(wave:WaveDefinition):{at:number;enemyId:string;lane:number;groupId:string}[]{
 return wave.groups.flatMap(g=>Array.from({length:g.count},(_,i)=>({at:g.start+i*g.interval,enemyId:g.enemyId,lane:g.lane,groupId:g.id}))).sort((a,b)=>a.at-b.at);
}
/** Shared calibration formula. Status effects are applied separately by the combat engine. */
export function damageAfterProtection(amount:number,type:DamageType,target:{armor:number;resistances:Resistances},armorBroken=false):number{
 const base=Math.max(0,amount);
 if(type==='pure')return base;
 return base*(1-target.resistances[type])*(type==='physical'&&!armorBroken?1-target.armor:1);
}

/** Keep the authored mid-scene attached to its wave after insertion/deletion.
 * Removing its wave disables that trigger instead of silently selecting another.
 */
export function replaceWaves(level:LevelDefinition,waves:WaveDefinition[]):Pick<LevelDefinition,'waves'|'midWave'|'events'> {
 const triggerId=level.waves[level.midWave-1]?.id;
 return {waves,midWave:triggerId?waves.findIndex(w=>w.id===triggerId)+1:0,...(level.events?{events:level.events.map(event=>{if(!['wave_start','wave_end'].includes(event.trigger.kind)||event.trigger.value===0)return event;const id=level.waves[event.trigger.value-1]?.id,index=waves.findIndex(w=>w.id===id);return {...event,enabled:index<0?false:event.enabled,trigger:{...event.trigger,value:index<0?0:index+1}};})}:{})};
}
