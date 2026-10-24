import {
  activeEnemies,
  cloneLevel,
  newId,
  newLevel,
  DEFAULT_WAVE_SEED_REWARD,
  type GameProject,
  type LevelDefinition,
  type CampaignStep,
} from "./types.js";
import { campaignOf, ensureCampaign, moveCampaignStep } from "./campaign.js";
import { objectiveText } from "./levelObjectives.js";
import {groupForEnemy} from './enemyRules.js';

export type LevelPlacement =
  | { kind: "outside" }
  | { kind: "campaign"; beforeId: string | null };
export function levelPosition(project: GameProject, id: string) {
  const steps = campaignOf(project).steps,
    index = steps.findIndex((s) => s.kind === "level" && s.levelId === id);
  return {
    index,
    preparing: index >= 0 && steps.some((s, i) => s.kind === "end" && i < index),
    stepId: index < 0 ? "" : steps[index].id,
    number:
      index < 0
        ? 0
        : steps.slice(0, index + 1).filter((s) => s.kind === "level").length,
    previous: index > 0 ? steps[index - 1] : undefined,
    next: index < 0 ? undefined : steps[index + 1],
  };
}
export function stepTitle(project: GameProject, step: CampaignStep): string {
  if (step.kind === "end") return "Fin actuelle de la partie jouable";
  return step.kind === "level"
    ? (project.levels.find((l) => l.id === step.levelId)?.title ??
        "Niveau introuvable")
    : (campaignOf(project).cinematics.find((f) => f.id === step.cinematicId)
        ?.title ?? "Cinématique introuvable");
}
export function orderedLevels(project: GameProject): LevelDefinition[] {
  const ids = campaignOf(project)
      .steps.filter((s) => s.kind === "level")
      .map((s) => s.levelId),
    seen = new Set<string>(),
    result: LevelDefinition[] = [];
  for (const id of [...ids, ...project.levels.map((l) => l.id)]) {
    const level = project.levels.find((l) => l.id === id);
    if (level && !seen.has(id)) {
      seen.add(id);
      result.push(level);
    }
  }
  return result;
}
export function afterLevel(project: GameProject, id: string): LevelPlacement {
  const position = levelPosition(project, id);
  return position.index < 0
    ? { kind: "outside" }
    : { kind: "campaign", beforeId: position.next?.id ?? null };
}
function checkPlacement(
  project: GameProject,
  id: string,
  placement: LevelPlacement,
): void {
  if (placement.kind === "outside") return;
  const steps = campaignOf(project).steps;
  if (
    placement.beforeId !== null &&
    !steps.some((s) => s.id === placement.beforeId)
  )
    throw Error("L’étape choisie n’existe plus.");
  if (
    !steps.some((s) => s.kind === "level" && s.levelId === id) &&
    steps.length >= 1000
  )
    throw Error("Le parcours contient déjà 1 000 étapes.");
}
export function placeLevel(
  project: GameProject,
  id: string,
  placement: LevelPlacement,
): string {
  if (!project.levels.some((l) => l.id === id))
    throw Error("Niveau introuvable.");
  checkPlacement(project, id, placement);
  const c = ensureCampaign(project),
    existing = c.steps.find((s) => s.kind === "level" && s.levelId === id);
  if (placement.kind === "outside") {
    if (existing) c.steps = c.steps.filter((s) => s.id !== existing.id);
    return "";
  }
  if (existing) {
    c.steps = moveCampaignStep(c.steps, existing.id, placement.beforeId);
    return existing.id;
  }
  const index =
    placement.beforeId === null
      ? c.steps.length
      : c.steps.findIndex((s) => s.id === placement.beforeId);
  const stepId = newId("step");
  c.steps.splice(index, 0, { id: stepId, kind: "level", levelId: id });
  return stepId;
}
export function createProjectLevel(
  project: GameProject,
  placement: LevelPlacement,
  afterId = "",
): string {
  if (project.levels.length >= 200)
    throw Error("Le projet contient déjà 200 niveaux.");
  const enemy = activeEnemies(project.balance.enemies)[0];
  if (!enemy)
    throw Error("Restaure un ennemi archivé avant de créer un niveau.");
  const level = newLevel(
    project.balance.plants.map((p) => p.id),
    enemy.id,
  );
  level.waves[0].groups[0]=groupForEnemy(level.waves[0].groups[0],enemy);
  level.act = project.levels.find((l) => l.id === afterId)?.act ?? 0;
  checkPlacement(project, level.id, placement);
  // Materialize legacy playback order before changing the library.
  ensureCampaign(project);
  const index = project.levels.findIndex((l) => l.id === afterId);
  project.levels.splice(
    index < 0 ? project.levels.length : index + 1,
    0,
    level,
  );
  placeLevel(project, level.id, placement);
  return level.id;
}
export function duplicateProjectLevel(
  project: GameProject,
  id: string,
  placement: LevelPlacement,
  title?: string,
): string {
  const source = project.levels.find((l) => l.id === id);
  if (!source) throw Error("Niveau introuvable.");
  if (project.levels.length >= 200)
    throw Error("Le projet contient déjà 200 niveaux.");
  const level = cloneLevel(source);
  if (title !== undefined) {
    if (!title.trim() || [...title].length > 160)
      throw Error("Donne un titre de 1 à 160 caractères.");
    level.title = title;
  }
  checkPlacement(project, level.id, placement);
  ensureCampaign(project);
  project.levels.splice(project.levels.indexOf(source) + 1, 0, level);
  placeLevel(project, level.id, placement);
  return level.id;
}
export function deleteProjectLevel(project: GameProject, id: string): void {
  const i = project.levels.findIndex((l) => l.id === id);
  if (i < 0) return;
  const c = ensureCampaign(project);
  c.steps = c.steps.filter((s) => s.kind !== "level" || s.levelId !== id);
  project.levels.splice(i, 1);
}
export function patchProjectLevel(
  project: GameProject,
  id: string,
  patch: Partial<LevelDefinition>,
): void {
  const level = project.levels.find((l) => l.id === id);
  if (!level) throw Error("Niveau introuvable.");
  if (patch.id !== undefined && patch.id !== id)
    throw Error("L’identité du niveau ne peut pas être modifiée.");
  Object.assign(level, patch);
  for (const key of [
    "protectedCell",
    "invasiveFoci",
    "escort",
    "terrainImage",
    "restoredTerrainImage",
  ] as const)
    if (Object.hasOwn(patch, key) && patch[key] === undefined)
      delete level[key];
  if (level.objectiveTextMode === "automatic")
    level.objectiveText = objectiveText(level);
}
export function levelRewardSummary(level: LevelDefinition) {
  return {
    waves: level.waves.map((w) => w.seedReward ?? DEFAULT_WAVE_SEED_REWARD),
    waveTotal: level.waves.reduce(
      (n, w) => n + (w.seedReward ?? DEFAULT_WAVE_SEED_REWARD),
      0,
    ),
    capture: ["advance", "escort"].includes(level.objective.type)
      ? (level.laneCaptureSeedReward ?? 0)
      : 0,
  };
}
