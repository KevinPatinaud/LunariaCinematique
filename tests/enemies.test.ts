import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { classifyAsset } from '../src/shared/assets.js';
import { LIBRARY_TABS, isLibraryTab, assetMatchesTab, buildFolderTree, filterLibraryAssets, folderLabel } from '../src/shared/libraryBrowser.js';
import { newActor, newBubble, newCinematic, newShot, copy, duplicateShot, removeActor, referencedAssets, upgradeCinematicFormat, type Asset, type MotionPreset } from '../src/shared/model.js';
import { parseCinematic, validationIssues, cinematicSchema } from '../src/shared/schema.js';
import { prepareCinematic, bubbleTarget } from '../src/shared/geometry.js';
import { newMotion, newMovement, actorPose } from '../src/shared/motion.js';
import { createTemplate, duplicateObjects } from '../src/shared/studio.js';
import { createHistory, historyReducer } from '../src/shared/history.js';
import { editCommand } from '../src/shared/commands.js';
import { parseCollections, toggleFavorite, recordRecent } from '../src/shared/collections.js';
import { scanLibrary } from '../src/main/library.js';
import { atomicJson, readJson, resolveAsset } from '../src/main/files.js';

function resource(p='03_enemies/canette/Stage 01/canette.png'): Asset {
 return {path:p,ref:`library://${p}`,folder:p.split('/').slice(0,-1).join('/'),name:'Canette',kind:classifyAsset(p),bytes:3,modified:0,url:'fixture.png',thumbnail:'fixture.png'};
}
function scene() {
 const doc=newCinematic();doc.shots[0].actors=[newActor(resource(),.65,.65,.5)];
 doc.shots[0].bubbles=[newBubble(doc.shots[0].actors[0].id)];
 upgradeCinematicFormat(doc);return doc;
}
async function temporary(fn:(root:string)=>Promise<void>) {
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-enemies-'));
 try{await fn(root);}finally{await fs.rm(root,{recursive:true,force:true});}
}
for(const p of [
 '03_enemies/canette.png','03_enemies/canette/Stage 01/master.png','03_enemies/canette/stage_02/pose.png',
 '03_enemies/canette/portraits/fache.png','03_enemies/canette/expressions/idle.webp','03_enemies/Europe/master.jpg',
 '03_enemies/characters/stage_01/master.png','03_enemies/props/part.png',
 'enemies/canette.png','enemy/canette.png','ennemis/canette.png','ennemi/canette.png',
 '03_ENEMIES/Stage 03/MASTER.PNG','03-Ennemis/Canette/pose.png','03 Enemies/poses/image.png',
 '01_europe/usine/ennemis/canette.png','02_characters/Ennemis/canette/stage_01/image.png',
 '03_enemies/Boss été/colère.png','03_enemies/Boss e\u0301te\u0301/cole\u0300re.png',
 '03_enemies\\Canette\\Stage 01\\canette.png'
]) test(`enemy folder detection: ${p}`,()=>assert.equal(classifyAsset(p),'enemy'));
for(const [p,kind] of [
 ['03_enemies/canette/attaque.ogg','audio'],['03_enemies/canette/voix.WAV','audio'],
 ['05_environments/foret/enemy_camp.png','environment'],['05_environments/enemies.png','environment'],
 ['02_characters/Rose/stage_01/master.png','character'],['07_props/ennemi_de_carton.png','prop'],
 ['08_ui/dialogues/cadre.png','ui'],['unknown/enemy.png','other'],['enemyship/image.png','other'],
 ['03_enemies_backup.png','other']
] as const) test(`no false enemy classification: ${p}`,()=>assert.equal(classifyAsset(p),kind));

test('enemy has a dedicated tab; no duplicate in Décors, Personnages, Objets or Bulles',()=>{
 for(const tab of LIBRARY_TABS) assert.equal(assetMatchesTab(resource(),tab),tab==='enemy');
 assert.equal(isLibraryTab('enemy'),true);assert.equal(isLibraryTab('enemies'),false);assert.equal(isLibraryTab('other'),false);
});
test('French labels reflect the actual LunariaArtLibrary folder names',()=>{
 assert.equal(folderLabel('03_enemies'),'Ennemis');assert.equal(folderLabel('02_characters'),'Personnages');assert.equal(folderLabel('08_ui'),'Interface');
});
test('enemy tree includes stages and expressions; French search reaches them',()=>{
 const assets=[resource(),resource('03_enemies/canette/expressions/fache.png'),resource('03_enemies/pollution/master.png')];
 const roots=buildFolderTree(assets);assert.equal(roots[0].label,'Ennemis');assert.equal(roots[0].count,3);
 assert.equal(roots[0].children.find(n=>n.path.endsWith('canette'))?.count,2);
 assert.equal(filterLibraryAssets(assets,'03_enemies/canette','ennemis stage 01').length,1);
 assert.equal(filterLibraryAssets(assets,'03_enemies/canette','expressions').length,1);
});
test('new enemy carries its role and its unchanged relative reference',()=>{
 const a=newActor(resource(),.65);assert.equal(a.role,'enemy');assert.equal(a.asset,resource().ref);
 assert.equal(a.entry.preset,'none');assert.equal(a.flipX,false);
 assert.ok(Math.abs(a.width*1600/(a.height*900)-.65)<1e-9);
});
test('explicit insertion as enemy works for an image classified elsewhere',()=>{
 const source=resource('07_props/canette.png'),a=newActor(source,.65,.2,.4,'enemy');
 assert.equal(a.role,'enemy');assert.equal(a.asset,source.ref);assert.equal(source.kind,'prop');
});
test('explicit decoration or character insertion overrides enemy source without renaming it',()=>{
 const source=resource();assert.equal(newActor(source,1,.2,.4,'prop').role,'prop');
 const a=newActor(source,1,.2,.4,'character');assert.equal(a.role,undefined);assert.equal(a.asset,source.ref);assert.equal(source.kind,'enemy');
});
test('existing character/prop constructor calls retain the legacy no-role default',()=>{
 for(const p of ['02_characters/Rose/master.png','07_props/pot.png']) {
  const d=newCinematic();d.shots[0].actors=[newActor(resource(p),1)];
  assert.equal(d.shots[0].actors[0].role,undefined);assert.equal(prepareCinematic(d).schemaVersion,1);
 }
});
test('enemy insertion requires schemaVersion 2 and upgrades through the normal save path',()=>{
 const d=newCinematic();d.shots[0].actors=[newActor(resource(),1)];
 assert.ok(validationIssues(d).some(s=>s.includes('schemaVersion: 2')));
 const output=prepareCinematic(d);assert.equal(output.schemaVersion,2);assert.deepEqual(validationIssues(output),[]);assert.equal(d.schemaVersion,1);
});
test('all three roles round-trip; unsupported roles are still refused',()=>{
 for(const role of ['character','enemy','prop'] as const) {const d=scene();d.shots[0].actors[0].role=role;assert.deepEqual(parseCinematic(JSON.parse(JSON.stringify(d))),d);}
 const d=scene() as unknown as {shots:{actors:{role:string}[]}[]};d.shots[0].actors[0].role='boss';assert.throws(()=>parseCinematic(d));
});
test('opening a legacy actor under 03_enemies never silently rewrites its role or reference',()=>{
 const d=scene();delete d.shots[0].actors[0].role;d.schemaVersion=1;
 const old=JSON.stringify(d);assert.deepEqual(parseCinematic(JSON.parse(old)),d);assert.equal(prepareCinematic(d).schemaVersion,1);
 assert.equal(JSON.stringify(d),old);
});
test('generated Godot and editor schemas both include enemy and match the source schema',async()=>{
 for(const file of ['docs/cinematic.schema.json','godot/addons/lunaria_cinematics/cinematic.schema.json']) {
  const json=JSON.parse(await fs.readFile(file,'utf8'));assert.deepEqual(json,cinematicSchema);
  assert.deepEqual(json.properties!.shots.items!.properties!.actors.items!.properties!.role.enum,['character','enemy','prop']);
 }
});
test('duplicating an enemy and its bubble retains role and relinks to the duplicate',()=>{
 const d=scene(),s=d.shots[0],id=s.actors[0].id;duplicateObjects(s,[id,s.bubbles[0].id]);
 assert.equal(s.actors[1].role,'enemy');assert.equal(s.actors[1].asset,s.actors[0].asset);
 assert.notEqual(s.actors[1].id,id);assert.equal(s.bubbles[1].speakerId,s.actors[1].id);
 assert.deepEqual(validationIssues(d),[]);
});
test('duplicating a plan preserves enemy motion without sharing mutable objects',()=>{
 const s=scene().shots[0];s.actors[0].motion=newMotion('shake');s.actors[0].movement=newMovement(s.actors[0]);
 const duplicated=duplicateShot(s);assert.equal(duplicated.actors[0].role,'enemy');assert.equal(duplicated.bubbles[0].speakerId,duplicated.actors[0].id);
 assert.deepEqual(duplicated.actors[0].motion,s.actors[0].motion);duplicated.actors[0].motion!.intensity=.9;assert.notEqual(duplicated.actors[0].motion!.intensity,s.actors[0].motion!.intensity);
});
test('hero and enemy can be the default speakers of a dialogue template',()=>{
 const s=scene().shots[0];const enemy=s.actors[0];
 s.actors=[newActor(resource('07_props/pot.png'),1,.1,.5,'prop'),newActor(resource('02_characters/Rose/master.png'),1),enemy];
 const next=createTemplate(s,'dialogue');assert.equal(next.bubbles.length,2);
 assert.equal(next.bubbles[1].speakerId,next.actors[2].id);assert.equal(next.actors[2].role,'enemy');
});
test('entrance and continuation templates work with an enemy-only plan',()=>{
 const s=scene().shots[0],a=s.actors[0];a.movement={...newMovement(a),duration:1,dx:.1,dy:0};
 const entrance=createTemplate(s,'entrance');assert.equal(entrance.actors[0].role,'enemy');assert.equal(entrance.actors[0].entry.preset,'left');
 const next=createTemplate(s,'continue');assert.equal(next.actors[0].role,'enemy');assert.ok(Math.abs(next.actors[0].x-a.x-.1)<1e-9);assert.equal(next.actors[0].movement?.enabled,false);
});
for(const preset of ['float','sway','pulse','spin','shake','bounce'] as MotionPreset[]) test(`enemy ${preset} and A→B match the character motion pipeline`,()=>{
 const enemy=newActor(resource(),.8);enemy.motion=newMotion(preset);enemy.movement={...newMovement(enemy),dx:.2,dy:-.1};
 const hero={...copy(enemy),role:'character' as const};for(const time of [0,.25,1,3,10,99]) assert.deepEqual(actorPose(enemy,time),actorPose(hero,time));
});
test('an automatic bubble tail follows the animated enemy; manual detachment is safe',()=>{
 const s=scene().shots[0],enemy=s.actors[0];enemy.movement={...newMovement(enemy),dx:.2,duration:2};
 const first=bubbleTarget(s.bubbles[0],s,0,true),last=bubbleTarget(s.bubbles[0],s,2,true);assert.ok(Math.abs(last.x-first.x-320)<1e-7);
 removeActor(s,enemy.id);assert.equal(s.bubbles[0].speakerId,null);assert.equal(s.bubbles[0].tail.mode,'manual');
});
test('undo/redo of enemy insertion restores role, original file format and relative reference',()=>{
 const d=newCinematic();let h=createHistory(d);
 const command=editCommand(d,next=>{next.shots[0].actors.push(newActor(resource(),1));upgradeCinematicFormat(next);},'Ajouter un ennemi');
 h=historyReducer(h,{type:'execute',command});assert.equal(h.present.schemaVersion,2);const added=copy(h.present);
 h=historyReducer(h,{type:'undo'});assert.deepEqual(h.present,d);
 h=historyReducer(h,{type:'redo'});assert.deepEqual(h.present,added);assert.equal(h.present.shots[0].actors[0].role,'enemy');
});
test('changing the role of an existing element is undoable and does not move its source image',()=>{
 const d=scene(),before=copy(d.shots[0].actors[0]);let h=createHistory(d);
 h=historyReducer(h,{type:'execute',command:editCommand(d,n=>{n.shots[0].actors[0].role='character';},'Rôle')});
 assert.equal(h.present.shots[0].actors[0].asset,before.asset);assert.equal(h.present.shots[0].actors[0].x,before.x);
 h=historyReducer(h,{type:'undo'});assert.deepEqual(h.present.shots[0].actors[0],before);
});
test('favorites and recent items retain an enemy reference across refreshes',()=>{
 const ref=resource().ref;let c=parseCollections(null);c=toggleFavorite(c,ref);c=recordRecent(c,ref);c=recordRecent(c,ref);
 const reloaded=parseCollections(JSON.parse(JSON.stringify(c)));assert.deepEqual(reloaded.favorites,[ref]);assert.deepEqual(reloaded.recent,[ref]);
 assert.equal(assetMatchesTab(resource(),'enemy'),true);
});
test('native scanner finds stages and expressions without modifying any source files',()=>temporary(async root=>{
 const paths=['03_enemies/Canette/Stage 01/master.png','03_enemies/Canette/expressions/angry.webp','02_characters/Rose/master.png'];
 for(const file of paths){await fs.mkdir(path.dirname(path.join(root,file)),{recursive:true});await fs.writeFile(path.join(root,file),'fixture image');}
 const before=await Promise.all(paths.map(file=>fs.stat(path.join(root,file))));
 const snapshot=await scanLibrary(root);assert.equal(snapshot.assets.filter(a=>a.kind==='enemy').length,2);assert.equal(snapshot.assets.length,3);
 for(let i=0;i<paths.length;i++) {assert.equal((await fs.stat(path.join(root,paths[i]))).mtimeMs,before[i].mtimeMs);assert.equal(await fs.readFile(path.join(root,paths[i]),'utf8'),'fixture image');}
 assert.equal(snapshot.warnings.length,0);
}));
test('saving/reopening an enemy project writes only JSON and keeps a single source reference',()=>temporary(async root=>{
 const file=path.join(root,'scene.cinematic.json'),d=scene();d.shots.push(duplicateShot(d.shots[0]));
 await atomicJson(file,prepareCinematic(d));const result=parseCinematic(await readJson(file));assert.equal(result.shots[1].actors[0].role,'enemy');
 assert.deepEqual(referencedAssets(result),[resource().ref]);const text=await fs.readFile(file,'utf8');assert.ok(!text.includes('base64'));assert.ok(!text.includes('fixture.png'));
 assert.deepEqual(await fs.readdir(root),['scene.cinematic.json']);
}));
test('enemy asset resolver preserves Unicode folder and image names',()=>temporary(async root=>{
 const rel='03_enemies/Canette/Colère été.png';await fs.mkdir(path.dirname(path.join(root,rel)),{recursive:true});await fs.writeFile(path.join(root,rel),'fixture');
 assert.equal(await resolveAsset(root,`library://${rel}`),await fs.realpath(path.join(root,rel)));
}));
