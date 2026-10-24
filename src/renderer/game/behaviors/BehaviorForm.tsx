import { useState } from "react";
import { flushSync } from "react-dom";
import type { GameProject } from "../../../shared/game/types.js";
import {
  MOVEMENTS,
  possibleAbilities,
  type BehaviorDefinition,
} from "../../../shared/game/logic.js";
import { Select } from "../LogicFields.js";
import { BehaviorProbe } from "./BehaviorProbe.js";
import { BehaviorRules, type EditBehavior } from "./BehaviorRules.js";
import { BehaviorPhases } from "./BehaviorPhases.js";
import "./behaviors.css";

export function BehaviorForm({
  project,
  behavior: b,
  edit,
  ownerId,
  disabled = false,
  personal = false,
}: {
  project: GameProject;
  behavior: BehaviorDefinition;
  edit: EditBehavior;
  ownerId?: string;
  disabled?: boolean;
  personal?: boolean;
}) {
  const [view, setView] = useState<"movement" | "rules" | "phases" | "test">(
    "movement",
  );
  const owners = project.balance[b.team].filter((s) => s.behaviorId === b.id),
    owner = project.balance[b.team].find((s) => s.id === ownerId);
  let abilityIds: string[];
  if (personal && owner) {
    abilityIds = possibleAbilities(project, { ...owner, behaviorId: b.id });
  } else if (owners.length) {
    const available = owners.map((owner) => possibleAbilities(project, owner));
    abilityIds = available[0].filter((id) =>
      available.every((ids) => ids.includes(id)),
    );
  } else {
    abilityIds = project.combat!.abilities.map((a) => a.id);
  }
  return (
    <div
      className="behavior-form"
      onPointerDownCapture={(event) => {
        if (
          (event.target as Element).closest("button,summary") &&
          document.activeElement instanceof HTMLElement
        )
          flushSync(() => {
            (document.activeElement as HTMLElement).blur();
          });
      }}
    >
      <fieldset className="behavior-fields" disabled={disabled}>
        <label className="gd-field behavior-name">
          <span>Nom du comportement</span>
          <input
            aria-label="Nom du comportement"
            maxLength={120}
            value={b.name}
            onChange={(e) =>
              edit(
                (d) => {
                  d.name = e.target.value;
                },
                "name",
                "Renommer le comportement",
              )
            }
          />
        </label>
      </fieldset>
      <nav className="behavior-tabs" aria-label="Réglages du comportement">
        {(
          [
            ["movement", "Déplacement"],
            ["rules", "Priorités"],
            ["phases", "Phases"],
            ["test", "Tester"],
          ] as const
        ).map(([id, name]) => (
          <button
            key={id}
            type="button"
            className={view === id ? "active" : ""}
            aria-pressed={view === id}
            onClick={() => setView(id)}
          >
            {name}
          </button>
        ))}
      </nav>
      <fieldset className="behavior-fields" disabled={disabled}>
        <div hidden={view !== "movement"}>
          <h2>Déplacement et contact</h2>
          <Select
            label="Déplacement par défaut"
            value={b.fallback}
            change={(fallback) =>
              edit(
                (d) => {
                  d.fallback = fallback as BehaviorDefinition["fallback"];
                },
                "",
                "Modifier le déplacement par défaut",
              )
            }
            options={Object.entries(MOVEMENTS)
              .filter(([id]) => b.team === "enemies" || id === "hold")
              .map(([id, name]) => ({ id, name }))}
          />
          <p>
            Ce déplacement s’applique quand aucune règle de priorité ne choisit
            une autre action. Les plantes avancent uniquement quand l’objectif
            du niveau le prévoit.
          </p>
          {b.team === "enemies" && (
            <label className="logic-check">
              <input
                type="checkbox"
                checked={b.stopToAttack}
                onChange={(e) =>
                  edit(
                    (d) => {
                      d.stopToAttack = e.target.checked;
                    },
                    "",
                    "Modifier l’arrêt à portée",
                  )
                }
              />
              {b.mode === "automatic"
                ? "S’arrêter quand une cible adverse est à portée, même pendant la recharge"
                : "S’arrêter pour exécuter une capacité contre un adversaire"}
            </label>
          )}
          <label className="gd-field">
            <span>Notes du comportement</span>
            <textarea
              aria-label="Notes du comportement"
              maxLength={1000}
              rows={3}
              value={b.description}
              onChange={(e) =>
                edit(
                  (d) => {
                    d.description = e.target.value;
                  },
                  "description",
                  "Modifier les notes du comportement",
                )
              }
            />
          </label>
        </div>
        <div hidden={view !== "rules"}>
          <BehaviorRules
            project={project}
            behavior={b}
            edit={edit}
            abilityIds={abilityIds}
          />
        </div>
        <div hidden={view !== "phases"}>
          <BehaviorPhases
            project={project}
            behavior={b}
            edit={edit}
            abilityIds={abilityIds}
          />
        </div>
      </fieldset>
      <div hidden={view !== "test"}>
        {ownerId ? (
          <BehaviorProbe
            key={ownerId + ":" + b.id}
            project={project}
            behavior={b}
            ownerId={ownerId}
          />
        ) : (
          <p>
            Choisis un porteur dans le catalogue de ce camp pour tester ce
            modèle. L’essai ne l’attribue pas au personnage.
          </p>
        )}
      </div>
    </div>
  );
}
