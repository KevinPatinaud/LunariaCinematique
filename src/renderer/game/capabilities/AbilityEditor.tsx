import React, { useEffect, useState } from "react";
import type { Asset } from "../../../shared/model.js";
import type { GameProject } from "../../../shared/game/types.js";
import type { Change } from "../../presentation/PresentationEditor.js";
import {
  AbilityPresentationFields,
  ProjectilePresentationFields,
} from "../../presentation/PresentationFields.js";
import {
  abilityInterval,
  abilityRange,
  attackTypeLabel,
  BENEFICIAL,
  combatReferences,
  EFFECT_KINDS,
  EFFECT_LABELS,
  newEffect,
  newProjectile,
  type AbilityDefinition,
  type EffectDefinition,
} from "../../../shared/game/combat.js";
import {
  combatOwner,
  hasSharedDependencies,
  ownerStats,
  personalizeAbility,
} from "../../../shared/game/combatAuthoring.js";
import { mechanicEffectIds } from "../../../shared/game/combatMechanics.js";
import { Choice, Num } from "../CombatFields.js";
import { CombatProbe } from "../CombatProbe.js";
import { gameAPI } from "../bridge.js";
import { EffectFields } from "./EffectFields.js";
import { MechanicFields } from "./MechanicFields.js";

interface Props {
  project: GameProject;
  id: string;
  ownerId?: string;
  assets: Asset[];
  change: Change;
  select: (id: string) => void;
}
export function AbilityEditor({
  project,
  id,
  ownerId,
  assets,
  change,
  select,
}: Props) {
  const a = project.combat!.abilities.find((x) => x.id === id)!;
  const [shared, setShared] = useState(false),
    [testing, setTesting] = useState(false),
    [status, setStatus] = useState("");
  useEffect(() => {
    setShared(false);
    setStatus("");
  }, [id, ownerId]);
  const owners = [...project.balance.plants, ...project.balance.enemies];
  const [testSource, setTestSource] = useState(
    ownerId ??
      owners.find((x) => x.ability_ids?.includes(id))?.id ??
      owners[0].id,
  );
  const source = combatOwner(project, ownerId ?? testSource),
    stats = ownerStats(source);
  const [targetId, setTargetId] = useState(project.balance.enemies[0].id);
  const targetPool =
    a.target === "self"
      ? [source]
      : a.target === "ally"
        ? "damage" in source
          ? project.balance.plants
          : project.balance.enemies
        : "damage" in source
          ? project.balance.enemies
          : project.balance.plants;
  const target = targetPool.find((x) => x.id === targetId) ?? targetPool[0];
  const refs = combatReferences(project, "abilities", a.id);
  const linked = hasSharedDependencies(project, id, ownerId);
  const trajectory = project.combat!.projectiles.find(
    (x) => x.id === a.projectileId,
  );
  function edit(
    fn: (p: GameProject, ability: AbilityDefinition) => void,
    key = "",
  ) {
    change(
      (p) => {
        const current =
          ownerId && !shared && hasSharedDependencies(p, id, ownerId)
            ? personalizeAbility(p, ownerId, id)
            : p.combat!.abilities.find((x) => x.id === id)!;
        fn(p, current);
        for (const key of Object.keys(current))
          if (
            (current as unknown as Record<string, unknown>)[key] === undefined
          )
            delete (current as unknown as Record<string, unknown>)[key];
        if (current.id !== id) select(current.id);
      },
      id + ":" + key,
      "Modifier la capacité",
    );
  }
  const patch = (data: Partial<AbilityDefinition>, key: string) =>
    edit((_p, a) => Object.assign(a, data), key);
  const extraEffects = mechanicEffectIds(a.mechanics).filter(
    (id) => !a.effects.includes(id),
  );
  async function test() {
    setTesting(true);
    setStatus("");
    try {
      const result = await gameAPI.testAbility(
        project,
        source.id,
        a.id,
        target.id,
      );
      if (result)
        setStatus(
          "Atelier de combat ouvert : pause, ralenti et allié de test disponibles.",
        );
    } catch (e) {
      setStatus(String(e));
    } finally {
      setTesting(false);
    }
  }
  return (
    <article className="cap-editor">
      <div className="cap-editor-heading">
        <div>
          <span className="gd-kicker">
            {attackTypeLabel(a, project.combat!)}
          </span>
          <h2 aria-label={a.name}>
            <input
              className="cap-title"
              aria-label="Nom de la capacité"
              maxLength={120}
              value={a.name}
              onChange={(e) => patch({ name: e.target.value }, "name")}
            />
          </h2>
        </div>
        <button
          className="gd-primary"
          disabled={testing}
          onClick={() => void test()}
        >
          {testing ? "Ouverture…" : "▶ Tester cette capacité"}
        </button>
      </div>
      {ownerId ? (
        <div className="cap-scope">
          <Choice
            label="Appliquer les modifications"
            value={shared ? "shared" : "personal"}
            options={[
              ["personal", "À " + source.name + " uniquement"],
              ["shared", "Au modèle commun"],
            ]}
            change={(v) => setShared(v === "shared")}
          />
          <p>
            {shared
              ? "Modèle commun : " +
                (refs.join(", ") || "aucun personnage") +
                (linked
                  ? " · ses effets et son projectile peuvent aussi être partagés."
                  : "")
              : linked
                ? "La première modification crée une copie complète pour " +
                  source.name +
                  "."
                : "Capacité indépendante de " + source.name + "."}
          </p>
        </div>
      ) : (
        <p className="gd-callout">
          Modèle commun · utilisé par {refs.join(", ") || "aucun personnage"}.
          Les changements concernent tous ses utilisateurs.
        </p>
      )}
      {status && (
        <p role="status" className="gd-callout">
          {status}
        </p>
      )}
      <section className="cap-block">
        <h3>Quand et sur qui ?</h3>
        <div className="gd-form-grid">
          <Num
            label="Intervalle entre utilisations (s)"
            value={abilityInterval(a, stats)}
            min={0.1}
            max={120}
            change={(v) =>
              patch({ cooldownSource: "fixed", cooldown: v }, "cooldown")
            }
          />
          <Choice
            label="Cible"
            value={a.target}
            options={[
              ["opponent", "Adversaires"],
              ["ally", "Alliés"],
              ["self", "Soi-même"],
            ]}
            change={(v) =>
              patch(
                {
                  target: v as AbilityDefinition["target"],
                  ...(v !== "opponent"
                    ? {
                        delivery: "instant",
                        projectileId: "",
                        forwardCells: undefined,
                        attachToTarget: false,
                        blocksTargetAttack: false,
                        allowBehind: false,
                        mechanics: {},
                      }
                    : {}),
                  ...(v === "self" ? { selection: "one", rowRadius: 0 } : {}),
                  ...(v !== "ally"
                    ? { excludeSelf: false, requiresActiveAttack: false }
                    : {}),
                  priority: v === "opponent" ? "nearest" : a.priority,
                },
                "target",
              )
            }
          />
          {a.target !== "self" && (
            <>
              <Num
                label="Portée (cases)"
                value={abilityRange(a, stats)}
                max={12}
                change={(v) =>
                  patch(
                    a.forwardCells
                      ? {
                          forwardCells: Math.max(1, Math.min(8, Math.round(v))),
                        }
                      : { rangeSource: "fixed", range: v },
                    "range",
                  )
                }
              />
              <Choice
                label="Nombre de cibles"
                value={a.selection}
                options={[
                  ["one", "Une cible"],
                  ["all", "Toutes à portée"],
                ]}
                change={(v) =>
                  patch(
                    {
                      selection: v as AbilityDefinition["selection"],
                      ...(v === "all"
                        ? { delivery: "instant", projectileId: "" }
                        : {}),
                    },
                    "selection",
                  )
                }
              />
            </>
          )}
        </div>
        <p className="cap-result">
          {a.target === "self"
            ? "S’active sur le porteur."
            : "Attend une cible à portée."}{" "}
          {a.mechanics?.guard
            ? "Riposte également lorsqu’un allié protégé est blessé."
            : a.mechanics?.combo
              ? "Peut également esquiver et riposter."
              : ""}
        </p>
      </section>
      <MechanicFields
        ability={a}
        attack={stats.attack}
        change={(fn, key) =>
          edit((_p, a) => {
            a.mechanics ??= {};
            fn(a.mechanics);
          }, key)
        }
      />
      <section className="cap-block">
        <h3>Ce qui se passe</h3>
        {a.effects.map((id, index) => {
          const effect = project.combat!.effects.find((x) => x.id === id);
          return effect ? (
            <EffectFields
              key={id}
              effect={effect}
              stats={stats}
              hostile={a.target === "opponent"}
              index={index}
              change={(data, key) =>
                edit(
                  (p, a) =>
                    Object.assign(
                      p.combat!.effects.find((x) => x.id === a.effects[index])!,
                      data,
                    ),
                  "effect:" + index + ":" + key,
                )
              }
              remove={() =>
                edit((_p, a) => {
                  a.effects.splice(index, 1);
                }, "removeEffect")
              }
              move={
                index > 0
                  ? () =>
                      edit((_p, a) => {
                        [a.effects[index - 1], a.effects[index]] = [
                          a.effects[index],
                          a.effects[index - 1],
                        ];
                      }, "order")
                  : undefined
              }
            />
          ) : (
            <p key={id}>Effet introuvable : {id}</p>
          );
        })}
        <Choice
          label="Ajouter un effet"
          value=""
          options={[
            ["", "Choisir un effet…"],
            ...EFFECT_KINDS.filter(
              (k) => BENEFICIAL.includes(k) === (a.target !== "opponent"),
            ).map((k) => [k, EFFECT_LABELS[k]] as [string, string]),
          ]}
          change={(kind) => {
            if (!kind || a.effects.length >= 8) return;
            edit((p, a) => {
              const effect = newEffect(kind as EffectDefinition["kind"]);
              p.combat!.effects.push(effect);
              a.effects.push(effect.id);
            }, "addEffect");
          }}
        />
      </section>
      {!!extraEffects.length && (
        <details className="cap-advanced">
          <summary>Effets de la riposte et récupération</summary>
          {extraEffects.map((effectId, index) => {
            const effect = project.combat!.effects.find(
              (x) => x.id === effectId,
            )!;
            return (
              <EffectFields
                key={effectId}
                effect={effect}
                index={index}
                stats={stats}
                hostile={!BENEFICIAL.includes(effect.kind)}
                change={(data, key) =>
                  edit(
                    (p, a) => {
                      const ids = mechanicEffectIds(a.mechanics).filter(
                        (id) => !a.effects.includes(id),
                      );
                      Object.assign(
                        p.combat!.effects.find((x) => x.id === ids[index])!,
                        data,
                      );
                    },
                    "reaction:" + index + ":" + key,
                  )
                }
              />
            );
          })}
        </details>
      )}
      <details className="cap-advanced">
        <summary>Ciblage et déclenchement avancés</summary>
        <div className="gd-form-grid">
          <Num
            label="Délai initial (s)"
            value={a.initialDelay}
            max={120}
            change={(v) => patch({ initialDelay: v }, "initialDelay")}
          />
          {a.target !== "self" && (
            <>
              <Num
                label="Allées adjacentes"
                value={a.rowRadius}
                max={4}
                integer
                change={(v) => patch({ rowRadius: v }, "rowRadius")}
              />
              <Choice
                label="Priorité"
                value={a.priority}
                options={[
                  ["nearest", "La plus proche"],
                  ["nearest_right", "La plus proche, à droite si égalité"],
                  ["rightmost", "La plus à droite"],
                  ["strongest", "Le plus de PV"],
                  ...(a.target === "ally"
                    ? [["wounded", "La plus blessée"] as [string, string]]
                    : []),
                  ["random", "Au hasard"],
                ]}
                change={(v) =>
                  patch(
                    { priority: v as AbilityDefinition["priority"] },
                    "priority",
                  )
                }
              />
            </>
          )}
          {a.target === "ally" && (
            <>
              <Choice
                label="Inclure le porteur"
                value={a.excludeSelf ? "no" : "yes"}
                options={[
                  ["yes", "Oui"],
                  ["no", "Non"],
                ]}
                change={(v) =>
                  patch({ excludeSelf: v === "no" }, "excludeSelf")
                }
              />
              <Choice
                label="Alliés admissibles"
                value={a.requiresActiveAttack ? "attacking" : "all"}
                options={[
                  ["all", "Tous"],
                  ["attacking", "En cours d’attaque"],
                ]}
                change={(v) =>
                  patch(
                    { requiresActiveAttack: v === "attacking" },
                    "requiresActiveAttack",
                  )
                }
              />
            </>
          )}
          {a.target === "opponent" && (
            <>
              <Choice
                label="Mode de frappe"
                value={
                  a.attachToTarget
                    ? "attach"
                    : a.forwardCells
                      ? "cells"
                      : a.delivery
                }
                options={[
                  ["instant", "Impact immédiat"],
                  ["projectile", "Projectile"],
                  ["cells", "Souffle sur les cases devant"],
                  ...("damage" in source
                    ? []
                    : [
                        ["attach", "Se poser sur la cible"] as [string, string],
                      ]),
                ]}
                change={(v) =>
                  edit((p, a) => {
                    a.attachToTarget = v === "attach";
                    a.blocksTargetAttack = v === "attach";
                    a.forwardCells = v === "cells" ? 3 : undefined;
                    a.delivery = v === "projectile" ? "projectile" : "instant";
                    a.selection = v === "cells" ? "all" : "one";
                    a.rowRadius = 0;
                    a.allowBehind = false;
                    a.priority = "nearest";
                    a.mechanics = {};
                    if (v === "attach") {
                      a.rangeSource = "fixed";
                      a.range = 0.05;
                    }
                    if (v === "projectile") {
                      const projectile = newProjectile();
                      p.combat!.projectiles.push(projectile);
                      a.projectileId = projectile.id;
                    } else a.projectileId = "";
                  }, "delivery")
                }
              />
              {a.forwardCells && (
                <Num
                  label="Cases devant le porteur"
                  value={a.forwardCells}
                  min={1}
                  max={8}
                  integer
                  change={(v) => patch({ forwardCells: v }, "forwardCells")}
                />
              )}
              <label className="gd-check">
                <input
                  type="checkbox"
                  checked={Boolean(a.allowBehind)}
                  disabled={a.delivery !== "projectile"}
                  onChange={(e) =>
                    patch({ allowBehind: e.target.checked }, "allowBehind")
                  }
                />
                Tirer dans les deux sens
              </label>
              {a.attachToTarget && (
                <label className="gd-check">
                  <input
                    type="checkbox"
                    checked={Boolean(a.blocksTargetAttack)}
                    onChange={(e) =>
                      patch(
                        { blocksTargetAttack: e.target.checked },
                        "blocksTargetAttack",
                      )
                    }
                  />
                  Empêcher la cible d’attaquer
                </label>
              )}
            </>
          )}
        </div>
        <label className="gd-field">
          <span>Description</span>
          <textarea
            value={a.description}
            maxLength={1000}
            onChange={(e) =>
              patch({ description: e.target.value }, "description")
            }
          />
        </label>
      </details>
      <details className="cap-advanced">
        <summary>Apparence, animation et sons</summary>
        {trajectory && (
          <>
            <Choice
              label="Aspect du projectile"
              value={trajectory.visualStyle ?? "auto"}
              options={[
                ["auto", "Selon le personnage"],
                ["nut", "Noisette"],
                ["aigrette", "Aigrette"],
                ["sprout", "Graine germée"],
                ["radish", "Radis"],
                ["lance", "Épine"],
                ["bud", "Bourgeon"],
                ["vine", "Liane"],
                ["slime", "Bave"],
              ]}
              change={(v) =>
                edit((p, a) => {
                  p.combat!.projectiles.find(
                    (x) => x.id === a.projectileId,
                  )!.visualStyle = v;
                }, "projectileStyle")
              }
            />
            <div className="gd-form-grid">
              {(
                [
                  "speed",
                  "lifetime",
                  "maxHits",
                  "splashRadius",
                  "rowRadius",
                  "hitRadius",
                  "size",
                ] as const
              ).map((key) => (
                <Num
                  key={key}
                  label={
                    {
                      speed: "Vitesse du projectile (cases/s)",
                      lifetime: "Durée du projectile (s)",
                      maxHits: "Contacts maximum",
                      splashRadius: "Rayon d’impact (cases)",
                      rowRadius: "Allées voisines touchées",
                      hitRadius: "Tolérance de contact",
                      size: "Taille du projectile",
                    }[key]
                  }
                  value={trajectory[key]}
                  max={
                    {
                      speed: 20,
                      lifetime: 30,
                      maxHits: 16,
                      splashRadius: 4,
                      rowRadius: 4,
                      hitRadius: 0.5,
                      size: 0.3,
                    }[key]
                  }
                  min={
                    {
                      speed: 0,
                      lifetime: 0.1,
                      maxHits: 1,
                      splashRadius: 0,
                      rowRadius: 0,
                      hitRadius: 0.01,
                      size: 0.02,
                    }[key]
                  }
                  integer={key === "maxHits" || key === "rowRadius"}
                  change={(v) =>
                    edit((p, a) => {
                      p.combat!.projectiles.find(
                        (x) => x.id === a.projectileId,
                      )![key] = v;
                    }, "projectile:" + key)
                  }
                />
              ))}
            </div>
            <ProjectilePresentationFields
              project={project}
              value={trajectory.presentation}
              assets={assets}
              change={(presentation) =>
                edit((p, a) => {
                  p.combat!.projectiles.find(
                    (x) => x.id === a.projectileId,
                  )!.presentation = presentation;
                }, "projectilePresentation")
              }
            />
          </>
        )}
        <AbilityPresentationFields
          project={project}
          value={a.presentation}
          change={(presentation) => patch({ presentation }, "presentation")}
        />
      </details>
      <details className="cap-advanced">
        <summary>Cible d’essai et calcul des résultats</summary>
        <div className="gd-form-grid">
          {!ownerId && (
            <Choice
              label="Personnage d’essai"
              value={source.id}
              options={owners.map((x) => [x.id, x.name])}
              change={setTestSource}
            />
          )}
          <Choice
            label="Cible d’essai"
            value={target.id}
            options={targetPool.map((x) => [x.id, x.name])}
            change={setTargetId}
          />
        </div>
        <CombatProbe
          key={source.id + ":" + target.id}
          project={project}
          ability={a}
          sourceId={source.id}
          targetId={target.id}
        />
      </details>
    </article>
  );
}
