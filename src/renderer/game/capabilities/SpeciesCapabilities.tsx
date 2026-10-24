import React, { useState } from "react";
import type { Asset } from "../../../shared/model.js";
import type { GameProject } from "../../../shared/game/types.js";
import type { Change } from "../../presentation/PresentationEditor.js";
import {
  removeOwnerAbility,
  ABILITY_TEMPLATES,
  cloneAbility,
  combatOwner,
  createAbility,
  type AbilityTemplate,
} from "../../../shared/game/combatAuthoring.js";
import {
  attackTypeLabel,
  combatReferences,
} from "../../../shared/game/combat.js";
import { possibleAbilities } from "../../../shared/game/logic.js";
import { Choice, Num } from "../CombatFields.js";
import { AbilityEditor } from "./AbilityEditor.js";
import "./capabilities.css";

export function SpeciesCapabilities({
  project,
  ownerId,
  assets,
  change,
  editBehavior,
}: {
  project: GameProject;
  ownerId: string;
  assets: Asset[];
  change: Change;
  editBehavior: (id: string) => void;
}) {
  const owner = combatOwner(project, ownerId),
    [selected, setSelected] = useState("");
  const abilities = possibleAbilities(project, owner)
    .map((id) => project.combat!.abilities.find((a) => a.id === id)!)
    .filter(Boolean);
  const active = abilities.find((a) => a.id === selected) ?? abilities[0];
  const behavior = project.logic!.behaviors.find(
    (b) => b.id === owner.behaviorId,
  );
  const [model, setModel] = useState(""),
    [link, setLink] = useState(false);
  const full = abilities.length >= 8;
  function addExisting() {
    if (!model || full) return;
    change(
      (p) => {
        const ability = link
          ? p.combat!.abilities.find((a) => a.id === model)!
          : cloneAbility(p, model);
        if (!link)
          ability.name = p.combat!.abilities.find((a) => a.id === model)!.name;
        combatOwner(p, ownerId).ability_ids!.push(ability.id);
        setSelected(ability.id);
      },
      "",
      "Ajouter une capacité",
    );
  }
  return (
    <div className="cap-workspace">
      {abilities.length !== 1 && (
        <div className="cap-list" aria-label={"Capacités de " + owner.name}>
          {abilities.map((a) => (
            <button
              key={a.id}
              className={active?.id === a.id ? "selected" : ""}
              onClick={() => setSelected(a.id)}
            >
              <b>{a.name}</b>
              <small>{attackTypeLabel(a, project.combat!)}</small>
              {!owner.ability_ids?.includes(a.id) && (
                <small>Activée par une phase</small>
              )}
            </button>
          ))}
          {!abilities.length && (
            <p className="gd-callout">
              {owner.name} n’a aucune capacité. Ses points de vie et ses
              protections restent actifs.
            </p>
          )}
        </div>
      )}
      <details className="cap-add">
        <summary>+ Ajouter une capacité</summary>
        <div className="gd-form-grid">
          <Choice
            label="Créer à partir d’un modèle"
            value=""
            options={[
              ["", "Choisir…"],
              ...(Object.entries(ABILITY_TEMPLATES) as [string, string][]),
            ]}
            change={(template) => {
              if (!template || full) return;
              change(
                (p) => {
                  setSelected(
                    createAbility(p, template as AbilityTemplate, ownerId).id,
                  );
                },
                "",
                "Créer une capacité",
              );
            }}
          />
          <Choice
            label="Réutiliser une capacité existante"
            value={model}
            options={[
              ["", "Choisir dans la bibliothèque…"],
              ...project
                .combat!.abilities.filter(
                  (a) => !owner.ability_ids!.includes(a.id),
                )
                .map(
                  (a) =>
                    [
                      a.id,
                      a.name +
                        " · " +
                        (combatReferences(project, "abilities", a.id).join(
                          ", ",
                        ) || "Modèle libre"),
                    ] as [string, string],
                ),
            ]}
            change={setModel}
          />
        </div>
        <label className="gd-check">
          <input
            type="checkbox"
            checked={link}
            onChange={(e) => setLink(e.target.checked)}
          />
          Partager les réglages avec le modèle commun
        </label>
        <button disabled={!model || full} onClick={addExisting}>
          {link
            ? "Ajouter le modèle partagé"
            : "Ajouter une copie indépendante"}
        </button>
        {full && <p>Huit capacités maximum par personnage.</p>}
      </details>
      {active && (
        <>
          <AbilityEditor
            project={project}
            id={active.id}
            ownerId={ownerId}
            assets={assets}
            change={change}
            select={setSelected}
          />
          <button
            className="cap-remove"
            onClick={() =>
              change(
                (p) => removeOwnerAbility(p, ownerId, active.id),
                "",
                "Retirer une capacité",
              )
            }
          >
            Retirer « {active.name} » de {owner.name}
          </button>
        </>
      )}
      <details className="cap-advanced">
        <summary>Organisation du combat et valeurs de référence</summary>
        <p>
          {behavior?.mode === "automatic"
            ? "Les capacités disponibles se déclenchent automatiquement dès qu’une cible est à portée."
            : "Des règles de priorité choisissent les capacités à utiliser."}{" "}
          {behavior && behavior.phases.length > 1
            ? `${behavior.phases.length} phases de combat.`
            : ""}
        </p>
        <button onClick={() => editBehavior(owner.id)}>
          Configurer les priorités et phases
        </button>
        <div className="gd-form-grid">
          <Num
            label="Référence d’attaque (PV)"
            value={"damage" in owner ? owner.damage : owner.attack}
            max={600}
            change={(v) =>
              change(
                (p) => {
                  const x = combatOwner(p, ownerId);
                  if ("damage" in x) x.damage = v;
                  else x.attack = v;
                },
                ownerId + ":attack",
                "Modifier la référence",
              )
            }
          />
          {"rate" in owner && (
            <>
              <Num
                label="Cadence de référence (s)"
                value={owner.rate}
                min={0.1}
                max={15}
                change={(v) =>
                  change(
                    (p) => {
                      const x = combatOwner(p, ownerId);
                      if ("rate" in x) x.rate = v;
                    },
                    ownerId + ":rate",
                    "Modifier la cadence",
                  )
                }
              />
              <Num
                label="Portée de référence (cases)"
                value={owner.range}
                max={12}
                change={(v) =>
                  change(
                    (p) => {
                      const x = combatOwner(p, ownerId);
                      if ("range" in x) x.range = v;
                    },
                    ownerId + ":range",
                    "Modifier la portée",
                  )
                }
              />
              <Num
                label="Puissance d’effet de référence"
                value={owner.effect_strength}
                max={5}
                change={(v) =>
                  change(
                    (p) => {
                      const x = combatOwner(p, ownerId);
                      if ("effect_strength" in x) x.effect_strength = v;
                    },
                    ownerId + ":strength",
                    "Modifier la puissance",
                  )
                }
              />
            </>
          )}
        </div>
        <p>
          Ces références alimentent les capacités qui utilisent un
          multiplicateur. Les cartes affichent les valeurs calculées.
        </p>
      </details>
    </div>
  );
}
