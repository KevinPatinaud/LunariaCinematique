import test from 'node:test';
import assert from 'node:assert/strict';
import { newCinematic, newShot, type Asset, type Cinematic } from '../src/shared/model.js';
import { CinematicPlaybackSession, type PlaybackContext } from '../src/renderer/playback/CinematicPlaybackSession.js';

function deferred() {
  let resolve!: () => void, reject!: (error: Error) => void;
  const promise = new Promise<void>((accept, fail) => { resolve = accept; reject = fail; });
  return { promise, resolve, reject };
}
async function settle() { for (let i = 0; i < 8; i++) await Promise.resolve(); }
function fixture(preload: (document: Cinematic, index: number, assets: readonly Asset[]) => Promise<void> = async () => {}) {
  let now = 0, hidden = false, sequence = 0;
  const frames = new Map<number, (time: number) => void>();
  const observers = new Set<() => void>();
  const reports: string[] = [];
  const voices: { stops: number; states: { paused: boolean; ready: boolean; shot: number }[] }[] = [];
  const doc = newCinematic(); doc.shots = [newShot(), newShot()];
  doc.shots.forEach(shot => { shot.duration = 1; });
  const context: PlaybackContext = { key: 'project:1', document: doc, assets: [], active: true };
  const session = new CinematicPlaybackSession({
    preload,
    createAudio: () => {
      const voice = { stops: 0, states: [] as { paused: boolean; ready: boolean; shot: number }[] };
      voices.push(voice);
      return { stop: () => { voice.stops++; }, sync: (_doc, state, _assets, ready) => {
        if (state) voice.states.push({ paused: state.paused, ready, shot: state.shotIndex });
      } };
    },
    requestFrame: callback => { frames.set(++sequence, callback); return sequence; },
    cancelFrame: id => { frames.delete(id); },
    now: () => now,
    hidden: () => hidden,
    observeVisibility: callback => { observers.add(callback); return () => { observers.delete(callback); }; },
    report: message => reports.push(message),
  });
  session.setContext(context);
  return { session, context, doc, frames, observers, voices, reports,
    frame(delta: number) { now += delta; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(now)); },
    visibility(value: boolean, elapsed = 0) { hidden = value; now += elapsed; for (const callback of observers) callback(); },
  };
}

test('stop releases a pending start immediately and ignores its eventual successful decode', { timeout: 1000 }, async () => {
  const load = deferred(), f = fixture(() => load.promise);
  const start = f.session.start(); await settle();
  assert.equal(f.session.getSnapshot().loading, true);
  f.session.stop();
  assert.equal(await start, 'canceled');
  load.resolve(); await settle();
  assert.equal(f.session.isActive(), false);
  assert.equal(f.voices.length, 0); assert.equal(f.frames.size, 0);
});

test('a late failed decode after cancellation produces neither a toast nor a resurrected preview', async () => {
  const load = deferred(), f = fixture(() => load.promise);
  const start = f.session.start(); await settle(); f.session.stop();
  load.reject(Error('Old decoder failed')); await settle();
  assert.equal(await start, 'canceled');
  assert.deepEqual(f.reports, []); assert.equal(f.session.isActive(), false);
});

test('film, same-ID document replacement, project, library and mode changes invalidate pending loads', async () => {
  const changes: ((context: PlaybackContext) => PlaybackContext)[] = [
    context => ({ ...context, document: { ...structuredClone(context.document), id: 'another-film' } }),
    context => ({ ...context, document: structuredClone(context.document) }),
    context => ({ ...context, key: 'another-project' }),
    context => ({ ...context, assets: [] }),
    context => ({ ...context, active: false }),
  ];
  for (const change of changes) {
    const load = deferred(), f = fixture(() => load.promise);
    const start = f.session.start(); await settle();
    f.session.setContext(change(f.context));
    load.resolve();
    assert.equal(await start, 'canceled');
    assert.equal(f.session.isActive(), false); assert.equal(f.voices.length, 0);
  }
});

test('an older start cannot overwrite a newer start or stop its audio', async () => {
  const first = deferred(); let calls = 0;
  const f = fixture(() => ++calls === 1 ? first.promise : Promise.resolve());
  const oldStart = f.session.start(f.doc.shots[1].id); await settle();
  assert.equal(await f.session.start(f.doc.shots[0].id), 'started');
  first.reject(Error('Late failure')); await settle();
  assert.equal(await oldStart, 'canceled');
  assert.equal(f.session.getSnapshot().playback?.shotIndex, 0);
  assert.equal(f.voices.length, 1); assert.equal(f.voices[0].stops, 0);
});

test('hiding pauses clock and audio; resuming after a long absence does not skip story time', async () => {
  const f = fixture(); await f.session.start(); f.frame(250);
  f.visibility(true);
  assert.equal(f.session.getSnapshot().playback?.paused, true);
  assert.equal(f.voices[0].states.at(-1)?.paused, true);
  assert.equal(f.frames.size, 0);
  f.visibility(false, 600_000);
  assert.equal(f.session.getSnapshot().playback?.paused, true);
  f.session.togglePause(); f.frame(100);
  assert.ok(Math.abs(f.session.getSnapshot().playback!.elapsed - 0.35) < 1e-9);
  assert.equal(f.voices.length, 1);
  f.session.stop(); assert.equal(f.frames.size, 0); assert.equal(f.observers.size, 0);
});

test('one audio player spans shot boundaries, then completion releases clock and visibility hooks', async () => {
  const f = fixture(); const original = structuredClone(f.doc);
  await f.session.start(); f.frame(1100); await settle();
  assert.equal(f.session.getSnapshot().playback?.shotIndex, 1);
  assert.equal(f.session.getSnapshot().readyShot, 1);
  assert.equal(f.voices.length, 1); assert.equal(f.voices[0].stops, 0);
  f.frame(1000); await settle();
  assert.equal(f.session.getSnapshot().playback?.finished, true);
  assert.equal(f.frames.size, 0); assert.equal(f.observers.size, 0); assert.equal(f.voices[0].stops, 1);
  assert.deepEqual(f.doc, original);
});

test('the selected shot is resolved by ID after reordering and restart retains that origin', async () => {
  const f = fixture(); const origin = f.doc.shots[1].id;
  f.doc.shots.reverse();
  await f.session.start(origin);
  assert.equal(f.session.getSnapshot().playback?.shotIndex, 0);
  f.frame(2500); await settle();
  assert.equal(f.session.getSnapshot().playback?.finished, true);
  await f.session.restart();
  assert.equal(f.session.getSnapshot().playback?.shotIndex, 0);
  assert.equal(f.session.getSnapshot().startShotId, origin);
  assert.equal(f.voices.length, 2); f.session.stop();
});

test('canceling a shot transition also ignores a late decode error', async () => {
  const next = deferred(); let loads = 0;
  const f = fixture(() => ++loads === 1 ? Promise.resolve() : next.promise);
  await f.session.start(); f.frame(1100); await settle();
  assert.equal(f.session.getSnapshot().loading, true);
  f.session.stop(); next.reject(Error('Old next shot')); await settle();
  assert.deepEqual(f.reports, []); assert.equal(f.frames.size, 0); assert.equal(f.observers.size, 0);
});

test('missing media is refused before decoding, audio or clock starts', async () => {
  let loads = 0; const f = fixture(async () => { loads++; });
  f.doc.shots[0].background.asset = 'library://missing.png';
  assert.equal(await f.session.start(), 'invalid');
  assert.equal(loads, 0); assert.equal(f.voices.length, 0); assert.equal(f.frames.size, 0);
});
