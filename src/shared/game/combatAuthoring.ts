import {
  newAbility,
  newEffect,
  newProjectile,
  type AbilityDefinition,
} from "./combat.js";
import { mechanicEffectIds } from "./combatMechanics.js";
import {
  newId,
  type GameProject,
  type PlantDefinition,
  type EnemyDefinition,
} from "./types.js";
import { possibleAbilities } from "./logic.js";
import { editOwnerBehavior } from "./behaviorAuthoring.js";

export type CombatOwner = PlantDefinition | EnemyDefinition;
export function combatOwner(p: GameProject, id: string): CombatOwner {
  const owner = [...p.balance.plants, ...p.balance.enemies].find(
    (x) => x.id === id,
  );
  if (!owner) throw Error("Personnage introuvable : " + id);
  return owner;
}
export function ownerStats(owner: CombatOwner) {
  return {
    attack: "damage" in owner ? owner.damage : owner.attack,
    strength: "effect_strength" in owner ? owner.effect_strength : 1,
    rate: "rate" in owner ? owner.rate : 1,
    range: "range" in owner ? owner.range : owner.reach,
  };
}

/** Clone the complete gameplay dependency graph, including reaction-only effects. */
export function cloneAbility(p: GameProject, id: string): AbilityDefinition {
  const source = p.combat!.abilities.find((a) => a.id === id);
  if (!source) throw Error("Capacité introuvable : " + id);
  const copy = structuredClone(source),
    effects = new Map<string, string>();
  copy.id = newId("ab");
  copy.name = (source.name + " — copie").slice(0, 120);
  for (const effectId of new Set([
    ...source.effects,
    ...mechanicEffectIds(source.mechanics),
  ])) {
    const original = p.combat!.effects.find((e) => e.id === effectId);
    if (!original) throw Error("Effet introuvable : " + effectId);
    const effect = structuredClone(original);
    effect.id = newId("fx");
    effects.set(effectId, effect.id);
    p.combat!.effects.push(effect);
  }
  copy.effects = source.effects.map((id) => effects.get(id)!);
  if (copy.mechanics?.guard)
    copy.mechanics.guard.poisonEffectId = effects.get(
      copy.mechanics.guard.poisonEffectId,
    )!;
  if (copy.mechanics?.combo) {
    copy.mechanics.combo.recoveryEffectId = effects.get(
      copy.mechanics.combo.recoveryEffectId,
    )!;
    copy.mechanics.combo.staggerEffectId = effects.get(
      copy.mechanics.combo.staggerEffectId,
    )!;
  }
  if (source.delivery === "projectile") {
    const original = p.combat!.projectiles.find(
      (x) => x.id === source.projectileId,
    );
    if (!original)
      throw Error("Projectile introuvable : " + source.projectileId);
    const projectile = structuredClone(original);
    projectile.id = newId("proj");
    copy.projectileId = projectile.id;
    p.combat!.projectiles.push(projectile);
  }
  p.combat!.abilities.push(copy);
  return copy;
}

export function hasSharedDependencies(
  p: GameProject,
  id: string,
  ownerId?: string,
): boolean {
  const a = p.combat!.abilities.find((a) => a.id === id)!;
  const owners = [...p.balance.plants, ...p.balance.enemies].filter((owner) =>
    possibleAbilities(p, owner).includes(id),
  );
  const owner = ownerId
    ? combatOwner(p, ownerId)
    : owners.length === 1
      ? owners[0]
      : undefined;
  if (owners.some((other) => other.id !== owner?.id)) return true;
  const dependencies = new Set([
    ...a.effects,
    ...mechanicEffectIds(a.mechanics),
  ]);
  if (
    p.combat!.abilities.some(
      (other) =>
        other.id !== id &&
        ([...other.effects, ...mechanicEffectIds(other.mechanics)].some(
          (effectId) => dependencies.has(effectId),
        ) ||
          (a.delivery === "projectile" &&
            other.projectileId === a.projectileId)),
    )
  )
    return true;
  // References inside this owner's private behavior are part of the same graph.
  // Count IDs, never display names: independently named models can share labels.
  for (const behavior of p.logic?.behaviors ?? []) {
    const privateBehavior =
      behavior.id === owner?.behaviorId &&
      ![...p.balance.plants, ...p.balance.enemies].some(
        (other) => other.id !== owner.id && other.behaviorId === behavior.id,
      );
    if (privateBehavior) continue;
    if (
      behavior.phases.some((phase) =>
        phase.onEnter.some((action) => dependencies.has(action.effectId ?? "")),
      )
    )
      return true;
  }
  return (
    p.levels.some((level) =>
      level.events?.some((event) =>
        event.actions.some(
          (action) =>
            action.speciesId !== owner?.id &&
            dependencies.has(action.effectId ?? ""),
        ),
      ),
    ) ?? false
  );
}

/** Keep phase/rule references coherent when a character receives its own copy. */
export function personalizeAbility(
  p: GameProject,
  ownerId: string,
  id: string,
): AbilityDefinition {
  const owner = combatOwner(p, ownerId),
    copy = cloneAbility(p, id);
  const original = p.combat!.abilities.find((a) => a.id === id)!;
  const effectAliases = new Map(
    [...original.effects, ...mechanicEffectIds(original.mechanics)].map(
      (effectId, index) => [
        effectId,
        [...copy.effects, ...mechanicEffectIds(copy.mechanics)][index],
      ],
    ),
  );
  copy.name = p.combat!.abilities.find((a) => a.id === id)!.name;
  owner.ability_ids = owner.ability_ids!.map((x) => (x === id ? copy.id : x));
  const behavior = p.logic?.behaviors.find((b) => b.id === owner.behaviorId);
  if (behavior) {
    editOwnerBehavior(p, ownerId, (local) => {
      for (const rule of local.rules) {
        if (rule.abilityId === id) rule.abilityId = copy.id;
        for (const condition of rule.conditions)
          if (
            ["ready", "target"].includes(condition.kind) &&
            condition.ref === id
          )
            condition.ref = copy.id;
      }
      for (const phase of local.phases) {
        phase.abilityIds = phase.abilityIds.map((x) =>
          x === id ? copy.id : x,
        );
        for (const action of phase.onEnter) {
          if (action.abilityId === id) action.abilityId = copy.id;
          if (action.effectId && effectAliases.has(action.effectId))
            action.effectId = effectAliases.get(action.effectId)!;
        }
      }
    });
  }
  for (const level of p.levels)
    for (const event of level.events ?? [])
      for (const action of event.actions)
        if (action.speciesId === ownerId) {
          if (action.abilityId === id) action.abilityId = copy.id;
          if (action.effectId && effectAliases.has(action.effectId))
            action.effectId = effectAliases.get(action.effectId)!;
        }
  return copy;
}

/** Detach a capability from every activation path of this owner, preserving shared models. */
export function removeOwnerAbility(
  p: GameProject,
  ownerId: string,
  id: string,
): void {
  const owner = combatOwner(p, ownerId);
  owner.ability_ids = owner.ability_ids!.filter((value) => value !== id);
  const original = p.logic?.behaviors.find(
    (behavior) => behavior.id === owner.behaviorId,
  );
  if (original) {
    editOwnerBehavior(p, ownerId, (behavior) => {
      behavior.rules = behavior.rules.filter(
        (rule) =>
          rule.abilityId !== id &&
          !rule.conditions.some(
            (c) => ["ready", "target"].includes(c.kind) && c.ref === id,
          ),
      );
      for (const phase of behavior.phases) {
        phase.abilityIds = phase.abilityIds.filter((value) => value !== id);
        phase.onEnter = phase.onEnter.filter(
          (action) => action.abilityId !== id,
        );
      }
    });
  }
  for (const level of p.levels) {
    for (const event of level.events ?? [])
      event.actions = event.actions.filter(
        (action) => action.speciesId !== ownerId || action.abilityId !== id,
      );
    level.events = level.events?.filter((event) => event.actions.length > 0);
  }
}

export type AbilityTemplate =
  | "shot"
  | "contact"
  | "heal"
  | "regeneration"
  | "slow";
export const ABILITY_TEMPLATES: Record<AbilityTemplate, string> = {
  shot: "Tir à distance",
  contact: "Attaque au contact",
  heal: "Soin d’un allié",
  regeneration: "Régénération personnelle",
  slow: "Ralentissement",
};
export function createAbility(
  p: GameProject,
  template: AbilityTemplate,
  ownerId?: string,
): AbilityDefinition {
  const effect = newEffect(
    template === "heal"
      ? "heal"
      : template === "regeneration"
        ? "regeneration"
        : template === "slow"
          ? "slow"
          : "damage",
  );
  const ability = newAbility(effect.id);
  ability.name = ABILITY_TEMPLATES[template];
  ability.mechanics = {};
  if (template === "heal" || template === "regeneration") {
    ability.target = template === "heal" ? "ally" : "self";
    ability.priority = template === "heal" ? "wounded" : "nearest";
    effect.amount = 4;
  } else if (template !== "slow") {
    effect.valueSource = "attack";
    effect.amount = 1;
  }
  if (template === "shot" || template === "slow") {
    const projectile = newProjectile();
    p.combat!.projectiles.push(projectile);
    ability.delivery = "projectile";
    ability.projectileId = projectile.id;
  }
  if (template === "contact") {
    ability.mechanics = { contact: true };
    ability.rangeSource = "fixed";
    ability.range = 0.8;
  }
  p.combat!.effects.push(effect);
  p.combat!.abilities.push(ability);
  if (ownerId) combatOwner(p, ownerId).ability_ids!.push(ability.id);
  return ability;
}
