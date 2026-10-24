import test from 'node:test';
import assert from 'node:assert/strict';
import {seedProject} from '../src/shared/game/seed.js';
import {parseGameProject} from '../src/shared/game/validation.js';
import {duration,frameAt,resolveAnimation} from '../src/shared/presentation/runtime.js';
import {improveStarterPresentation} from '../src/shared/presentation/starterAnimations.js';

test('starter actions survive save/reopen, retain their art and release timings',()=>{
 const p=seedProject();parseGameProject(p);
 for(const id of ['radish','rose']){
  const s=p.balance.plants.find(s=>s.id===id)!;
  for(const slot of ['idle','move','attack','spawn','hit','death','victory','stunned']){
   const a=resolveAnimation(p,s,slot)!;
   assert.equal(a.ownerSpeciesId,id);assert.ok(a.frames.length>=(slot==='move'?1:3));
   assert.ok(Math.abs(duration(a)-a.duration)<1e-8,`${id}/${slot} duration`);
  }
  const before=JSON.stringify(p.presentation);improveStarterPresentation(p.presentation!);
  assert.equal(JSON.stringify(p.presentation),before,'upgrade is idempotent');
 }
 const reopened=parseGameProject(JSON.parse(JSON.stringify(p)));
 assert.deepEqual(reopened.presentation,p.presentation);
 const radish=p.balance.plants.find(s=>s.id==='radish')!,rose=p.balance.plants.find(s=>s.id==='rose')!;
 const shot=resolveAnimation(p,radish,'attack')!,punch=resolveAnimation(p,rose,'attack')!;
 assert.ok(shot.frames.every(f=>f.asset==='library://combat/animation/animation_radish.png'));
 assert.equal(frameAt(shot,.182).index,2);
 assert.equal(frameAt(punch,.32).index,2);
 assert.ok(punch.frames.every(f=>f.asset.endsWith('/rose_combat_sheet_v02.png')));
 assert.equal(shot.markers.find(m=>m.type==='release')!.at,.182);
 assert.equal(punch.markers.find(m=>m.type==='release')!.at,.32);
 const counter=resolveAnimation(p,rose,'counter')!;
 assert.equal(counter.frames.length,8);assert.deepEqual(counter.markers,[]);
 assert.ok(counter.frames.every(f=>f.asset.endsWith('/rose_counter_v01.png')));
 // A replacement affects just one action; no shared multi-action atlas remains.
 const assets=new Set<string>();
 for(const animation of p.presentation!.animations.filter(a=>['radish','rose'].includes(a.ownerSpeciesId??''))){
  assert.equal(new Set(animation.frames.map(f=>f.asset)).size,1,animation.id);
  assert.ok(!assets.has(animation.frames[0].asset),animation.id+' has a dedicated image');
  assets.add(animation.frames[0].asset);
 }
 assert.equal(assets.size,17);
});
