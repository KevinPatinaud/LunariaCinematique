import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { newActor, newBubble, newCinematic, type Asset } from '../src/shared/model.js';
import { actorWithPose } from '../src/shared/poseGeneration.js';
import { publishCampaign } from '../src/main/campaignPublisher.js';
import { parseCinematic } from '../src/shared/schema.js';
import { seedProject } from './fixtures/seed40.js';
import { fixturePresentation, PIXEL_PNG } from './presentation-fixture.js';

test('a generated static pose and its dialogue are published with ordinary cinematic media', async () => {
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-pose-publication-'));
  try {
    const library = path.join(folder,'library'), game = path.join(folder,'game');
    for (const dir of ['app/controllers','domain/presentation','domain/logic','content/design']) await fs.mkdir(path.join(game,dir), { recursive: true });
    for (const file of ['app/controllers/campaign_flow.gd','domain/presentation/animation_registry.gd','domain/logic/event_runtime.gd']) await fs.writeFile(path.join(game,file), 'extends RefCounted');
    await fs.writeFile(path.join(game,'project.godot'),'[application]');
    const ref = 'library://02_characters/radis/stage_01/poses/generated/pose-test.png';
    await fs.mkdir(path.join(library,path.dirname(ref.slice(10))), { recursive: true });
    await fs.writeFile(path.join(library,ref.slice(10)),PIXEL_PNG); await fs.writeFile(path.join(library,'base.png'),PIXEL_PNG);
    const image: Asset = { ref: 'library://base.png', name: 'Radis', path: 'base.png', folder: '', kind: 'character', bytes: 1, modified: 0, url: '', thumbnail: '' };
    const film = newCinematic(), actor = newActor(image,1);
    actor.animation = { mode: 'species', speciesId: 'radis', animationId: 'idle', slot: 'idle', speed: 1 };
    film.shots[0].actors = [actorWithPose(actor,ref,{width:100,height:120})];
    const bubble = newBubble(actor.id); bubble.text = 'Je pleure.'; film.shots[0].bubbles = [bubble];
    const project = fixturePresentation(seedProject(),'library://base.png'); project.cinematics = [film];
    project.campaign = { cinematics: [{ id:'pose-film', title:film.title, file:'pose.json', documentId:film.id }], steps:[{ id:'pose-step',kind:'cinematic',cinematicId:'pose-film',skippable:true }, { id:'level-step',kind:'level',levelId:project.levels[0].id }] };
    const published = await publishCampaign(project,game,library);
    assert.ok(published.assets >= 2);
    assert.deepEqual(await fs.readFile(path.join(game,'LunariaArtLibrary',ref.slice(10))),PIXEL_PNG);
    const files = await fs.readdir(path.join(game,'content/cinematics/studio'));
    const document = parseCinematic(JSON.parse(await fs.readFile(path.join(game,'content/cinematics/studio',files.find(file => file.endsWith('.json'))!), 'utf8')));
    assert.equal(document.shots[0].actors[0].asset,ref);
    assert.equal(Object.hasOwn(document.shots[0].actors[0], 'animation'), false);
    assert.equal(document.shots[0].bubbles[0].speakerId,actor.id);
    assert.equal(actor.asset, 'library://base.png'); assert.ok(actor.animation);
  } finally { await fs.rm(folder,{recursive:true,force:true}); }
});
