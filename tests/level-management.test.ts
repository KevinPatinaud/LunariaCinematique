import test from "node:test";
import assert from "node:assert/strict";
import { seedProject } from "../src/shared/game/seed.js";
import {
  newLevel,
  OBJECTIVES,
  defaultEscort,
  defaultInvasiveFoci,
} from "../src/shared/game/types.js";
import {
  parseGameProject,
  parseGameDraft,
} from "../src/shared/game/validation.js";
import { compileCampaign } from "../src/shared/game/campaign.js";
import {
  afterLevel,
  createProjectLevel,
  duplicateProjectLevel,
  deleteProjectLevel,
  placeLevel,
  patchProjectLevel,
  levelPosition,
  orderedLevels,
  levelRewardSummary,
} from "../src/shared/game/levelManagement.js";
import {
  objectiveText,
  setObjectiveTextMode,
  planObjectiveChange,
} from "../src/shared/game/levelObjectives.js";
function project() {
  const p = seedProject(),
    a = newLevel(["radish", "rose"], "runner"),
    b = newLevel(["rose"], "runner"),
    off = newLevel(["radish"], "runner");
  a.title = "A";
  b.title = "B";
  off.title = "Réserve";
  p.levels = [b, off, a];
  p.campaign = {
    cinematics: [
      {
        id: "film",
        documentId: "film_doc",
        title: "Entre les niveaux",
        file: "film.json",
      },
    ],
    steps: [
      { id: "first", kind: "level", levelId: a.id },
      { id: "movie", kind: "cinematic", cinematicId: "film", skippable: true },
      { id: "last", kind: "level", levelId: b.id },
    ],
  };
  return { p, a, b, off };
}
test("library order follows playback without mutating author order and includes unused levels", () => {
  const { p, a, b, off } = project(),
    before = JSON.stringify(p);
  assert.deepEqual(
    orderedLevels(p).map((l) => l.title),
    ["A", "B", "Réserve"],
  );
  assert.equal(levelPosition(p, a.id).number, 1);
  assert.equal(levelPosition(p, b.id).number, 2);
  assert.equal(levelPosition(p, b.id).index, 2);
  assert.equal(levelPosition(p, off.id).index, -1);
  assert.equal(JSON.stringify(p), before);
});
test("duplicate preserves content and inserts immediately after its source, before the following film", () => {
  const { p, a, b } = project(),
    old = structuredClone(a),
    id = duplicateProjectLevel(p, a.id, afterLevel(p, a.id), "A bis"),
    copy = p.levels.find((l) => l.id === id)!;
  assert.deepEqual(
    p.campaign!.steps.map((s) =>
      s.kind === "level" ? s.levelId : s.kind === "cinematic" ? s.cinematicId : s.id,
    ),
    [a.id, id, "film", b.id],
  );
  assert.deepEqual(a, old);
  assert.notEqual(copy.waves[0].id, a.waves[0].id);
  assert.notEqual(copy.waves[0].groups[0].id, a.waves[0].groups[0].id);
  copy.waves[0].groups[0].count = 99;
  assert.equal(a.waves[0].groups[0].count, 5);
  assert.deepEqual(
    compileCampaign(p).levels.map((l) => l.id),
    [a.id, id, b.id],
  );
});
test("an outside copy stays out of publication and later moves with one stable step identity", () => {
  const { p, a } = project(),
    id = duplicateProjectLevel(p, a.id, { kind: "outside" });
  assert.equal(levelPosition(p, id).index, -1);
  assert.ok(!compileCampaign(p).levels.some((l) => l.id === id));
  const step = placeLevel(p, id, { kind: "campaign", beforeId: "movie" });
  assert.equal(levelPosition(p, id).index, 1);
  placeLevel(p, id, { kind: "campaign", beforeId: null });
  assert.equal(levelPosition(p, id).stepId, step);
  assert.equal(
    p.campaign!.steps.filter((s) => s.kind === "level" && s.levelId === id)
      .length,
    1,
  );
  placeLevel(p, id, { kind: "outside" });
  assert.ok(p.levels.some((l) => l.id === id));
  assert.equal(levelPosition(p, id).index, -1);
});
test("creating on a rail preserves legacy playback order before changing the library", () => {
  const { p, a, b } = project();
  delete p.campaign;
  p.levels = [a, b];
  const id = createProjectLevel(
    p,
    { kind: "campaign", beforeId: "step_" + b.id },
    a.id,
  );
  assert.deepEqual(
    p.campaign!.steps.map((s) => (s.kind === "level" ? s.levelId : "")),
    [a.id, id, b.id],
  );
  assert.equal(
    p.levels.find((l) => l.id === id)!.objectiveTextMode,
    "automatic",
  );
});
test("bad destinations, blank titles and full catalogues fail atomically", () => {
  const { p, a } = project(),
    before = JSON.stringify(p);
  assert.throws(
    () =>
      duplicateProjectLevel(p, a.id, { kind: "campaign", beforeId: "gone" }),
    /n’existe plus/,
  );
  assert.equal(JSON.stringify(p), before);
  assert.throws(
    () => duplicateProjectLevel(p, a.id, { kind: "outside" }, ""),
    /titre/,
  );
  assert.equal(JSON.stringify(p), before);
  while (p.campaign!.steps.length < 1000)
    p.campaign!.steps.push({
      id: "extra_" + p.campaign!.steps.length,
      kind: "cinematic",
      cinematicId: "film",
      skippable: true,
    });
  const full = JSON.stringify(p);
  assert.throws(
    () => createProjectLevel(p, { kind: "campaign", beforeId: null }),
    /1 000/,
  );
  assert.equal(JSON.stringify(p), full);
  placeLevel(p, a.id, { kind: "campaign", beforeId: null });
  assert.equal(p.campaign!.steps.length, 1000);
  while (p.levels.length < 200)
    p.levels.push({ ...structuredClone(a), id: "extra_" + p.levels.length });
  const cap = JSON.stringify(p);
  assert.throws(
    () => duplicateProjectLevel(p, a.id, { kind: "outside" }),
    /200/,
  );
  assert.equal(JSON.stringify(p), cap);
});
test("deleting one level removes only its own campaign reference", () => {
  const { p, a, b, off } = project();
  deleteProjectLevel(p, a.id);
  assert.deepEqual(
    p.campaign!.steps.map((s) => s.id),
    ["movie", "last"],
  );
  assert.deepEqual(
    p.levels.map((l) => l.id),
    [b.id, off.id],
  );
  assert.equal(p.campaign!.cinematics.length, 1);
});
test('creating a level with a fixed first active enemy prepares its required placement',()=>{
 const {p}=project();for(const enemy of p.balance.enemies)enemy.archived=enemy.id!=='plaque';
 const id=createProjectLevel(p,{kind:'outside'}),level=p.levels.find(l=>l.id===id)!;
 assert.equal(level.waves[0].groups[0].enemyId,'plaque');assert.ok(level.waves[0].groups[0].placement);parseGameProject(p);
});
test("old instructions stay authored even when they equal a default; automatic/custom is explicit", () => {
  const { p, a } = project();
  delete a.objectiveTextMode;
  a.objectiveText = "Repousser les vagues.";
  for (const type of OBJECTIVES) {
    const plan = planObjectiveChange(a, type, p.balance.enemies);
    assert.equal(plan.next.objectiveText, a.objectiveText);
    assert.equal(plan.next.objectiveTextMode, undefined);
  }
  setObjectiveTextMode(a, true);
  const next = planObjectiveChange(a, "escort", p.balance.enemies).next;
  assert.match(objectiveText(next), /pousses/);
  setObjectiveTextMode(next, false);
  const text = objectiveText(next);
  assert.equal(
    planObjectiveChange(next, "defend", p.balance.enemies).next.objectiveText,
    text,
  );
});
test("all 64 objective transitions preserve enemies, terrain and prose and explain conversions/removals", () => {
  const { p, a } = project();
  a.terrainImage = "library://terrain.png";
  a.objectiveText = "Texte personnel";
  a.objectiveTextMode = "custom";
  for (const from of OBJECTIVES)
    for (const to of OBJECTIVES) {
      const level = structuredClone(a);
      level.objective.type = from;
      if (from === "escort") level.escort = defaultEscort();
      if (from === "invasive_foci") level.invasiveFoci = defaultInvasiveFoci();
      if (from === "protect_cell")
        level.protectedCell = {
          row: 2,
          col: 1,
          image: "library://target.png",
          maxHp: 300,
          armor: 0,
          resistances: { physical: 0, piercing: 0, toxic: 0 },
        };
      const before = JSON.stringify(level),
        plan = planObjectiveChange(level, to, p.balance.enemies);
      assert.equal(JSON.stringify(level), before);
      assert.equal(plan.next.terrainImage, a.terrainImage);
      assert.equal(plan.next.objectiveText, "Texte personnel");
      assert.deepEqual(
        plan.next.waves.flatMap((w) =>
          w.groups.map((g) => [g.enemyId, g.count, g.id]),
        ),
        level.waves.flatMap((w) =>
          w.groups.map((g) => [g.enemyId, g.count, g.id]),
        ),
      );
      if (from !== to) {
        assert.equal(!!plan.next.escort, to === "escort");
        assert.equal(!!plan.next.invasiveFoci, to === "invasive_foci");
        assert.equal(!!plan.next.protectedCell, to === "protect_cell");
        if (
          from === "occupied_board" ||
          to === "occupied_board" ||
          ["escort", "invasive_foci", "protect_cell"].includes(from)
        )
          assert.equal(plan.requiresReview, true);
      }
    }
});
test("applying an objective patch really deletes the obsolete configuration", () => {
  const { p, a } = project();
  a.objective = { type: "escort", target: 0 };
  a.escort = defaultEscort();
  const { next } = planObjectiveChange(a, "defend", p.balance.enemies);
  patchProjectLevel(p, a.id, {
    ...next,
    escort: next.escort,
    invasiveFoci: next.invasiveFoci,
    protectedCell: next.protectedCell,
  });
  assert.ok(!Object.hasOwn(a, "escort"));
  assert.equal(a.objective.type, "defend");
});
test("publication resolves automatic instructions without rewriting authored prose or the source project", () => {
  const { p, a, b } = project();
  a.objectiveTextMode = "automatic";
  a.objective = { type: "advance", target: 0 };
  a.objectiveText = "Stale snapshot";
  b.objectiveText = "Même texte rédigé";
  delete b.objectiveTextMode;
  const before = JSON.stringify(p),
    compiled = compileCampaign(p);
  assert.equal(compiled.levels[0].objectiveText, "Conquérir les cinq allées.");
  assert.equal(compiled.levels[1].objectiveText, b.objectiveText);
  assert.equal(JSON.stringify(p), before);
  parseGameProject(compiled);
});
test("text mode validates structurally and draft parsing never guesses from prose", () => {
  const { p, a } = project();
  assert.equal(
    parseGameProject(p).levels.find((l) => l.id === a.id)!.objectiveTextMode,
    "automatic",
  );
  a.objectiveTextMode = "bad" as "custom";
  assert.throws(() => parseGameDraft(p), /structure invalide/);
  delete a.objectiveTextMode;
  assert.equal(
    parseGameDraft(p).levels.find((l) => l.id === a.id)!.objectiveTextMode,
    undefined,
  );
});
test("reward comparison honors explicit zero, omitted defaults and objective-specific captures", () => {
  const { a } = project();
  a.waves[0].seedReward = 0;
  a.waves.push({
    ...structuredClone(a.waves[0]),
    id: "second",
    seedReward: undefined,
  });
  a.laneCaptureSeedReward = 18;
  assert.deepEqual(levelRewardSummary(a), {
    waves: [0, 50],
    waveTotal: 50,
    capture: 0,
  });
  a.objective.type = "advance";
  assert.equal(levelRewardSummary(a).capture, 18);
});
