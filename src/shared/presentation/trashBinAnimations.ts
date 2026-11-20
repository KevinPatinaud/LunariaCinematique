import type {AnimationDefinition,AnimationProfile,SpeciesVisual,SpriteSource} from './types.js';

const ASSET='library://03_enemies/poubelle/animations/poubelle_combat_sheet_v01.png';
// Keep the generated atlas intact. Equal-sized regions preserve scale, while the
// measured bottom-rim anchors keep the metal body planted between drawings.
const X=[8,326,642,940],Y=[0,312,624,936],SIZE=314;
const ANCHORS=[
 [[148,310],[145.5,309],[140,310],[155.5,309]],
 [[147.5,306],[143.5,305],[137,305],[154.5,306]],
 [[148.5,304],[140.5,304],[141,306],[156,306]],
 [[151,287],[143,281],[143.5,280],[155,285]],
];
function source(row:number,col:number):SpriteSource{
 const [x,y]=ANCHORS[row][col];
 return {asset:ASSET,region:{x:X[col],y:Y[row],width:SIZE,height:SIZE},anchor:{x:x/SIZE,y:y/SIZE}};
}
function animation(row:number,id:string,name:string,times:number[],loop=false):AnimationDefinition{
 const duration=times.reduce((sum,n)=>sum+n,0);
 return {id,name,ownerSpeciesId:'poubelle',kind:'frames',frames:times.map((duration,col)=>({...source(row,col),duration})),duration,loop,
  anchor:{x:.5,y:1},transform:{x:0,y:0,rotation:0,scaleX:1,scaleY:1,opacity:1},
  motion:{preset:'none',amplitude:0,period:duration},
  attachments:[{id:'feet',x:.47,y:.98},{id:'center',x:.47,y:.55},{id:'head',x:.47,y:.33},{id:'launch',x:.25,y:.4}],markers:[]};
}
export const TRASH_BIN_ANIMATIONS:AnimationDefinition[]=[
 animation(0,'poubelle_idle','Poubelle — veille et clignement',[1.1,.55,.12,.65],true),
 animation(1,'poubelle_spawn','Poubelle — ouverture du couvercle',[.14,.12,.18,.2]),
 animation(2,'poubelle_hit','Poubelle — choc sur le métal',[.05,.11,.12,.12]),
 animation(3,'poubelle_death','Poubelle — écrasement',[.16,.22,.24,.38]),
];
export const TRASH_BIN_PROFILE:AnimationProfile={id:'profile_poubelle',name:'Poubelle fixe',slots:[
 {slot:'idle',animationId:'poubelle_idle'},{slot:'move',animationId:'poubelle_idle'},
 // Base slots must resolve in the shared contract. With no abilities, this
 // fallback is a one-shot lid opening, with no attack or release marker.
 {slot:'attack',animationId:'poubelle_spawn'},{slot:'spawn',animationId:'poubelle_spawn'},
 {slot:'hit',animationId:'poubelle_hit'},{slot:'death',animationId:'poubelle_death'},
 {slot:'victory',animationId:'poubelle_idle'},
],events:[]};
export const TRASH_BIN_VISUAL:SpeciesVisual={sprite:source(0,0),width:110,height:116,baseline:33,mirror:false,tint:'#ffffff',
 note:'Poubelle fixe, posée au sol ; 16 poses dessinées (attente, apparition, impact, destruction). Bloque les ennemis de son allée et laisse passer leurs projectiles.'};
