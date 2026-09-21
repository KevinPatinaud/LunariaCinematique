import test from 'node:test';
import assert from 'node:assert/strict';
import { newCinematic, newShot, newBubble } from '../src/shared/model.js';
import { playbackStartIndex, beginPlayback, tickPlayback, advanceDialogue } from '../src/shared/playback.js';

function fixture() {
  const doc = newCinematic();
  doc.shots = Array.from({ length: 4 }, (_, index) => {
    const shot = newShot(); shot.name = `Plan ${index + 1}`; shot.duration = 2;
    shot.dialogueStart = 0; shot.transition = { type: 'cut', duration: 0 };
    return shot;
  });
  return doc;
}

test('Tout lire resolves the first plan despite another selected plan', () => {
  const doc = fixture();
  assert.equal(playbackStartIndex(doc), 0);
});
test('selected plan resolves to its current index', () => {
  const doc = fixture();
  assert.equal(playbackStartIndex(doc, doc.shots[2].id), 2);
});
test('the last plan can be selected as a starting point', () => {
  const doc = fixture();
  assert.equal(playbackStartIndex(doc, doc.shots[3].id), 3);
});
test('reordering preserves the target by ID, not by a cached number', () => {
  const doc = fixture(), id = doc.shots[2].id;
  const [moved] = doc.shots.splice(2, 1); doc.shots.unshift(moved);
  assert.equal(playbackStartIndex(doc, id), 0);
});
test('inserting a plan before selection updates the starting index', () => {
  const doc = fixture(), id = doc.shots[2].id;
  doc.shots.unshift(newShot());
  assert.equal(playbackStartIndex(doc, id), 3);
});
test('removing the previously selected plan never returns a negative index', () => {
  const doc = fixture(), [removed] = doc.shots.splice(2, 1);
  assert.equal(playbackStartIndex(doc, removed.id), 0);
});
test('resolving the selected plan does not mutate the document', () => {
  const doc = fixture(), before = JSON.stringify(doc);
  playbackStartIndex(doc, doc.shots[2].id);
  assert.equal(JSON.stringify(doc), before);
});
test('a single-plan cinematic starts normally', () => {
  const doc = newCinematic();
  assert.equal(playbackStartIndex(doc, doc.shots[0].id), 0);
});
test('selected preview starts at time zero and its first dialogue', () => {
  const doc = fixture();
  assert.deepEqual(beginPlayback(playbackStartIndex(doc, doc.shots[2].id)), {
    shotIndex: 2, elapsed: 0, dialogueIndex: 0, dialogueElapsed: 0, paused: false, finished: false
  });
});
test('dialogues waiting for a click in earlier plans are skipped', () => {
  const doc = fixture();
  doc.shots[0].bubbles = [newBubble()];
  doc.shots[0].duration = 300;
  const current = tickPlayback(doc, beginPlayback(playbackStartIndex(doc, doc.shots[2].id)), 2.5);
  assert.equal(current.shotIndex, 3);
  assert.equal(current.elapsed, .5);
});
test('selected preview continues through later plans, then finishes without looping', () => {
  const doc = fixture();
  const current = tickPlayback(doc, beginPlayback(playbackStartIndex(doc, doc.shots[2].id)), 5);
  assert.equal(current.shotIndex, 3);
  assert.equal(current.finished, true);
});
test('the selected plan still waits for its own clickable dialogues', () => {
  const doc = fixture();
  doc.shots[2].bubbles = [newBubble()];
  let current = tickPlayback(doc, beginPlayback(2), 3);
  assert.equal(current.shotIndex, 2);
  current = advanceDialogue(doc, current);
  assert.equal(current.shotIndex, 3);
});
test('replaying a selected preview resets to its origin, not the last visited plan', () => {
  const doc = fixture(), origin = doc.shots[2].id;
  const end = tickPlayback(doc, beginPlayback(playbackStartIndex(doc, origin)), 5);
  assert.equal(end.finished, true);
  assert.equal(beginPlayback(playbackStartIndex(doc, origin)).shotIndex, 2);
});
