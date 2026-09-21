import React, { useState } from 'react';
import type { Shot } from '../../shared/model.js';
import type { Alignment, ObjectKind } from '../../shared/studio.js';
import { Icon } from './Icon.js';
import type { Selection } from './Scene.js';
const MIME='application/x-lunaria-layer';
interface Props {
  shot:Shot; selectedIds:readonly string[]; locked:ReadonlySet<string>; hidden:ReadonlySet<string>; disabled:boolean;
  select:(selection:Selection,additive?:boolean)=>void; selectAll:()=>void;
  toggle:(kind:'locked'|'hidden',id:string)=>void;
  reorder:(kind:ObjectKind,source:string,target:string)=>void;
  align:(alignment:Alignment)=>void;
}
export function Layers(p:Props) {
  const [alignment,setAlignment]=useState<Alignment>('bottom');
  const rows=(kind:ObjectKind,items:{id:string;name:string;role?:string;animated?:boolean}[])=>items.map((item,index)=><div key={item.id}
    className={`layer-row ${p.selectedIds.includes(item.id)?'selected':''} ${p.hidden.has(item.id)?'layer-hidden':''}`}
    data-testid={`layer-${item.id}`} data-role={kind==='actor'?(item.role??'character'):'bubble'} draggable={!p.disabled&&!p.locked.has(item.id)}
    onDragStart={e=>{e.dataTransfer.setData(MIME,JSON.stringify({shotId:p.shot.id,kind,id:item.id}));e.dataTransfer.effectAllowed='move';}}
    onDragOver={e=>{if(e.dataTransfer.types.includes(MIME)&&!p.disabled)e.preventDefault();}}
    onDrop={e=>{e.preventDefault();if(p.disabled)return;try{const data=JSON.parse(e.dataTransfer.getData(MIME));if(data.shotId===p.shot.id&&data.kind===kind&&!p.locked.has(data.id))p.reorder(kind,data.id,item.id);}catch{/* unrelated drag */}}}>
      <button className="layer-select" disabled={p.disabled} title={item.role==='enemy'?`Ennemi · ${item.name}`:item.name} aria-label={`Sélectionner ${item.name}`}  aria-pressed={p.selectedIds.includes(item.id)} onClick={e=>p.select({kind,id:item.id},e.shiftKey||e.ctrlKey||e.metaKey)}><Icon name={kind==='actor'?(item.role==='enemy'?'enemy':item.role==='prop'?'prop':'actor'):'bubble'} size={13}/><span>{item.name}</span>{item.animated&&<span className="layer-motion" title="Mouvement actif"><Icon name="motion" size={12}/></span>}</button>
      <button className="icon-button" disabled={p.disabled} title={p.hidden.has(item.id)?'Afficher dans l’éditeur':'Masquer dans l’éditeur (lecture inchangée)'} aria-label={`${p.hidden.has(item.id)?'Afficher':'Masquer'} ${item.name} dans l’éditeur`} onClick={()=>p.toggle('hidden',item.id)}><Icon name={p.hidden.has(item.id)?'hidden':'eye'} size={13}/></button>
      <button className="icon-button" disabled={p.disabled} title={p.locked.has(item.id)?'Déverrouiller les modifications':'Verrouiller les modifications'} aria-label={`${p.locked.has(item.id)?'Déverrouiller':'Verrouiller'} ${item.name}`} onClick={()=>p.toggle('locked',item.id)}><Icon name={p.locked.has(item.id)?'lock':'unlock'} size={12}/></button>
      <button className="icon-button layer-step" title="Monter" aria-label={`Monter ${item.name}`} disabled={p.disabled||index===0||p.locked.has(item.id)} onClick={()=>p.reorder(kind,item.id,items[index-1].id)}><Icon name="up" size={11}/></button>
      <button className="icon-button layer-step" title="Descendre" aria-label={`Descendre ${item.name}`} disabled={p.disabled||index===items.length-1||p.locked.has(item.id)} onClick={()=>p.reorder(kind,item.id,items[index+1].id)}><Icon name="down" size={11}/></button>
    </div>);
  return <details className="layers-panel" open>
    <summary><Icon name="layers" size={14}/><strong>CALQUES</strong><span>{p.shot.actors.length+p.shot.bubbles.length}</span></summary>
    <div className="layer-toolbar"><button className="link-button" disabled={p.disabled} onClick={p.selectAll}>Tout sélectionner</button><span>Maj + clic pour cumuler</span></div>
    <div className="layer-list">
      {!!p.shot.bubbles.length&&<><div className="layer-group-label">Bulles · ordre de lecture</div>{rows('bubble',p.shot.bubbles.map((b,i)=>({id:b.id,name:`${i+1}. ${b.text.trim()||'Bulle vide'}`})))}</>}
      {!!p.shot.actors.length&&<><div className="layer-group-label">Éléments · premier plan en haut</div>{rows('actor',[...p.shot.actors].reverse().map(a=>({id:a.id,name:a.name,role:a.role,animated:!!a.movement?.enabled||!!a.motion&&a.motion.preset!=='none'})))}</>}
      <button className="layer-background" disabled={p.disabled} onClick={()=>p.select({kind:'shot'})}><Icon name="image" size={13}/><span>Décor</span><Icon name="lock" size={11}/></button>
    </div>
    {p.selectedIds.length>1&&<div className="alignment-toolbar"><span>{p.selectedIds.length} éléments sélectionnés</span><div><select aria-label="Aligner la sélection" value={alignment} disabled={p.disabled} onChange={e=>setAlignment(e.target.value as Alignment)}>
      <option value="left">Bords gauches</option><option value="center-x">Centres horizontaux</option><option value="right">Bords droits</option><option value="top">Bords supérieurs</option><option value="center-y">Centres verticaux</option><option value="bottom">Bords inférieurs</option>
      <option value="distribute-x" disabled={p.selectedIds.length<3}>Répartir horizontalement</option><option value="distribute-y" disabled={p.selectedIds.length<3}>Répartir verticalement</option>
    </select><button className="button subtle" disabled={p.disabled} onClick={()=>p.align(alignment)}>Aligner</button></div></div>}
    <p className="layers-note">Œil et verrou : aides d’édition locales, sans effet sur la lecture ou le JSON.</p>
  </details>;
}
