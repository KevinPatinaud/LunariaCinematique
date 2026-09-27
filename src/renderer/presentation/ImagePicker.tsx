import React, {useContext, useEffect, useId, useRef, useState} from 'react';
import type {Asset} from '../../shared/model.js';
import {isImage} from '../../shared/assets.js';
import type {LibraryTab} from '../../shared/libraryBrowser.js';
import type {Region} from '../../shared/presentation/types.js';
import {api} from '../browserBridge.js';
import {Library} from '../components/Library.js';
import {LibraryPickerContext} from '../components/LibraryPickerContext.js';
import {useImageSize} from './AnimationPreview.js';

export function ImagePreview({asset,region,className='',label}:{asset?:Asset;region?:Region;className?:string;label?:string}){
 const cropId=useId().replace(/:/g,'');
 const size=useImageSize(asset?.url??'');
 if(!asset)return <div className={'lp-image-preview lp-image-missing '+className}>Aucune image sélectionnée</div>;
 const view=region??{x:0,y:0,width:size?.width??1,height:size?.height??1};
 return <div className={'lp-image-preview '+className} role="img" aria-label={label??asset.name}>
  {size?<svg viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} preserveAspectRatio="xMidYMid meet"><defs><clipPath id={cropId} clipPathUnits="userSpaceOnUse"><rect x={view.x} y={view.y} width={view.width} height={view.height}/></clipPath></defs><image href={asset.url} x="0" y="0" width={size.width} height={size.height} clipPath={`url(#${cropId})`}/></svg>:<img src={asset.url} alt=""/>}
 </div>;
}

interface Props {
 label:string;value:string[];assets:Asset[];multiple?:boolean;region?:Region;category?:LibraryTab;
 change:(refs:string[])=>void;buttonLabel?:string;
}
export function ImagePicker({label,value,assets,multiple=false,region,category,change,buttonLabel}:Props){
 const services=useContext(LibraryPickerContext);
 const trigger=useRef<HTMLButtonElement>(null);
 const [open,setOpen]=useState(false),[chosen,setChosen]=useState<string[]>(value),[error,setError]=useState(''),[importing,setImporting]=useState(false);
 const [tab,setTab]=useState<LibraryTab>(category??'character');
 useEffect(()=>{if(!open)setChosen(value);},[open,value.join('|')]);
 const current=assets.find(asset=>asset.ref===value[0]);
 const initialTab=():LibraryTab=>{
  const fromAsset=(asset:Asset):LibraryTab=>asset.kind==='other'?'environment':asset.kind==='audio'?'character':asset.kind;
  if(current)return fromAsset(current);
  const preferred=category??'character';
  if(assets.some(asset=>asset.kind===preferred&&isImage(asset.path)))return preferred;
  const first=assets.find(asset=>isImage(asset.path));
  return first?fromAsset(first):preferred;
 };
 const close=()=>{setOpen(false);trigger.current?.focus();};
 const select=(refs:string[])=>{change(refs);refs.forEach(ref=>services?.collections.use(ref as Asset['ref']));close();};
 const toggle=(ref:string)=>setChosen(previous=>previous.includes(ref)?previous.filter(item=>item!==ref):[...previous,ref]);
 const importFiles=async()=>{setImporting(true);setError('');try{
  const imported=await api.importImages();if(!imported?.length)return;
  const refs=imported.map(asset=>asset.ref);
  if(multiple)setChosen(previous=>[...previous,...refs.filter(ref=>!previous.includes(ref))]);
  else select([refs[0]]);
 }catch(reason){setError(String(reason));}finally{setImporting(false);}};
 return <div className="lp-image-picker">
  <div className="lp-image-picker-heading"><strong>{label}</strong><button ref={trigger} type="button" aria-expanded={open} onClick={()=>{if(open){close();return;}setChosen(value);setTab(initialTab());setError('');setOpen(true);}}>{buttonLabel??(multiple?'Choisir plusieurs images':'Choisir une image')}</button></div>
  {!multiple&&<div className="lp-image-current"><ImagePreview asset={current} region={region}/><span>{current?.path??'Choisis une image dans la bibliothèque.'}</span></div>}
  {multiple&&chosen.length>0&&<div className="lp-image-selection" aria-label="Images sélectionnées dans l’ordre">{chosen.map((ref,index)=>{const asset=assets.find(item=>item.ref===ref);return <span key={ref}><b>{index+1}</b>{asset?.name??ref}<button type="button" aria-label={'Retirer '+(asset?.name??ref)} onClick={()=>toggle(ref)}>×</button></span>;})}</div>}
  {open&&services&&<Library {...services} tab={tab} setTab={setTab} useAsset={()=>false} disabled={false} busy={false} picker={{label,multiple,chosen,toggle,select,close,importFiles:()=>void importFiles(),importing,error}}/>}
 </div>;
}
