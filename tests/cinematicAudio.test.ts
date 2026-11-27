import test from 'node:test';
import assert from 'node:assert/strict';
import { newCinematic, newShot, newBubble, newActor, copy, duplicateShot, duplicateCinematic, referencedAssets, upgradeCinematicFormat, type Asset, type MusicTrack, type SoundCue } from '../src/shared/model.js';
import { soundTargetTime, audioGain, repairAudioLinks, shotExitDuration, musicStartTime, musicHandoffTime } from '../src/shared/cinematicAudio.js';
import { beginPlayback, tickPlayback, advanceDialogue } from '../src/shared/playback.js';
import { parseCinematic } from '../src/shared/schema.js';
import { smartDuplicate } from '../src/shared/studio.js';
import { CinematicAudioPlayer } from '../src/renderer/audio/CinematicAudioPlayer.js';

const asset:Asset={ref:'library://audio/song.wav',url:'test://song',path:'audio/song.wav',kind:'audio',name:'Song',folder:'audio',bytes:100,modified:0,thumbnail:''};
const settings={asset:asset.ref,volume:.8,loop:true,fadeIn:2,fadeOut:1};
function fixture(){const doc=newCinematic();doc.shots=[newShot(),newShot(),newShot()];doc.shots.forEach((s,i)=>{s.duration=2;s.dialogueStart=0;s.transition={type:'cut',duration:0};s.name=`Plan ${i+1}`;});doc.musicTracks=[{...settings,id:'music',startShotId:doc.shots[0].id,endShotId:doc.shots[1].id}];return doc;}
function cue(patch:Partial<SoundCue>={}):SoundCue{return {...settings,fadeIn:0,fadeOut:0,loop:false,id:'cue',event:'shot_start',targetId:'',delay:0,duration:0,...patch};}
class FakeAudio {
  loop=false;preload='';volume=0;paused=true;ended=false;duration=60;readyState=4;currentTime=0;dataset:Record<string,string>={};plays=0;removed=false;
  listeners=new Map<string,()=>void>();
  addEventListener(name:string,fn:()=>void){this.listeners.set(name,fn);}
  removeEventListener(name:string){this.listeners.delete(name);}
  play(){this.plays++;this.paused=false;return Promise.resolve();}
  pause(){this.paused=true;}
  removeAttribute(){this.removed=true;}
  load(){}
}
function player(){const voices:FakeAudio[]=[],errors:string[]=[];const engine=new CinematicAudioPlayer(m=>errors.push(m),()=>{const a=new FakeAudio();voices.push(a);return a as unknown as HTMLAudioElement;});return {engine,voices,errors};}

test('music survives a slide boundary and ends only after its inclusive final slide and fade',()=>{
  const d=fixture(),{engine,voices}=player();let s=beginPlayback();engine.sync(d,s,[asset]);
  s=tickPlayback(d,s,1);engine.sync(d,s,[asset]);assert.equal(voices[0].volume,.4);
  s=tickPlayback(d,s,1);engine.sync(d,s,[asset]);assert.equal(s.shotIndex,1);assert.equal(voices.length,1);assert.equal(voices[0].plays,1);
  s=tickPlayback(d,s,2.5);engine.sync(d,s,[asset]);assert.equal(s.shotIndex,1);assert.equal(s.exitElapsed,.5);assert.equal(voices[0].volume,.4);
  s=tickPlayback(d,s,.5);engine.sync(d,s,[asset]);assert.equal(s.shotIndex,2);assert.equal(voices[0].removed,true);engine.stop();
});
test('click-controlled ending keeps music and its clock alive until the user advances',()=>{
  const d=fixture();d.shots[1].endAdvance='click';let s=tickPlayback(d,beginPlayback(),9);
  assert.equal(s.shotIndex,1);assert.equal(s.elapsed,7);assert.equal(s.clock,9);assert.equal(s.exitElapsed,undefined);
  s=advanceDialogue(d,s);assert.equal(s.exitElapsed,0);s=tickPlayback(d,s,1);assert.equal(s.shotIndex,2);
});
test('bubble events record real opening times, including slow frames and click delays',()=>{
  const d=fixture(),shot=d.shots[0];shot.bubbles=[newBubble(),newBubble()];shot.dialogueStart=.5;
  let s=tickPlayback(d,beginPlayback(),8);s=advanceDialogue(d,s);
  assert.equal(s.bubbleOpenedAt?.[shot.bubbles[0].id],.5);assert.equal(s.bubbleOpenedAt?.[shot.bubbles[1].id],8);
  const c=cue({event:'bubble_open',targetId:shot.bubbles[1].id,delay:.25});assert.equal(soundTargetTime(shot,c,s.bubbleOpenedAt!),8.25);
  shot.bubbles.forEach(b=>b.advance={mode:'auto',seconds:1});s=tickPlayback(d,beginPlayback(),1.75);
  assert.equal(s.bubbleOpenedAt?.[shot.bubbles[1].id],1.5);
});
test('delayed bubble cue plays once even after the bubble was closed',()=>{
  const d=fixture(),shot=d.shots[0],b=newBubble();shot.bubbles=[b];shot.duration=20;shot.sounds=[cue({event:'bubble_open',targetId:b.id,delay:2})];
  const {engine,voices}=player();let s=tickPlayback(d,beginPlayback(),.5);engine.sync(d,s,[asset]);s=advanceDialogue(d,s);s=tickPlayback(d,s,2);engine.sync(d,s,[asset]);engine.sync(d,s,[asset]);assert.equal(voices.length,2);assert.equal(voices[1].plays,1);assert.equal(voices[1].currentTime,.5);engine.stop();
});
test('pause, loading, resume and stop preserve music instances and release resources',async()=>{
  const d=fixture(),{engine,voices}=player();const s=beginPlayback();engine.sync(d,s,[asset]);await Promise.resolve();await Promise.resolve();
  engine.sync(d,{...s,paused:true},[asset]);assert.equal(voices[0].paused,true);
  engine.sync(d,s,[asset],false);assert.equal(voices[0].paused,true);
  engine.sync(d,s,[asset]);assert.equal(voices.length,1);assert.equal(voices[0].paused,false);
  engine.stop();assert.equal(voices[0].removed,true);assert.equal(voices[0].listeners.size,0);
});
test('starting inside a music range plays it from the start and non-looping completion never restarts',()=>{
  const d=fixture();d.musicTracks![0].loop=false;const {engine,voices}=player();let s=beginPlayback(1);engine.sync(d,s,[asset]);assert.equal(voices[0].currentTime,0);
  voices[0].ended=true;s=tickPlayback(d,s,.5);engine.sync(d,s,[asset]);engine.sync(d,s,[asset]);assert.equal(voices.length,1);engine.stop();
});
test('envelopes, finite sound duration and overlapping tracks are independent',()=>{
  assert.equal(audioGain(settings,1),.4);assert.equal(audioGain(settings,10,.25),.2);
  const d=fixture();d.musicTracks!.push({...d.musicTracks![0],id:'other'});d.shots[0].sounds=[cue({loop:true,duration:1,fadeOut:.4})];
  const {engine,voices}=player();let s=beginPlayback();engine.sync(d,s,[asset]);s=tickPlayback(d,s,.8);engine.sync(d,s,[asset]);assert.equal(voices.length,3);assert.ok(Math.abs(voices[2].volume-.4)<1e-8);
  s=tickPlayback(d,s,.2);engine.sync(d,s,[asset]);assert.equal(voices[2].removed,true);assert.equal(voices[0].removed,false);engine.stop();
});
test('animation triggers follow entrance and movement timing and ignore disabled animations',()=>{
  const d=fixture(),shot=d.shots[0];const a=newActor({...asset,path:'image.png',ref:'library://image.png',kind:'character'},1);shot.actors=[a];a.entry={preset:'left',duration:1,delay:.5};a.movement={enabled:true,dx:1,dy:0,duration:3,delay:2,easing:'linear',repeat:'once'};
  assert.equal(soundTargetTime(shot,cue({event:'actor_movement',targetId:a.id,delay:.1}),{}),3.6);
  a.movement.enabled=false;assert.equal(soundTargetTime(shot,cue({event:'actor_movement',targetId:a.id}),{}),undefined);
});
test('schema validates sound references, range order, bounds, and unique IDs',()=>{
  const d=fixture();d.shots[0].sounds=[cue()];assert.doesNotThrow(()=>parseCinematic(d));
  for(const edit of [(x:typeof d)=>x.musicTracks![0].endShotId='missing',(x:typeof d)=>x.musicTracks![0].fadeIn=-1,(x:typeof d)=>x.shots[0].sounds![0].asset='library://x.png',(x:typeof d)=>x.shots[0].sounds![0].id='music',(x:typeof d)=>x.shots[0].sounds![0].targetId='bad']){const x=copy(d);edit(x);assert.throws(()=>parseCinematic(x));}
  assert.deepEqual(referencedAssets(d),[asset.ref]);
});
test('duplication remaps music ranges, cue targets and IDs without changing the original',()=>{
  const d=fixture(),s=d.shots[0];s.bubbles=[newBubble()];s.sounds=[cue({event:'bubble_open',targetId:s.bubbles[0].id})];
  const dup=duplicateShot(s);assert.equal(dup.sounds![0].targetId,dup.bubbles[0].id);assert.notEqual(dup.sounds![0].id,s.sounds[0].id);
  const film=duplicateCinematic(d);assert.equal(film.musicTracks![0].startShotId,film.shots[0].id);assert.equal(film.musicTracks![0].endShotId,film.shots[1].id);assert.doesNotThrow(()=>parseCinematic(film));
  assert.equal(smartDuplicate(s,{audio:false,dialogues:true,entrances:true}).sounds!.length,0);
  assert.equal(smartDuplicate(s,{audio:true,dialogues:false,entrances:true}).sounds!.length,0);
});
test('delete and reorder repair links within the same undoable edit',()=>{
  const before=fixture(),d=copy(before);d.shots.splice(0,1);repairAudioLinks(d,before);assert.equal(d.musicTracks![0].startShotId,d.shots[0].id);assert.doesNotThrow(()=>parseCinematic(d));
  const reversed=copy(before);reversed.shots.reverse();repairAudioLinks(reversed,before);assert.equal(reversed.musicTracks![0].startShotId,before.shots[1].id);assert.doesNotThrow(()=>parseCinematic(reversed));
  d.shots.shift();repairAudioLinks(d,before);assert.equal(d.musicTracks!.length,0);
});
test('visual and audio exit use their longest duration without skipping the last fade',()=>{
  const d=fixture();d.shots[1].exitTransition={type:'fade',duration:3};assert.equal(shotExitDuration(d,1),3);
  d.musicTracks![0].fadeOut=4;assert.equal(shotExitDuration(d,1),4);upgradeCinematicFormat(d);assert.doesNotThrow(()=>parseCinematic(d));
});
test('inactive, delayed and already finished cues never add an empty fade to the end of a slide',()=>{
  const d=fixture();d.musicTracks=[];d.shots[0].sounds=[cue({delay:20,fadeOut:10})];assert.equal(tickPlayback(d,beginPlayback(),2).shotIndex,1);
  d.shots[0].sounds=[cue({duration:1,fadeOut:10})];assert.equal(tickPlayback(d,beginPlayback(),2).shotIndex,1);
  d.shots[0].sounds=[cue({duration:3,fadeOut:1})];const s=tickPlayback(d,beginPlayback(),2.5);assert.equal(s.shotIndex,0);assert.equal(s.exitElapsed,.5);
});
test('music track synced to first_enemy waits for earliest enemy appearance and hands off previous music cleanly',()=>{
  const d=fixture();
  d.shots[1].duration=7;
  const e1=newActor({...asset,path:'enemy1.png',ref:'library://enemy1.png',kind:'enemy'},1);
  e1.entry={preset:'pop',duration:.8,delay:4.2};
  const e2=newActor({...asset,path:'enemy2.png',ref:'library://enemy2.png',kind:'enemy'},1);
  e2.entry={preset:'pop',duration:.8,delay:3.9};
  const ally=newActor({...asset,path:'ally.png',ref:'library://ally.png',kind:'character'},1);
  ally.entry={preset:'fade',duration:.8,delay:.5};
  d.shots[1].actors=[ally,e1,e2];
  const calm:MusicTrack={...settings,id:'calm',startShotId:d.shots[0].id,endShotId:d.shots[1].id,fadeIn:0,fadeOut:1};
  const danger:MusicTrack={...settings,id:'danger',startShotId:d.shots[1].id,endShotId:d.shots[2].id,fadeIn:.5,fadeOut:.8,startTrigger:'first_enemy',replacePrevious:true};
  d.musicTracks=[calm,danger];
  upgradeCinematicFormat(d);
  assert.doesNotThrow(()=>parseCinematic(d));
  assert.equal(musicStartTime(d.shots[1],danger),3.9);
  assert.equal(musicHandoffTime(d,1,calm),3.9);
  const {engine,voices}=player();
  let s=beginPlayback();engine.sync(d,s,[asset]);
  s=tickPlayback(d,s,2);engine.sync(d,s,[asset]); // enters shot 1 at elapsed=0
  assert.equal(s.shotIndex,1);assert.equal(voices.length,1);assert.equal(voices[0].volume,.8);
  s=tickPlayback(d,s,3.5);engine.sync(d,s,[asset]); // still before 3.9s
  assert.equal(voices.length,1);assert.equal(voices[0].volume,.8);
  s=tickPlayback(d,s,.65);engine.sync(d,s,[asset]); // elapsed=4.15 -> 0.25s after 3.9s
  assert.equal(voices.length,2);
  assert.ok(Math.abs(voices[0].volume-.8*.75)<1e-6,'previous music fades down smoothly on handoff');
  assert.ok(Math.abs(voices[1].volume-.8*.5)<1e-6,'enemy music fades in from exact appearance time');
  s=tickPlayback(d,s,.85);engine.sync(d,s,[asset]); // elapsed=5.0 -> calm finished fading at 4.9s
  assert.equal(voices[0].removed,true);assert.equal(voices[1].volume,.8);
  // Shot 1 ends at 7s: calm already ended at 4.9s and danger continues into shot 2, so exitDuration is 0.
  assert.equal(shotExitDuration(d,1,{elapsed:7}),0);
  engine.stop();
});
test('actor_entry music trigger supports immediate and delayed actors, duplication, repair, and validation',()=>{
  const d=fixture();
  const boss=newActor({...asset,path:'boss.png',ref:'library://boss.png',kind:'enemy'},1);
  boss.entry={preset:'none',duration:.8,delay:0};
  d.shots[0].actors=[boss];
  d.musicTracks=[{...settings,id:'boss_theme',startShotId:d.shots[0].id,endShotId:d.shots[1].id,startTrigger:'actor_entry',startTargetId:boss.id,startDelay:.25,replacePrevious:true}];
  upgradeCinematicFormat(d);
  assert.doesNotThrow(()=>parseCinematic(d));
  assert.equal(musicStartTime(d.shots[0],d.musicTracks[0]),.25);
  boss.entry={preset:'zoom',duration:.8,delay:1.5};
  upgradeCinematicFormat(d);
  assert.equal(musicStartTime(d.shots[0],d.musicTracks[0]),1.75);
  const dup=duplicateCinematic(d);
  assert.equal(dup.musicTracks![0].startTargetId,dup.shots[0].actors[0].id);
  assert.notEqual(dup.musicTracks![0].startTargetId,boss.id);
  assert.doesNotThrow(()=>parseCinematic(dup));
  const broken=copy(d);broken.musicTracks![0].startTargetId='missing';assert.throws(()=>parseCinematic(broken));
  const extraTarget=copy(d);extraTarget.musicTracks![0].startTrigger='first_enemy';assert.throws(()=>parseCinematic(extraTarget));
  const repaired=copy(d);repaired.shots[0].actors=[];repairAudioLinks(repaired,d);
  assert.equal(repaired.musicTracks![0].startTrigger,undefined);assert.equal(repaired.musicTracks![0].startTargetId,undefined);
  assert.doesNotThrow(()=>parseCinematic(repaired));
});
