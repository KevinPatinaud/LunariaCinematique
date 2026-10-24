import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { seedProject } from "../src/shared/game/seed.js";
import {
  defaultEnemyRules,
  ensureEnemyRules,
  enemyRules,
  duplicateEnemy,
  producedEnemies,
  groupForEnemy,
  updateEnemyRules,
  usesPlacement,
  mobileReinforcement,
  enemyRulesSummary,
} from "../src/shared/game/enemyRules.js";
import {
  parseGameProject,
  parseGameDraft,
  gameIssues,
} from "../src/shared/game/validation.js";
import {
  newLevel,
  newId,
  defaultInvasiveFoci,
} from "../src/shared/game/types.js";
import {
  convertWavePlacement,
  placedGroup,
} from "../src/shared/game/boardPlacement.js";
import { compileCampaign } from "../src/shared/game/campaign.js";
import { GameDocuments } from "../src/main/gameDocuments.js";
const fixture = () => parseGameProject(seedProject()),
  errors = (p: unknown) => gameIssues(p).filter((i) => i.severity === "error");

test("import makes the historical rules explicit without changing combat stats or overwriting authored choices", () => {
  const p = fixture(),
    before = structuredClone(p);
  for (const e of p.balance.enemies) delete e.rules;
  ensureEnemyRules(p);
  assert.deepEqual(p, before);
  p.balance.enemies.find(
    (e) => e.id === "plaque",
  )!.rules!.reinforcements!.interval = 17;
  ensureEnemyRules(p);
  assert.equal(
    p.balance.enemies.find((e) => e.id === "plaque")!.rules!.reinforcements!
      .interval,
    17,
  );
});
test("old documents and recovery drafts gain rules at import, while an incomplete publication is rejected", () => {
  const p = fixture();
  for (const e of p.balance.enemies) delete e.rules;
  assert.ok(errors(p).some((e) => e.message.includes("rules")));
  assert.ok(parseGameProject(p).balance.enemies.every((e) => e.rules));
  assert.ok(parseGameDraft(p).balance.enemies.every((e) => e.rules));
});
for (const id of ["poubelle", "plaque", "cigarette", "thorn_knot", "collector"])
  test(
    "duplicated " +
      id +
      " keeps working with a new identity and independent owned art",
    () => {
      const p = fixture(),
        source = p.balance.enemies.find((e) => e.id === id)!,
        before = structuredClone(source),
        copy = duplicateEnemy(p, id);
      assert.notEqual(copy.id, id);
      assert.notEqual(copy.behaviorId, source.behaviorId);
      assert.deepEqual(copy.rules, source.rules);
      assert.notEqual(copy.rules, source.rules);
      assert.ok(!copy.archived);
      assert.deepEqual(errors(p), []);
      for (const profile of p.presentation!.profiles.filter(
        (pr) => pr.id === copy.animationProfileId,
      ))
        for (const slot of profile.slots) {
          const a = p.presentation!.animations.find(
            (a) => a.id === slot.animationId,
          );
          if (a?.ownerSpeciesId) assert.equal(a.ownerSpeciesId, copy.id);
        }
      copy.rules!.blocksEnemies = !copy.rules!.blocksEnemies;
      assert.deepEqual(source, before);
    },
  );
test("default rules never confer special behavior just because a species has a historical name", () => {
  const p = fixture(),
    e = p.balance.enemies.find((e) => e.id === "plaque")!;
  e.rules = defaultEnemyRules();
  e.speed = 0.2;
  assert.equal(usesPlacement(e), false);
  assert.deepEqual(producedEnemies(p.balance.enemies, [e.id]), [e.id]);
  assert.equal(e.rules.blocksEnemies, false);
});
test("a generator closure follows arbitrary identifiers and terminates cycles", () => {
  const p = fixture(),
    a = duplicateEnemy(p, "plaque"),
    b = duplicateEnemy(p, "plaque");
  a.rules!.reinforcements = { enemyId: b.id, interval: 2 };
  b.rules!.reinforcements = { enemyId: a.id, interval: 3 };
  assert.deepEqual(producedEnemies(p.balance.enemies, [a.id, a.id]), [
    a.id,
    b.id,
  ]);
});
test("unknown reinforcement, malformed placement and zero-speed off-board arrivals are rejected", () => {
  const p = fixture(),
    e = p.balance.enemies[0];
  e.rules!.reinforcements = { enemyId: "absent", interval: 5 };
  assert.ok(errors(p).some((i) => i.message.includes("renfort")));
  delete e.rules!.reinforcements;
  e.rules!.spawn = { mode: "placement", x: 6.2 };
  assert.ok(errors(p).some((i) => i.message.includes("centre")));
  e.rules!.spawn = { mode: "arrival", x: 8.45 };
  e.speed = 0;
  assert.ok(errors(p).some((i) => i.message.includes("vitesse")));
  e.rules!.spawn.x = 6.8;
  assert.deepEqual(errors(p), []);
});
for (const interval of [0, -1, 3601, NaN])
  test("generation interval " + interval + " cannot reach publication", () => {
    const p = fixture();
    p.balance.enemies.find(
      (e) => e.id === "plaque",
    )!.rules!.reinforcements!.interval = interval;
    assert.ok(errors(p).length);
  });
test("changing deployment updates referenced wave groups atomically and preserves occupied boards", () => {
  const p = fixture(),
    e = duplicateEnemy(p, "runner"),
    l = newLevel(["radish"], e.id),
    placed = newLevel(["radish"], e.id);
  placed.objective.type = "occupied_board";
  placed.waves[0].groups = [placedGroup(e.id, 1, 4)];
  p.levels = [l, placed];
  delete p.campaign;
  updateEnemyRules(p, e.id, {
    ...enemyRules(e),
    spawn: { mode: "placement", x: 5.5 },
  });
  assert.equal(l.waves[0].groups[0].placement!.colMin, 5);
  assert.equal(placed.waves[0].groups[0].placement!.colMin, 4);
  updateEnemyRules(p, e.id, {
    ...enemyRules(e),
    spawn: { mode: "arrival", x: 8.45 },
  });
  assert.equal(l.waves[0].groups[0].placement, undefined);
  assert.equal(placed.waves[0].groups[0].placement!.colMin, 4);
  assert.deepEqual(errors(p), []);
});
test("disabling generation removes its optional object instead of leaving an invalid undefined field", () => {
  const p = fixture(),
    e = p.balance.enemies.find((e) => e.id === "plaque")!;
  updateEnemyRules(p, e.id, { ...enemyRules(e), reinforcements: undefined });
  assert.ok(!Object.hasOwn(e.rules!, "reinforcements"));
  assert.deepEqual(errors(p), []);
});
test("wave groups and objective conversions use the copied placement property", () => {
  const p = fixture(),
    e = duplicateEnemy(p, "poubelle"),
    group = {
      id: newId("group"),
      enemyId: e.id,
      count: 1,
      lane: 3,
      start: 0,
      interval: 1,
    };
  const placed = groupForEnemy(group, e);
  assert.equal(placed.placement!.rowMin, 3);
  const w = { id: newId("wave"), groups: [placed] };
  assert.deepEqual(
    convertWavePlacement(w, false, p.balance.enemies).groups[0].placement,
    placed.placement,
  );
  assert.equal(mobileReinforcement(e), false);
});
test("the retired rescue target flag is rejected", () => {
 const p=fixture();(p.balance.enemies[0].rules as any).rescueTarget=true;
 assert.ok(errors(p).length>0);
});
test("an arbitrary placed species can carry the focus objective and its override", () => {
  const p = fixture(),
    e = duplicateEnemy(p, "plaque"),
    l = newLevel(["radish"], "litterer");
  l.objective = { type: "invasive_foci", target: 0 };
  l.invasiveFoci = { ...defaultInvasiveFoci(), focusEnemyId: e.id };
  p.levels = [l];
  delete p.campaign;
  assert.deepEqual(errors(p), []);
  l.invasiveFoci.focusEnemyId = "runner";
  assert.ok(errors(p).some((i) => i.message.includes("foyer immobile")));
});
test("catalog size limits reject a duplicate before mutating the source document", () => {
  const p = fixture();
  while (p.balance.enemies.length < 128) {
    const e = structuredClone(p.balance.enemies[0]);
    e.id = newId("enemy");
    p.balance.enemies.push(e);
  }
  const before = JSON.stringify(p);
  assert.throws(() => duplicateEnemy(p, p.balance.enemies[0].id), /128/);
  assert.equal(JSON.stringify(p), before);
});
test("summaries read current targets and periods rather than naming a specific species", () => {
  const p = fixture(),
    e = duplicateEnemy(p, "plaque");
  e.rules!.reinforcements = { enemyId: "litterer", interval: 12 };
  const summary = enemyRulesSummary(e, p.balance.enemies).join(" ");
  assert.match(summary, /12 s/);
  assert.match(summary, /Jeteur de déchets/);
  assert.doesNotMatch(summary, /30|Canette/);
});
test("custom enemies, rules and owned art roundtrip in drafts, saves and compiled campaigns", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "lunaria-enemy-rules-"));
  try {
    const p = fixture(),
      e = duplicateEnemy(p, "poubelle");
    e.rules!.reinforcements = { enemyId: "runner", interval: 17 };
    assert.deepEqual(parseGameDraft(p), p);
    const docs = new GameDocuments(root),
      saved = await docs.save(p, "", path.join(root, "game.json"));
    assert.deepEqual((await docs.open(saved.path)).project, p);
    assert.deepEqual(
      compileCampaign(p).balance.enemies.find((x) => x.id === e.id)!.rules,
      e.rules,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
