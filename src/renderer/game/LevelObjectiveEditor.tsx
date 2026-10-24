import React, { useState } from "react";
import type { Asset } from "../../shared/model.js";
import {
  OBJECTIVES,
  OBJECTIVE_LABELS,
  DAMAGE_LABELS,
  isConquest,
  type GameProject,
  type LevelDefinition,
} from "../../shared/game/types.js";
import {
  objectiveText,
  planObjectiveChange,
  setObjectiveTextMode,
  type ObjectiveType,
} from "../../shared/game/levelObjectives.js";
import { Num } from "./CombatFields.js";
import { ImagePicker } from "../presentation/ImagePicker.js";
import { EscortEditor } from "./EscortEditor.js";
import { InvasiveFociEditor } from "./InvasiveFociEditor.js";
import { StudioDialog } from "../components/StudioDialog.js";
export function LevelObjectiveEditor({
  project,
  level,
  assets,
  updateLevel,
}: {
  project: GameProject;
  level: LevelDefinition;
  assets: Asset[];
  updateLevel: (patch: Partial<LevelDefinition>, key?: string) => void;
}) {
  const [pending, setPending] = useState<ObjectiveType | null>(null);
  const plan = pending
    ? planObjectiveChange(level, pending, project.balance.enemies)
    : undefined;
  const apply = (next: LevelDefinition) =>
    updateLevel({
      ...next,
      escort: next.escort,
      invasiveFoci: next.invasiveFoci,
      protectedCell: next.protectedCell,
    });
  const requestChange = (type: ObjectiveType) => {
    const next = planObjectiveChange(level, type, project.balance.enemies);
    if (next.requiresReview) setPending(type);
    else apply(next.next);
  };
  return (
    <section
      className="level-objective-editor"
      aria-label="Configuration de l’objectif"
    >
      <div className="gd-form-grid">
        <label className="gd-field">
          <span>Type de niveau / objectif</span>
          <select
            aria-label="Objectif du niveau"
            value={level.objective.type}
            onChange={(e) => requestChange(e.target.value as ObjectiveType)}
          >
            {OBJECTIVES.map((x) => (
              <option key={x} value={x}>
                {OBJECTIVE_LABELS[x]}
              </option>
            ))}
          </select>
        </label>
        {isConquest(level.objective.type) && (
          <Num
            label="Graines par allée capturée"
            value={level.laneCaptureSeedReward ?? 0}
            max={10000}
            integer
            change={(laneCaptureSeedReward) =>
              updateLevel({ laneCaptureSeedReward })
            }
          />
        )}

      </div>
      {level.objective.type === "escort" && level.escort && (
        <EscortEditor
          value={level.escort}
          assets={assets}
          change={(escort) => updateLevel({ escort })}
        />
      )}{" "}
      {level.objective.type === "invasive_foci" && level.invasiveFoci && (
        <InvasiveFociEditor
          value={level.invasiveFoci}
          enemies={project.balance.enemies}
          change={(invasiveFoci) => updateLevel({ invasiveFoci })}
        />
      )}
      {level.objective.type === 'repel_boss' && <p className="gd-callout">Une seule vague : place un seul boss doté de « Poussées et surchauffe », au temps zéro dans une allée précise. Il annonce l’allée visée, avance et recule à chaque interruption. Les coups font monter sa résistance, puis la surchauffe. Attendre ne suffit pas. Son repli final dégage le passage et met fin au niveau ; son escorte repart sans récompense de destruction.</p>}
      {level.objective.type === "occupied_board" && (
        <p className="gd-callout">
          Place les ennemis case par case dans Vagues &amp; ennemis. Ils sont
          tous présents au lancement de chaque vague. Les colonnes 5 à 8 leur
          sont réservées ; les alliés se plantent dans les colonnes 1 à 4. Les
          Plaques continuent de produire des Canettes. Élimine tous les ennemis,
          renforts compris, pour terminer la vague.
        </p>
      )}
      {level.objective.type === "advance" && (
        <p className="gd-callout">
          Place les plantes dans les deux premières colonnes. Elles avancent
          vers la droite pendant les vagues. Deux adversaires face à face
          s'arrêtent au contact. Une allée conquise ne reçoit plus de nouveaux
          ennemis et verse le bonus configuré une seule fois. Le décor se
          restaure de 20 % par allée capturée ; les cinq allées doivent être
          conquises pour gagner.
        </p>
      )}
      {level.objective.type === "protect_cell" && level.protectedCell && (
        <section className="gd-protected-cell" aria-label="Case à protéger">
          <h2>Case à protéger</h2>
          <p>
            Choisis la case occupée par le personnage. Le joueur ne pourra pas y
            planter. Si ses PV tombent à zéro, la mission est perdue.
          </p>
          <div
            className="gd-protected-grid"
            role="group"
            aria-label="Position de la cible"
          >
            {Array.from({ length: 5 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => (
                <button
                  key={`${row}:${col}`}
                  type="button"
                  className={
                    level.protectedCell!.row === row &&
                    level.protectedCell!.col === col
                      ? "selected"
                      : ""
                  }
                  aria-label={`Allée ${row + 1}, colonne ${col + 1}`}
                  aria-pressed={
                    level.protectedCell!.row === row &&
                    level.protectedCell!.col === col
                  }
                  onClick={() =>
                    updateLevel({
                      protectedCell: {
                        ...level.protectedCell!,
                        row,
                        col,
                      },
                    })
                  }
                >
                  {level.protectedCell!.row === row &&
                  level.protectedCell!.col === col
                    ? "◆"
                    : ""}
                </button>
              )),
            )}
          </div>
          <p>
            Allée {level.protectedCell.row + 1}, colonne{" "}
            {level.protectedCell.col + 1} · les ennemis arrivent à droite.
          </p>
          <ImagePicker
            label="Image du personnage à protéger (PNG ou WebP transparent)"
            value={level.protectedCell.image ? [level.protectedCell.image] : []}
            assets={assets}
            category="character"
            change={(refs) =>
              updateLevel({
                protectedCell: {
                  ...level.protectedCell!,
                  image: (refs[0] ?? "") as `library://${string}`,
                },
              })
            }
            buttonLabel="Choisir ou importer une image"
          />
          <div className="gd-form-grid">
            <Num
              label="Points de vie de la cible"
              value={level.protectedCell.maxHp}
              min={1}
              max={6000}
              integer
              change={(maxHp) =>
                updateLevel({
                  protectedCell: {
                    ...level.protectedCell!,
                    maxHp,
                  },
                })
              }
            />
            <Num
              label="Armure physique (0 à 0,95)"
              value={level.protectedCell.armor}
              max={0.95}
              change={(armor) =>
                updateLevel({
                  protectedCell: {
                    ...level.protectedCell!,
                    armor,
                  },
                })
              }
            />
            {(["physical", "piercing", "toxic"] as const).map((kind) => (
              <Num
                key={kind}
                label={`Résistance ${DAMAGE_LABELS[kind]} (0 à 0,95)`}
                value={level.protectedCell!.resistances[kind]}
                max={0.95}
                change={(value) =>
                  updateLevel({
                    protectedCell: {
                      ...level.protectedCell!,
                      resistances: {
                        ...level.protectedCell!.resistances,
                        [kind]: value,
                      },
                    },
                  })
                }
              />
            ))}
          </div>
        </section>
      )}
      <section
        className="level-instruction"
        aria-label="Consigne de l’objectif"
      >
        <label className="gd-check">
          <input
            type="checkbox"
            aria-label="Consigne automatique"
            checked={level.objectiveTextMode === "automatic"}
            onChange={(e) => {
              const next = structuredClone(level);
              setObjectiveTextMode(next, e.target.checked);
              updateLevel({
                objectiveTextMode: next.objectiveTextMode,
                objectiveText: next.objectiveText,
              });
            }}
          />{" "}
          Utiliser la consigne automatique de cet objectif
        </label>
        <p>
          {level.objectiveTextMode === "automatic"
            ? "La consigne suit le type d’objectif. La modifier ci-dessous la transforme en texte rédigé."
            : "Ce texte est rédigé : changer d’objectif ne le remplacera pas, même s’il ressemble à une ancienne consigne par défaut."}
        </p>
        <label className="gd-field">
          <span>Consigne affichée</span>
          <textarea
            aria-label="Consigne du niveau"
            rows={2}
            maxLength={1000}
            value={objectiveText(level)}
            onChange={(e) =>
              updateLevel(
                { objectiveText: e.target.value, objectiveTextMode: "custom" },
                "objectiveText",
              )
            }
          />
        </label>
      </section>
      {pending && plan && (
        <StudioDialog
          title="Changer l’objectif du niveau"
          onClose={() => setPending(null)}
        >
          <p>
            Passer de <strong>{OBJECTIVE_LABELS[level.objective.type]}</strong>{" "}
            à <strong>{OBJECTIVE_LABELS[pending]}</strong> :
          </p>
          <ul>
            {plan.changes.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <p>
            Les vagues gardent leurs ennemis. La consigne rédigée et l’image du
            terrain restent intactes. L’ensemble du changement peut être annulé.
          </p>
          <footer>
            <button className="button subtle" onClick={() => setPending(null)}>
              Garder l’objectif actuel
            </button>
            <button
              className="button primary"
              onClick={() => {
                apply(
                  planObjectiveChange(level, pending, project.balance.enemies)
                    .next,
                );
                setPending(null);
              }}
            >
              Appliquer le nouvel objectif
            </button>
          </footer>
        </StudioDialog>
      )}
    </section>
  );
}
