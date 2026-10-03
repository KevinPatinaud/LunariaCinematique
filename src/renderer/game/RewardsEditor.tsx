import React, { useState } from 'react';
import { defaultRewards, DEFAULT_WAVE_SEED_REWARD, isConquest, type ComboReward, type GameProject } from '../../shared/game/types.js';
import type { Change } from '../presentation/PresentationEditor.js';
import { Num } from './BalanceEditor.js';

export function RewardsEditor({project,change,initialLevelId}:{project:GameProject;change:Change;initialLevelId?:string}) {
 const [levelId,setLevelId]=useState(initialLevelId??project.levels[0]?.id??'');
 const level=project.levels.find(item=>item.id===levelId)??project.levels[0];
 const combo=project.rewards?.combo??defaultRewards().combo;
 const patch=(data:Partial<ComboReward>,key:string)=>change(p=>{p.rewards??=defaultRewards();Object.assign(p.rewards.combo,data);},'rewards.combo.'+key,'Modifier le bonus de combo');
 return <main className="gd-rewards gd-scroll gd-level-main">
  <div className="gd-kicker">ÉQUILIBRAGE DES GRAINES</div><h1>Récompenses</h1>
  <p>Le montant par ennemi se règle dans son catalogue. Configure ici les graines supplémentaires pour les combos, les captures d’allées et les vagues éliminées.</p>
  <section aria-label="Bonus de combo" className="gd-reward-section">
   <h2>Bonus de combo</h2>
   <label className="gd-combo-toggle"><input type="checkbox" aria-label="Activer le bonus de combo" checked={combo.enabled} onChange={event=>patch({enabled:event.target.checked},'enabled')}/><span>Activer le bonus de graines pour les combos</span><strong>{combo.enabled?'Activé':'Désactivé'}</strong></label>
   <p>Une série continue si les éliminations sont espacées de moins de 4 secondes. Le bonus commence à la troisième élimination. Désactivé par défaut.</p>
   <div className="gd-form-grid">
    <Num label="Graines supplémentaires par palier" value={combo.seedsPerStep} max={10000} integer change={seedsPerStep=>patch({seedsPerStep},'seedsPerStep')}/>
    <Num label="Bonus de combo maximal (graines)" value={combo.maxSeeds} max={10000} integer change={maxSeeds=>patch({maxSeeds},'maxSeeds')}/>
   </div>
   <p className="gd-callout">{combo.enabled?`Graines ajoutées : 3e élimination +${Math.min(combo.maxSeeds,combo.seedsPerStep)}, 4e +${Math.min(combo.maxSeeds,combo.seedsPerStep*2)}, 5e +${Math.min(combo.maxSeeds,combo.seedsPerStep*3)}. Plafond : +${combo.maxSeeds}.`:'Aucune graine supplémentaire ne sera accordée pour les combos.'}</p>
  </section>
  <section aria-label="Récompenses du niveau" className="gd-reward-section">
   <h2>Récompenses du niveau</h2>
   {level?<>
    <label className="gd-field"><span>Niveau</span><select aria-label="Niveau pour les récompenses" value={level.id} onChange={event=>setLevelId(event.target.value)}>{project.levels.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
    {isConquest(level.objective.type)&&<div className="gd-callout"><h3>Conquête des allées</h3><Num label="Graines par allée capturée" value={level.laneCaptureSeedReward??0} max={10000} integer change={laneCaptureSeedReward=>change(p=>{p.levels.find(item=>item.id===level.id)!.laneCaptureSeedReward=laneCaptureSeedReward;},level.id+':laneCaptureSeedReward','Modifier les graines de capture')}/><p>Versées une seule fois par allée, y compris la dernière. Le décor progresse de 20 % à chaque capture. 0 désactive ce bonus.</p></div>}
    <h3>Fin de vague</h3><p>Versées une seule fois après l’élimination de la vague. Ces montants sont aussi accessibles dans « Niveaux → Vagues & ennemis ».</p>
    <div className="gd-form-grid">{level.waves.map((wave,index)=><Num key={wave.id} label={`Vague ${index+1} — graines`} value={wave.seedReward??DEFAULT_WAVE_SEED_REWARD} max={10000} integer change={seedReward=>change(p=>{p.levels.find(item=>item.id===level.id)!.waves.find(item=>item.id===wave.id)!.seedReward=seedReward;},wave.id+':seedReward','Modifier les graines de fin de vague')}/>)}</div>
    <p className="gd-note">0 désactive la récompense de cette vague. Les montants existants sont conservés.</p>
   </>:<p>Crée un niveau pour configurer ses récompenses de fin de vague.</p>}
  </section>
 </main>;
}
