import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { seedProject } from "../src/shared/game/seed.js";
import { parseGameProject, gameIssues } from "../src/shared/game/validation.js";
import {
  removeOwnerAbility,
  cloneAbility,
  personalizeAbility,
  hasSharedDependencies,
  createAbility,
} from "../src/shared/game/combatAuthoring.js";
import { combatReferences } from "../src/shared/game/combat.js";
import { mechanicEffectIds } from "../src/shared/game/combatMechanics.js";
import {
  prepareCapabilityWorkshop,
  launchCapabilityWorkshop,
} from "../src/main/capabilityWorkshop.js";
import { EventEmitter } from "node:events";
import type { ChildProcess, SpawnOptions } from "node:child_process";
const fixture = () => parseGameProject(seedProject());

test("workshop launcher opens a visible Godot window with isolated content arguments", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "lunaria-workshop-launch-"));
  try {
    await mkdir(path.join(root, "tools"));
    await writeFile(path.join(root, "tools", "capability_workshop.gd"), "");
    let captured:
      | { command: string; args: string[]; options: SpawnOptions }
      | undefined;
    let unreferenced = false;
    await launchCapabilityWorkshop(
      "Godot.exe",
      root,
      path.join(root, "unsaved project.json"),
      "fern",
      "ab_private",
      "litterer",
      (command, args, options) => {
        captured = { command, args, options };
        const child = Object.assign(new EventEmitter(), {
          unref: () => {
            unreferenced = true;
          },
        });
        queueMicrotask(() => child.emit("spawn"));
        return child as ChildProcess;
      },
    );
    assert.equal(captured!.options.windowsHide, false);
    assert.equal(captured!.options.shell, undefined);
    assert.ok(captured!.args.includes("--studio-capability-workshop"));
    assert.ok(
      captured!.args.includes(
        "--studio-content=" + path.join(root, "unsaved project.json"),
      ),
    );
    assert.ok(captured!.args.includes("--ability=ab_private"));
    assert.equal(unreferenced, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("complete copies own effects, projectile and reaction dependencies; mechanics survive arbitrary IDs", () => {
  const p = fixture();
  for (const id of [
    "ab_fern",
    "ab_rose_combo",
    "ab_nettle",
    "ab_radish_ricochet",
    "ab_ivy_trap",
  ]) {
    const source = p.combat!.abilities.find((a) => a.id === id)!,
      before = structuredClone(source);
    const copy = cloneAbility(p, id);
    assert.notEqual(copy.id, id);
    assert.equal(copy.effects.length, source.effects.length);
    for (let i = 0; i < source.effects.length; i++) {
      assert.notEqual(copy.effects[i], source.effects[i]);
      const effect = p.combat!.effects.find((e) => e.id === copy.effects[i])!,
        original = p.combat!.effects.find((e) => e.id === source.effects[i])!;
      assert.deepEqual({ ...effect, id: original.id }, original);
    }
    for (const reaction of mechanicEffectIds(copy.mechanics))
      assert.ok(!mechanicEffectIds(source.mechanics).includes(reaction));
    if (source.projectileId)
      assert.notEqual(copy.projectileId, source.projectileId);
    assert.deepEqual(source, before);
  }
  assert.deepEqual(
    gameIssues(p).filter((i) => i.severity === "error"),
    [],
  );
  assert.deepEqual(parseGameProject(JSON.parse(JSON.stringify(p))), p);
});

test("personalizing regeneration leaves other characters and original effects untouched", () => {
  const p = fixture(),
    before = structuredClone(p),
    owner = p.balance.plants.find((x) => x.id === "hazel")!;
  assert.ok(hasSharedDependencies(p, "ab_personal_regeneration"));
  const copy = personalizeAbility(p, owner.id, "ab_personal_regeneration");
  p.combat!.effects.find((e) => e.id === copy.effects[0])!.amount = 9;
  assert.deepEqual(
    p.balance.plants.find((x) => x.id === "baobab"),
    before.balance.plants.find((x) => x.id === "baobab"),
  );
  assert.deepEqual(
    p.combat!.effects.find((x) => x.id === "fx_regen"),
    before.combat!.effects.find((x) => x.id === "fx_regen"),
  );
  assert.deepEqual(owner.ability_ids, [copy.id]);
  assert.equal(hasSharedDependencies(p, copy.id), false);
});

test("personalization remaps private behavior phases, conditions and targeted events", () => {
  const p = fixture(),
    owner = p.balance.plants.find((x) => x.id === "nettle")!,
    b = p.logic!.behaviors.find((b) => b.id === owner.behaviorId)!;
  b.rules = [
    {
      id: "test_rule",
      name: "Test",
      action: "ability",
      abilityId: "ab_nettle",
      conditions: [{ kind: "ready", op: "eq", value: 1, ref: "ab_nettle" }],
    },
  ];
  b.phases[0].abilityIds = ["ab_nettle"];
  const copy = personalizeAbility(p, "nettle", "ab_nettle"),
    local = p.logic!.behaviors.find((b) => b.id === owner.behaviorId)!;
  assert.notEqual(local.id, b.id);
  assert.equal(local.rules[0].abilityId, copy.id);
  assert.equal(local.rules[0].conditions[0].ref, copy.id);
  assert.deepEqual(local.phases[0].abilityIds, [copy.id]);
  assert.equal(b.rules[0].abilityId, "ab_nettle");
});

test("reaction-only effects are protected from deletion and invalid mechanics fail validation", () => {
  const p = fixture();
  assert.ok(
    combatReferences(p, "effects", "fx_rose_recovery").includes(
      "Combo de Rose",
    ) || combatReferences(p, "effects", "fx_rose_recovery").length > 0,
  );
  const guard = p.combat!.abilities.find((a) => a.id === "ab_nettle")!;
  guard.mechanics!.guard!.poisonEffectId = "missing";
  assert.ok(gameIssues(p).some((i) => i.severity === "error"));
});

test("templates create independent playable definitions", () => {
  for (const template of [
    "shot",
    "contact",
    "heal",
    "regeneration",
    "slow",
  ] as const) {
    const p = fixture();
    createAbility(p, template, "fern");
    assert.deepEqual(
      gameIssues(p).filter((i) => i.severity === "error"),
      [],
    );
  }
});

test("workshop snapshot isolates chosen ability and does not mutate the authored campaign", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "lunaria-workshop-"));
  try {
    const p = fixture(),
      before = JSON.stringify(p);
    const file = await prepareCapabilityWorkshop(
      p,
      "fern",
      "ab_fern",
      "litterer",
      root,
    );
    const snapshot = parseGameProject(JSON.parse(await readFile(file, "utf8")));
    assert.equal(JSON.stringify(p), before);
    assert.deepEqual(
      snapshot.balance.plants.find((x) => x.id === "fern")!.ability_ids,
      ["ab_fern"],
    );
    assert.deepEqual(snapshot.levels, []);
    assert.ok(
      snapshot.combat!.effects.find((e) => e.id === "fx_fern_bind")!.binding,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("removing a capability detaches its owner rules and phase activations without changing other owners", () => {
  const p = fixture(),
    owner = p.balance.plants.find((x) => x.id === "rose")!,
    original = p.logic!.behaviors.find((b) => b.id === owner.behaviorId)!;
  original.phases[0].abilityIds = ["ab_rose_combo"];
  original.phases[0].onEnter = [
    {
      type: "use_ability",
      delay: 0,
      target: "self",
      speciesId: "",
      abilityId: "ab_rose_combo",
    },
  ];
  const before = structuredClone(original);
  removeOwnerAbility(p, "rose", "ab_rose_combo");
  const local = p.logic!.behaviors.find((b) => b.id === owner.behaviorId)!;
  assert.deepEqual(owner.ability_ids, []);
  assert.deepEqual(local.phases[0].abilityIds, []);
  assert.deepEqual(local.phases[0].onEnter, []);
  assert.deepEqual(original, before);
  assert.ok(p.combat!.abilities.some((a) => a.id === "ab_rose_combo"));
});

test("a personalized graph includes its own phase and effect actions without requiring another copy", () => {
  const p = fixture(),
    owner = p.balance.plants.find((x) => x.id === "rose")!;
  const b = p.logic!.behaviors.find((b) => b.id === owner.behaviorId)!;
  b.phases[0].abilityIds = ["ab_rose_combo"];
  b.phases[0].onEnter = [
    {
      type: "apply_effect",
      delay: 0,
      target: "self",
      speciesId: "",
      effectId: "fx_rose_recovery",
    },
  ];
  const copy = personalizeAbility(p, "rose", "ab_rose_combo");
  const local = p.logic!.behaviors.find((b) => b.id === owner.behaviorId)!;
  assert.equal(
    local.phases[0].onEnter[0].effectId,
    copy.mechanics!.combo!.recoveryEffectId,
  );
  assert.equal(hasSharedDependencies(p, copy.id, "rose"), false);
  assert.equal(hasSharedDependencies(p, copy.id), false);
  assert.deepEqual(
    gameIssues(p).filter((i) => i.severity === "error"),
    [],
  );
});

test("shared effects are detected by identity even when copies have identical names", () => {
  const p = fixture(),
    original = p.combat!.abilities.find((a) => a.id === "ab_fern")!,
    copy = cloneAbility(p, original.id);
  copy.name = original.name;
  copy.effects = original.effects.slice();
  assert.equal(hasSharedDependencies(p, original.id, "fern"), true);
});
