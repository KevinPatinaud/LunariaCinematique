import { campaignOf } from "./game/campaign.js";
import { effectAmount } from "./game/combat.js";
import { levelPosition, levelRewardSummary, orderedLevels } from "./game/levelManagement.js";
import {
  activeEnemies,
  isConquest,
  OBJECTIVE_LABELS,
  type EnemyDefinition,
  type GameProject,
  type LevelDefinition,
  type PlantDefinition,
} from "./game/types.js";

export interface PlantAuditRow {
  id: string;
  name: string;
  role: string;
  ability: string;
  cost: number;
  maxHp: number;
  hpPerSeed: number | null;
  cooldown: number;
  damage: number;
  rate: number;
  dps: number;
  range: number;
  regenPerSec: number;
  usedInLevels: number;
  usedInPlayableLevels: number;
  usedLevelIds: string[];
}

export interface EnemyCountEntry {
  enemyId: string;
  name: string;
  count: number;
  totalHp: number;
}

export interface LevelAuditRow {
  id: string;
  title: string;
  positionNumber: number;
  stepIndex: number;
  inCampaign: boolean;
  preparing: boolean;
  objectiveType: LevelDefinition["objective"]["type"];
  objectiveLabel: string;
  startingEnergy: number;
  waveRewardTotal: number;
  killRewardTotal: number;
  laneCaptureReward: number | null;
  waveCount: number;
  enemyCount: number;
  hasReinforcements: boolean;
  totalEnemyHp: number;
  hpShare: number;
  allowedPlantIds: string[];
  allowedPlantNames: string[];
  enemyBreakdown: EnemyCountEntry[];
}

export interface BalanceAuditAlert {
  id: string;
  kind: "hp_spike" | "energy_drop" | "plant_efficiency";
  title: string;
  detail: string;
  levelId?: string;
  plantId?: string;
}

export interface BalanceAuditSummary {
  playableLevels: number;
  totalLevels: number;
  playableSteps: number;
  usedPlantCount: number;
  totalPlantCount: number;
  usedEnemyCount: number;
  activeEnemyCount: number;
  playableCinematicsCount: number;
  playableCinematicsDurationSec: number;
  playableCinematicsWords: number;
}

export interface BalanceAudit {
  summary: BalanceAuditSummary;
  plants: PlantAuditRow[];
  levels: LevelAuditRow[];
  alerts: BalanceAuditAlert[];
}

function plantRegenPerSec(project: GameProject, plant: PlantDefinition): number {
  const combat = project.combat;
  if (!combat || !plant.ability_ids?.length) return 0;
  let total = 0;
  for (const abilityId of plant.ability_ids) {
    const ability = combat.abilities.find((entry) => entry.id === abilityId);
    if (!ability || ability.target !== "self") continue;
    for (const effectId of ability.effects) {
      const effect = combat.effects.find((entry) => entry.id === effectId);
      if (!effect || effect.kind !== "regeneration") continue;
      const tick = effect.tickInterval > 0 ? effect.tickInterval : 1;
      const perTick = effectAmount(effect, {
        attack: plant.damage,
        strength: plant.effect_strength,
      });
      total += perTick / tick;
    }
  }
  return Math.round(total * 10) / 10;
}

function enemyHasReinforcements(enemy: EnemyDefinition | undefined): boolean {
  if (!enemy?.rules) return false;
  if (enemy.rules.reinforcements && enemy.rules.reinforcements.interval > 0) return true;
  if (enemy.rules.pushing && enemy.rules.pushing.escortCount > 0) return true;
  return false;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function computeCinematicsSummary(project: GameProject) {
  const campaign = campaignOf(project);
  const endIndex = campaign.steps.findIndex((step) => step.kind === "end");
  const playableSteps =
    endIndex >= 0 ? campaign.steps.slice(0, endIndex + 1) : campaign.steps;
  const usedFilmIds = new Set(
    playableSteps
      .filter((step): step is Extract<typeof step, { kind: "cinematic" }> => step.kind === "cinematic")
      .map((step) => step.cinematicId),
  );
  const embeddedById = new Map((project.cinematics ?? []).map((doc) => [doc.id, doc]));
  let totalDurationSec = 0;
  let totalWords = 0;
  for (const filmId of usedFilmIds) {
    const film = campaign.cinematics.find((entry) => entry.id === filmId);
    const doc = film ? embeddedById.get(film.documentId) : undefined;
    if (!doc) continue;
    for (const shot of doc.shots ?? []) {
      totalDurationSec += Number(shot.duration || 0);
      for (const bubble of shot.bubbles ?? []) {
        totalWords += countWords(String(bubble.text ?? ""));
      }
    }
  }
  return {
    playableSteps: playableSteps.length,
    playableCinematicsCount: usedFilmIds.size,
    playableCinematicsDurationSec: Math.round(totalDurationSec),
    playableCinematicsWords: totalWords,
  };
}

export function buildBalanceAudit(project: GameProject): BalanceAudit {
  const plantById = new Map(project.balance.plants.map((plant) => [plant.id, plant]));
  const enemyById = new Map(project.balance.enemies.map((enemy) => [enemy.id, enemy]));
  const ordered = orderedLevels(project);

  const rawLevels = ordered.map((level) => {
    const position = levelPosition(project, level.id);
    const inCampaign = position.index >= 0;
    const preparing = position.preparing;
    const reward = levelRewardSummary(level);

    let enemyCount = 0;
    let totalEnemyHp = 0;
    let killRewardTotal = 0;
    let hasReinforcements = level.objective.type === "invasive_foci";
    const countsByEnemy = new Map<string, number>();

    for (const wave of level.waves) {
      for (const group of wave.groups) {
        const count = Math.max(0, group.count);
        const enemy = enemyById.get(group.enemyId);
        enemyCount += count;
        totalEnemyHp += count * (enemy?.hp ?? 0);
        killRewardTotal += count * (enemy?.reward ?? 0);
        if (count > 0) {
          countsByEnemy.set(group.enemyId, (countsByEnemy.get(group.enemyId) ?? 0) + count);
          if (enemyHasReinforcements(enemy)) hasReinforcements = true;
        }
      }
    }

    if (level.objective.type === "invasive_foci" && level.invasiveFoci) {
      const focusId = level.invasiveFoci.focusEnemyId ?? "plaque";
      const focusCount = level.invasiveFoci.positions.length;
      if (focusCount > 0) {
        const focusEnemy = enemyById.get(focusId);
        enemyCount += focusCount;
        totalEnemyHp += focusCount * (focusEnemy?.hp ?? 0);
        killRewardTotal += focusCount * (focusEnemy?.reward ?? 0);
        countsByEnemy.set(focusId, (countsByEnemy.get(focusId) ?? 0) + focusCount);
      }
    }

    const enemyBreakdown: EnemyCountEntry[] = [...countsByEnemy.entries()]
      .map(([enemyId, count]) => {
        const enemy = enemyById.get(enemyId);
        return {
          enemyId,
          name: enemy?.name ?? enemyId,
          count,
          totalHp: count * (enemy?.hp ?? 0),
        };
      })
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));

    return {
      id: level.id,
      title: level.title,
      positionNumber: position.number,
      stepIndex: position.index,
      inCampaign,
      preparing,
      objectiveType: level.objective.type,
      objectiveLabel: OBJECTIVE_LABELS[level.objective.type] ?? level.objective.type,
      startingEnergy: level.startingEnergy,
      waveRewardTotal: reward.waveTotal,
      killRewardTotal,
      laneCaptureReward: isConquest(level.objective.type) ? reward.capture : null,
      waveCount: level.waves.length,
      enemyCount,
      hasReinforcements,
      totalEnemyHp,
      hpShare: 0,
      allowedPlantIds: [...level.allowedPlants],
      allowedPlantNames: level.allowedPlants.map((id) => plantById.get(id)?.name ?? id),
      enemyBreakdown,
    };
  });

  const maxHp = rawLevels.reduce((max, row) => Math.max(max, row.totalEnemyHp), 0);
  const levels: LevelAuditRow[] = rawLevels.map((row) => ({
    ...row,
    hpShare: maxHp > 0 ? Math.round((row.totalEnemyHp / maxHp) * 1000) / 1000 : 0,
  }));

  const playableLevelRows = levels.filter((row) => row.inCampaign && !row.preparing);
  const playableEnemyIds = new Set<string>();
  for (const row of playableLevelRows) {
    for (const entry of row.enemyBreakdown) playableEnemyIds.add(entry.enemyId);
  }

  const plants: PlantAuditRow[] = project.balance.plants.map((plant) => {
    const usedLevelIds = levels
      .filter((row) => row.allowedPlantIds.includes(plant.id))
      .map((row) => row.id);
    const usedInPlayableLevels = playableLevelRows.filter((row) =>
      row.allowedPlantIds.includes(plant.id),
    ).length;
    const hpPerSeed =
      plant.cost > 0 ? Math.round((plant.max_hp / plant.cost) * 10) / 10 : null;
    const dps =
      plant.rate > 0 && plant.damage > 0
        ? Math.round((plant.damage / plant.rate) * 10) / 10
        : 0;

    return {
      id: plant.id,
      name: plant.name,
      role: plant.role,
      ability: plant.ability,
      cost: plant.cost,
      maxHp: plant.max_hp,
      hpPerSeed,
      cooldown: plant.cooldown,
      damage: plant.damage,
      rate: plant.rate,
      dps,
      range: plant.range,
      regenPerSec: plantRegenPerSec(project, plant),
      usedInLevels: usedLevelIds.length,
      usedInPlayableLevels,
      usedLevelIds,
    };
  });

  const alerts: BalanceAuditAlert[] = [];
  for (let i = 1; i < playableLevelRows.length; i++) {
    const prev = playableLevelRows[i - 1];
    const curr = playableLevelRows[i];
    if (prev.totalEnemyHp > 0 && curr.totalEnemyHp >= prev.totalEnemyHp * 2.2) {
      const ratio = Math.round((curr.totalEnemyHp / prev.totalEnemyHp) * 10) / 10;
      alerts.push({
        id: `hp_spike:${curr.id}`,
        kind: "hp_spike",
        title: `Pic de PV cumulés sur « ${curr.title} » (×${ratio})`,
        detail: `${curr.totalEnemyHp.toLocaleString("fr-FR")} PV (${curr.enemyCount} ennemis) contre ${prev.totalEnemyHp.toLocaleString("fr-FR")} PV au niveau précédent.`,
        levelId: curr.id,
      });
    }
    if (prev.startingEnergy > 0 && curr.startingEnergy <= prev.startingEnergy * 0.55) {
      const dropPct = Math.round((1 - curr.startingEnergy / prev.startingEnergy) * 100);
      alerts.push({
        id: `energy_drop:${curr.id}`,
        kind: "energy_drop",
        title: `Chute de graines de départ sur « ${curr.title} » (−${dropPct} %)`,
        detail: `${curr.startingEnergy} graines contre ${prev.startingEnergy} sur « ${prev.title} ».`,
        levelId: curr.id,
      });
    }
  }

  const activePlayablePlants = plants.filter((plant) => plant.usedInPlayableLevels > 0);
  const pureTanks = activePlayablePlants.filter(
    (plant) => plant.damage === 0 && plant.hpPerSeed !== null,
  );
  const offensivePlants = activePlayablePlants.filter(
    (plant) => plant.damage > 0 && plant.hpPerSeed !== null,
  );
  for (const tank of pureTanks) {
    for (const fighter of offensivePlants) {
      if ((fighter.hpPerSeed ?? 0) > (tank.hpPerSeed ?? 0)) {
        alerts.push({
          id: `plant_efficiency:${fighter.id}:${tank.id}`,
          kind: "plant_efficiency",
          title: `${fighter.name} dépasse ${tank.name} en PV bruts / graine`,
          detail: `${fighter.hpPerSeed} PV/graine (avec ${fighter.damage} dégâts) contre ${tank.hpPerSeed} PV/graine pour ${tank.name}.`,
          plantId: fighter.id,
        });
      }
    }
  }

  const cinematics = computeCinematicsSummary(project);
  const usedPlantCount = activePlayablePlants.length;

  return {
    summary: {
      playableLevels: playableLevelRows.length,
      totalLevels: levels.length,
      playableSteps: cinematics.playableSteps,
      usedPlantCount,
      totalPlantCount: project.balance.plants.length,
      usedEnemyCount: playableEnemyIds.size,
      activeEnemyCount: activeEnemies(project.balance.enemies).length,
      playableCinematicsCount: cinematics.playableCinematicsCount,
      playableCinematicsDurationSec: cinematics.playableCinematicsDurationSec,
      playableCinematicsWords: cinematics.playableCinematicsWords,
    },
    plants,
    levels,
    alerts,
  };
}
