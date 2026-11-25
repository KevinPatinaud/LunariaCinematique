import {
  DEFAULT_LEVEL_MASTERY_REWARDS,
  levelLunaRewardsOf,
  type LevelMasteryRewards,
} from "../../shared/game/lunas.js";
import type { LevelDefinition } from "../../shared/game/types.js";

export const levelLunaObjectives = [
  { key: "noPlantLost", label: "Sans perte", description: "Gagner sans perdre de plante." },
  { key: "noRain", label: "Sans pluie", description: "Gagner sans utiliser la pluie." },
  { key: "biodiversity", label: "Biodiversité", description: "Poser au moins une fois chaque plante autorisée et gagner." },
] as const;

export const biodiversityRequirement = "Nécessite au moins deux plantes autorisées.";

export function levelLunaRewardsWithObjective(
  level: LevelDefinition,
  key: keyof LevelMasteryRewards,
  enabled: boolean,
) {
  const rewards = levelLunaRewardsOf(level);
  rewards.mastery[key] = enabled ? DEFAULT_LEVEL_MASTERY_REWARDS[key] : 0;
  return rewards;
}
