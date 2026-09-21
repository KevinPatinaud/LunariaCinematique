// Run after `npm test`. Fixtures are a language-neutral contract, not a Godot execution.
import { mkdir, writeFile } from 'node:fs/promises';
import { newActor } from '../dist-tests/src/shared/model.js';
import { newMotion, newMovement, actorPose, actorAnchor } from '../dist-tests/src/shared/motion.js';
const asset={name:'Test',ref:'library://07_props/panneau.png'},vectors=[];
for(const preset of ['none','float','sway','pulse','spin','shake','bounce','nod','recoil','heartbeat','flutter'])for(const pivot of ['top','center','bottom'])for(const flipX of [false,true])for(const elapsed of [0,.3,1.5,3.7,9.1]){
 const actor={...newActor(asset,.8,.18,.36),id:'actor',role:'prop',rotation:31,pivot,flipX,entry:{preset:'fade',delay:.2,duration:.6},motion:{...newMotion(preset),period:2.4,delay:.1,reverse:flipX}};
 actor.movement={...newMovement(actor),dx:.2,dy:-.1,delay:.15,repeat:'pingpong',duration:1.7};
 const pose=actorPose(actor,elapsed),anchor=actorAnchor(actor,elapsed,true,.3,.22);
 vectors.push({actor,elapsed,expected:{x:pose.x,y:pose.y,opacity:pose.opacity,rotation:pose.rotation,scale:pose.scale,pivotX:pose.pivotX,pivotY:pose.pivotY,anchorX:anchor.x,anchorY:anchor.y}});
}
await mkdir('godot/tests',{recursive:true});
await writeFile('godot/tests/motion_vectors.json',JSON.stringify(vectors,null,2)+'\n');
console.log(`${vectors.length} motion vectors written (Godot parity NOT executed by this script).`);
