import assert from "node:assert/strict";
import test from "node:test";
import { buildBalanceAudit } from "../src/shared/balanceAudit.js";
import { seedProject } from "../src/shared/game/seed.js";
import { createProjectLevel } from "../src/shared/game/levelManagement.js";

test("buildBalanceAudit computes plant HP/seed, DPS, regeneration and active level usage", () => {
  const project = seedProject();
  const rose = project.balance.plants.find((p) => p.id === "rose")!;
  const hazel = project.balance.plants.find((p) => p.id === "hazel")!;
  rose.cost = 50;
  rose.max_hp = 400;
  hazel.cost = 80;
  hazel.max_hp = 800;
  hazel.effect_strength = 2;

  const levelId = createProjectLevel(project, { kind: "campaign", beforeId: null });
  const level = project.levels.find((l) => l.id === levelId)!;
  level.allowedPlants = ["radish", "rose", "hazel"];
  level.startingEnergy = 500;
  level.waves = [
    {
      id: "w1",
      seedReward: 120,
      groups: [{ id: "g1", enemyId: "runner", count: 10, lane: -1, start: 0, interval: 2 }],
    },
  ];

  const audit = buildBalanceAudit(project);
  assert.equal(audit.summary.playableLevels, 1);
  assert.equal(audit.summary.usedPlantCount, 3);
  assert.equal(audit.summary.usedEnemyCount, 1);

  const roseRow = audit.plants.find((p) => p.id === "rose")!;
  const hazelRow = audit.plants.find((p) => p.id === "hazel")!;
  assert.equal(roseRow.hpPerSeed, 8);
  assert.equal(roseRow.regenPerSec, 0);
  assert.equal(roseRow.usedInPlayableLevels, 1);

  assert.equal(hazelRow.hpPerSeed, 10);
  assert.equal(hazelRow.regenPerSec, 8);
  assert.equal(hazelRow.dps, 0);

  const runner = project.balance.enemies.find((e) => e.id === "runner")!;
  const levelRow = audit.levels[0];
  assert.equal(levelRow.startingEnergy, 500);
  assert.equal(levelRow.waveRewardTotal, 120);
  assert.equal(levelRow.killRewardTotal, 10 * runner.reward);
  assert.equal(levelRow.enemyCount, 10);
  assert.equal(levelRow.totalEnemyHp, 10 * runner.hp);
  assert.equal(levelRow.hpShare, 1);
});

test("buildBalanceAudit detects HP spikes, energy drops, reinforcements and plant efficiency alerts", () => {
  const project = seedProject();
  const rose = project.balance.plants.find((p) => p.id === "rose")!;
  const hazel = project.balance.plants.find((p) => p.id === "hazel")!;
  // Make offensive Rose beat tank Hazel on raw HP/seed to trigger alert
  rose.cost = 40;
  rose.max_hp = 400; // 10 HP/seed
  hazel.cost = 80;
  hazel.max_hp = 640; // 8 HP/seed

  const lv1Id = createProjectLevel(project, { kind: "campaign", beforeId: null });
  const lv2Id = createProjectLevel(project, { kind: "campaign", beforeId: null });
  const lv1 = project.levels.find((l) => l.id === lv1Id)!;
  const lv2 = project.levels.find((l) => l.id === lv2Id)!;

  lv1.title = "Niveau 1";
  lv1.allowedPlants = ["rose", "hazel"];
  lv1.startingEnergy = 800;
  lv1.waves = [
    { id: "w1", seedReward: 50, groups: [{ id: "g1", enemyId: "runner", count: 10, lane: -1, start: 0, interval: 2 }] },
  ];

  lv2.title = "Niveau 2";
  lv2.allowedPlants = ["rose", "hazel"];
  lv2.startingEnergy = 300; // -62.5% drop
  lv2.waves = [
    {
      id: "w2",
      seedReward: 100,
      groups: [
        { id: "g2", enemyId: "runner", count: 40, lane: -1, start: 0, interval: 1 },
        { id: "g3", enemyId: "plaque", count: 2, lane: 1, start: 0, interval: 5 },
      ],
    },
  ];

  const audit = buildBalanceAudit(project);
  assert.ok(audit.alerts.some((a) => a.kind === "hp_spike" && a.levelId === lv2Id));
  assert.ok(audit.alerts.some((a) => a.kind === "energy_drop" && a.levelId === lv2Id));
  assert.ok(audit.alerts.some((a) => a.kind === "plant_efficiency" && a.plantId === "rose"));

  const lv2Row = audit.levels.find((row) => row.id === lv2Id)!;
  assert.equal(lv2Row.hasReinforcements, true);

  // Dynamically raising Hazel HP to 800 and Rose cost to 50 clears the plant efficiency alert
  rose.cost = 50;
  hazel.max_hp = 800;
  const updated = buildBalanceAudit(project);
  assert.equal(updated.alerts.some((a) => a.kind === "plant_efficiency"), false);
});
