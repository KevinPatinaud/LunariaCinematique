import test from 'node:test';
import assert from 'node:assert/strict';
import {seedProject} from '../src/shared/game/seed.js';
import {parseGameProject} from '../src/shared/game/validation.js';
import {duration,frameAt,resolveAnimation} from '../src/shared/presentation/runtime.js';

test('Poubelle uses its four drawn actions and an inert attack fallback',()=>{
 const p=seedProject();parseGameProject(p);const bin=p.balance.enemies.find(e=>e.id==='poubelle')!;
 assert.equal(bin.speed,0);assert.equal(bin.attack,0);assert.deepEqual(bin.ability_ids,[]);
 assert.equal(resolveAnimation(p,bin,'attack'),resolveAnimation(p,bin,'spawn'));
 assert.deepEqual(resolveAnimation(p,bin,'attack')!.markers,[]);
 assert.equal(resolveAnimation(p,bin,'move'),resolveAnimation(p,bin,'idle'));
 for(const slot of ['idle','spawn','hit','death']){
  const a=resolveAnimation(p,bin,slot)!;assert.equal(a.ownerSpeciesId,'poubelle');assert.equal(a.frames.length,4);
  assert.equal(a.transform.scaleX,1);assert.equal(a.transform.scaleY,1);
  let t=0;
  for(const [i,f] of a.frames.entries()){
   assert.equal(frameAt(a,t+f.duration/2).index,i);t+=f.duration;
   assert.deepEqual({width:f.region!.width,height:f.region!.height},{width:314,height:314});
   assert.ok(f.region!.x+314<=1254&&f.region!.y+314<=1254);
  }
  assert.ok(Math.abs(t-duration(a))<1e-9);
 }
 // The still used in cards and the first idle drawing have identical framing.
 const {duration:_,...idle}=resolveAnimation(p,bin,'idle')!.frames[0];
 assert.deepEqual(bin.visual!.sprite,idle);
});
