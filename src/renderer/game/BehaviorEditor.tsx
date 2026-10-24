import { useEffect, useState } from "react";
import type { GameProject } from "../../shared/game/types.js";
import {
  BEHAVIOR_TEMPLATES,
  assignBehavior,
  behaviorUsers,
  duplicateBehavior,
  createBehavior,
  removeBehavior,
  type BehaviorTemplate,
} from "../../shared/game/behaviorAuthoring.js";
import type { Team } from "../../shared/game/logic.js";
import { BehaviorForm } from "./behaviors/BehaviorForm.js";
import { BehaviorModelDialog } from "./behaviors/BehaviorModelDialog.js";
import { Select } from "./LogicFields.js";
interface Props {
  project: GameProject;
  id: string;
  select: (id: string) => void;
  change: (
    edit: (p: GameProject) => void,
    key?: string,
    label?: string,
  ) => void;
  report: (s: string) => void;
  openSpecies: (id: string) => void;
}
export function BehaviorEditor({
  project,
  id,
  select,
  change,
  report,
  openSpecies,
}: Props) {
  const list = project.logic!.behaviors,
    b = list.find((b) => b.id === id) ?? list[0],
    users = behaviorUsers(project, b.id);
  const [query, setQuery] = useState(""),
    [team, setTeam] = useState("all"),
    [unlocked, setUnlocked] = useState(false),
    [ownerId, setOwnerId] = useState(""),
    [assign, setAssign] = useState(false),
    [newTeam, setNewTeam] = useState<Team>("enemies"),
    [template, setTemplate] = useState<BehaviorTemplate>("automatic");
  useEffect(() => {
    setUnlocked(false);
    setOwnerId("");
  }, [b.id]);
  const owner = project.balance[b.team].find((s) => s.id === ownerId);
  const normalize = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr");
  const filtered = list.filter(
    (b) =>
      (team === "all" || b.team === team) &&
      normalize(
        b.name +
          " " +
          behaviorUsers(project, b.id)
            .map((s) => s.name)
            .join(" "),
      ).includes(normalize(query)),
  );
  function apply(
    edit: (p: GameProject) => void,
    key = "",
    label = "Modifier un modèle de comportement",
  ) {
    try {
      change(edit, key, label);
    } catch (error) {
      report(error instanceof Error ? error.message : String(error));
    }
  }
  return (
    <div className="gd-balance behavior-library">
      <aside className="gd-catalog">
        <label className="gd-field">
          <span>Trouver un modèle</span>
          <input
            aria-label="Rechercher un comportement"
            placeholder="Nom ou personnage…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <Select
          label="Camp des modèles"
          value={team}
          change={setTeam}
          options={[
            { id: "all", name: "Tous les modèles" },
            { id: "plants", name: "Plantes alliées" },
            { id: "enemies", name: "Ennemis" },
          ]}
        />
        {filtered.map((item) => (
          <button
            key={item.id}
            className={item.id === b.id ? "selected" : ""}
            onClick={() => select(item.id)}
          >
            <b>{item.name}</b>
            <small>
              {item.phases.length} phase(s) ·{" "}
              {behaviorUsers(project, item.id).length} personnage(s)
            </small>
          </button>
        ))}
        <details className="behavior-create">
          <summary>Créer un modèle</summary>
          <Select
            label="Camp du nouveau modèle"
            value={newTeam}
            change={(value) => {
              setNewTeam(value as Team);
              if (value === "plants" && template === "retreat")
                setTemplate("automatic");
            }}
            options={[
              { id: "plants", name: "Plantes alliées" },
              { id: "enemies", name: "Ennemis" },
            ]}
          />
          <Select
            label="Point de départ du comportement"
            value={template}
            change={(value) => setTemplate(value as BehaviorTemplate)}
            options={Object.entries(BEHAVIOR_TEMPLATES)
              .filter(([id]) => newTeam === "enemies" || id !== "retreat")
              .map(([id, name]) => ({ id, name }))}
          />
          <button
            className="gd-primary"
            disabled={list.length >= 128}
            onClick={() => {
              let created = "";
              apply(
                (p) => {
                  created = createBehavior(p, newTeam, template).id;
                },
                "",
                "Créer un modèle de comportement",
              );
              if (created) select(created);
            }}
          >
            + Comportement
          </button>
        </details>
      </aside>
      <main className="gd-scroll gd-balance-form">
        <div className="behavior-heading">
          <div>
            <div className="gd-kicker">
              BIBLIOTHÈQUE DE MODÈLES ·{" "}
              {b.team === "plants" ? "PLANTES" : "ENNEMIS"}
            </div>
            <h1>{b.name}</h1>
          </div>
          <div className="gd-inline">
            <button onClick={() => setAssign(true)}>
              Appliquer à un personnage…
            </button>
            <button
              disabled={list.length >= 128}
              onClick={() => {
                let created = "";
                apply(
                  (p) => {
                    created = duplicateBehavior(p, b.id).id;
                  },
                  "",
                  "Dupliquer un modèle",
                );
                if (created) select(created);
              }}
            >
              Dupliquer
            </button>
            <button
              disabled={list.length <= 1 || !!users.length}
              onClick={() => {
                apply(
                  (p) => removeBehavior(p, b.id),
                  "",
                  "Supprimer un modèle inutilisé",
                );
                select("");
              }}
            >
              Supprimer
            </button>
          </div>
        </div>
        <div
          className={"behavior-scope " + (users.length ? "shared" : "personal")}
        >
          <strong>
            {users.length
              ? "Modèle utilisé par " + users.length + " personnages"
              : "Modèle libre · aucun personnage lié"}
          </strong>
          <div className="behavior-users">
            {users.map((s) => (
              <button key={s.id} onClick={() => openSpecies(s.id)}>
                {s.name} →
              </button>
            ))}
          </div>
          {!!users.length && (
            <p>
              Pour régler un seul personnage, ouvre sa fiche. Modifier ce modèle
              concerne tous ses utilisateurs.
            </p>
          )}
          {!!users.length && !unlocked && (
            <button onClick={() => setUnlocked(true)}>
              Modifier pour les {users.length} personnages
            </button>
          )}
          {unlocked && (
            <button onClick={() => setUnlocked(false)}>
              Verrouiller le modèle partagé
            </button>
          )}
        </div>
        <Select
          label="Porteur de l’essai du modèle"
          value={owner?.id ?? ""}
          change={setOwnerId}
          options={[
            { id: "", name: "Choisir un personnage pour le test…" },
            ...project.balance[b.team],
          ]}
        />
        <BehaviorForm
          key={b.id}
          project={project}
          behavior={b}
          ownerId={owner?.id}
          disabled={!!users.length && !unlocked}
          edit={(edit, key, label) =>
            apply(
              (p) => edit(p.logic!.behaviors.find((x) => x.id === b.id)!),
              key ? "behavior-model:" + b.id + ":" + key : "",
              label ?? "Modifier un modèle partagé",
            )
          }
        />
        {assign && (
          <BehaviorModelDialog
            project={project}
            modelId={b.id}
            onClose={() => setAssign(false)}
            onApply={(owner, model, shared) => {
              change(
                (p) => {
                  assignBehavior(p, owner, model, shared);
                },
                "",
                shared
                  ? "Attribuer un modèle partagé"
                  : "Attribuer une copie personnelle",
              );
              setAssign(false);
            }}
          />
        )}
      </main>
    </div>
  );
}
