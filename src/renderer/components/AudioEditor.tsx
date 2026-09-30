import React, { useEffect, useMemo, useRef, useState } from 'react';
import { copy, uid, type Asset, type AssetRef, type AudioSettings, type Cinematic, type MusicTrack, type Shot, type SoundCue, type SoundEvent } from '../../shared/model.js';
import { musicRange, soundEventLabels, soundTargetTime } from '../../shared/cinematicAudio.js';
import { isAudio } from '../../shared/assets.js';
import { StudioDialog } from './StudioDialog.js';
import { NumberInput } from './NumberInput.js';
import { Icon } from './Icon.js';
import type { Selection } from './Scene.js';

function Settings({value,change}:{value:AudioSettings;change:(patch:Partial<AudioSettings>)=>void}) {
  return <div className="audio-settings">
    <label className="field audio-volume"><span>Volume · {Math.round(value.volume*100)} %</span><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={value.volume} onChange={e=>change({volume:+e.target.value})}/></label>
    <label className="field"><span>Montée progressive (s)</span><NumberInput label="Montée progressive (s)" value={value.fadeIn} min={0} max={30} onCommit={fadeIn=>change({fadeIn})}/></label>
    <label className="field"><span>Diminution progressive (s)</span><NumberInput label="Diminution progressive (s)" value={value.fadeOut} min={0} max={30} onCommit={fadeOut=>change({fadeOut})}/></label>
    <label className="check-field"><input type="checkbox" checked={value.loop} onChange={e=>change({loop:e.target.checked})}/> Lire en boucle</label>
  </div>;
}
function FileChoice({value,volume,assets,change}:{value:AssetRef;volume:number;assets:Asset[];change:(asset:AssetRef)=>void}) {
  const asset=assets.find(a=>a.ref===value);
  const player=useRef<HTMLAudioElement>(null);
  useEffect(()=>{const audio=player.current;return()=>{if(audio){audio.pause();audio.removeAttribute('src');audio.load();}};},[value,asset?.url]);
  useEffect(()=>{if(player.current)player.current.volume=volume;},[volume,value,asset?.url]);
  return <div className="audio-file-row"><label className="field"><span>Fichier sonore</span><select aria-label="Fichier sonore" value={value} onChange={e=>change(e.target.value as AssetRef)}>
    {!asset&&<option value={value}>Introuvable · {value.split('/').pop()}</option>}
    {assets.map(a=><option key={a.ref} value={a.ref}>{a.path}</option>)}</select></label>
    {asset?<audio ref={player} key={value} controls preload="metadata" src={asset.url} onPlay={e=>{for(const other of document.querySelectorAll<HTMLAudioElement>('audio'))if(other!==e.currentTarget)other.pause();}} aria-label={`Écouter le fichier ${asset.name}`}/>:<span className="inline-warning">Reconnecte la bibliothèque contenant ce fichier.</span>}
  </div>;
}
type Props={doc:Cinematic;shot:Shot;assets:Asset[];selection:Selection;initialAsset?:AssetRef;change:(edit:(doc:Cinematic)=>void,key?:string,label?:string)=>void;onClose:()=>void;onLibrary:()=>void;onPreview:()=>void};
export function AudioEditor({doc,shot,assets,selection,initialAsset,change,onClose,onLibrary,onPreview}:Props) {
  const sounds=useMemo(()=>assets.filter(a=>isAudio(a.path)),[assets]);
  const [tab,setTab]=useState<'music'|'sounds'>(selection.kind==='shot'?'music':'sounds');
  const [query,setQuery]=useState(''),[source,setSource]=useState<AssetRef|''>(initialAsset??sounds[0]?.ref??'');
  const normalize=(v:string)=>v.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const filtered=sounds.filter(a=>normalize(a.path).includes(normalize(query)));
  useEffect(()=>{if(!source&&!query&&sounds[0])setSource(sounds[0].ref);},[sounds,source,query]);
  const tracks=doc.musicTracks??[], cues=shot.sounds??[];
  const current=doc.shots.findIndex(s=>s.id===shot.id);
  const updateTrack=(id:string,patch:Partial<MusicTrack>)=>change(d=>{Object.assign(d.musicTracks!.find(t=>t.id===id)!,patch);},`audio:${id}:${Object.keys(patch).join(',')}`,'Régler la musique');
  const updateCue=(id:string,patch:Partial<SoundCue>)=>change(d=>{Object.assign(d.shots.find(s=>s.id===shot.id)!.sounds!.find(c=>c.id===id)!,patch);},`audio:${id}:${Object.keys(patch).join(',')}`,'Régler un son');
  const defaults=(asset:AssetRef):AudioSettings=>({asset,volume:.65,loop:true,fadeIn:1,fadeOut:1});
  function add() {
    if(!source)return;
    if(tab==='music')change(d=>{(d.musicTracks??=[]).push({...defaults(source),id:uid(),startShotId:shot.id,endShotId:shot.id});},'','Ajouter une plage musicale');
    else change(d=>{
      let event:SoundEvent='shot_start',targetId='';
      if(selection.kind==='bubble'){event='bubble_open';targetId=selection.id;}
      if(selection.kind==='actor'){event='actor_entry';targetId=selection.id;}
      (d.shots.find(s=>s.id===shot.id)!.sounds??=[]).push({...defaults(source),id:uid(),loop:false,fadeIn:0,fadeOut:0,event,targetId,delay:0,duration:0});
    },'','Ajouter un son lié à un événement');
  }
  const planOptions=doc.shots.map((s,i)=><option key={s.id} value={s.id}>{String(i+1).padStart(2,'0')} · {s.name}</option>);
  return <StudioDialog title="Son de la cinématique" onClose={onClose} wide>
    <div className="audio-editor">
      <p className="dialog-intro">Une musique peut traverser plusieurs plans. Un bruitage suit un événement du plan {current+1}, « {shot.name} ».</p>
      <div className="audio-tabs" role="tablist" aria-label="Configuration sonore">
        <button role="tab" aria-selected={tab==='music'} onClick={()=>setTab('music')}>Musiques du film <span>{tracks.length}</span></button>
        <button role="tab" aria-selected={tab==='sounds'} onClick={()=>setTab('sounds')}>Sons de ce plan <span>{cues.length}</span></button>
      </div>
      <div className="audio-add">
        <label className="field"><span>Rechercher un son dans la bibliothèque</span><input aria-label="Rechercher un son" placeholder="Musique, ambiance, bruitage…" value={query} onChange={e=>{setQuery(e.target.value);const first=sounds.find(a=>normalize(a.path).includes(normalize(e.target.value)));setSource(first?.ref??'');}}/></label>
        <label className="field"><span>Son à ajouter</span><select aria-label="Son à ajouter" value={source} onChange={e=>setSource(e.target.value as AssetRef)}><option value="">Choisir un fichier</option>{filtered.map(a=><option key={a.ref} value={a.ref}>{a.path}</option>)}</select></label>
        <button className="button primary" disabled={!source||!sounds.some(a=>a.ref===source)||(tab==='music'?tracks.length>=100:cues.length>=100)} onClick={add}><Icon name="plus" size={16}/>{tab==='music'?'Ajouter une musique':'Ajouter un son'}</button>
      </div>
      {!sounds.length&&<p className="audio-empty">Connecte une bibliothèque contenant des fichiers OGG, WAV ou MP3. <button className="link-button" onClick={onLibrary}>Choisir la bibliothèque</button></p>}
      {tab==='music'?<>
        <p className="audio-hint">La fin inclut le dernier plan choisi et ses dialogues. Le fondu de sortie se joue ensuite, avant de passer au plan suivant. Plusieurs musiques peuvent se superposer.</p>
        {!tracks.length&&<div className="audio-empty"><Icon name="music" size={28}/><strong>Aucune plage musicale</strong><span>Ajoute un fichier, puis choisis les plans de début et de fin.</span></div>}
        {tracks.map((track,i)=>{const [start,end]=musicRange(doc,track.startShotId,track.endShotId);return <section className="audio-card" key={track.id} aria-label={`Musique ${i+1}`}>
          <header><strong><Icon name="music" size={16}/> Musique {i+1} · {track.asset.split('/').pop()}</strong><button className="link-button" aria-label={`Retirer la musique ${i+1}`} onClick={()=>change(d=>{d.musicTracks=d.musicTracks!.filter(t=>t.id!==track.id);},'','Retirer une musique')}>Retirer</button></header>
          <div className="audio-range-bar" aria-label={`Du plan ${start+1} au plan ${end+1}`}><span style={{left:`${100*start/doc.shots.length}%`,width:`${100*(end-start+1)/doc.shots.length}%`}}/>{doc.shots.map((s,j)=><i key={s.id} title={`Plan ${j+1} · ${s.name}`} className={j===current?'current':''}>{j+1}</i>)}</div>
          <div className="audio-range-fields"><label className="field"><span>Commence au plan</span><select aria-label="Commence au plan" value={track.startShotId} onChange={e=>{const id=e.target.value;updateTrack(track.id,{startShotId:id,...(doc.shots.findIndex(s=>s.id===id)>end?{endShotId:id}:{})});}}>{planOptions}</select></label>
            <label className="field"><span>S’arrête après le plan</span><select aria-label="S’arrête après le plan" value={track.endShotId} onChange={e=>{const id=e.target.value;updateTrack(track.id,{endShotId:id,...(doc.shots.findIndex(s=>s.id===id)<start?{startShotId:id}:{})});}}>{planOptions}</select></label>
            <button className="button subtle" onClick={()=>updateTrack(track.id,{startShotId:doc.shots[0].id,endShotId:doc.shots.at(-1)!.id})}>Tout le film</button>
          </div>
          <FileChoice value={track.asset} volume={track.volume} assets={sounds} change={asset=>updateTrack(track.id,{asset})}/>
          <Settings value={track} change={patch=>updateTrack(track.id,patch)}/>
        </section>;})}
      </>:<>
        <p className="audio-hint">Le son se déclenche une fois par événement. Les délais suivent la vraie ouverture des bulles, y compris après un clic du joueur.</p>
        {!cues.length&&<div className="audio-empty"><Icon name="bubble" size={28}/><strong>Aucun son lié à un événement</strong><span>Ajoute un son pour ponctuer une réplique ou accompagner un mouvement.</span></div>}
        {cues.map((cue,i)=>{
          const targets=cue.event==='bubble_open'?shot.bubbles.map((b,j)=>({id:b.id,name:`Bulle ${j+1} · ${b.text.slice(0,65)}`})):shot.actors;
          const unavailable=cue.event!=='bubble_open'&&soundTargetTime(shot,cue,{})===undefined;
          return <section className="audio-card" key={cue.id} aria-label={`Son ${i+1}`}>
            <header><strong>Son {i+1} · {cue.asset.split('/').pop()}</strong><button className="link-button" aria-label={`Retirer le son ${i+1}`} onClick={()=>change(d=>{const s=d.shots.find(s=>s.id===shot.id)!;s.sounds=s.sounds!.filter(c=>c.id!==cue.id);},'','Retirer un son')}>Retirer</button></header>
            <div className="audio-trigger-fields"><label className="field"><span>Déclencheur</span><select aria-label="Déclencheur" value={cue.event} onChange={e=>{const event=e.target.value as SoundEvent;updateCue(cue.id,{event,targetId:event==='shot_start'?'':event==='bubble_open'?shot.bubbles[0]?.id??'':shot.actors[0]?.id??''});}}>{Object.entries(soundEventLabels).map(([event,label])=><option key={event} value={event} disabled={event==='bubble_open'?!shot.bubbles.length:event!=='shot_start'&&!shot.actors.length}>{label}</option>)}</select></label>
              {cue.event!=='shot_start'&&<label className="field"><span>{cue.event==='bubble_open'?'Bulle':'Personnage / objet'}</span><select aria-label="Cible du son" value={cue.targetId} onChange={e=>updateCue(cue.id,{targetId:e.target.value})}>{targets.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>}
              <label className="field"><span>Délai après l’événement (s)</span><NumberInput label="Délai après l’événement (s)" value={cue.delay} min={0} max={300} onCommit={delay=>updateCue(cue.id,{delay})}/></label>
            </div>
            {unavailable&&<p className="inline-warning">Cette animation est désactivée. Active-la dans l’inspecteur ou choisis un autre déclencheur.</p>}
            <FileChoice value={cue.asset} volume={cue.volume} assets={sounds} change={asset=>updateCue(cue.id,{asset})}/>
            <Settings value={cue} change={patch=>updateCue(cue.id,patch)}/>
            <label className="field audio-duration"><span>Durée maximale (s) · 0 = jusqu’à la fin du fichier ou du plan</span><NumberInput label="Durée maximale (s)" value={cue.duration} min={0} max={600} onCommit={duration=>updateCue(cue.id,{duration})}/></label>
          </section>;
        })}
      </>}
      {shot.audio&&<div className="audio-legacy"><strong>Audio existant sur ce plan : {shot.audio.asset.split('/').pop()}</strong><p>Convertis-le pour choisir une plage et ajouter des fondus.</p><button className="button subtle" onClick={()=>{change(d=>{const s=d.shots.find(s=>s.id===shot.id)!;(d.musicTracks??=[]).push({...defaults(s.audio!.asset),...copy(s.audio!),id:uid(),startShotId:shot.id,endShotId:shot.id});s.audio=null;},'','Convertir l’audio en musique');setTab('music');}}>Convertir en plage musicale</button></div>}
      <p className="audio-hint">Les lecteurs de fichiers servent à l’écoute seule. Pour tester les événements et les fondus, utilise l’aperçu. Depuis un plan intermédiaire, la musique active repart du début du fichier.</p>
      <div className="modal-actions"><button className="button subtle" onClick={onClose}>Retour au montage</button><button className="button primary" onClick={onPreview}><Icon name="play" size={16}/> Écouter depuis ce plan</button></div>
    </div>
  </StudioDialog>;
}
