import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { newCinematic, newShot } from '../src/shared/model.js';
import { seedProject } from './fixtures/seed40.js';
import { precedingTerrainReferences, terrainGenerationPrompt, type TerrainGenerationRequest } from '../src/shared/terrainGeneration.js';
import { TerrainGenerations, type TerrainGenerator } from '../src/main/terrainGenerations.js';

test('terrain references follow campaign order and the last decorated shot, excluding archived films', () => {
  const project = seedProject(), first = newCinematic(), previous = newCinematic(), archived = newCinematic();
  first.id = 'first'; previous.id = 'previous'; archived.id = 'archived';
  first.shots[0].background.asset = 'library://first.png';
  previous.shots[0].background.asset = 'library://morning.png';
  previous.shots.push(newShot('library://evening.png'), newShot(null));
  project.cinematics = [archived, previous, first];
  project.campaign = { cinematics: [first, previous].map(doc => ({ id: doc.id, title: doc.title, documentId: doc.id, file: doc.id + '.json' })), steps: [
    { id: 'a', kind: 'cinematic', cinematicId: first.id, skippable: true },
    { id: 'b', kind: 'cinematic', cinematicId: previous.id, skippable: true },
    { id: 'c', kind: 'level', levelId: project.levels[0].id },
  ] };
  const references = precedingTerrainReferences(project, project.levels[0].id).references;
  assert.deepEqual(references.map(item => item.ref), ['library://morning.png', 'library://evening.png']);
  assert.equal(references.at(-1)?.shotId, previous.shots[1].id);
  project.campaign.steps.reverse();
  assert.deepEqual(precedingTerrainReferences(project, project.levels[0].id).references, []);
  assert.deepEqual(precedingTerrainReferences(project, 'unplaced').references, []);
});
test('a preceding empty or unintegrated film does not borrow an older unrelated decor', () => {
  const project = seedProject(), first = newCinematic(), empty = newCinematic();
  first.id = 'first'; empty.id = 'empty';
  first.shots[0].background.asset = 'library://first.png'; empty.shots[0].background.asset = null;
  project.cinematics = [first, empty];
  project.campaign = { cinematics: [first, empty].map(doc => ({ id: doc.id, title: doc.title, documentId: doc.id, file: doc.id + '.json' })), steps: [
    { id: 'a', kind: 'cinematic', cinematicId: first.id, skippable: true }, { id: 'b', kind: 'cinematic', cinematicId: empty.id, skippable: true }, { id: 'c', kind: 'level', levelId: project.levels[0].id },
  ] };
  assert.deepEqual(precedingTerrainReferences(project, project.levels[0].id).references, []);
  project.cinematics.pop();
  assert.deepEqual(precedingTerrainReferences(project, project.levels[0].id).references, []);
});
const request: TerrainGenerationRequest = { ref: 'library://source.webp', levelTitle: 'La serre', instructions: 'Garder les dalles.', codexModel: 'test-model' };
test('terrain prompt requests a new playable image with the supplied author context', () => {
  const prompt = terrainGenerationPrompt(request);
  assert.match(prompt, /5 allées horizontales et 8 colonnes/); assert.match(prompt, /16:9/);
  assert.match(prompt, /Aucun personnage/); assert.match(prompt, /Garder les dalles/); assert.match(prompt, /image_gen/);
  assert.match(prompt,/1672 × 941/);assert.match(prompt,/moins de 1 %/);
});
async function fixture(run: (context: { base: string; library: string; source: string; create: (generate?: TerrainGenerator) => TerrainGenerations }) => Promise<void>) {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-terrain-')), library = path.join(base, 'library'), source = path.join(library, 'source.webp');
  await fs.mkdir(library); await fs.writeFile(source, 'original');
  const services: TerrainGenerations[] = [];
  const create = (generate: TerrainGenerator = async task => { const output = path.join(task.folder, 'generated.png'); await fs.writeFile(output, task.state === 'polluted' ? 'terrain' : 'restored'); return output; }) => { const service = new TerrainGenerations({
    jobsRoot: path.join(base, 'jobs'), generatedRoot: path.join(base, 'codex-images'), generate,
    inspect: bytes => bytes.toString() === 'square' ? { width: 900, height: 900 } : { width: 1600, height: 900 }, png: bytes => bytes, finalize: bytes => bytes,
  }); services.push(service); return service; };
  try { await run({ base, library, source, create }); } finally { await Promise.all(services.map(service => service.close())); await fs.rm(base, { recursive: true, force: true }); }
}
async function finished(service: TerrainGenerations, id: string) {
  for (let count = 0; count < 200; count++) { const job = service.get(id); if (!['queued', 'generating'].includes(job.status)) { await service.flush(); return job; } await new Promise(resolve => setTimeout(resolve, 10)); }
  throw new Error('Job did not finish.');
}
test('generation stages its own source, forwards model and imports a distinct terrain only on apply', () => fixture(async ({ library, source, create }) => {
  let received: TerrainGenerationRequest | undefined;
  const service = create(async task => { received = task.request; assert.equal(await fs.readFile(task.inputPath, 'utf8'), task.state === 'polluted' ? 'original' : 'terrain'); const result = path.join(task.folder, 'output.png'); await fs.writeFile(result, task.state === 'polluted' ? 'terrain' : 'restored'); return result; });
  const start = await service.start(library, { ...request, codexModel: '  test-model  ',codexReasoningEffort:'xhigh' });
  assert.equal((await finished(service, start.id)).status, 'ready'); assert.equal(received?.codexModel, 'test-model');
  assert.equal(received?.codexReasoningEffort,'xhigh');assert.equal(service.get(start.id).codexReasoningEffort,'xhigh');
  assert.deepEqual(await fs.readdir(library), ['source.webp']);
  const applied = await service.apply(library, start.id);
  assert.match(applied.terrainRef!, /^library:\/\/studio_generated\/terrains\/terrain-.*\.png$/);
  assert.equal(await fs.readFile(source, 'utf8'), 'original');
  assert.equal(await fs.readFile(path.join(library, applied.terrainRef!.slice(10)), 'utf8'), 'terrain');
  assert.deepEqual(await service.apply(library, start.id), applied);
}));
test('bad model and traversal requests fail before calling the generator', () => fixture(async ({ library, create }) => {
  let called = false; const service = create(async () => { called = true; throw Error('unexpected'); });
  await assert.rejects(service.start(library, { ...request, codexModel: '--model injected' }), /identifiant/);
  await assert.rejects(service.start(library,{...request,codexReasoningEffort:'xhigh --other'}),/raisonnement/);
  await assert.rejects(service.start(library, { ...request, ref: 'library://../outside.png' }), /invalide/);
  await assert.rejects(service.start(library, { ...request, instructions: 'x'.repeat(5001) }), /invalides/);
  assert.equal(called, false);
}));
test('source copies, outside paths and wrong aspect ratios cannot become terrain proposals', () => fixture(async ({ base, library, create }) => {
  for (const kind of ['source', 'copy', 'outside', 'square']) {
    const service = create(async task => {
      if (kind === 'source') return task.inputPath;
      const output = path.join(kind === 'outside' ? base : task.folder, 'result.png');
      await fs.writeFile(output, kind === 'copy' ? 'original' : kind === 'square' ? 'square' : 'terrain'); return output;
    });
    const start = await service.start(library, request);
    assert.equal((await finished(service, start.id)).status, 'failed', kind);
    await assert.rejects(service.apply(library, start.id), /pas prêt/);
  }
}));
test('cancellation wins against a late generator completion', () => fixture(async ({ library, create }) => {
  let release!: () => void; let done!: () => void;
  const completed = new Promise<void>(resolve => { done = resolve; });
  const service = create(async task => { await new Promise<void>(resolve => { release = resolve; }); const output = path.join(task.folder, 'output.png'); await fs.writeFile(output, task.state === 'polluted' ? 'terrain' : 'restored'); done(); return output; });
  const start = await service.start(library, request);
  for (let i = 0; i < 100 && !release; i++) await new Promise(resolve => setTimeout(resolve, 5));
  service.cancel(start.id); release(); await completed; await service.flush();
  assert.equal(service.get(start.id).status, 'cancelled');
  await assert.rejects(service.apply(library, start.id), /pas prêt/); assert.deepEqual(await fs.readdir(library), ['source.webp']);
}));
test('apply refuses a switched library and simultaneous apply cannot create two files', () => fixture(async ({ base, library, create }) => {
  const other = path.join(base, 'other'); await fs.mkdir(other);
  const service = create(), start = await service.start(library, request); await finished(service, start.id);
  await assert.rejects(service.apply(other, start.id), /bibliothèque a changé/);
  const results = await Promise.allSettled([service.apply(library, start.id), service.apply(library, start.id)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal((await fs.readdir(path.join(library, 'studio_generated/terrains'))).length, 2);
}));

test('the cleaned state edits the generated polluted image and both outputs are required',()=>fixture(async({library,create})=>{
 const calls:string[]=[];
 const service=create(async task=>{
  calls.push(task.state);
  assert.equal(await fs.readFile(task.inputPath,'utf8'),task.state==='polluted'?'original':'polluted ground');
  const file=path.join(task.folder,'result.png');await fs.writeFile(file,task.state==='polluted'?'polluted ground':'clean ground');return file;
 });
 const job=await service.start(library,request);const ready=await finished(service,job.id);
 assert.deepEqual(calls,['polluted','restored']);assert.ok(ready.candidateUrl&&ready.restoredCandidateUrl);
 assert.equal((await service.image(job.id,'candidate')).bytes.toString(),'polluted ground');
 assert.equal((await service.image(job.id,'restored')).bytes.toString(),'clean ground');
 const applied=await service.apply(library,job.id);
 assert.notEqual(applied.terrainRef,applied.restoredTerrainRef);
 assert.equal(await fs.readFile(path.join(library,applied.restoredTerrainRef!.slice(10)),'utf8'),'clean ground');
}));

test('missing, copied or differently framed cleaned states never expose an applicable pair',()=>fixture(async({library,create})=>{
 for(const issue of ['failed','same','square']){
  const service=create(async task=>{
   if(task.state==='restored'&&issue==='failed')throw Error('Nettoyage indisponible');
   const file=path.join(task.folder,'result.png');
   await fs.writeFile(file,task.state==='polluted'||issue==='same'?'polluted':issue==='square'?'square':'restored');return file;
  });
  const job=await service.start(library,request),done=await finished(service,job.id);
  assert.equal(done.status,'failed');assert.equal(done.candidateUrl,undefined);assert.equal(done.restoredCandidateUrl,undefined);
  await assert.rejects(service.apply(library,job.id),/pas prêt/);
 }
 assert.deepEqual(await fs.readdir(library),['source.webp']);
}));

test('a conflict on the cleaned file rolls back the newly imported polluted file',()=>fixture(async({library,create})=>{
 const service=create(),job=await service.start(library,request);await finished(service,job.id);
 const folder=path.join(library,'studio_generated/terrains');await fs.mkdir(folder,{recursive:true});
 const clean=`terrain-${job.id}-nettoye.png`;await fs.writeFile(path.join(folder,clean),'existing author image');
 await assert.rejects(service.apply(library,job.id));
 assert.deepEqual(await fs.readdir(folder),[clean]);assert.equal(await fs.readFile(path.join(folder,clean),'utf8'),'existing author image');
 assert.equal(service.get(job.id).status,'ready');
}));

test('restoration prompt preserves geometry and forbids a combined sheet',()=>{
 const prompt=terrainGenerationPrompt(request,'restored');assert.match(prompt,/cible exacte/);assert.match(prompt,/conserve exactement le cadrage/);assert.match(prompt,/second fichier image distinct/);assert.match(prompt,/pas une simple référence/);
});

test('cancelling the cleaning step prevents a late complete pair from becoming ready',()=>fixture(async({library,create})=>{
 let release!:()=>void;
 const service=create(async task=>{
  if(task.state==='restored')await new Promise<void>(resolve=>{release=resolve;});
  const file=path.join(task.folder,'result.png');await fs.writeFile(file,task.state);return file;
 });
 const job=await service.start(library,request);
 for(let i=0;i<200&&!release;i++)await new Promise(resolve=>setTimeout(resolve,5));
 assert.ok(release);service.cancel(job.id);release();await service.close();
 assert.equal(service.get(job.id).status,'cancelled');assert.equal(service.get(job.id).restoredCandidateUrl,undefined);
 await assert.rejects(service.apply(library,job.id),/pas prêt/);assert.deepEqual(await fs.readdir(library),['source.webp']);
}));
