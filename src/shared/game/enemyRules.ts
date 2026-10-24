import {
  newId,
  type EnemyDefinition,
  type GameProject,
  type SpawnGroup,
} from "./types.js";
import { animationOwnerId } from "../presentation/ownership.js";
import { assignBehavior } from "./behaviorAuthoring.js";

export interface PushingRules {
  stops: number;
  pressure: number;
  warning: number;
  retreatSpeed: number;
  escortEnemyId: string;
  escortCount: number;
  escortInterval: number;
  /** Seeds for every interrupted push, including the final one. Absence disables it. */
  seedReward?: number;
}
export const defaultPushingRules = (): PushingRules => ({stops:3, pressure:1200, warning:7, retreatSpeed:1.0, escortEnemyId:'runner', escortCount:2, escortInterval:9, seedReward:150});
/** Each interruption adds 25 percentage points of the authored attack. */
export const pushingAttackStages = (enemy: EnemyDefinition): number[] =>
  Array.from({length: enemy.rules?.pushing?.stops ?? 0}, (_, index) => enemy.attack * (0.75 + index * 0.25));

export interface EnemyRules {
  spawn: { mode: "arrival" | "placement"; x: number };
  blocksEnemies: boolean;
  blocksPlanting: boolean;
  contact: "normal" | "solid";
  boss: boolean;
  pushing?: PushingRules;
  reinforcements?: { enemyId: string; interval: number };
}
export const defaultEnemyRules = (): EnemyRules => ({
  spawn: { mode: "arrival", x: 8.45 },
  blocksEnemies: false,
  blocksPlanting: false,
  contact: "normal",
  boss: false,
});
/** Neutral fallback for an incomplete editing draft. Runtime publications require explicit rules. */
export const enemyRules = (enemy: EnemyDefinition): EnemyRules =>
  enemy.rules ?? defaultEnemyRules();
export const usesPlacement = (enemy: EnemyDefinition | undefined) =>
  !!enemy && enemyRules(enemy).spawn.mode === "placement";
export const mobileReinforcement = (enemy: EnemyDefinition) =>
  enemy.speed > 0 && !usesPlacement(enemy) && !enemyRules(enemy).blocksEnemies;

/** One-time import of the historical implicit rules. Species identifiers belong only here. */
export function ensureEnemyRules(project: GameProject): void {
  for (const enemy of project.balance.enemies) {
    if (enemy.rules) continue;
    const rules = defaultEnemyRules();
    if (["plaque", "poubelle"].includes(enemy.id)) {
      rules.spawn = { mode: "placement", x: 6.5 };
      rules.blocksPlanting = true;
    }
    if (enemy.id === "plaque")
      rules.reinforcements = { enemyId: "runner", interval: 30 };
    if (enemy.id === "poubelle") rules.blocksEnemies = true;
    if (enemy.id === "thorn_knot") {
      rules.spawn.x = 6.8;
    }
    if (enemy.id === "cigarette") rules.contact = "solid";
    rules.boss = [
      "collector",
      "pump",
      "factory",
      "devourer",
      "corrupted_rose",
      "furnace",
    ].includes(enemy.id);
    enemy.rules = rules;
  }
  for (const level of project.levels)
    if (level.invasiveFoci && !level.invasiveFoci.focusEnemyId)
      level.invasiveFoci.focusEnemyId = "plaque";
}
export function groupForEnemy(
  group: SpawnGroup,
  enemy: EnemyDefinition,
): SpawnGroup {
  const copy = { ...group, enemyId: enemy.id };
  if (usesPlacement(enemy)) {
    const col = Math.min(7, Math.max(0, Math.floor(enemyRules(enemy).spawn.x))),
      row = group.lane >= 0 ? group.lane : 2;
    copy.placement ??= { rowMin: row, rowMax: row, colMin: col, colMax: col };
  } else delete copy.placement;
  return copy;
}
/** Catalog dependencies include automatically produced enemies, with bounded cycle traversal. */
export function producedEnemies(
  enemies: EnemyDefinition[],
  initial: string[],
): string[] {
  const ids = [...new Set(initial)];
  for (let i = 0; i < ids.length; i++) {
    const escort = enemies.find((e) => e.id === ids[i])?.rules?.pushing?.escortEnemyId;
    if (escort && !ids.includes(escort)) ids.push(escort);
    const next = enemies.find((e) => e.id === ids[i])?.rules?.reinforcements
      ?.enemyId;
    if (next && !ids.includes(next)) ids.push(next);
  }
  return ids;
}
export function duplicateEnemy(
  project: GameProject,
  id: string,
): EnemyDefinition {
  if (project.balance.enemies.length >= 128)
    throw Error("Le catalogue contient déjà 128 ennemis.");
  const source = project.balance.enemies.find((e) => e.id === id);
  if (!source) throw Error("Ennemi introuvable.");
  if (
    source.behaviorId &&
    project.logic &&
    project.logic.behaviors.length >= 128
  )
    throw Error(
      "Le catalogue de comportements est plein. Supprime un modèle inutilisé avant de dupliquer cet ennemi.",
    );
  const copy = structuredClone(source);
  copy.id = newId("enemy");
  copy.name = (source.name + " — copie").slice(0, 80);
  delete copy.archived;
  const catalog = project.presentation,
    profile = catalog?.profiles.find((p) => p.id === source.animationProfileId);
  if (catalog && profile && profile.id !== catalog.defaultProfileId) {
    const local = structuredClone(profile),
      aliases = new Map<string, string>();
    local.id = newId("profile");
    local.name = copy.name;
    const animations = [...new Set(local.slots.map((s) => s.animationId))]
      .map((id) => catalog.animations.find((a) => a.id === id))
      .filter((a) => a && animationOwnerId(project, a) === source.id);
    if (
      catalog.profiles.length >= 128 ||
      catalog.animations.length + animations.length > 512
    )
      throw Error("Le catalogue d’animations est plein.");
    for (const animation of animations) {
      const clone = structuredClone(animation!);
      clone.id = newId("anim");
      clone.ownerSpeciesId = copy.id;
      clone.name = (copy.name + " — " + animation!.name).slice(0, 120);
      for (const marker of clone.markers) marker.id = newId("marker");
      aliases.set(animation!.id, clone.id);
      catalog.animations.push(clone);
    }
    for (const slot of local.slots)
      slot.animationId = aliases.get(slot.animationId) ?? slot.animationId;
    catalog.profiles.push(local);
    copy.animationProfileId = local.id;
  }
  project.balance.enemies.push(copy);
  if (source.behaviorId && project.logic)
    assignBehavior(project, copy.id, source.behaviorId);
  return copy;
}
export function updateEnemyRules(
  project: GameProject,
  id: string,
  rules: EnemyRules,
): void {
  const enemy = project.balance.enemies.find((e) => e.id === id);
  if (!enemy) throw Error("Ennemi introuvable.");
  const previous = enemyRules(enemy);
  enemy.rules = structuredClone(rules);
  if (!enemy.rules.pushing) delete enemy.rules.pushing;
  if (!enemy.rules.reinforcements) delete enemy.rules.reinforcements;
  if (previous.spawn.mode !== rules.spawn.mode)
    for (const level of project.levels) {
      if (level.objective.type === "occupied_board") continue;
      for (const wave of level.waves)
        wave.groups = wave.groups.map((group) =>
          group.enemyId === id ? groupForEnemy(group, enemy) : group,
        );
    }
}
export function enemyRulesSummary(
  enemy: EnemyDefinition,
  enemies: EnemyDefinition[],
): string[] {
  const rules = enemyRules(enemy),
    lines = [
      rules.spawn.mode === "placement"
        ? "Apparition sur une case ou une zone choisie dans la vague."
        : `Arrivée à la position ${rules.spawn.x} du plateau.`,
    ];
  if (rules.blocksEnemies)
    lines.push(
      "Bloque les ennemis de son allée ; les suivants font la queue. Les projectiles la traversent.",
    );
  if (rules.blocksPlanting)
    lines.push("Empêche de planter sur sa case tant qu’il est vivant.");
  if (rules.contact === "solid")
    lines.push("S’arrête au contact d’une plante dans tous les objectifs.");
  if (rules.reinforcements) {
    const r = rules.reinforcements;
    lines.push(
      `Fait arriver ${enemies.find((e) => e.id === r.enemyId)?.name ?? r.enemyId} dans son allée toutes les ${r.interval} s. Première arrivée après ${r.interval} s de combat ; sa destruction arrête les renforts.`,
    );
  }
  if (rules.boss)
    lines.push("Identifié comme boss pour la présentation du combat.");
  if (rules.pushing) lines.push(
    `Poussées annoncées pendant ${rules.pushing.warning} s ; ${rules.pushing.pressure} points de résistance interrompent une poussée. Repli après ${rules.pushing.stops} interruptions, sans perte de PV. L’escorte occupe les quatre autres allées : ${rules.pushing.escortCount} unités par allée au départ, puis des renforts toutes les ${rules.pushing.escortInterval} s. Dégâts bruts par poussée : ${pushingAttackStages(enemy).join(" → ")}, avant les protections ; +25 points de pourcentage par interruption. Les phases suivantes renforcent cette pression. Prime de ${rules.pushing.seedReward ?? 0} graines par poussée interrompue, y compris la dernière.`,
  );
  return lines;
}
