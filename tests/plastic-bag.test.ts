import test from 'node:test';
import assert from 'node:assert/strict';
import {seedProject} from '../src/shared/game/seed.js';
import {installPlasticBag,PLASTIC_BAG_ABILITY,PLASTIC_BAG_ANIMATIONS} from '../src/shared/game/plasticBag.js';
import {gameIssues,parseGameProject} from '../src/shared/game/validation.js';
import {attackTypeLabel} from '../src/shared/game/combat.js';
import {resolveAnimation,presentationAssets} from '../src/shared/presentation/runtime.js';
test('Sac Plastique has full drawn art and one slow attached attack in usable new projects',()=>{
 const p=seedProject(),bag=p.balance.enemies.find(e=>e.id==='plastic_bag')!,a=p.combat!.abilities.find(a=>a.id===PLASTIC_BAG_ABILITY.id)!;
 assert.deepEqual(gameIssues(p).filter(i=>i.severity==='error'),[]);
 assert.equal(bag.hp,600);assert.equal(bag.speed,.9);assert.equal(bag.attack,4);
 assert.equal(a.attachToTarget,true);assert.equal(a.blocksTargetAttack,true);assert.equal(a.cooldown,1);assert.equal(a.selection,'one');assert.equal(a.rowRadius,0);
 assert.equal(attackTypeLabel(a,p.combat!),'Étouffement au contact');
 for(const slot of ['idle','move','attack','attached','suffocate','hit','spawn','death'])assert.equal(resolveAnimation(p,bag,slot)?.ownerSpeciesId,'plastic_bag');
 assert.equal(PLASTIC_BAG_ANIMATIONS.length,8);assert.equal(new Set(presentationAssets(p).filter(a=>a.includes('/sac plastique/'))).size,7);
 const baseline=structuredClone(p);installPlasticBag(p);assert.deepEqual(p,baseline);
 assert.deepEqual(parseGameProject(JSON.parse(JSON.stringify(p))),p);
});
test('attachment cannot become a ranged, cross-lane, projectile or plant ability',()=>{
 for(const patch of [{rowRadius:1},{delivery:'projectile',projectileId:'proj_seed'},{selection:'all'},{target:'ally'},{priority:'rightmost'},{forwardCells:3},{allowBehind:true}]){
  const p=seedProject();Object.assign(p.combat!.abilities.find(a=>a.id===PLASTIC_BAG_ABILITY.id)!,patch);
  assert.ok(gameIssues(p).some(i=>i.severity==='error'&&i.path.includes(PLASTIC_BAG_ABILITY.id)),JSON.stringify(patch));
 }
 const p=seedProject();p.balance.plants[0].ability_ids=[PLASTIC_BAG_ABILITY.id];assert.ok(gameIssues(p).some(i=>i.severity==='error'&&i.path.includes('balance.plants')));
 const q=seedProject();q.combat!.abilities.find(a=>a.id===PLASTIC_BAG_ABILITY.id)!.attachToTarget=false;assert.ok(gameIssues(q).some(i=>i.message.includes('blocage')));
});
