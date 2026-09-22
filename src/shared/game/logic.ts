import type { GameProject } from './types.js';
import { newId } from './types.js';
/** Bounded data-only rules. No source code, eval, recursion or executable expression. */
export type Team = 'plants'|'enemies';
export type Compare = 'eq'|'ne'|'lt'|'lte'|'gt'|'gte';
export type ConditionKind = 'always'|'health'|'target'|'ready'|'time'|'wave'|'enemies'|'energy'|'variable';
export interface Condition {kind:ConditionKind;op:Compare;value:number;ref:string}
export const CONDITION_LABELS:Record<ConditionKind,string>={always:'Toujours',health:'PV du porteur (%)',target:'Cible à portée',ready:'Attaque prête',time:'Temps de combat (s)',wave:'Numéro de vague',enemies:'Ennemis vivants',energy:'Graines',variable:'Variable'};
export const COMPARISONS:Record<Compare,string>={eq:'=',ne:'≠',lt:'<',lte:'≤',gt:'>',gte:'≥'};
export type Movement = 'advance'|'hold'|'retreat';
export const MOVEMENTS:Record<Movement,string>={advance:'Avancer vers le jardin',hold:'Rester immobile',retreat:'Reculer (sans sortir du plateau)'};
export interface VariableDefinition {id:string;name:string;description:string;scope:'level'|'campaign';type:'number'|'boolean';initial:number;minimum:number;maximum:number}
export const ACTION_LABELS={message:'Afficher un message',cinematic:'Jouer une cinématique',sound:'Jouer un son',shake:'Secouer la caméra',spawn:'Faire apparaître des ennemis',set_variable:'Définir une variable',add_variable:'Ajouter à une variable',use_ability:'Demander une attaque',set_ability:'Activer / désactiver une attaque',apply_effect:'Appliquer un résultat d’attaque',movement:'Modifier déplacement / cadence',start_wave:'Lancer la prochaine vague',finish:'Terminer le niveau'} as const;
export type ActionType=keyof typeof ACTION_LABELS;
export interface LogicAction {type:ActionType;delay:number;text?:string;cinematicId?:string;skippable?:boolean;sound?:string;amount?:number;duration?:number;enemyId?:string;count?:number;lane?:number;interval?:number;variableId?:string;value?:number;target?:'self'|Team;speciesId?:string;abilityId?:string;enabled?:boolean;effectId?:string;speedFactor?:number;attackFactor?:number;outcome?:'won'|'lost'}
export interface BehaviorRule {id:string;name:string;conditions:Condition[];action:'ability'|Movement;abilityId:string}
export interface BehaviorPhase {id:string;name:string;healthBelow:number;speedFactor:number;attackFactor:number;inheritAbilities:boolean;abilityIds:string[];onEnter:LogicAction[]}
export interface BehaviorDefinition {id:string;name:string;description:string;team:Team;mode:'automatic'|'priority';fallback:Movement;stopToAttack:boolean;rules:BehaviorRule[];phases:BehaviorPhase[]}
export const TRIGGER_LABELS={level_start:'Début du combat',time:'Après un délai',interval:'À intervalle régulier',wave_start:'Début de vague',wave_end:'Fin de vague',spawn:'Apparition d’une entité',death:'Mort d’une entité',health:'PV d’un ennemi sous un seuil',ability_used:'Attaque utilisée',variable:'Condition sur une variable',enemies:'Ennemis restants'} as const;
export interface Trigger {kind:keyof typeof TRIGGER_LABELS;value:number;ref:string}
export interface LevelEvent {id:string;name:string;enabled:boolean;trigger:Trigger;conditions:Condition[];actions:LogicAction[];once:boolean;cooldown:number;maxExecutions:number}
export interface LogicCatalog {behaviors:BehaviorDefinition[];variables:VariableDefinition[]}
export const BUILTIN_SOUNDS=['plant','shoot','recycle','wave','rain','rescue','victory','defeat','uproot','click'] as const;
export function newCondition(kind:ConditionKind='always'):Condition{return {kind,op:kind==='health'?'lte':'gte',value:kind==='health'?30:kind==='always'?0:1,ref:''};}
export function newVariable():VariableDefinition{return {id:newId('var'),name:'Nouvelle variable',description:'',scope:'level',type:'number',initial:0,minimum:0,maximum:100};}
export function newRule():BehaviorRule{return {id:newId('rule'),name:'Utiliser une attaque disponible',conditions:[],action:'ability',abilityId:''};}
export function newPhase(index=0):BehaviorPhase{return {id:newId('phase'),name:'Phase '+(index+1),healthBelow:index===0?100:Math.max(0,100-index*33),speedFactor:1,attackFactor:1,inheritAbilities:true,abilityIds:[],onEnter:[]};}
export function newBehavior(team:Team='enemies'):BehaviorDefinition{return {id:newId('ai'),name:team==='plants'?'Défenseur immobile':'Nouveau comportement',description:'',team,mode:'automatic',fallback:team==='plants'?'hold':'advance',stopToAttack:true,rules:[],phases:[newPhase()]};}
export function newEvent():LevelEvent{return {id:newId('event'),name:'Nouvel événement',enabled:true,trigger:{kind:'time',value:10,ref:''},conditions:[],actions:[{type:'message',delay:0,text:'Les renforts arrivent !'}],once:true,cooldown:1,maxExecutions:10};}
export function newAction(type:ActionType,project:GameProject,self=false):LogicAction{
 const common={type,delay:0},target=self?'self' as const:'enemies' as const;
 switch(type){
 case 'message':return {...common,text:'Nouvel événement !'};
 case 'cinematic':return {...common,cinematicId:project.campaign?.cinematics[0]?.id??'',skippable:true};
 case 'sound':return {...common,sound:'wave'};
 case 'shake':return {...common,amount:5,duration:.4};
 case 'spawn':return {...common,enemyId:project.balance.enemies[0].id,count:3,lane:-1,interval:1};
 case 'set_variable':case 'add_variable':return {...common,variableId:project.logic?.variables[0]?.id??'',value:1};
 case 'use_ability':return {...common,target,speciesId:'',abilityId:project.combat?.abilities[0]?.id??''};
 case 'set_ability':return {...common,target,speciesId:'',abilityId:project.combat?.abilities[0]?.id??'',enabled:true};
 case 'apply_effect':return {...common,target,speciesId:'',effectId:project.combat?.effects[0]?.id??''};
 case 'movement':return {...common,target,speciesId:'',speedFactor:1.25,attackFactor:1.2,duration:5};
 case 'finish':return {...common,outcome:'won'};
 default:return common;
 }
}
export function possibleAbilities(p:GameProject,species:{ability_ids?:string[];behaviorId?:string}):string[]{
 const behavior=p.logic?.behaviors.find(b=>b.id===species.behaviorId);
 return [...new Set([...(species.ability_ids??[]),...(behavior?.phases.flatMap(f=>f.abilityIds)??[])])];
}
export function behaviorReferences(p:GameProject,id:string):string[]{return [...p.balance.plants,...p.balance.enemies].filter(s=>s.behaviorId===id).map(s=>s.name);}
export function allActions(p:GameProject):LogicAction[]{return [...(p.logic?.behaviors.flatMap(b=>b.phases.flatMap(f=>f.onEnter))??[]),...p.levels.flatMap(l=>(l.events??[]).flatMap(e=>e.actions))];}
export function logicFilmIds(p:GameProject):string[]{return [...new Set(allActions(p).filter(a=>a.type==='cinematic').map(a=>a.cinematicId!))];}
export function logicReferences(p:GameProject,kind:'abilities'|'effects'|'variables',id:string):string[]{
 const refs:string[]=[];
 for(const b of p.logic?.behaviors??[]){
  if(kind==='abilities'&&(b.phases.some(f=>f.abilityIds.includes(id))||b.rules.some(r=>r.abilityId===id||r.conditions.some(c=>['ready','target'].includes(c.kind)&&c.ref===id))))refs.push(b.name);
  if(kind==='variables'&&b.rules.some(r=>r.conditions.some(c=>c.kind==='variable'&&c.ref===id)))refs.push(b.name);
  if(b.phases.some(f=>f.onEnter.some(a=>actionReferences(a,kind,id))))refs.push(b.name);
 }
 for(const l of p.levels)for(const e of l.events??[]){
  if(e.actions.some(a=>actionReferences(a,kind,id))||e.conditions.some(c=>c.ref===id&&(kind==='variables'?c.kind==='variable':['ready','target'].includes(c.kind)))||(e.trigger.ref===id&&(kind==='variables'?e.trigger.kind==='variable':e.trigger.kind==='ability_used')))refs.push(l.title+' / '+e.name);
 }return [...new Set(refs)];
}
function actionReferences(a:LogicAction,kind:string,id:string){return kind==='variables'?a.variableId===id:kind==='abilities'?a.abilityId===id:a.effectId===id;}
/** Pure evaluator shared by authoring diagnostics, simulator and tests. Bool variables are 0/1. */
export interface LogicContext {health:number;time:number;wave:number;enemies:number;energy:number;variables:Record<string,number>;ready:(id:string)=>boolean;target:(id:string)=>boolean;hostile?:(id:string)=>boolean}
export function compare(a:number,op:Compare,b:number):boolean {switch(op){case 'eq':return a===b;case 'ne':return a!==b;case 'lt':return a<b;case 'lte':return a<=b;case 'gt':return a>b;case 'gte':return a>=b;}}
export function conditionsMatch(conditions:Condition[],ctx:LogicContext):boolean{return conditions.every(c=>{
 if(c.kind==='always')return true;
 const n=c.kind==='variable'?ctx.variables[c.ref]:c.kind==='ready'?Number(ctx.ready(c.ref)):c.kind==='target'?Number(ctx.target(c.ref)):ctx[c.kind];
 return typeof n==='number'&&Number.isFinite(n)&&compare(n,c.op,c.value);
});}
export function selectPhase(behavior:BehaviorDefinition,health:number,previous=0):number{let index=previous;for(let i=previous+1;i<behavior.phases.length;i++)if(health<=behavior.phases[i].healthBelow)index=i;return index;}
export function chooseRule(behavior:BehaviorDefinition,ctx:LogicContext,candidates:string[]):{movement:Movement;abilities:string[];ruleId:string}{
 if(behavior.mode==='automatic'){const ready=candidates.filter(id=>ctx.ready(id)&&ctx.target(id));return {movement:behavior.stopToAttack&&candidates.some(id=>ctx.target(id)&&(ctx.hostile?.(id)??true))?'hold':behavior.fallback,abilities:ready,ruleId:''};}
 for(const rule of behavior.rules){
  if(!conditionsMatch(rule.conditions,ctx))continue;
  if(rule.action==='ability'){
   const choices=(rule.abilityId?[rule.abilityId]:candidates).filter(id=>candidates.includes(id)&&ctx.ready(id)&&ctx.target(id));
   if(choices.length)return {movement:behavior.stopToAttack&&(ctx.hostile?.(choices[0])??true)?'hold':behavior.fallback,abilities:[choices[0]],ruleId:rule.id};
  }else return {movement:rule.action,abilities:[],ruleId:rule.id};
 }
 return {movement:behavior.fallback,abilities:[],ruleId:''};
}
export function initialVariables(p:GameProject,scope:'level'|'campaign'):Record<string,number>{return Object.fromEntries((p.logic?.variables??[]).filter(v=>v.scope===scope).map(v=>[v.id,v.initial]));}
export function applyVariable(def:VariableDefinition,current:number,value:number,add=false):number{const next=add?current+value:value;return def.type==='boolean'?(next?1:0):Math.max(def.minimum,Math.min(def.maximum,next));}
