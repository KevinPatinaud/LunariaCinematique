import type {PresentationCatalog,SpeciesVisual,WalkRig} from './types.js';
const points=(pairs:number[][])=>pairs.map(([x,y])=>({x,y}));
export const ALLY_WALK_RIGS:Record<string,WalkRig>={
 radish:{stride:20.0448,lift:3.5,ground:418/429,legs:[
  {hip:{x:.61,y:.76},foot:{x:.75,y:418/429},polygon:points([[.54,.76],[.68,.76],[.94,.84],[.96,1],[.60,1],[.60,.89],[.57,.82]])},
  {hip:{x:.43,y:.76},foot:{x:.37,y:418/429},polygon:points([[.35,.76],[.53,.76],[.53,1],[.17,1],[.17,.84]])},
 ]},
 rose:{stride:20.0448,lift:4,ground:394/404,legs:[
  {hip:{x:.65,y:.76},foot:{x:.78,y:394/404},polygon:points([[.59,.76],[.75,.76],[.96,.86],[.97,1],[.57,1],[.57,.84]])},
  {hip:{x:.46,y:.76},foot:{x:.40,y:394/404},polygon:points([[.39,.76],[.55,.76],[.54,1],[.23,1],[.23,.84]])},
 ]},
 hazel:{stride:20.0448,lift:3,ground:432/443,legs:[
  {hip:{x:.58,y:.77},foot:{x:.69,y:432/443},polygon:points([[.53,.77],[.67,.77],[.72,.84],[.91,.91],[.91,1],[.48,1],[.51,.86]])},
  {hip:{x:.42,y:.77},foot:{x:.32,y:432/443},polygon:points([[.33,.77],[.50,.77],[.48,.86],[.46,1],[.15,1],[.15,.86]])},
 ]},
};
/** Only the supplied defaults/campaign opt in; existing custom projects stay authored. */
export function applyAllyWalk(catalog:PresentationCatalog,visuals:Record<string,SpeciesVisual>):void{
 for(const [kind,rig] of Object.entries(ALLY_WALK_RIGS)){
  const clip=catalog.animations.find(a=>a.id===kind+'_walk');
  if(!clip||!visuals[kind])continue;
  clip.frames=[{...structuredClone(clip.frames[0]),duration:1.2}];
  clip.kind='combined';clip.duration=1.2;clip.loop=true;
  clip.motion={preset:'walk',amplitude:1,period:1.2};
  clip.name=({radish:'Radis',rose:'Rose',hazel:'Noisetier'}[kind]??kind)+' — marche alternée';
  visuals[kind].walkRig=structuredClone(rig);
 }
}
