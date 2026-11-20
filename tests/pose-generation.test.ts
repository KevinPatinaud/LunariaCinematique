import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { newActor, newCinematic, type Asset, type AssetRef } from '../src/shared/model.js';
import { actorAnchor } from '../src/shared/motion.js';
import { actorPoseSignature, actorWithPose, characterFolder, poseGenerationPrompt, poseOutputRef, poseReference, poseTaskDestination, type PoseGenerationRequest } from '../src/shared/poseGeneration.js';
import { PoseGenerations, type PoseGenerator } from '../src/main/poseGenerations.js';
import { validatePosePixels } from '../src/main/poseImages.js';
import { ImageTaskQueue } from '../src/main/imageJobs.js';
import { codexImageArguments } from '../src/main/codexImageCorrection.js';
import { seedProject } from './fixtures/seed40.js';
import { imageTaskProjectLabel } from '../src/shared/imageTasks.js';

const asset = (ref: string): Asset => ({ ref: ref as AssetRef, path: ref.slice(10), folder: '', name: 'Radis', kind: 'character', bytes: 10, modified: 0, url: '', thumbnail: '' });
const master = 'library://02_characters/radis/stage_01/radis_stage_01_master_v01.png' as AssetRef;
const current = 'library://02_characters/radis/stage_01/poses/old.png' as AssetRef;
const request: PoseGenerationRequest = { ref: master, currentRef: current, characterName: 'Radis', instructions: 'Radis pleure, tête baissée.' };

test('Master resolution respects species, stage and canonical root instead of free actor names', () => {
  const stage2 = 'library://02_characters/radis/stage_02/radis_stage_02_master_v01.png';
  const actor = newActor(asset('library://02_characters/radis/stage_02/poses/sad.png'), 1);
  actor.name = 'Rose renommée';
  assert.equal(poseReference(actor, [asset(master), asset(stage2)]).ref, stage2);
  const rose = newActor(asset('library://02_characters/Rose/stage_01/poses/happy.png'), 1);
  const roseMaster = 'library://02_characters/Rose/stage_01/master.png';
  assert.equal(poseReference(rose, [asset(roseMaster), asset('library://02_characters/Rose/stage_01/poses/master.png')]).ref, roseMaster);
  assert.equal(poseReference(newActor(asset('library://02_characters/lierre/poses/sad.png'), 1), [asset('library://02_characters/lierre/Master.png')]).ref, 'library://02_characters/lierre/Master.png');
  assert.equal(poseReference(actor, [asset(stage2), asset(stage2.replace('v01','v02'))]).ref, undefined);
  assert.equal(poseReference(newActor(asset('library://unknown.png'), 1), [asset(master)]).ref, undefined);
  assert.equal(characterFolder(master), 'library://02_characters/radis/stage_01/');
  assert.equal(poseReference(newActor(asset('library://02_characters/physalis/stage_01/pose.png'), 1), [asset('library://02_characters/physalis/stage_01/variant/master.png')]).ref, undefined);
});

test('fixed poses keep the actor, dialogue links, scene effects, proportions and rotated foot anchor', () => {
  for (const rotation of [0, 35, -80]) for (const pivot of ['center','bottom','top'] as const) for (const flipX of [false,true]) {
    const actor = { ...newActor(asset(current), 1), rotation, pivot, flipX, motion: { preset: 'float' as const, intensity: .2, period: 2, delay: 0, loop: true, reverse: false }, animation: { mode: 'species' as const, speciesId: 'radis', animationId: 'idle', slot: 'idle', speed: 1 } };
    const before = actorAnchor(actor, 0, false, .5, 1);
    const next = actorWithPose(actor, 'library://pose.png', { width: 800, height: 1200 });
    const after = actorAnchor(next, 0, false, .5, 1);
    assert.ok(Math.abs(before.x - after.x) < .0001 && Math.abs(before.y - after.y) < .0001);
    assert.equal(next.id, actor.id); assert.equal(next.entry, actor.entry); assert.equal(next.motion, actor.motion);
    assert.equal(Object.hasOwn(next, 'animation'), false); assert.ok(Object.hasOwn(actor, 'animation'));
    assert.ok(Math.abs(next.width * 1600 / (next.height * 900) - 800 / 1200) < .0001);
  }
});

test('destination uses saved origin identity, not current selection, and catches changed sprite/animation/project', () => {
  const project = seedProject(), film = newCinematic(), actor = newActor(asset(current), 1);
  film.shots[0].actors = [actor]; project.cinematics = [film];
  const r = { ...request, context: { projectId: project.id, projectPath: '/project', documentId: film.id, shotId: film.shots[0].id, actorId: actor.id, actorRef: actor.asset, actorSignature: actorPoseSignature(actor), title: 'Radis pleure' } };
  assert.equal(poseTaskDestination(r, undefined, project, '/project').target?.actor.id, actor.id);
  assert.equal(poseTaskDestination(r, undefined, project, '/other').target, undefined);
  actor.asset = 'library://other.png';
  assert.equal(poseTaskDestination(r, undefined, project, '/project').target, undefined);
  const task = { kind: 'pose' as const, libraryRoot: '/library', request: r, job: { id: 'pose', status: 'applied' as const, sourceRef: master, sourceUrl: '', message: '', poseRef: actor.asset } };
  assert.equal(imageTaskProjectLabel(task, project, '/project', '/library'), 'Affectée');
  assert.equal(imageTaskProjectLabel(task, project, '/project', '/elsewhere'), 'À affecter');
  actor.asset = current; actor.animation = { mode: 'species', speciesId: 'radis', animationId: 'idle', slot: 'idle', speed: 1 };
  assert.equal(poseTaskDestination(r, undefined, project, '/project').target, undefined);
});

test('pixel validation refuses opaque, empty and malformed images, accepts real transparency', () => {
  const pixels = Buffer.alloc(40 * 40 * 4, 255);
  assert.throws(() => validatePosePixels(pixels, { width: 40, height: 40 }), /transparent/);
  assert.throws(() => validatePosePixels(Buffer.alloc(pixels.length), { width: 40, height: 40 }), /entièrement/);
  assert.throws(() => validatePosePixels(pixels, { width: 50, height: 40 }), /illisible/);
  for (let i = 3; i < pixels.length / 3; i += 4) pixels[i] = 0;
  validatePosePixels(pixels, { width: 40, height: 40 });
});

test('Codex receives ordered references and an identity-focused transparent pose prompt', () => {
  const args = codexImageArguments('/job', ['/job/master.png','/job/current.png'], 'test-model');
  assert.deepEqual(args.flatMap((value, i) => value === '-i' ? [args[i+1]] : []), ['/job/master.png','/job/current.png']);
  assert.ok(args.includes('test-model'));
  const prompt = poseGenerationPrompt(request, true);
  for (const pattern of [/IMAGE 1/, /IMAGE 2/, /TRANSPARENT/, /Radis pleure/, /view_image/, /aucun fichier de bibliothèque/i]) assert.match(prompt, pattern);
});

async function fixture(run: (c: { base: string; library: string; create: (generate?: PoseGenerator, queue?: ImageTaskQueue) => PoseGenerations }) => Promise<void>) {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-pose-')), library = path.join(base, 'library');
  for (const [ref, bytes] of [[master,'master'],[current,'current']]) {
    const file = path.join(library, ref.slice(10)); await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, bytes);
  }
  const services: PoseGenerations[] = [];
  const create = (generate: PoseGenerator = async task => { const output = path.join(task.folder, 'generated.png'); await fs.writeFile(output, 'pose'); return output; }, queue?: ImageTaskQueue) => {
    const service = new PoseGenerations({ jobsRoot: path.join(base, 'jobs'), generatedRoot: path.join(base, 'native'), queue, generate,
      inspect: () => ({ width: 100, height: 120 }), png: bytes => bytes,
      finalize: bytes => { if (bytes.toString() === 'opaque') throw Error('Fond non transparent.'); return bytes; } });
    services.push(service); return service;
  };
  try { await run({ base, library, create }); }
  finally { await Promise.all(services.map(service => service.close())); await fs.rm(base, { recursive: true, force: true }); }
}
async function finished(service: PoseGenerations, id: string) {
  for (let i = 0; i < 200; i++) { const job = service.get(id); if (!['queued','generating'].includes(job.status)) { await service.flush(); return job; } await new Promise(resolve => setTimeout(resolve, 10)); }
  throw Error('Pose did not finish');
}

test('pose stages both sources, imports only on validation, preserves Master and writes provenance', () => fixture(async ({ library, create }) => {
  let received: PoseGenerationRequest | undefined;
  const service = create(async task => {
    received = task.request; assert.equal(task.inputPath.length, 2);
    assert.equal(await fs.readFile(task.inputPath[0], 'utf8'), 'master'); assert.equal(await fs.readFile(task.inputPath[1], 'utf8'), 'current');
    const output = path.join(task.folder, 'output.png'); await fs.writeFile(output, 'pose'); return output;
  });
  const job = await service.start(library, { ...request, codexModel: ' test-model ' });
  assert.equal((await finished(service, job.id)).status, 'ready'); assert.equal(received?.codexModel, 'test-model');
  const ref = poseOutputRef(request, job.id), output = path.join(library, ref.slice(10));
  await assert.rejects(fs.stat(output));
  const applied = await service.apply(library, job.id);
  assert.equal(applied.poseRef, ref); assert.equal(await fs.readFile(output, 'utf8'), 'pose');
  assert.equal(await fs.readFile(path.join(library, master.slice(10)), 'utf8'), 'master');
  assert.equal(JSON.parse(await fs.readFile(output + '.json', 'utf8')).instructions, request.instructions);
  assert.deepEqual(await service.apply(library, job.id), applied);
  await service.remove(job.id); assert.equal(await fs.readFile(output, 'utf8'), 'pose');
}));

test('pose rejects missing prompts, traversal and injected model before starting', () => fixture(async ({ library, create }) => {
  const service = create();
  for (const input of [{ ...request, instructions: ' ' }, { ...request, ref: 'library://../escape.png' }, { ...request, currentRef: 'C:/outside.png' }, { ...request, codexModel: '--bad model' }]) await assert.rejects(service.start(library, input));
  assert.equal((await service.list()).length, 0);
}));

test('source copies, opaque proposals and outside paths fail without import', () => fixture(async ({ base, library, create }) => {
  for (const kind of ['copy','outside','opaque']) {
    const service = create(async task => { const file = path.join(kind === 'outside' ? base : task.folder, 'result.png'); await fs.writeFile(file, kind === 'copy' ? 'master' : kind); return file; });
    const job = await service.start(library, request);
    assert.equal((await finished(service, job.id)).status, 'failed');
    await assert.rejects(service.apply(library, job.id), /pas prête/); await service.close();
  }
}));

test('source changes and candidate tampering block import', () => fixture(async ({ base, library, create }) => {
  const service = create(), first = await service.start(library, request);
  await finished(service, first.id);
  await fs.writeFile(path.join(base, 'jobs', first.id, 'pose.png'), 'tampered');
  await assert.rejects(service.apply(library, first.id), /proposition a changé/);
  const next = await service.start(library, request); await finished(service, next.id);
  await fs.writeFile(path.join(library, master.slice(10)), 'changed');
  await assert.rejects(service.apply(library, next.id), /référence a changé/);
}));

test('cancelled provider cannot revive a pose and the common queue waits for its exit', () => fixture(async ({ library, create }) => {
  let release!: () => void, entered!: () => void, second = false;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const gate = new Promise<void>(resolve => { release = resolve; });
  const queue = new ImageTaskQueue(), service = create(async task => {
    entered(); await gate;
    const file = path.join(task.folder, 'late.png'); await fs.writeFile(file, 'pose'); return file;
  }, queue);
  const first = await service.start(library, request); await started;
  const another = create(async task => { second = true; const file = path.join(task.folder, 'second.png'); await fs.writeFile(file, 'pose'); return file; }, queue);
  const next = await another.start(library, request);
  service.cancel(first.id); assert.equal(second, false); release();
  assert.equal((await finished(another, next.id)).status, 'ready'); assert.equal(service.get(first.id).status, 'cancelled');
}));

test('ready/imported poses recover after restart, corrupt manifests do not break history', () => fixture(async ({ base, library, create }) => {
  const service = create(), job = await service.start(library, request); await finished(service, job.id); await service.close();
  const corrupt = path.join(base, 'jobs', '11111111-1111-1111-1111-111111111111');
  await fs.mkdir(corrupt); await fs.writeFile(path.join(corrupt,'job.json'), '{invalid');
  const recovered = create(); await recovered.ready; assert.equal(recovered.get(job.id).status, 'ready');
  assert.equal((await recovered.list()).length, 1);
  await recovered.apply(library, job.id); await recovered.close();
  const imported = create(); await imported.ready; assert.equal(imported.get(job.id).status, 'applied');
  assert.ok(imported.get(job.id).poseRef);
  await assert.rejects(imported.apply(base, job.id), /bibliothèque/);
}));

test('closing an active pose persists interruption and restart waits for an explicit retry', () => fixture(async ({ library, create }) => {
  let entered!: () => void; const started = new Promise<void>(resolve => { entered = resolve; });
  const service = create(async task => {
    entered();
    await new Promise<void>((resolve, reject) => task.signal.addEventListener('abort', () => reject(Error('Stopped')), { once: true }));
    throw Error('Unreachable');
  });
  const job = await service.start(library, request); await started; await service.close();
  let calls = 0;
  const next = create(async task => { calls++; const file = path.join(task.folder,'new.png'); await fs.writeFile(file,'pose'); return file; });
  await next.ready; assert.equal(next.get(job.id).status, 'interrupted'); assert.equal(calls, 0);
  const retried = await next.retry(library,job.id); assert.equal((await finished(next,retried.id)).status,'ready'); assert.equal(calls,1);
}));

test('an import completed before the history write is recovered without regenerating', () => fixture(async ({ base, library, create }) => {
  const first = create(), job = await first.start(library,request); await finished(first,job.id);
  const imported = await first.apply(library,job.id); await first.close();
  const manifest = path.join(base,'jobs',job.id,'job.json'), data = JSON.parse(await fs.readFile(manifest,'utf8'));
  data.job.status='applying'; delete data.job.poseRef; await fs.writeFile(manifest,JSON.stringify(data));
  let generated=false; const recovered=create(async()=>{generated=true;throw Error('Unexpected generation');});
  await recovered.ready; assert.equal(recovered.get(job.id).status,'applied'); assert.equal(recovered.get(job.id).poseRef,imported.poseRef); assert.equal(generated,false);
}));

test('a linked output folder cannot redirect a pose import outside the library', t => fixture(async ({ base, library, create }) => {
  const outside=path.join(base,'outside'); await fs.mkdir(outside);
  const generated=path.join(library,'02_characters/radis/stage_01/poses/generated');
  try { await fs.symlink(outside,generated,process.platform==='win32'?'junction':'dir'); }
  catch(error) { if (['EPERM','EACCES'].includes((error as NodeJS.ErrnoException).code??'')) { t.skip('Symlink unavailable');return; } throw error; }
  const service=create(),job=await service.start(library,request); await finished(service,job.id);
  await assert.rejects(service.apply(library,job.id),/sort de la bibliothèque/);
  assert.deepEqual(await fs.readdir(outside),[]);
}));

