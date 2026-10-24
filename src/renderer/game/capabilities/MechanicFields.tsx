import React from "react";
import type { AbilityDefinition } from "../../../shared/game/combat.js";
import type { AbilityMechanics } from "../../../shared/game/combatMechanics.js";
import { Num } from "../CombatFields.js";

export function MechanicFields({
  ability,
  attack,
  change,
}: {
  ability: AbilityDefinition;
  attack: number;
  change: (edit: (m: AbilityMechanics) => void, key: string) => void;
}) {
  const m = ability.mechanics ?? {};
  const field = <K extends keyof AbilityMechanics>(
    group: K,
    key: string,
    label: string,
    max: number,
    percent = false,
    min = 0,
  ) => {
    const settings = m[group] as unknown as Record<string, number>;
    return (
      <Num
        integer={key === "maxStacks" || key === "rows"}
        key={key}
        label={label}
        value={settings[key] * (percent ? 100 : 1)}
        min={min}
        max={max}
        change={(value) =>
          change(
            (next) => {
              (next[group] as unknown as Record<string, number>)[key] =
                value / (percent ? 100 : 1);
            },
            group + ":" + key,
          )
        }
      />
    );
  };
  return (
    <>
      {m.ricochet && (
        <section className="cap-block">
          <h3>Après l’impact : ricochet</h3>
          <p>
            Une seconde cible dans l’une des huit cases voisines. Les cases hors
            du plateau sont exclues.
          </p>
          <div className="gd-form-grid">
            {field(
              "ricochet",
              "chance",
              "Probabilité de ricochet (%)",
              100,
              true,
            )}
            {field(
              "ricochet",
              "power",
              "Puissance du ricochet (%)",
              1000,
              true,
            )}
          </div>
        </section>
      )}
      {m.trap && (
        <section className="cap-block">
          <h3>Pose et déclenchement du piège</h3>
          <div className="gd-form-grid">
            {field("trap", "offset", "Distance avant la cible (cases)", 8)}
            {field("trap", "armDelay", "Délai d’armement (s)", 30)}
          </div>
          <p>Le piège attend le passage d’un adversaire.</p>
        </section>
      )}
      {m.chain && (
        <section className="cap-block">
          <h3>Propagation de proximité</h3>
          {field(
            "chain",
            "range",
            "Distance maximale entre deux cibles (cases)",
            12,
            false,
            0.05,
          )}
          <p>
            La puissance diminue avec la distance entre chaque paire de cibles.
          </p>
        </section>
      )}
      {m.rainBloom && (
        <section className="cap-block">
          <h3>Sous la pluie : éclosion autour de la cible</h3>
          <div className="gd-form-grid">
            {field("rainBloom", "range", "Rayon de l’éclosion (cases)", 4)}
            {field(
              "rainBloom",
              "power",
              "Dégâts de l’éclosion (% de la référence)",
              1000,
              true,
            )}
          </div>
          <p>
            {(attack * m.rainBloom.power).toLocaleString("fr-FR")} PV bruts par
            voisin touché.
          </p>
        </section>
      )}
      {m.guard && (
        <section className="cap-block">
          <h3>Quand un allié est blessé : riposte</h3>
          <p>
            Le gardien disponible le plus proche riposte. Le poison gagne un
            palier à chaque riposte.
          </p>
          <div className="gd-form-grid">
            {field(
              "guard",
              "power",
              "Dégâts de riposte (% de la référence)",
              1000,
              true,
            )}
            {field(
              "guard",
              "maxStacks",
              "Paliers de poison maximum",
              10,
              false,
              1,
            )}
            {field("guard", "rows", "Allées voisines protégées", 4)}
          </div>
        </section>
      )}
      {m.combo && (
        <section className="cap-block">
          <h3>Combo et esquive-riposte</h3>
          <p>
            Trois frappes : 25 %, 25 %, puis 50 % des dégâts. La riposte
            intercepte une attaque immédiate à portée.
          </p>
          <div className="gd-form-grid">
            {field(
              "combo",
              "counterPower",
              "Puissance de la riposte (%)",
              1000,
              true,
            )}
            {field(
              "combo",
              "range",
              "Portée d’interception (cases)",
              12,
              false,
              0.05,
            )}
            {field("combo", "push", "Recul infligé (cases)", 4)}
          </div>
        </section>
      )}
    </>
  );
}
