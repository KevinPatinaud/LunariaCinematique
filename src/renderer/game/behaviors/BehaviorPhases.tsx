import { useState } from "react";
import type { GameProject } from "../../../shared/game/types.js";
import type {
  BehaviorDefinition,
  BehaviorPhase,
} from "../../../shared/game/logic.js";
import {
  appendPhase,
  removePhase,
} from "../../../shared/game/behaviorAuthoring.js";
import { ActionEditor, Select } from "../LogicFields.js";
import { Num } from "../CombatFields.js";
import type { EditBehavior } from "./BehaviorRules.js";
export function BehaviorPhases({
  project,
  behavior: b,
  edit,
  abilityIds,
}: {
  project: GameProject;
  behavior: BehaviorDefinition;
  edit: EditBehavior;
  abilityIds: string[];
}) {
  const [selected, setSelected] = useState(0),
    index = Math.min(selected, b.phases.length - 1),
    phase = b.phases[index];
  const update = (patch: Partial<BehaviorPhase>, key = "") =>
    edit(
      (d) => Object.assign(d.phases[index], patch),
      key,
      "Modifier une phase de combat",
    );
  return (
    <section className="behavior-phases">
      <h2>Phases de combat</h2>
      <p>
        Le combat commence dans la première phase. Une baisse des PV peut
        franchir plusieurs seuils : les entrées sont jouées dans l’ordre, une
        seule fois. Un soin ne fait pas revenir en arrière.
      </p>
      <div className="behavior-phase-layout">
        <nav aria-label="Phases du comportement">
          {b.phases.map((f, i) => (
            <button
              key={i}
              aria-pressed={i === index}
              className={i === index ? "selected" : ""}
              onClick={() => setSelected(i)}
            >
              <b>
                {i + 1}. {f.name}
              </b>
              <small>
                {i === 0
                  ? "Dès le début du combat"
                  : "PV ≤ " + f.healthBelow + " %"}
              </small>
            </button>
          ))}
          <button
            disabled={b.phases.length >= 8 || b.phases.at(-1)!.healthBelow <= 0}
            onClick={() => {
              const index = b.phases.length;
              edit(
                (d) => {
                  appendPhase(d);
                },
                "",
                "Ajouter une phase",
              );
              setSelected(index);
            }}
          >
            + Phase
          </button>
        </nav>
        <div className="behavior-phase-form">
          <label className="gd-field">
            <span>Nom phase {index + 1}</span>
            <input
              aria-label={"Nom phase " + (index + 1)}
              maxLength={120}
              value={phase.name}
              onChange={(e) =>
                update({ name: e.target.value }, "phase:" + index + ":name")
              }
            />
          </label>
          <div className="gd-form-grid">
            {index > 0 && (
              <Num
                label={"Seuil PV phase " + (index + 1) + " (%)"}
                value={phase.healthBelow}
                min={
                  b.phases[index + 1]
                    ? b.phases[index + 1].healthBelow + 0.01
                    : 0
                }
                max={b.phases[index - 1].healthBelow - 0.01}
                change={(healthBelow) => update({ healthBelow })}
              />
            )}
            <Num
              label={"Vitesse phase " + (index + 1) + " (×)"}
              value={phase.speedFactor}
              max={3}
              change={(speedFactor) => update({ speedFactor })}
            />
            <Num
              label={"Cadence phase " + (index + 1) + " (×)"}
              value={phase.attackFactor}
              min={0.1}
              max={3}
              change={(attackFactor) => update({ attackFactor })}
            />
          </div>
          <p className="gd-note">
            ×1 conserve la valeur de référence. Une cadence ×2 double la
            fréquence des capacités. La vitesse de déplacement suit les règles
            du niveau.
          </p>
          <label className="logic-check">
            <input
              type="checkbox"
              checked={phase.inheritAbilities}
              onChange={(e) => update({ inheritAbilities: e.target.checked })}
            />
            Conserver les capacités de la fiche du personnage
          </label>
          <div className="logic-tags">
            {phase.abilityIds.map((id) => (
              <button
                key={id}
                aria-label={
                  "Retirer de la phase : " +
                  (project.combat!.abilities.find((a) => a.id === id)?.name ??
                    id)
                }
                onClick={() =>
                  update({
                    abilityIds: phase.abilityIds.filter((x) => x !== id),
                  })
                }
              >
                {project.combat!.abilities.find((a) => a.id === id)?.name ?? id}{" "}
                ×
              </button>
            ))}
          </div>
          <Select
            label={"Ajouter attaque phase " + (index + 1)}
            value=""
            change={(id) => {
              if (id) update({ abilityIds: [...phase.abilityIds, id] });
            }}
            options={[
              {
                id: "",
                name:
                  phase.abilityIds.length >= 8
                    ? "Maximum de 8 capacités supplémentaires"
                    : "Ajouter une capacité pour cette phase…",
              },
              ...(phase.abilityIds.length >= 8
                ? []
                : project.combat!.abilities.filter(
                    (a) => !phase.abilityIds.includes(a.id),
                  )),
            ]}
          />
          {!phase.inheritAbilities && !phase.abilityIds.length && (
            <p className="gd-callout">
              Cette phase n’a aucune capacité active. Seul le déplacement par
              défaut ou une règle de mouvement pourra agir.
            </p>
          )}
          <details className="behavior-entry-actions">
            <summary>Actions à l’entrée · {phase.onEnter.length}</summary>
            <ActionEditor
              project={project}
              self
              abilityIds={abilityIds}
              value={phase.onEnter}
              onChange={(onEnter) => update({ onEnter })}
            />
          </details>
          {index > 0 && (
            <button
              className="behavior-remove-phase"
              onClick={() => {
                edit(
                  (d) => removePhase(d, d.phases[index].id),
                  "",
                  "Supprimer une phase",
                );
                setSelected(Math.max(0, index - 1));
              }}
            >
              Supprimer cette phase
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
