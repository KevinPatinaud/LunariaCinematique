import test from 'node:test';
import assert from 'node:assert/strict';
import { seedProject } from '../src/shared/game/seed.js';
import { parseGameProject } from '../src/shared/game/validation.js';
import { resolveAnimation, frameAt, duration } from '../src/shared/presentation/runtime.js';
import { actionPresentation } from '../src/shared/presentation/actions.js';
import { animationOwnerId } from '../src/shared/presentation/ownership.js';

test('Noisetier owns a defensive damage reaction that survives reopen without changing self regeneration', () => {
  const p = parseGameProject(JSON.parse(JSON.stringify(seedProject())));
  const hazel = p.balance.plants.find(s => s.id === 'hazel')!;
  const defense = resolveAnimation(p, hazel, 'hit')!;
  assert.equal(animationOwnerId(p, defense), 'hazel');
  assert.equal(defense.loop, false);
  assert.equal(defense.frames.length, 4);
  assert.deepEqual(defense.markers, [], 'no ability release or projectile in the reaction');
  assert.ok(Math.abs(duration(defense) - 0.52) < 1e-8);
  assert.deepEqual([0.03, 0.10, 0.25, 0.45].map(t => frameAt(defense, t).index), [0, 1, 2, 3]);
  assert.deepEqual(hazel.ability_ids, ['ab_personal_regeneration']);
  assert.equal(hazel.damage, 0);
  assert.equal(actionPresentation(p, hazel, 'attack', 'ab_personal_regeneration').keepsBase, true);
  const oak = p.balance.plants.find(s => s.id === 'baobab')!;
  assert.notEqual(resolveAnimation(p, oak, 'hit')?.id, defense.id, 'shared regeneration does not inherit Noisetier artwork');
});
