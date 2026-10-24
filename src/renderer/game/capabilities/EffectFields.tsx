import React from "react";
import {
  BENEFICIAL,
  EFFECT_KINDS,
  EFFECT_LABELS,
  FRACTION,
  INSTANT,
  PERIODIC,
  effectAmount,
  newEffect,
  type EffectDefinition,
} from "../../../shared/game/combat.js";
import { DAMAGE_LABELS, DAMAGE_TYPES } from "../../../shared/game/types.js";
import { Choice, Num } from "../CombatFields.js";

export function EffectFields({
  effect,
  stats,
  hostile,
  index,
  change,
  remove,
  move,
}: {
  effect: EffectDefinition;
  stats: { attack: number; strength: number };
  hostile: boolean;
  index: number;
  change: (patch: Partial<EffectDefinition>, key: string) => void;
  remove?: () => void;
  move?: () => void;
}) {
  const fraction = FRACTION.includes(effect.kind),
    periodic = PERIODIC.includes(effect.kind);
  const base =
    effect.valueSource === "attack"
      ? stats.attack
      : effect.valueSource === "strength"
        ? stats.strength
        : 1;
  const amount = effectAmount(effect, stats);
  const binding = effect.binding;
  const valueLabel = periodic
    ? "PV par déclenchement"
    : effect.kind === "damage"
      ? "Dégâts (PV)"
      : effect.kind === "heal"
        ? "Soin (PV)"
        : "Valeur";
  return (
    <section className="cap-effect" aria-label={"Effet " + (index + 1)}>
      <div className="gd-section-heading">
        <h3>
          {binding
            ? "Fronde : entrave et explosion"
            : EFFECT_LABELS[effect.kind]}
        </h3>
        <div className="gd-inline">
          {move && (
            <button aria-label={"Monter effet " + (index + 1)} onClick={move}>
              ↑
            </button>
          )}
          {remove && (
            <button
              aria-label={"Retirer effet " + (index + 1)}
              onClick={remove}
            >
              Retirer
            </button>
          )}
        </div>
      </div>
      <div className="gd-form-grid">
        {![
          "root",
          "stun",
          "armor_break",
          "cleanse",
          "counter_cooldown",
        ].includes(effect.kind) &&
          (fraction ? (
            <Num
              label={
                binding
                  ? "Ralentissement des déplacements et attaques (%)"
                  : "Intensité (%)"
              }
              value={amount * 100}
              max={
                ["damage_boost", "attack_speed_boost"].includes(effect.kind)
                  ? 300
                  : 95
              }
              change={(v) => change({ amount: v / 100 }, "amount")}
            />
          ) : (
            <Num
              label={valueLabel}
              value={amount}
              max={effect.kind === "reward_mark" ? 400 : 10000}
              integer={effect.kind === "reward_mark"}
              change={(v) =>
                change(
                  base > 0 &&
                    (effect.valueSource !== "attack" || v / base <= 10)
                    ? { amount: v / base }
                    : { amount: v, valueSource: "fixed" },
                  "amount",
                )
              }
            />
          ))}
        {!INSTANT.includes(effect.kind) && (
          <Num
            label={binding ? "Libération au plus tard (s)" : "Durée (s)"}
            value={effect.duration}
            min={0.05}
            max={120}
            change={(v) => change({ duration: v }, "duration")}
          />
        )}
        {(periodic || binding) && (
          <Num
            label="Intervalle des pulsations (s)"
            value={effect.tickInterval}
            min={0.05}
            max={30}
            change={(v) => change({ tickInterval: v }, "tickInterval")}
          />
        )}
      </div>
      {periodic && (
        <p className="cap-result">
          {(amount / effect.tickInterval).toLocaleString("fr-FR", {
            maximumFractionDigits: 2,
          })}{" "}
          PV par seconde, pendant {effect.duration} s.
        </p>
      )}
      {binding && (
        <>
          <div className="gd-form-grid">
            <Num
              label="Libération au plus tôt (s)"
              value={effect.duration * binding.minimumDurationRatio}
              min={effect.duration * 0.01}
              max={effect.duration}
              change={(v) =>
                change(
                  {
                    binding: {
                      ...binding,
                      minimumDurationRatio: v / effect.duration,
                    },
                  },
                  "minimumDuration",
                )
              }
            />
            <Num
              label="Dégâts par pulsation (PV)"
              value={stats.attack * binding.tickPower}
              max={stats.attack * 10}
              change={(v) =>
                change(
                  {
                    binding: {
                      ...binding,
                      tickPower: stats.attack > 0 ? v / stats.attack : 0,
                    },
                  },
                  "tickPower",
                )
              }
            />
            <Num
              label="Dégâts à la rupture (PV)"
              value={stats.attack * binding.burstPower}
              max={stats.attack * 10}
              change={(v) =>
                change(
                  {
                    binding: {
                      ...binding,
                      burstPower: stats.attack > 0 ? v / stats.attack : 0,
                    },
                  },
                  "burstPower",
                )
              }
            />
            <Num
              label="Dégâts sur les voisins (PV)"
              value={stats.attack * binding.splashPower}
              max={stats.attack * 10}
              change={(v) =>
                change(
                  {
                    binding: {
                      ...binding,
                      splashPower: stats.attack > 0 ? v / stats.attack : 0,
                    },
                  },
                  "splashPower",
                )
              }
            />
            <Num
              label="Rayon de l’explosion (cases)"
              value={binding.radius}
              max={4}
              change={(v) =>
                change({ binding: { ...binding, radius: v } }, "radius")
              }
            />
          </div>
          <p className="cap-result">
            Un coup d’une autre espèce alliée brise la fronde. Les dégâts
            périodiques et les explosions ne déclenchent pas de réaction en
            chaîne.
          </p>
        </>
      )}
      <details className="cap-advanced">
        <summary>Calcul et type de l’effet</summary>
        <div className="gd-form-grid">
          {!binding && (
            <Choice
              label="Type d’effet"
              value={effect.kind}
              options={EFFECT_KINDS.filter(
                (k) => BENEFICIAL.includes(k) === !hostile,
              ).map((k) => [k, EFFECT_LABELS[k]])}
              change={(kind) =>
                change(
                  {
                    ...newEffect(kind as EffectDefinition["kind"]),
                    id: effect.id,
                    name: effect.name,
                    counterStacking: false,
                  },
                  "kind",
                )
              }
            />
          )}
          {["damage", "heal", "poison", "regeneration"].includes(
            effect.kind,
          ) && (
            <>
              <Choice
                label="Calcul de la valeur"
                value={effect.valueSource}
                options={[
                  ["fixed", "Valeur fixe"],
                  ["attack", "Multiplicateur de la référence d’attaque"],
                  ["strength", "Multiplicateur de la puissance d’effet"],
                ]}
                change={(v) =>
                  change(
                    {
                      valueSource: v as EffectDefinition["valueSource"],
                      amount: v === "fixed" ? amount : 1,
                    },
                    "valueSource",
                  )
                }
              />
              <Num
                label="Valeur de calcul"
                value={effect.amount}
                max={effect.valueSource === "attack" ? 10 : 10000}
                change={(v) => change({ amount: v }, "amount")}
              />
            </>
          )}
          {["damage", "poison"].includes(effect.kind) && (
            <Choice
              label="Type de dégâts"
              value={effect.damageType}
              options={[
                ["inherit", "Type du personnage"],
                ...DAMAGE_TYPES.map(
                  (k) => [k, DAMAGE_LABELS[k]] as [string, string],
                ),
              ]}
              change={(v) =>
                change(
                  { damageType: v as EffectDefinition["damageType"] },
                  "damageType",
                )
              }
            />
          )}
        </div>
      </details>
    </section>
  );
}
