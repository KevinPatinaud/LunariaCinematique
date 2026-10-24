import test from 'node:test';
import assert from 'node:assert/strict';
import { seedProject } from '../src/shared/game/seed.js';
import { cinematicReferences, moveCinematic } from '../src/shared/game/cinematicManagement.js';
import { newCinematic } from '../src/shared/model.js';

test('a film used in the campaign cannot be treated as unlinked', () => {
  const project = seedProject();
  const film = newCinematic();
  film.id = 'CIN_TEST';
  project.cinematics = [film];
  project.campaign = {
    cinematics: [{ id: 'film_test', title: film.title, file: 'film_test.cinematic.json', documentId: film.id }],
    steps: [{ id: 'step_test', kind: 'cinematic', cinematicId: 'film_test', skippable: true }],
  };
  assert.deepEqual(cinematicReferences(project, film.id), ['parcours de campagne']);
  project.campaign.steps = [];
  assert.deepEqual(cinematicReferences(project, film.id), []);
});

test('moving a cinematic inserts it on either side without swapping or changing campaign links', () => {
  const project = seedProject();
  project.cinematics = ['A', 'B', 'C', 'D', 'E'].map(id => ({ ...newCinematic(), id }));
  const originals = [...project.cinematics];
  const campaign = structuredClone(project.campaign);
  moveCinematic(project, 'E', 'B', 'before');
  assert.deepEqual(project.cinematics.map(film => film.id), ['A', 'E', 'B', 'C', 'D']);
  moveCinematic(project, 'A', 'C', 'after');
  assert.deepEqual(project.cinematics.map(film => film.id), ['E', 'B', 'C', 'A', 'D']);
  moveCinematic(project, 'D', 'E', 'before');
  assert.deepEqual(project.cinematics.map(film => film.id), ['D', 'E', 'B', 'C', 'A']);
  moveCinematic(project, 'D', 'A', 'after');
  assert.deepEqual(project.cinematics.map(film => film.id), ['E', 'B', 'C', 'A', 'D']);
  for (const original of originals) assert.equal(project.cinematics.find(film => film.id === original.id), original);
  assert.deepEqual(project.campaign, campaign);
});

test('dropping on itself, an adjacent boundary or a missing film leaves the order intact', () => {
  const project = seedProject();
  project.cinematics = ['A', 'B', 'C'].map(id => ({ ...newCinematic(), id }));
  const original = [...project.cinematics];
  moveCinematic(project, 'B', 'B', 'after');
  moveCinematic(project, 'B', 'C', 'before');
  moveCinematic(project, 'B', 'A', 'after');
  moveCinematic(project, 'missing', 'A', 'before');
  moveCinematic(project, 'A', 'missing', 'after');
  assert.deepEqual(project.cinematics, original);
  moveCinematic({ ...project, cinematics: undefined }, 'A', 'B', 'before');
});
