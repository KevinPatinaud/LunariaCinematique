import React, {useState} from 'react';
import {enemyChoices, type EnemyDefinition, type InvasiveFoci} from '../../shared/game/types.js';
import {Num} from './BalanceEditor.js';

export function InvasiveFociEditor({value,enemies,change}:{value:InvasiveFoci;enemies:EnemyDefinition[];change:(value:InvasiveFoci)=>void}){
 const [selected,setSelected]=useState(0);
 const current=Math.min(selected,value.positions.length-1);
 const mobile=enemyChoices(enemies,value.reinforcementEnemyId).filter(e=>e.id!=='plaque'&&e.id!=='thorn_knot');
 const move=(row:number,col:number)=>{
  if(value.positions.some((p,i)=>i!==current&&p.row===row&&p.col===col))return;
  const positions=value.positions.map((p,i)=>i===current?{row,col}:p);
  change({...value,positions});
 };
 return <section className="gd-protected-cell" aria-label="Foyers invasifs">
  <h2>Foyers invasifs</h2>
  <p>Place deux ou trois Plaques sur le plateau. Elles sont visibles dès la préparation et font chacune arriver une Canette pressée dans leur allée toutes les 30 secondes de combat. Ce renfort est inclus avec les réglages par défaut ; choisir un autre ennemi ou intervalle ajoute les renforts du niveau. Détruis tous les foyers puis les ennemis restants pour gagner.</p>
  <div className="gd-inline" role="group" aria-label="Foyer à placer">{value.positions.map((p,i)=><button key={i} type="button" className={i===current?'selected':''} aria-pressed={i===current} onClick={()=>setSelected(i)}>Foyer {i+1} · allée {p.row+1}, colonne {p.col+1}</button>)}{value.positions.length<3&&<button type="button" onClick={()=>{const next=[{row:2,col:5},{row:0,col:5},{row:4,col:5}].find(p=>!value.positions.some(q=>q.row===p.row&&q.col===p.col))!;change({...value,positions:[...value.positions,next]});setSelected(value.positions.length);}}>+ Foyer</button>}{value.positions.length>2&&<button type="button" onClick={()=>{change({...value,positions:value.positions.filter((_,i)=>i!==current)});setSelected(0);}}>Retirer le foyer sélectionné</button>}</div>
  <div className="gd-protected-grid" role="group" aria-label="Position des foyers">{Array.from({length:5},(_,row)=>Array.from({length:8},(_,col)=>{const at=value.positions.findIndex(p=>p.row===row&&p.col===col);return <button key={`${row}:${col}`} type="button" disabled={col<2||(at>=0&&at!==current)} className={at>=0?'selected':''} aria-label={`Allée ${row+1}, colonne ${col+1}${at>=0?`, foyer ${at+1}`:''}`} aria-pressed={at===current} onClick={()=>move(row,col)}>{at>=0?at+1:''}</button>;}))}</div>
  <div className="gd-form-grid"><label className="gd-field"><span>Ennemi envoyé en renfort</span><select aria-label="Ennemi envoyé en renfort" value={value.reinforcementEnemyId} onChange={e=>change({...value,reinforcementEnemyId:e.target.value})}>{mobile.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label><Num label="Intervalle des renforts (secondes)" value={value.interval} min={5} max={60} change={interval=>change({...value,interval})}/></div>
 </section>;
}
