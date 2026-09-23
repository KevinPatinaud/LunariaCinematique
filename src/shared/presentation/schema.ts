import type { Rule } from '../game/schema.js';
const num=(minimum:number,maximum:number,integer=false):Rule=>({type:'number',minimum,maximum,...(integer?{multipleOf:1}:{})});
const str=(maxLength=120,minLength=0):Rule=>({type:'string',minLength,maxLength});
const id={...str(100,1),pattern:'^[a-zA-Z0-9_-]+$'},optionalId={...id,minLength:0,pattern:'^[a-zA-Z0-9_-]*$'};
const en=(...values:string[]):Rule=>({type:'string',enum:values});const bool:Rule={type:'boolean'};
const obj=(properties:Record<string,Rule>,optional:string[]=[]):Rule=>({type:'object',additionalProperties:false,required:Object.keys(properties).filter(k=>!optional.includes(k)),properties});
const array=(items:Rule,maxItems=512,minItems=0):Rule=>({type:'array',items,minItems,maxItems});
const point=obj({x:num(-2,3),y:num(-2,3)}),attachment=en('center','feet','head','launch');
const ref:Rule={...str(1024,11),pattern:'^library://[^\\\\\\u0000-\\u001f:?#]+$'};
const optionalRef:Rule={...str(1024),pattern:'^(library://[^\\\\\\u0000-\\u001f:?#]+)?$'};
export const SPRITE_SCHEMA=obj({asset:ref,region:obj({x:num(0,32768,true),y:num(0,32768,true),width:num(1,32768,true),height:num(1,32768,true)}),anchor:point},['region','anchor']);
const frame=structuredClone(SPRITE_SCHEMA);frame.properties!.duration=num(.01,60);frame.required!.push('duration');
export const CUE_SCHEMA=obj({soundId:optionalId,vfxId:optionalId,attach:attachment});
const event=obj({...CUE_SCHEMA.properties,event:en('spawn','start','release','impact','death','phase_transition')});
export const ANIMATION_SCHEMA=obj({id,name:str(160,1),ownerSpeciesId:optionalId,kind:en('frames','procedural','combined'),frames:array(frame,512),duration:num(.01,120),loop:bool,anchor:point,
 transform:obj({x:num(-200,200),y:num(-200,200),rotation:num(-720,720),scaleX:num(.01,5),scaleY:num(.01,5),opacity:num(0,1)}),
 motion:obj({preset:en('none','breath','sway','bounce','shake','recoil','spin','pulse','fade_in','fade_out'),amplitude:num(0,5),period:num(.05,120)}),
 attachments:array(obj({id:attachment,x:num(-2,3),y:num(-2,3)}),4),markers:array(obj({id,at:num(0,120),type:en('release','sound','vfx'),ref:optionalId,attach:attachment}),64)},['ownerSpeciesId']);
export const PRESENTATION_SCHEMA=obj({version:{const:1},defaultProfileId:id,animations:array(ANIMATION_SCHEMA),profiles:array(obj({id,name:str(160,1),slots:array(obj({slot:id,animationId:optionalId}),32),events:array(event,6)}),128,1),
 audio:array(obj({id,name:str(160,1),asset:ref,bus:en('sfx','music','ambience'),volume:num(0,1),loop:bool,pitchVariation:num(0,.2),maxInstances:num(1,32,true)}),256),
 vfx:array(obj({id,name:str(160,1),preset:en('impact','dust','leaves','halo','flash','explosion','trail'),duration:num(.01,10),size:num(1,300),color:{...str(7,7),pattern:'^#[0-9a-fA-F]{6}$'},intensity:num(0,1),quantity:num(1,64,true),asset:optionalRef,attach:attachment,maxInstances:num(1,128,true)}),256)});
export const VISUAL_SCHEMA=obj({sprite:SPRITE_SCHEMA,width:num(1,400),height:num(1,400),baseline:num(-100,100),mirror:bool,tint:{...str(7,7),pattern:'^#[0-9a-fA-F]{6}$'},note:str(1000)});
export const ABILITY_PRESENTATION_SCHEMA=obj({slot:id,release:en('marker','delay','immediate'),delay:num(0,120),fitCadence:bool,start:CUE_SCHEMA,releaseCue:CUE_SCHEMA,impact:CUE_SCHEMA});
export const PROJECTILE_PRESENTATION_SCHEMA=obj({asset:optionalRef,animationId:optionalId,trailVfxId:optionalId,impact:CUE_SCHEMA});
export const ACTOR_ANIMATION_SCHEMA=obj({mode:en('animation','species'),animationId:optionalId,speciesId:optionalId,slot:id,speed:num(.05,10)});
export const CATALOG_LINK_SCHEMA=obj({projectId:id,file:str(1024)});
export function extendPresentationSchema(schema:Rule){
 schema.properties!.schemaVersion={type:'number',enum:[1,2,3,4],multipleOf:1};schema.properties!.presentation=PRESENTATION_SCHEMA;
 for(const team of ['plants','enemies'])Object.assign(schema.properties!.balance.properties![team].items!.properties!,{animationProfileId:id,visual:VISUAL_SCHEMA});
 schema.properties!.combat.properties!.abilities.items!.properties!.presentation=ABILITY_PRESENTATION_SCHEMA;
 schema.properties!.combat.properties!.projectiles.items!.properties!.presentation=PROJECTILE_PRESENTATION_SCHEMA;
}
