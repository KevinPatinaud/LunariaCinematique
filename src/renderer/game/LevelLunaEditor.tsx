import React from "react";
import {
  biodiversityEligible,
  levelLunaRewardsOf,
  levelLunaSummary,
  lunaEconomyOf,
} from "../../shared/game/lunas.js";
import type { GameProject, LevelDefinition } from "../../shared/game/types.js";
import {
  biodiversityRequirement,
  levelLunaObjectives,
  levelLunaRewardsWithObjective,
} from "./levelLunaObjectives.js";

function formatLunas(value: number): string {
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}

export function LevelLunaEditor({
  project,
  level,
  updateLevel,
  openGlobalEconomy,
}: {
  project: GameProject;
  level: LevelDefinition;
  updateLevel: (patch: Partial<LevelDefinition>, key?: string) => void;
  openGlobalEconomy: () => void;
}) {
  const rewards = levelLunaRewardsOf(level);
  const summary = levelLunaSummary(level, lunaEconomyOf(project));

  return (
    <section className="gd-luna-level" aria-labelledby="level-luna-objectives">
      <div className="gd-section-heading">
        <div>
          <h2 id="level-luna-objectives">Objectifs complémentaires</h2>
          <p>Les primes sont versées une seule fois par niveau, à la victoire.</p>
        </div>
        <button type="button" onClick={openGlobalEconomy}>Économie Luna</button>
      </div>

      <div className="gd-luna-card">
        {levelLunaObjectives.map(({ key, label, description }) => {
          const ineligible = key === "biodiversity" && !biodiversityEligible(summary.allowedPlantCount);
          const explanationId = `level-luna-${key}`;
          return (
            <label key={key} className="logic-check gd-luna-objective-option">
              <input
                className="gd-luna-objective-check"
                type="checkbox"
                aria-label={label}
                aria-describedby={explanationId}
                checked={rewards.mastery[key] > 0}
                onChange={(event) => updateLevel({
                  lunaRewards: levelLunaRewardsWithObjective(level, key, event.currentTarget.checked),
                })}
              />
              <span>
                <strong>{label}</strong>
                <small id={explanationId}>
                  {description}{ineligible && ` ${biodiversityRequirement}`}
                </small>
              </span>
            </label>
          );
        })}
      </div>

      <p>
        <strong>{formatLunas(summary.firstClear)} Lunas</strong> à la première victoire ·{" "}
        <strong>{formatLunas(summary.masteryTotal)} Lunas</strong> en primes disponibles ·{" "}
        <strong>~{formatLunas(summary.expectedDrops)} Lunas</strong> en drops estimés
      </p>
    </section>
  );
}
