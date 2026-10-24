import type {AssetRef} from '../model.js';
import type {AnimationFrame} from './types.js';

/** Swap the one image of an authored sequence without losing its timing,
 * repeated poses, cropped regions or per-pose foot anchors. */
export function replaceAnimationSheet(frames:AnimationFrame[],asset:AssetRef,size:{width:number;height:number}):AnimationFrame[]|null{
 if(!frames.length||!frames.every(frame=>frame.asset===frames[0].asset&&frame.region))return null;
 if(frames.some(({region:r})=>r!.x+r!.width>size.width||r!.y+r!.height>size.height))return null;
 return frames.map(frame=>({...structuredClone(frame),asset}));
}
