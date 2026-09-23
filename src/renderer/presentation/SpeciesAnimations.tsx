import React,{useEffect,useState} from 'react';
import type {Asset} from '../../shared/model.js';
import type {GameProject} from '../../shared/game/types.js';
import {newId} from '../../shared/game/types.js';
import {BASE_SLOTS,SLOT_LABELS,type AnimationDefinition} from '../../shared/presentation/types.js';
import {resolveAnimation,species} from '../../shared/presentation/runtime.js';
import {animationOwnerId,setSpeciesAnimation} from '../../shared/presentation/ownership.js';
import {newAnimation} from '../../shared/presentation/defaults.js';
import {AnimationPreview} from './AnimationPreview.js';
import {AssetChoice,Choose} from './PresentationFields.js';
import {Num} from '../game/BalanceEditor.js';
import type {Change} from './PresentationEditor.js';

interface Props {
 project:GameProject;id:string;assets:Asset[];change:Change;
 openProfile:(id:string)=>void;focusAnimationId?:string;
 renderAnimationEditor:(animation:AnimationDefinition,patch:(data:Record<string,unknown>,key?:string)=>void,speciesId:string)=>React.ReactNode;
}
export function SpeciesAnimations({project,id,assets,change,openProfile,focusAnimationId,renderAnimationEditor}:Props){
 const item=species(project,id)!;
 const catalog=project.presentation!;
 const profile=catalog.profiles.find(value=>value.id===item.animationProfileId)!;
 const defaults=catalog.profiles.find(value=>value.id===catalog.defaultProfileId)!;
 const slots=[...new Set([...BASE_SLOTS,...defaults.slots.map(value=>value.slot),...profile.slots.map(value=>value.slot)])];
 const owned=catalog.animations.filter(animation=>animationOwnerId(project,animation)===id);
 const available=catalog.animations.filter(animation=>{const owner=animationOwnerId(project,animation);return !owner||owner===id;});
 const [selectedId,setSelectedId]=useState(focusAnimationId||owned[0]?.id||'');
 const [view,setView]=useState<'own'|'actions'>(owned.length?'own':'actions');
 const [custom,setCustom]=useState('');
 useEffect(()=>{setSelectedId(focusAnimationId&&owned.some(animation=>animation.id===focusAnimationId)?focusAnimationId:owned[0]?.id||'');setView(owned.length?'own':'actions');},[id,focusAnimationId]);
 const selected=owned.find(animation=>animation.id===selectedId);
 const assign=(slot:string,animationId:string|null)=>change(draft=>setSpeciesAnimation(draft,id,slot,animationId),'',`Choisir l’animation de ${item.name}`);
 const personalize=(slot:string,copy:boolean)=>{
  const source=resolveAnimation(project,item,slot);
  const animation=copy&&source?structuredClone(source):newAnimation();
  animation.id=newId(id+'_'+slot);
  animation.name=item.name+' — '+(SLOT_LABELS[slot]??slot);
  animation.ownerSpeciesId=id;
  if(!copy){animation.loop=['idle','move'].includes(slot);animation.markers=slot==='attack'?animation.markers:[];}
  change(draft=>{draft.presentation!.animations.push(animation);setSpeciesAnimation(draft,id,slot,animation.id);},'',`Créer une animation pour ${item.name}`);
  setSelectedId(animation.id);
  setView('own');
 };
 const patchAnimation=(data:Record<string,unknown>,key='')=>selected&&change(draft=>Object.assign(draft.presentation!.animations.find(animation=>animation.id===selected.id)!,data),`${selected.id}:${key}`,`Modifier l’animation de ${item.name}`);
 return <section className="lp-species-workshop" aria-label={'Animations de '+item.name}>
  <header className="lp-species-heading"><div><span className="gd-kicker">ANIMATIONS DU PERSONNAGE</span><h2>Animations de {item.name}</h2><p>Choisis une animation commune pour une action, ou crée une version propre à {item.name} et modifie-la ici.</p></div><strong>{owned.length} personnelle{owned.length>1?'s':''}</strong></header>
  <nav className="gd-detail-tabs lp-species-subtabs" aria-label={'Édition des animations de '+item.name}><button className={view==='own'?'active':''} onClick={()=>setView('own')}>Ses animations ({owned.length})</button><button className={view==='actions'?'active':''} onClick={()=>setView('actions')}>Actions du personnage</button></nav>
  {view==='actions'&&<div className="lp-species-actions">{slots.map(slot=>{
   const animation=resolveAnimation(project,item,slot),owner=animation&&animationOwnerId(project,animation);
   return <article key={slot}>
    <div className="lp-species-action-heading"><b>{SLOT_LABELS[slot]??slot}</b><small>{owner===id?'Propre à '+item.name:'Animation commune'}</small></div>
    <AnimationPreview catalog={catalog} compact animation={animation} visual={item.visual} assets={assets}/>
    <Choose label={'Animation pour '+(SLOT_LABELS[slot]??slot)} value={animation?.id??''} options={available} empty change={animationId=>assign(slot,animationId||null)}/>
    <div className="gd-inline">{owner===id?<button onClick={()=>{setSelectedId(animation!.id);setView('own');}}>Modifier ici</button>:<button onClick={()=>personalize(slot,true)}>Créer une version pour {item.name}</button>}</div>
   </article>;
  })}</div>}
  {view==='own'&&<section className="lp-owned-section">
   <div className="lp-owned-heading"><div><h3>Créations personnelles</h3><p>Tu peux les modifier ici et les associer aux actions de {item.name}.</p></div><label className="gd-field"><span>Créer une animation</span><select aria-label={'Créer une animation pour '+item.name} value="" onChange={event=>{if(event.target.value)personalize(event.target.value,false);}}><option value="">Choisir une action…</option>{slots.map(slot=><option key={slot} value={slot}>{SLOT_LABELS[slot]??slot}</option>)}</select></label></div>
   {owned.length?<div className="lp-owned-list">{owned.map(animation=><button key={animation.id} className={selected?.id===animation.id?'selected':''} onClick={()=>setSelectedId(animation.id)}>{animation.name}<small>{animation.kind==='procedural'?'Mouvement du personnage':`${animation.frames.length} image${animation.frames.length>1?'s':''}`}</small></button>)}</div>:<p className="lp-inline-empty">Aucune animation personnelle pour l’instant. Tu peux partir d’une action ci-dessus.</p>}
   {selected&&<div className="lp-owned-editor" key={selected.id}>
    <div className="lp-owned-editor-heading"><div><span className="gd-kicker">ANIMATION DE {item.name.toLocaleUpperCase()}</span><h3>{selected.name}</h3></div><button onClick={()=>{patchAnimation({ownerSpeciesId:''});setSelectedId('');if(owned.length===1)setView('actions');}}>Rendre commune</button></div>
    <label className="gd-field"><span>Nom de l’animation</span><input aria-label={'Nom de l’animation de '+item.name} value={selected.name} maxLength={160} onChange={event=>patchAnimation({name:event.target.value},'name')}/></label>
    {renderAnimationEditor(selected,patchAnimation,id)}
   </div>}
  </section>}
  <details className="lp-advanced-panel lp-species-advanced"><summary>Profils, actions spéciales et image de repos</summary>
   <p>Le profil organise les actions et les sons. Ces réglages peuvent être partagés entre plusieurs personnages.</p>
   <Choose label="Profil d’animation" value={profile.id} options={catalog.profiles} change={animationProfileId=>change(draft=>{species(draft,id)!.animationProfileId=animationProfileId;},'','Changer le profil')}/>
   <button onClick={()=>openProfile(profile.id)}>Modifier le profil et ses sons</button>
   <div className="gd-inline lp-custom-slot"><input aria-label="Nouvelle action personnalisée" value={custom} onChange={event=>setCustom(event.target.value)} placeholder="Ex. attaque_speciale"/><button disabled={!/^[a-zA-Z0-9_-]+$/.test(custom)||slots.includes(custom)||profile.slots.length>=32} onClick={()=>{assign(custom,'');setCustom('');}}>Ajouter l’action</button></div>
   {item.visual&&<details className="lp-advanced-panel"><summary>Image de repos et dimensions</summary><p>{item.visual.note}</p><AssetChoice label="Image de repos du personnage" value={item.visual.sprite.asset} assets={assets} change={asset=>change(draft=>{species(draft,id)!.visual!.sprite={asset:asset as `library://${string}`};},'','Changer l’image de repos')}/><label className="lp-check"><input type="checkbox" checked={item.visual.mirror} onChange={event=>change(draft=>{species(draft,id)!.visual!.mirror=event.target.checked;},'','Changer le miroir')}/> Miroir horizontal</label><div className="gd-form-grid">{(['width','height','baseline'] as const).map(key=><Num key={key} label={{width:'Largeur',height:'Hauteur',baseline:'Ligne des pieds'}[key]} value={item.visual![key]} min={key==='baseline'?-100:1} max={key==='baseline'?100:400} change={value=>change(draft=>{species(draft,id)!.visual![key]=value;},id+':visual:'+key,'Calibrer le visuel')}/>)}<label className="gd-field"><span>Teinte</span><input type="color" value={item.visual.tint} onChange={event=>change(draft=>{species(draft,id)!.visual!.tint=event.target.value;},'','Teinter le visuel')}/></label></div><label className="lp-check"><input type="checkbox" checked={!!item.visual.sprite.region} onChange={event=>change(draft=>{species(draft,id)!.visual!.sprite.region=event.target.checked?{x:0,y:0,width:64,height:64}:undefined;},'','Définir la région de repos')}/> Découper l’image de repos</label>{item.visual.sprite.region&&<div className="gd-form-grid">{(['x','y','width','height'] as const).map(key=><Num key={key} label={'Découpe '+key} value={item.visual!.sprite.region![key]} min={key==='width'||key==='height'?1:0} max={32768} integer change={value=>change(draft=>{species(draft,id)!.visual!.sprite.region![key]=value;},id+':repos:'+key,'Découper sans copier')}/>)}</div>}</details>}
  </details>
 </section>;
}
