import test from 'node:test';
import assert from 'node:assert/strict';
import { ProjectSession, emptyProject } from '../src/shared/projectSession.js';
import { newLevel, type AndroidDeploymentEvent, type AndroidDeploymentResult, type GameBuildResult, type GameProject } from '../src/shared/game/types.js';
import { ProjectDelivery, type DeliveryAction } from '../src/renderer/game/ProjectDelivery.js';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(accept => { resolve = accept; });
  return { promise, resolve };
}
async function settle() { for (let i = 0; i < 12; i++) await Promise.resolve(); }
const buildResult: GameBuildResult = { target: 'android', artifact: 'test.apk', logPath: 'build.log', sha256: 'verified', bytes: 1048576, durationMs: 1, simulated: true };
const deployed: AndroidDeploymentResult = { ...buildResult, device: { serial: 'phone', name: 'Test', state: 'device' }, packageId: 'test.game', deploymentLogPath: 'deploy.log' };
async function fixture(t: test.TestContext) {
  const project = emptyProject(); project.levels = [newLevel(['radish'], 'runner')];
  const calls: { kind: string; project: GameProject; argument?: string }[] = [];
  const saves: GameProject[] = [];
  const events = new Set<(progress: AndroidDeploymentEvent) => void>();
  const io: ConstructorParameters<typeof ProjectSession>[0] = {
    async bootstrap() { return { recovery: null, recent: [] }; },
    async open() { return { project: { ...structuredClone(project), id: 'new-project' }, path: 'new.json', token: 'new-token' }; },
    async openRecent() { throw Error('unused'); },
    async save(value) { saves.push(value); return { project: value, path: 'project.json', token: 'saved-token' }; },
    async recover() {}, async clearRecovery() {}, async backup() { return null; },
    async inspectConflict() { return null; }, async reconcile() { throw Error('unused'); },
  };
  const session = new ProjectSession(io, async () => 'discard', project); await session.boot();
  const api: ConstructorParameters<typeof ProjectDelivery>[1] = {
    async publish(value) { calls.push({ kind: 'publish', project: value }); return { path: 'published.json' }; },
    async publishWeb(value) { calls.push({ kind: 'publishWeb', project: value }); return { title: 'La serre', target: 'local', path: 'site', logPath: 'publication.log' }; },
    async playLevel(value, id) { calls.push({ kind: 'playLevel', project: value, argument: id }); return { path: 'test.json', levelId: id, title: 'Level', gameRoot: 'game', executable: 'godot', simulated: true }; },
    async build(value, target) { calls.push({ kind: 'build', project: value, argument: target }); return { ...buildResult, target }; },
    async deployAndroid(value, id) { calls.push({ kind: 'deployAndroid', project: value, argument: id }); return deployed; },
    onAndroidDeploymentProgress(callback) { events.add(callback); return () => { events.delete(callback); }; },
  };
  const delivery = new ProjectDelivery(session, api), disconnect = delivery.connect();
  t.after(() => { disconnect(); session.dispose(); });
  return { project, calls, saves, events, io, session, api, delivery,
    emit(event: AndroidDeploymentEvent) { for (const listener of events) listener(event); } };
}
const actions: DeliveryAction[] = [{ kind: 'publish' }, { kind: 'publishWeb' }, { kind: 'playLevel', levelId: '' }, { kind: 'build', target: 'windows' }, { kind: 'build', target: 'android' }, { kind: 'deployAndroid' }];
for (const action of actions) test(`${action.kind}${action.kind === 'build' ? ':' + action.target : ''} delivers exactly the saved project under the session lock`, async t => {
  const f = await fixture(t), value = f.session.project;
  const request = action.kind === 'playLevel' ? { ...action, levelId: value.levels[0].id } : action;
  let saved = false;
  f.io.save = async project => { assert.equal(f.session.getSnapshot().busy, true); f.saves.push(project); saved = true; return { project, path: 'copy.json', token: 'new-save-as-token' }; };
  await f.delivery.execute(request);
  assert.equal(saved, true); assert.equal(f.calls.length, 1); assert.equal(f.calls[0].project, f.saves[0]);
  assert.equal(f.session.getSnapshot().busy, false); assert.equal(f.session.getSnapshot().dirty, false);
  if (action.kind === 'deployAndroid') { assert.equal(f.delivery.getSnapshot()?.status, 'success'); assert.equal(f.events.size, 0); }
});

test('canceling the save prevents every delivery action', async t => {
  const f = await fixture(t); f.io.save = async () => null;
  for (const action of actions) await f.delivery.execute(action.kind === 'playLevel' ? { ...action, levelId: f.project.levels[0].id } : action);
  assert.equal(f.calls.length, 0); assert.equal(f.events.size, 0);
  assert.equal(f.delivery.getSnapshot()?.status, 'canceled'); assert.equal(f.session.getSnapshot().busy, false);
  assert.match(f.session.getSnapshot().message, /Déploiement annulé/);
});

test('a failed save releases the lock and never starts native delivery', async t => {
  const f = await fixture(t); f.io.save = async () => { throw Error('Disk unavailable'); };
  await f.delivery.execute({ kind: 'deployAndroid' });
  assert.equal(f.calls.length, 0); assert.equal(f.delivery.getSnapshot()?.status, 'error');
  assert.match(f.session.getSnapshot().message, /Disk unavailable/); assert.equal(f.session.getSnapshot().busy, false);
});

test('edits made during save remain dirty and are never passed to the native publisher', async t => {
  const f = await fixture(t), pending = deferred<Awaited<ReturnType<typeof f.io.save>>>();
  f.io.save = async value => { f.saves.push(value); return pending.promise; };
  const operation = f.delivery.execute({ kind: 'publish' }); await settle();
  f.session.change(project => { project.title = 'New unsaved edit'; }, '', 'Asynchronous edit', undefined, true);
  pending.resolve({ project: f.saves[0], path: 'saved.json', token: 'saved' }); await operation;
  assert.equal(f.calls.length, 0); assert.equal(f.session.project.title, 'New unsaved edit');
  assert.equal(f.session.getSnapshot().dirty, true); assert.match(f.session.getSnapshot().message, /changé pendant l’enregistrement/);
});

test('a missing level is refused and the requested ID is preserved across selection changes', async t => {
  const f = await fixture(t);
  await f.delivery.execute({ kind: 'playLevel', levelId: 'missing' });
  assert.equal(f.saves.length, 0); assert.equal(f.calls.length, 0);
  const id = f.project.levels[0].id;
  await f.delivery.execute({ kind: 'playLevel', levelId: id });
  assert.equal(f.calls[0].argument, id);
});

test('double requests share the existing lock and save/deliver only once', async t => {
  const f = await fixture(t), pending = deferred<Awaited<ReturnType<typeof f.io.save>>>();
  f.io.save = async value => { f.saves.push(value); return pending.promise; };
  const first = f.delivery.execute({ kind: 'publish' });
  await f.delivery.execute({ kind: 'build', target: 'android' });
  assert.equal(f.saves.length, 1);
  pending.resolve({ project: f.saves[0], path: 'saved.json', token: 'saved' }); await first;
  assert.deepEqual(f.calls.map(call => call.kind), ['publish']);
});

test('old progress cannot alter a newer deployment and listeners are removed after completion', async t => {
  const f = await fixture(t); assert.equal(f.events.size, 0);
  await f.delivery.execute({ kind: 'deployAndroid' }); const oldId = f.calls[0].argument!;
  const pending = deferred<AndroidDeploymentResult | null>();
  f.api.deployAndroid = async (project, requestId) => { f.calls.push({ kind: 'deployAndroid', project, argument: requestId }); return pending.promise; };
  const second = f.delivery.execute({ kind: 'deployAndroid' }); await settle();
  const currentId = f.calls[1].argument!; assert.notEqual(currentId, oldId); assert.equal(f.events.size, 1);
  f.emit({ requestId: oldId, phase: 'build', message: 'OLD' }); assert.notEqual(f.session.getSnapshot().message, 'OLD');
  f.emit({ requestId: currentId, phase: 'install', message: 'CURRENT' }); assert.equal(f.session.getSnapshot().message, 'CURRENT');
  assert.equal(f.delivery.getSnapshot()?.phase, 'install');
  pending.resolve(deployed); await second; assert.equal(f.events.size, 0);
  f.emit({ requestId: currentId, phase: 'build', message: 'AFTER' }); assert.notEqual(f.session.getSnapshot().message, 'AFTER');
});

test('opening a project clears the previous completed Android status', async t => {
  const f = await fixture(t); await f.delivery.execute({ kind: 'deployAndroid' });
  assert.equal(f.delivery.getSnapshot()?.status, 'success'); await f.session.open();
  assert.equal(f.delivery.getSnapshot(), null); assert.equal(f.events.size, 0);
});

test('native error or cancellation leaves no subscription and a later attempt can succeed', async t => {
  const f = await fixture(t);
  f.api.deployAndroid = async () => { throw Error('Phone unavailable'); };
  await f.delivery.execute({ kind: 'deployAndroid' });
  assert.equal(f.events.size, 0); assert.equal(f.delivery.getSnapshot()?.status, 'error');
  f.api.deployAndroid = async () => null; await f.delivery.execute({ kind: 'deployAndroid' });
  assert.equal(f.events.size, 0); assert.equal(f.delivery.getSnapshot()?.status, 'canceled');
  f.api.deployAndroid = async () => deployed; await f.delivery.execute({ kind: 'deployAndroid' });
  assert.equal(f.delivery.getSnapshot()?.status, 'success'); assert.equal(f.session.getSnapshot().busy, false);
});
