import React from 'react';
import type {Actor,Asset} from '../../shared/model.js';
import type {GameProject} from '../../shared/game/types.js';
import type {SpeciesVisual} from '../../shared/presentation/types.js';
import {resolveActor,frameAt,attachmentPoint} from '../../shared/presentation/runtime.js';
import {SpriteGlyph,sourceGeometry} from './AnimationPreview.js';
export function cinematicSpriteGeometry(actor:Actor,project:GameProject,assets:Asset[],elapsed:number){
 if(!actor.animation)return;
 const binding=resolveActor(project,actor.animation),animation=binding.animation;if(!animation)return;
 const visual:SpeciesVisual=binding.visual??{sprite:{asset:actor.asset},width:100,height:100,baseline:0,mirror:false,tint:'#ffffff',note:''};
 const w=actor.width*1600,h=actor.height*900,scale=Math.min(w/visual.width,h/visual.height),time=Math.max(0,elapsed-actor.entry.delay)*actor.animation.speed;
 const source=frameAt(animation,time).frame??visual.sprite,size=sourceGeometry(source,assets,visual);
 const point=(name:string)=>{const local=attachmentPoint(animation,time,name,{x:size.width,y:size.height},visual.mirror,source.anchor);return {x:w*.5+local.x*scale,y:h+local.y*scale};};
 return {animation,visual,scale,time,w,h,point};
}
export function CinematicSprite({actor,project,assets,elapsed}:{actor:Actor;project:GameProject;assets:Asset[];elapsed:number}){
 const geometry=cinematicSpriteGeometry(actor,project,assets,elapsed);if(!geometry)return <text y="30" fill="white">Animation à relier</text>;
 return <g transform={`translate(${geometry.w*.5},${geometry.h}) scale(${geometry.scale})`}><SpriteGlyph animation={geometry.animation} visual={geometry.visual} assets={assets} time={geometry.time}/></g>;
}
