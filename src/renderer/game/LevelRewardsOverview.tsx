import React from "react";
import { isConquest, type GameProject } from "../../shared/game/types.js";
import { levelPosition, levelRewardSummary, orderedLevels } from "../../shared/game/levelManagement.js";
export function LevelRewardsOverview({ project, openLevel }: {
  project: GameProject;
  openLevel: (id: string, tab: "waves" | "settings") => void;
}) {
  return (
    <main className="gd-rewards gd-scroll gd-level-main">
      <div className="gd-kicker">ÉQUILIBRAGE DES NIVEAUX</div>
      <h1>Graines des niveaux</h1>
      <p>Compare les réserves et les primes. Chaque réglage s’ouvre dans le niveau concerné ; les graines au recyclage se règlent dans la fiche de l’ennemi.</p>
      <section
        className="gd-reward-section"
        aria-label="Comparaison des récompenses des niveaux"
      >
        <h2>Comparer les niveaux</h2>
        <p>
          Les primes de vague sont versées une seule fois quand la vague est terminée. Un objectif de repli les verse après le départ du boss et de son escorte. Les graines au recyclage des ennemis ne sont pas incluses dans ces totaux.
        </p>
        {project.levels.length ? (
          <div className="level-rewards-table">
            <table>
              <caption>
                Graines initiales, primes des vagues et captures d’allées
              </caption>
              <thead>
                <tr>
                  <th>Niveau et parcours</th>
                  <th>Départ</th>
                  <th>Primes par vague</th>
                  <th>Total prévu</th>
                  <th>Par allée</th>
                  <th>Régler</th>
                </tr>
              </thead>
              <tbody>
                {orderedLevels(project).map((level) => {
                  const position = levelPosition(project, level.id),
                    reward = levelRewardSummary(level);
                  return (
                    <tr key={level.id}>
                      <th scope="row">
                        {level.title}
                        <small>
                          {position.index < 0
                            ? "Hors parcours"
                            : `Niveau ${position.number} · étape ${position.index + 1}`}
                        </small>
                      </th>
                      <td>{level.startingEnergy}</td>
                      <td>{reward.waves.join(" · ")}</td>
                      <td>{reward.waveTotal}</td>
                      <td>
                        {isConquest(level.objective.type)
                          ? reward.capture
                          : "—"}
                      </td>
                      <td>
                        <button
                          aria-label={"Modifier les vagues de " + level.title}
                          onClick={() => openLevel(level.id, "waves")}
                        >
                          Vagues
                        </button>
                        <button
                          aria-label={"Modifier l’objectif de " + level.title}
                          onClick={() => openLevel(level.id, "settings")}
                        >
                          Objectif
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Crée un niveau pour comparer ses récompenses.</p>
        )}
      </section>
    </main>
  );
}
