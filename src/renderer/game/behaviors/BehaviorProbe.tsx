import { useState } from "react";
import type { GameProject } from "../../../shared/game/types.js";
import {
  MOVEMENTS,
  ACTION_LABELS,
  type BehaviorDefinition,
  type LogicContext,
  type RuleStatus,
} from "../../../shared/game/logic.js";
import {
  advanceBehaviorPreview,
  initialBehaviorPreview,
  inspectOwnerBehavior,
  phaseAbilities,
} from "../../../shared/game/behaviorPreview.js";
import { behaviorOwner } from "../../../shared/game/behaviorAuthoring.js";
import { Num } from "../CombatFields.js";

const reasons: Record<RuleStatus, string> = {
  selected: "Retenue",
  conditions: "Conditions non remplies",
  unavailable: "Capacité absente de cette phase",
  cooldown: "Capacité en recharge",
  target: "Aucune cible à portée",
  lower_priority: "Une règle précédente a gagné",
};
export function BehaviorProbe({
  project,
  behavior,
  ownerId,
}: {
  project: GameProject;
  behavior: BehaviorDefinition;
  ownerId: string;
}) {
  const [health, setHealth] = useState(100),
    [time, setTime] = useState(20),
    [wave, setWave] = useState(1),
    [enemies, setEnemies] = useState(3),
    [energy, setEnergy] = useState(100);
  const [state, setState] = useState(() =>
    advanceBehaviorPreview(behavior, initialBehaviorPreview(), 100),
  );
  const [unready, setUnready] = useState<string[]>([]),
    [noTarget, setNoTarget] = useState<string[]>([]),
    [disabled, setDisabled] = useState<string[]>([]),
    [variables, setVariables] = useState<Record<string, number>>({});
  const owner = behaviorOwner(project, ownerId),
    phase =
      behavior.phases.find((f) => f.id === state.phaseId) ?? behavior.phases[0];
  const ids = phaseAbilities(owner, phase),
    name = (id: string) =>
      project.combat!.abilities.find((a) => a.id === id)?.name ?? id;
  const context: LogicContext = {
    health,
    time,
    wave,
    enemies,
    energy,
    variables: Object.fromEntries(
      project.logic!.variables.map((v) => [v.id, variables[v.id] ?? v.initial]),
    ),
    ready: (id) => !unready.includes(id),
    target: (id) => !noTarget.includes(id),
    hostile: (id) =>
      project.combat!.abilities.find((a) => a.id === id)?.target === "opponent",
  };
  const result = inspectOwnerBehavior(
    project,
    ownerId,
    behavior,
    state,
    context,
    disabled,
  );
  function toggle(
    values: string[],
    id: string,
    set: (values: string[]) => void,
  ) {
    set(values.includes(id) ? values.filter((x) => x !== id) : [...values, id]);
  }
  function reset() {
    setHealth(100);
    setState(advanceBehaviorPreview(behavior, initialBehaviorPreview(), 100));
    setUnready([]);
    setNoTarget([]);
    setDisabled([]);
    setTime(20);
    setWave(1);
    setEnemies(3);
    setEnergy(100);
    setVariables({});
  }
  return (
    <section
      className="behavior-probe"
      aria-label={"Essai du comportement de " + owner.name}
    >
      <div className="behavior-heading">
        <div>
          <h2>Tester avec {owner.name}</h2>
          <p>
            Essai de décision : les cibles et recharges sont définies
            ci-dessous. Aucun dégât ni déplacement n’est simulé.
          </p>
        </div>
        <button onClick={reset}>Recommencer à 100 %</button>
      </div>
      <div className="gd-form-grid">
        <Num
          label="PV de test (%)"
          value={health}
          max={100}
          change={(value) => {
            setHealth(value);
            setState((current) =>
              advanceBehaviorPreview(behavior, current, value),
            );
          }}
        />
        <Num
          label="Temps de test (s)"
          value={time}
          max={3600}
          change={setTime}
        />
        <Num
          label="Vague de test"
          value={wave}
          max={1000}
          integer
          change={setWave}
        />
        <Num
          label="Ennemis vivants de test"
          value={enemies}
          max={256}
          integer
          change={setEnemies}
        />
        <Num
          label="Graines de test"
          value={energy}
          max={1000000}
          integer
          change={setEnergy}
        />
      </div>
      <p className="gd-note">
        Les phases déjà franchies sont conservées après un soin. « Recommencer »
        efface cet historique d’essai.
      </p>
      <div className="behavior-probe-abilities">
        {ids.map((id) => (
          <fieldset key={id}>
            <legend>{name(id)}</legend>
            <label>
              <input
                type="checkbox"
                aria-label={"Capacité active : " + name(id)}
                checked={!disabled.includes(id)}
                onChange={() => toggle(disabled, id, setDisabled)}
              />{" "}
              Active
            </label>
            <label>
              <input
                type="checkbox"
                aria-label={"Capacité prête : " + name(id)}
                checked={!unready.includes(id)}
                onChange={() => toggle(unready, id, setUnready)}
              />{" "}
              Prête
            </label>
            <label>
              <input
                type="checkbox"
                aria-label={"Cible disponible : " + name(id)}
                checked={!noTarget.includes(id)}
                onChange={() => toggle(noTarget, id, setNoTarget)}
              />{" "}
              Cible disponible
            </label>
          </fieldset>
        ))}
        {!ids.length && <p>Aucune capacité n’est active dans cette phase.</p>}
      </div>
      {!!project.logic!.variables.length && (
        <details>
          <summary>Variables de l’essai</summary>
          <div className="gd-form-grid">
            {project.logic!.variables.map((v) => (
              <Num
                key={v.id}
                label={"Essai · " + v.name}
                value={variables[v.id] ?? v.initial}
                min={v.minimum}
                max={v.maximum}
                integer={v.type === "boolean"}
                change={(value) =>
                  setVariables({ ...variables, [v.id]: value })
                }
              />
            ))}
          </div>
        </details>
      )}
      <output
        className="behavior-decision"
        aria-label="Décision du comportement"
      >
        {!result.active && (
          <strong>Hors combat · aucune décision exécutée</strong>
        )}
        <strong>Porteur : {owner.name}</strong>
        <span>Phase : {result.phase.name}</span>
        <span>Mouvement : {MOVEMENTS[result.decision.movement]}</span>
        <span>
          Capacités :{" "}
          {result.decision.abilities.map(name).join(", ") || "aucune"}
        </span>
        <span>
          Règle :{" "}
          {!result.active
            ? "aucune"
            : (behavior.rules.find((r) => r.id === result.decision.ruleId)
                ?.name ??
              (behavior.mode === "automatic"
                ? "automatique"
                : "déplacement par défaut"))}
        </span>
      </output>
      {!!result.trace.length && (
        <table className="behavior-rule-trace">
          <caption>Pourquoi cette décision ?</caption>
          <thead>
            <tr>
              <th>Priorité</th>
              <th>Règle</th>
              <th>Résultat</th>
            </tr>
          </thead>
          <tbody>
            {result.trace.map((trace, i) => (
              <tr
                key={trace.ruleId}
                className={trace.status === "selected" ? "selected" : ""}
              >
                <td>{i + 1}</td>
                <td>
                  {behavior.rules.find((r) => r.id === trace.ruleId)?.name}
                </td>
                <td>{reasons[trace.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <details className="behavior-entered">
        <summary>Phases franchies et actions d’entrée</summary>
        <p>
          Les actions sont présentées dans leur ordre d’entrée ; cet essai ne
          les exécute pas.
        </p>
        {state.entered.map((id) => {
          const f = behavior.phases.find((f) => f.id === id);
          return (
            f && (
              <div key={id}>
                <b>{f.name}</b>
                {f.onEnter.length ? (
                  <ol>
                    {f.onEnter.map((action, i) => (
                      <li key={i}>
                        {ACTION_LABELS[action.type]}
                        {action.text ? " : " + action.text : ""} · délai +
                        {action.delay} s
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>Aucune action à l’entrée.</p>
                )}
              </div>
            )
          );
        })}
      </details>
    </section>
  );
}
