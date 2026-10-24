// Cross-engine regression: Studio-authored private behaviors, real Godot decisions and targeting.
// Run after npm test; never writes the author's project, publication or player profile.
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { seedProject } from "../dist-tests/src/shared/game/seed.js";
import { parseGameProject } from "../dist-tests/src/shared/game/validation.js";
import {
  editOwnerBehavior,
  ownerBehavior,
} from "../dist-tests/src/shared/game/behaviorAuthoring.js";
import {
  newPhase,
  newRule,
  selectPhase,
  chooseRule,
} from "../dist-tests/src/shared/game/logic.js";
import { phaseAbilities } from "../dist-tests/src/shared/game/behaviorPreview.js";

const args = process.argv.slice(2),
  option = (name, fallback) =>
    args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const game = path.resolve(option("--game", "C:/dev/Lunaria/game"));
const godot = option(
  "--godot",
  process.env.GODOT_BIN ||
    "C:/Program Files/Godot/Godot_v4.7.2-stable_win64_console.exe",
);
const out = option("--out", "");
const dir = await fs.mkdtemp(
  path.join(os.tmpdir(), "lunaria-behavior-parity-"),
);
try {
  const project = parseGameProject(seedProject());
  for (const [index, ownerId] of [
    "fern",
    "hazel",
    "litterer",
    "runner",
    "collector",
  ].entries()) {
    const owner = [...project.balance.plants, ...project.balance.enemies].find(
      (s) => s.id === ownerId,
    );
    editOwnerBehavior(project, ownerId, (b) => {
      b.mode = index === 1 || index === 3 ? "automatic" : "priority";
      b.stopToAttack = index !== 3;
      b.phases = [0, 1, 2].map((i) => ({
        ...newPhase(i),
        healthBelow: [100, 66, 33][i],
        inheritAbilities: i === 0,
        abilityIds: i === 1 ? owner.ability_ids.slice(0, 1) : [],
        onEnter: [{ type: "message", delay: 0, text: "Entrée " + i }],
      }));
      b.rules = [
        {
          ...newRule(),
          name: "Seuil de santé",
          action: b.team === "plants" ? "hold" : "retreat",
          conditions: [{ kind: "health", op: "lte", value: 25, ref: "" }],
        },
        {
          ...newRule(),
          name: "Capacité du porteur",
          abilityId: owner.ability_ids[0] || "",
          conditions: [
            {
              kind: "ready",
              op: "eq",
              value: 1,
              ref: owner.ability_ids[0] || "",
            },
          ],
        },
        {
          ...newRule(),
          name: "Toute capacité prête avec cible",
          conditions: [
            { kind: "ready", op: "eq", value: 1, ref: "" },
            { kind: "target", op: "eq", value: 1, ref: "" },
            { kind: "time", op: "gte", value: 10, ref: "" },
            { kind: "energy", op: "gte", value: 1, ref: "" },
          ],
        },
      ];
    });
  }
  parseGameProject(project);
  const source = path.join(dir, "project.game.json"),
    report = path.join(dir, "native.json");
  await fs.writeFile(source, JSON.stringify(project));
  const native = await new Promise((resolve, reject) => {
    const child = spawn(
      godot,
      [
        "--headless",
        "--audio-driver",
        "Dummy",
        "--path",
        game,
        "--script",
        "res://tests/behavior_authoring_smoke.gd",
        "--",
        "--studio-capability-workshop",
        "--studio-content=" + source,
        "--behavior-report=" + report,
      ],
      {
        windowsHide: true,
        env: {
          ...process.env,
          APPDATA: dir,
          XDG_CONFIG_HOME: dir,
          XDG_DATA_HOME: dir,
        },
      },
    );
    let output = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(Error("Godot timed out"));
    }, 60000);
    for (const stream of [child.stdout, child.stderr])
      stream.on("data", (chunk) => {
        output += chunk;
        if (/SCRIPT ERROR:/.test(output)) child.kill();
      });
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      code === 0 && !/^ERROR:|SCRIPT ERROR:/m.test(output)
        ? resolve(output)
        : reject(Error(output));
    });
  });
  const result = JSON.parse(await fs.readFile(report, "utf8"));
  assert.equal(result.failures, 0);
  assert.equal(result.records.length, 160);
  let comparisons = 0;
  for (const record of result.records) {
    const owner = [...project.balance.plants, ...project.balance.enemies].find(
        (s) => s.id === record.ownerId,
      ),
      b = ownerBehavior(project, record.ownerId);
    const context = {
      ...record,
      ready: (id) => record.ready[id] ?? false,
      target: (id) => record.target[id] ?? false,
      hostile: (id) =>
        project.combat.abilities.find((a) => a.id === id).target === "opponent",
    };
    const phase = selectPhase(b, record.health, Math.max(0, record.before));
    assert.equal(phase, record.phase, record.ownerId + " phase");
    const candidates = phaseAbilities(owner, b.phases[phase], record.disabled);
    assert.deepEqual(
      candidates,
      record.candidates,
      record.ownerId + " candidates",
    );
    assert.deepEqual(
      chooseRule(b, context, candidates),
      record.decision,
      record.ownerId + " decision at " + record.health + "%",
    );
    comparisons += 3;
  }
  if (out) {
    await fs.mkdir(out, { recursive: true });
    await fs.writeFile(
      path.join(out, "behavior-parity.json"),
      JSON.stringify({ ...result, comparisons }, null, 2),
    );
    await fs.writeFile(path.join(out, "behavior-parity.log"), String(native));
  }
  console.log(String(native).trim());
  console.log(
    "STUDIO_GODOT_BEHAVIORS cases=" +
      result.records.length +
      " comparisons=" +
      comparisons +
      " failures=0",
  );
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
