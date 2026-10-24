import type { GameProject } from "../game/types.js";
import { DEFAULT_ABILITY_PRESENTATION } from "./types.js";
import { PLAQUE_SLIME_PRESENTATION } from "./polluterAnimations.js";
import { DEFAULT_PRESENTATION, INITIAL_VISUALS } from "./artisticDefaults.js";
export { DEFAULT_PRESENTATION, INITIAL_VISUALS } from "./artisticDefaults.js";
export { newAnimation } from "./factories.js";
/** Authoring upgrade only. This function is never part of player save loading. */
export function ensurePresentation(p: GameProject): void {
  if (!p.presentation) {
    p.presentation = structuredClone(DEFAULT_PRESENTATION);
    for (const id of [
      "plaque",
      "runner",
      "cigarette",
      "plastic_bag",
      "poubelle",
    ])
      if (!p.balance.enemies.some((enemy) => enemy.id === id)) {
        p.presentation.animations = p.presentation.animations.filter(
          (animation) => animation.ownerSpeciesId !== id,
        );
        p.presentation.profiles = p.presentation.profiles.filter(
          (profile) => profile.id !== "profile_" + id,
        );
      }
    for (const s of [...p.balance.plants, ...p.balance.enemies]) {
      s.animationProfileId = "profile_" + s.id;
      s.visual = structuredClone(INITIAL_VISUALS[s.id]);
    }
    for (const a of p.combat?.abilities ?? [])
      a.presentation ??= structuredClone(DEFAULT_ABILITY_PRESENTATION);
    for (const q of p.combat?.projectiles ?? [])
      q.presentation =
        q.id === "proj_plaque_slime" &&
        p.balance.enemies.some((e) => e.id === "plaque")
          ? structuredClone(PLAQUE_SLIME_PRESENTATION)
          : {
              asset: "",
              animationId: "",
              trailVfxId: "",
              impact: { soundId: "", vfxId: "", attach: "center" },
            };
  }
  p.schemaVersion = 4;
}
