import React from 'react';
import {SpeciesAnimations} from '../presentation/SpeciesAnimations.js';
import type {Change} from '../presentation/PresentationEditor.js';
import type {Asset} from '../../shared/model.js';
import { DAMAGE_LABELS, DAMAGE_TYPES, type PlantDefinition, type EnemyDefinition, type GameProject } from '../../shared/game/types.js';
import { attackTypeLabel } from '../../shared/game/combat.js';
import { NumberInput } from '../components/NumberInput.js';
import type {AnimationDefinition} from '../../shared/presentation/types.js';
import {ImagePicker,ImagePreview} from '../presentation/ImagePicker.js';
export function Num({label,value,min=0,max,integer=false,change}:{label:string;value:number;min?:number;max:number;integer?:boolean;change:(v:number)=>void}){
 return <label className="gd-field"><span>{label}</span><NumberInput label={label} value={value} min={min} max={max} onCommit={n=>change(integer?Math.round(n):n)}/></label>;
}
export function BalanceEditor({project,role,id,select,update,editAbility,editBehavior,assets,change,openProfile,tab,setTab,focusAnimationId,renderAnimationEditor}:{assets:Asset[];change:Change;openProfile:(id:string)=>void;editBehavior:(id:string)=>void;editAbility:(id:string)=>void;project:GameProject;role:'plants'|'enemies';id:string;select:(id:string)=>void;update:(id:string,patch:Partial<PlantDefinition&EnemyDefinition>,key:string)=>void;tab:'details'|'animations';setTab:(tab:'details'|'animations')=>void;focusAnimationId?:string;renderAnimationEditor:(animation:AnimationDefinition,patch:(data:Record<string,unknown>,key?:string)=>void,speciesId:string)=>React.ReactNode}){
 const list=project.balance[role], item=list.find(x=>x.id===id)??list[0], plant=role==='plants';
 const uses=project.levels.filter(l=>plant?l.allowedPlants.includes(item.id):l.waves.some(w=>w.groups.some(g=>g.enemyId===item.id))).length;
 const set=(key:string,value:unknown)=>update(item.id,{[key]:value},`${item.id}:${key}`);
 const n=(key:string,label:string,max:number,min=0,integer=false)=><Num key={key} label={label} value={Number((item as unknown as Record<string,unknown>)[key])} min={min} max={max} integer={integer} change={v=>set(key,v)}/>;
 const assigned=item.ability_ids??[],primaryId=assigned[0]??'',primary=project.combat!.abilities.find(a=>a.id===primaryId);
 const attackName=(attackId:string)=>{const attack=project.combat!.abilities.find(a=>a.id===attackId);return attack?`${attack.name} — ${attackTypeLabel(attack,project.combat!)}`:attackId;};
 const selectPrimary=(attackId:string)=>{const attack=project.combat!.abilities.find(a=>a.id===attackId);if(!attack)return;const ability_ids=[attackId,...assigned.slice(1).filter(x=>x!==attackId)];update(item.id,{ability_ids,...(plant?{ability:attack.name}:{})},`${item.id}:primary-attack`);};
 return <div className="gd-balance">
  <aside className="gd-catalog" aria-label={plant?'Catalogue des plantes':'Catalogue des ennemis'}>{list.map(x=><button key={x.id} className={x.id===item.id?'selected':''} onClick={()=>select(x.id)}><b>{x.name}</b><small>{x.id}</small></button>)}</aside>
  <section className="gd-scroll gd-balance-form" key={item.id}>
   <div className="gd-kicker">CATALOGUE GLOBAL · {plant?'PLANTE ALLIÉE':'ENNEMI'}</div><h1>{item.name}</h1>
   <section className="lp-character-image" aria-label={'Image principale de '+item.name}>
    <ImagePreview asset={assets.find(asset=>asset.ref===item.visual?.sprite.asset)} region={item.visual?.sprite.region} label={'Image principale de '+item.name}/>
    <div><h2>Image du personnage</h2><p>Cette image apparaît au repos et sert de point de départ aux animations de {item.name}. Elle est partagée par tous les niveaux.</p>
     <ImagePicker label={'Image principale de '+item.name} value={item.visual?.sprite.asset?[item.visual.sprite.asset]:[]} assets={assets} change={refs=>{if(!refs[0])return;update(item.id,{visual:{...item.visual??{width:100,height:100,baseline:0,mirror:false,tint:'#ffffff',note:''},sprite:{asset:refs[0] as `library://${string}`}}},`${item.id}:visual:image`);}} buttonLabel="Choisir ou importer une image"/>
    </div>
   </section>
   {tab==='details'&&<p className="gd-callout">Ce réglage est partagé par <strong>tous les niveaux</strong>. Cette espèce est utilisée dans {uses} niveau{uses>1?'x':''}. Aucun niveau ne peut remplacer ces valeurs.</p>}
   <nav className="gd-detail-tabs lp-species-tabs" aria-label={'Fiche de '+item.name}><button className={tab==='details'?'active':''} onClick={()=>setTab('details')}>Caractéristiques et attaques</button><button className={tab==='animations'?'active':''} onClick={()=>setTab('animations')}>Animations de {item.name}</button></nav>
   {tab==='animations'?<SpeciesAnimations project={project} id={item.id} assets={assets} change={change} openProfile={openProfile} focusAnimationId={focusAnimationId} renderAnimationEditor={renderAnimationEditor}/>:<>
   <div className="gd-form-grid">
    <label className="gd-field"><span>Nom affiché</span><input aria-label="Nom de l’espèce" maxLength={80} value={item.name} onChange={e=>set('name',e.target.value)}/></label>
    <label className="gd-field"><span>Type de dégâts</span><select aria-label="Type de dégâts" value={item.damage_type} onChange={e=>set('damage_type',e.target.value)}>{DAMAGE_TYPES.map(x=><option key={x} value={x}>{DAMAGE_LABELS[x]}</option>)}</select></label>
    {plant?<>{n('max_hp','Points de vie',6000,1,true)}{n('damage','Dégâts par attaque',600,0,true)}{n('rate','Intervalle entre attaques (s)',15,.1)}{n('range','Portée (cases)',12)}{n('cost','Coût en graines',10000,0,true)}{n('cooldown','Recharge de plantation (s)',120)}
     {n('effect_strength','Puissance des résultats spéciaux',5)}
    </>:<>{n('hp','Points de vie',20000,1,true)}{n('attack','Attaque de base (PV)' ,200,0,true)}{n('speed','Vitesse (cases/s)',2,item.id==='thorn_knot'?0:.01)}{n('reach','Portée de contact (cases)',9)}{n('leak','Dégâts au jardin en cas de fuite',100,0,true)}{n('reward','Graines au recyclage',400,0,true)}
     
    </>}
   </div>
   <section className="gd-species-attacks"><div className="gd-section-heading"><div><h2>Attaques</h2><p>Choisis directement l’attaque principale de cette espèce. Son type et ses résultats se règlent ensuite dans l’onglet « Attaque ».</p></div>{primary&&<button onClick={()=>editAbility(primary.id)}>Modifier cette attaque →</button>}</div>
    <label className="gd-field"><span>Type d’attaque principal</span><select aria-label="Type d’attaque principal" value={primaryId} onChange={e=>selectPrimary(e.target.value)}>{project.combat!.abilities.map(a=><option key={a.id} value={a.id}>{attackName(a.id)}</option>)}</select></label>
    {assigned.length>1&&<><h3>Attaques supplémentaires</h3><div className="gd-effect-chain">{assigned.slice(1).map((attackId,i)=><div key={attackId}><b>{i+2}</b><button onClick={()=>editAbility(attackId)}>{attackName(attackId)} →</button><button aria-label={'Retirer attaque supplémentaire '+(i+1)} onClick={()=>set('ability_ids',assigned.filter(id=>id!==attackId))}>×</button></div>)}</div></>}
    <label className="gd-field"><span>Ajouter une attaque supplémentaire</span><select aria-label="Ajouter une attaque supplémentaire" value="" onChange={e=>{if(e.target.value&&assigned.length<8)set('ability_ids',[...assigned,e.target.value]);}}><option value="">Choisir une attaque…</option>{project.combat!.abilities.filter(a=>!assigned.includes(a.id)).map(a=><option key={a.id} value={a.id}>{attackName(a.id)}</option>)}</select></label>
   </section>
   <h2>Comportement</h2><div className="gd-inline"><label className="gd-field"><span>Comportement attribué</span><select aria-label="Comportement attribué" value={item.behaviorId??''} onChange={e=>set('behaviorId',e.target.value)}>{project.logic!.behaviors.filter(b=>b.team===role).map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label><button onClick={()=>editBehavior(item.behaviorId!)}>Éditer les règles et phases →</button></div>
   <h2>Protections</h2><p>Le perforant et le toxique ignorent l’armure, mais pas leur résistance. Le type pur ignore les deux.</p>
   <div className="gd-form-grid">
    <Num label="Armure physique (%)" value={item.armor*100} max={95} change={v=>set('armor',v/100)}/>
    {(['physical','piercing','toxic'] as const).map(x=><Num key={x} label={`Résistance ${DAMAGE_LABELS[x].toLowerCase()} (%)`} value={item.resistances[x]*100} max={95} change={v=>set('resistances',{...item.resistances,[x]:v/100})}/>)}
   </div>
   {plant&&<label className="gd-field"><span>Description</span><textarea maxLength={1000} rows={3} value={(item as PlantDefinition).description} onChange={e=>set('description',e.target.value)}/></label>}
   <div className="gd-note">{plant?`Dégâts bruts théoriques : ${((item as PlantDefinition).damage/(item as PlantDefinition).rate).toFixed(1)} / s (hors zone et résultats spéciaux). `:''}La valeur d’attaque et la cadence sont utilisées par les attaques qui choisissent les caractéristiques de l’espèce. Les attaques spéciales et phases des boss se règlent dans les comportements. La pluie garde ses règles fixes de joueur.</div>
   </>}
  </section>
 </div>;
}
