import test from 'node:test';
import assert from 'node:assert/strict';
import {seedProject} from '../src/shared/game/seed.js';
import {parseGameProject} from '../src/shared/game/validation.js';
import {duration,frameAt,presentationAssets,resolveAnimation} from '../src/shared/presentation/runtime.js';
import {POLLUTER_ANIMATIONS,PLAQUE_SLIME_PRESENTATION} from '../src/shared/presentation/polluterAnimations.js';
test('Plaque and Canette defaults use owned drawn actions with stable calibration',()=>{
 const p=seedProject();parseGameProject(p);
 for(const id of ['plaque','runner']){
  const species=p.balance.enemies.find(e=>e.id===id)!;
  for(const slot of ['idle','move','attack','hit','spawn','death']){
   const a=resolveAnimation(p,species,slot)!;
   assert.equal(a.ownerSpeciesId,id);assert.notEqual(a.kind,'procedural');assert.equal(a.frames.length,slot==='attack'?8:4);
   assert.equal(a.transform.scaleX,1);assert.equal(a.transform.scaleY,1);
   for(const f of a.frames){assert.ok(f.region);assert.ok(f.anchor);assert.ok(f.anchor!.x>=0&&f.anchor!.x<=1);assert.ok(f.anchor!.y>=0&&f.anchor!.y<=1);}
  }
 }
 const plaque=p.balance.enemies.find(e=>e.id==='plaque')!;
 assert.equal(plaque.speed,0);assert.equal(resolveAnimation(p,plaque,'idle'),resolveAnimation(p,plaque,'move'));
 assert.equal(POLLUTER_ANIMATIONS.filter(a=>a.id!=='plaque_slime_projectile').reduce((n,a)=>n+a.frames.length,0),52);
 assert.deepEqual(p.combat!.projectiles.find(q=>q.id==='proj_plaque_slime')!.presentation,PLAQUE_SLIME_PRESENTATION);
 assert.ok(presentationAssets(p).includes(PLAQUE_SLIME_PRESENTATION.asset));
});
test('first drawn attacks align with unchanged damage markers and clip durations',()=>{
 const p=seedProject();
 for(const [id,d,release]of [['plaque',.57,.18],['runner',.35,.1]] as const){
  const a=resolveAnimation(p,p.balance.enemies.find(e=>e.id===id)!,'attack')!;
  assert.ok(Math.abs(duration(a)-d)<1e-12);assert.equal(a.markers[0].at,release);
  assert.equal(frameAt(a,release-1e-6).index,1);assert.equal(frameAt(a,release).index,2);
 }
 const ability=p.combat!.abilities.find(a=>a.id==='ab_plaque_spit')!;
 assert.equal(ability.cooldown,2.7);assert.equal(ability.initialDelay,1);assert.equal(ability.priority,'nearest_right');assert.equal(ability.allowBehind,true);
});
