import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { seedProject } from "../dist-tests/src/shared/game/seed.js";
import { parseGameProject } from "../dist-tests/src/shared/game/validation.js";
import {
  resolvedEventCue,
  releasePlan,
  species,
} from "../dist-tests/src/shared/presentation/runtime.js";
const args = process.argv.slice(2),
  option = (key, fallback) =>
    args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const game = option("--game", "C:/dev/Lunaria/game"),
  godot = option(
    "--godot",
    process.env.GODOT_BIN ||
      "C:/Program Files/Godot/Godot_v4.7.2-stable_win64_console.exe",
  ),
  out = option("--out", "");
const dir = await fs.mkdtemp(
  path.join(os.tmpdir(), "lunaria-presentation-parity-"),
);
try {
  const p = parseGameProject(seedProject()),
    source = path.join(dir, "project.json"),
    cases = path.join(dir, "cases.json"),
    report = path.join(dir, "report.json");
  await fs.writeFile(source, JSON.stringify(p));
  const s = species(p, "radish"),
    own = p.presentation.profiles.find((v) => v.id === s.animationProfileId),
    defaults = p.presentation.profiles.find(
      (v) => v.id === p.presentation.defaultProfileId,
    ),
    cues = [],
    expected = [];
  for (const useDefault of [false, true])
    for (let mask = 0; mask < 256; mask++) {
      const cue = (index) => ({
        soundId:
          mask & (1 << (index * 2))
            ? ["personal", "ability", "projectile", "default"][index] + "_sound"
            : "",
        vfxId:
          mask & (1 << (index * 2 + 1))
            ? ["personal", "ability", "projectile", "default"][index] + "_vfx"
            : "",
        attach: ["head", "launch", "feet", "center"][index],
      });
      own.events = [{ event: "impact", ...cue(0) }];
      defaults.events = [{ event: "impact", ...cue(3) }];
      s.animationProfileId = useDefault ? defaults.id : own.id;
      const fallbacks = [cue(1), cue(2)];
      cues.push({
        useDefault,
        own: own.events,
        defaults: defaults.events,
        fallbacks,
      });
      expected.push(
        JSON.parse(
          JSON.stringify(resolvedEventCue(p, s, "impact", ...fallbacks)),
        ),
      );
    }
  s.animationProfileId = own.id;
  const plans = [],
    expectedPlans = [];
  for (const kind of ["radish", "rose", "fern", "cigarette"])
    for (const mode of ["marker", "delay", "immediate"])
      for (const interval of [0.05, 0.4, 2])
        for (const fitCadence of [false, true]) {
          const owner = species(p, kind),
            ability = structuredClone(
              p.combat.abilities.find((a) => owner.ability_ids.includes(a.id)),
            );
          ability.presentation.release = mode;
          ability.presentation.fitCadence = fitCadence;
          ability.presentation.delay = 0.7;
          plans.push({ kind, ability, interval });
          expectedPlans.push(releasePlan(p, owner, ability, interval));
        }
  await fs.writeFile(cases, JSON.stringify({ cues, plans }));
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
        "res://tests/presentation_authoring_smoke.gd",
        "--",
        "--studio-capability-workshop",
        "--studio-content=" + source,
        "--presentation-cases=" + cases,
        "--presentation-report=" + report,
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
  assert.deepEqual(result.cues, expected);
  assert.equal(result.plans.length, expectedPlans.length);
  for (let i = 0; i < expectedPlans.length; i++)
    for (const key of Object.keys(expectedPlans[i])) {
      const actual = result.plans[i][key],
        want = expectedPlans[i][key];
      if (typeof want === "number")
        assert.ok(Math.abs(actual - want) < 1e-7, `plan ${i} ${key}`);
      else assert.equal(actual, want);
    }
  if (out) {
    await fs.mkdir(out, { recursive: true });
    await fs.writeFile(
      path.join(out, "presentation-parity.json"),
      JSON.stringify(
        {
          checks: result.checks,
          cueCases: cues.length,
          timingCases: plans.length,
          failures: result.failures,
        },
        null,
        2,
      ),
    );
    await fs.writeFile(path.join(out, "presentation-parity.log"), native);
  }
  console.log(native.trim());
  console.log(
    `Studio/Godot: ${cues.length} cue resolutions and ${plans.length} release plans match.`,
  );
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
