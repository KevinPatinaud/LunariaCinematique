import { promises as fs } from "node:fs";
import path from "node:path";
import {
  spawn,
  type ChildProcess,
  type SpawnOptions,
} from "node:child_process";
import { parseGameProject } from "../shared/game/validation.js";
import { combatOwner } from "../shared/game/combatAuthoring.js";
import { newBehavior } from "../shared/game/logic.js";
import { atomicJson } from "./files.js";

/** Isolated content snapshot: testing never publishes over the active campaign. */
export async function prepareCapabilityWorkshop(
  value: unknown,
  sourceId: string,
  abilityId: string,
  targetId: string,
  folder: string,
): Promise<string> {
  const project = parseGameProject(value),
    source = combatOwner(project, sourceId);
  combatOwner(project, targetId);
  if (!project.combat!.abilities.some((a) => a.id === abilityId))
    throw Error("Capacité de test inconnue.");
  source.ability_ids = [abilityId];
  const behavior = newBehavior("damage" in source ? "plants" : "enemies");
  behavior.name = "Atelier de capacité";
  project.logic!.behaviors.push(behavior);
  source.behaviorId = behavior.id;
  // The workshop exercises combat directly, without campaign events or film loading.
  for (const behavior of project.logic!.behaviors)
    for (const phase of behavior.phases)
      phase.onEnter = phase.onEnter.filter(
        (action) => action.type !== "cinematic",
      );
  project.levels = [];
  project.campaign = { steps: [], cinematics: [] };
  project.cinematics = [];
  const file = path.join(folder, "capability-" + crypto.randomUUID() + ".json");
  await atomicJson(file, project);
  return file;
}
export async function launchCapabilityWorkshop(
  executable: string,
  gameRoot: string,
  file: string,
  sourceId: string,
  abilityId: string,
  targetId: string,
  start: (
    executable: string,
    args: string[],
    options: SpawnOptions,
  ) => ChildProcess = spawn,
): Promise<void> {
  await fs.access(path.join(gameRoot, "tools", "capability_workshop.gd"));
  await new Promise<void>((resolve, reject) => {
    const child = start(
      executable,
      [
        "--path",
        gameRoot,
        "--script",
        "res://tools/capability_workshop.gd",
        "--",
        "--studio-capability-workshop",
        "--studio-content=" + file,
        "--source=" + sourceId,
        "--ability=" + abilityId,
        "--target=" + targetId,
      ],
      { cwd: gameRoot, detached: true, stdio: "ignore", windowsHide: false },
    );
    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}
