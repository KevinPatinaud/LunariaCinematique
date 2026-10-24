// Studio duplication -> validated temporary content -> real Godot movement/production/save tests.
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { seedProject } from "../dist-tests/src/shared/game/seed.js";
import { parseGameProject } from "../dist-tests/src/shared/game/validation.js";
import { duplicateEnemy } from "../dist-tests/src/shared/game/enemyRules.js";
const args = process.argv.slice(2),
  option = (key, fallback) =>
    args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const game = path.resolve(option("--game", "C:/dev/Lunaria/game")),
  godot = option(
    "--godot",
    process.env.GODOT_BIN ||
      "C:/Program Files/Godot/Godot_v4.7.2-stable_win64_console.exe",
  ),
  out = option("--out", "");
const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lunaria-enemy-runtime-"));
try {
  const project = parseGameProject(seedProject()),
    ids = {};
  for (const [role, source] of Object.entries({
    obstacle: "poubelle",
    generator: "plaque",
    mobile: "runner",
    contact: "cigarette",
    boss: "collector",
  }))
    ids[role] = duplicateEnemy(project, source).id;
  const generator = project.balance.enemies.find((e) => e.id === ids.generator);
  const movingObstacle = duplicateEnemy(project, "runner");
  movingObstacle.rules.blocksEnemies = true;
  ids.movingObstacle = movingObstacle.id;
  generator.rules.reinforcements = { enemyId: ids.mobile, interval: 1.5 };
  const mobile = project.balance.enemies.find((e) => e.id === ids.mobile);
  mobile.rules.contact = "solid";
  const source = project.combat.abilities.find(
      (a) => a.id === "ab_enemy_contact",
    ),
    ability = structuredClone(source);
  ability.id = "ab_custom_contact";
  ability.name = "Contact personnel";
  ability.rangeSource = "fixed";
  ability.range = 0.2;
  project.combat.abilities.push(ability);
  mobile.ability_ids = [ability.id];
  ids.contactAbility = ability.id;
  parseGameProject(project);
  const file = path.join(dir, "project.game.json"),
    cases = path.join(dir, "cases.json");
  await fs.writeFile(file, JSON.stringify(project));
  await fs.writeFile(cases, JSON.stringify(ids));
  async function run(script, visual = false) {
    return await new Promise((resolve, reject) => {
      const child = spawn(
        godot,
        [
          ...(visual ? ["--minimized"] : ["--headless"]),
          "--audio-driver",
          "Dummy",
          "--path",
          game,
          "--script",
          script,
          "--",
          "--studio-capability-workshop",
          "--studio-content=" + file,
          "--enemy-cases=" + cases,
          "--out=" + path.resolve(out || dir),
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
      let result = "";
      const timeout = setTimeout(() => {
        child.kill();
        reject(Error("Godot timed out"));
      }, 60000);
      for (const stream of [child.stdout, child.stderr])
        stream.on("data", (chunk) => {
          result += chunk;
          if (/SCRIPT ERROR:/.test(result)) child.kill();
        });
      child.on("error", reject);
      child.on("close", (code) => {
        clearTimeout(timeout);
        code === 0 && !/^ERROR:|SCRIPT ERROR:|failures=[1-9]/m.test(result)
          ? resolve(result)
          : reject(Error(result));
      });
    });
  }
  const output = await run("res://tests/enemy_rules_smoke.gd");
  const visualOutput = args.includes("--visual")
    ? await run("res://tests/enemy_rules_visual.gd", true)
    : "";
  if (out) {
    await fs.mkdir(out, { recursive: true });
    await fs.writeFile(
      path.join(out, "enemy-rules-native.log"),
      String(output),
    );
    await fs.writeFile(
      path.join(out, "enemy-rules-cases.json"),
      JSON.stringify(ids, null, 2),
    );
  }
  console.log(String(output).trim());
  if (visualOutput) console.log(String(visualOutput).trim());
} finally {
  await fs.rm(dir, { recursive: true, force: true });
}
