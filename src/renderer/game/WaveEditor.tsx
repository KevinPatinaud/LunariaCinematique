import React, { useEffect, useState } from 'react';
import { newId, waveSchedule, replaceWaves, type WaveDefinition, type LevelDefinition, type EnemyDefinition, type SpawnGroup } from '../../shared/game/types.js';
import { Num } from './BalanceEditor.js';
export function WaveEditor({level,enemies,update}:{level:LevelDefinition;enemies:EnemyDefinition[];update:(patch:Partial<LevelDefinition>,key?:string)=>void}){
 const [waveId,setWaveId]=useState(level.waves[0].id),[time,setTime]=useState(0),[playing,setPlaying]=useState(false);
 const wave=level.waves.find(w=>w.id===waveId)??level.waves[0],schedule=waveSchedule(wave),end=Math.max(1,(schedule.at(-1)?.at??0)+2);
 useEffect(()=>{setTime(0);setPlaying(false);},[wave.id]);
 useEffect(()=>{setTime(t=>Math.min(t,end));},[end]);
 useEffect(()=>{if(!playing)return;let frame=0,last=performance.now();const tick=(now:number)=>{const dt=Math.min(.1,(now-last)/1000);last=now;setTime(t=>Math.min(end,t+dt));frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[playing,end]);
 useEffect(()=>{if(time>=end)setPlaying(false);},[time,end]);
 const edit=(fn:(w:WaveDefinition)=>void,key='')=>{const waves=structuredClone(level.waves);fn(waves.find(w=>w.id===wave.id)!);update({waves},key);};
 const patch=(id:string,part:Partial<SpawnGroup>,key='')=>edit(w=>Object.assign(w.groups.find(g=>g.id===id)!,part),key);
 const addWave=()=>{const next:WaveDefinition={id:newId('wave'),groups:[{id:newId('group'),enemyId:enemies[0].id,count:5,lane:-1,start:0,interval:3}]};update({waves:[...level.waves,next]});setWaveId(next.id);};
 const duplicate=()=>{const next=structuredClone(wave);next.id=newId('wave');next.groups.forEach(g=>g.id=newId('group'));const waves=[...level.waves];waves.splice(waves.findIndex(w=>w.id===wave.id)+1,0,next);update(replaceWaves(level,waves));setWaveId(next.id);};
 return <section className="gd-waves">
  <div className="gd-wave-tabs" role="tablist" aria-label="Vagues">{level.waves.map((w,i)=><button key={w.id} role="tab" aria-selected={wave.id===w.id} className={wave.id===w.id?'selected':''} onClick={()=>setWaveId(w.id)}>Vague {i+1}<small>{w.groups.reduce((n,g)=>n+g.count,0)} ennemis</small></button>)}<button disabled={level.waves.length>=50} onClick={addWave}>+ Vague</button></div>
  <div className="gd-section-heading"><div><h2>Composition de la vague</h2><p><strong>{schedule.length} ennemis</strong> · Dernière arrivée à {(end-2).toFixed(1)} s · Aucun renfort caché</p></div><div className="gd-inline"><button onClick={duplicate} disabled={level.waves.length>=50}>Dupliquer la vague</button><button disabled={level.waves.length===1} onClick={()=>update(replaceWaves(level,level.waves.filter(w=>w.id!==wave.id)))}>Retirer la vague</button></div></div>
  <div className="gd-wave-table"><div className="gd-wave-head"><span>Ennemi</span><span>Nombre</span><span>Allée</span><span>Début (s)</span><span>Intervalle (s)</span><span/></div>
   {wave.groups.map((g,i)=><div className="gd-spawn-row" key={g.id}>
    <select aria-label={`Ennemi du groupe ${i+1}`} value={g.enemyId} onChange={e=>patch(g.id,{enemyId:e.target.value})}>{enemies.map(e=><option value={e.id} key={e.id}>{e.name}</option>)}</select>
    <Num label={`Nombre du groupe ${i+1}`} value={g.count} min={1} max={256} integer change={v=>patch(g.id,{count:v})}/>
    <select aria-label={`Allée du groupe ${i+1}`} value={g.lane} onChange={e=>patch(g.id,{lane:Number(e.target.value)})}><option value={-1}>Aléatoire</option>{[0,1,2,3,4].map(n=><option key={n} value={n}>Allée {n+1}</option>)}</select>
    <Num label={`Début du groupe ${i+1}`} value={g.start} max={600} change={v=>patch(g.id,{start:v})}/>
    <Num label={`Intervalle du groupe ${i+1}`} value={g.interval} min={.1} max={120} change={v=>patch(g.id,{interval:v})}/>
    <button aria-label={`Retirer le groupe ${i+1}`} disabled={wave.groups.length===1} onClick={()=>edit(w=>{w.groups=w.groups.filter(x=>x.id!==g.id);})}>×</button>
   </div>)}
  </div>
  <button className="gd-add" disabled={wave.groups.length>=256} onClick={()=>edit(w=>w.groups.push({id:newId('group'),enemyId:enemies[0].id,count:3,lane:-1,start:0,interval:3}))}>+ Ajouter un groupe d’ennemis</button>
  <section className="gd-preview"><div className="gd-section-heading"><div><h2>Aperçu des arrivées</h2><p>Prévisualisation du planning, pas une simulation du combat. Les allées aléatoires sont indiquées par « ? ».</p></div><button onClick={()=>{if(time>=end)setTime(0);setPlaying(!playing);}}>{playing?'Pause':'Lire les arrivées'}</button></div>
   <svg viewBox="0 0 800 190" role="img" aria-label="Planning d’apparition sur les cinq allées">
    {[0,1,2,3,4].map(n=><g key={n}><rect x={72} y={n*30+8} width={714} height={27} rx={4} fill={n%2?'#233729':'#1c3023'}/><text x={8} y={n*30+27} fill="#b9caae" fontSize={12}>Allée {n+1}</text></g>)}
    {schedule.map((s,i)=>{const row=s.lane<0?i%5:s.lane;return <g key={i}><circle cx={82+s.at/end*690} cy={row*30+21} r={s.at<=time?5:3} fill={s.at<=time?'#dfc785':'#648361'}/>{s.lane<0&&<text x={79+s.at/end*690} y={row*30+25} fontSize={9} fill="#15281c">?</text>}<title>{enemies.find(e=>e.id===s.enemyId)?.name} · {s.at.toFixed(1)} s</title></g>;})}
    <line x1={82+time/end*690} x2={82+time/end*690} y1={0} y2={160} stroke="#f4e3b1" strokeWidth={2}/><text x={72} y={182} fill="#9eb497" fontSize={12}>0 s</text><text x={723} y={182} fill="#9eb497" fontSize={12}>{end.toFixed(1)} s</text>
   </svg>
   <div className="gd-inline"><input aria-label="Temps de l’aperçu des arrivées" type="range" min={0} max={end} step={.05} value={time} onChange={e=>{setPlaying(false);setTime(Number(e.target.value));}}/><output>{time.toFixed(1)} s · {schedule.filter(x=>x.at<=time).length}/{schedule.length}</output></div>
  </section>
 </section>;
}
