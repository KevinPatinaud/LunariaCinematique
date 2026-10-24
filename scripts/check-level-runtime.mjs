import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { seedProject } from "../dist-tests/src/shared/game/seed.js";
import { parseGameProject } from "../dist-tests/src/shared/game/validation.js";
import { OBJECTIVES, newId } from "../dist-tests/src/shared/game/types.js";
import {
  createProjectLevel,
  duplicateProjectLevel,
  afterLevel,
} from "../dist-tests/src/shared/game/levelManagement.js";
import {
  planObjectiveChange,
  objectiveText,
} from "../dist-tests/src/shared/game/levelObjectives.js";
import { compileCampaign } from "../dist-tests/src/shared/game/campaign.js";
import { groupForEnemy } from "../dist-tests/src/shared/game/enemyRules.js";
import { newCinematic } from "../dist-tests/src/shared/model.js";
const args = process.argv.slice(2),
  option = (name, fallback) =>
    args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const game = option("--game", "C:/dev/Lunaria/game"),
  godot = option(
    "--godot",
    process.env.GODOT_BIN ||
      "C:/Program Files/Godot/Godot_v4.7.2-stable_win64_console.exe",
  ),
  out = option("--out", "");
const dir = await fs.mkdtemp(
  path.join(os.tmpdir(), "lunaria-level-authoring-"),
);
try {
  const p = seedProject();
  p.levels = [];
  p.campaign = { steps: [], cinematics: [] };
  const film = newCinematic();
  film.title = "Film entre deux niveaux";
  p.cinematics = [film];
  p.campaign.cinematics = [
    {
      id: "test_film",
      title: film.title,
      file: "probe.cinematic.json",
      documentId: film.id,
    },
  ];
  for (const [i, type] of OBJECTIVES.entries()) {
    const id = createProjectLevel(p, { kind: "campaign", beforeId: null }),
      level = p.levels.find((l) => l.id === id),
      next = planObjectiveChange(level, type, p.balance.enemies).next;
    Object.assign(level, next);
    level.title = "Cas " + type;
    if (type === "protect_cell")
      level.protectedCell.image = p.balance.plants[0].visual.sprite.asset;

    level.waves[0].seedReward = i === 0 ? 0 : i * 13;
    if (["advance", "escort"].includes(type)) level.laneCaptureSeedReward = 37;
    if (i % 2 === 0)
      p.campaign.steps.push({
        id: newId("step"),
        kind: "cinematic",
        cinematicId: "test_film",
        skippable: i !== 0,
      });
  }
  const first = p.levels[0];
  duplicateProjectLevel(p, first.id, afterLevel(p, first.id), "Copie jouable");
  duplicateProjectLevel(
    p,
    first.id,
    { kind: "outside" },
    "Réserve non publiée",
  );
  p.levels.reverse();
  const before = JSON.stringify(p),
    published = parseGameProject(compileCampaign(p));
  assert.equal(JSON.stringify(p), before);
  assert.ok(!published.levels.some((l) => l.title === "Réserve non publiée"));
  const file = path.join(dir, "content.json"),
    report = path.join(dir, "native.json");
  await fs.writeFile(file, JSON.stringify(published));
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
        "res://tests/level_authoring_smoke.gd",
        "--",
        "--studio-capability-workshop",
        "--studio-content=" + file,
        "--level-authoring-report=" + report,
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
    let log = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(Error("Godot timed out"));
    }, 60000);
    for (const stream of [child.stdout, child.stderr])
      stream.on("data", (chunk) => {
        log += chunk;
        if (/SCRIPT ERROR:/.test(log)) child.kill();
      });
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      code === 0 && !/^ERROR:|SCRIPT ERROR:/m.test(log)
        ? resolve(log)
        : reject(Error(log));
    });
  });
  const data = JSON.parse(await fs.readFile(report, "utf8"));
  assert.equal(data.failures, 0);
  assert.equal(data.records.length, published.levels.length);
  assert.deepEqual(data.steps, published.campaign.steps);
  for (let i = 0; i < data.records.length; i++) {
    const actual = data.records[i],
      level = published.levels[i];
    assert.equal(actual.id, level.id);
    assert.equal(actual.type, level.objective.type);
    assert.equal(actual.target, level.objective.target);
    assert.equal(actual.text, objectiveText(level));
    assert.deepEqual(actual.waves, level.waves);
    assert.equal(actual.capture, level.laneCaptureSeedReward ?? 0);
  }
  if (out) {
    await fs.mkdir(out, { recursive: true });
    await fs.writeFile(
      path.join(out, "levels-runtime.json"),
      JSON.stringify(
        {
          checks: data.checks,
          failures: data.failures,
          levels: data.records.length,
          steps: data.steps.length,
          objectives: OBJECTIVES.length,
          sourceUnchanged: true,
        },
        null,
        2,
      ),
    );
    await fs.writeFile(path.join(out, "levels-runtime.log"), native);
  }
  console.log(native.trim());
  console.log(
    "Studio/Godot: campaign order, automatic/custom text, wave rewards and progression match.",
  );
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
