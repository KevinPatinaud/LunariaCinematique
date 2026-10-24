import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { BackgroundCorrections } from '../src/main/backgroundCorrections.js';
import type { ImageGenerator } from '../src/main/codexImageCorrection.js';
import { codexImageArguments } from '../src/main/codexImageCorrection.js';
import type { BackgroundCorrectionRequest } from '../src/shared/backgroundCorrection.js';
import { scanLibrary } from '../src/main/library.js';
import { coreRect, isPanoramicBackground } from '../src/shared/backgroundCorrection.js';

const request: BackgroundCorrectionRequest = { ref: 'library://décor.png', instructions: 'Prolonger les côtés.', mode: 'rebuild', useOriginal: false, cropPosition: .5, outputWidth: 2000 };
async function fixture(run: (context: { base: string; library: string; source: string; create: (generate?: ImageGenerator) => BackgroundCorrections }) => Promise<void>) {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-correction-'));
  const library = path.join(base, 'library'), source = path.join(library, 'décor.png');
  await fs.mkdir(library); await fs.writeFile(source, 'original');
  const services: BackgroundCorrections[] = [];
  const create = (generate: ImageGenerator = async task => { const output = path.join(task.folder, 'generated.png'); await fs.writeFile(output, 'corrected'); return output; }) => { const service = new BackgroundCorrections({
    jobsRoot: path.join(base, 'jobs'), generatedRoot: path.join(base, 'codex-images'), generate,
    inspect: bytes => bytes.toString() === 'portrait' ? { width: 900, height: 2000 } : bytes.toString() === 'native-result' ? { width: 1870, height: 841 } : bytes.toString() === 'clean16' ? { width: 1600, height: 900 } : { width: 2000, height: 900 }, encode: bytes => bytes,
    crop: bytes => bytes, canvas: () => Buffer.from('canvas'), finalize: bytes => bytes,
  }); services.push(service); return service; };
  try { await run({ base, library, source, create }); }
  finally { await Promise.all(services.map(service => service.close())); await fs.rm(base, { recursive: true, force: true }); }
}
async function finished(service: BackgroundCorrections, id: string) {
  for (let count = 0; count < 200; count++) { const job = service.get(id); if (!['queued', 'generating'].includes(job.status)) { await service.flush(); return job; } await new Promise(resolve => setTimeout(resolve, 10)); }
  throw new Error('Job did not finish.');
}

test('an explicit Codex model is a separate CLI argument; automatic preserves existing invocation', () => {
  const folder = path.join(os.tmpdir(), 'a folder with spaces'), canvas = path.join(folder, 'canvas.png');
  const automatic = codexImageArguments(folder, canvas);
  assert.equal(automatic.includes('--model'), false);
  assert.deepEqual(codexImageArguments(folder, canvas, '  '), automatic);
  const selected = codexImageArguments(folder, canvas, ' provider/model-v2:latest ');
  assert.deepEqual(selected, [...automatic.slice(0, -1), '--model', 'provider/model-v2:latest', '-']);
  assert.equal(selected[selected.indexOf('-i') + 1], canvas);
  assert.equal(selected[selected.indexOf('--sandbox') + 1], 'read-only');
  assert.throws(() => codexImageArguments(folder, canvas, '--model other'), /identifiant/);
  const precise=codexImageArguments(folder,canvas,'gpt-6.1-sol','xhigh');
  assert.deepEqual(precise,[...automatic.slice(0,-1),'--model','gpt-6.1-sol','-c','model_reasoning_effort="xhigh"','-']);
});

test('queued jobs retain their own normalized model all the way to the generator', () => fixture(async ({ library, source, create }) => {
  await fs.copyFile(source, path.join(library, 'second.png'));
  const received = new Map<string, string | undefined>();
  const service = create(async task => {
    received.set(task.request.ref, task.request.codexModel);
    const output = path.join(task.folder, 'generated.png'); await fs.writeFile(output, 'corrected'); return output;
  });
  const jobs = await Promise.all([
    service.start(library, { ...request, codexModel: ' test-model-alpha ' }),
    service.start(library, { ...request, ref: 'library://second.png', codexModel: 'test-model-beta' }),
  ]);
  const completed = await Promise.all(jobs.map(job => finished(service, job.id)));
  assert.deepEqual(completed.map(job => [job.status, job.codexModel]), [['ready', 'test-model-alpha'], ['ready', 'test-model-beta']]);
  assert.deepEqual([...received.values()].sort(), ['test-model-alpha', 'test-model-beta']);
  assert.equal(await fs.readFile(source, 'utf8'), 'original');
}));

test('invalid model input never starts a generation; unavailable models fail without fallback', () => fixture(async ({ library, source, create }) => {
  const called: (string | undefined)[] = [];
  const service = create(async task => { called.push(task.request.codexModel); throw new Error('Modèle indisponible pour ce compte.'); });
  for (const codexModel of [42, null, '--help', 'model --sandbox danger-full-access', 'model\noption', 'x'.repeat(129)]) {
    await assert.rejects(service.start(library, { ...request, codexModel }), /[Ii]dentifiant/);
  }
  assert.equal(called.length, 0);
  const selected = await service.start(library, { ...request, codexModel: 'unavailable-model' });
  const failed = await finished(service, selected.id);
  assert.equal(failed.status, 'failed'); assert.equal(failed.codexModel, 'unavailable-model');
  assert.match(failed.message, /indisponible/); assert.deepEqual(called, ['unavailable-model']);
  const automatic = await service.start(library, request); await finished(service, automatic.id);
  assert.equal(service.get(automatic.id).codexModel, undefined);
  assert.deepEqual(called, ['unavailable-model', undefined]);
  assert.equal(await fs.readFile(source, 'utf8'), 'original');
}));

test('proposal is isolated; explicit replacement preserves the original and library references', () => fixture(async ({ library, source, create }) => {
  const service = create(), started = await service.start(library, request);
  assert.equal((await finished(service, started.id)).status, 'ready');
  assert.equal(await fs.readFile(source, 'utf8'), 'original');
  assert.equal((await service.image(started.id, 'source')).bytes.toString(), 'original');
  assert.equal((await service.image(started.id, 'corrected')).bytes.toString(), 'corrected');
  const applied = await service.apply(library, started.id);
  assert.equal(applied.status, 'applied'); assert.equal(applied.ref, request.ref);
  assert.equal(await fs.readFile(source, 'utf8'), 'corrected');
  assert.equal(await fs.readFile(applied.backupPath!, 'utf8'), 'original');
  assert.equal((await service.apply(library, started.id)).backupPath, applied.backupPath);
  assert.deepEqual((await scanLibrary(library)).assets.map(asset => asset.ref), [request.ref]);
}));

test('a concurrent source edit prevents replacement and remains intact', () => fixture(async ({ library, source, create }) => {
  const service = create(), started = await service.start(library, request);
  await finished(service, started.id); await fs.writeFile(source, 'a new authored version');
  await assert.rejects(service.apply(library, started.id), /modifié/);
  assert.equal(await fs.readFile(source, 'utf8'), 'a new authored version');
  assert.equal(service.get(started.id).status, 'ready');
}));

test('native resolution retains the complete generated image at its actual dimensions', () => fixture(async ({ library, source, create }) => {
  const service = create(async task => {
    assert.equal(task.request.outputWidth, 'native');
    const output = path.join(task.folder, 'native.png'); await fs.writeFile(output, 'native-result'); return output;
  });
  const started = await service.start(library, { ...request, outputWidth: 'native' });
  const job = await finished(service, started.id);
  assert.equal(job.status, 'ready'); assert.equal(job.width, 1870); assert.equal(job.height, 841);
  assert.equal((await service.image(job.id, 'corrected')).bytes.toString(), 'native-result');
  assert.equal(await fs.readFile(source, 'utf8'), 'original');
  await service.apply(library, job.id);
  assert.equal(await fs.readFile(source, 'utf8'), 'native-result');
}));

test('cancellation ignores late generation and never replaces a source', () => fixture(async ({ library, source, create }) => {
  let release: (() => void) | undefined;
  const service = create(async task => {
    await new Promise<void>(resolve => { release = resolve; });
    const output = path.join(task.folder, 'late.png'); await fs.writeFile(output, 'corrected'); return output;
  });
  const started = await service.start(library, request);
  await until(() => !!release); service.cancel(started.id); release!();
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(service.get(started.id).status, 'cancelled');
  await assert.rejects(service.apply(library, started.id), /pas prête/);
  assert.equal(await fs.readFile(source, 'utf8'), 'original');
}));

test('refuses the wrong landscape format rather than stretching it', () => fixture(async ({ library, source, create }) => {
  const service = create(async task => { const output = path.join(task.folder, 'portrait.png'); await fs.writeFile(output, 'portrait'); return output; });
  const started = await service.start(library, request), result = await finished(service, started.id);
  assert.equal(result.status, 'failed'); assert.match(result.message, /proportions/);
  assert.equal(await fs.readFile(source, 'utf8'), 'original');
}));

test('refuses paths outside the generation folders and switched libraries', () => fixture(async ({ base, library, source, create }) => {
  const outside = path.join(base, 'outside.png'); await fs.writeFile(outside, 'corrected');
  const rejected = create(async () => outside), rejectedJob = await rejected.start(library, request);
  assert.equal((await finished(rejected, rejectedJob.id)).status, 'failed');
  const service = create(), started = await service.start(library, request); await finished(service, started.id);
  const other = path.join(base, 'other-library'); await fs.mkdir(other);
  await assert.rejects(service.apply(other, started.id), /bibliothèque a changé/);
  await assert.rejects(service.start(library, { ...request, ref: 'library://../outside.png' }));
  assert.throws(() => service.get('unknown'), /inconnue/);
  assert.equal(await fs.readFile(source, 'utf8'), 'original');
}));

test('rebuild recovers the clean 16:9 sibling and never sends the old sides to the generator', () => fixture(async ({ library, create }) => {
  await fs.writeFile(path.join(library, 'garden.png'), 'clean16');
  await fs.writeFile(path.join(library, 'garden_wide_v01.png'), 'broken20');
  let received = '';
  const service = create(async task => {
    received = await fs.readFile(task.sourcePath, 'utf8');
    assert.equal(path.basename(task.sourcePath), 'core.png');
    assert.equal(await fs.readFile(task.canvasPath, 'utf8'), 'canvas');
    const result = path.join(task.folder, 'result.png'); await fs.writeFile(result, 'corrected'); return result;
  });
  const ref = 'library://garden_wide_v01.png';
  const prepared = await service.prepare(library, ref);
  assert.equal(prepared.suggestedMode, 'rebuild'); assert.equal(prepared.original?.ref, 'library://garden.png');
  const job = await service.start(library, { ...request, ref, useOriginal: true });
  assert.equal((await finished(service, job.id)).status, 'ready'); assert.equal(received, 'clean16');
  assert.equal(job.usedOriginal, true); assert.deepEqual(job.core, {x:0,y:0,width:1600,height:900});
  assert.equal((await service.image(job.id, 'source')).bytes.toString(), 'broken20');
  assert.equal((await service.image(job.id, 'core')).bytes.toString(), 'clean16');
  await assert.rejects(service.start(library, { ...request, useOriginal: true }), /introuvable/);
}));

test('crop removes both 10% sides and its offset is bounded; 20:9 no longer depends on a filename', () => {
  assert.deepEqual(coreRect({width:2000,height:900}), {x:200,y:0,width:1600,height:900});
  assert.deepEqual(coreRect({width:2000,height:900}, 0), {x:0,y:0,width:1600,height:900});
  assert.deepEqual(coreRect({width:2000,height:900}, 1), {x:400,y:0,width:1600,height:900});
  assert.equal(isPanoramicBackground('library://garden.png',{width:1600,height:720}),true);
  assert.equal(isPanoramicBackground('library://garden.png',{width:1600,height:900}),false);
  assert.equal(isPanoramicBackground('library://garden.png',{width:3000,height:900}),false);
});

test('rejects invalid crop, size and incompatible extension requests before generation', () => fixture(async ({ library, create }) => {
  let calls=0; const service=create(async()=>{calls++;throw new Error('Should not generate.');});
  for(const patch of [{cropPosition:-.1},{cropPosition:1.1},{cropPosition:NaN},{outputWidth:1601},{mode:'extend'},{useOriginal:true}]) {
    await assert.rejects(service.start(library,{...request,...patch}));
  }
  assert.equal(calls,0);
}));

test('concurrent requests for the same image cannot start duplicate generations', () => fixture(async ({ library, create }) => {
  let release: (()=>void) | undefined, calls=0;
  const service=create(async task=>{calls++;await new Promise<void>(resolve=>{release=resolve;});const file=path.join(task.folder,'late.png');await fs.writeFile(file,'corrected');return file;});
  const results=await Promise.allSettled([service.start(library,request),service.start(library,request)]);
  assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
  await until(() => calls === 1);
  assert.equal(calls,1);
  const result=results.find(result=>result.status==='fulfilled');
  if(result?.status==='fulfilled'){service.cancel(result.value.id);release!();}
  await new Promise(resolve=>setTimeout(resolve,30));
}));

test('different images queue in order and replace only their own source', () => fixture(async ({ library, source, create }) => {
  const other = path.join(library, 'garden.png'); await fs.writeFile(other, 'garden-original');
  const releases = new Map<string, () => void>();
  const service = create(async task => {
    await new Promise<void>(resolve => releases.set(task.request.ref, resolve));
    const result = path.join(task.folder, 'result.png');
    await fs.writeFile(result, task.request.ref === request.ref ? 'first-corrected' : 'garden-corrected'); return result;
  });
  const first = await service.start(library, request), second = await service.start(library, { ...request, ref: 'library://garden.png' });
  await until(() => releases.size === 1);
  assert.notEqual(first.id, second.id);
  assert.equal(service.get(first.id).status, 'generating'); assert.equal(service.get(second.id).status, 'queued');
  releases.get(request.ref)!();
  assert.equal((await finished(service, first.id)).status, 'ready');
  await until(() => releases.has('library://garden.png'));
  assert.equal(await fs.readFile(source, 'utf8'), 'original');
  releases.get('library://garden.png')!();
  assert.equal((await finished(service, second.id)).status, 'ready');
  const appliedSecond = await service.apply(library, second.id);
  assert.equal(await fs.readFile(other, 'utf8'), 'garden-corrected');
  assert.equal(await fs.readFile(appliedSecond.backupPath!, 'utf8'), 'garden-original');
  const appliedFirst = await service.apply(library, first.id);
  assert.equal(await fs.readFile(source, 'utf8'), 'first-corrected');
  assert.equal(await fs.readFile(appliedFirst.backupPath!, 'utf8'), 'original');
  assert.equal(await fs.readFile(other, 'utf8'), 'garden-corrected');
}));

test('cancelled and failed queued work does not block subsequent images', () => fixture(async ({ library, source, create }) => {
  for (const name of ['garden', 'broken']) await fs.writeFile(path.join(library, `${name}.png`), `${name}-original`);
  const releases = new Map<string, () => void>();
  const service = create(async task => {
    await new Promise<void>(resolve => releases.set(task.request.ref, resolve));
    if (task.request.ref === 'library://broken.png') throw new Error('Generation failed for this image.');
    const result = path.join(task.folder, 'result.png'); await fs.writeFile(result, 'corrected'); return result;
  });
  const cancelled = await service.start(library, request), broken = await service.start(library, { ...request, ref: 'library://broken.png' }), good = await service.start(library, { ...request, ref: 'library://garden.png' });
  await until(() => releases.has(request.ref));
  service.cancel(cancelled.id); releases.get(request.ref)!();
  await until(() => releases.has('library://broken.png')); releases.get('library://broken.png')!();
  assert.equal((await finished(service, broken.id)).status, 'failed');
  await until(() => releases.has('library://garden.png'));
  assert.equal(service.get(cancelled.id).status, 'cancelled'); assert.equal(service.get(good.id).status, 'generating');
  releases.get('library://garden.png')!();
  assert.equal((await finished(service, good.id)).status, 'ready');
  assert.equal(await fs.readFile(source, 'utf8'), 'original');
  // A ready proposal is also deduplicated until the author discards or applies it.
  await assert.rejects(service.start(library, { ...request, ref: 'library://garden.png' }), /existe déjà/);
}));

async function until(check: () => boolean) { for (let i = 0; i < 200; i++) { if (check()) return; await new Promise(resolve => setTimeout(resolve, 5)); } throw Error('Condition did not settle.'); }
