import { playableCampaignSteps } from './campaign.js';
import { totalEnemies, type GameProject, type LevelDefinition } from './types.js';

/** Random Luna drop settings rolled deterministically on each defeated enemy. */
export interface LunaEnemyDropConfig {
  enabled: boolean;
  /** Drop probability per defeated enemy in [0, 1]. Default: 0.10 (10%). */
  chance: number;
  /** Smaller Luna amount awarded on a drop (integer >= 1). Default: 5. */
  smallAmount: number;
  /** Larger Luna amount awarded on a drop (integer >= smallAmount). Default: 25. */
  largeAmount: number;
  /** Probability in [0, 1] of rolling largeAmount instead of smallAmount on drop. Default: 0.20 (20%). */
  largeChance: number;
}

/** Project-level Luna gain settings. */
export interface LunaEconomyConfig {
  enemyDrop: LunaEnemyDropConfig;
}

/** One-time mastery bonuses per level. Setting a bonus to 0 disables it. */
export interface LevelMasteryRewards {
  /** Granted once on victory with zero plants lost to enemies. */
  noPlantLost: number;
  /** Granted once on victory with zero rain activations. */
  noRain: number;
  /** Granted once on victory after placing every available plant at least once (requires >= 2 allowed plants). */
  biodiversity: number;
}

/** Per-level Luna reward configuration. */
export interface LevelLunaRewards {
  /** Granted once on the first victory of this level. */
  firstClear: number;
  /** One-time mastery bonuses claimable on first clear or replay. */
  mastery: LevelMasteryRewards;
}

export const DEFAULT_LUNA_ENEMY_DROP: Readonly<LunaEnemyDropConfig> = Object.freeze({
  enabled: true,
  chance: 0.1,
  smallAmount: 5,
  largeAmount: 25,
  largeChance: 0.2,
});

export const DEFAULT_LEVEL_MASTERY_REWARDS: Readonly<LevelMasteryRewards> = Object.freeze({
  noPlantLost: 250,
  noRain: 250,
  biodiversity: 250,
});

export const DEFAULT_LEVEL_LUNA_REWARDS: Readonly<LevelLunaRewards> = Object.freeze({
  firstClear: 1000,
  mastery: DEFAULT_LEVEL_MASTERY_REWARDS,
});

export function defaultLunaEconomy(): LunaEconomyConfig {
  return {
    enemyDrop: { ...DEFAULT_LUNA_ENEMY_DROP },
  };
}

export function defaultLevelLunaRewards(): LevelLunaRewards {
  return {
    firstClear: DEFAULT_LEVEL_LUNA_REWARDS.firstClear,
    mastery: { ...DEFAULT_LEVEL_MASTERY_REWARDS },
  };
}

export function lunaEconomyOf(project: Pick<GameProject, 'lunas'>): LunaEconomyConfig {
  const drop = project.lunas?.enemyDrop;
  if (!drop) return defaultLunaEconomy();
  return {
    enemyDrop: {
      enabled: drop.enabled,
      chance: drop.chance,
      smallAmount: drop.smallAmount,
      largeAmount: drop.largeAmount,
      largeChance: drop.largeChance,
    },
  };
}

export function levelLunaRewardsOf(level: Pick<LevelDefinition, 'lunaRewards'>): LevelLunaRewards {
  const rewards = level.lunaRewards;
  if (!rewards) return defaultLevelLunaRewards();
  return {
    firstClear: rewards.firstClear,
    mastery: {
      noPlantLost: rewards.mastery.noPlantLost,
      noRain: rewards.mastery.noRain,
      biodiversity: rewards.mastery.biodiversity,
    },
  };
}

export function averageDropWhenTriggered(drop: LunaEnemyDropConfig): number {
  return drop.smallAmount * (1 - drop.largeChance) + drop.largeAmount * drop.largeChance;
}

export function expectedLunasPerEnemy(economy: LunaEconomyConfig): number {
  if (!economy.enemyDrop.enabled || economy.enemyDrop.chance <= 0) return 0;
  return economy.enemyDrop.chance * averageDropWhenTriggered(economy.enemyDrop);
}

export function biodiversityEligible(allowedPlantCount: number): boolean {
  return allowedPlantCount >= 2;
}

export function levelMasteryTotal(rewards: LevelLunaRewards, allowedPlantCount = 2): number {
  const biodiversityReward = biodiversityEligible(allowedPlantCount) ? rewards.mastery.biodiversity : 0;
  return rewards.mastery.noPlantLost + rewards.mastery.noRain + biodiversityReward;
}

export interface LevelLunaSummary {
  firstClear: number;
  noPlantLost: number;
  noRain: number;
  biodiversity: number;
  biodiversityActive: boolean;
  allowedPlantCount: number;
  masteryTotal: number;
  guaranteedTotal: number;
  enemyCount: number;
  expectedDrops: number;
  expectedTotal: number;
}

export function levelLunaSummary(level: LevelDefinition, economy: LunaEconomyConfig): LevelLunaSummary {
  const rewards = levelLunaRewardsOf(level);
  const allowedPlantCount = level.allowedPlants.length;
  const biodiversityActive = biodiversityEligible(allowedPlantCount) && rewards.mastery.biodiversity > 0;
  const masteryTotal = levelMasteryTotal(rewards, allowedPlantCount);
  const guaranteedTotal = rewards.firstClear + masteryTotal;
  const enemyCount = totalEnemies(level);
  const expectedDrops = enemyCount * expectedLunasPerEnemy(economy);
  return {
    firstClear: rewards.firstClear,
    noPlantLost: rewards.mastery.noPlantLost,
    noRain: rewards.mastery.noRain,
    biodiversity: rewards.mastery.biodiversity,
    biodiversityActive,
    allowedPlantCount,
    masteryTotal,
    guaranteedTotal,
    enemyCount,
    expectedDrops,
    expectedTotal: guaranteedTotal + expectedDrops,
  };
}

export interface CampaignLunaSummary {
  levelCount: number;
  firstClearTotal: number;
  masteryTotal: number;
  guaranteedTotal: number;
  enemyCount: number;
  expectedDrops: number;
  expectedTotal: number;
}

export function campaignLunaSummary(project: GameProject): CampaignLunaSummary {
  const economy = lunaEconomyOf(project);
  const playableIds = new Set(
    playableCampaignSteps(project)
      .filter((step) => step.kind === 'level')
      .map((step) => step.levelId),
  );
  const playableLevels = project.levels.filter((level) => playableIds.has(level.id));
  let firstClearTotal = 0;
  let masteryTotal = 0;
  let enemyCount = 0;
  let expectedDrops = 0;
  for (const level of playableLevels) {
    const summary = levelLunaSummary(level, economy);
    firstClearTotal += summary.firstClear;
    masteryTotal += summary.masteryTotal;
    enemyCount += summary.enemyCount;
    expectedDrops += summary.expectedDrops;
  }
  const guaranteedTotal = firstClearTotal + masteryTotal;
  return {
    levelCount: playableLevels.length,
    firstClearTotal,
    masteryTotal,
    guaranteedTotal,
    enemyCount,
    expectedDrops,
    expectedTotal: guaranteedTotal + expectedDrops,
  };
}
