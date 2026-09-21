import React, { useEffect, useRef, useState } from 'react';
import { campaignOf, ensureCampaign, moveCampaignStep } from '../../shared/game/campaign.js';
import { newId, type CampaignFilm, type CampaignStep, type GameProject } from '../../shared/game/types.js';
import { gameAPI } from './bridge.js';
import { api } from '../browserBridge.js';
interface Props {
 project:GameProject; change:(edit:(p:GameProject)=>void,key?:string,label?:string)=>void;
 run:(fn:()=>Promise<void>)=>Promise<void>;selectLevel:(id:string)=>void;
 openFilm:(film:CampaignFilm)=>Promise<void>;report:(message:string)=>void;
}
export function CampaignEditor({project,change,run,selectLevel,openFilm,report}:Props){
 const campaign=campaignOf(project),[selected,setSelected]=useState(campaign.steps[0]?.id??''),[folder,setFolder]=useState(''),[insertBefore,setInsertBefore]=useState<string|null|undefined>(undefined),[levelChoice,setLevelChoice]=useState('');
 const inspector=useRef<HTMLElement>(null);
 useEffect(()=>{if(inspector.current)inspector.current.scrollTop=0;},[selected]);
 const [dragged,setDragged]=useState(''),[dropTarget,setDropTarget]=useState('');
 const step=campaign.steps.find(s=>s.id===selected),film=step?.kind==='cinematic'?campaign.cinematics.find(f=>f.id===step.cinematicId):undefined;
 const level=step?.kind==='level'?project.levels.find(l=>l.id===step.levelId):undefined;
 const available=project.levels.filter(l=>!campaign.steps.some(s=>s.kind==='level'&&s.levelId===l.id));
 useEffect(()=>{let live=true;gameAPI.campaignFolder().then(v=>{if(live)setFolder(v);}).catch(e=>{if(live)report(String(e));});return()=>{live=false;};},[]);
 useEffect(()=>{if(!campaign.steps.some(s=>s.id===selected))setSelected(campaign.steps[0]?.id??'');},[campaign.steps,selected]);
 useEffect(()=>{if(insertBefore!==undefined&&insertBefore!==null&&!campaign.steps.some(s=>s.id===insertBefore))setInsertBefore(undefined);},[campaign.steps,insertBefore]);
 function insertAt(next:CampaignStep,beforeId:string|null,reference?:CampaignFilm){
  change(p=>{const c=ensureCampaign(p);if(reference&&!c.cinematics.some(f=>f.id===reference.id))c.cinematics.push(reference);const i=beforeId===null?c.steps.length:c.steps.findIndex(s=>s.id===beforeId);c.steps.splice(i<0?c.steps.length:i,0,next);},'','Ajouter une étape');
  setSelected(next.id);setInsertBefore(undefined);
 }
 function openInsertion(beforeId:string|null){setInsertBefore(current=>current===beforeId?undefined:beforeId);setLevelChoice(available[0]?.id??'');}
 function after(id:string):string|null{const i=campaign.steps.findIndex(s=>s.id===id);return campaign.steps[i+1]?.id??null;}
 const addFilm=(beforeId:string|null)=>void run(async()=>{
  if(!await gameAPI.campaignFolder()){const root=await gameAPI.chooseCampaignFolder();if(!root)return;setFolder(root);}
  const picked=await gameAPI.addCampaignFilm();if(!picked)return;
  const existing=campaign.cinematics.find(f=>f.file.toLowerCase()===picked.file.toLowerCase());
  if(existing&&existing.documentId!==picked.documentId)throw Error('Ce chemin désigne désormais un autre film. Retire l’ancienne référence avant de l’ajouter.');
  const ref=existing??picked;insertAt({id:newId('step'),kind:'cinematic',cinematicId:ref.id,skippable:true},beforeId,ref);
 });
 const replaceFilm=()=>void run(async()=>{
  if(!film)return;
  const picked=await gameAPI.addCampaignFilm();if(!picked)return;
  const id=film.id;
  change(p=>{const c=ensureCampaign(p),previous=c.cinematics.find(f=>f.id===id);if(!previous)return;
   const existing=c.cinematics.find(f=>f.id!==id&&f.file.toLowerCase()===picked.file.toLowerCase());
   if(existing){Object.assign(existing,{title:picked.title,documentId:picked.documentId});for(const s of c.steps)if(s.kind==='cinematic'&&s.cinematicId===id)s.cinematicId=existing.id;c.cinematics=c.cinematics.filter(f=>f.id!==id);}
   else Object.assign(previous,{title:picked.title,file:picked.file,documentId:picked.documentId});
  },'','Remplacer un fichier lié');
  report('Fichier relié. Toutes les étapes qui utilisent ce film suivent cette référence ; aucun fichier source n’a été supprimé.');
 });
 const chooseRoot=()=>void run(async()=>{const next=await gameAPI.chooseCampaignFolder();if(next)setFolder(next);});
 function move(id:string,beforeId:string|null){change(p=>{const c=ensureCampaign(p);c.steps=moveCampaignStep(c.steps,id,beforeId);},'','Déplacer une étape');}
 function nudge(by:number){if(!step)return;const i=campaign.steps.findIndex(s=>s.id===step.id),j=i+by;if(j<0||j>=campaign.steps.length)return;move(step.id,by<0?campaign.steps[j].id:campaign.steps[j+1]?.id??null);}
 const remove=()=>void run(async()=>{if(!step||!await api.confirmDelete('cette étape du parcours (le contenu reste dans le Studio)'))return;
  // run owns the document lock; use a prepared edit only after the native prompt.
  const id=step.id;change(p=>{const c=ensureCampaign(p);c.steps=c.steps.filter(s=>s.id!==id);},'','Retirer une étape');
 });
 // Parent run blocks ordinary edits; asynchronous commands are committed through its explicitly unlocked callback.
 const label=(s:CampaignStep)=>s.kind==='level'?project.levels.find(l=>l.id===s.levelId)?.title??'Niveau introuvable':campaign.cinematics.find(f=>f.id===s.cinematicId)?.title??'Cinématique introuvable';
 const edit=()=>{if(level)selectLevel(level.id);else if(film)void openFilm(film);};
 return <section className="gd-campaign">
  <header className="gd-campaign-header"><div><span className="gd-kicker">LE PARCOURS DU JOUEUR</span><h1>Campagne</h1><p><strong>Le jeu lit cette liste de haut en bas.</strong> Une cinématique placée entre deux niveaux se lance après la victoire du premier, avant le chargement du suivant.</p></div><div className="gd-campaign-count"><b>{campaign.steps.length}</b><span>étapes</span><small>{campaign.steps.filter(s=>s.kind==='level').length} niveaux · {campaign.steps.filter(s=>s.kind==='cinematic').length} cinématiques</small></div></header>
  <div className="gd-campaign-explainer" aria-label="Exemple d’enchaînement de campagne"><div><span className="gd-flow-node start">DÉBUT</span><b>→</b><span className="gd-flow-node cinematic">▶ CINÉMATIQUE</span><b>→</b><span className="gd-flow-node level">⚑ NIVEAU</span><b>→</b><span className="gd-flow-node cinematic">▶ CINÉMATIQUE</span><b>→</b><span className="gd-flow-node level">⚑ NIVEAU</span></div><p>Clique sur <strong>« Insérer ici »</strong> exactement à l’endroit où le film ou le niveau doit être joué. Tu peux ensuite glisser les cartes pour les réordonner.</p></div>
  <div className="gd-campaign-layout"><div className="gd-sequence-panel">
   <ol className="gd-campaign-cards" aria-label="Ordre de la campagne">
    {[...campaign.steps.map((s,i)=>({step:s,index:i,before:s.id})),{step:null,index:campaign.steps.length,before:null as string|null}].map(({step:s,index:i,before})=><React.Fragment key={s?.id??'campaign-end'}>
     <li role="presentation" className={`gd-insert-slot ${insertBefore===before?'open ':''}${dropTarget===`slot:${before??'end'}`?'drop-target':''}`}
      onDragOver={e=>{if(dragged){e.preventDefault();setDropTarget(`slot:${before??'end'}`);}}} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData('application/x-lunaria-step');if(id)move(id,before);setDragged('');setDropTarget('');}}>
      <span className="gd-insert-line"/><button className="gd-insert-toggle" aria-expanded={insertBefore===before} aria-label={i===0?'Insérer au début de la campagne':i===campaign.steps.length?'Insérer après la dernière étape':`Insérer entre les étapes ${i} et ${i+1}`} onClick={()=>openInsertion(before)}><b>＋</b> Insérer ici <small>{i===0?'au démarrage':i===campaign.steps.length?'après la dernière étape':`entre ${i} et ${i+1}`}</small></button><span className="gd-insert-line"/>
      {insertBefore===before&&<div className="gd-insert-menu"><div className="gd-insert-choice cinematic"><span className="gd-step-symbol cinematic">▶</span><div><strong>Cinématique</strong><small>Choisir un fichier cinematic.json. Il sera joué à cet endroit précis.</small></div><button className="gd-primary" disabled={campaign.steps.length>=1000} aria-label={i===0?'Choisir une cinématique au début de la campagne':i===campaign.steps.length?'Choisir une cinématique après la dernière étape':`Choisir une cinématique entre les étapes ${i} et ${i+1}`} onClick={()=>addFilm(before)}>Choisir un film…</button></div><span className="gd-insert-or">OU</span><div className="gd-insert-choice level"><span className="gd-step-symbol level">⚑</span><div><strong>Niveau</strong><small>{available.length?'Choisir un niveau qui n’est pas encore dans le parcours.':'Tous les niveaux du projet sont déjà placés.'}</small></div>{available.length?<><select aria-label="Niveau à ajouter au parcours" value={levelChoice} onChange={e=>setLevelChoice(e.target.value)}>{available.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select><button disabled={!available.some(l=>l.id===levelChoice)||campaign.steps.length>=1000} onClick={()=>insertAt({id:newId('step'),kind:'level',levelId:levelChoice},before)}>Insérer le niveau ici</button></>:null}</div></div>}
     </li>
     {s&&<li className={`gd-step-item ${s.kind} ${s.id===selected?'selected ':''}`} draggable
      onDragStart={e=>{setDragged(s.id);e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('application/x-lunaria-step',s.id);}} onDragEnd={()=>{setDragged('');setDropTarget('');}}>
      <button className="gd-step-card" aria-pressed={s.id===selected} aria-label={`Étape ${i+1} · ${label(s)}`} onClick={()=>setSelected(s.id)} onDoubleClick={()=>{if(s.kind==='level')selectLevel(s.levelId);else{const ref=campaign.cinematics.find(f=>f.id===s.cinematicId);if(ref)void openFilm(ref);}}}>
       <span className="gd-step-number">{String(i+1).padStart(2,'0')}</span><span className={`gd-step-symbol ${s.kind}`}>{s.kind==='level'?'⚑':'▶'}</span><span className="gd-step-name"><small>{s.kind==='level'?'NIVEAU JOUABLE':'CINÉMATIQUE'}</small><strong>{label(s)}</strong><small>{s.kind==='level'?'Victoire → passage à l’étape suivante':s.skippable?'Film pouvant être passé par le joueur':'Film obligatoire avant la suite'}</small></span><span className="gd-step-grip" aria-hidden="true">⠿</span></button>
     </li>}
    </React.Fragment>)}
    <li className="gd-campaign-end"><strong>FIN DE CAMPAGNE</strong><small>Le parcours s’arrête après la dernière étape.</small></li>
   </ol>
  </div><aside className="gd-campaign-inspector" ref={inspector}>
   {step?<><div className="gd-kicker">ÉTAPE {campaign.steps.indexOf(step)+1} · {step.kind==='level'?'NIVEAU JOUABLE':'CINÉMATIQUE'}</div><h2>{label(step)}</h2><div className="gd-step-context"><span>{campaign.steps[campaign.steps.indexOf(step)-1]?`Après « ${label(campaign.steps[campaign.steps.indexOf(step)-1])} »`:'Au début du jeu'}</span><b>→ CETTE ÉTAPE →</b><span>{campaign.steps[campaign.steps.indexOf(step)+1]?`Puis « ${label(campaign.steps[campaign.steps.indexOf(step)+1])} »`:'Puis fin de campagne'}</span></div><div className="gd-inline"><button aria-label="Monter l’étape" disabled={campaign.steps[0]===step} onClick={()=>nudge(-1)}>↑ Monter</button><button aria-label="Descendre l’étape" disabled={campaign.steps.at(-1)===step} onClick={()=>nudge(1)}>↓ Descendre</button></div>
    {film?<><p className="gd-note">Ce film est joué à cette position dans la liste. Le fichier reste lié, sans copie ; ses prochaines modifications enregistrées seront reprises à la publication.</p><code className="gd-movie-path">{film.file}</code><label className="gd-check"><input type="checkbox" checked={step.kind==='cinematic'&&step.skippable} onChange={e=>change(p=>{const s=ensureCampaign(p).steps.find(s=>s.id===step.id);if(s?.kind==='cinematic')s.skippable=e.target.checked;},'','Autoriser le passage du film')}/>Autoriser le joueur à passer cette cinématique</label><button onClick={edit}>Ouvrir dans l’éditeur de cinématiques</button><button onClick={replaceFilm}>Changer le fichier lié…</button><p className="gd-note">Le changement de fichier s’applique à toutes les occurrences de ce film dans le parcours.</p><button disabled={campaign.steps.length>=1000} onClick={()=>insertAt({id:newId('step'),kind:'cinematic',cinematicId:film.id,skippable:step.kind==='cinematic'&&step.skippable},after(step.id))}>Répéter ce film juste après</button></>:<><p>{level?.waves.length??0} vagues · {level?.allowedPlants.length??0} plantes disponibles</p><button onClick={edit}>Ouvrir le niveau</button><p className="gd-note">Après la victoire, le jeu passe automatiquement à la carte placée juste en dessous : film ou niveau. Une défaite ne débloque pas la suite.</p></>}
    <button className="gd-remove-step" onClick={remove}>Retirer du parcours</button></>:<p>Ajoute une première étape. Le parcours doit contenir au moins un niveau.</p>}
   <hr/><h3>Dossier des cinématiques</h3><p className="gd-movie-path">{folder||'Choisir le dossier contenant tes fichiers cinematic.json'}</p><button onClick={chooseRoot}>Choisir le dossier…</button><p className="gd-note">Les chemins sont relatifs à ce dossier. Tu peux déplacer l’ensemble et reconnecter sa nouvelle racine ici.</p>
   <hr/><h3>Avant publication</h3><p className="gd-note">Enregistre tes films. La publication vérifie les fichiers et les images, puis installe le parcours, le catalogue commun et les films utilisés.</p><button onClick={()=>void run(async()=>{const r=await gameAPI.checkCampaign(project);report(`Vérification réussie : ${r.steps} étapes, ${r.levels} niveaux, ${r.films} fichiers cinématiques, ${r.assets} ressources uniques. ${r.warnings.join(' ')}`);})}>Vérifier les fichiers du parcours</button>
  </aside></div>
 </section>;
}
