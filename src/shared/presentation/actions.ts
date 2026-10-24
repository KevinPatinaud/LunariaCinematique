import type { GameProject } from "../game/types.js";
import { possibleAbilities } from "../game/logic.js";
import {
  DEFAULT_ABILITY_PRESENTATION,
  BASE_SLOTS,
  type PresentationEvent,
} from "./types.js";
import {
  duration,
  releasePlan,
  resolveAnimation,
  resolvedEventCue,
  type Species,
} from "./runtime.js";

/** Include phase-only abilities: they need the same authoring surface as initial abilities. */
export function speciesAbilities(project: GameProject, owner: Species) {
  const ids = new Set(possibleAbilities(project, owner));
  return (project.combat?.abilities ?? []).filter((a) => ids.has(a.id));
}
export function speciesActionSlots(
  project: GameProject,
  owner: Species,
): string[] {
  const c = project.presentation;
  return [
    ...new Set([
      ...BASE_SLOTS,
      ...(c?.profiles
        .find((p) => p.id === c.defaultProfileId)
        ?.slots.map((s) => s.slot) ?? []),
      ...(c?.profiles
        .find((p) => p.id === owner.animationProfileId)
        ?.slots.map((s) => s.slot) ?? []),
      ...speciesAbilities(project, owner).map(
        (a) => (a.presentation ?? DEFAULT_ABILITY_PRESENTATION).slot,
      ),
    ]),
  ];
}
export function actionPresentation(
  project: GameProject,
  owner: Species,
  slot: string,
  abilityId = "",
) {
  const c = project.presentation!,
    profile = c.profiles.find((p) => p.id === owner.animationProfileId),
    binding = profile?.slots.find((s) => s.slot === slot),
    animation = resolveAnimation(project, owner, slot);
  const abilities = speciesAbilities(project, owner).filter(
      (a) => (a.presentation ?? DEFAULT_ABILITY_PRESENTATION).slot === slot,
    ),
    ability = abilities.find((a) => a.id === abilityId) ?? abilities[0];
  const p = ability?.presentation ?? DEFAULT_ABILITY_PRESENTATION,
    projectile =
      ability?.delivery === "projectile"
        ? project.combat?.projectiles.find((q) => q.id === ability.projectileId)
        : undefined;
  const interval = ability
    ? ability.cooldownSource === "fixed"
      ? ability.cooldown
      : "rate" in owner
        ? owner.rate
        : 1
    : 0;
  const plan = ability
    ? releasePlan(project, owner, ability, interval)
    : undefined;
  // The scheduler deliberately retains idle/walk for a generic instant self-support gesture.
  const keepsBase =
    !!ability &&
    "rate" in owner &&
    ability.target === "self" &&
    ability.delivery === "instant" &&
    animation?.id === "default_attack";
  const events: PresentationEvent[] = ability
    ? ["start", "release", "impact"]
    : slot === "spawn"
      ? ["spawn"]
      : slot === "death"
        ? ["death"]
        : slot === "phase_transition"
          ? ["phase_transition"]
          : [];
  const cues = events.map((event) => {
    const fallbacks =
      event === "start"
        ? [p.start]
        : event === "release"
          ? [p.releaseCue]
          : event === "impact"
            ? [p.impact, projectile?.presentation?.impact]
            : [];
    return { event, ...resolvedEventCue(project, owner, event, ...fallbacks) };
  });
  return {
    slot,
    animation,
    abilities,
    ability,
    projectile,
    interval,
    plan,
    cues,
    keepsBase,
    previewAnimation: keepsBase
      ? resolveAnimation(project, owner, "idle")
      : animation,
    source: binding
      ? profile?.id === c.defaultProfileId
        ? "default"
        : binding.animationId
          ? "profile"
          : "disabled"
      : "inherited",
    duration: animation ? duration(animation) : 0,
    releaseSource: ability
      ? p.release === "immediate"
        ? "immediate"
        : p.release === "delay"
          ? "delay"
          : animation?.markers.some((m) => m.type === "release")
            ? "marker"
            : "fallback"
      : undefined,
    // These times are in clip seconds. Projectile impact depends on travel and is previewed separately.
    previewEvents: cues
      .filter((x) => x.event !== "impact" || ability?.delivery === "instant")
      .map((x) => ({
        cue: x.cue,
        at:
          x.event === "start" || !ability
            ? 0
            : (plan?.delay ?? 0) * (plan?.speed ?? 1),
      })),
  };
}
