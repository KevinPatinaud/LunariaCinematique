import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {seedProject} from './fixtures/seed40.js';
import {seedProject as starter} from '../src/shared/game/seed.js';
import {defaultRewards} from '../src/shared/game/types.js';
import {parseGameProject,parseGameDraft} from '../src/shared/game/validation.js';
import {compileCampaign} from '../src/shared/game/campaign.js';
import {GameDocuments} from '../src/main/gameDocuments.js';

test('combo seed bonus defaults to disabled in new and existing projects',()=>{
 assert.deepEqual(starter().rewards,defaultRewards());
 const project=seedProject();delete project.rewards;
 assert.deepEqual(parseGameProject(project).rewards,defaultRewards());
 assert.deepEqual(parseGameDraft(project).rewards,defaultRewards());
 assert.equal(project.rewards,undefined);
});

test('authored combo and wave rewards survive save, reopening and campaign compilation',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'lunaria-rewards-'));
 try {
  const project=seedProject();project.rewards={combo:{enabled:true,seedsPerStep:2,maxSeeds:5}};
  project.levels[0].waves[0].seedReward=73;project.levels[0].waves[1].seedReward=0;
  project.levels[0].objective={type:'advance',target:0};project.levels[0].laneCaptureSeedReward=37;
  const documents=new GameDocuments(dir),file=path.join(dir,'rewards.game.json');
  await documents.save(project,'',file);
  const reopened=(await documents.open(file)).project;
  const published=compileCampaign(reopened);
  assert.deepEqual(JSON.parse(await readFile(file,'utf8')).rewards,project.rewards);
  assert.deepEqual(published.rewards,project.rewards);
  assert.deepEqual(published.levels[0].waves.slice(0,2).map(wave=>wave.seedReward),[73,0]);
  assert.equal(reopened.levels[0].laneCaptureSeedReward,37);
  assert.equal(published.levels[0].laneCaptureSeedReward,37);
  published.rewards!.combo.enabled=false;assert.equal(reopened.rewards!.combo.enabled,true);
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

test('combo reward amounts are bounded integers and activation is a boolean',()=>{
 for(const [key,value] of [['seedsPerStep',-1],['seedsPerStep',1.5],['maxSeeds',10001],['maxSeeds',-2],['enabled','yes']] as const) {
  const project=seedProject();Object.assign(project.rewards!.combo,{[key]:value});
  assert.throws(()=>parseGameProject(project),/projet.rewards.combo/);
 }
 const project=seedProject();project.rewards!.combo={enabled:true,seedsPerStep:0,maxSeeds:0};
 assert.deepEqual(parseGameProject(project).rewards,project.rewards);
});
