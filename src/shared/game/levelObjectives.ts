import {
  defaultEscort,
  defaultInvasiveFoci,
  type EnemyDefinition,
  type LevelDefinition,
} from "./types.js";
import { convertWavePlacement } from "./boardPlacement.js";

export type ObjectiveType = LevelDefinition["objective"]["type"];
const TEXT: Record<ObjectiveType, string> = {
  defend: "Repousser les vagues.",
  repel_boss: "Interrompez les poussées du boss pour le contraindre au repli.",
  occupied_board: "Éliminer tous les ennemis du plateau et leurs renforts.",
  advance: "Conquérir les cinq allées.",
  escort: "Conquérir les cinq allées en protégeant les jeunes pousses.",
  invasive_foci:
    "Détruire tous les foyers invasifs et leurs derniers renforts.",
  protect_cell: "Protéger la case jusqu’à la fin des vagues.",
};
export function objectiveText(level: LevelDefinition): string {
  // Absence means authored text, including text equal to a default. No content heuristics.
  return level.objectiveTextMode === "automatic"
    ? TEXT[level.objective.type]
    : level.objectiveText;
}
export function setObjectiveTextMode(
  level: LevelDefinition,
  automatic: boolean,
): void {
  level.objectiveText = objectiveText(level);
  level.objectiveTextMode = automatic ? "automatic" : "custom";
  if (automatic) level.objectiveText = objectiveText(level);
}
export function planObjectiveChange(
  level: LevelDefinition,
  type: ObjectiveType,
  enemies: EnemyDefinition[],
) {
  const next = structuredClone(level),
    changes: string[] = [];
  if (type === level.objective.type)
    return { next, changes, requiresReview: false };
  next.objective = {
    type,
    target: 0,
  };
  const converting =
    type === "occupied_board" || level.objective.type === "occupied_board";
  if (converting) {
    changes.push(
      `${level.waves.length} vague(s), ${level.waves.reduce((n, w) => n + w.groups.length, 0)} groupe(s) et ${level.waves.reduce((n, w) => n + w.groups.reduce((total, g) => total + g.count, 0), 0)} ennemis concernés ; les effectifs restent identiques.`,
    );
    next.waves = level.waves.map((w) =>
      convertWavePlacement(w, type === "occupied_board", enemies),
    );
    changes.push(
      type === "occupied_board"
        ? "Les groupes de toutes les vagues seront placés sur des cases précises ; leurs délais et intervalles passeront à zéro."
        : "Les groupes redeviennent des arrivées de vagues. Les ennemis mobiles perdent leur case ; les intervalles seront d’au moins 0,1 seconde.",
    );
  }
  const configs = [
    ["escort", "escort", "L’escorte des pousses"],
    ["invasiveFoci", "invasive_foci", "Les foyers invasifs"],
    ["protectedCell", "protect_cell", "La cible à protéger"],
  ] as const;
  let removing = false;
  for (const [key, owner, label] of configs)
    if (type !== owner) {
      if (next[key]) {
        changes.push(
          label + " : les réglages propres à cet objectif seront retirés.",
        );
        removing = true;
      }
      delete next[key];
    }
  if (type === "escort") next.escort ??= defaultEscort();
  if (type === "invasive_foci") next.invasiveFoci ??= defaultInvasiveFoci();
  if (type === "protect_cell")
    next.protectedCell ??= {
      row: 2,
      col: 1,
      image: "" as `library://${string}`,
      maxHp: 300,
      armor: 0.15,
      resistances: { physical: 0, piercing: 0, toxic: 0 },
    };
  if (next.objectiveTextMode === "automatic")
    next.objectiveText = objectiveText(next);
  changes.push(
    level.objectiveTextMode === "automatic"
      ? "La consigne automatique suivra le nouvel objectif."
      : "La consigne rédigée sera conservée intégralement.",
  );
  return { next, changes, requiresReview: converting || removing };
}
