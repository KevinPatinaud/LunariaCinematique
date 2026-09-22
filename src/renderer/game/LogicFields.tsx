import React from 'react';
import type { GameProject } from '../../shared/game/types.js';
import { ACTION_LABELS, BUILTIN_SOUNDS, COMPARISONS, CONDITION_LABELS, newAction, newCondition, type Condition, type LogicAction, type ActionType } from '../../shared/game/logic.js';
import { Num } from './BalanceEditor.js';
export function Select({label,value,change,options}:{label:string;value:string;change:(v:string)=>void;options:{id:string;name:string}[]}){return <label className="gd-field"><span>{label}</span><select aria-label={label} value={value} onChange={e=>change(e.target.value)}>{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>;}
const opts=(map:Record<string,string>)=>Object.entries(map).map(([id,name])=>({id,name}));
export function ConditionEditor({project,value,onChange,actor=false}:{project:GameProject;value:Condition[];onChange:(v:Condition[])=>void;actor?:boolean}){
 const update=(i:number,c:Condition)=>onChange(value.map((x,n)=>n===i?c:x));
 return <div className="logic-conditions"><p className="gd-note">Toutes les conditions doivent être remplies. Sans condition, la règle est toujours autorisée.</p>{value.map((c,i)=><div className="logic-row" key={i}>
 <Select label={'Condition '+(i+1)} value={c.kind} change={kind=>update(i,newCondition(kind as Condition['kind']))} options={opts(CONDITION_LABELS).filter(x=>actor||!['health','target','ready'].includes(x.id))}/>
 {['target','ready'].includes(c.kind)&&<Select label={'Attaque de condition '+(i+1)} value={c.ref} change={ref=>update(i,{...c,ref})} options={[{id:'',name:'Une attaque active'},...project.combat!.abilities]}/>}
 {c.kind==='variable'&&<Select label={'Variable de condition '+(i+1)} value={c.ref} change={ref=>update(i,{...c,ref})} options={[{id:'',name:'Choisir…'},...(project.logic?.variables??[])]}/>}
 {c.kind!=='always'&&<><Select label={'Comparaison '+(i+1)} value={c.op} change={op=>update(i,{...c,op:op as Condition['op']})} options={opts(COMPARISONS)}/><Num label={'Valeur de condition '+(i+1)} value={c.value} min={c.kind==='variable'?-1000000:0} max={['target','ready'].includes(c.kind)?1:c.kind==='health'?100:1000000} change={v=>update(i,{...c,value:v})}/></>}
 <button aria-label={'Supprimer condition '+(i+1)} onClick={()=>onChange(value.filter((_,n)=>n!==i))}>×</button></div>)}<button disabled={value.length>=8} onClick={()=>onChange([...value,newCondition()])}>+ Condition</button></div>;
}
export function ActionEditor({project,value,onChange,self=false}:{project:GameProject;value:LogicAction[];onChange:(v:LogicAction[])=>void;self?:boolean}){
 const patch=(i:number,p:Partial<LogicAction>)=>onChange(value.map((x,n)=>n===i?{...x,...p}:x));
 const reorder=(i:number,d:number)=>{const v=[...value];[v[i],v[i+d]]=[v[i+d],v[i]];onChange(v);};
 return <div className="logic-actions"><p className="gd-note">Actions dans l’ordre. Le délai est ajouté après l’action précédente. Le temps de jeu s’arrête pendant une cinématique.</p>{value.map((a,i)=>{
 const num=(key:keyof LogicAction,label:string,min:number,max:number,integer=false)=><Num label={label+' '+(i+1)} value={Number(a[key])} min={min} max={max} integer={integer} change={v=>patch(i,{[key]:v})}/>;
 return <section className="logic-action" key={i}><div className="logic-row"><b>{i+1}</b><Select label={'Action '+(i+1)} value={a.type} change={v=>{const next=[...value];next[i]={...newAction(v as ActionType,project,self),delay:a.delay};onChange(next);}} options={opts(ACTION_LABELS)}/>{num('delay','Délai avant action (s)',0,120)}<div className="gd-inline"><button aria-label={'Monter action '+(i+1)} disabled={i===0} onClick={()=>reorder(i,-1)}>↑</button><button aria-label={'Descendre action '+(i+1)} disabled={i===value.length-1} onClick={()=>reorder(i,1)}>↓</button><button aria-label={'Supprimer action '+(i+1)} onClick={()=>onChange(value.filter((_,n)=>n!==i))}>×</button></div></div>
 <div className="gd-form-grid">
 {a.type==='message'&&<label className="gd-field"><span>Message {i+1}</span><textarea aria-label={'Message '+(i+1)} rows={2} maxLength={2000} value={a.text} onChange={e=>patch(i,{text:e.target.value})}/></label>}
 {a.type==='cinematic'&&<><Select label={'Cinématique '+(i+1)} value={a.cinematicId!} change={cinematicId=>patch(i,{cinematicId})} options={[{id:'',name:'Choisir un film lié…'},...(project.campaign?.cinematics??[]).map(f=>({id:f.id,name:f.title}))]}/><label className="logic-check"><input type="checkbox" checked={a.skippable} onChange={e=>patch(i,{skippable:e.target.checked})}/>Autoriser le joueur à passer</label></>}
 {a.type==='sound'&&<Select label={'Son '+(i+1)} value={a.sound!} change={sound=>patch(i,{sound})} options={BUILTIN_SOUNDS.map(s=>({id:s,name:s}))}/>}
 {a.type==='shake'&&<>{num('amount','Intensité de secousse (px)',0,20)}{num('duration','Durée (s)',.05,120)}</>}
 {a.type==='spawn'&&<><Select label={'Ennemi à ajouter '+(i+1)} value={a.enemyId!} change={enemyId=>patch(i,{enemyId})} options={project.balance.enemies}/>{num('count','Nombre',1,64,true)}<Select label={'Allée '+(i+1)} value={String(a.lane)} change={v=>patch(i,{lane:Number(v)})} options={[{id:'-1',name:'Aléatoire'},...[0,1,2,3,4].map(n=>({id:String(n),name:'Allée '+(n+1)}))]}/>{num('interval','Intervalle d’apparition (s)',.05,60)}</>}
 {['set_variable','add_variable'].includes(a.type)&&<><Select label={'Variable à modifier '+(i+1)} value={a.variableId!} change={variableId=>patch(i,{variableId})} options={[{id:'',name:'Choisir…'},...(project.logic?.variables??[])]}/>{num('value',project.logic?.variables.find(v=>v.id===a.variableId)?.type==='boolean'?'Valeur (0 = faux, 1 = vrai)':'Valeur',-1000000,1000000)}</>}
 {a.target&&<><Select label={'Cible de l’action '+(i+1)} value={a.target} change={target=>patch(i,{target:target as LogicAction['target'],speciesId:''})} options={[...(self?[{id:'self',name:'Le porteur du comportement'}]:[]),{id:'plants',name:'Plantes alliées'},{id:'enemies',name:'Ennemis'}]}/>{a.target!=='self'&&<Select label={'Espèce ciblée '+(i+1)} value={a.speciesId??''} change={speciesId=>patch(i,{speciesId})} options={[{id:'',name:'Toutes les espèces du camp'},...project.balance[a.target]]}/>}</>}
 {a.abilityId!==undefined&&<Select label={'Attaque de l’action '+(i+1)} value={a.abilityId} change={abilityId=>patch(i,{abilityId})} options={project.combat!.abilities}/>}
 {a.type==='use_ability'&&<p className="gd-note">L’attaque doit être attribuée, prête et disposer d’une cible. Aucun délai de recharge n’est contourné.</p>}
 {a.type==='set_ability'&&<label className="logic-check"><input type="checkbox" checked={a.enabled} onChange={e=>patch(i,{enabled:e.target.checked})}/>Attaque activée</label>}
 {a.type==='apply_effect'&&<Select label={'Résultat à appliquer '+(i+1)} value={a.effectId!} change={effectId=>patch(i,{effectId})} options={project.combat!.effects}/>}
 {a.type==='movement'&&<>{num('speedFactor','Multiplicateur de vitesse',0,3)}{num('attackFactor','Multiplicateur de cadence',.1,3)}{num('duration','Durée temporaire (s)',.05,120)}</>}
 {a.type==='finish'&&<><Select label={'Résultat '+(i+1)} value={a.outcome!} change={outcome=>patch(i,{outcome:outcome as 'won'|'lost'})} options={[{id:'won',name:'Victoire'},{id:'lost',name:'Défaite'}]}/><p className="gd-callout">Cette action force le résultat, même s’il reste des ennemis. Les actions suivantes sont annulées.</p></>}
 {a.type==='start_wave'&&<p className="gd-note">Ne fonctionne qu’entre deux vagues. Ne saute jamais une vague active.</p>}
 </div></section>;
 })}<button disabled={value.length>=32} onClick={()=>onChange([...value,newAction('message',project,self)])}>+ Action</button></div>;
}
