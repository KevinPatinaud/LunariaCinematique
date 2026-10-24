import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,mkdir,writeFile,readFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {seedProject} from '../src/shared/game/seed.js';
import {newLevel,cloneLevel,waveSchedule} from '../src/shared/game/types.js';
import {placedGroup,paintEnemy,convertWavePlacement} from '../src/shared/game/boardPlacement.js';
import {gameIssues,parseGameDraft,parseGameProject} from '../src/shared/game/validation.js';
import {compileCampaign} from '../src/shared/game/campaign.js';
import {GameDocuments} from '../src/main/gameDocuments.js';
import {publishCampaign} from '../src/main/campaignPublisher.js';
import {fixturePresentation,PIXEL_PNG} from './presentation-fixture.js';
const errors=(p:unknown)=>gameIssues(p).filter(i=>i.severity==='error');
function fixture(){const p=seedProject(),l=newLevel(['radish','rose','hazel'],'runner');l.objective={type:'occupied_board',target:0};l.waves[0].groups=[placedGroup('runner',2,4,4),placedGroup('plaque',2,4)];p.levels=[l];p.campaign={steps:[{id:'step_occupied',kind:'level',levelId:l.id}],cinematics:[]};return p;}
test('mixed stacked enemies survive save, reopen, duplication and campaign compilation',async()=>{
 const p=fixture(),wave=p.levels[0].waves[0];assert.deepEqual(errors(p),[]);assert.deepEqual(parseGameProject(p).levels[0].waves,[wave]);assert.deepEqual(compileCampaign(p).levels[0].waves,[wave]);assert.ok(waveSchedule(wave).every(s=>s.at===0&&s.lane===2&&s.placement?.colMin===4));
 const copy=cloneLevel(p.levels[0]);copy.waves[0].groups[0].count=2;assert.equal(wave.groups[0].count,4);assert.notEqual(copy.waves[0].groups[0].id,wave.groups[0].id);
 const root=await mkdtemp(path.join(os.tmpdir(),'occupied-board-'));try{const docs=new GameDocuments(root),saved=await docs.save(p,'',path.join(root,'level.game.json'));assert.deepEqual((await docs.open(saved.path)).project.levels[0].waves,[wave]);}finally{await rm(root,{recursive:true,force:true});}
});
test('painting edits one species without disturbing cell neighbours and enforces the 256 cap',()=>{
 const initial=[placedGroup('runner',2,6,4),placedGroup('plaque',2,6)];const added=paintEnemy(initial,'runner',2,6);assert.deepEqual(added.map(g=>g.count),[5,1]);assert.equal(initial[0].count,4);
 assert.deepEqual(paintEnemy(added,'runner',2,6,true).map(g=>g.count),[4,1]);assert.equal(paintEnemy(initial,'plaque',2,6,true).length,1);
 assert.equal(paintEnemy(initial,'runner',2,3),initial);assert.equal(paintEnemy(initial,'runner',2,4).at(-1)?.placement?.colMin,4);const full=[placedGroup('runner',0,5,256)];assert.equal(paintEnemy(full,'plaque',4,7),full);assert.equal(paintEnemy(full,'runner',0,5,true)[0].count,255);
});
test('invalid timing, random zones, allied territory, missing positions and empty publication are rejected',()=>{
 for(const mutate of [(g:any)=>delete g.placement,(g:any)=>{g.placement.colMin=3;g.placement.colMax=3;},(g:any)=>g.placement.rowMax=4,(g:any)=>g.lane=-1,(g:any)=>g.start=1,(g:any)=>g.interval=.1,(g:any)=>g.count=257]){const p=fixture();mutate(p.levels[0].waves[0].groups[0]);assert.ok(errors(p).length);}
 const p=fixture();p.levels[0].waves[0].groups=[];assert.equal(parseGameDraft(p).levels[0].waves[0].groups.length,0);assert.ok(errors(p).some(i=>i.message.includes('au moins un ennemi')));
});
test('mode conversion preserves counts and can return to ordinary timed waves',()=>{
 const wave=fixture().levels[0].waves[0];const normal=convertWavePlacement(wave,false,fixture().balance.enemies);assert.equal(normal.groups[0].placement,undefined);assert.equal(normal.groups[1].placement?.colMin,4);assert.ok(normal.groups.every(g=>g.interval>=.1));
 const placed=convertWavePlacement(normal,true,fixture().balance.enemies);assert.deepEqual(placed.groups.map(g=>g.count),[4,1]);assert.ok(placed.groups.every(g=>g.start===0&&g.interval===0&&g.placement!.colMin>=4));
 const p=fixture();p.levels[0].objective.type='defend';p.levels[0].waves=[normal];assert.deepEqual(errors(p),[]);
});

test('publication writes the exact stacked wave to Godot with its referenced assets',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'occupied-publication-'));
 try{
  const p=fixturePresentation(fixture(),'library://pixel.png'),game=path.join(root,'game'),library=path.join(root,'library');
  for(const marker of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd']){const file=path.join(game,marker);await mkdir(path.dirname(file),{recursive:true});await writeFile(file,'fixture');}
  await mkdir(path.join(game,'content/design'),{recursive:true});await mkdir(library);await writeFile(path.join(library,'pixel.png'),PIXEL_PNG);
  const result=await publishCampaign(p,game,library),published=JSON.parse(await readFile(result.path,'utf8'));
  assert.deepEqual(published.levels[0].objective,{type:'occupied_board',target:0});assert.deepEqual(published.levels[0].waves,p.levels[0].waves);
  assert.deepEqual(await readFile(path.join(game,'LunariaArtLibrary','pixel.png')),PIXEL_PNG);
 }finally{await rm(root,{recursive:true,force:true});}
});
