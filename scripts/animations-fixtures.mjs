// Run after npm test. These vectors are reference data, NOT a Godot execution.
import {writeFile} from 'node:fs/promises';
import {newBubble,newCinematic,newActor} from '../dist-tests/src/shared/model.js';
import {prepareCinematic} from '../dist-tests/src/shared/geometry.js';
import {newTextAnimation,bubbleTextUnits,glyphPose,fitGlyphPose,textIntroDuration,autoDialogueDuration} from '../dist-tests/src/shared/textAnimation.js';
import {newMotion,newMovement,actorPose,actorAnchor} from '../dist-tests/src/shared/motion.js';
const text=[],motion=[];
for(const reveal of ['instant','typewriter','words','fade'])for(const effect of ['none','shout','wave','shake','bounce']) {
 const doc=newCinematic(),b=newBubble();b.id='fixture-text';b.text='e\u0301 🌱 Radis…\n👩🏽‍🌾 Attention !';b.width=.5;b.textAnimation={...newTextAnimation(reveal,effect),speed:8,delay:.1};doc.shots[0].bubbles=[b];const bubble=prepareCinematic(doc).shots[0].bubbles[0],units=bubbleTextUnits(bubble);
 for(const elapsed of [0,.1,.2,.256,.75,1.7,10])for(const completed of [false,true])for(const index of [0,2,8]) {
  const center={x:10+index*22,y:22},dimensions={x:500,y:100};const pose=glyphPose(bubble,units[index],elapsed,center.x,center.y,dimensions.x,dimensions.y,completed);
  text.push({bubble,units,unit:units[index],elapsed,completed,center,dimensions,expected:pose,fitted:fitGlyphPose(pose,center.x,center.y,24,28,500,100),intro:textIntroDuration(bubble),auto:autoDialogueDuration(bubble,completed?elapsed:undefined)});
 }
}
for(const role of ['character','enemy','prop'])for(const entry of ['none','fade','left','right','bottom','top','pop','zoom'])for(const exit of ['none','fade','left','right','top','bottom','shrink'])for(const elapsed of [0,.2,1.3,2,2.4,3,10]) {
 const actor=newActor({name:'Test',ref:'library://07_props/panneau.png'},1,.2,.4,role);actor.id='fixture-actor';actor.entry={preset:entry,delay:.2,duration:1};actor.exit={preset:exit,start:2,duration:1};actor.motion={...newMotion(role==='prop'?'flutter':role==='enemy'?'recoil':'nod'),intensity:.6,period:2};actor.movement={...newMovement(actor),duration:3,dx:.3,dy:-.1};const pose=actorPose(actor,elapsed),anchor=actorAnchor(actor,elapsed,true,.3,.22);
 motion.push({actor,elapsed,expected:{x:pose.x,y:pose.y,opacity:pose.opacity,rotation:pose.rotation,scale:pose.scale,pivotX:pose.pivotX,pivotY:pose.pivotY,anchorX:anchor.x,anchorY:anchor.y}});
}
await writeFile('godot/tests/animations_vectors.json',JSON.stringify({text,motion})+'\n');
console.log(`${text.length} text and ${motion.length} actor reference vectors generated; native Godot parity NOT run.`);
