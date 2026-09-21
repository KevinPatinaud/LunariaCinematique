import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DocumentFiles } from '../src/main/documents.js';
import { atomicJson, readJson, readJsonSource, resolveAsset } from '../src/main/files.js';
import { assetUrl, libraryKey, scanLibrary } from '../src/main/library.js';
import { classifyAsset } from '../src/shared/assets.js';
import { centeredObject, parseNumericInput, proportionalSize, resizeBox } from '../src/shared/editing.js';
import { newActor, newBubble, newCinematic, newShot, duplicateShot, removeActor, type Asset } from '../src/shared/model.js';
import { bubbleLayout, bubbleTarget, prepareCinematic } from '../src/shared/geometry.js';
import { contentWarnings, parseCinematic, validationIssues } from '../src/shared/schema.js';
import { beginPlayback, advanceDialogue, tickPlayback } from '../src/shared/playback.js';
import { createHistory, historyReducer } from '../src/shared/history.js';
const image: Asset = { ref:'library://05_characters/rose/stage_01/rose.png',path:'05_characters/rose/stage_01/rose.png',name:'Rose',kind:'character',folder:'05_characters/rose/stage_01',url:'',thumbnail:'',bytes:1,modified:0 };
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8, `${a} != ${b}`);
async function temp(t: {after:(fn:()=>Promise<void>)=>void}) { const dir=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-v12-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));return dir; }
for(const ratio of [.03,.2,1,4,20,90]) test(`actor insertion preserves aspect ratio ${ratio}`,()=>{
 const actor=newActor(image,ratio);near(actor.width*1600/(actor.height*900),ratio);
 assert.ok(actor.width>=.03&&actor.width<=2&&actor.height>=.03&&actor.height<=2);
});
for(const ratio of [NaN,Infinity,0,-1,10000,.00001]) test(`invalid or unrepresentable image ratio ${ratio} is refused`,()=>assert.throws(()=>newActor(image,ratio)));
test('proportional resizing limits both axes without distortion',()=>{for(const scale of [-10,.01,.5,1,1000]){const size=proportionalSize(.3,.8,scale);near(size.width/size.height,.3/.8);assert.ok(size.width>=.03-1e-10&&size.height<=2+1e-10);}});
for(const corner of ['nw','ne','sw','se'])test(`actor corner ${corner} respects opposite anchor and ratio`,()=>{
 const box={x:.2,y:.3,width:.18,height:.4},resize=resizeBox(box,'actor',corner,.02,.08);
 near(resize.width/resize.height,box.width/box.height);
 near(corner.includes('w')?resize.x+resize.width:resize.x,corner.includes('w')?box.x+box.width:box.x);
 near(corner.includes('n')?resize.y+resize.height:resize.y,corner.includes('n')?box.y+box.height:box.y);
});
test('vertical-only drag now resizes a character',()=>assert.ok(resizeBox({x:.2,y:.2,width:.2,height:.4},'actor','se',0,.1).height>.4));
test('bubble resize remains independent of aspect ratio',()=>{const b={x:0,y:0,width:.4,height:.2};const r=resizeBox(b,'bubble','se',.1,0);near(r.width,.5);near(r.height,.2);});
test('off-screen objects can be recentered without changing dimensions',()=>assert.deepEqual(centeredObject({x:1.5,y:-.5,width:.2,height:.4}),{x:.4,y:.3}));
for(const [text,expected] of [['1,5',1.5],['.75',.75],[' 2 ',2],['-12',.1],['1000',300],['1e4',null],['',null],['-',null],['.',null],['Infinity',null],['NaN',null],['1,2,3',null]] as const)
 test(`numeric edit ${JSON.stringify(text)} commits safely`,()=>assert.equal(parseNumericInput(text,.1,300),expected));
test('maximal narrow dialogue can still be saved, no text removed',()=>{
 const doc=newCinematic(),b=newBubble();b.width=.16;b.fontSize=72;b.text='\n'.repeat(1499)+'R';doc.shots[0].bubbles=[b];
 assert.equal(bubbleLayout(b).height,1800);assert.equal(bubbleLayout(b).overflow,true);
 const saved=prepareCinematic(doc);assert.equal(saved.shots[0].bubbles[0].text,b.text);assert.equal(saved.shots[0].bubbles[0].lines!.length,1500);assert.deepEqual(validationIssues(saved),[]);
});
test('actor deletion preserves the current tail anchor',()=>{const s=newShot(),a=newActor(image,1);s.actors=[a];const b=newBubble(a.id);s.bubbles=[b];const before=bubbleTarget(b,s,0,false);removeActor(s,a.id);const after=bubbleTarget(b,s,0,false);near(before.x,after.x);near(before.y,after.y);});
test('duplicating a maximum-length plan cannot create an invalid document',()=>{const doc=newCinematic();doc.shots[0].name='p'.repeat(180);doc.shots.push(duplicateShot(doc.shots[0]));assert.deepEqual(validationIssues(doc),[]);});
for(const [file,kind] of [['01_characters/Rose/stage_02/rose.png','character'],['Personnages/Radis/stage_03/Radis.png','character'],['06_ui/bulles/encadre.png','ui'],['01_europe/foret/ambiance.OGG','audio'],['décors/Europe/forêt/image.png','environment']] as const)
 test(`consistent library classification: ${file}`,()=>assert.equal(classifyAsset(file),kind));
for(const role of ['background','actor','frame','audio'])test(`wrong resource type refused for ${role}`,()=>{
 const d=newCinematic();if(role==='background')d.shots[0].background.asset='library://a.mp3';
 if(role==='actor')d.shots[0].actors=[{...newActor(image,1),asset:'library://a.wav'}];
 if(role==='frame'){const b=newBubble();b.style='simple';b.frameAsset='library://a.ogg';d.shots[0].bubbles=[b];}
 if(role==='audio')d.shots[0].audio={asset:'library://a.png',loop:false,volume:1};assert.throws(()=>parseCinematic(d));
});
test('object outside visible area generates a warning rather than disappearing unnoticed',()=>{const d=newCinematic(),a=newActor(image,1);a.x=1.2;d.shots[0].actors=[a];assert.ok(contentWarnings(d).some(s=>/hors|cadre/i.test(s)));});
test('undo boundaries keep identical edit keys on different selections separate',()=>{let s=createHistory(0);s=historyReducer(s,{type:'commit',value:1,key:'duration',now:100});s=historyReducer(s,{type:'boundary'});s=historyReducer(s,{type:'commit',value:2,key:'duration',now:101});assert.equal(s.past.length,2);assert.equal(historyReducer(s,{type:'undo'}).present,1);});
for(const delta of [NaN,Infinity,-Infinity,-1,0])test(`invalid playback delta ${delta} never corrupts clock`,()=>{const state=beginPlayback();assert.deepEqual(tickPlayback(newCinematic(),state,delta),state);});
test('elapsed time crosses shot boundaries without loss',()=>{const d=newCinematic();d.shots[0].duration=1;d.shots.push(newShot());const s=tickPlayback(d,beginPlayback(),2.3);assert.equal(s.shotIndex,1);near(s.elapsed,1.3);});
test('multiple automatic dialogues preserve fractional overflow',()=>{const d=newCinematic();d.shots[0].dialogueStart=.25;for(let i=0;i<3;i++){const b=newBubble();b.advance={mode:'auto',seconds:.5};d.shots[0].bubbles.push(b);}const s=tickPlayback(d,beginPlayback(),1.4);assert.equal(s.dialogueIndex,2);near(s.dialogueElapsed,.15);});
test('a click-gated dialogue is not consumed by a long dropped frame',()=>{const d=newCinematic();d.shots[0].bubbles=[newBubble()];const s=tickPlayback(d,beginPlayback(),40);assert.equal(s.finished,false);assert.equal(s.dialogueIndex,0);assert.equal(advanceDialogue(d,s).finished,true);});
test('different frame rates produce the same playback state',()=>{const d=newCinematic();d.shots[0].duration=1;d.shots[0].dialogueStart=.2;const b=newBubble();b.advance={mode:'auto',seconds:.5};d.shots[0].bubbles=[b];d.shots.push(newShot());const large=tickPlayback(d,beginPlayback(),2);let small=beginPlayback();for(let i=0;i<120;i++)small=tickPlayback(d,small,1/60);assert.equal(large.shotIndex,small.shotIndex);near(large.elapsed,small.elapsed);});
test('a huge delta eventually finishes a finite automatic sequence',()=>{const d=newCinematic();for(let i=0;i<10;i++)d.shots.push(newShot());assert.equal(tickPlayback(d,beginPlayback(),1e6).finished,true);});
test('readJsonSource validates and fingerprints exactly one read, preserving BOM',async t=>{const dir=await temp(t),file=path.join(dir,'film.json');const source='\uFEFF'+JSON.stringify(newCinematic());await fs.writeFile(file,source);const read=await readJsonSource(file);assert.equal(read.source,source);assert.equal(parseCinematic(read.value).schemaVersion,1);});
test('asset resolver refuses a directory with an image suffix',async t=>{const dir=await temp(t);await fs.mkdir(path.join(dir,'image.png'));await assert.rejects(resolveAsset(dir,'library://image.png'),/fichier/);});
test('failed scans reject rather than returning a silently empty library',async t=>{const dir=await temp(t);await assert.rejects(scanLibrary(path.join(dir,'missing')));});
test('scanner skips zero-byte and unsafe-name files but keeps good images',async t=>{const dir=await temp(t);await fs.writeFile(path.join(dir,'good.png'),'image');await fs.writeFile(path.join(dir,'empty.png'),'');if(process.platform!=='win32')await fs.writeFile(path.join(dir,'bad?.png'),'image');const scan=await scanLibrary(dir);assert.equal(scan.assets.length,1);assert.ok(scan.warnings.length>=1);});
test('library URL identity changes even when relative filenames match',()=>{assert.notEqual(libraryKey('/one'),libraryKey('/two'));assert.notEqual(assetUrl('library://same.png',1,false,libraryKey('/one')),assetUrl('library://same.png',1,false,libraryKey('/two')));});
test('new document resets save destination and rejects writes from old session',async t=>{const dir=await temp(t),store=new DocumentFiles(path.join(dir,'recovery.json')),file=path.join(dir,'a.json'),doc=newCinematic();const old=store.token;await store.save(file,doc,old);const next=await store.reset();assert.notEqual(old,next);assert.equal(store.currentFile,'');doc.title='Must not overwrite';await assert.rejects(store.save(file,doc,old),/active a changé/);assert.notEqual(parseCinematic(await readJson(file)).title,doc.title);});
test('stale queued autosave cannot revive a closed project',async t=>{const dir=await temp(t),file=path.join(dir,'recovery.json'),store=new DocumentFiles(file),old=store.token;await store.autosave(newCinematic(),old);await store.reset();await store.autosave(newCinematic(),old);await assert.rejects(fs.stat(file));});
test('open failure retains previous project and recovery',async t=>{const dir=await temp(t),store=new DocumentFiles(path.join(dir,'recovery.json')),file=path.join(dir,'first.json');await store.save(file,newCinematic(),store.token);await store.autosave(newCinematic(),store.token);const token=store.token;await fs.writeFile(path.join(dir,'bad.json'),'{');await assert.rejects(store.open(path.join(dir,'bad.json')));assert.equal(store.token,token);assert.equal(store.currentFile,file);assert.ok((await store.recovery()).cinematic);});
test('successful open rotates token and removes obsolete recovery',async t=>{const dir=await temp(t),store=new DocumentFiles(path.join(dir,'r.json')),old=store.token;await store.autosave(newCinematic(),old);await atomicJson(path.join(dir,'open.json'),newCinematic());const result=await store.open(path.join(dir,'open.json'));assert.notEqual(result.documentToken,old);assert.equal((await store.recovery()).cinematic,null);});
test('external modification is detected before the next save',async t=>{const dir=await temp(t),file=path.join(dir,'a.json'),store=new DocumentFiles(path.join(dir,'r.json')),doc=newCinematic();await store.save(file,doc,store.token);await fs.writeFile(file,'{"external":true}');await assert.rejects(store.save(file,doc,store.token),/autre programme/);assert.equal(await fs.readFile(file,'utf8'),'{"external":true}');});
test('externally removed file is not silently recreated',async t=>{const dir=await temp(t),file=path.join(dir,'a.json'),store=new DocumentFiles(path.join(dir,'r.json')),doc=newCinematic();await store.save(file,doc,store.token);await fs.unlink(file);await assert.rejects(store.save(file,doc,store.token),/déplacé ou supprimé/);});
test('save to another file preserves the externally edited original',async t=>{const dir=await temp(t),file=path.join(dir,'a.json'),other=path.join(dir,'b.json'),store=new DocumentFiles(path.join(dir,'r.json')),doc=newCinematic();await store.save(file,doc,store.token);await fs.writeFile(file,'external');await store.save(other,doc,store.token);assert.equal(await fs.readFile(file,'utf8'),'external');assert.equal(parseCinematic(await readJson(other)).id,doc.id);});
test('save queues serialize complete documents and preserve previous .bak',async t=>{const dir=await temp(t),file=path.join(dir,'a.json'),store=new DocumentFiles(path.join(dir,'r.json')),doc=newCinematic();await store.save(file,doc,store.token);const first={...doc,title:'first'},last={...doc,title:'last'};await Promise.all([store.save(file,first,store.token),store.save(file,last,store.token)]);assert.equal(parseCinematic(await readJson(file)).title,'last');assert.equal(parseCinematic(await readJson(file+'.bak')).title,'first');});
test('save clears earlier queued recovery snapshots',async t=>{const dir=await temp(t),store=new DocumentFiles(path.join(dir,'r.json')),doc=newCinematic();await Promise.all([store.autosave(doc,store.token),store.save(path.join(dir,'a.json'),doc,store.token)]);assert.equal((await store.recovery()).cinematic,null);});
test('recovery preserves library information and exact authored data',async t=>{const dir=await temp(t),store=new DocumentFiles(path.join(dir,'r.json')),doc=newCinematic();doc.shots[0].bubbles=[newBubble()];await store.autosave(doc,store.token,'C:/Lunaria');const r=await store.recovery();assert.equal(r.libraryRoot,'C:/Lunaria');assert.deepEqual(r.cinematic,doc);});
test('legacy V1 recovery is still readable',async t=>{const dir=await temp(t),file=path.join(dir,'r.json'),doc=newCinematic();await atomicJson(file,doc);const r=await new DocumentFiles(file).recovery();assert.deepEqual(r.cinematic,doc);});
test('discarding recovery is explicit and persistent',async t=>{const dir=await temp(t),file=path.join(dir,'r.json'),store=new DocumentFiles(file);await store.autosave(newCinematic(),store.token);await store.discardRecovery(store.token);assert.equal((await new DocumentFiles(file).recovery()).cinematic,null);});
test('corrupt recovery never prevents starting the application',async t=>{const dir=await temp(t),file=path.join(dir,'r.json');await fs.writeFile(file,'broken');assert.equal((await new DocumentFiles(file).recovery()).cinematic,null);});
test('a rejected write does not poison later file operations',async t=>{const dir=await temp(t),store=new DocumentFiles(path.join(dir,'r.json'));await assert.rejects(store.save(path.join(dir,'bad.json'),newCinematic(),'wrong'));await store.save(path.join(dir,'good.json'),newCinematic(),store.token);assert.ok(await fs.stat(path.join(dir,'good.json')));});
test('in-memory mutation after autosave request cannot change queued data',async t=>{const dir=await temp(t),store=new DocumentFiles(path.join(dir,'r.json')),doc=newCinematic();const title=doc.title,pending=store.autosave(doc,store.token);doc.title='later';await pending;assert.equal((await store.recovery()).cinematic!.title,title);});
test('backup symlink is replaced rather than followed', {skip:process.platform==='win32'},async t=>{const dir=await temp(t),file=path.join(dir,'doc.json'),outside=path.join(dir,'unrelated.txt');await atomicJson(file,{v:1});await fs.writeFile(outside,'do not modify');await fs.symlink(outside,file+'.bak');await atomicJson(file,{v:2},true);assert.equal(await fs.readFile(outside,'utf8'),'do not modify');assert.deepEqual(await readJson(file+'.bak'),{v:1});});
test('too-large saves cannot replace a valid original with an unreadable JSON',async t=>{const dir=await temp(t),file=path.join(dir,'doc.json');await atomicJson(file,{ok:true});await assert.rejects(atomicJson(file,{text:'x'.repeat(5*1024*1024)},true),/5 Mo/);assert.deepEqual(await readJson(file),{ok:true});});
