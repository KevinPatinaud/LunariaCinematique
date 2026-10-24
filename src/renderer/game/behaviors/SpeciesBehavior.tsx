import { useEffect, useState } from "react";
import type { GameProject } from "../../../shared/game/types.js";
import type { Change } from "../../presentation/PresentationEditor.js";
import {
  assignBehavior,
  behaviorOwner,
  behaviorUsers,
  detachBehavior,
  editOwnerBehavior,
  ownerBehavior,
} from "../../../shared/game/behaviorAuthoring.js";
import { BehaviorForm } from "./BehaviorForm.js";
import { BehaviorModelDialog } from "./BehaviorModelDialog.js";
import { StudioDialog } from "../../components/StudioDialog.js";
export function SpeciesBehavior({
  project,
  ownerId,
  change,
}: {
  project: GameProject;
  ownerId: string;
  change: Change;
}) {
  const owner = behaviorOwner(project, ownerId),
    behavior = ownerBehavior(project, ownerId),
    users = behaviorUsers(project, behavior.id);
  const [shared, setShared] = useState(false),
    [confirm, setConfirm] = useState(false),
    [models, setModels] = useState(false),
    [error, setError] = useState("");
  useEffect(() => setShared(false), [behavior.id]);
  function apply(...args: Parameters<Change>) {
    try {
      change(...args);
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }
  return (
    <section
      className="species-behavior"
      aria-label={"Comportement de " + owner.name}
    >
      <div className="behavior-heading">
        <div>
          <div className="gd-kicker">
            COMPORTEMENT DE {owner.name.toLocaleUpperCase("fr")}
          </div>
          <h2>Déplacement, priorités et phases</h2>
        </div>
        <button onClick={() => setModels(true)}>Appliquer un modèle…</button>
      </div>
      <div
        className={"behavior-scope " + (shared ? "shared" : "personal")}
        role="status"
      >
        <strong>
          {shared
            ? "Modification du modèle partagé · " +
              users.length +
              " personnages"
            : "Réglages personnels · " + owner.name}
        </strong>
        <p>
          {shared
            ? "Toute modification concerne : " +
              users.map((s) => s.name).join(", ") +
              "."
            : users.length > 1
              ? "Le modèle est utilisé par " +
                users.length +
                " personnages. Le premier changement crée une copie pour " +
                owner.name +
                "."
              : "Cette configuration est utilisée uniquement par " +
                owner.name +
                "."}
        </p>
        <div className="gd-inline">
          {users.length > 1 &&
            (!shared ? (
              <>
                <button
                  onClick={() =>
                    apply(
                      (p) => {
                        detachBehavior(p, ownerId);
                      },
                      "",
                      "Personnaliser le comportement de " + owner.name,
                    )
                  }
                >
                  Personnaliser maintenant
                </button>
                <button onClick={() => setConfirm(true)}>
                  Modifier le modèle partagé…
                </button>
              </>
            ) : (
              <button onClick={() => setShared(false)}>
                Revenir aux réglages personnels
              </button>
            ))}
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <BehaviorForm
        personal={!shared}
        project={project}
        behavior={behavior}
        ownerId={ownerId}
        edit={(edit, key, label) =>
          apply(
            (p) => {
              editOwnerBehavior(p, ownerId, edit, shared);
            },
            key ? "behavior:" + ownerId + ":" + key : "",
            label ?? "Modifier le comportement de " + owner.name,
          )
        }
      />
      {models && (
        <BehaviorModelDialog
          project={project}
          ownerId={ownerId}
          modelId={behavior.id}
          onClose={() => setModels(false)}
          onApply={(owner, model, linked) => {
            change(
              (p) => {
                assignBehavior(p, owner, model, linked);
              },
              "",
              linked
                ? "Lier un comportement partagé"
                : "Appliquer un modèle personnel",
            );
            setModels(false);
            setShared(false);
          }}
        />
      )}
      {confirm && (
        <StudioDialog
          title="Modifier le comportement partagé"
          onClose={() => setConfirm(false)}
        >
          <p>
            Cette modification concernera{" "}
            <strong>{users.length} personnages</strong> :{" "}
            {users.map((s) => s.name).join(", ")}.
          </p>
          <p>
            Tu peux conserver des réglages personnels pour {owner.name} en
            fermant cette fenêtre.
          </p>
          <footer>
            <button className="button subtle" onClick={() => setConfirm(false)}>
              Garder les réglages personnels
            </button>
            <button
              className="button primary"
              onClick={() => {
                setConfirm(false);
                setShared(true);
              }}
            >
              Modifier pour les {users.length} personnages
            </button>
          </footer>
        </StudioDialog>
      )}
    </section>
  );
}
