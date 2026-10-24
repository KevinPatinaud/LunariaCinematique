import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedProject} from '../src/shared/game/seed.js';
import {parseGameProject,gameIssues} from '../src/shared/game/validation.js';
import {duplicateEnemy} from '../src/shared/game/enemyRules.js';
import {drumPoint,drumRadius,drumQuads} from '../src/shared/presentation/rollingDrum.js';
import type {RollingDrum} from '../src/shared/presentation/types.js';

const drum:RollingDrum={left:{top:{x:.204,y:.505},curve:{x:.045,y:.78},bottom:{x:.145,y:.916}},right:{top:{x:.574,y:.49},curve:{x:.504,y:.71},bottom:{x:.54,y:.91}}};
test('cylindrical material stays in its curved patch and follows reversible travel',()=>{
 const radius=drumRadius(drum,100);
 assert.ok(radius>20&&radius<22);
 assert.deepEqual(drumPoint(drum,0,0),drum.left.top);
 assert.deepEqual(drumPoint(drum,1,1),drum.right.bottom);
 for(const angle of [-3.14159,-.8,0,.4,1.9,3.14159]){
  const mesh=drumQuads(drum,angle);
  assert.ok(mesh.length>=40&&mesh.length<=50);
  for(const quad of mesh){
   assert.ok(quad.opacity>=0&&quad.opacity<=1);
   for(const p of [...quad.destination,...quad.source])assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1);
  }
 }
 const forward=drumQuads(drum,-.5),backward=drumQuads(drum,.5);
 assert.notDeepEqual(forward[12].source,backward[12].source);
 assert.deepEqual(drumQuads(drum,0),drumQuads(drum,Math.PI));
 const a=drumQuads(drum,.5),b=drumQuads(drum,.5);
 assert.deepEqual(a,b); // Time is deliberately absent: stopping freezes the material.
});
test('drum authoring survives copy and JSON, while malformed patches are rejected',()=>{
 const p=parseGameProject(seedProject()),enemy=duplicateEnemy(p,'truck');
 enemy.visual!.rollingDrums=[structuredClone(drum)];
 assert.doesNotThrow(()=>parseGameProject(JSON.parse(JSON.stringify(p))));
 const copy=duplicateEnemy(p,enemy.id);
 assert.deepEqual(copy.visual!.rollingDrums,enemy.visual!.rollingDrums);
 copy.visual!.rollingDrums![0].left.top.x=.3;
 assert.equal(enemy.visual!.rollingDrums[0].left.top.x,drum.left.top.x);
 for(const malformed of [
  {...drum,left:{...drum.left,curve:{x:.1,y:.2}}},
  {...drum,right:{...drum.right,top:{x:.1,y:.49}}},
  {...drum,left:{...drum.left,top:{x:-.1,y:.5}}},
 ]){enemy.visual!.rollingDrums=[structuredClone(malformed)];assert.ok(gameIssues(p).some(x=>x.severity==='error'));}
});
