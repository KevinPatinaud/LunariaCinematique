import test from 'node:test';
import assert from 'node:assert/strict';
import { seedProject } from '../src/shared/game/seed.js';
import { cinematicReferences } from '../src/shared/game/cinematicManagement.js';
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
