import test from 'node:test';
import assert from 'node:assert/strict';
import { newActor, newCinematic, type Actor, type Asset } from '../src/shared/model.js';
import { actorAnchor, actorPose, entryEnd, newMotion, newMovement, restPose } from '../src/shared/motion.js';
import { prepareCinematic } from '../src/shared/geometry.js';
import { parseCinematic, validationIssues } from '../src/shared/schema.js';

const effects = ['orbit', 'figure8', 'zigzag', 'tumble', 'surprise', 'jelly'] as const;
const entrances = ['drop', 'spiral', 'rise'] as const;
const exits = ['spiral', 'rise', 'fall'] as const;
const asset: Asset = { ref: 'library://07_props/lanterne.png', path: '07_props/lanterne.png',
  folder: '07_props', kind: 'prop', name: 'Lanterne', bytes: 1, modified: 1, url: 'x', thumbnail: 'x' };
const actor = (): Actor => ({ ...newActor(asset, 0.8, 0.3, 0.4), rotation: 23, opacity: 0.8 });
const near = (a: number, b: number, tolerance = 1e-6) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const samePose = (a: ReturnType<typeof actorPose>, b: ReturnType<typeof actorPose>, tolerance = 1e-6) => {
  for (const key of ['x', 'y', 'opacity', 'rotation', 'scale', 'pivotX', 'pivotY'] as const) near(a[key], b[key], tolerance);
};

for (const preset of effects) for (const role of ['character', 'enemy', 'prop'] as const) {
  test(`${role}: ${preset} persists, upgrades to v3 and animates without altering the source`, () => {
    const a = { ...actor(), role, motion: { ...newMotion(preset), intensity: 0.7, period: 2 } };
    const document = newCinematic(); document.shots[0].actors = [a];
    const original = structuredClone(a);
    assert.ok(validationIssues(document).length);
    const saved = prepareCinematic(document);
    assert.equal(saved.schemaVersion, 3);
    assert.deepEqual(validationIssues(saved), []);
    assert.deepEqual(parseCinematic(JSON.parse(JSON.stringify(saved))).shots[0].actors[0], a);
    assert.notDeepEqual(actorPose(a, 0.25), restPose(a));
    assert.deepEqual(a, original);
  });
}

for (const preset of effects) for (const reverse of [false, true]) {
  test(`${preset}, reverse ${reverse}: delay, zero strength, repeat boundaries and one-shot rest are stable`, () => {
    const a = actor();
    a.entry = { preset: 'rise', delay: 0.25, duration: 0.75 };
    a.motion = { ...newMotion(preset), period: 2, delay: 0.5, intensity: 1, loop: true, reverse };
    const start = entryEnd(a) + a.motion.delay, rest = restPose(a);
    samePose(actorPose(a, start - 0.1), rest);
    samePose(actorPose(a, start), rest);
    for (const cycle of [1, 2, 8]) {
      samePose(actorPose(a, start + cycle * 2), rest);
      // No discontinuity when wrapping an effect, including at fractional authored strengths.
      samePose(actorPose(a, start + cycle * 2 - 1e-8), rest, 1e-4);
      samePose(actorPose(a, start + cycle * 2 + 1e-8), rest, 1e-4);
    }
    a.motion.intensity = 0;
    samePose(actorPose(a, start + 0.31), rest);
    a.motion.intensity = 0.35; a.motion.loop = false;
    samePose(actorPose(a, start + 2 - 1e-8), rest, 1e-4);
    samePose(actorPose(a, start + 2), rest);
    samePose(actorPose(a, start + 200), rest);
  });
}

test('orbit and figure eight use distinct closed trajectories with predictable dimensions', () => {
  const a = actor(), rest = restPose(a);
  a.motion = { ...newMotion('orbit'), period: 4, intensity: 1 };
  near(actorPose(a, 1).x, rest.x + 65); near(actorPose(a, 1).y, rest.y - 40);
  near(actorPose(a, 2).x, rest.x); near(actorPose(a, 2).y, rest.y - 80);
  a.motion.preset = 'figure8';
  near(actorPose(a, 1).x, rest.x + 75); near(actorPose(a, 1).y, rest.y);
  samePose(actorPose(a, 2), rest);
  near(actorPose(a, 3).x, rest.x - 75);
});

test('zigzag reaches alternating corners; reverse mirrors the path without flipping the artwork', () => {
  const a = actor(), rest = restPose(a);
  a.motion = { ...newMotion('zigzag'), period: 4, intensity: 1 };
  near(actorPose(a, 0.5).x, rest.x + 70); near(actorPose(a, 1.5).x, rest.x - 70);
  const forward = actorPose(a, 0.5); a.motion.reverse = true;
  near(actorPose(a, 0.5).x, rest.x - 70); near(actorPose(a, 0.5).y, forward.y);
  assert.equal(a.flipX, false);
});

test('tumble rolls out and returns continuously even when its amplitude is a partial turn', () => {
  const a = actor(), rest = restPose(a);
  a.motion = { ...newMotion('tumble'), period: 2, intensity: 0.5 };
  near(actorPose(a, 1).x, rest.x + 60); near(actorPose(a, 1).rotation, rest.rotation + 180);
  a.motion.reverse = true;
  near(actorPose(a, 1).x, rest.x - 60); near(actorPose(a, 1).rotation, rest.rotation - 180);
  samePose(actorPose(a, 2), rest);
});

test('surprise peaks in a jump and scale; reversing changes the lean, not its height', () => {
  const a = actor(), rest = restPose(a);
  a.motion = { ...newMotion('surprise'), period: 2, intensity: 1 };
  near(actorPose(a, 1).y, rest.y - 95); near(actorPose(a, 1).scale, 1.18);
  const forward = actorPose(a, 0.5); a.motion.reverse = true;
  const reverse = actorPose(a, 0.5);
  near(reverse.y, forward.y); near(reverse.scale, forward.scale);
  near(reverse.rotation - rest.rotation, -(forward.rotation - rest.rotation));
});

test('jelly decays between successive peaks and respects the chosen pivot', () => {
  const a = actor(); a.pivot = 'bottom';
  a.motion = { ...newMotion('jelly'), period: 12, intensity: 1 };
  assert.ok(Math.abs(actorPose(a, 5).scale - 1) > Math.abs(actorPose(a, 9).scale - 1));
  for (const elapsed of [1, 3, 5, 7, 9, 11]) {
    const value = actorPose(a, elapsed);
    assert.ok(value.scale > 0.75 && value.scale < 1.25);
    const anchor = actorAnchor(a, elapsed, true, 0.5, 1), rest = actorAnchor(a, 0, false, 0.5, 1);
    near(anchor.x, rest.x); near(anchor.y, rest.y);
  }
});

for (const preset of effects) {
  test(`${preset} composes with travel and freezes at exit start`, () => {
    const a = actor(); a.motion = { ...newMotion(preset), period: 3, loop: true };
    const noTravel = actorPose(a, 1);
    a.movement = { ...newMovement(a), duration: 1, dx: 0.2, dy: -0.1 };
    const composed = actorPose(a, 1);
    near(composed.x - noTravel.x, 320); near(composed.y - noTravel.y, -90);
    a.exit = { preset: 'rise', start: 1, duration: 2 };
    samePose(actorPose(a, 1), composed);
    const leaving = actorPose(a, 2);
    near(leaving.x, composed.x); near(leaving.y, composed.y - 120);
    near(leaving.rotation, composed.rotation); near(leaving.scale, composed.scale);
    near(leaving.opacity, composed.opacity / 2);
  });
}

for (const preset of entrances) for (const role of ['character', 'enemy', 'prop'] as const) {
  test(`${role}: ${preset} entrance round-trips and finishes at the exact composition`, () => {
    const a = { ...actor(), role, entry: { preset, delay: 0.5, duration: 1 } };
    const d = newCinematic(); d.shots[0].actors = [a];
    const saved = prepareCinematic(d);
    assert.equal(saved.schemaVersion, 3); assert.deepEqual(validationIssues(saved), []);
    assert.deepEqual(parseCinematic(JSON.parse(JSON.stringify(saved))).shots[0].actors[0], a);
    near(actorPose(a, 0.49).opacity, 0); near(actorPose(a, 0.5).opacity, 0);
    assert.notDeepEqual(actorPose(a, 0.75), restPose(a));
    samePose(actorPose(a, 1.5), restPose(a)); samePose(actorPose(a, 300), restPose(a));
  });
}

test('drop actually rebounds upward after the first impact', () => {
  const a = actor(); a.entry = { preset: 'drop', delay: 0, duration: 1 };
  near(actorPose(a, 1 / 2.75).y, restPose(a).y);
  assert.ok(actorPose(a, 1.5 / 2.75).y < actorPose(a, 1 / 2.75).y);
});

for (const preset of exits) for (const role of ['character', 'enemy', 'prop'] as const) {
  test(`${role}: ${preset} exit starts continuously and stays hidden after completion`, () => {
    const a = { ...actor(), role, motion: newMotion('jelly'), exit: { preset, start: 0.3, duration: 1 } };
    const withoutExit = { ...a, exit: undefined };
    samePose(actorPose(a, 0.3), actorPose(withoutExit, 0.3));
    samePose(actorPose(a, 0.3 + 1e-8), actorPose(withoutExit, 0.3), 1e-4);
    assert.ok(actorPose(a, 0.8).opacity < actorPose(a, 0.3).opacity);
    near(actorPose(a, 1.3).opacity, 0); near(actorPose(a, 300).opacity, 0);
    const d = newCinematic(); d.shots[0].actors = [a];
    const saved = prepareCinematic(d);
    assert.deepEqual(parseCinematic(JSON.parse(JSON.stringify(saved))).shots[0].actors[0], a);
  });
}

test('new exits preserve the frozen pose and add their own direction and rotation', () => {
  const a = actor(); a.exit = { preset: 'rise', start: 0, duration: 2 };
  const rest = restPose(a);
  near(actorPose(a, 1).y, rest.y - 120);
  a.exit.preset = 'fall'; near(actorPose(a, 1).y, rest.y + 120);
  a.exit.preset = 'spiral'; const leaving = actorPose(a, 1);
  near(leaving.rotation, rest.rotation + 180); near(leaving.scale, 0.5);
  near(leaving.x, rest.x); near(leaving.y, rest.y); near(leaving.opacity, rest.opacity / 2);
});
