import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {seedProject} from './fixtures/seed40.js';
import {seedProject as starter} from '../src/shared/game/seed.js';
import {parseGameProject,parseGameDraft} from '../src/shared/game/validation.js';
import {compileCampaign} from '../src/shared/game/campaign.js';
import {GameDocuments} from '../src/main/gameDocuments.js';

test('new projects have no combo seed bonus configuration',()=>{
 assert.equal(Object.hasOwn(starter(),'rewards'),false);
 assert.equal(Object.hasOwn(parseGameProject(seedProject()),'rewards'),false);
});

test('authored wave and capture rewards survive save, reopening and campaign compilation',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'lunaria-rewards-'));
 try {
  const project=seedProject();
  project.levels[0].waves[0].seedReward=73;project.levels[0].waves[1].seedReward=0;
  project.levels[0].objective={type:'advance',target:0};project.levels[0].laneCaptureSeedReward=37;
  const documents=new GameDocuments(dir),file=path.join(dir,'rewards.game.json');
  await documents.save(project,'',file);
  const reopened=(await documents.open(file)).project;
  const published=compileCampaign(reopened);
  assert.deepEqual(published.levels[0].waves.slice(0,2).map(wave=>wave.seedReward),[73,0]);
  assert.equal(reopened.levels[0].laneCaptureSeedReward,37);
  assert.equal(published.levels[0].laneCaptureSeedReward,37);
 } finally {await rm(dir,{recursive:true,force:true});}
});

test('lane capture seed reward is an optional bounded integer',()=>{
 const project=seedProject();project.levels[0].objective={type:'advance',target:0};
 assert.equal(parseGameProject(project).levels[0].laneCaptureSeedReward,undefined);
 for(const value of [-1,1.5,10001]) {
  project.levels[0].laneCaptureSeedReward=value;
  assert.throws(()=>parseGameProject(project),/laneCaptureSeedReward/);
 }
 project.levels[0].laneCaptureSeedReward=0;
 assert.equal(parseGameProject(project).levels[0].laneCaptureSeedReward,0);
});

test('retired combo reward configuration is rejected',()=>{
 const project=seedProject() as any;
 project.rewards={combo:{enabled:true,seedsPerStep:2,maxSeeds:5}};
 assert.throws(()=>parseGameProject(project),/rewards/);
 assert.throws(()=>parseGameDraft(project),/structure/);
});
