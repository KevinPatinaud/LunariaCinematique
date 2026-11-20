import React, { useMemo, useState } from "react";
import { buildBalanceAudit } from "../../shared/balanceAudit.js";
import type { GameProject } from "../../shared/game/types.js";
import "./balanceAudit.css";

interface Props {
  project: GameProject;
  openPlant: (plantId: string) => void;
  openLevel: (levelId: string, tab: "waves" | "settings") => void;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0 s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins} min ${secs.toString().padStart(2, "0")} s` : `${secs} s`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR");
}

export function BalanceAuditView({ project, openPlant, openLevel }: Props) {
  const [plantFilter, setPlantFilter] = useState<"active" | "all">("active");
  const [levelFilter, setLevelFilter] = useState<"playable" | "all">("playable");

  const audit = useMemo(() => buildBalanceAudit(project), [project]);

  const visiblePlants = useMemo(() => {
    const active = audit.plants.filter((plant) => plant.usedInPlayableLevels > 0);
    if (plantFilter === "active" && active.length > 0) return active;
    return audit.plants;
  }, [audit.plants, plantFilter]);

  const visibleLevels = useMemo(() => {
    const playable = audit.levels.filter((row) => row.inCampaign && !row.preparing);
    if (levelFilter === "playable" && playable.length > 0) return playable;
    return audit.levels;
  }, [audit.levels, levelFilter]);

  const maxVisibleHp = useMemo(
    () => visibleLevels.reduce((max, row) => Math.max(max, row.totalEnemyHp), 0),
    [visibleLevels],
  );

  return (
    <main className="gd-scroll gd-audit" aria-label="Audit d’équilibrage du projet">
      <div className="gd-audit-header">
        <div className="gd-kicker">AUDIT D’ÉQUILIBRAGE EN DIRECT</div>
        <h1>Plantes, niveaux, économie & rythme</h1>
        <p>
          Ces tableaux se recalculent automatiquement à chaque modification des plantes,
          ennemis, vagues ou cinématiques du projet.
        </p>
      </div>

      <section className="gd-audit-kpis" aria-label="Synthèse de la campagne">
        <div className="gd-audit-kpi">
          <div className="gd-audit-kpi-label">Parcours jouable</div>
          <div className="gd-audit-kpi-value">
            {audit.summary.playableLevels} niveau{audit.summary.playableLevels > 1 ? "x" : ""}
          </div>
          <div className="gd-audit-kpi-sub">
            {audit.summary.playableSteps} étapes · {audit.summary.totalLevels} niveau
            {audit.summary.totalLevels > 1 ? "x" : ""} au total
          </div>
        </div>
        <div className="gd-audit-kpi">
          <div className="gd-audit-kpi-label">Plantes alliées actives</div>
          <div className="gd-audit-kpi-value">
            {audit.summary.usedPlantCount} / {audit.summary.totalPlantCount}
          </div>
          <div className="gd-audit-kpi-sub">utilisées dans le parcours jouable</div>
        </div>
        <div className="gd-audit-kpi">
          <div className="gd-audit-kpi-label">Ennemis actifs</div>
          <div className="gd-audit-kpi-value">
            {audit.summary.usedEnemyCount} / {audit.summary.activeEnemyCount}
          </div>
          <div className="gd-audit-kpi-sub">présents dans les vagues jouables</div>
        </div>
        <div className="gd-audit-kpi">
          <div className="gd-audit-kpi-label">Cinématiques du parcours</div>
          <div className="gd-audit-kpi-value">
            {audit.summary.playableCinematicsCount} film
            {audit.summary.playableCinematicsCount > 1 ? "s" : ""}
          </div>
          <div className="gd-audit-kpi-sub">
            {formatDuration(audit.summary.playableCinematicsDurationSec)} ·{" "}
            {formatNumber(audit.summary.playableCinematicsWords)} mots
          </div>
        </div>
      </section>

      {audit.alerts.length > 0 && (
        <section className="gd-audit-alerts" aria-label="Points d’attention détectés">
          <h2>Points d’attention détectés ({audit.alerts.length})</h2>
          <ul>
            {audit.alerts.map((alert) => (
              <li key={alert.id}>
                <div>
                  <strong>{alert.title}</strong>
                  <small>{alert.detail}</small>
                </div>
                {alert.levelId && (
                  <button onClick={() => openLevel(alert.levelId!, "waves")}>
                    Ouvrir le niveau
                  </button>
                )}
                {alert.plantId && (
                  <button onClick={() => openPlant(alert.plantId!)}>
                    Ouvrir la plante
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="gd-audit-section" aria-label="Tableau d’équilibrage des plantes alliées">
        <div className="gd-audit-section-head">
          <h2>Comparaison des plantes alliées</h2>
          <div className="gd-audit-filter" role="group" aria-label="Filtre des plantes">
            <button
              className={plantFilter === "active" ? "active" : ""}
              onClick={() => setPlantFilter("active")}
            >
              Actives ({audit.summary.usedPlantCount})
            </button>
            <button
              className={plantFilter === "all" ? "active" : ""}
              onClick={() => setPlantFilter("all")}
            >
              Tout le catalogue ({audit.summary.totalPlantCount})
            </button>
          </div>
        </div>

        <div className="level-rewards-table">
          <table>
            <caption>
              Coût, vie brute, rapport PV/graine, régénération, cooldown et dégâts des plantes
            </caption>
            <thead>
              <tr>
                <th>Plante</th>
                <th className="gd-audit-num">Coût</th>
                <th className="gd-audit-num">PV</th>
                <th className="gd-audit-num">PV / graine</th>
                <th className="gd-audit-num">Cooldown</th>
                <th className="gd-audit-num">Dégâts / DPS</th>
                <th>Rôle & portée</th>
                <th className="gd-audit-num">Niveaux</th>
                <th>Régler</th>
              </tr>
            </thead>
            <tbody>
              {visiblePlants.map((plant) => (
                <tr key={plant.id}>
                  <th scope="row">
                    {plant.name}
                    <small>{plant.ability || plant.id}</small>
                  </th>
                  <td className="gd-audit-num">{plant.cost}</td>
                  <td className="gd-audit-num">
                    {formatNumber(plant.maxHp)}
                    {plant.regenPerSec > 0 && (
                      <span className="gd-audit-badge" title="Régénération personnelle calculée">
                        +{plant.regenPerSec} PV/s
                      </span>
                    )}
                  </td>
                  <td className="gd-audit-num">
                    {plant.hpPerSeed !== null ? plant.hpPerSeed.toFixed(1) : "—"}
                  </td>
                  <td className="gd-audit-num">{plant.cooldown} s</td>
                  <td className="gd-audit-num">
                    {plant.damage > 0 ? (
                      <>
                        {plant.damage}
                        <span className="gd-audit-subtext">{plant.dps.toFixed(1)} DPS</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {plant.role}
                    <span className="gd-audit-subtext">Portée : {plant.range} c.</span>
                  </td>
                  <td className="gd-audit-num">
                    {plant.usedInPlayableLevels} / {audit.summary.playableLevels}
                  </td>
                  <td>
                    <button
                      aria-label={`Ouvrir la fiche de ${plant.name}`}
                      onClick={() => openPlant(plant.id)}
                    >
                      Ouvrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gd-audit-section" aria-label="Tableau d’économie et de courbe des niveaux">
        <div className="gd-audit-section-head">
          <h2>Courbe de difficulté, économie & rythme des niveaux</h2>
          <div className="gd-audit-filter" role="group" aria-label="Filtre des niveaux">
            <button
              className={levelFilter === "playable" ? "active" : ""}
              onClick={() => setLevelFilter("playable")}
            >
              Parcours jouable ({audit.summary.playableLevels})
            </button>
            <button
              className={levelFilter === "all" ? "active" : ""}
              onClick={() => setLevelFilter("all")}
            >
              Tous les niveaux ({audit.summary.totalLevels})
            </button>
          </div>
        </div>

        {visibleLevels.length > 0 ? (
          <div className="level-rewards-table">
            <table>
              <caption>
                Objectif, graines de départ, primes, nombre d’ennemis, PV cumulés et plantes autorisées par niveau
              </caption>
              <thead>
                <tr>
                  <th>Niveau</th>
                  <th>Objectif</th>
                  <th className="gd-audit-num">Graines départ</th>
                  <th className="gd-audit-num">Primes (vagues + kills)</th>
                  <th className="gd-audit-num">Ennemis</th>
                  <th>PV cumulés</th>
                  <th>Plantes</th>
                  <th>Répartition ennemis</th>
                  <th>Régler</th>
                </tr>
              </thead>
              <tbody>
                {visibleLevels.map((row) => {
                  const pct =
                    maxVisibleHp > 0
                      ? Math.min(100, Math.round((row.totalEnemyHp / maxVisibleHp) * 100))
                      : 0;
                  return (
                    <tr key={row.id}>
                      <th scope="row">
                        {row.title}
                        <small>
                          {!row.inCampaign
                            ? "Hors parcours"
                            : row.preparing
                              ? `Après fin · étape ${row.stepIndex + 1}`
                              : `Niveau ${row.positionNumber} · étape ${row.stepIndex + 1}`}
                        </small>
                      </th>
                      <td>
                        {row.objectiveLabel}
                        {row.laneCaptureReward !== null && row.laneCaptureReward > 0 && (
                          <span className="gd-audit-subtext">
                            +{row.laneCaptureReward} gr./allée
                          </span>
                        )}
                      </td>
                      <td className="gd-audit-num">{formatNumber(row.startingEnergy)}</td>
                      <td className="gd-audit-num">
                        {formatNumber(row.waveRewardTotal + row.killRewardTotal)}
                        <span className="gd-audit-subtext">
                          {formatNumber(row.waveRewardTotal)} v. + {formatNumber(row.killRewardTotal)} k.
                        </span>
                      </td>
                      <td className="gd-audit-num">
                        {formatNumber(row.enemyCount)}
                        {row.hasReinforcements && (
                          <span className="gd-audit-badge warn">+ renforts</span>
                        )}
                      </td>
                      <td className="gd-audit-hp-cell">
                        <strong>{formatNumber(row.totalEnemyHp)}</strong>
                        {row.hasReinforcements ? "+" : ""}
                        <div className="gd-audit-hp-bar" aria-hidden="true">
                          <div className="gd-audit-hp-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td>
                        <strong>{row.allowedPlantIds.length}</strong>
                        <span className="gd-audit-subtext">
                          {row.allowedPlantNames.join(", ") || "Aucune"}
                        </span>
                      </td>
                      <td>
                        {row.enemyBreakdown.length > 0 ? (
                          row.enemyBreakdown
                            .map((entry) => `${entry.name} ×${entry.count}`)
                            .join(", ")
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <button
                          aria-label={`Modifier les vagues de ${row.title}`}
                          onClick={() => openLevel(row.id, "waves")}
                        >
                          Vagues
                        </button>
                        <button
                          aria-label={`Modifier les paramètres de ${row.title}`}
                          onClick={() => openLevel(row.id, "settings")}
                        >
                          Paramètres
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gd-audit-empty">
            Crée ou place un niveau dans la campagne pour consulter son audit d’équilibrage.
          </div>
        )}
      </section>
    </main>
  );
}
