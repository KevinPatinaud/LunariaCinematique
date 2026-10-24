import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sample,releasePlan} from '../src/shared/presentation/runtime.js';
import {parseGameProject,gameIssues} from '../src/shared/game/validation.js';
import {seedProject} from '../src/shared/game/seed.js';

test('mechanical press remains rigid and strikes at its release marker',()=>{
 const p=parseGameProject(seedProject()),a=p.presentation!.animations.find(x=>x.id==='default_attack')!;
 a.duration=.9;a.loop=false;a.motion={preset:'press',amplitude:1,period:.9};
 a.markers=[{id:'release',type:'release',at:.405,ref:'',attach:'launch'}];
 assert.equal(gameIssues(p).filter(x=>x.severity==='error').length,0);
 assert.equal(parseGameProject(JSON.parse(JSON.stringify(p))).presentation!.animations.find(x=>x.id===a.id)!.motion.preset,'press');
 const body={y:a.transform.y,rotation:a.transform.rotation,scaleX:a.transform.scaleX,scaleY:a.transform.scaleY,opacity:a.transform.opacity};
 for(let i=0;i<=180;i++){
  const pose=sample(a,i*.005),{x,...rest}=pose;
  assert.deepEqual(rest,body);
  assert.ok(x>=a.transform.x-18.000001&&x<=a.transform.x+6.000001);
 }
 assert.deepEqual(sample(a,0),a.transform);
 assert.ok(Math.abs(sample(a,.288).x-a.transform.x-6)<1e-8);
 assert.ok(Math.abs(sample(a,.405).x-a.transform.x+18)<1e-8);
 assert.equal(sample(a,.5).x,a.transform.x-18);
 assert.deepEqual(sample(a,.9),a.transform);
 assert.deepEqual(sample(a,.405,true),a.transform);
 const ability=p.combat!.abilities.find(x=>x.id==='ab_enemy_contact')!;
 const plan=releasePlan(p,p.balance.enemies[0],ability,1);
 assert.equal(plan.delay,.405);
 const faster=releasePlan(p,p.balance.enemies[0],ability,.45);
 assert.equal(faster.delay,.2025);
 assert.ok(Math.abs(sample(a,faster.delay*faster.speed).x-a.transform.x+18)<1e-8);
});
