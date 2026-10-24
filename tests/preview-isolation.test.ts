import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {prepareLevelPreview} from '../src/main/gamePreview.js';
import {seedProject} from '../src/shared/game/seed.js';
import {fixturePresentation,PIXEL_PNG} from './presentation-fixture.js';

test('level preview publishes a disposable runtime and preserves the selected game on success and failure',async()=>{
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'lunaria-preview-isolation-'));
 try{
  const game=path.join(temp,'game'),library=path.join(temp,'library'),previews=path.join(temp,'previews');
  for(const file of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd','content/design/game_content.json','LunariaArtLibrary/pixel.png','.godot/imported/cache.bin']){
   await fs.mkdir(path.dirname(path.join(game,file)),{recursive:true});await fs.writeFile(path.join(game,file),'SENTINEL');
  }
  await fs.mkdir(library);await fs.writeFile(path.join(library,'pixel.png'),PIXEL_PNG);
  const project=fixturePresentation(seedProject(),'library://pixel.png');
  const before=structuredClone(project),preview=await prepareLevelPreview(project,game,library,previews);
  assert.notEqual(preview.gameRoot,game);
  const published=JSON.parse(await fs.readFile(preview.path,'utf8'));
  assert.equal(published.title,project.title);
  assert.match(published.balance.plants[0].visual.sprite.asset,/studio_versions\//);
  assert.equal(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'),'SENTINEL');
  assert.equal(await fs.readFile(path.join(game,'LunariaArtLibrary/pixel.png'),'utf8'),'SENTINEL');
  await fs.writeFile(path.join(preview.gameRoot,'.godot/imported/cache.bin'),'CHANGED');
  assert.equal(await fs.readFile(path.join(game,'.godot/imported/cache.bin'),'utf8'),'SENTINEL');
  assert.deepEqual(project,before);
  await preview.dispose();assert.deepEqual(await fs.readdir(previews),[]);
  await fs.unlink(path.join(library,'pixel.png'));
  await assert.rejects(prepareLevelPreview(project,game,library,previews),/Ressource introuvable/);
  assert.deepEqual(await fs.readdir(previews),[]);
  assert.equal(await fs.readFile(path.join(game,'content/design/game_content.json'),'utf8'),'SENTINEL');
  await assert.rejects(prepareLevelPreview(project,game,library,path.join(game,'nested')),/hors du projet/);
 }finally{await fs.rm(temp,{recursive:true,force:true});}
});
