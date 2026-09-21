import React,{useEffect,useState,useRef,useId} from 'react';
import type {Asset} from '../../shared/model.js';
import type {AnimationDefinition,SpeciesVisual,SpriteSource,PresentationCatalog} from '../../shared/presentation/types.js';
import {duration,frameAt,sample,crossedMarkers,attachmentPoint} from '../../shared/presentation/runtime.js';
import {PreviewSoundPool,VfxGlyph} from './CuePrimitives.js';
export const imageSizes=new Map<string,{width:number;height:number}>();
export function useImageSize(url:string){
 const [size,setSize]=useState(imageSizes.get(url));
 useEffect(()=>{if(!url){setSize(undefined);return;}if(imageSizes.has(url)){setSize(imageSizes.get(url));return;}let live=true;setSize(undefined);const image=new Image();image.onload=()=>{const value={width:image.naturalWidth,height:image.naturalHeight};imageSizes.set(url,value);window.dispatchEvent(new Event('lunaria-image-size'));if(live)setSize(value);};image.src=url;return()=>{live=false;};},[url]);return size;
}
export function sourceGeometry(source:SpriteSource|undefined,assets:Asset[],bounds:{width:number;height:number}){
 const asset=assets.find(x=>x.ref===source?.asset),size=source?.region??imageSizes.get(asset?.url??'')??{width:bounds.width,height:bounds.height};
 const ratio=Math.min(bounds.width/Math.max(1,size.width),bounds.height/Math.max(1,size.height));return {width:size.width*ratio,height:size.height*ratio};
}
/** Pure SVG sampling. No audio, markers or combat callbacks are run by this component. */
export function SpriteGlyph({animation,visual,time,assets,guides=false,quiet=false}:{animation:AnimationDefinition;visual?:SpeciesVisual;time:number;assets:Asset[];guides?:boolean;quiet?:boolean}){
 const tintId=useId().replace(/:/g,'');
 const source=frameAt(animation,time).frame??visual?.sprite,asset=assets.find(x=>x.ref===source?.asset),natural=useImageSize(asset?.url??'');
 const bounds={width:visual?.width??100,height:visual?.height??100},size=sourceGeometry(source,assets,bounds),pivot=source?.anchor??animation.anchor,tr=sample(animation,time,quiet),region=source?.region;
 if(!source||!asset)return <text x="0" y="-30" textAnchor="middle" fill="currentColor" fontSize="8">Ressource à relier</text>;
 const mirror=visual?.mirror?-1:1;
 return <g transform={`translate(${tr.x},${tr.y}) rotate(${tr.rotation}) scale(${tr.scaleX*mirror},${tr.scaleY})`} opacity={tr.opacity}>
  {visual?.tint&&visual.tint!=='#ffffff'&&<defs><filter id={tintId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={`${parseInt(visual.tint.slice(1,3),16)/255} 0 0 0 0 0 ${parseInt(visual.tint.slice(3,5),16)/255} 0 0 0 0 0 ${parseInt(visual.tint.slice(5,7),16)/255} 0 0 0 0 0 1 0`}/></filter></defs>}
  <svg filter={visual?.tint&&visual.tint!=='#ffffff'?`url(#${tintId})`:undefined} x={-size.width*pivot.x} y={-size.height*pivot.y} width={size.width} height={size.height} viewBox={region?`${region.x} ${region.y} ${region.width} ${region.height}`:`0 0 ${natural?.width??size.width} ${natural?.height??size.height}`} overflow="hidden" preserveAspectRatio="none">
   <image href={asset.url} width={natural?.width??(region?region.x+region.width:size.width)} height={natural?.height??(region?region.y+region.height:size.height)}/>
  </svg>
  {guides&&<><circle r="2" fill="#ffe49a"/>{animation.attachments.map(p=><g key={p.id} transform={`translate(${(p.x-pivot.x)*size.width},${(p.y-pivot.y)*size.height})`}><circle r="1.8" fill="#8de7d6"/><text x="3" y="-2" fontSize="5" fill="white" transform={mirror<0?'scale(-1,1)':undefined}>{p.id}</text></g>)}</>}
 </g>;
}
export function AnimationPreview({animation,visual,assets,catalog,compact=false,autoplay=false}:{animation:AnimationDefinition|undefined;visual?:SpeciesVisual;assets:Asset[];catalog?:PresentationCatalog;compact?:boolean;autoplay?:boolean}){
 const [time,setTime]=useState(0),[playing,setPlaying]=useState(autoplay),[guides,setGuides]=useState(!compact),[quiet,setQuiet]=useState(false),[mirror,setMirror]=useState(false);const [seekEpoch,setSeekEpoch]=useState(0);const timeRef=useRef(0);timeRef.current=time;
 const d=animation?duration(animation):1;
 useEffect(()=>{setTime(0);setPlaying(autoplay);},[animation?.id,autoplay]);
 useEffect(()=>{if(!playing||!animation)return;let handle=0,last=performance.now();const tick=(now:number)=>{const t=timeRef.current+Math.min(.1,(now-last)/1000);last=now;if(!animation.loop&&t>=d){timeRef.current=d;setTime(d);setPlaying(false);return;}timeRef.current=t;setTime(timeRef.current);handle=requestAnimationFrame(tick);};handle=requestAnimationFrame(tick);return()=>cancelAnimationFrame(handle);},[playing,animation,d]);
 const seek=(t:number)=>{setSeekEpoch(n=>n+1);setPlaying(false);setTime(Math.max(0,Math.min(d,t)));};
 const frame=(by:number)=>{if(!animation?.frames.length){seek(time+by/30);return;}let t=0;const starts=animation.frames.map(f=>{const n=t;t+=f.duration;return n;});const i=frameAt(animation,time).index;seek(starts[Math.max(0,Math.min(starts.length-1,i+by))]);};
 return <div className={'lp-preview '+(compact?'lp-compact':'')}>
  <svg viewBox={`${-Math.max(180,(visual?.width??100)*1.5)/2} ${-Math.max(145,(visual?.height??100)*1.4)} ${Math.max(180,(visual?.width??100)*1.5)} ${Math.max(145,(visual?.height??100)*1.4)+30}`} aria-label="Aperçu de l’animation"><path d="M-80 0H80" stroke="currentColor" opacity=".2"/>{animation&&<SpriteGlyph animation={animation} visual={visual?{...visual,mirror:mirror?!visual.mirror:visual.mirror}:undefined} time={time} assets={assets} guides={guides} quiet={quiet}/>}<LocalPreviewCues animation={animation} visual={visual?{...visual,mirror:mirror?!visual.mirror:visual.mirror}:undefined} assets={assets} catalog={catalog} time={time} playing={playing} epoch={seekEpoch} quiet={quiet}/></svg>
  <div className="gd-inline"><button disabled={!animation} aria-label="Lire ou mettre en pause l’animation" onClick={()=>{if(time>=d&&!animation?.loop){setTime(0);setSeekEpoch(n=>n+1);}setPlaying(!playing);}}>{playing?'Pause':'Lire'}</button>{!compact&&<><button onClick={()=>frame(-1)}>← Frame</button><button onClick={()=>frame(1)}>Frame →</button><button onClick={()=>seek(0)}>Repos</button></>}</div>
  {!compact&&<><input aria-label="Curseur temporel de l’animation" type="range" min="0" max={Math.max(.01,d)} step=".001" value={animation?.loop?time%Math.max(.001,d):Math.min(time,d)} onChange={e=>seek(+e.target.value)}/><small>{(animation?.loop?time%Math.max(.001,d):time).toFixed(3)} / {d.toFixed(3)} s · les déplacements du curseur ne déclenchent aucun événement</small><div className="gd-inline"><label><input type="checkbox" checked={guides} onChange={e=>setGuides(e.target.checked)}/> Ancrages</label><label><input type="checkbox" checked={mirror} onChange={e=>setMirror(e.target.checked)}/> Miroir</label><label><input type="checkbox" checked={quiet} onChange={e=>setQuiet(e.target.checked)}/> Mouvement réduit</label></div></>}
 </div>;
}

/** Forward preview has bounded presentation cues. Manual seek increments epoch and is silent. */
function LocalPreviewCues({animation,visual,assets,catalog,time,playing,epoch,quiet}:{animation?:AnimationDefinition;visual?:SpeciesVisual;assets:Asset[];catalog?:PresentationCatalog;time:number;playing:boolean;epoch:number;quiet:boolean}){
 const pool=useRef(new PreviewSoundPool()),previous=useRef(-1e-7),serial=useRef(0),[effects,setEffects]=useState<{id:number;ref:string;at:number;attach:string}[]>([]);
 useEffect(()=>()=>pool.current.clear(),[]);
 useEffect(()=>{pool.current.clear();setEffects([]);previous.current=time===0?-1e-7:time;},[animation?.id,epoch]);
 useEffect(()=>{pool.current.pause(!playing);if(!playing||!animation||!catalog)return;
  if(time<previous.current){pool.current.clear();setEffects([]);previous.current=-1e-7;}
  const cues=crossedMarkers(animation,previous.current,time);previous.current=time;
  for(const {marker} of cues)if(marker.type==='sound')pool.current.play(catalog,assets,marker.ref,'preview');
  setEffects(old=>{const next=old.filter(e=>{const d=catalog.vfx.find(v=>v.id===e.ref);return d&&time-e.at<d.duration;});for(const {marker,at} of cues){if(marker.type!=='vfx')continue;const d=catalog.vfx.find(v=>v.id===marker.ref);if(!d||time-at>=d.duration||next.length>=96||next.filter(e=>e.ref===marker.ref).length>=d.maxInstances)continue;next.push({id:++serial.current,ref:marker.ref,at,attach:marker.attach});}return next;});
 },[playing,time,animation,catalog,assets]);
 if(!animation||!catalog)return null;
 return <g pointerEvents="none">{effects.map(e=>{const definition=catalog.vfx.find(v=>v.id===e.ref);if(!definition)return null;const at=['halo','flash','trail'].includes(definition.preset)?time:e.at,source=frameAt(animation,at).frame??visual?.sprite,dimensions=sourceGeometry(source,assets,{width:visual?.width??100,height:visual?.height??100}),point=attachmentPoint(animation,at,e.attach,{x:dimensions.width,y:dimensions.height},visual?.mirror,source?.anchor,quiet);return <g key={e.id} transform={`translate(${point.x},${point.y})`}><VfxGlyph definition={definition} age={Math.max(0,time-e.at)} assets={assets}/></g>;})}</g>;
}
