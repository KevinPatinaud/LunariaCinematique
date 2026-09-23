import {fixturePresentation,PIXEL_PNG} from './presentation-fixture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, symlink, rm } from 'node:fs/promises';
import os from 'node:os'; import path from 'node:path';
import {seedProject} from '../src/shared/game/seed.js';
import {newLevel,cloneLevel,totalEnemies,waveSchedule,damageAfterProtection,replaceWaves, type GameProject} from '../src/shared/game/types.js';
import {gameIssues,parseGameProject} from '../src/shared/game/validation.js';
import {GameDocuments,publishGameProject} from '../src/main/gameDocuments.js';
const errors=(p:unknown)=>gameIssues(p).filter(x=>x.severity==='error');
function valid(){return seedProject();}
const change=(fn:(p:any)=>void)=>{const p=valid();fn(p);return p;};
const good=(fn:(p:GameProject)=>void)=>assert.equal(errors(change(fn)).length,0);
const bad=(fn:(p:any)=>void)=>assert.ok(errors(change(fn)).length>0);

test('starter: 40 levels / 28 global plants / 13 global enemies, valid without warnings',()=>{const p=valid();assert.equal(p.levels.length,40);assert.equal(p.balance.plants.length,28);assert.equal(p.balance.enemies.length,13);assert.deepEqual(gameIssues(p),[]);});
test('official companion name is Rose everywhere in the authored campaign',()=>{const p=valid();assert.equal(p.balance.plants.find(x=>x.id==='rose')?.name,'Rose');assert.equal(p.balance.enemies.find(x=>x.id==='corrupted_rose')?.name,'Rose contaminée');assert.doesNotMatch(JSON.stringify(p),/\bRonce\b/);assert.doesNotMatch(JSON.stringify(p),/\bronce\b/);});
test('seed returns independent deep clones',()=>{const a=valid();a.balance.plants[0].damage=500;assert.notEqual(valid().balance.plants[0].damage,500);});
test('new level contains references, not embedded stats',()=>{const l=newLevel(['radish','rose'],'litterer');assert.deepEqual(l.allowedPlants,['radish','rose']);assert.equal(totalEnemies(l),5);assert.equal('damage' in l,false);good(p=>p.levels=[l]);});
test('duplicating level regenerates every nested ID',()=>{const p=valid(),l=cloneLevel(p.levels[0]);p.levels.push(l);assert.equal(errors(p).length,0);assert.notEqual(l.id,p.levels[0].id);assert.notEqual(l.waves[0].groups[0].id,p.levels[0].waves[0].groups[0].id);});
test('shared rebalance does not rewrite any level',()=>{const p=valid(),before=JSON.stringify(p.levels);p.balance.plants[0].damage=80;p.balance.enemies[0].hp=450;assert.equal(JSON.stringify(p.levels),before);assert.equal(errors(p).length,0);});
test('global resistance and pure damage formula',()=>{const t={armor:.5,resistances:{physical:.2,piercing:.2,toxic:.5}};assert.equal(damageAfterProtection(100,'physical',t),40);assert.equal(damageAfterProtection(100,'piercing',t),80);assert.equal(damageAfterProtection(100,'toxic',t),50);assert.equal(damageAfterProtection(100,'pure',t),100);assert.equal(damageAfterProtection(100,'physical',t,true),80);});
test('no negative damage when bounded protection is used',()=>{for(const kind of ['physical','piercing','toxic','pure'] as const)for(const amount of [0,1,70,600]){const n=damageAfterProtection(amount,kind,{armor:.95,resistances:{physical:.95,piercing:.95,toxic:.95}});assert.ok(n>=0&&n<=amount);}});
test('schedule is stable, includes precise group quantities and simultaneous spawns',()=>{const schedule=waveSchedule({id:'w',groups:[{id:'a',enemyId:'runner',count:3,lane:1,start:2,interval:2},{id:'b',enemyId:'litterer',count:2,lane:-1,start:0,interval:2}]});assert.deepEqual(schedule.map(x=>[x.at,x.groupId]),[[0,'b'],[2,'a'],[2,'b'],[4,'a'],[6,'a']]);});
test('schedule never mutates source wave',()=>{const w=valid().levels[0].waves[0],before=JSON.stringify(w);waveSchedule(w);assert.equal(JSON.stringify(w),before);});
test('more than forty and up to two hundred levels are valid',()=>good(p=>{p.levels=[p.levels[0]];while(p.levels.length<200)p.levels.push(cloneLevel(p.levels[0]));}));
test('a one-level campaign is valid',()=>good(p=>p.levels=[newLevel(['radish'],'litterer')]));
test('fifty waves are valid',()=>good(p=>{const l=newLevel(['radish'],'litterer');while(l.waves.length<50)l.waves.push(cloneLevel(l).waves[0]);p.levels=[l];}));
const cases:[string,(p:any)=>void][]=[
 ['no empty campaign',p=>p.levels=[]],['no 201 levels',p=>{p.levels=Array.from({length:201},()=>cloneLevel(p.levels[0]));}],
 ['no empty allowed roster',p=>p.levels[0].allowedPlants=[]],['no duplicate allowed plant',p=>p.levels[0].allowedPlants.push(p.levels[0].allowedPlants[0])],
 ['no unknown plant reference',p=>p.levels[0].allowedPlants=['made_up']],['no unknown enemy reference',p=>p.levels[0].waves[0].groups[0].enemyId='made_up'],
 ['no duplicate level ID',p=>p.levels[1].id=p.levels[0].id],['no duplicate wave ID',p=>p.levels[1].waves[0].id=p.levels[0].waves[0].id],
 ['no duplicate group ID',p=>p.levels[1].waves[0].groups[0].id=p.levels[0].waves[0].groups[0].id],
 ['no unknown species ID',p=>p.balance.plants[0].id='unknown'],['no missing global plant',p=>p.balance.plants.pop()],['no missing global enemy',p=>p.balance.enemies.pop()],
 ['no per-level stat override',p=>p.levels[0].damage=42],['no per-wave HP multiplier',p=>p.levels[0].waves[0].hp_multiplier=2],['no group damage override',p=>p.levels[0].waves[0].groups[0].attack=40],
 ['no difficulty',p=>p.difficulty='hard'],['no plant evolution',p=>p.balance.plants[0].stage=2],['no skill levels',p=>p.balance.plants[0].skill_level=3],
 ['no special terrain',p=>p.levels[0].blocked_cells=[[0,0]]],['finite plant attack',p=>p.balance.plants[0].damage=NaN],['no negative HP',p=>p.balance.enemies[0].hp=-1],
 ['armor bounded below 100 percent',p=>p.balance.plants[0].armor=1],['known damage types only',p=>p.balance.enemies[0].damage_type='fire'],
 ['integer enemy quantity',p=>p.levels[0].waves[0].groups[0].count=2.5],['positive quantity',p=>p.levels[0].waves[0].groups[0].count=0],['five lanes only',p=>p.levels[0].waves[0].groups[0].lane=5],
 ['non-negative start',p=>p.levels[0].waves[0].groups[0].start=-1],['positive spawn interval',p=>p.levels[0].waves[0].groups[0].interval=0],
 ['no empty wave',p=>p.levels[0].waves[0].groups=[]],['no 257-enemy wave',p=>{const g=p.levels[0].waves[0].groups[0];p.levels[0].waves[0].groups=[{...g,count:256},{...g,id:'overflow',count:1}];}],
 ['no spawn beyond an hour',p=>p.levels[0].waves[0].groups[0]={...p.levels[0].waves[0].groups[0],count:100,start:0,interval:120}],
 ['stationary normal enemies cannot enter board',p=>p.balance.enemies[0].speed=0],
 ['mid-story wave exists',p=>p.levels[0].midWave=49],['mid-story requires wave',p=>{p.levels[0].midDialogue=[{speaker:'A',text:'B'}];p.levels[0].midWave=0;}],
 ['rescue requires exact target',p=>p.levels[38].objective.target=2],['defense target is zero',p=>p.levels[0].objective.target=8],
 ['rescue requires explicit knots',p=>{p.levels[0].objective={type:'rescue',target:3};}],
 ];
for(const [name,mutate] of cases)test(name,()=>bad(mutate));
test('warnings do not prevent deliberately unusual authored gameplay',()=>{const p=valid();p.levels[0].startingEnergy=0;assert.ok(gameIssues(p).some(x=>x.severity==='warning'));assert.doesNotThrow(()=>parseGameProject(p));});
test('Unicode schema lengths count code points like Godot',()=>good(p=>p.levels[0].title='🌱'.repeat(160)));
test('parse validates before cloning and rejects unknown keys',()=>assert.throws(()=>parseGameProject(change(p=>p.bad=true)),/interdit/));
test('legacy bonus goals are discarded instead of entering the game contract',()=>{const legacy=valid() as any;legacy.levels[0].optionalGoals=[{id:'healthy',title:'Ancien bonus',target:80}];const parsed=parseGameProject(legacy);assert.equal(Object.hasOwn(parsed.levels[0],'optionalGoals'),false);assert.equal(legacy.levels[0].optionalGoals.length,1);});
async function fixture(fn:(root:string)=>Promise<void>){const root=await mkdtemp(path.join(os.tmpdir(),'lunaria-authoring-'));try{await fn(root);}finally{await rm(root,{recursive:true,force:true});}}
test('new save roundtrips globally calibrated content and tracks MRU',()=>fixture(async root=>{const d=new GameDocuments(path.join(root,'profile')),file=path.join(root,'first.game.json');const p=valid();p.balance.plants[0].damage=71;const out=await d.save(p,'',file);assert.equal(out.path,file);assert.equal((await new GameDocuments(path.join(root,'profile')).bootstrap()).recent[0].path,file);assert.equal((await d.open(file)).project.balance.plants[0].damage,71);}));
test('save refuses an unowned token',()=>fixture(async root=>{const d=new GameDocuments(root);await assert.rejects(d.save(valid(),'forged'),/Enregistrer sous/);}));
test('external edits cannot be overwritten silently',()=>fixture(async root=>{const d=new GameDocuments(root),file=path.join(root,'a.json');const f=await d.save(valid(),'',file);await writeFile(file,'{}');await assert.rejects(d.save(valid(),f.token),/modifié hors/);assert.equal(await readFile(file,'utf8'),'{}');}));
test('saving twice preserves a previous JSON backup',()=>fixture(async root=>{const d=new GameDocuments(root),file=path.join(root,'a.json'),p=valid(),f=await d.save(p,'',file);p.title='Edited';await d.save(p,f.token);assert.equal(JSON.parse(await readFile(file+'.bak','utf8')).title,valid().title);}));
test('stale token does not replace another opened project',()=>fixture(async root=>{const d=new GameDocuments(root),a=await d.save(valid(),'',path.join(root,'a.json'));await d.save(valid(),'',path.join(root,'b.json'));await assert.rejects(d.save(valid(),a.token),/remplacé/);}));
test('recent open authorizes only recorded paths',()=>fixture(async root=>{const d=new GameDocuments(root);await assert.rejects(d.openRecent(path.join(root,'secret.json')),/inconnu/);}));
test('recovery persists semantic drafts and clear is effective after restart',()=>fixture(async root=>{const d=new GameDocuments(root),p=valid();p.levels[0].allowedPlants=[p.levels[0].allowedPlants[0],p.levels[0].allowedPlants[0]];await d.recover(p);assert.deepEqual((await new GameDocuments(root).bootstrap()).recovery,p);await d.clearRecovery();assert.equal((await d.bootstrap()).recovery,null);}));
test('recovery rejects structurally invalid objects',()=>fixture(async root=>{await assert.rejects(new GameDocuments(root).recover({bad:1}),/structure/);}));
async function game(root:string){await mkdir(path.join(root,'LunariaArtLibrary'),{recursive:true});await writeFile(path.join(root,'LunariaArtLibrary/pixel.png'),PIXEL_PNG);for(const f of ['domain/presentation/animation_registry.gd','app/controllers/campaign_flow.gd']){await mkdir(path.dirname(path.join(root,f)),{recursive:true});await writeFile(path.join(root,f),'extends RefCounted');}await mkdir(path.join(root,'domain/logic'),{recursive:true});await writeFile(path.join(root,'domain/logic/event_runtime.gd'),'extends RefCounted');await mkdir(path.join(root,'content/design'),{recursive:true});await writeFile(path.join(root,'project.godot'),'[application]');await writeFile(path.join(root,'content/design/game_content.gd'),'extends RefCounted');}
test('publish replaces only shared game document and creates backup',()=>fixture(async root=>{await game(root);const p=fixturePresentation(valid(),'library://pixel.png'),file=await publishGameProject(p,root);p.title='New balance';await publishGameProject(p,root);assert.equal(JSON.parse(await readFile(file,'utf8')).title,'New balance');assert.equal(JSON.parse(await readFile(file+'.bak','utf8')).title,valid().title);}));
test('publisher requires the new runtime marker',()=>fixture(async root=>{await writeFile(path.join(root,'project.godot'),'x');await assert.rejects(publishGameProject(fixturePresentation(valid(),'library://pixel.png'),root),/V1.10/);}));
test('publisher validates before writing',()=>fixture(async root=>{await game(root);await assert.rejects(publishGameProject(change(p=>p.levels[0].hp=10),root),/interdit/);}));
test('publisher refuses destination symlinks',t=>fixture(async root=>{await game(root);await writeFile(path.join(root,'keep.json'),'untouched');try{await symlink(path.join(root,'keep.json'),path.join(root,'content/design/game_content.json'));}catch(error){if(process.platform==='win32'&&['EPERM','EACCES'].includes((error as NodeJS.ErrnoException).code??'')){t.skip('Création de liens symboliques non autorisée sur cet hôte Windows.');return;}throw error;}await assert.rejects(publishGameProject(fixturePresentation(valid(),'library://pixel.png'),root),/non régulière/);assert.equal(await readFile(path.join(root,'keep.json'),'utf8'),'untouched');}));
test('publisher does not copy or modify cinematics or images',()=>fixture(async root=>{await game(root);await writeFile(path.join(root,'image.png'),'KEEP');await mkdir(path.join(root,'content/cinematics'));await writeFile(path.join(root,'content/cinematics/scene.json'),'KEEP');await publishGameProject(fixturePresentation(valid(),'library://pixel.png'),root);assert.equal(await readFile(path.join(root,'image.png'),'utf8'),'KEEP');assert.equal(await readFile(path.join(root,'content/cinematics/scene.json'),'utf8'),'KEEP');}));

test('mid-scene stays on its wave when a preceding wave is inserted',()=>{const l=valid().levels[0];l.midWave=2;const w=cloneLevel(l).waves[0];const result=replaceWaves(l,[w,...l.waves]);assert.equal(result.midWave,3);assert.equal(l.midWave,2);});
test('mid-scene stays on its wave when a preceding wave is removed',()=>{const l=valid().levels[0];l.midWave=2;assert.equal(replaceWaves(l,l.waves.slice(1)).midWave,1);});
test('removing the mid-scene wave disables the trigger instead of attaching it elsewhere',()=>{const l=valid().levels[0];l.midWave=1;assert.equal(replaceWaves(l,l.waves.slice(1)).midWave,0);l.midWave=0;assert.equal(replaceWaves(l,l.waves).midWave,0);});
test('negative source damage is clamped exactly as in Godot',()=>{const t={armor:0,resistances:{physical:0,piercing:0,toxic:0}};for(const k of ['physical','piercing','toxic','pure'] as const)assert.equal(damageAfterProtection(-10,k,t),0);});

test('empty roster and temporary empty name remain recoverable but not publishable',()=>fixture(async root=>{const d=new GameDocuments(root),p=valid();p.title='';p.balance.plants[0].name='';p.levels[0].allowedPlants=[];await d.recover(p);assert.deepEqual((await new GameDocuments(root).bootstrap()).recovery,p);assert.throws(()=>parseGameProject(p));}));
test('draft relaxation does not permit arbitrary fields or oversized numbers',()=>fixture(async root=>{const p=valid() as any,d=new GameDocuments(root);p.levels[0].damage=8;await assert.rejects(d.recover(p));delete p.levels[0].damage;p.balance.enemies[0].hp=20001;await assert.rejects(d.recover(p));}));
test('draft cannot contain an empty campaign or empty global catalog',()=>fixture(async root=>{const d=new GameDocuments(root),p=valid();p.levels=[];await assert.rejects(d.recover(p));const q=valid();q.balance.plants=[];await assert.rejects(d.recover(q));}));
