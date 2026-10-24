import test from 'node:test';
import assert from 'node:assert/strict';
import {replaceAnimationSheet} from '../src/shared/presentation/sheetReplacement.js';
import type {AnimationFrame} from '../src/shared/presentation/types.js';

test('replacing a dedicated sheet preserves calibrated poses, repeated frames and timing',()=>{
 const frames:AnimationFrame[]=[
  {asset:'library://idle.png',region:{x:0,y:0,width:300,height:285},anchor:{x:.53,y:.95},duration:1.65},
  {asset:'library://idle.png',region:{x:300,y:0,width:300,height:285},anchor:{x:.52,y:.94},duration:.12},
  {asset:'library://idle.png',region:{x:0,y:0,width:300,height:285},anchor:{x:.53,y:.95},duration:1.03},
 ];
 const before=structuredClone(frames);
 const next=replaceAnimationSheet(frames,'library://new-idle.png',{width:600,height:285})!;
 assert.deepEqual(next,frames.map(f=>({...f,asset:'library://new-idle.png'})));
 next[0].anchor!.x=.7;
 assert.deepEqual(frames,before);
 assert.equal(replaceAnimationSheet(frames,'library://small.png',{width:599,height:285}),null);
 assert.equal(replaceAnimationSheet(frames,'library://short.png',{width:600,height:284}),null);
 assert.equal(replaceAnimationSheet([frames[0],{...frames[1],asset:'library://other.png'}],'library://new.png',{width:600,height:285}),null);
 assert.equal(replaceAnimationSheet([{asset:'library://still.png',duration:1}],'library://new.png',{width:600,height:285}),null);
});
