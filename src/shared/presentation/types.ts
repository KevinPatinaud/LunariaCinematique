import type { AssetRef } from '../model.js';
export const BASE_SLOTS=['idle','move','attack','hit','death','spawn','victory'] as const;
export const SLOT_LABELS:Record<string,string>={idle:'Attente',move:'Déplacement',attack:'Attaque',hit:'Touché',death:'Mort',spawn:'Apparition',victory:'Victoire',phase_transition:'Transition de phase'};
export const MOTIONS=['none','breath','sway','bounce','shake','recoil','spin','pulse','fade_in','fade_out'] as const;
export type Attachment='center'|'feet'|'head'|'launch';
export type PresentationEvent='spawn'|'start'|'release'|'impact'|'death'|'phase_transition';
export interface Point {x:number;y:number}
export interface Region {x:number;y:number;width:number;height:number}
export interface SpriteSource {asset:AssetRef;region?:Region;anchor?:Point}
export interface AnimationFrame extends SpriteSource {duration:number}
export interface LocalTransform {x:number;y:number;rotation:number;scaleX:number;scaleY:number;opacity:number}
export interface AnimationMarker {id:string;at:number;type:'release'|'sound'|'vfx';ref:string;attach:Attachment}
export interface AnimationDefinition {
 id:string;name:string;kind:'frames'|'procedural'|'combined';frames:AnimationFrame[];duration:number;loop:boolean;
 /** Empty means explicitly shared; absent keeps older projects classified by their profile links. */
 ownerSpeciesId?:string;
 anchor:Point;transform:LocalTransform;motion:{preset:typeof MOTIONS[number];amplitude:number;period:number};
 attachments:{id:Attachment;x:number;y:number}[];markers:AnimationMarker[];
}
export interface Cue {soundId:string;vfxId:string;attach:Attachment}
export interface EventCue extends Cue {event:PresentationEvent}
/** An absent slot inherits the default profile; an empty animationId explicitly disables an optional slot. */
export interface AnimationProfile {id:string;name:string;slots:{slot:string;animationId:string}[];events:EventCue[]}
export interface SpeciesVisual {sprite:SpriteSource;width:number;height:number;baseline:number;mirror:boolean;tint:string;note:string}
export interface SoundDefinition {id:string;name:string;asset:AssetRef;bus:'sfx'|'music'|'ambience';volume:number;loop:boolean;pitchVariation:number;maxInstances:number}
export interface VfxDefinition {id:string;name:string;preset:'impact'|'dust'|'leaves'|'halo'|'flash'|'explosion'|'trail';duration:number;size:number;color:string;intensity:number;quantity:number;asset:AssetRef|'';attach:Attachment;maxInstances:number}
export interface AbilityPresentation {slot:string;release:'marker'|'delay'|'immediate';delay:number;fitCadence:boolean;start:Cue;releaseCue:Cue;impact:Cue}
export interface ProjectilePresentation {asset:AssetRef|'';animationId:string;trailVfxId:string;impact:Cue}
export interface PresentationCatalog {version:1;defaultProfileId:string;animations:AnimationDefinition[];profiles:AnimationProfile[];audio:SoundDefinition[];vfx:VfxDefinition[]}
export type PresentationSection='animations'|'profiles'|'audio'|'vfx';
/** Explicit link to ONE game project. Films never embed a mutable copy of its catalogs. */
export interface CatalogLink {projectId:string;file:string}
export interface ActorAnimation {mode:'animation'|'species';animationId:string;speciesId:string;slot:string;speed:number}
export const EMPTY_CUE: Cue={soundId:'',vfxId:'',attach:'launch'};
export const DEFAULT_ABILITY_PRESENTATION:AbilityPresentation={slot:'attack',release:'marker',delay:0,fitCadence:true,start:{...EMPTY_CUE},releaseCue:{...EMPTY_CUE},impact:{...EMPTY_CUE,attach:'center'}};
export const IDENTITY:LocalTransform={x:0,y:0,rotation:0,scaleX:1,scaleY:1,opacity:1};
