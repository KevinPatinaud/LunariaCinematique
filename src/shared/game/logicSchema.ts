import type { Rule } from './schema.js';
const str=(max=120,min=0):Rule=>({type:'string',minLength:min,maxLength:max});
const id:Rule={...str(100,1),pattern:'^[a-zA-Z0-9_-]+$'};
const emptyId:Rule={...str(100),pattern:'^[a-zA-Z0-9_-]*$'};
const n=(minimum:number,maximum:number,int=false):Rule=>({type:'number',minimum,maximum,...(int?{multipleOf:1}:{})});
const e=(...v:string[]):Rule=>({type:'string',enum:v});
const b:Rule={type:'boolean'};
const a=(items:Rule,maxItems=64,minItems=0):Rule=>({type:'array',minItems,maxItems,items});
const o=(properties:Record<string,Rule>,required=Object.keys(properties)):Rule=>({type:'object',properties,required,additionalProperties:false});
export const CONDITION_SCHEMA=o({kind:e('always','health','target','ready','time','wave','enemies','energy','variable'),op:e('eq','ne','lt','lte','gt','gte'),value:n(-1000000,1000000),ref:emptyId});
export const ACTION_SCHEMA=o({type:e('message','cinematic','sound','shake','spawn','set_variable','add_variable','use_ability','set_ability','apply_effect','movement','start_wave','finish'),delay:n(0,120),text:str(2000,1),cinematicId:id,skippable:b,sound:e('plant','shoot','recycle','wave','rain','rescue','victory','defeat','uproot','click'),amount:n(0,20),duration:n(.05,120),enemyId:id,count:n(1,64,true),lane:n(-1,4,true),interval:n(.05,60),variableId:id,value:n(-1000000,1000000),target:e('self','plants','enemies'),speciesId:emptyId,abilityId:id,enabled:b,effectId:id,speedFactor:n(0,3),attackFactor:n(.1,3),outcome:e('won','lost')},['type','delay']);
export const BEHAVIOR_SCHEMA=o({id,name:str(120,1),description:str(1000),team:e('plants','enemies'),mode:e('automatic','priority'),fallback:e('advance','hold','retreat'),stopToAttack:b,rules:a(o({id,name:str(120,1),conditions:a(CONDITION_SCHEMA,8),action:e('ability','advance','hold','retreat'),abilityId:emptyId}),32),phases:a(o({id,name:str(120,1),healthBelow:n(0,100),speedFactor:n(0,3),attackFactor:n(.1,3),inheritAbilities:b,abilityIds:a(id,8),onEnter:a(ACTION_SCHEMA,32)}),8,1)});
export const EVENT_SCHEMA=o({id,name:str(120,1),enabled:b,trigger:o({kind:e('level_start','time','interval','wave_start','wave_end','spawn','death','health','ability_used','variable','enemies'),value:n(-1000000,1000000),ref:emptyId}),conditions:a(CONDITION_SCHEMA,8),actions:a(ACTION_SCHEMA,32,1),once:b,cooldown:n(.1,3600),maxExecutions:n(1,1000,true)});
export const LOGIC_SCHEMA=o({behaviors:a(BEHAVIOR_SCHEMA,128,1),variables:a(o({id,name:str(120,1),description:str(1000),scope:e('level','campaign'),type:e('number','boolean'),initial:n(-1000000,1000000),minimum:n(-1000000,1000000),maximum:n(-1000000,1000000)}),128)});
export function extendLogicSchema(schema:Rule):void{
 schema.properties!.schemaVersion={type:'number',enum:[1,2,3],multipleOf:1};schema.properties!.logic=LOGIC_SCHEMA;
 for(const team of ['plants','enemies'])schema.properties!.balance.properties![team].items!.properties!.behaviorId=id;
 schema.properties!.levels.items!.properties!.events=a(EVENT_SCHEMA,128);
}
