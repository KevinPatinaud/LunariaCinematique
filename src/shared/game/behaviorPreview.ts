import type { GameProject } from "./types.js";
import {
  selectPhase,
  explainDecision,
  type BehaviorDefinition,
  type LogicContext,
  type BehaviorPhase,
} from "./logic.js";
import { behaviorOwner } from "./behaviorAuthoring.js";
export function phaseAbilities(
  owner: { ability_ids?: string[] },
  phase: BehaviorPhase,
  disabled: string[] = [],
) {
  return [
    ...new Set([
      ...(phase.inheritAbilities ? (owner.ability_ids ?? []) : []),
      ...phase.abilityIds,
    ]),
  ].filter((id) => !disabled.includes(id));
}
export interface BehaviorPreviewState {
  phaseId: string;
  entered: string[];
}
export function initialBehaviorPreview(): BehaviorPreviewState {
  return { phaseId: "", entered: [] };
}
/** Phase progression retains crossed thresholds, including after healing. No project mutation. */
export function advanceBehaviorPreview(
  b: BehaviorDefinition,
  state: BehaviorPreviewState,
  health: number,
): BehaviorPreviewState {
  if (health <= 0) return state;
  const previous = b.phases.findIndex((f) => f.id === state.phaseId),
    start = Math.max(0, previous),
    next = selectPhase(b, health, start);
  const entered =
    previous < 0
      ? b.phases.slice(0, next + 1).map((f) => f.id)
      : b.phases.slice(previous + 1, next + 1).map((f) => f.id);
  return {
    phaseId: b.phases[next].id,
    entered: [...(previous < 0 ? [] : state.entered), ...entered],
  };
}
export function inspectOwnerBehavior(
  p: GameProject,
  ownerId: string,
  b: BehaviorDefinition,
  state: BehaviorPreviewState,
  ctx: LogicContext,
  disabled: string[] = [],
) {
  const owner = behaviorOwner(p, ownerId);
  if (
    (p.balance.plants.some((s) => s.id === ownerId) ? "plants" : "enemies") !==
    b.team
  )
    throw Error(
      "Le porteur et le comportement appartiennent à des camps différents.",
    );
  const phase = b.phases.find((f) => f.id === state.phaseId) ?? b.phases[0],
    candidates = phaseAbilities(owner, phase, disabled);
  if (ctx.health <= 0)
    return {
      owner,
      phase,
      candidates: [],
      decision: {
        movement: "hold" as const,
        abilities: [] as string[],
        ruleId: "",
      },
      trace: [],
      active: false,
    };
  return {
    owner,
    phase,
    candidates,
    ...explainDecision(b, ctx, candidates),
    active: true,
  };
}
