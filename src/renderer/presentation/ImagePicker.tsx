import React,{useEffect,useState} from 'react';
import type {Asset} from '../../shared/model.js';
import type {Region} from '../../shared/presentation/types.js';
import {api} from '../browserBridge.js';
import {useImageSize} from './AnimationPreview.js';

const isImage=(asset:Asset)=>/\.(png|jpg|jpeg|webp)$/i.test(asset.path);

export function ImagePreview({asset,region,className='',label}:{asset?:Asset;region?:Region;className?:string;label?:string}){
 const size=useImageSize(asset?.url??'');
 if(!asset)return <div className={'lp-image-preview lp-image-missing '+className}>Aucune image sélectionnée</div>;
 const view=region??{x:0,y:0,width:size?.width??1,height:size?.height??1};
 return <div className={'lp-image-preview '+className} role="img" aria-label={label??asset.name}>
  {size?<svg viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} preserveAspectRatio="xMidYMid meet"><image href={asset.url} x="0" y="0" width={size.width} height={size.height}/></svg>:<img src={asset.url} alt=""/>}
 </div>;
}

interface Props {
 label:string;value:string[];assets:Asset[];multiple?:boolean;region?:Region;
 change:(refs:string[])=>void;buttonLabel?:string;
}
export function ImagePicker({label,value,assets,multiple=false,region,change,buttonLabel}:Props){
 const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[chosen,setChosen]=useState<string[]>(value),[error,setError]=useState(''),[importing,setImporting]=useState(false);
 useEffect(()=>{if(!open)setChosen(value);},[open,value.join('|')]);
 const images=assets.filter(isImage),current=assets.find(asset=>asset.ref===value[0]);
 const results=images.filter(asset=>(asset.path+' '+asset.name).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 const shown=results.slice(0,120);
 const toggle=(ref:string)=>setChosen(previous=>previous.includes(ref)?previous.filter(item=>item!==ref):[...previous,ref]);
 const importFiles=async()=>{setImporting(true);setError('');try{
  const imported=await api.importImages();if(!imported?.length)return;
  const refs=imported.map(asset=>asset.ref);
  if(multiple)setChosen(previous=>[...previous,...refs.filter(ref=>!previous.includes(ref))]);
  else{change([refs[0]]);setOpen(false);}
 }catch(reason){setError(String(reason));}finally{setImporting(false);}};
 return <div className="lp-image-picker">
  <div className="lp-image-picker-heading"><strong>{label}</strong><button type="button" aria-expanded={open} onClick={()=>{setOpen(!open);setError('');}}>{buttonLabel??(multiple?'Choisir plusieurs images':'Choisir une image')}</button></div>
  {!multiple&&<div className="lp-image-current"><ImagePreview asset={current} region={region}/><span>{current?.path??'Choisis une image dans la bibliothèque.'}</span></div>}
  {multiple&&chosen.length>0&&<div className="lp-image-selection" aria-label="Images sélectionnées dans l’ordre">{chosen.map((ref,index)=>{const asset=assets.find(item=>item.ref===ref);return <span key={ref}><b>{index+1}</b>{asset?.name??ref}<button type="button" aria-label={'Retirer '+(asset?.name??ref)} onClick={()=>toggle(ref)}>×</button></span>;})}</div>}
  {open&&<section className="lp-image-browser" aria-label={'Bibliothèque d’images pour '+label} onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();setOpen(false);}}}>
   <div className="lp-image-browser-tools"><input autoFocus aria-label="Rechercher une image" placeholder="Rechercher une image…" value={query} onChange={event=>setQuery(event.target.value)}/><button type="button" disabled={importing} onClick={()=>void importFiles()}>{importing?'Import en cours…':'Importer des fichiers…'}</button></div>
   <small>{results.length} image{results.length>1?'s':''} dans la bibliothèque{results.length>shown.length?` · ${shown.length} affichées, précise la recherche`:''}. L’import copie les fichiers dans la bibliothèque liée.</small>
   {error&&<p role="alert">{error}</p>}
   <div className="lp-image-grid">{shown.map(asset=>{const index=chosen.indexOf(asset.ref);return <button type="button" key={asset.ref} className={index>=0?'selected':''} aria-label={(multiple?'Sélectionner ':'Utiliser ')+asset.path} aria-pressed={index>=0} onClick={()=>{if(multiple)toggle(asset.ref);else{change([asset.ref]);setOpen(false);}}}><img src={asset.thumbnail} loading="lazy" alt=""/><span>{asset.name}</span><small>{asset.path}</small>{multiple&&index>=0&&<b>{index+1}</b>}</button>;})}</div>
   {!results.length&&<p>Aucune image correspondante. Importe un fichier ou change la recherche.</p>}
   <div className="lp-image-browser-actions">{multiple&&<button type="button" disabled={!chosen.length} onClick={()=>{change(chosen);setOpen(false);}}>Ajouter {chosen.length} image{chosen.length>1?'s':''}</button>}<button type="button" onClick={()=>setOpen(false)}>Fermer</button></div>
  </section>}
 </div>;
}
