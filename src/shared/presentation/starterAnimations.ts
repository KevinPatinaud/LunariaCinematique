import type {AnimationDefinition,AnimationFrame,PresentationCatalog,SpriteSource} from './types.js';

type Starter='radish'|'rose';
// Each action has its own sheet. Crops keep the measured source dimensions and
// foot anchors so repacking never changes the actor's apparent size or baseline.
const SHEETS={
 radish:{directory:'02_characters/radis/stage_01/animations',scale:1.13,
  anchors:[[.522970,.940351],[.520505,.940351],[.457760,.975439],[.525505,.947368],[.483684,.961404],[.622172,.950877],[.547359,.954386],[.572515,.954386],[.432998,.957895],[.485949,.940351],[.5,.961404],[.5,.982456],[.563336,.957895],[.526371,.954386],[.480761,.957895],[.607445,.971930]]},
 rose:{directory:'02_characters/Rose/stage_01/animations',scale:1.04,
  anchors:[[.518577,.968421],[.498364,.975439],[.462274,.975439],[.517661,.971930],[.512887,.957895],[.591033,.957895],[.506314,.957895],[.639808,.957895],[.438277,.933333],[.463893,.933333],[.5,.950877],[.5,.971930],[.526564,.950877],[.536445,.950877],[.458517,.950877],[.550989,.950877]]},
} as const;

function actionAsset(species:Starter,slot:string):SpriteSource['asset']{
 return `library://${SHEETS[species].directory}/${species}_${slot}_v01.png`;
}
function source(species:Starter,index:number,slot:string,frameIndex:number):SpriteSource{
 const sheet=SHEETS[species],anchor=sheet.anchors[index];
 return {asset:actionAsset(species,slot),region:{x:frameIndex*(slot==='counter'?470:300),y:0,width:300,height:285},anchor:{x:anchor[0],y:anchor[1]}};
}
function clip(species:Starter,slot:string,name:string,poses:number[],times:number[],loop=false,preset:AnimationDefinition['motion']['preset']='none',amplitude=0):AnimationDefinition{
 const duration=times.reduce((sum,t)=>sum+t,0),scale=SHEETS[species].scale;
 return {id:`${species}_${slot}`,ownerSpeciesId:species,name:`${species==='radish'?'Radis':'Rose'} — ${name}`,kind:preset==='none'?'frames':'combined',
  frames:poses.map((pose,i)=>({...source(species,pose,slot,i),duration:times[i]})),duration,loop,anchor:{x:.5,y:1},
  transform:{x:0,y:0,rotation:0,scaleX:scale,scaleY:scale,opacity:1},motion:{preset,amplitude,period:duration},
  attachments:[{id:'feet',x:.5,y:.96},{id:'center',x:.5,y:.55},{id:'head',x:.5,y:.22},{id:'launch',x:.84,y:.52}],markers:[]};
}
function repeats(original:AnimationFrame[],indices:number[],times:number[]):AnimationFrame[]{
 return indices.map((index,i)=>({...structuredClone(original[index]),duration:times[i]}));
}
export function improveStarterPresentation(catalog:PresentationCatalog):void{
 for(const species of ['radish','rose'] as const){
  const profile=catalog.profiles.find(p=>p.id===`profile_${species}`);
  if(!profile)continue;
  const actions=[
   clip(species,'idle','veille et clignement',[0,1,0],[1.65,.12,1.03],true,'breath',.45),
   clip(species,'spawn','réception et mise en garde',[2,3,0],[.10,.12,.18]),
   clip(species,'hit','garde, impact et reprise',[4,5,6,0],[.045,.09,.10,.085]),
   clip(species,'death','affaiblissement et chute',[8,9,10,11,11],[.14,.18,.20,.25,.35]),
   clip(species,'victory','joie et salut',[12,13,14,15,0],[.16,.20,.20,.32,.22]),
   clip(species,'stunned','étourdissement',[8,9,8],[.25,.3,.25],true,'sway',.18),
  ];
  for(const action of actions){
   const old=catalog.animations.findIndex(a=>a.id===action.id);
   if(old>=0)catalog.animations[old]=action;else catalog.animations.push(action);
   const slot=action.id.slice(species.length+1);
   const binding=profile.slots.find(b=>b.slot===slot);
   if(binding)binding.animationId=action.id;else profile.slots.push({slot,animationId:action.id});
  }
  const walk=catalog.animations.find(a=>a.id===`${species}_walk`);
  if(walk&&walk.motion.preset!=='walk'){
   // Calibrated crops keep the silhouette steady; equal exposures avoid
   // accelerating through alternate poses during the slow escort walk.
   walk.frames.forEach(frame=>frame.duration=.18);
   walk.duration=1.08;walk.motion.period=1.08;
   walk.name=`${species==='radish'?'Radis':'Rose'} — marche, appuis et passage`;
  }
 }
 const shot=catalog.animations.find(a=>a.id==='radish_throw');
 if(shot){
  // Same four original slingshot drawings and exact 182 ms release. The
  // release pose is snappy and the relaxed hand has time to settle.
  shot.frames=shot.frames.slice(0,4);
  shot.frames.forEach((frame,i)=>frame.duration=[.052,.13,.048,.12][i]);
  shot.duration=.35;shot.name='Radis — tension, lâcher et retour du lance-pierre';
  shot.kind='combined';shot.motion={preset:'recoil',amplitude:.18,period:.35};
 }
 const punch=catalog.animations.find(a=>a.id==='rose_punch_combo');
 const profile=catalog.profiles.find(p=>p.id==='profile_rose');
 if(punch&&profile){
  // The four original drawings remain the source of every melee strike.
  // When reapplied to an upgraded catalog, recover those four unique poses.
  const originals:AnimationFrame[]=[];
  for(const f of punch.frames)if(!originals.some(o=>JSON.stringify(o.region)===JSON.stringify(f.region)))originals.push(f);
  punch.frames=repeats(originals,[0,1,2,1,3,1,2,0],[.10,.22,.08,.04,.10,.04,.13,.14]);
  punch.duration=.85;punch.name='Rose — garde et trois frappes au corps à corps';
  punch.kind='combined';punch.motion={preset:'none',amplitude:0,period:.85};
  const counter=structuredClone(punch);
  counter.id='rose_counter';counter.name='Rose — esquive et contre-attaque';
  // This action starts on a successful contact dodge, whose gameplay damage
  // remains immediate. No release marker: it must never schedule a second hit.
  counter.frames=[{...source('rose',7,'counter',0),duration:.10},{...source('rose',4,'counter',1),duration:.06},
   ...repeats(originals,[2,1,3,1,2,0],[.07,.035,.08,.035,.10,.12]).map((frame,i)=>({...frame,
    asset:actionAsset('rose','counter'),region:{...frame.region!,x:(i+2)*470,y:0}}))];
  counter.duration=.60;counter.markers=[];counter.motion.period=.60;
  const old=catalog.animations.findIndex(a=>a.id===counter.id);
  if(old>=0)catalog.animations[old]=counter;else catalog.animations.push(counter);
  const binding=profile.slots.find(b=>b.slot==='counter');
  if(binding)binding.animationId=counter.id;else profile.slots.push({slot:'counter',animationId:counter.id});
 }
}
