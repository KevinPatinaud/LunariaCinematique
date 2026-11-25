import React from "react";
import {
  campaignLunaSummary,
  biodiversityEligible,
  DEFAULT_LEVEL_LUNA_REWARDS,
  defaultLunaEconomy,
  expectedLunasPerEnemy,
  levelLunaRewardsOf,
  lunaEconomyOf,
  type LevelMasteryRewards,
  type LunaEnemyDropConfig,
} from "../../shared/game/lunas.js";
import { levelPosition, orderedLevels } from "../../shared/game/levelManagement.js";
import type { GameProject } from "../../shared/game/types.js";
import { Num } from "./CombatFields.js";
import {
  biodiversityRequirement,
  levelLunaObjectives,
  levelLunaRewardsWithObjective,
} from "./levelLunaObjectives.js";

function formatLunas(value: number): string {
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}

export function LunaEconomyEditor({
  project,
  change,
  openLevelLunas,
}: {
  project: GameProject;
  change: (edit: (p: GameProject) => void, key?: string, label?: string) => void;
  openLevelLunas: (levelId: string) => void;
}) {
  const economy = lunaEconomyOf(project);
  const drop = economy.enemyDrop;
  const campaign = campaignLunaSummary(project);
  const reward = DEFAULT_LEVEL_LUNA_REWARDS;

  const updateDrop = (patch: Partial<LunaEnemyDropConfig>, key = "") => {
    change(
      (draft) => {
        const next = lunaEconomyOf(draft);
        Object.assign(next.enemyDrop, patch);
        if (patch.smallAmount !== undefined) {
          next.enemyDrop.largeAmount = Math.max(patch.smallAmount, next.enemyDrop.largeAmount);
        }
        draft.lunas = next;
      },
      key && `lunas:${key}`,
      "Modifier les drops de Lunas",
    );
  };

  const updateObjective = (levelId: string, key: keyof LevelMasteryRewards, enabled: boolean) => {
    change(
      (draft) => {
        const level = draft.levels.find((item) => item.id === levelId);
        if (level) level.lunaRewards = levelLunaRewardsWithObjective(level, key, enabled);
      },
      "",
      "Modifier un objectif complémentaire",
    );
  };

  return (
    <main className="gd-rewards gd-scroll gd-level-main" aria-label="Économie Luna du projet">
      <h1>Économie Luna</h1>

      <section className="gd-reward-section gd-luna-objectives" aria-labelledby="luna-objectives-heading">
        <h2 id="luna-objectives-heading">Objectifs complémentaires par niveau</h2>
        <p>
          Les gains par défaut sont de <strong>{formatLunas(reward.firstClear)} Lunas</strong> à la première victoire
          et de <strong>{formatLunas(reward.mastery.noRain)} Lunas</strong> par objectif réalisé.
        </p>
        {project.levels.length > 0 ? (
          <div className="level-rewards-table gd-luna-objectives-table">
            <table aria-labelledby="luna-objectives-heading">
              <thead>
                <tr>
                  <th scope="col">Niveau</th>
                  {levelLunaObjectives.map(({ key, label, description }) => (
                    <th key={key} scope="col" title={description}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orderedLevels(project).map((level) => {
                  const position = levelPosition(project, level.id);
                  const rewards = levelLunaRewardsOf(level);
                  return (
                    <tr key={level.id}>
                      <th scope="row">
                        <button
                          className="gd-luna-level-link"
                          type="button"
                          aria-label={`Ouvrir la fiche Luna de ${level.title}`}
                          onClick={() => openLevelLunas(level.id)}
                        >
                          {level.title}
                        </button>
                        <small>{position.index < 0 ? "Hors parcours" : `Niveau ${position.number}`}</small>
                      </th>
                      {levelLunaObjectives.map(({ key, label, description }) => {
                        const ineligible = key === "biodiversity" && !biodiversityEligible(level.allowedPlants.length);
                        return (
                          <td key={key}>
                            <input
                              className="gd-luna-objective-check"
                              type="checkbox"
                              aria-label={`${label} — ${level.title}`}
                              aria-describedby={ineligible ? `luna-biodiversity-${level.id}` : undefined}
                              title={description}
                              checked={rewards.mastery[key] > 0}
                              onChange={(event) => updateObjective(level.id, key, event.currentTarget.checked)}
                            />
                            {ineligible && <small id={`luna-biodiversity-${level.id}`}>{biodiversityRequirement}</small>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Crée un niveau pour choisir ses objectifs.</p>
        )}
      </section>

      <details className="gd-luna-card">
        <summary>Drops aléatoires sur les pollueurs</summary>
        <label className="logic-check">
          <input
            type="checkbox"
            checked={drop.enabled}
            onChange={(event) => updateDrop({ enabled: event.currentTarget.checked })}
          />
          Activer les drops de Lunas
        </label>
        <div className="gd-form-grid">
          <Num
            label="Chance de drop par ennemi (%)"
            value={Number((drop.chance * 100).toFixed(4))}
            min={0}
            max={100}
            change={(percent) => updateDrop({ chance: Number((percent / 100).toFixed(6)) }, "chance")}
          />
          <Num
            label="Part du grand gain (%)"
            value={Number((drop.largeChance * 100).toFixed(4))}
            min={0}
            max={100}
            change={(percent) => updateDrop({ largeChance: Number((percent / 100).toFixed(6)) }, "largeChance")}
          />
          <Num
            label="Petit gain (Lunas)"
            value={drop.smallAmount}
            min={1}
            max={10000}
            integer
            change={(smallAmount) => updateDrop({ smallAmount }, "smallAmount")}
          />
          <Num
            label="Grand gain (Lunas)"
            value={drop.largeAmount}
            min={1}
            max={10000}
            integer
            change={(largeAmount) => updateDrop({ largeAmount }, "largeAmount")}
          />
        </div>
        <p>
          {expectedLunasPerEnemy(economy).toLocaleString("fr-FR", { maximumFractionDigits: 3 })} Luna en moyenne
          par pollueur éliminé. Les Lunas récoltés sont conservés à la victoire.
        </p>
        <button
          type="button"
          onClick={() => change(
            (draft) => { draft.lunas = defaultLunaEconomy(); },
            "",
            "Rétablir les drops Luna par défaut",
          )}
        >
          Rétablir les drops par défaut
        </button>
      </details>

      <details className="gd-luna-card">
        <summary>Synthèse de la campagne</summary>
        <div className="gd-luna-summary-strip">
          <div className="gd-luna-stat">
            <span>Premières victoires ({campaign.levelCount} niveaux)</span>
            <strong>{formatLunas(campaign.firstClearTotal)} Lunas</strong>
          </div>
          <div className="gd-luna-stat">
            <span>Primes de maîtrise</span>
            <strong>{formatLunas(campaign.masteryTotal)} Lunas</strong>
          </div>
          <div className="gd-luna-stat">
            <span>Drops estimés ({formatLunas(campaign.enemyCount)} ennemis)</span>
            <strong>~{formatLunas(campaign.expectedDrops)} Lunas</strong>
          </div>
          <div className="gd-luna-stat gd-luna-stat-total">
            <span>Total campagne estimé</span>
            <strong>~{formatLunas(campaign.expectedTotal)} Lunas</strong>
          </div>
        </div>
      </details>
    </main>
  );
}
