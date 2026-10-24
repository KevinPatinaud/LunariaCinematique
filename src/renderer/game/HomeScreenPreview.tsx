import React,{useEffect,useRef,useState} from 'react';
import type {Asset} from '../../shared/model.js';
import type {GameProject} from '../../shared/game/types.js';
import {playableCampaignSteps} from '../../shared/game/campaign.js';
import {newHomeElement,type HomeScreen,type HomeElement} from '../../shared/game/homeScreen.js';
import {SpriteGlyph,useImageSize} from '../presentation/AnimationPreview.js';
import europe from './home-assets/world_europe.png';
import africa from './home-assets/world_africa.png';
import asia from './home-assets/world_asia.png';
import oceania from './home-assets/world_oceania.png';
import americas from './home-assets/world_americas.png';

type RenderElement=Required<HomeElement>;
export type PreviewState='start'|'continue'|'battle'|'cinematic'|'finished'|'unavailable';
export const PREVIEW_STATES:Record<PreviewState,string>={start:'Nouvelle aventure',continue:'Voyage en cours',battle:'Bataille à reprendre',cinematic:'Cinématique à découvrir',finished:'Parcours terminé',unavailable:'Aucune mission publiée'};
const gardens=[europe,africa,asia,oceania,americas];
const fonts={body:'HomeNunito',bold:'HomeNunito',title:'HomeFredoka'};
export function homePreviewLevels(project:GameProject){return playableCampaignSteps(project).flatMap(step=>step.kind==='level'?project.levels.filter(level=>level.id===step.levelId):[]);}
export function previewText(text:string,completed:number,total:number,continueText=''){return text.replaceAll('{continue}',continueText).replaceAll('{completed}',String(completed)).replaceAll('{total}',String(total)).replaceAll('{version}','7.2');}
function Garden({chapter}:{chapter:number}){const url=gardens[Math.max(0,Math.min(4,chapter))],size=useImageSize(url);return size?<svg width="1280" height="720" viewBox={`0 ${size.height/2} ${size.width} ${size.height/2}`} preserveAspectRatio="xMidYMid slice"><image href={url} width={size.width} height={size.height}/></svg>:null;}
function TextGlyph({element,text,button=false}:{element:RenderElement;text:string;button?:boolean}){
 const e=element,font=fonts[e.font],weight=e.font==='bold'?850:e.font==='body'?650:300;
 const context=document.createElement('canvas').getContext('2d'),width=e.rect.w-(button?14:0);let size=e.fontSize;
 const measure=(value:string)=>{if(context)context.font=`${weight} ${size}px ${font}`;return context?.measureText(value).width??value.length*size*.55;};
 if(button)while(size>12&&measure(text)>width)size--;
 const lines:string[]=[];for(const paragraph of text.split('\n')){let line='';for(const word of paragraph.split(' ')){const next=line?line+' '+word:word;if(e.maxLines>1&&line&&measure(next)>width){lines.push(line);line=word;}else line=next;}lines.push(line);}
 return <text fill={e.color} fontFamily={font} fontWeight={weight} fontSize={size} textAnchor={e.align==='center'?'middle':e.align==='right'?'end':'start'}>{lines.slice(0,e.maxLines).map((line,i)=>{let label=line+(i===e.maxLines-1&&lines.length>e.maxLines?'…':'');if(measure(label)>width){while(label.length&&measure(label+'…')>width)label=label.slice(0,-1);label+='…';}return <tspan key={i} x={e.rect.x+(e.align==='center'?e.rect.w/2:e.align==='right'?e.rect.w:0)} y={button?e.rect.y+e.rect.h/2+size*.34:e.rect.y+size+i*e.lineHeight}>{label}</tspan>;})}</text>;
}
function PlantGlyph({element,project,assets,time}:{element:RenderElement;project:GameProject;assets:Asset[];time:number}){
 const species=project.balance.plants.find(p=>p.id===element.plantId),catalog=project.presentation;
 const profile=catalog?.profiles.find(p=>p.id===species?.animationProfileId)??catalog?.profiles.find(p=>p.id===catalog.defaultProfileId);
 const animationId=profile?.slots.find(s=>s.slot==='idle')?.animationId??catalog?.profiles.find(p=>p.id===catalog.defaultProfileId)?.slots.find(s=>s.slot==='idle')?.animationId;
 const animation=catalog?.animations.find(a=>a.id===animationId);
 if(!animation||!species?.visual)return <text x={element.rect.x} y={element.rect.y+20} fill="#fff5de">{species?.name??element.plantId}</text>;
 return <g transform={`translate(${element.rect.x+element.rect.w/2},${element.rect.y+element.rect.h/2}) scale(${element.scale}) translate(0,${species.visual.baseline})`}><SpriteGlyph animation={animation} visual={species.visual} assets={assets} time={element.animated?time:0}/></g>;
}
export function HomeScreenPreview({home,project,assets,selectedId,select,patchRect,state,completed,chapter,playing,guides}:{home:HomeScreen;project:GameProject;assets:Asset[];selectedId:string;select:(id:string)=>void;patchRect:(id:string,rect:HomeElement['rect'])=>void;state:PreviewState;completed:number;chapter:number;playing:boolean;guides:boolean}){
 const svg=useRef<SVGSVGElement>(null),drag=useRef<{id:string;x:number;y:number;rect:HomeElement['rect'];resize:boolean}|undefined>(undefined),[draft,setDraft]=useState<{id:string;rect:HomeElement['rect']}|null>(null),[time,setTime]=useState(0),[,refreshFonts]=useState(0);
 useEffect(()=>{let alive=true;void document.fonts.ready.then(()=>{if(alive)refreshFonts(n=>n+1);});return()=>{alive=false;};},[]);
 useEffect(()=>{if(!playing)return;let frame=0,last=performance.now();const tick=(now:number)=>{setTime(t=>t+Math.min(.1,(now-last)/1000));last=now;frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[playing]);
 const levels=homePreviewLevels(project),total=state==='unavailable'?0:levels.length;
 const dynamicText=home.continueLabels[state]+(state==='unavailable'?'':home.continueLabels.suffix);
 const current=home.elements.find(e=>e.id===selectedId),selection=current&&draft&&draft.id===current.id?{...current,rect:draft.rect}:current;
 const point=(event:React.PointerEvent)=>{const bounds=svg.current!.getBoundingClientRect();return {x:(event.clientX-bounds.left)*1280/bounds.width,y:(event.clientY-bounds.top)*720/bounds.height};};
 const start=(event:React.PointerEvent,id:string,resize=false)=>{if(event.button!==0)return;event.stopPropagation();const e=home.elements.find(e=>e.id===id)!;select(id);drag.current={id,...point(event),rect:{...e.rect},resize};svg.current?.setPointerCapture(event.pointerId);};
 const move=(event:React.PointerEvent)=>{const d=drag.current;if(!d)return;const p=point(event),dx=Math.round(p.x-d.x),dy=Math.round(p.y-d.y);setDraft({id:d.id,rect:d.resize?{...d.rect,w:Math.max(1,Math.min(2560,d.rect.w+dx)),h:Math.max(1,Math.min(1440,d.rect.h+dy))}:{...d.rect,x:Math.max(-1280,Math.min(2560,d.rect.x+dx)),y:Math.max(-720,Math.min(1440,d.rect.y+dy))}});};
 const finish=()=>{if(draft&&drag.current)patchRect(draft.id,draft.rect);drag.current=undefined;setDraft(null);};
 const asset=(ref:string)=>assets.find(a=>a.ref===ref)?.url;
 const unlocked=(id:string)=>levels.slice(0,Math.max(1,completed+1)).some(level=>level.allowedPlants.includes(id));
 return <svg ref={svg} className="home-canvas" aria-label="Aperçu de l’écran d’accueil" viewBox="0 0 1280 720" onPointerMove={move} onPointerUp={finish} onPointerCancel={()=>{drag.current=undefined;setDraft(null);}} onPointerDown={()=>select('')}>
  <rect width="1280" height="720" fill={home.background.color}/>
  <g opacity={home.background.opacity}>{home.background.mode==='garden'?<Garden chapter={home.background.chapter<0?chapter:home.background.chapter}/>:home.background.mode==='image'&&asset(home.background.image)?<image href={asset(home.background.image)} width="1280" height="720" preserveAspectRatio={home.background.fit==='stretch'?'none':home.background.fit==='cover'?'xMidYMid slice':'xMidYMid meet'}/>:null}</g>
  <rect width="1280" height="720" fill={home.background.overlayColor} opacity={home.background.overlayOpacity}/>
  {home.elements.map(original=>{const e={...newHomeElement(original.kind,original.id),...original,...(draft?.id===original.id?{rect:draft.rect}:{})} as RenderElement;if(!e.visible||e.opacity<=0||e.showIfPlantUnlocked&&!unlocked(e.showIfPlantUnlocked)||e.hideIfPlantUnlocked&&unlocked(e.hideIfPlantUnlocked))return null;const r=e.rect,rect={x:r.x,y:r.y,width:r.w,height:r.h};let content:React.ReactNode;
   if(e.kind==='panel')content=<rect {...rect} rx={e.radius} fill={e.fill} stroke={e.borderColor} strokeWidth={e.borderWidth} style={e.shadow?{filter:'drop-shadow(0px 4px 4px #06120740)'}:undefined}/>;
   else if(e.kind==='text')content=<TextGlyph element={e} text={previewText(e.text,completed,total,dynamicText)}/>;
   else if(e.kind==='button'){const text=previewText(e.text,completed,total,dynamicText);content=<g><rect {...rect} rx={e.radius} fill={e.fill} stroke={e.borderColor} strokeWidth={e.borderWidth} style={e.shadow?{filter:'drop-shadow(0px 4px 4px #06120740)'}:undefined}/><TextGlyph element={{...e,color:e.textColor,align:'center',maxLines:1}} text={text} button/></g>;}
   else if(e.kind==='image')content=asset(e.image)?<image {...rect} href={asset(e.image)} preserveAspectRatio={e.fit==='stretch'?'none':e.fit==='cover'?'xMidYMid slice':'xMidYMid meet'} transform={e.flipH?`translate(${r.x*2+r.w},0) scale(-1,1)`:undefined}/>:<rect {...rect} fill="#234039" stroke="#f6c864" strokeDasharray="5 4"/>;
   else if(e.kind==='plant')content=<PlantGlyph element={e} project={project} assets={assets} time={time}/>;
   else if(e.kind==='line')content=<line x1={r.x} y1={r.y} x2={r.x+r.w} y2={r.y+r.h} stroke={e.color} strokeWidth={e.lineWidth}/>;
   else if(e.kind==='progress')content=<g><rect {...rect} rx={e.radius} fill={e.trackColor}/><rect {...rect} width={r.w*Math.min(1,completed/Math.max(1,total))} rx={e.radius} fill={e.fill}/></g>;
   else {const cx=r.x+r.w/2,cy=r.y+r.h/2,a=e.startAngle,b=e.endAngle,span=Math.abs(b-a),rx=r.w/2,ry=r.h/2;content=<g><ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={e.fill}/>{span>=Math.PI*2-.001?<ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={e.borderColor} strokeWidth={e.borderWidth}/>:<path d={`M${cx+Math.cos(a)*rx},${cy+Math.sin(a)*ry} A${rx},${ry} 0 ${span>Math.PI?1:0} ${b>a?1:0} ${cx+Math.cos(b)*rx},${cy+Math.sin(b)*ry}`} fill="none" stroke={e.borderColor} strokeWidth={e.borderWidth}/>}</g>;}
   return <g key={e.id} opacity={e.opacity} onPointerDown={event=>start(event,e.id)} className="home-canvas-element" data-element-id={e.id}><g pointerEvents="none">{content}</g><rect {...rect} fill="transparent" stroke="none"><title>{e.name}</title></rect></g>;
  })}
  {guides&&selection&&<g className="home-selection"><rect x={selection.rect.x} y={selection.rect.y} width={selection.rect.w} height={selection.rect.h} fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="7 4" pointerEvents="none"/><rect x={selection.rect.x+selection.rect.w-7} y={selection.rect.y+selection.rect.h-7} width="14" height="14" fill="#f6c864" stroke="#183e37" strokeWidth="2" style={{cursor:'nwse-resize'}} onPointerDown={event=>start(event,selection.id!,true)}/></g>}
 </svg>;
}
