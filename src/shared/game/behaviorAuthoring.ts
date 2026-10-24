import {
  newId,
  type GameProject,
  type PlantDefinition,
  type EnemyDefinition,
} from "./types.js";
import {
  newBehavior,
  newPhase,
  newRule,
  possibleAbilities,
  type BehaviorDefinition,
  type BehaviorPhase,
  type Team,
} from "./logic.js";

export function behaviorOwner(
  p: GameProject,
  id: string,
): PlantDefinition | EnemyDefinition {
  const owner = [...p.balance.plants, ...p.balance.enemies].find(
    (s) => s.id === id,
  );
  if (!owner) throw Error("Personnage introuvable.");
  return owner;
}
export function behaviorUsers(p: GameProject, id: string) {
  return [...p.balance.plants, ...p.balance.enemies].filter(
    (s) => s.behaviorId === id,
  );
}
export function ownerBehavior(p: GameProject, id: string) {
  const owner = behaviorOwner(p, id),
    behavior = p.logic?.behaviors.find((b) => b.id === owner.behaviorId);
  if (!behavior)
    throw Error("Le comportement de " + owner.name + " est introuvable.");
  return behavior;
}
export function copyBehavior(
  source: BehaviorDefinition,
  name = source.name,
): BehaviorDefinition {
  const copy = structuredClone(source);
  copy.id = newId("ai");
  copy.name = name.slice(0, 120);
  for (const rule of copy.rules) rule.id = newId("rule");
  for (const phase of copy.phases) phase.id = newId("phase");
  return copy;
}
function insert(p: GameProject, behavior: BehaviorDefinition) {
  if (!p.logic) throw Error("Catalogue de comportements absent.");
  if (p.logic.behaviors.length >= 128)
    throw Error(
      "Le catalogue contient déjà 128 comportements. Supprime un modèle inutilisé.",
    );
  p.logic.behaviors.push(behavior);
  return behavior;
}
export function duplicateBehavior(p: GameProject, id: string) {
  const source = p.logic?.behaviors.find((b) => b.id === id);
  if (!source) throw Error("Modèle de comportement introuvable.");
  return insert(p, copyBehavior(source, source.name + " — copie"));
}
/** A personal edit never alters another character, nor clones a model for a no-op. */
export function editOwnerBehavior(
  p: GameProject,
  ownerId: string,
  edit: (b: BehaviorDefinition) => void,
  shared = false,
): string {
  const owner = behaviorOwner(p, ownerId),
    source = ownerBehavior(p, ownerId),
    candidate = structuredClone(source);
  edit(candidate);
  if (JSON.stringify(source) === JSON.stringify(candidate)) return source.id;
  if (candidate.id !== source.id || candidate.team !== source.team)
    throw Error(
      "Un réglage personnel conserve l’identité et le camp du comportement.",
    );
  if (!shared && behaviorUsers(p, source.id).some((s) => s.id !== ownerId)) {
    const copy = copyBehavior(
      candidate,
      (candidate.name === source.name
        ? candidate.name + " — " + owner.name
        : candidate.name
      ).slice(0, 120),
    );
    insert(p, copy);
    owner.behaviorId = copy.id;
    return copy.id;
  }
  Object.assign(source, candidate);
  return source.id;
}
/** Applying a template copies it by default. Linking a shared model is explicit. */
export function assignBehavior(
  p: GameProject,
  ownerId: string,
  modelId: string,
  shared = false,
): string {
  const owner = behaviorOwner(p, ownerId),
    source = p.logic?.behaviors.find((b) => b.id === modelId);
  if (!source) throw Error("Modèle de comportement introuvable.");
  const team = p.balance.plants.some((s) => s.id === ownerId)
    ? "plants"
    : "enemies";
  if (source.team !== team) throw Error("Ce modèle appartient à l’autre camp.");
  const missing = behaviorCompatibility(p, ownerId, source);
  if (missing.length)
    throw Error(
      "Ce modèle demande des capacités absentes de " +
        owner.name +
        " : " +
        missing.join(", "),
    );
  if (shared) {
    owner.behaviorId = source.id;
    return source.id;
  }
  const copy = copyBehavior(source, source.name + " — " + owner.name);
  for (const phase of copy.phases)
    for (const action of phase.onEnter)
      if (action.target === "self" && action.speciesId) action.speciesId = "";
  insert(p, copy);
  owner.behaviorId = copy.id;
  return copy.id;
}
export function behaviorCompatibility(
  p: GameProject,
  ownerId: string,
  b: BehaviorDefinition,
): string[] {
  const owner = behaviorOwner(p, ownerId),
    available = new Set(
      possibleAbilities(p, {
        ability_ids: owner.ability_ids,
        behaviorId: b.id,
      }),
    );
  const requested = [
    ...b.rules.filter((r) => r.action === "ability").map((r) => r.abilityId),
    ...b.phases.flatMap((f) =>
      f.onEnter
        .filter((a) => a.target === "self")
        .map((a) => a.abilityId ?? ""),
    ),
  ].filter(Boolean);
  return [...new Set(requested)]
    .filter((id) => !available.has(id))
    .map((id) => p.combat?.abilities.find((a) => a.id === id)?.name ?? id);
}
export function detachBehavior(p: GameProject, ownerId: string): string {
  const owner = behaviorOwner(p, ownerId),
    source = ownerBehavior(p, ownerId);
  if (behaviorUsers(p, source.id).length === 1) return source.id;
  return assignBehavior(p, ownerId, source.id);
}
export function removeBehavior(p: GameProject, id: string) {
  const users = behaviorUsers(p, id);
  if (users.length)
    throw Error("Encore utilisé par : " + users.map((s) => s.name).join(", "));
  if (!p.logic || p.logic.behaviors.length <= 1)
    throw Error("Conserve au moins un modèle de comportement.");
  if (!p.logic.behaviors.some((b) => b.id === id))
    throw Error("Modèle introuvable.");
  p.logic.behaviors = p.logic.behaviors.filter((b) => b.id !== id);
}
export type BehaviorTemplate = "automatic" | "boss" | "retreat";
export const BEHAVIOR_TEMPLATES: Record<BehaviorTemplate, string> = {
  automatic: "Capacités automatiques",
  boss: "Trois phases de combat",
  retreat: "Recul à faible santé",
};
export function createBehavior(
  p: GameProject,
  team: Team,
  template: BehaviorTemplate = "automatic",
) {
  if (template === "retreat" && team === "plants")
    throw Error("Le recul est réservé aux ennemis.");
  const b = newBehavior(team);
  b.name =
    template === "automatic"
      ? team === "plants"
        ? "Défenseur immobile"
        : "Ennemi terrestre"
      : BEHAVIOR_TEMPLATES[template];
  b.phases[0].name = "Normal";
  if (template === "boss") {
    b.phases.push(
      { ...newPhase(1), name: "Colère", healthBelow: 66, attackFactor: 1.1 },
      {
        ...newPhase(2),
        name: "Dernière offensive",
        healthBelow: 33,
        attackFactor: 1.2,
      },
    );
  }
  if (template === "retreat") {
    b.mode = "priority";
    b.rules = [
      {
        ...newRule(),
        name: "Reculer sous 25 % de PV",
        conditions: [{ kind: "health", op: "lte", value: 25, ref: "" }],
        action: "retreat",
      },
      newRule(),
    ];
  }
  return insert(p, b);
}
export function appendPhase(b: BehaviorDefinition): BehaviorPhase {
  const last = b.phases.at(-1);
  if (!last || b.phases.length >= 8 || last.healthBelow <= 0)
    throw Error("Aucune phase supplémentaire possible.");
  const phase = newPhase(b.phases.length);
  phase.healthBelow = Math.max(0, last.healthBelow - 25);
  b.phases.push(phase);
  return phase;
}
export function removePhase(b: BehaviorDefinition, id: string) {
  const i = b.phases.findIndex((f) => f.id === id);
  if (i <= 0) throw Error("La phase initiale est conservée.");
  b.phases.splice(i, 1);
}
