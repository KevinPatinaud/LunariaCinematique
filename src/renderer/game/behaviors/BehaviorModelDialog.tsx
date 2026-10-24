import { useState } from "react";
import type { GameProject } from "../../../shared/game/types.js";
import {
  behaviorCompatibility,
  behaviorUsers,
} from "../../../shared/game/behaviorAuthoring.js";
import { StudioDialog } from "../../components/StudioDialog.js";
import { Select } from "../LogicFields.js";
export function BehaviorModelDialog({
  project,
  ownerId,
  modelId,
  onApply,
  onClose,
}: {
  project: GameProject;
  ownerId?: string;
  modelId?: string;
  onApply: (ownerId: string, modelId: string, shared: boolean) => void;
  onClose: () => void;
}) {
  const all = [...project.balance.plants, ...project.balance.enemies],
    [target, setTarget] = useState(ownerId ?? ""),
    [chosen, setChosen] = useState(modelId ?? ""),
    [shared, setShared] = useState(false),
    [error, setError] = useState("");
  const owner = all.find((s) => s.id === target),
    team =
      owner && project.balance.plants.some((s) => s.id === owner.id)
        ? "plants"
        : "enemies";
  const models = project.logic!.behaviors.filter(
      (b) => !owner || b.team === team,
    ),
    model = models.find((b) => b.id === chosen) ?? models[0],
    missing =
      owner && model ? behaviorCompatibility(project, owner.id, model) : [];
  return (
    <StudioDialog
      title="Appliquer un modèle de comportement"
      onClose={onClose}
      wide
    >
      <p>
        Le modèle fournit le déplacement, les priorités et les phases. Une copie
        personnelle conserve le modèle d’origine.
      </p>
      {ownerId ? (
        <p>
          Personnage : <strong>{owner?.name}</strong>
        </p>
      ) : (
        <Select
          label="Personnage du modèle"
          value={target}
          change={setTarget}
          options={[{ id: "", name: "Choisir un personnage…" }, ...all]}
        />
      )}
      {model && (
        <Select
          label="Modèle de comportement"
          value={model.id}
          change={setChosen}
          options={models.map((b) => ({
            id: b.id,
            name: b.name + (b.team === "plants" ? " · Plantes" : " · Ennemis"),
          }))}
        />
      )}
      {model && (
        <p>
          {model.phases.length} phase(s) ·{" "}
          {model.mode === "automatic"
            ? "Capacités automatiques"
            : model.rules.length + " règle(s) de priorité"}
          <br />
          Utilisé par :{" "}
          {behaviorUsers(project, model.id)
            .map((s) => s.name)
            .join(", ") || "aucun personnage"}
          .
        </p>
      )}
      <div className="behavior-copy-options">
        <label>
          <input
            type="radio"
            name="behavior-sharing"
            checked={!shared}
            onChange={() => setShared(false)}
          />
          <span>
            <b>Copie personnelle</b>
            <small>Les prochains réglages concernent ce personnage.</small>
          </span>
        </label>
        <label>
          <input
            type="radio"
            name="behavior-sharing"
            checked={shared}
            onChange={() => setShared(true)}
          />
          <span>
            <b>Lier au modèle partagé</b>
            <small>
              Le personnage rejoint ses utilisateurs. Modifier tous les
              utilisateurs reste une action explicite.
            </small>
          </span>
        </label>
      </div>
      {!!missing.length && (
        <p role="alert">
          Capacités requises absentes du personnage : {missing.join(", ")}.
          Attribue-les d’abord dans sa fiche, ou choisis un autre modèle.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      <footer>
        <button className="button subtle" onClick={onClose}>
          Annuler
        </button>
        <button
          className="button primary"
          disabled={
            !owner ||
            !model ||
            !!missing.length ||
            (!shared && project.logic!.behaviors.length >= 128)
          }
          onClick={() => {
            try {
              onApply(owner!.id, model!.id, shared);
            } catch (error) {
              setError(error instanceof Error ? error.message : String(error));
            }
          }}
        >
          {shared ? "Lier ce personnage" : "Appliquer une copie personnelle"}
        </button>
      </footer>
      {!shared && project.logic!.behaviors.length >= 128 && (
        <p role="alert">
          Le catalogue contient déjà 128 comportements. Supprime un modèle
          inutilisé pour créer une copie.
        </p>
      )}
    </StudioDialog>
  );
}
