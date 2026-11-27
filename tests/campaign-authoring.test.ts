import {fixturePresentation,PIXEL_PNG} from './presentation-fixture.js';
import {duplicateEnemy} from '../src/shared/game/enemyRules.js';
import test,{type TestContext} from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { seedProject } from './fixtures/seed40.js';
import { seedProject as emptySeedProject } from '../src/shared/game/seed.js';
import { GameDocuments } from '../src/main/gameDocuments.js';
import { setContentArchived } from '../src/shared/game/contentArchives.js';
import { GAME_SCHEMA } from '../src/shared/game/schema.js';
import { ensureCampaign, campaignOf, compileCampaign, moveCampaignStep, safeMoviePath, advanceCampaign, playableCampaignSteps, travelBookUnlockCursor, isTravelBookUnlocked, herbariumUnlockCursor, isHerbariumUnlocked } from '../src/shared/game/campaign.js';
import { gameIssues, parseGameProject } from '../src/shared/game/validation.js';
import { planCampaign, publishCampaign } from '../src/main/campaignPublisher.js';
import { newBubble, newCinematic } from '../src/shared/model.js';
import type { GameProject, CampaignStep } from '../src/shared/game/types.js';
const project=()=>{const p=seedProject();ensureCampaign(p);return p;};
const errors=(p:unknown)=>gameIssues(p).filter(i=>i.severity==='error');
const bad=(mutate:(p:any)=>void)=>{const p=project();mutate(p);assert.ok(errors(p).length>0);};
const steps:CampaignStep[]=[{id:'intro',kind:'cinematic',cinematicId:'f',skippable:true},{id:'level',kind:'level',levelId:'l'},{id:'end',kind:'cinematic',cinematicId:'f',skippable:false}];
test('campaign default references all forty levels without mutating the catalogue',()=>{const p=seedProject(),before=JSON.stringify(p),c=campaignOf(p);assert.equal(c.steps.length,40);assert.equal(JSON.stringify(p),before);assert.ok(c.steps.every(s=>s.kind==='level'));});
test('new project starts without missions and saves as one document',()=>fixture(async root=>{const p=emptySeedProject();ensureCampaign(p);p.cinematics=[];assert.equal(p.levels.length,0);assert.equal(p.campaign!.steps.length,0);assert.deepEqual(errors(p),[]);const file=path.join(root,'lunaria.game.json'),documents=new GameDocuments(path.join(root,'profile'));await documents.save(p,'',file);assert.deepEqual((await documents.open(file)).project,p);}));
test('explicit default sequence is valid and warning-free',()=>assert.deepEqual(gameIssues(project()),[]));
test('invasive foci positions and reinforcement settings survive publication',()=>fixture(async root=>{
 const x=await setup(root),level=x.p.levels[0];
 const focus=duplicateEnemy(x.p,'thorn_knot');focus.rules!.spawn={mode:'placement',x:6.5};
 level.objective={type:'invasive_foci',target:0};
 level.objectiveText='Détruire les foyers.';
 level.invasiveFoci={focusEnemyId:focus.id,positions:[{row:1,col:5},{row:3,col:6}],reinforcementEnemyId:'litterer',interval:12.5};
 assert.deepEqual(errors(x.p),[]);
 const published=await publishCampaign(x.p,x.game,x.library);
 const game=JSON.parse(await fs.readFile(published.path,'utf8'));
 assert.equal(game.levels[0].objective.type,'invasive_foci');
 assert.deepEqual(game.levels[0].invasiveFoci,level.invasiveFoci);
 level.invasiveFoci.positions[1]={row:1,col:5};
 assert.ok(errors(x.p).some(i=>i.message.includes('même case')));
}));
test('wave seed rewards are independent integers and bounded',()=>{const p=project(),waves=p.levels[0].waves;waves[0].seedReward=0;waves[1].seedReward=10000;assert.deepEqual(errors(p),[]);waves[0].seedReward=1.5;assert.ok(errors(p).some(i=>i.path.endsWith('seedReward')));waves[0].seedReward=10001;assert.ok(errors(p).some(i=>i.path.endsWith('seedReward')));});
test('publication reorders levels by stable sequence IDs and preserves the authoring library',()=>{const p=project(),first=p.levels[0].id,last=p.levels[39].id;p.campaign!.steps=[p.campaign!.steps[39],p.campaign!.steps[0]];const text=JSON.stringify(p),out=compileCampaign(parseGameProject(p));assert.deepEqual(out.levels.map(l=>l.id),[last,first]);assert.equal(JSON.stringify(p),text);assert.equal(p.levels.length,40);assert.ok(gameIssues(p).some(i=>i.severity==='warning'));});
test('step drag/drop before/after/end is immutable and stable',()=>{const s=structuredClone(steps),before=JSON.stringify(s);assert.deepEqual(moveCampaignStep(s,'end','intro').map(x=>x.id),['end','intro','level']);assert.deepEqual(moveCampaignStep(s,'intro',null).map(x=>x.id),['level','end','intro']);assert.equal(JSON.stringify(s),before);assert.equal(moveCampaignStep(s,'no','intro'),s);assert.equal(moveCampaignStep(s,'intro','no'),s);assert.equal(moveCampaignStep(s,'intro','intro'),s);});

test('playable end is saved with all future content and can be moved or removed to extend publication',()=>fixture(async root=>{
 const p=project(),c=p.campaign!,marker:CampaignStep={id:'playable_end',kind:'end'};
 c.steps.splice(1,0,marker);
 const before=structuredClone(p),out=compileCampaign(parseGameProject(p));
 assert.deepEqual(p,before);assert.equal(out.levels.length,1);assert.deepEqual(out.campaign!.steps,[c.steps[0],marker]);
 assert.deepEqual(playableCampaignSteps(p),[c.steps[0]]);
 const documents=new GameDocuments(path.join(root,'profile')),file=path.join(root,'campaign.game.json');
 await documents.save(p,'',file);assert.deepEqual((await documents.open(file)).project,p);
 c.steps=moveCampaignStep(c.steps,marker.id,null);assert.equal(compileCampaign(p).levels.length,40);
 c.steps=c.steps.filter(s=>s.kind!=='end');assert.equal(compileCampaign(p).campaign!.steps.length,40);
}));

test('end marker at the start publishes an empty journey with its closing card; at the end it keeps all levels',()=>{
 const p=project(),c=p.campaign!;c.steps.unshift({id:'playable_end',kind:'end'});
 const out=parseGameProject(compileCampaign(p));assert.equal(out.levels.length,0);assert.deepEqual(out.campaign!.steps,[{id:'playable_end',kind:'end'}]);
 c.steps=moveCampaignStep(c.steps,'playable_end',null);assert.equal(compileCampaign(p).levels.length,40);
});

test('end marker cannot be passed by callbacks or a cursor already beyond it',()=>{
 const s:CampaignStep[]=[steps[1],{id:'playable_end',kind:'end'},steps[0]];
 assert.equal(advanceCampaign(s,0,'level','victory'),1);
 for(const event of ['victory','finished','skip','defeat','abort','error'] as const){
  assert.equal(advanceCampaign(s,1,'playable_end',event),1);
  assert.equal(advanceCampaign(s,2,'intro',event),2);
 }
});

test('travel book and herbarium unlock milestones coexist independently, survive save/publish, and stay locked after end',()=>fixture(async root=>{
 const p=project(),c=p.campaign!,herbarium:CampaignStep={id:'unlock_herb',kind:'unlock_herbarium'},book:CampaignStep={id:'unlock_book',kind:'unlock_travel_book'};
 assert.equal(herbariumUnlockCursor(c.steps),0);
 assert.equal(travelBookUnlockCursor(c.steps),0);
 assert.equal(isHerbariumUnlocked(c.steps,0),true);
 assert.equal(isTravelBookUnlocked(c.steps,0),true);
 // Place herbarium after level 2 and travel book after level 4: passive milestones never shift each other's playable cursor.
 c.steps.splice(2,0,herbarium);
 c.steps.splice(5,0,book);
 assert.equal(herbariumUnlockCursor(c.steps),2);
 assert.equal(travelBookUnlockCursor(c.steps),4);
 assert.equal(isHerbariumUnlocked(c.steps,1),false);
 assert.equal(isHerbariumUnlocked(c.steps,2),true);
 assert.equal(isTravelBookUnlocked(c.steps,3),false);
 assert.equal(isTravelBookUnlocked(c.steps,4),true);
 assert.equal(playableCampaignSteps(p).length,40);
 assert.equal(advanceCampaign(c.steps,1,c.steps[1].id,'victory'),2);
 assert.equal(advanceCampaign(c.steps,2,herbarium.id,'finished'),2);
 assert.equal(advanceCampaign(c.steps,4,book.id,'finished'),4);
 const documents=new GameDocuments(path.join(root,'profile')),file=path.join(root,'campaign.game.json');
 await documents.save(p,'',file);
 assert.deepEqual((await documents.open(file)).project,p);
 const compiled=parseGameProject(compileCampaign(p));
 assert.equal(compiled.campaign!.steps[2].kind,'unlock_herbarium');
 assert.equal(compiled.campaign!.steps[5].kind,'unlock_travel_book');
 assert.equal(compiled.levels.length,40);
 // Place at the very beginning -> unlocked from start.
 c.steps=moveCampaignStep(c.steps,herbarium.id,c.steps[0].id);
 assert.equal(herbariumUnlockCursor(c.steps),0);
 assert.equal(isHerbariumUnlocked(c.steps,0),true);
 // Place both after end -> locked for the published slice without leaking future levels.
 c.steps.splice(2,0,{id:'playable_end',kind:'end'});
 c.steps=moveCampaignStep(c.steps,herbarium.id,null);
 c.steps=moveCampaignStep(c.steps,book.id,null);
 assert.equal(herbariumUnlockCursor(c.steps),-1);
 assert.equal(travelBookUnlockCursor(c.steps),-1);
 assert.equal(isHerbariumUnlocked(c.steps,1),false);
 assert.equal(isTravelBookUnlocked(c.steps,1),false);
 assert.ok(gameIssues(p).some(i=>i.severity==='warning'&&i.message.includes('carnet de voyage')));
 assert.ok(gameIssues(p).some(i=>i.severity==='warning'&&i.message.includes('L’herbier')));
 const cut=parseGameProject(compileCampaign(p));
 assert.equal(cut.levels.length,1);
 assert.deepEqual(cut.campaign!.steps.map(s=>s.kind),['level','end','unlock_herbarium','unlock_travel_book']);
 assert.equal(herbariumUnlockCursor(cut.campaign!.steps),-1);
 assert.equal(travelBookUnlockCursor(cut.campaign!.steps),-1);
}));
for(const [label,mutate] of [
 ['unknown level',(p:any)=>p.campaign.steps[0].levelId='missing'],
 ['duplicate step',(p:any)=>p.campaign.steps.push(p.campaign.steps[0])],
 ['duplicate level',(p:any)=>p.campaign.steps.push({...p.campaign.steps[0],id:'other'})],
 ['empty sequence',(p:any)=>p.campaign.steps=[]],
 ['no levels',(p:any)=>{p.campaign.cinematics=[{id:'f',title:'Film',file:'a.json',documentId:'d'}];p.campaign.steps=[{id:'s',kind:'cinematic',cinematicId:'f',skippable:true}];}],
 ['missing cinematic',(p:any)=>p.campaign.steps.unshift({id:'s',kind:'cinematic',cinematicId:'missing',skippable:true})],
 ['missing skip flag',(p:any)=>{p.campaign.cinematics=[{id:'f',title:'Film',file:'a.json',documentId:'d'}];p.campaign.steps.unshift({id:'s',kind:'cinematic',cinematicId:'f'});}],
 ['wrong discriminator fields',(p:any)=>p.campaign.steps[0].skippable=true],
 ['duplicate playable end',(p:any)=>p.campaign.steps.push({id:'end_a',kind:'end'},{id:'end_b',kind:'end'})],
 ['end marker with level data',(p:any)=>p.campaign.steps.push({id:'end_a',kind:'end',levelId:p.levels[0].id})],
 ['end marker with movie data',(p:any)=>p.campaign.steps.push({id:'end_a',kind:'end',skippable:true,cinematicId:'future'})],
 ['duplicate travel book unlock',(p:any)=>p.campaign.steps.push({id:'unlock_a',kind:'unlock_travel_book'},{id:'unlock_b',kind:'unlock_travel_book'})],
 ['travel book unlock with level data',(p:any)=>p.campaign.steps.push({id:'unlock_a',kind:'unlock_travel_book',levelId:p.levels[0].id})],
 ['travel book unlock with movie data',(p:any)=>p.campaign.steps.push({id:'unlock_a',kind:'unlock_travel_book',skippable:true,cinematicId:'future'})],
 ['duplicate herbarium unlock',(p:any)=>p.campaign.steps.push({id:'herb_a',kind:'unlock_herbarium'},{id:'herb_b',kind:'unlock_herbarium'})],
 ['herbarium unlock with level data',(p:any)=>p.campaign.steps.push({id:'herb_a',kind:'unlock_herbarium',levelId:p.levels[0].id})],
 ['herbarium unlock with movie data',(p:any)=>p.campaign.steps.push({id:'herb_a',kind:'unlock_herbarium',skippable:true,cinematicId:'future'})],
 ['missing level reference',(p:any)=>delete p.campaign.steps[0].levelId],
 ['absolute path',(p:any)=>p.campaign.cinematics=[{id:'f',title:'Film',file:'C:/a.json',documentId:'d'}]],
 ['case alias file',(p:any)=>p.campaign.cinematics=[{id:'f',title:'A',file:'intro.json',documentId:'a'},{id:'f2',title:'B',file:'INTRO.json',documentId:'b'}]],
 ['duplicate film id',(p:any)=>p.campaign.cinematics=[{id:'f',title:'A',file:'a.json',documentId:'a'},{id:'f',title:'B',file:'b.json',documentId:'b'}]],
] as [string,(p:any)=>void][])test('campaign rejects '+label,()=>bad(mutate));
for(const file of ['../a.json','/a.json','a//b.json','a/./b.json','C:/a.json','a\\b.json','https://site/a.json','a.json#evil','a.txt','con.json','a /b.json','a\u0000.json'])test('movie path rejects '+JSON.stringify(file),()=>assert.equal(safeMoviePath(file),false));
for(const file of ['intro.json','Europe/Réveil de Lunaria.cinematic.json','Films/été/01.json'])test('movie path accepts '+file,()=>assert.equal(safeMoviePath(file),true));
test('victory only advances the matching level step',()=>{assert.equal(advanceCampaign(steps,1,'level','victory'),2);for(const e of ['defeat','abort','error','finished','skip'] as const)assert.equal(advanceCampaign(steps,1,'level',e),1);assert.equal(advanceCampaign(steps,1,'intro','victory'),1);});
test('optional film can finish or be passed explicitly',()=>{assert.equal(advanceCampaign(steps,0,'intro','finished'),1);assert.equal(advanceCampaign(steps,0,'intro','skip'),1);});
test('mandatory film can only finish',()=>{assert.equal(advanceCampaign(steps,2,'end','skip'),2);assert.equal(advanceCampaign(steps,2,'end','finished'),3);});
test('preview, errors, abort, stale callback and end are read-only',()=>{for(const e of ['error','abort','defeat'] as const)assert.equal(advanceCampaign(steps,0,'intro',e),0);assert.equal(advanceCampaign(steps,0,'intro','finished',true),0);assert.equal(advanceCampaign(steps,1,'intro','finished'),1);assert.equal(advanceCampaign(steps,3,'end','finished'),3);});
async function fixture(fn:(root:string)=>Promise<void>){const root=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-sequence-'));try{await fn(root);}finally{await fs.rm(root,{force:true,recursive:true});}}
async function symlinkOrSkip(t:TestContext,target:string,link:string,type?:'dir'|'file'|'junction'){try{await fs.symlink(target,link,type);return true;}catch(error){if(process.platform==='win32'&&['EPERM','EACCES'].includes((error as NodeJS.ErrnoException).code??'')){t.skip('Création de liens symboliques non autorisée sur cet hôte Windows.');return false;}throw error;}}
async function setup(root:string){
 const movies=path.join(root,'films'),library=path.join(root,'library'),game=path.join(root,'game'),profile=path.join(root,'profile');
 await fs.mkdir(movies,{recursive:true});await fs.mkdir(library,{recursive:true});await fs.mkdir(path.join(game,'app/controllers'),{recursive:true});await fs.mkdir(path.join(game,'content/design'),{recursive:true});
 await fs.mkdir(path.join(game,'domain/presentation'),{recursive:true});await fs.writeFile(path.join(game,'domain/presentation/animation_registry.gd'),'extends RefCounted');await fs.mkdir(path.join(game,'domain/logic'),{recursive:true});await fs.writeFile(path.join(game,'domain/logic/event_runtime.gd'),'extends RefCounted');
 await fs.writeFile(path.join(game,'project.godot'),'[application]');await fs.writeFile(path.join(game,'app/controllers/campaign_flow.gd'),'extends RefCounted');
 const doc=newCinematic();doc.id='cin_intro';doc.title='Réveil';doc.shots[0].background.asset='library://decor.png';
 await fs.writeFile(path.join(movies,'intro.json'),JSON.stringify(doc));await fs.writeFile(path.join(library,'decor.png'),PIXEL_PNG);
 const p=fixturePresentation(project(),'library://decor.png');p.campaign!.cinematics=[{id:'film_intro',title:doc.title,file:'intro.json',documentId:doc.id}];p.campaign!.steps.unshift({id:'step_intro',kind:'cinematic',cinematicId:'film_intro',skippable:false});p.campaign!.steps.push({id:'step_end',kind:'cinematic',cinematicId:'film_intro',skippable:true});
 p.cinematics=[doc];
 const content=path.join(game,'content/design/game_content.json');await fs.writeFile(content,'{"old":true}');
 return {movies,library,game,profile,p,doc,content};
}
test('preflight only reads, deduplicates resources, and never changes the author document',()=>fixture(async root=>{const x=await setup(root),before=JSON.stringify(x.p),r=await planCampaign(x.p,x.library);assert.equal(r.check.films,1);assert.equal(r.check.assets,1);assert.equal(r.check.steps,42);assert.equal(JSON.stringify(x.p),before);assert.equal(await fs.readFile(x.content,'utf8'),'{"old":true}');assert.ok(r.project.campaign!.cinematics[0].file.startsWith('content/cinematics/studio/'));}));

test('publication stops at the marker and does not require future-only level or film media',()=>fixture(async root=>{
 const x=await setup(root),c=x.p.campaign!,future=newCinematic();
 future.title='Suite en préparation';future.shots[0].background.asset='library://future-missing.png';
 x.p.cinematics=[x.doc,future];
 c.cinematics.push({id:'future_film',title:future.title,file:'future.json',documentId:future.id});
 c.steps.splice(2,0,{id:'playable_end',kind:'end'});
 c.steps.push({id:'future_step',kind:'cinematic',cinematicId:'future_film',skippable:true});
 x.p.levels[1].terrainImage='library://future-terrain-missing.png';
 const before=structuredClone(x.p),result=await publishCampaign(x.p,x.game,x.library),published=JSON.parse(await fs.readFile(result.path,'utf8'));
 assert.deepEqual(x.p,before);assert.equal(result.levels,1);assert.equal(result.films,1);
 assert.deepEqual(published.campaign.steps.map((s:CampaignStep)=>s.kind),['cinematic','level','end']);
 assert.equal(published.campaign.cinematics[0].id,'film_intro');
 assert.ok((await planCampaign(x.p,x.library)).check.warnings.some(s=>s.includes('après la fin actuelle')));
}));
test('publication includes range music and event sounds and refuses a missing audio asset',()=>fixture(async root=>{
 const x=await setup(root),shot=x.doc.shots[0];
 const settings={volume:.6,loop:true,fadeIn:1,fadeOut:2};
 x.doc.musicTracks=[{...settings,id:'music',asset:'library://song.ogg',startShotId:shot.id,endShotId:shot.id}];
 shot.sounds=[{...settings,id:'cue',asset:'library://cue.wav',loop:false,event:'shot_start',targetId:'',delay:.2,duration:1}];
 x.p.cinematics=[x.doc];
 await fs.writeFile(path.join(x.library,'song.ogg'),'music fixture');await fs.writeFile(path.join(x.library,'cue.wav'),'sound fixture');
 const result=await publishCampaign(x.p,x.game,x.library);assert.equal(result.assets,3);
 const published=JSON.parse(await fs.readFile(x.content,'utf8'));
 const film=JSON.parse(await fs.readFile(path.join(x.game,published.campaign.cinematics[0].file),'utf8'));
 assert.deepEqual(film.musicTracks,x.doc.musicTracks);assert.deepEqual(film.shots[0].sounds,shot.sounds);
 assert.equal(await fs.readFile(path.join(x.game,'LunariaArtLibrary/song.ogg'),'utf8'),'music fixture');
 assert.equal(await fs.readFile(path.join(x.game,'LunariaArtLibrary/cue.wav'),'utf8'),'sound fixture');
 await fs.unlink(path.join(x.library,'cue.wav'));await assert.rejects(planCampaign(x.p,x.library),/Ressource introuvable/);
}));
test('publication copies both terrain states and rejects a missing restored background',()=>fixture(async root=>{
 const x=await setup(root);x.p.levels[0].terrainImage='library://terrain.png';
 x.p.levels[0].restoredTerrainImage='library://restored.png';
 await fs.writeFile(path.join(x.library,'terrain.png'),PIXEL_PNG);
 await fs.writeFile(path.join(x.library,'restored.png'),PIXEL_PNG);
 const result=await publishCampaign(x.p,x.game,x.library);
 assert.equal(result.assets,3);
 const published=JSON.parse(await fs.readFile(x.content,'utf8'));
 assert.equal(published.levels[0].terrainImage,'library://terrain.png');
 assert.equal(published.levels[0].restoredTerrainImage,'library://restored.png');
 assert.deepEqual(await fs.readFile(path.join(x.game,'LunariaArtLibrary/terrain.png')),PIXEL_PNG);
 assert.deepEqual(await fs.readFile(path.join(x.game,'LunariaArtLibrary/restored.png')),PIXEL_PNG);
 await fs.unlink(path.join(x.library,'restored.png'));
 await assert.rejects(planCampaign(x.p,x.library),/Ressource introuvable/);
}));
test('publication is complete, shares repeated images, keeps backup and leaves sources untouched',()=>fixture(async root=>{const x=await setup(root),r=await publishCampaign(x.p,x.game,x.library);assert.equal(r.path,x.content);assert.equal(r.films,1);const pub=JSON.parse(await fs.readFile(x.content,'utf8'));assert.deepEqual(errors(pub),[]);assert.equal(await fs.readFile(x.content+'.bak','utf8'),'{"old":true}');assert.ok(await fs.stat(path.join(x.game,pub.campaign.cinematics[0].file)));assert.equal((await fs.readdir(path.join(x.game,'content/cinematics/studio'))).length,1);assert.equal((await fs.readdir(path.join(x.game,'LunariaArtLibrary'))).length,1);assert.equal(x.p.campaign!.cinematics[0].file,'intro.json');assert.equal(JSON.parse(await fs.readFile(path.join(x.movies,'intro.json'),'utf8')).id,'cin_intro');}));
test('embedded cinematic with a thought bubble round-trips and publishes without its original file', () => fixture(async root => {
  const x = await setup(root);
  const thought = newBubble(null, 'thought');
  x.doc.shots[0].bubbles.push(thought);
  const documentPath = path.join(root, 'lunaria.game.json');
  const documents = new GameDocuments(x.profile);
  await documents.save(x.p, '', documentPath);
  const reopened = (await documents.open(documentPath)).project;
  assert.deepEqual(reopened.cinematics, [x.doc]);
  await fs.rm(x.movies, { recursive: true });
  const before = await fs.readFile(documentPath, 'utf8');
  const result = await publishCampaign(reopened, x.game, x.library);
  assert.equal(result.films, 1);
  const published = JSON.parse(await fs.readFile(x.content, 'utf8'));
  assert.equal(published.cinematics, undefined);
  assert.equal(await fs.readFile(documentPath, 'utf8'), before);
  const movie = JSON.parse(await fs.readFile(path.join(x.game, published.campaign.cinematics[0].file), 'utf8'));
  assert.equal(movie.shots[0].bubbles[0].kind, 'thought');
  assert.deepEqual(movie.shots[0].bubbles[0].tail, thought.tail);
}));
test('a project cannot save a linked cinematic missing from its JSON',()=>fixture(async root=>{const x=await setup(root),documents=new GameDocuments(x.profile);x.p.cinematics=[];await assert.rejects(documents.save(x.p,'',path.join(root,'incomplete.game.json')),/intégrée/);}));
test('republication of identical content is deterministic and non-duplicating',()=>fixture(async root=>{const x=await setup(root);await publishCampaign(x.p,x.game,x.library);const first=await fs.readFile(x.content,'utf8');await publishCampaign(x.p,x.game,x.library);assert.equal(await fs.readFile(x.content,'utf8'),first);assert.equal((await fs.readdir(path.join(x.game,'content/cinematics/studio'))).length,1);}));
test('Studio categories do not change the published cinematic',()=>fixture(async root=>{const x=await setup(root);x.p.cinematics=[x.doc];const first=await planCampaign(x.p,x.library);x.doc.category='Chapitre final';const second=await planCampaign(x.p,x.library);assert.equal(second.project.campaign!.cinematics[0].file,first.project.campaign!.cinematics[0].file);const published=second.files.find(file=>file.relative===second.project.campaign!.cinematics[0].file);assert.equal(JSON.parse(published!.text!).category,undefined);}));
test('content archives survive a project save without changing published bytes', () => fixture(async root => {
  const { p, doc, content, game, library, profile } = await setup(root);
  await fs.writeFile(path.join(game, 'content/design/game-project.schema.json'), JSON.stringify(GAME_SCHEMA));
  await publishCampaign(p, game, library);
  const catalog = await fs.readFile(content);
  const filmFile = path.join(game, JSON.parse(catalog.toString()).campaign.cinematics[0].file);
  const film = await fs.readFile(filmFile);

  setContentArchived(p, 'cinematics', doc.id, true);
  setContentArchived(p, 'levels', p.levels[0].id, true);
  const file = path.join(root, 'archive.game.json');
  const documents = new GameDocuments(profile);
  await documents.save(p, '', file);
  const reopened = (await documents.open(file)).project;
  assert.deepEqual(reopened.contentArchives, { cinematics: [doc.id], levels: [p.levels[0].id] });

  const result = await publishCampaign(reopened, game, library);
  assert.equal(result.films, 1);
  assert.deepEqual(await fs.readFile(content), catalog);
  assert.deepEqual(await fs.readFile(filmFile), film);
}));
test('changing a film publishes an immutable new blob without rewriting the previous film',()=>fixture(async root=>{const x=await setup(root);await publishCampaign(x.p,x.game,x.library);const first=JSON.parse(await fs.readFile(x.content,'utf8')).campaign.cinematics[0].file;x.doc.title='Nouveau titre';await fs.writeFile(path.join(x.movies,'intro.json'),JSON.stringify(x.doc));await publishCampaign(x.p,x.game,x.library);const second=JSON.parse(await fs.readFile(x.content,'utf8')).campaign.cinematics[0].file;assert.notEqual(first,second);assert.equal(JSON.parse(await fs.readFile(path.join(x.game,first),'utf8')).title,'Réveil');}));
test('missing film aborts before any active content write',()=>fixture(async root=>{const x=await setup(root);x.p.cinematics=[];await assert.rejects(publishCampaign(x.p,x.game,x.library),/absente du projet/);assert.equal(await fs.readFile(x.content,'utf8'),'{"old":true}');}));
test('invalid film aborts without publishing',()=>fixture(async root=>{const x=await setup(root);x.p.cinematics=[{} as any];await assert.rejects(publishCampaign(x.p,x.game,x.library));assert.equal(await fs.readFile(x.content,'utf8'),'{"old":true}');}));
test('missing asset aborts before writes',()=>fixture(async root=>{const x=await setup(root);await fs.unlink(path.join(x.library,'decor.png'));await assert.rejects(publishCampaign(x.p,x.game,x.library),/Ressource/);assert.equal(await fs.readFile(x.content,'utf8'),'{"old":true}');}));
test('changed image is versioned across game and cinematic references without changing sources or previous publication',()=>fixture(async root=>{
 const x=await setup(root);x.p.cinematics=[x.doc];x.p.levels[0].terrainImage='library://decor.png';
 x.p.levels[0].restoredTerrainImage='library://decor.png';
 x.p.levels[0].title='library://decor.png';x.doc.title='library://decor.png';
 await publishCampaign(x.p,x.game,x.library);
 const before=await fs.readFile(x.content,'utf8'),old=JSON.parse(before),oldFilm=await fs.readFile(path.join(x.game,old.campaign.cinematics[0].file),'utf8');
 const changed=Buffer.concat([PIXEL_PNG,Buffer.from('updated image')]);await fs.writeFile(path.join(x.library,'decor.png'),changed);
 const author=JSON.stringify(x.p),sourceFilm=await fs.readFile(path.join(x.movies,'intro.json'),'utf8');
 const preflight=await planCampaign(x.p,x.library,x.game);
 const ref=preflight.project.levels[0].terrainImage!;
 assert.match(ref,/^library:\/\/studio_versions\/[a-f0-9]{64}\.png$/);
 assert.equal(await fs.readFile(x.content,'utf8'),before);
 await assert.rejects(fs.stat(path.join(x.game,'LunariaArtLibrary',ref.slice(10))),{code:'ENOENT'});
 await publishCampaign(x.p,x.game,x.library);
 const published=JSON.parse(await fs.readFile(x.content,'utf8')),film=JSON.parse(await fs.readFile(path.join(x.game,published.campaign.cinematics[0].file),'utf8'));
 assert.equal(published.levels[0].terrainImage,ref);
 assert.equal(published.levels[0].restoredTerrainImage,ref);
 assert.equal(published.balance.plants[0].visual.sprite.asset,ref);
 assert.equal(film.shots[0].background.asset,ref);
 assert.equal(published.levels[0].title,'library://decor.png');assert.equal(film.title,'library://decor.png');
 assert.notEqual(published.campaign.cinematics[0].file,old.campaign.cinematics[0].file);
 assert.deepEqual(await fs.readFile(path.join(x.game,'LunariaArtLibrary',ref.slice(10))),changed);
 assert.deepEqual(await fs.readFile(path.join(x.game,'LunariaArtLibrary/decor.png')),PIXEL_PNG);
 assert.equal(await fs.readFile(path.join(x.game,old.campaign.cinematics[0].file),'utf8'),oldFilm);
 assert.equal(await fs.readFile(x.content+'.bak','utf8'),before);
 assert.equal(JSON.stringify(x.p),author);assert.equal(await fs.readFile(path.join(x.movies,'intro.json'),'utf8'),sourceFilm);
 assert.deepEqual(await fs.readFile(path.join(x.library,'decor.png')),changed);
 const first=await fs.readFile(x.content,'utf8');await publishCampaign(x.p,x.game,x.library);
 assert.equal(await fs.readFile(x.content,'utf8'),first);
 assert.equal((await fs.readdir(path.join(x.game,'LunariaArtLibrary/studio_versions'))).length,1);
 assert.equal((await fs.readdir(path.join(x.game,'content/cinematics/studio'))).length,2);
}));
test('changed audio is versioned and shared by cinematic cues and the presentation catalogue',()=>fixture(async root=>{
 const x=await setup(root),ref='library://song.ogg';x.p.cinematics=[x.doc];
 x.doc.shots[0].audio={asset:ref,volume:1,loop:true};
 x.p.presentation!.audio=[{id:'song',name:'Song',asset:ref,bus:'music',volume:1,loop:true,pitchVariation:0,maxInstances:1}];
 await fs.writeFile(path.join(x.library,'song.ogg'),'old audio');await publishCampaign(x.p,x.game,x.library);
 await fs.writeFile(path.join(x.library,'song.ogg'),'new audio');await publishCampaign(x.p,x.game,x.library);
 const published=JSON.parse(await fs.readFile(x.content,'utf8')),film=JSON.parse(await fs.readFile(path.join(x.game,published.campaign.cinematics[0].file),'utf8'));
 const next=published.presentation.audio[0].asset;assert.match(next,/^library:\/\/studio_versions\/[a-f0-9]{64}\.ogg$/);
 assert.equal(film.shots[0].audio.asset,next);assert.equal(x.doc.shots[0].audio.asset,ref);
 assert.equal(await fs.readFile(path.join(x.game,'LunariaArtLibrary',next.slice(10)),'utf8'),'new audio');
 assert.equal(await fs.readFile(path.join(x.game,'LunariaArtLibrary/song.ogg'),'utf8'),'old audio');
}));
test('corrupted versioned destination aborts before writes and preserves active content',()=>fixture(async root=>{
 const x=await setup(root);await publishCampaign(x.p,x.game,x.library);
 const before=await fs.readFile(x.content,'utf8'),changed=Buffer.concat([PIXEL_PNG,Buffer.from('changed')]);
 await fs.writeFile(path.join(x.library,'decor.png'),changed);
 const folder=path.join(x.game,'LunariaArtLibrary/studio_versions');await fs.mkdir(folder);
 const dest=path.join(folder,createHash('sha256').update(changed).digest('hex')+'.png');await fs.writeFile(dest,'corrupted');
 await assert.rejects(publishCampaign(x.p,x.game,x.library),/Conflit/);
 assert.equal(await fs.readFile(x.content,'utf8'),before);assert.equal(await fs.readFile(dest,'utf8'),'corrupted');
 assert.equal((await fs.readdir(path.join(x.game,'content/cinematics/studio'))).length,1);
 await assert.rejects(fs.stat(path.join(x.game,'.lunaria-campaign-publish.lock')),{code:'ENOENT'});
}));
test('failed commit removes new versions while retaining the old campaign and its media',()=>fixture(async root=>{
 const x=await setup(root);await publishCampaign(x.p,x.game,x.library);
 const before=await fs.readFile(x.content,'utf8');await fs.unlink(x.content+'.bak');await fs.mkdir(x.content+'.bak');
 await fs.writeFile(path.join(x.library,'decor.png'),Buffer.concat([PIXEL_PNG,Buffer.from('changed')]));
 await assert.rejects(publishCampaign(x.p,x.game,x.library));
 assert.equal(await fs.readFile(x.content,'utf8'),before);
 assert.deepEqual(await fs.readFile(path.join(x.game,'LunariaArtLibrary/decor.png')),PIXEL_PNG);
 assert.deepEqual(await fs.readdir(path.join(x.game,'LunariaArtLibrary/studio_versions')),[]);
 assert.equal((await fs.readdir(path.join(x.game,'content/cinematics/studio'))).length,1);
 await assert.rejects(fs.stat(path.join(x.game,'.lunaria-campaign-publish.lock')),{code:'ENOENT'});
}));
test('symlinked source asset escaping library is refused',t=>fixture(async root=>{const x=await setup(root);await fs.unlink(path.join(x.library,'decor.png'));await fs.writeFile(path.join(root,'private.png'),'secret');if(!await symlinkOrSkip(t,path.join(root,'private.png'),path.join(x.library,'decor.png')))return;await assert.rejects(publishCampaign(x.p,x.game,x.library),/Ressource/);}));
test('symlinked target folder is refused even if it is internal',t=>fixture(async root=>{const x=await setup(root);await fs.mkdir(path.join(x.game,'other'));if(!await symlinkOrSkip(t,path.join(x.game,'other'),path.join(x.game,'LunariaArtLibrary'),'dir'))return;await assert.rejects(publishCampaign(x.p,x.game,x.library),/non régulière/);assert.equal(await fs.readFile(x.content,'utf8'),'{"old":true}');}));
test('publication rejects old engine and existing publication lock',()=>fixture(async root=>{const x=await setup(root);await fs.writeFile(path.join(x.game,'.lunaria-campaign-publish.lock'),'other publisher');await assert.rejects(publishCampaign(x.p,x.game,x.library),/publication/);await fs.unlink(path.join(x.game,'.lunaria-campaign-publish.lock'));await fs.unlink(path.join(x.game,'app/controllers/campaign_flow.gd'));await assert.rejects(publishCampaign(x.p,x.game,x.library),/V1.10/);}));
test('level-only campaign needs no movie folder but still publishes its presentation library',()=>fixture(async root=>{const x=await setup(root);const p=fixturePresentation(project(),'library://decor.png');const r=await publishCampaign(p,x.game,x.library);assert.equal(r.films,0);assert.equal(r.assets,1);assert.equal(r.levels,40);}));

test('two source files containing the same cinematic share a catalog entry and preserve distinct steps',()=>fixture(async root=>{const x=await setup(root);await fs.copyFile(path.join(x.movies,'intro.json'),path.join(x.movies,'copy.json'));x.p.campaign!.cinematics.push({id:'film_copy',title:'Copie',file:'copy.json',documentId:x.doc.id});x.p.campaign!.steps.push({id:'step_copy',kind:'cinematic',cinematicId:'film_copy',skippable:false});const r=await planCampaign(x.p,x.library);assert.equal(r.check.films,1);assert.equal(r.check.steps,43);assert.equal(r.project.campaign!.steps.at(-1)!.kind,'cinematic');assert.equal((r.project.campaign!.steps.at(-1) as any).cinematicId,'film_intro');assert.equal(x.p.campaign!.cinematics.length,2);assert.equal(r.check.assets,1);}));
