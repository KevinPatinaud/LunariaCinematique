import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {seedProject} from '../src/shared/game/seed.js';
import {installCigarette,CIGARETTE} from '../src/shared/game/cigarette.js';
import {gameIssues,parseGameProject} from '../src/shared/game/validation.js';
import {newLevel,activeEnemies} from '../src/shared/game/types.js';
import {ensureCampaign} from '../src/shared/game/campaign.js';
import {attackTypeLabel} from '../src/shared/game/combat.js';
import {previewAbility} from '../src/shared/game/combatPreview.js';
import {presentationAssets,resolveAnimation} from '../src/shared/presentation/runtime.js';
import {GameDocuments} from '../src/main/gameDocuments.js';
import {publishCampaign} from '../src/main/campaignPublisher.js';
import {fixturePresentation,PIXEL_PNG} from './presentation-fixture.js';
import {duration as animationDuration,frameAt} from '../src/shared/presentation/runtime.js';
import {chooseRule} from '../src/shared/game/logic.js';

test('Cigarette is a usable enemy with a same-lane cell souffle and owned animation slots',()=>{
 const p=seedProject(),enemy=p.balance.enemies.find(e=>e.id==='cigarette')!,a=p.combat!.abilities.find(a=>a.id==='ab_cigarette_smoke')!;
 assert.ok(activeEnemies(p.balance.enemies).includes(enemy));
 assert.ok(p.balance.enemies.some(e=>e.id==="cigarette"));assert.equal(gameIssues(p).filter(i=>i.severity==='error').length,0);
 assert.equal(a.forwardCells,3);assert.equal(a.delivery,'instant');assert.equal(a.selection,'all');assert.equal(a.rowRadius,0);
 assert.equal(attackTypeLabel(a,p.combat!),'Souffle sur 3 cases devant');
 const preview=previewAbility(p,a,'cigarette','radish');assert.equal(preview.rows[0].raw,18);assert.equal(preview.interval,2.4);
 for(const slot of ['idle','move','attack','hit','death','spawn'])assert.equal(resolveAnimation(p,enemy,slot)?.ownerSpeciesId,'cigarette');
 assert.ok(presentationAssets(p).includes(CIGARETTE.visual!.sprite.asset));
 assert.equal(p.presentation!.vfx.find(v=>v.id==='vfx_cigarette_smoke')!.preset,'smoke');
});
test('all six Cigarette actions use drawn frames and the first blow agrees with the release marker',()=>{
 const p=seedProject(),enemy=p.balance.enemies.find(e=>e.id==='cigarette')!;
 const expected={idle:4,move:4,attack:8,hit:4,death:4,spawn:4};
 for(const [slot,count] of Object.entries(expected)){
  const animation=resolveAnimation(p,enemy,slot)!;
  assert.notEqual(animation.kind,'procedural');assert.equal(animation.frames.length,count);
  assert.equal(animation.ownerSpeciesId,'cigarette');
  for(const frame of animation.frames){assert.ok(frame.asset.includes('/cigarette/animations/'));assert.ok(frame.region);assert.ok(frame.anchor);}
 }
 const attack=resolveAnimation(p,enemy,'attack')!;
 assert.ok(Math.abs(animationDuration(attack)-.75)<1e-12);assert.equal(attack.markers[0].at,.28);
 assert.deepEqual(frameAt(attack,.279).frame,attack.frames[1]);assert.deepEqual(frameAt(attack,.28).frame,attack.frames[2]);
 assert.ok(p.presentation!.vfx.find(v=>v.id==='vfx_cigarette_smoke')!.asset.includes('/cigarette/effects/'));
});
test('Cigarette keeps advancing with targets in smoke range, including during cooldown',()=>{
 const p=seedProject(),enemy=p.balance.enemies.find(e=>e.id==='cigarette')!;
 const behavior=p.logic!.behaviors.find(b=>b.id===enemy.behaviorId)!;
 assert.equal(enemy.behaviorId,'ai_cigarette_contact');assert.equal(behavior.stopToAttack,false);
 const context={health:100,time:1,wave:1,enemies:1,energy:100,variables:{},target:()=>true,ready:()=>true};
 assert.equal(chooseRule(behavior,context,enemy.ability_ids!).movement,'advance');
 assert.equal(chooseRule(behavior,{...context,ready:()=>false},enemy.ability_ids!).movement,'advance');
 assert.equal(p.logic!.behaviors.find(b=>b.id==='ai_ground')!.stopToAttack,true);
});
for(const [name,patch] of [
 ['zero cells',{forwardCells:0}],['fractional cells',{forwardCells:2.5}],['too many cells',{forwardCells:9}],
 ['other rows',{rowRadius:1}],['support targeting',{target:'ally'}],['unique target',{selection:'one'}],
 ['projectile delivery',{delivery:'projectile',projectileId:'proj_seed'}],['backwards targeting',{allowBehind:true}]
] as const)test('invalid cell souffle is rejected: '+name,()=>{
 const p=seedProject();Object.assign(p.combat!.abilities.find(a=>a.id==='ab_cigarette_smoke')!,patch);assert.throws(()=>parseGameProject(p));
});
test('catalog installation is idempotent and preserves authored settings and levels',()=>{
 const p=seedProject();p.balance.enemies.find(e=>e.id==='cigarette')!.hp=333;const before=JSON.stringify(p);
 installCigarette(p);installCigarette(p);assert.equal(JSON.stringify(p),before);
});
test('Cigarette wave, graphics and cell settings survive save/reopen and real publication',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-cigarette-'));
 try{
  const p=seedProject();p.levels=[newLevel(['radish','rose'],'cigarette')];ensureCampaign(p);
  const file=path.join(root,'cigarette.game.json'),docs=new GameDocuments(path.join(root,'profile'));
  await docs.save(p,'',file);const opened=(await docs.open(file)).project;assert.deepEqual(opened,p);
  assert.equal(opened.levels[0].waves[0].groups[0].enemyId,'cigarette');
  const game=path.join(root,'game'),library=path.join(root,'library');
  for(const folder of ['app/controllers','domain/logic','domain/presentation','content/design'])await fs.mkdir(path.join(game,folder),{recursive:true});
  for(const f of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd'])await fs.writeFile(path.join(game,f),'marker');
  await fs.mkdir(library);await fs.writeFile(path.join(library,'pixel.png'),PIXEL_PNG);
  const graphic=CIGARETTE.visual!.sprite.asset.slice(10);await fs.mkdir(path.dirname(path.join(library,graphic)),{recursive:true});await fs.writeFile(path.join(library,graphic),PIXEL_PNG);
  const fixture=fixturePresentation(opened,'library://pixel.png');fixture.balance.enemies.find(e=>e.id==='cigarette')!.visual!.sprite.asset=CIGARETTE.visual!.sprite.asset;
  const published=await publishCampaign(fixture,game,'',library);const data=JSON.parse(await fs.readFile(published.path,'utf8'));
  assert.equal(data.combat.abilities.find((a:any)=>a.id==='ab_cigarette_smoke').forwardCells,3);
  assert.equal(data.balance.enemies.find((e:any)=>e.id==='cigarette').visual.sprite.asset,CIGARETTE.visual!.sprite.asset);
  assert.deepEqual(await fs.readFile(path.join(game,'LunariaArtLibrary',graphic)),PIXEL_PNG);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
