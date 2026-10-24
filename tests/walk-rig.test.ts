import test from 'node:test';
import assert from 'node:assert/strict';
import {ALLY_WALK_RIGS} from '../src/shared/presentation/allyWalk.js';
import {walkFoot,walkPoint,walkWeight} from '../src/shared/presentation/walkRig.js';

for(const [kind,rig] of Object.entries(ALLY_WALK_RIGS))test(kind+' alternates grounded feet without head movement or sliding',()=>{
 const size={x:80,y:80},period=1.2;
 for(let leg=0;leg<2;leg++){
  assert.equal(walkWeight(rig.legs[leg].foot,rig,leg),1);
  const first=walkFoot(rig,leg,0,period,size),later=walkFoot(rig,leg,.05,period,size);
  assert.equal(first.y,rig.ground);assert.equal(later.y,rig.ground);
  assert.ok(Math.abs((later.x-first.x)*size.x+27.84*.05)<1e-8);
 }
 assert.ok(walkFoot(rig,0,0,period,size).x>rig.legs[0].hip.x);
 assert.ok(walkFoot(rig,0,period/2,period,size).x<rig.legs[0].hip.x);
 assert.ok(walkFoot(rig,1,0,period,size).x<rig.legs[1].hip.x);
 assert.ok(walkFoot(rig,1,period/2,period,size).x>rig.legs[1].hip.x);
 for(let i=0;i<120;i++){
  const t=i/100,head={x:.5,y:.35};
  assert.deepEqual(walkPoint(head,rig,t,period,size),head);
  const a=walkPoint({x:.7,y:.92},rig,t,period,size),b=walkPoint({x:.7,y:.92},rig,t+period,period,size);
  assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-8);
  assert.ok(Math.hypot(a.x-walkPoint({x:.7,y:.92},rig,t+.001,period,size).x,a.y-walkPoint({x:.7,y:.92},rig,t+.001,period,size).y)<.002);
 }
 // Half-speed travel uses a half-speed gait, retaining the same grounded point.
 const a=walkFoot(rig,0,0,period,size),b=walkFoot(rig,0,.05*.5,period,size);
 assert.ok(Math.abs((b.x-a.x)*size.x+27.84*.05*.5)<1e-8);
});
