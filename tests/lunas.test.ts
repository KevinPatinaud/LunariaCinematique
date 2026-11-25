import assert from "node:assert/strict";
import test from "node:test";
import {
  averageDropWhenTriggered,
  campaignLunaSummary,
  defaultLevelLunaRewards,
  defaultLunaEconomy,
  expectedLunasPerEnemy,
  levelLunaRewardsOf,
  levelLunaSummary,
  lunaEconomyOf,
} from "../src/shared/game/lunas.js";
import { seedProject } from "../src/shared/game/seed.js";
import { createProjectLevel, patchProjectLevel } from "../src/shared/game/levelManagement.js";
import { compileCampaign } from "../src/shared/game/campaign.js";
import { gameIssues, parseGameDraft, parseGameProject } from "../src/shared/game/validation.js";

test("Luna defaults match 10% enemy drop (80% of 5, 20% of 25) and 1000 / 3x250 level rewards", () => {
  const project = seedProject();
  const levelId = createProjectLevel(project, { kind: "campaign", beforeId: null });
  const level = project.levels.find((item) => item.id === levelId)!;

  const economy = lunaEconomyOf(project);
  assert.deepEqual(economy, {
    enemyDrop: {
      enabled: true,
      chance: 0.1,
      smallAmount: 5,
      largeAmount: 25,
      largeChance: 0.2,
    },
  });
  assert.ok(Math.abs(averageDropWhenTriggered(economy.enemyDrop) - 9) < 1e-9);
  assert.ok(Math.abs(expectedLunasPerEnemy(economy) - 0.9) < 1e-9);

  const rewards = levelLunaRewardsOf(level);
  assert.deepEqual(rewards, {
    firstClear: 1000,
    mastery: {
      noPlantLost: 250,
      noRain: 250,
      biodiversity: 250,
    },
  });

  const summary = levelLunaSummary(level, economy);
  assert.equal(summary.firstClear, 1000);
  assert.equal(summary.allowedPlantCount, 2);
  assert.equal(summary.biodiversityActive, true);
  assert.equal(summary.masteryTotal, 750);
  assert.equal(summary.guaranteedTotal, 1750);
  assert.equal(summary.enemyCount, 5);
  assert.ok(Math.abs(summary.expectedDrops - 4.5) < 1e-9);
});

test("Luna configuration validates cleanly, guards single-plant biodiversity, and rejects invalid bounds", () => {
  const project = seedProject();
  const levelId = createProjectLevel(project, { kind: "campaign", beforeId: null });
  project.lunas = {
    enemyDrop: {
      enabled: true,
      chance: 0.12,
      smallAmount: 10,
      largeAmount: 50,
      largeChance: 0.25,
    },
  };
  patchProjectLevel(project, levelId, {
    lunaRewards: {
      firstClear: 1200,
      mastery: {
        noPlantLost: 300,
        noRain: 250,
        biodiversity: 200,
      },
    },
  });

  const parsed = parseGameProject(project);
  assert.equal(parsed.lunas?.enemyDrop.chance, 0.12);
  assert.equal(parsed.levels[0].lunaRewards?.firstClear, 1200);
  assert.equal(parsed.levels[0].lunaRewards?.mastery.biodiversity, 200);
  assert.equal(parseGameDraft(project).lunas?.enemyDrop.largeAmount, 50);

  const compiled = compileCampaign(parsed);
  assert.deepEqual(compiled.lunas, parsed.lunas);
  assert.deepEqual(compiled.levels[0].lunaRewards, parsed.levels[0].lunaRewards);

  const campaign = campaignLunaSummary(parsed);
  assert.equal(campaign.levelCount, 1);
  assert.equal(campaign.firstClearTotal, 1200);
  assert.equal(campaign.masteryTotal, 750);
  assert.equal(campaign.guaranteedTotal, 1950);

  const invertedDrops = structuredClone(parsed);
  invertedDrops.lunas!.enemyDrop.smallAmount = 30;
  invertedDrops.lunas!.enemyDrop.largeAmount = 25;
  assert.ok(
    gameIssues(invertedDrops).some(
      (issue) => issue.severity === "error" && issue.path === "projet.lunas.enemyDrop",
    ),
  );

  const badChance = structuredClone(parsed);
  badChance.lunas!.enemyDrop.chance = 1.5;
  assert.ok(gameIssues(badChance).some((issue) => issue.severity === "error"));

  // Biodiversity with a single allowed plant emits a warning (not error) and contributes 0 to effective total.
  const singlePlant = structuredClone(parsed);
  singlePlant.levels[0].allowedPlants = [singlePlant.levels[0].allowedPlants[0]];
  const singlePlantIssues = gameIssues(singlePlant);
  assert.equal(singlePlantIssues.filter((i) => i.severity === "error").length, 0);
  assert.ok(
    singlePlantIssues.some(
      (i) => i.severity === "warning" && i.levelId === levelId && i.path.includes("lunaRewards"),
    ),
  );
  const singleSummary = levelLunaSummary(singlePlant.levels[0], lunaEconomyOf(singlePlant));
  assert.equal(singleSummary.biodiversityActive, false);
  assert.equal(singleSummary.masteryTotal, 550);

  const disabledDrop = defaultLunaEconomy();
  disabledDrop.enemyDrop.enabled = false;
  assert.equal(expectedLunasPerEnemy(disabledDrop), 0);

  patchProjectLevel(parsed, levelId, { lunaRewards: undefined });
  assert.equal(parsed.levels[0].lunaRewards, undefined);
  assert.deepEqual(levelLunaRewardsOf(parsed.levels[0]), defaultLevelLunaRewards());
});
