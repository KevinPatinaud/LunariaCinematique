import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { seedProject } from "../src/shared/game/seed.js";
import { parseGameProject, gameIssues } from "../src/shared/game/validation.js";
import {
  assignBehavior,
  behaviorCompatibility,
  behaviorUsers,
  copyBehavior,
  createBehavior,
  detachBehavior,
  duplicateBehavior,
  editOwnerBehavior,
  ownerBehavior,
  appendPhase,
  removeBehavior,
  removePhase,
} from "../src/shared/game/behaviorAuthoring.js";
import {
  advanceBehaviorPreview,
  initialBehaviorPreview,
  inspectOwnerBehavior,
  phaseAbilities,
} from "../src/shared/game/behaviorPreview.js";
import {
  chooseRule,
  explainDecision,
  newRule,
  possibleAbilities,
  type LogicContext,
} from "../src/shared/game/logic.js";
import { personalizeAbility } from "../src/shared/game/combatAuthoring.js";
import { GameDocuments } from "../src/main/gameDocuments.js";
const fixture = () => parseGameProject(seedProject());
const ctx = (extra: Partial<LogicContext> = {}): LogicContext => ({
  health: 100,
  time: 20,
  wave: 1,
  enemies: 3,
  energy: 100,
  variables: {},
  ready: () => true,
  target: () => true,
  hostile: () => true,
  ...extra,
});
test("first personal change detaches only its owner and preserves every other behavior user", () => {
  const p = fixture(),
    old = structuredClone(p),
    source = ownerBehavior(p, "ivy"),
    users = behaviorUsers(p, source.id);
  assert.ok(users.length > 1);
  const id = editOwnerBehavior(p, "ivy", (b) => {
    appendPhase(b);
  });
  assert.notEqual(id, source.id);
  assert.equal(ownerBehavior(p, "ivy").phases.length, 2);
  assert.deepEqual(
    p.logic!.behaviors.find((b) => b.id === source.id),
    old.logic!.behaviors.find((b) => b.id === source.id),
  );
  assert.deepEqual(
    p.balance.plants.filter((s) => s.id !== "ivy"),
    old.balance.plants.filter((s) => s.id !== "ivy"),
  );
  assert.equal(gameIssues(p).filter((i) => i.severity === "error").length, 0);
});
test("no-op and viewing a shared model never create personal data", () => {
  const p = fixture(),
    before = JSON.stringify(p),
    id = ownerBehavior(p, "ivy").id;
  assert.equal(
    editOwnerBehavior(p, "ivy", () => {}),
    id,
  );
  assert.equal(JSON.stringify(p), before);
});

test("duplicating a library model is independent and enforces the catalog limit before mutation", () => {
  const p = fixture(),
    source = ownerBehavior(p, "ivy"),
    before = structuredClone(source),
    copy = duplicateBehavior(p, source.id);
  assert.notEqual(copy.id, source.id);
  copy.description = "Une copie";
  assert.deepEqual(source, before);
  while (p.logic!.behaviors.length < 128) createBehavior(p, "enemies");
  const serialized = JSON.stringify(p);
  assert.throws(() => duplicateBehavior(p, source.id), /128/);
  assert.equal(JSON.stringify(p), serialized);
});
test("later personal changes reuse the private graph and keep IDs stable", () => {
  const p = fixture();
  detachBehavior(p, "ivy");
  const b = ownerBehavior(p, "ivy"),
    before = structuredClone(b),
    count = p.logic!.behaviors.length;
  editOwnerBehavior(p, "ivy", (d) => {
    d.stopToAttack = false;
  });
  assert.equal(p.logic!.behaviors.length, count);
  assert.equal(ownerBehavior(p, "ivy").id, b.id);
  assert.deepEqual(
    ownerBehavior(p, "ivy").phases.map((f) => f.id),
    before.phases.map((f) => f.id),
  );
});
test("personal name is kept as authored instead of appending an owner suffix to typed text", () => {
  const p = fixture();
  editOwnerBehavior(p, "ivy", (b) => {
    b.name = "Liane prudente";
  });
  assert.equal(ownerBehavior(p, "ivy").name, "Liane prudente");
});
test("explicit shared edits keep attribution and affect the selected common model", () => {
  const p = fixture(),
    b = ownerBehavior(p, "ivy"),
    users = behaviorUsers(p, b.id).map((s) => s.id),
    length = p.logic!.behaviors.length;
  editOwnerBehavior(
    p,
    "ivy",
    (d) => {
      d.description = "Commun";
    },
    true,
  );
  assert.equal(p.logic!.behaviors.length, length);
  assert.deepEqual(
    behaviorUsers(p, b.id).map((s) => s.id),
    users,
  );
  assert.ok(users.every((id) => ownerBehavior(p, id).description === "Commun"));
});
test("copying a model gives every rule and phase a new identity and independent nested data", () => {
  const p = fixture(),
    b = createBehavior(p, "enemies", "retreat");
  b.phases[0].onEnter = [{ type: "message", delay: 0, text: "Entrée" }];
  const copy = copyBehavior(b);
  assert.notEqual(copy.id, b.id);
  assert.notEqual(copy.rules[0].id, b.rules[0].id);
  assert.notEqual(copy.phases[0].id, b.phases[0].id);
  copy.rules[0].conditions[0].value = 10;
  copy.phases[0].onEnter[0].text = "Copie";
  assert.equal(b.rules[0].conditions[0].value, 25);
  assert.equal(b.phases[0].onEnter[0].text, "Entrée");
});
test("applying a model copies by default; sharing and detaching are explicit", () => {
  const p = fixture(),
    source = ownerBehavior(p, "ivy"),
    copyId = assignBehavior(p, "ivy", source.id);
  assert.notEqual(copyId, source.id);
  assignBehavior(p, "ivy", source.id, true);
  assert.equal(ownerBehavior(p, "ivy").id, source.id);
  assert.notEqual(detachBehavior(p, "ivy"), source.id);
});
test("opposite teams and models requiring absent abilities cannot be assigned", () => {
  const p = fixture(),
    before = JSON.stringify(p);
  assert.throws(() => assignBehavior(p, "ivy", "ai_ground"), /autre camp/);
  assert.equal(JSON.stringify(p), before);
  const b = createBehavior(p, "plants");
  b.mode = "priority";
  b.rules = [
    {
      ...newRule(),
      abilityId: p.balance.plants.find((s) => s.id === "hazel")!
        .ability_ids![0],
    },
  ];
  assert.ok(behaviorCompatibility(p, "ivy", b).length);
  assert.throws(() => assignBehavior(p, "ivy", b.id), /capacités absentes/);
});
test("phase-provided capabilities make a model compatible without changing the species base list", () => {
  const p = fixture(),
    b = createBehavior(p, "plants");
  b.mode = "priority";
  const id = p.balance.plants.find((s) => s.id === "hazel")!.ability_ids![0];
  b.phases[0].abilityIds = [id];
  b.rules = [{ ...newRule(), abilityId: id }];
  const original = [
    ...p.balance.plants.find((s) => s.id === "ivy")!.ability_ids!,
  ];
  assignBehavior(p, "ivy", b.id);
  assert.deepEqual(
    behaviorCompatibility(p, "ivy", ownerBehavior(p, "ivy")),
    [],
  );
  assert.deepEqual(
    p.balance.plants.find((s) => s.id === "ivy")!.ability_ids,
    original,
  );
});
test("self actions lose a source-species restriction when copied to a new owner", () => {
  const p = fixture(),
    b = createBehavior(p, "plants");
  b.phases[0].onEnter = [
    {
      type: "movement",
      delay: 0,
      target: "self",
      speciesId: "radish",
      speedFactor: 1,
      attackFactor: 1,
      duration: 1,
    },
  ];
  assignBehavior(p, "ivy", b.id);
  assert.equal(ownerBehavior(p, "ivy").phases[0].onEnter[0].speciesId, "");
  assert.equal(b.phases[0].onEnter[0].speciesId, "radish");
});
test("a model with live users cannot be deleted; a free model can", () => {
  const p = fixture();
  assert.throws(
    () => removeBehavior(p, ownerBehavior(p, "ivy").id),
    /Encore utilisé/,
  );
  const b = createBehavior(p, "plants");
  removeBehavior(p, b.id);
  assert.ok(!p.logic!.behaviors.some((x) => x.id === b.id));
});
test("the catalog limit rejects cloning without altering attribution", () => {
  const p = fixture();
  while (p.logic!.behaviors.length < 128) createBehavior(p, "plants");
  const before = JSON.stringify(p);
  assert.throws(() => detachBehavior(p, "ivy"), /128/);
  assert.equal(JSON.stringify(p), before);
  assert.throws(() => createBehavior(p, "enemies"), /128/);
});
test("phase creation stays bounded, descending and keeps the initial phase", () => {
  const p = fixture(),
    b = createBehavior(p, "enemies");
  while (b.phases.at(-1)!.healthBelow > 0) appendPhase(b);
  assert.deepEqual(
    b.phases.map((f) => f.healthBelow),
    [100, 75, 50, 25, 0],
  );
  assert.throws(() => appendPhase(b), /supplémentaire/);
  assert.throws(() => removePhase(b, b.phases[0].id), /initiale/);
  removePhase(b, b.phases[2].id);
  assert.deepEqual(
    b.phases.map((f) => f.healthBelow),
    [100, 75, 25, 0],
  );
});
for (const template of ["automatic", "boss", "retreat"] as const)
  test("new " + template + " model respects the contract", () => {
    const p = fixture();
    createBehavior(p, "enemies", template);
    assert.doesNotThrow(() => parseGameProject(p));
  });
test("plants cannot receive a retreat template", () => {
  const p = fixture();
  assert.throws(() => createBehavior(p, "plants", "retreat"), /ennemis/);
});
test("preview uses the chosen owner rather than the first shared model user", () => {
  const p = fixture(),
    b = ownerBehavior(p, "ivy"),
    result = inspectOwnerBehavior(
      p,
      "ivy",
      b,
      initialBehaviorPreview(),
      ctx(),
    );
  assert.equal(result.owner.id, "ivy");
  assert.deepEqual(
    result.candidates,
    p.balance.plants.find((s) => s.id === "ivy")!.ability_ids,
  );
  assert.notDeepEqual(result.candidates, p.balance.plants[0].ability_ids);
});
test("preview applies phase replacements, disabled abilities, and per-ability target/readiness", () => {
  const p = fixture(),
    b = createBehavior(p, "plants", "boss"),
    owner = p.balance.plants.find((s) => s.id === "ivy")!,
    id = owner.ability_ids![0],
    other = p.balance.plants[0].ability_ids![0];
  b.phases[1].inheritAbilities = false;
  b.phases[1].abilityIds = [other];
  let state = advanceBehaviorPreview(b, initialBehaviorPreview(), 60);
  let result = inspectOwnerBehavior(
    p,
    "ivy",
    b,
    state,
    ctx({ health: 60, ready: (ability) => ability !== other }),
  );
  assert.deepEqual(result.candidates, [other]);
  assert.deepEqual(result.decision.abilities, []);
  result = inspectOwnerBehavior(p, "ivy", b, state, ctx(), [other]);
  assert.deepEqual(result.candidates, []);
  assert.deepEqual(phaseAbilities(owner, b.phases[0]), [id]);
});
test("large hits enter every crossed phase once; healing keeps the current phase; reset starts over", () => {
  const p = fixture(),
    b = createBehavior(p, "enemies", "boss");
  let state = advanceBehaviorPreview(b, initialBehaviorPreview(), 20);
  assert.deepEqual(
    state.entered,
    b.phases.map((f) => f.id),
  );
  const before = structuredClone(state);
  state = advanceBehaviorPreview(b, state, 100);
  assert.deepEqual(state, before);
  state = advanceBehaviorPreview(b, state, 10);
  assert.deepEqual(state, before);
  assert.equal(
    advanceBehaviorPreview(b, initialBehaviorPreview(), 100).phaseId,
    b.phases[0].id,
  );
});
test("a dead actor neither enters new phases nor produces decisions", () => {
  const p = fixture(),
    b = createBehavior(p, "plants", "boss"),
    state = advanceBehaviorPreview(b, initialBehaviorPreview(), 100);
  assert.deepEqual(advanceBehaviorPreview(b, state, 0), state);
  const result = inspectOwnerBehavior(p, "ivy", b, state, ctx({ health: 0 }));
  assert.equal(result.active, false);
  assert.deepEqual(result.decision.abilities, []);
});
test("an empty active-capability condition is false rather than testing a fake empty ID", () => {
  const p = fixture(),
    b = createBehavior(p, "enemies");
  b.mode = "priority";
  b.rules = [
    {
      ...newRule(),
      conditions: [{ kind: "ready", op: "eq", value: 1, ref: "" }],
      action: "retreat",
    },
  ];
  assert.equal(chooseRule(b, ctx(), []).ruleId, "");
  assert.equal(chooseRule(b, ctx(), ["a"]).ruleId, b.rules[0].id);
});
test("a condition on an attributed but inactive phase capacity cannot use readiness from another phase", () => {
  const p = fixture(),
    b = createBehavior(p, "enemies");
  b.mode = "priority";
  b.rules = [
    {
      ...newRule(),
      conditions: [{ kind: "target", op: "eq", value: 1, ref: "later" }],
      action: "retreat",
    },
  ];
  assert.equal(chooseRule(b, ctx(), ["now"]).ruleId, "");
});
test("decision trace distinguishes conditions, inactive capabilities, cooldown, target and lower priorities", () => {
  const p = fixture(),
    b = createBehavior(p, "enemies");
  b.mode = "priority";
  b.rules = [
    {
      ...newRule(),
      conditions: [{ kind: "health", op: "lt", value: 10, ref: "" }],
    },
    { ...newRule(), abilityId: "absent" },
    { ...newRule(), abilityId: "cooldown" },
    { ...newRule(), abilityId: "targetless" },
    { ...newRule(), abilityId: "ok" },
    { ...newRule(), action: "retreat" },
  ];
  const context = ctx({
    ready: (id) => id !== "cooldown",
    target: (id) => id !== "targetless",
  });
  const result = explainDecision(b, context, ["cooldown", "targetless", "ok"]);
  assert.deepEqual(
    result.trace.map((x) => x.status),
    [
      "conditions",
      "unavailable",
      "cooldown",
      "target",
      "selected",
      "lower_priority",
    ],
  );
  assert.deepEqual(
    result.decision,
    chooseRule(b, context, ["cooldown", "targetless", "ok"]),
  );
});
test("support capabilities do not trigger stop-to-attack and explicit movement wins", () => {
  const p = fixture(),
    b = createBehavior(p, "enemies");
  assert.equal(
    chooseRule(b, ctx({ hostile: () => false }), ["heal"]).movement,
    "advance",
  );
  b.mode = "priority";
  b.rules = [{ ...newRule(), action: "retreat" }];
  assert.equal(chooseRule(b, ctx(), ["heal"]).movement, "retreat");
});
test("personalizing a capability updates its behavior without accumulating unused private models", () => {
  const p = fixture(),
    owner = p.balance.plants.find((s) => s.id === "ivy")!,
    id = owner.ability_ids![0];
  editOwnerBehavior(p, owner.id, (b) => {
    b.mode = "priority";
    b.rules = [{ ...newRule(), abilityId: id }];
  });
  const before = p.logic!.behaviors.length,
    beforeId = owner.behaviorId;
  const ability = personalizeAbility(p, owner.id, id);
  assert.equal(p.logic!.behaviors.length, before);
  assert.equal(owner.behaviorId, beforeId);
  assert.equal(ownerBehavior(p, owner.id).rules[0].abilityId, ability.id);
  assert.ok(possibleAbilities(p, owner).includes(ability.id));
  assert.doesNotThrow(() => parseGameProject(p));
});
test("a personal behavior survives save, recovery and reopen without rewriting shared users", async () => {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "lunaria-behavior-authoring-"),
  );
  try {
    const p = fixture(),
      old = structuredClone(p);
    editOwnerBehavior(p, "ivy", (b) => {
      appendPhase(b);
      b.phases[1].name = "Liane renforcée";
    });
    const d = new GameDocuments(root),
      file = await d.save(p, "", path.join(root, "project.game.json"));
    assert.deepEqual((await d.open(file.path)).project, p);
    await d.recover(p);
    assert.deepEqual((await d.bootstrap()).recovery, p);
    assert.deepEqual(
      p.balance.plants.filter((s) => s.id !== "ivy"),
      old.balance.plants.filter((s) => s.id !== "ivy"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
