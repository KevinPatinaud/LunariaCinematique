import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { seedProject } from '../src/shared/game/seed.js';
import { defaultEscort, newLevel, cloneLevel } from '../src/shared/game/types.js';
import { gameIssues, parseGameProject } from '../src/shared/game/validation.js';
import { compileCampaign } from '../src/shared/game/campaign.js';
import { presentationAssets } from '../src/shared/presentation/runtime.js';
import { GameDocuments } from '../src/main/gameDocuments.js';
import { publishCampaign } from '../src/main/campaignPublisher.js';
import { PIXEL_PNG, fixturePresentation } from './presentation-fixture.js';
const errors=(value:unknown)=>gameIssues(value).filter(issue=>issue.severity==='error');
function fixture(){const p=seedProject(),level=newLevel(['radish','rose','hazel'],'runner');level.objective={type:'escort',target:0};level.escort=defaultEscort();p.levels=[level];p.campaign={steps:[{id:'step_escort',kind:'level',levelId:level.id}],cinematics:[]};return p;}

test('escort count, lanes and image survive save, reopen, duplication and publication',async()=>{
 const p=fixture(),level=p.levels[0];level.escort!.laneCounts=[2,0,1,0,3];
 assert.deepEqual(errors(p),[]);
 assert.deepEqual(parseGameProject(p).levels[0].escort,level.escort);
 assert.deepEqual(compileCampaign(p).levels[0].escort,level.escort);
 assert.ok(presentationAssets(p).includes(level.escort!.image));
 const copy=cloneLevel(level);copy.escort!.laneCounts[0]=0;assert.equal(level.escort!.laneCounts[0],2);
 const root=await mkdtemp(path.join(os.tmpdir(),'lunaria-escort-contract-'));
 try{const store=new GameDocuments(root);const saved=await store.save(p,'',path.join(root,'escort.game.json'));assert.deepEqual((await store.open(saved.path)).project.levels[0].escort,level.escort);}finally{await rm(root,{recursive:true,force:true});}
});
test('escort validates counts, ranges, mandatory settings and mode ownership',()=>{
 for(const bad of [undefined,{...defaultEscort(),laneCounts:[0,0,0,0,0]},{...defaultEscort(),laneCounts:[1,0]},{...defaultEscort(),laneCounts:[1.5,0,0,0,0]},{...defaultEscort(),laneCounts:[21,0,0,0,0]},{...defaultEscort(),speed:0},{...defaultEscort(),maxHp:0},{...defaultEscort(),departureInterval:0},{...defaultEscort(),image:'library://wrong.svg'}]){
  const p=fixture();p.levels[0].escort=bad as typeof p.levels[0]['escort'];assert.ok(errors(p).length>0);
 }
 const p=fixture();p.levels[0].objective.target=5;assert.ok(errors(p).length>0);
 p.levels[0].objective={type:'defend',target:0};assert.ok(errors(p).some(issue=>issue.message.includes('réservés')));
});

test('publisher installs the sprout image together with the authored escort settings',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'lunaria-escort-publish-'));
 try{
  const p=fixturePresentation(fixture(),'library://pixel.png'),game=path.join(root,'game'),library=path.join(root,'library');
  p.levels[0].escort!.laneCounts=[2,0,1,0,3];
  for(const marker of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd']){
   const file=path.join(game,marker);await mkdir(path.dirname(file),{recursive:true});await writeFile(file,'fixture');
  }
  await mkdir(path.join(game,'content/design'),{recursive:true});
  const relative=p.levels[0].escort!.image.slice('library://'.length),source=path.join(library,relative);
  await mkdir(path.dirname(source),{recursive:true});await writeFile(source,PIXEL_PNG);
  await writeFile(path.join(library,'pixel.png'),PIXEL_PNG);
  const result=await publishCampaign(p,game,'',library);
  const published=JSON.parse(await readFile(result.path,'utf8'));
  assert.deepEqual(published.levels[0].escort,p.levels[0].escort);
  assert.deepEqual(await readFile(path.join(game,'LunariaArtLibrary',relative)),PIXEL_PNG);
 }finally{await rm(root,{recursive:true,force:true});}
});
