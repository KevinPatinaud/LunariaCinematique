import React from 'react';
import {SpeciesAnimations} from '../presentation/SpeciesAnimations.js';
import type {Change} from '../presentation/PresentationEditor.js';
import type {Asset} from '../../shared/model.js';
import { DAMAGE_LABELS, DAMAGE_TYPES, type PlantDefinition, type EnemyDefinition, type GameProject } from '../../shared/game/types.js';
import { NumberInput } from '../components/NumberInput.js';
export function Num({label,value,min=0,max,integer=false,change}:{label:string;value:number;min?:number;max:number;integer?:boolean;change:(v:number)=>void}){
 return <label className="gd-field"><span>{label}</span><NumberInput label={label} value={value} min={min} max={max} onCommit={n=>change(integer?Math.round(n):n)}/></label>;
}
export function BalanceEditor({project,role,id,select,update,editAbility,editBehavior,assets,change,openAnimation,openProfile}:{assets:Asset[];change:Change;openAnimation:(id:string)=>void;openProfile:(id:string)=>void;editBehavior:(id:string)=>void;editAbility:(id:string)=>void;project:GameProject;role:'plants'|'enemies';id:string;select:(id:string)=>void;update:(id:string,patch:Partial<PlantDefinition&EnemyDefinition>,key:string)=>void}){
 const list=project.balance[role], item=list.find(x=>x.id===id)??list[0], plant=role==='plants';
 const uses=project.levels.filter(l=>plant?l.allowedPlants.includes(item.id):l.waves.some(w=>w.groups.some(g=>g.enemyId===item.id))).length;
 const set=(key:string,value:unknown)=>update(item.id,{[key]:value},`${item.id}:${key}`);
 const n=(key:string,label:string,max:number,min=0,integer=false)=><Num key={key} label={label} value={Number((item as unknown as Record<string,unknown>)[key])} min={min} max={max} integer={integer} change={v=>set(key,v)}/>;
 return <div className="gd-balance">
  <aside className="gd-catalog" aria-label={plant?'Catalogue des plantes':'Catalogue des ennemis'}>{list.map(x=><button key={x.id} className={x.id===item.id?'selected':''} onClick={()=>select(x.id)}><b>{x.name}</b><small>{x.id}</small></button>)}</aside>
  <section className="gd-scroll gd-balance-form" key={item.id}>
   <div className="gd-kicker">CATALOGUE GLOBAL · {plant?'PLANTE ALLIÉE':'ENNEMI'}</div><h1>{item.name}</h1>
   <p className="gd-callout">Ce réglage est partagé par <strong>tous les niveaux</strong>. Cette espèce est utilisée dans {uses} niveau{uses>1?'x':''}. Aucun niveau ne peut remplacer ces valeurs.</p>
   <div className="gd-form-grid">
    <label className="gd-field"><span>Nom affiché</span><input aria-label="Nom de l’espèce" maxLength={80} value={item.name} onChange={e=>set('name',e.target.value)}/></label>
    <label className="gd-field"><span>Type de dégâts</span><select aria-label="Type de dégâts" value={item.damage_type} onChange={e=>set('damage_type',e.target.value)}>{DAMAGE_TYPES.map(x=><option key={x} value={x}>{DAMAGE_LABELS[x]}</option>)}</select></label>
    {plant?<>{n('max_hp','Points de vie',6000,1,true)}{n('damage','Dégâts par attaque',600,0,true)}{n('rate','Intervalle entre attaques (s)',15,.1)}{n('range','Portée (cases)',12)}{n('cost','Coût en graines',10000,0,true)}{n('cooldown','Recharge de plantation (s)',120)}
     {n('effect_strength','Puissance des effets (multiplicateur)',5)}
     <label className="gd-field"><span>Capacité (libellé)</span><input maxLength={160} value={(item as PlantDefinition).ability} onChange={e=>set('ability',e.target.value)}/></label>
    </>:<>{n('hp','Points de vie',20000,1,true)}{n('attack','Attaque de base (PV)' ,200,0,true)}{n('speed','Vitesse (cases/s)',2,item.id==='thorn_knot'?0:.01)}{n('reach','Portée de contact (cases)',9)}{n('leak','Dégâts au jardin en cas de fuite',100,0,true)}{n('reward','Graines au recyclage',400,0,true)}
     
    </>}
   </div>
   <SpeciesAnimations project={project} id={item.id} assets={assets} change={change} openAnimation={openAnimation} openProfile={openProfile}/>
   <h2>Comportement</h2><div className="gd-inline"><label className="gd-field"><span>Comportement attribué</span><select aria-label="Comportement attribué" value={item.behaviorId??''} onChange={e=>set('behaviorId',e.target.value)}>{project.logic!.behaviors.filter(b=>b.team===role).map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label><button onClick={()=>editBehavior(item.behaviorId!)}>Éditer les règles et phases →</button></div><h2>Capacités attribuées</h2><p>Chaque capacité possède son propre délai. Une définition partagée se règle une seule fois pour toutes les espèces qui l’utilisent.</p>
   <div className="gd-effect-chain">{(item.ability_ids??[]).map((aid,i)=><div key={aid}><b>{i+1}</b><button onClick={()=>editAbility(aid)}>{project.combat!.abilities.find(a=>a.id===aid)?.name??aid} →</button><button aria-label={'Retirer capacité '+(i+1)} onClick={()=>set('ability_ids',item.ability_ids!.filter(id=>id!==aid))}>×</button></div>)}</div>
   <label className="gd-field"><span>Ajouter une capacité</span><select aria-label="Ajouter une capacité à l’espèce" value="" onChange={e=>{if(e.target.value&&(item.ability_ids?.length??0)<8)set('ability_ids',[...(item.ability_ids??[]),e.target.value]);}}><option value="">Choisir dans le catalogue global…</option>{project.combat!.abilities.filter(a=>!item.ability_ids?.includes(a.id)).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
   <h2>Protections</h2><p>Le perforant et le toxique ignorent l’armure, mais pas leur résistance. Le type pur ignore les deux.</p>
   <div className="gd-form-grid">
    <Num label="Armure physique (%)" value={item.armor*100} max={95} change={v=>set('armor',v/100)}/>
    {(['physical','piercing','toxic'] as const).map(x=><Num key={x} label={`Résistance ${DAMAGE_LABELS[x].toLowerCase()} (%)`} value={item.resistances[x]*100} max={95} change={v=>set('resistances',{...item.resistances,[x]:v/100})}/>)}
   </div>
   {plant&&<label className="gd-field"><span>Description</span><textarea maxLength={1000} rows={3} value={(item as PlantDefinition).description} onChange={e=>set('description',e.target.value)}/></label>}
   <div className="gd-note">{plant?`Dégâts bruts théoriques : ${((item as PlantDefinition).damage/(item as PlantDefinition).rate).toFixed(1)} / s (hors zone et effets). `:''}Les capacités référencées remplacent le comportement d’attaque prédéfini. La valeur d’attaque et la cadence ne servent que si la capacité les référence. Les attaques spéciales et phases des boss se règlent désormais dans les comportements. La pluie garde ses règles fixes de joueur.</div>
  </section>
 </div>;
}
