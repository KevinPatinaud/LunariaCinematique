import React, { useState } from "react";
import type { Asset } from "../../shared/model.js";
import type { GameProject } from "../../shared/game/types.js";
import {
  attackTypeLabel,
  combatReferences,
  deleteCombatItem,
} from "../../shared/game/combat.js";
import {
  cloneAbility,
  createAbility,
} from "../../shared/game/combatAuthoring.js";
import type { Change } from "../presentation/PresentationEditor.js";
import { AbilityEditor } from "./capabilities/AbilityEditor.js";
import "./capabilities/capabilities.css";

interface Props {
  assets: Asset[];
  project: GameProject;
  id: string;
  select: (id: string) => void;
  change: Change;
  report: (message: string) => void;
  run: (fn: () => Promise<void>) => Promise<void>;
}
/** Optional model library. Everyday editing lives on each character's capabilities tab. */
export function CombatEditor({
  assets,
  project,
  id,
  select,
  change,
  report,
}: Props) {
  const [query, setQuery] = useState(""),
    catalog = project.combat!,
    ability =
      catalog.abilities.find((x) => x.id === id) ?? catalog.abilities[0];
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  const refs = combatReferences(project, "abilities", ability.id);
  return (
    <div className="gd-balance gd-combat cap-library">
      <aside className="gd-catalog">
        <input
          aria-label="Rechercher une capacité"
          placeholder="Nom, personnage ou mécanique…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="gd-primary"
          onClick={() =>
            change(
              (p) => select(createAbility(p, "shot").id),
              "",
              "Créer un modèle",
            )
          }
        >
          + Créer un modèle
        </button>
        {catalog.abilities
          .filter((a) =>
            normalize(
              a.name +
                " " +
                attackTypeLabel(a, catalog) +
                " " +
                combatReferences(project, "abilities", a.id).join(" "),
            ).includes(normalize(query)),
          )
          .map((a) => (
            <button
              key={a.id}
              className={a.id === ability.id ? "selected" : ""}
              onClick={() => select(a.id)}
            >
              <b>{a.name}</b>
              <small>{attackTypeLabel(a, catalog)}</small>
              <small>
                {combatReferences(project, "abilities", a.id).join(" · ") ||
                  "Modèle libre"}
              </small>
            </button>
          ))}
      </aside>
      <main className="gd-scroll gd-balance-form">
        <div className="gd-section-heading">
          <h1>Bibliothèque de capacités</h1>
          <div className="gd-inline">
            <button
              onClick={() =>
                change(
                  (p) => select(cloneAbility(p, ability.id).id),
                  "",
                  "Dupliquer la capacité complète",
                )
              }
            >
              Dupliquer entièrement
            </button>
            <button
              disabled={refs.length > 0 || catalog.abilities.length <= 1}
              onClick={() => {
                try {
                  change(
                    (p) => deleteCombatItem(p, "abilities", ability.id),
                    "",
                    "Supprimer le modèle",
                  );
                  select("");
                } catch (e) {
                  report(String(e));
                }
              }}
            >
              Supprimer
            </button>
          </div>
        </div>
        <AbilityEditor
          key={ability.id}
          project={project}
          id={ability.id}
          assets={assets}
          change={change}
          select={select}
        />
      </main>
    </div>
  );
}
