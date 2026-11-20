import { useEffect, useState } from 'react';
import type { AndroidDeploymentStatusState } from './ProjectDelivery.js';

const STEPS=[['save','Enregistrer'],['device','Téléphone'],['publish','Publier'],['build','Compiler'],['install','Installer'],['launch','Lancer']] as const;

export function AndroidDeploymentStatus({state,onClose}:{state:AndroidDeploymentStatusState;onClose:()=>void}){
 const [elapsed,setElapsed]=useState(0);
 useEffect(()=>{
  const update=()=>setElapsed(Math.floor((Date.now()-state.startedAt)/1000));
  update();
  if(state.status!=='running')return;
  const timer=setInterval(update,1000);return()=>clearInterval(timer);
 },[state.startedAt,state.status]);
 const current=STEPS.findIndex(([phase])=>phase===state.phase);
 const title={running:'Déploiement Android en cours',success:'Lunaria installé et lancé',error:'Déploiement Android interrompu',canceled:'Déploiement Android annulé'}[state.status];
 return <section className={'gd-android-status '+state.status} aria-label="Suivi du déploiement Android">
  <div className="gd-android-status-heading"><strong>{title}</strong><span>{Math.floor(elapsed/60)} min {String(elapsed%60).padStart(2,'0')} s</span>
   {state.status!=='running'&&<button aria-label="Fermer le suivi du déploiement Android" onClick={onClose}>×</button>}
  </div>
  <ol aria-label="Étapes du déploiement Android">{STEPS.map(([phase,label],index)=><li key={phase} className={state.status==='success'||index<current?'done':index===current?'current':''}>{label}</li>)}</ol>
  <p role="status">{state.message}</p>
  {state.status==='running'&&<small>La préparation des images peut prendre plusieurs minutes. Garde le Studio ouvert jusqu’à la confirmation du lancement sur le téléphone.</small>}
 </section>;
}
