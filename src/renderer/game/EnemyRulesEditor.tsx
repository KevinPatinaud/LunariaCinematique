import type { GameProject, EnemyDefinition } from "../../shared/game/types.js";
import { enemyChoices, activeEnemies } from "../../shared/game/types.js";
import {
  enemyRules,
  defaultPushingRules,
  enemyRulesSummary,
  pushingAttackStages,
  updateEnemyRules,
  type EnemyRules,
} from "../../shared/game/enemyRules.js";
import type { Change } from "../presentation/PresentationEditor.js";
import { Num } from "./CombatFields.js";
export function EnemyRulesEditor({
  project,
  enemy,
  change,
}: {
  project: GameProject;
  enemy: EnemyDefinition;
  change: Change;
}) {
  const rules = enemyRules(enemy),
    groups = project.levels
      .filter((level) => level.objective.type !== "occupied_board")
      .flatMap((l) => l.waves.flatMap((w) => w.groups))
      .filter((g) => g.enemyId === enemy.id).length;
  const foci = project.levels.filter(
    (level) => level.invasiveFoci?.focusEnemyId === enemy.id,
  ).length;
  const set = (patch: Partial<EnemyRules>, key = "") =>
    change(
      (p) => updateEnemyRules(p, enemy.id, { ...rules, ...patch }),
      key ? "enemy-rules:" + enemy.id + ":" + key : "",
      "Modifier les règles du plateau de " + enemy.name,
    );
  const toggle = (
    field: "blocksEnemies" | "blocksPlanting" | "boss",
    label: string,
  ) => (
    <label className="logic-check">
      <input
        type="checkbox"
        checked={rules[field]}
        onChange={(e) => set({ [field]: e.target.checked })}
      />
      {label}
    </label>
  );
  return (
    <section aria-label={"Règles du plateau de " + enemy.name}>
      <h2>Règles du plateau</h2>
      <p>
        Ces propriétés appartiennent à cet ennemi. Elles sont conservées
        lorsqu’on le duplique. Les attaques et décisions se règlent dans
        Capacités et Comportement.
      </p>
      <h3>Apparition</h3>
      <div className="gd-form-grid">
        <label className="gd-field">
          <span>Mode d’apparition de l’ennemi</span>
          <select
            aria-label="Mode d’apparition de l’ennemi"
            value={rules.spawn.mode}
            onChange={(e) =>
              set({
                spawn: {
                  mode: e.target.value as EnemyRules["spawn"]["mode"],
                  x:
                    e.target.value === "placement"
                      ? Math.min(7.5, Math.floor(rules.spawn.x) + 0.5)
                      : rules.spawn.x,
                },
              })
            }
          >
            <option value="arrival">Arrivée à une position définie</option>
            <option value="placement">
              Case ou zone choisie dans la vague
            </option>
          </select>
        </label>
        {rules.spawn.mode === "placement" ? (
          <Num
            label="Colonne d’apparition par défaut"
            value={Math.floor(rules.spawn.x) + 1}
            min={1}
            max={8}
            integer
            change={(col) => set({ spawn: { ...rules.spawn, x: col - 0.5 } })}
          />
        ) : (
          <Num
            label="Position d’arrivée (cases)"
            value={rules.spawn.x}
            min={0.5}
            max={8.8}
            change={(x) => set({ spawn: { ...rules.spawn, x } })}
          />
        )}
      </div>
      <p className="gd-note">
        Le plateau couvre les positions 0 à 8 ; 8,45 place l’arrivée derrière
        son bord droit. Un plateau occupé utilise toujours les cases de la
        vague. Changer le mode adapte les positions de {groups} groupe(s)
        existant(s) dans les autres objectifs ; cette action est annulable.
      </p>
      {!!foci && (
        <p className="gd-callout">
          Cet ennemi sert de foyer dans {foci} niveau(x). Ces foyers exigent une
          apparition sur une case et une vitesse nulle. Choisis une autre espèce
          dans ces niveaux avant de changer ce rôle.
        </p>
      )}
      <h3>Obstacles et contact</h3>
      {toggle("blocksEnemies", "Bloquer les ennemis de la même allée")}
      {toggle("blocksPlanting", "Empêcher la plantation sur sa case")}
      <label className="logic-check">
        <input
          type="checkbox"
          checked={rules.contact === "solid"}
          onChange={(e) =>
            set({ contact: e.target.checked ? "solid" : "normal" })
          }
        />
        S’arrêter au contact d’une plante dans tous les objectifs
      </label>
      <p className="gd-note">
        Le blocage d’allée crée une file derrière l’obstacle. Il n’intercepte
        pas les projectiles. La vitesse et le comportement restent responsables
        de ses propres déplacements.
      </p>
      <h3>Renforts automatiques</h3>
      <label className="logic-check">
        <input
          type="checkbox"
          checked={!!rules.reinforcements}
          disabled={
            !rules.reinforcements &&
            !activeEnemies(project.balance.enemies).length
          }
          onChange={(e) =>
            set({
              reinforcements: e.target.checked
                ? {
                    enemyId:
                      activeEnemies(project.balance.enemies).find(
                        (e) => e.id !== enemy.id,
                      )?.id ?? enemy.id,
                    interval: 30,
                  }
                : undefined,
            })
          }
        />
        Produire des renforts pendant le combat
      </label>
      {rules.reinforcements && (
        <div className="gd-form-grid">
          <label className="gd-field">
            <span>Ennemi produit</span>
            <select
              aria-label="Ennemi produit"
              value={rules.reinforcements.enemyId}
              onChange={(e) =>
                set({
                  reinforcements: {
                    ...rules.reinforcements!,
                    enemyId: e.target.value,
                  },
                })
              }
            >
              {enemyChoices(
                project.balance.enemies,
                rules.reinforcements.enemyId,
              ).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {e.archived ? " (archivé)" : ""}
                </option>
              ))}
            </select>
          </label>
          <Num
            label="Période des renforts (s)"
            value={rules.reinforcements.interval}
            min={0.1}
            max={3600}
            change={(interval) =>
              set({ reinforcements: { ...rules.reinforcements!, interval } })
            }
          />
        </div>
      )}
      <p className="gd-note">
        Première arrivée après une période complète de combat, dans la même
        allée. La destruction du générateur arrête sa production. Un foyer
        invasif utilise les réglages du niveau à la place de ce cycle : les deux
        ne se cumulent pas.
      </p>
      <h3>Poussées et surchauffe</h3>
      <label className="logic-check"><input type="checkbox" aria-label="Poussées et surchauffe" checked={!!rules.pushing}
        onChange={e=>set({pushing:e.target.checked?defaultPushingRules():undefined, ...(e.target.checked?{boss:true,spawn:{mode:'arrival',x:7.6},blocksEnemies:false,reinforcements:undefined}:{})})}/>Contraindre ce boss au repli par surchauffe</label>
      {rules.pushing && <><p>Les coups et les entraves interrompent sa poussée sans retirer de PV. Chaque interruption chauffe son moteur. Chaque poussée interrompue accorde la prime de graines, y compris le dernier arrêt qui provoque son départ et celui de l’escorte. Mets la prime à 0 pour la désactiver. Utilise l’objectif « Contraindre un boss au repli ».</p>
        <p aria-label="Dégâts bruts par poussée">Dégâts bruts par poussée : <strong>{pushingAttackStages(enemy).join(" → ")}</strong> (avant les protections). La deuxième poussée utilise l’attaque de base ; chaque interruption ajoute 25 points de pourcentage de cette base.</p>
        <div className="gd-form-grid">
          <Num label="Poussées à interrompre" value={rules.pushing.stops} min={1} max={5} integer change={stops=>set({pushing:{...rules.pushing!,stops}})}/>
          <Num label="Graines par poussée interrompue" value={rules.pushing.seedReward ?? 0} min={0} max={10000} integer change={seedReward=>set({pushing:{...rules.pushing!,seedReward}})}/>
          <Num label="Résistance par poussée" value={rules.pushing.pressure} min={20} max={10000} change={pressure=>set({pushing:{...rules.pushing!,pressure}})}/>
          <Num label="Avertissement de poussée (s)" value={rules.pushing.warning} min={2} max={20} change={warning=>set({pushing:{...rules.pushing!,warning}})}/>
          <Num label="Vitesse du repli (cases/s)" value={rules.pushing.retreatSpeed} min={0.5} max={2} change={retreatSpeed=>set({pushing:{...rules.pushing!,retreatSpeed}})}/>
          <Num label="Canettes par autre allée au début d’une poussée" value={rules.pushing.escortCount} min={1} max={8} integer change={escortCount=>set({pushing:{...rules.pushing!,escortCount}})}/>
          <Num label="Intervalle des renforts d’escorte (s)" value={rules.pushing.escortInterval} min={2} max={60} change={escortInterval=>set({pushing:{...rules.pushing!,escortInterval}})}/>
          <label className="gd-field"><span>Ennemi d’escorte des poussées</span><select aria-label="Ennemi d’escorte des poussées" value={rules.pushing.escortEnemyId} onChange={e=>set({pushing:{...rules.pushing!,escortEnemyId:e.target.value}})}>
            {project.balance.enemies.filter(e=>e.id!==enemy.id).map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
          </select></label>
        </div></>}
      <h3>Rôle dans les objectifs</h3>
      {toggle("boss", "Présenter cet ennemi comme un boss")}
      <div className="gd-callout" aria-label="Résumé des règles du plateau">
        <strong>Règles actives de {enemy.name}</strong>
        <ul>
          {enemyRulesSummary(enemy, project.balance.enemies).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
