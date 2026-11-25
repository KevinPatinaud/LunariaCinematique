import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {defaultHomeScreen,newHomeElement} from '../src/shared/game/homeScreen.js';
import {seedProject} from '../src/shared/game/seed.js';
import {gameIssues,parseGameProject,parseGameDraft} from '../src/shared/game/validation.js';
import {compileCampaign} from '../src/shared/game/campaign.js';
import {GAME_SCHEMA} from '../src/shared/game/schema.js';
import {presentationAssets} from '../src/shared/presentation/runtime.js';
import {planCampaign,publishCampaign} from '../src/main/campaignPublisher.js';
import {GameDocuments} from '../src/main/gameDocuments.js';
import {fixturePresentation,PIXEL_PNG} from './presentation-fixture.js';

const project=()=>({...seedProject(),homeScreen:defaultHomeScreen()});
const errors=(value:unknown)=>gameIssues(value).filter(issue=>issue.severity==='error');
test('home defaults preserve menu actions, dynamic progress and conditional unlocked heroes',()=>{
 const p=project(),home=p.homeScreen;
 assert.deepEqual(errors(p),[]);
 assert.deepEqual(home.elements.filter(e=>e.kind==='button').map(e=>e.action),['continue','map','collection','options']);
 assert.equal(home.elements.find(e=>e.id==='continue')!.text,'{continue}');
 assert.equal(home.elements.find(e=>e.id==='progress_count')!.text,'{completed} / {total}');
 assert.equal(home.elements.find(e=>e.id==='hero_hazel')!.hideIfPlantUnlocked,'baobab');
 assert.deepEqual(home.elements.find(e=>e.id==='hero_radish')!.rect,{x:624.5,y:276.5,w:365,h:365});
 const copy=defaultHomeScreen();copy.elements[0].rect.x=999;assert.equal(home.elements[0].rect.x,40);
 const legacy=seedProject();assert.deepEqual(errors(legacy),[]);assert.equal(parseGameProject(legacy).homeScreen,undefined);
});

test('home validation rejects unsafe assets, invalid actions, duplicates, missing fields and impossible geometry',()=>{
 const invalid=(edit:(p:ReturnType<typeof project>)=>void)=>{const p=project();edit(p);assert.ok(errors(p).length>0);};
 invalid(p=>{p.homeScreen.elements[0].id=p.homeScreen.elements[1].id;});
 invalid(p=>{p.homeScreen.elements[0].rect.w=-1;});
 invalid(p=>{p.homeScreen.elements[0].opacity=NaN;});
 invalid(p=>{p.homeScreen.elements[0].opacity=1.1;});
 invalid(p=>{p.homeScreen.elements[0].fill='red';});
 invalid(p=>{p.homeScreen.elements[0].rect.w=0;});
 invalid(p=>{delete p.homeScreen.elements[0].fill;});
 invalid(p=>{p.homeScreen.elements.find(e=>e.kind==='button')!.action='quit' as never;});
 invalid(p=>{p.homeScreen.elements.find(e=>e.kind==='plant')!.plantId='missing';});
 invalid(p=>{p.homeScreen.elements[0].showIfPlantUnlocked='missing';});
 invalid(p=>{p.homeScreen.background.mode='image';});
 invalid(p=>{p.homeScreen.background.image='library://../outside.png';});
 invalid(p=>{p.homeScreen.background.image='https://example.test/image.png';});
 invalid(p=>{p.homeScreen.elements.push(newHomeElement('image'));});
 invalid(p=>{p.homeScreen.elements=Array.from({length:101},()=>newHomeElement('panel'));});
 const draft=project();draft.homeScreen.elements.push(newHomeElement('image'));assert.equal(parseGameDraft(draft).homeScreen!.elements.at(-1)!.image,'');
});

test('home preserves composition order, alpha colors and labels across save, recovery and compilation',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'lunaria-home-save-'));
 try{
  const p=project();p.homeScreen.background.mode='color';p.homeScreen.background.color='#12345678';
  p.homeScreen.continueLabels.battle='Retour à ma bataille';p.homeScreen.elements.reverse();
  p.homeScreen.elements.find(e=>e.id==='title')!.text='Mon Lunaria';
  p.homeScreen.elements.find(e=>e.id==='hero_rose')!.visible=false;
  const documents=new GameDocuments(root),saved=await documents.save(p,'',path.join(root,'home.game.json'));
  assert.deepEqual((await documents.open(saved.path)).project.homeScreen,p.homeScreen);
  assert.deepEqual(parseGameDraft(p).homeScreen,p.homeScreen);
  assert.deepEqual(compileCampaign(p).homeScreen,p.homeScreen);
  assert.deepEqual(parseGameProject(p).homeScreen,p.homeScreen);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('publication keeps home labels and succeeds without media used only by the legacy composition',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'lunaria-home-publish-'));
 try{
  const library=path.join(root,'library'),game=path.join(root,'game');
  await mkdir(library);await mkdir(path.join(game,'content/design'),{recursive:true});
  await writeFile(path.join(library,'sprite.png'),PIXEL_PNG);
  await writeFile(path.join(game,'content/design/game-project.schema.json'),JSON.stringify(GAME_SCHEMA));
  await writeFile(path.join(game,'project.godot'),'config_version=5\n');
  for(const marker of ['app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd']){await mkdir(path.dirname(path.join(game,marker)),{recursive:true});await writeFile(path.join(game,marker),'extends RefCounted\n');}
  const p=fixturePresentation(project(),'library://sprite.png'),home=p.homeScreen!;
  home.background.mode='image';home.background.image='library://home.png';
  home.elements.push({...newHomeElement('image','overlay'),image:'library://overlay.png',visible:false});
  home.elements.push({...newHomeElement('image','duplicate'),image:'library://home.png'});
  home.elements.find(e=>e.id==='title')!.text='library://this-is-a-label.png';
  home.continueLabels.battle='Retour à ma bataille';
  const authored=structuredClone(home);
  assert.deepEqual(presentationAssets(p).filter(ref=>ref!=='library://sprite.png').sort(),['library://home.png','library://overlay.png']);
  const plan=await planCampaign(p,library,game);
  assert.equal(plan.check.assets,1);
  assert.deepEqual(plan.project.homeScreen,{
   background:defaultHomeScreen().background,
   continueLabels:authored.continueLabels,
   elements:[],
  });
  const published=await publishCampaign(p,game,library);
  assert.deepEqual(JSON.parse(await readFile(published.path,'utf8')).homeScreen,plan.project.homeScreen);
  assert.deepEqual(await readdir(path.join(game,'LunariaArtLibrary')),['sprite.png']);
  assert.deepEqual(p.homeScreen,authored);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('home reports inaccessible main navigation without silently restoring deleted controls',()=>{
 const p=project();p.homeScreen.elements=[];
 assert.deepEqual(errors(p),[]);
 assert.equal(gameIssues(p).filter(issue=>issue.path==='homeScreen.elements').length,2);
 assert.deepEqual(parseGameProject(p).homeScreen!.elements,[]);
});
