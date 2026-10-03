import React from 'react';
import type { Asset } from '../../shared/model.js';
import type { EscortSettings } from '../../shared/game/types.js';
import { Num } from './BalanceEditor.js';
import { ImagePicker } from '../presentation/ImagePicker.js';

export function EscortEditor({value,assets,change}:{value:EscortSettings;assets:Asset[];change:(value:EscortSettings)=>void}) {
 const patch=(data:Partial<EscortSettings>)=>change({...value,...data});
 const total=value.laneCounts.reduce((sum,count)=>sum+count,0);
 return <section className="gd-reward-section" aria-label="Jeunes pousses à escorter">
  <h2>Jeunes pousses à escorter</h2>
  <p>Les pousses partent de la gauche et avancent lentement pendant les vagues. Elles peuvent dépasser les alliés et être dépassées. Elles s’arrêtent au contact d’un ennemi ; leur destruction fait perdre le niveau.</p>
  <div className="gd-form-grid">{value.laneCounts.map((count,row)=><Num key={row} label={`Allée ${row+1} — pousses`} value={count} max={20} integer change={count=>patch({laneCounts:value.laneCounts.map((current,index)=>index===row?count:current)})}/>)}</div>
  <p role="status">{total} {total===1?'pousse à escorter':'pousses à escorter'} au total. 0 retire les pousses de cette allée.</p>
  {total===0&&<p className="gd-callout">Place au moins une pousse pour utiliser ce type de niveau.</p>}
  <div className="gd-form-grid">
   <Num label="Points de vie de chaque pousse" value={value.maxHp} min={1} max={6000} integer change={maxHp=>patch({maxHp})}/>
   <Num label="Vitesse des pousses (cases par seconde)" value={value.speed} min={0.03} max={0.23} change={speed=>patch({speed})}/>
   <Num label="Intervalle entre deux départs sur la même allée (secondes)" value={value.departureInterval} min={1} max={60} change={departureInterval=>patch({departureInterval})}/>
  </div>
  <ImagePicker label="Image des jeunes pousses (PNG ou WebP transparent)" value={value.image?[value.image]:[]} assets={assets} category="character" change={refs=>patch({image:(refs[0]??'') as EscortSettings['image']})} buttonLabel="Choisir ou importer une image"/>
  <p className="gd-callout">Les alliés se placent dans les deux premières colonnes et avancent comme en conquête. Une allée capturée ferme ses arrivées ; les pousses continuent jusqu’à droite. Pour gagner, conquiers les cinq allées et fais arriver toutes les pousses vivantes. Les arrivées ennemies ne sont pas annoncées en jeu.</p>
 </section>;
}
