import test from 'node:test';
import assert from 'node:assert/strict';
import { seedProject } from '../src/shared/game/seed.js';
import { cinematicReferences, moveCinematic } from '../src/shared/game/cinematicManagement.js';
import { cinematicCampaignContext, levelTravelBookSource, resolveStepTarget } from '../src/shared/campaignContinuity.js';
import { newCinematic } from '../src/shared/model.js';
import { newLevel } from '../src/shared/game/types.js';

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

test('cinematicCampaignContext and levelTravelBookSource resolve adjacent campaign steps and inherited backgrounds', () => {
  const project = seedProject();
  const intro = newCinematic();
  intro.id = 'CIN_INTRO';
  intro.title = 'Intro Serre';
  intro.shots[0].background.asset = 'library://01_environments/greenhouse.png';
  const outro = newCinematic();
  outro.id = 'CIN_OUTRO';
  outro.title = 'Sortie Serre';
  project.cinematics = [intro, outro];
  const level = newLevel(['radish'], 'runner');
  level.id = 'level_01';
  level.title = '01 - La serre';
  level.terrainImage = 'library://01_environments/terrain_01.png';
  project.levels = [level];
  project.campaign = {
    cinematics: [
      { id: 'film_intro', title: intro.title, file: 'film_intro.cinematic.json', documentId: intro.id },
      { id: 'film_outro', title: outro.title, file: 'film_outro.cinematic.json', documentId: outro.id },
    ],
    steps: [
      { id: 'step_1', kind: 'cinematic', cinematicId: 'film_intro', skippable: true },
      { id: 'step_2', kind: 'level', levelId: level.id },
      { id: 'step_end', kind: 'end' },
      { id: 'step_3', kind: 'cinematic', cinematicId: 'film_outro', skippable: true },
    ],
  };

  const introCtx = cinematicCampaignContext(project, intro.id);
  assert.equal(introCtx.placements.length, 1);
  assert.equal(introCtx.placements[0].index, 0);
  assert.equal(introCtx.placements[0].preparing, false);
  assert.equal(introCtx.placements[0].previous, undefined);
  assert.equal(introCtx.placements[0].next?.kind, 'level');
  assert.equal(introCtx.placements[0].next?.title, '01 - La serre');

  const outroCtx = cinematicCampaignContext(project, outro.id);
  assert.equal(outroCtx.placements.length, 1);
  assert.equal(outroCtx.placements[0].preparing, true);
  assert.equal(outroCtx.placements[0].previous?.kind, 'end');

  const travel = levelTravelBookSource(project, level.id);
  assert.equal(travel.source, 'cinematic');
  assert.equal(travel.asset, 'library://01_environments/greenhouse.png');
  assert.equal(travel.filmTitle, 'Intro Serre');

  const second = newLevel(['radish'], 'runner');
  second.terrainImage = 'library://01_environments/terrain_02.png';
  project.levels.push(second);
  project.campaign.steps.splice(2, 0, { id: 'step_second', kind: 'level', levelId: second.id });
  assert.deepEqual(levelTravelBookSource(project, second.id), travel);

  project.campaign.steps.splice(2, 0, { id: 'step_interlude', kind: 'cinematic', cinematicId: 'film_outro', skippable: true });
  assert.deepEqual(levelTravelBookSource(project, second.id), { source: 'terrain', asset: second.terrainImage });

  intro.shots[0].background.asset = null;
  const fallbackTerrain = levelTravelBookSource(project, level.id);
  assert.equal(fallbackTerrain.source, 'terrain');
  assert.equal(fallbackTerrain.asset, 'library://01_environments/terrain_01.png');

  assert.equal(resolveStepTarget(project, undefined), undefined);
});
