import type { GameProject } from "../../../shared/game/types.js";
import {
  MOVEMENTS,
  newRule,
  type BehaviorDefinition,
  type BehaviorRule,
} from "../../../shared/game/logic.js";
import { ConditionEditor, Select } from "../LogicFields.js";
export type EditBehavior = (
  edit: (draft: BehaviorDefinition) => void,
  key?: string,
  label?: string,
) => void;
export function BehaviorRules({
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
  function update(index: number, patch: Partial<BehaviorRule>, key = "") {
    edit(
      (d) => Object.assign(d.rules[index], patch),
      key,
      "Modifier une règle de priorité",
    );
  }
  return (
    <section className="behavior-rules">
      <h2>Choix des capacités</h2>
      <Select
        label="Utilisation des attaques"
        value={b.mode}
        change={(mode) =>
          edit(
            (d) => {
              d.mode = mode as BehaviorDefinition["mode"];
              if (mode === "priority" && !d.rules.length)
                d.rules.push(newRule());
            },
            "",
            "Changer le choix des capacités",
          )
        }
        options={[
          {
            id: "automatic",
            name: "Automatique — toutes les capacités disponibles",
          },
          { id: "priority", name: "Priorités — première règle exécutable" },
        ]}
      />
      {b.mode === "automatic" ? (
        <p className="gd-callout">
          Chaque capacité active se déclenche dès qu’elle est prête et dispose
          d’une cible. Les phases définissent les capacités actives.
        </p>
      ) : (
        <>
          <p>
            Les règles se lisent de haut en bas. Une capacité indisponible, en
            recharge ou sans cible laisse essayer la suivante.
          </p>
          {b.rules.map((r, i) => (
            <article
              className="logic-card behavior-rule"
              key={i}
              data-rule-id={r.id}
            >
              <div className="behavior-rule-heading">
                <b>Priorité {i + 1}</b>
                <div className="gd-inline">
                  <button
                    aria-label={"Monter règle " + (i + 1)}
                    disabled={i === 0}
                    onClick={() =>
                      edit(
                        (d) => {
                          [d.rules[i - 1], d.rules[i]] = [
                            d.rules[i],
                            d.rules[i - 1],
                          ];
                        },
                        "",
                        "Réordonner les priorités",
                      )
                    }
                  >
                    ↑
                  </button>
                  <button
                    aria-label={"Descendre règle " + (i + 1)}
                    disabled={i === b.rules.length - 1}
                    onClick={() =>
                      edit(
                        (d) => {
                          [d.rules[i + 1], d.rules[i]] = [
                            d.rules[i],
                            d.rules[i + 1],
                          ];
                        },
                        "",
                        "Réordonner les priorités",
                      )
                    }
                  >
                    ↓
                  </button>
                  <button
                    aria-label={"Supprimer règle " + (i + 1)}
                    onClick={() =>
                      edit(
                        (d) => {
                          d.rules.splice(i, 1);
                        },
                        "",
                        "Supprimer une règle",
                      )
                    }
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <label className="gd-field">
                <span>Nom règle {i + 1}</span>
                <input
                  aria-label={"Nom règle " + (i + 1)}
                  maxLength={120}
                  value={r.name}
                  onChange={(e) =>
                    update(i, { name: e.target.value }, "rule:" + i + ":name")
                  }
                />
              </label>
              <ConditionEditor
                project={project}
                actor
                abilityIds={abilityIds}
                value={r.conditions}
                onChange={(conditions) => update(i, { conditions })}
              />
              <div className="gd-form-grid">
                <Select
                  label={"Action de règle " + (i + 1)}
                  value={r.action}
                  change={(action) =>
                    update(i, {
                      action: action as BehaviorRule["action"],
                      abilityId: "",
                    })
                  }
                  options={[
                    { id: "ability", name: "Utiliser une capacité" },
                    ...Object.entries(MOVEMENTS)
                      .filter(([id]) => b.team === "enemies" || id === "hold")
                      .map(([id, name]) => ({ id, name })),
                  ]}
                />
                {r.action === "ability" && (
                  <Select
                    label={"Attaque de règle " + (i + 1)}
                    value={r.abilityId}
                    change={(abilityId) => update(i, { abilityId })}
                    options={[
                      { id: "", name: "Première capacité active et prête" },
                      ...project.combat!.abilities.filter(
                        (a) =>
                          abilityIds.includes(a.id) || a.id === r.abilityId,
                      ),
                    ]}
                  />
                )}
              </div>
            </article>
          ))}
          <button
            disabled={b.rules.length >= 32}
            onClick={() =>
              edit(
                (d) => {
                  d.rules.push(newRule());
                },
                "",
                "Ajouter une règle",
              )
            }
          >
            + Règle
          </button>
          {!b.rules.length && (
            <p>Aucune règle : le déplacement par défaut est utilisé.</p>
          )}
        </>
      )}
    </section>
  );
}
