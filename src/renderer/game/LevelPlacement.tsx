import React, { useState } from "react";
import type { GameProject, LevelDefinition } from "../../shared/game/types.js";
import { campaignOf } from "../../shared/game/campaign.js";
import {
  afterLevel,
  levelPosition,
  stepTitle,
  type LevelPlacement,
} from "../../shared/game/levelManagement.js";
import { StudioDialog } from "../components/StudioDialog.js";
const decode = (value: string): LevelPlacement =>
  value === "@outside"
    ? { kind: "outside" }
    : { kind: "campaign", beforeId: value === "@end" ? null : value };
const encode = (placement: LevelPlacement) =>
  placement.kind === "outside" ? "@outside" : (placement.beforeId ?? "@end");
export function PlacementChoice({
  project,
  value,
  onChange,
  label = "Place dans la campagne",
}: {
  project: GameProject;
  value: LevelPlacement;
  onChange: (placement: LevelPlacement) => void;
  label?: string;
}) {
  const steps = campaignOf(project).steps;
  return (
    <label className="gd-field">
      <span>{label}</span>
      <select
        aria-label={label}
        value={encode(value)}
        onChange={(e) => onChange(decode(e.target.value))}
      >
        <option value="@outside">
          Hors parcours — garder dans la bibliothèque
        </option>
        {steps.map((s, i) => (
          <option key={s.id} value={s.id}>
            {i === 0 ? "Au début, avant" : "Avant l’étape " + (i + 1) + " :"}{" "}
            {stepTitle(project, s)}
          </option>
        ))}
        <option value="@end">
          {steps.length
            ? "Après la dernière étape"
            : "Première étape du parcours"}
        </option>
      </select>
    </label>
  );
}
export function LevelCampaignPosition({
  project,
  level,
  onPlace,
  onView,
}: {
  project: GameProject;
  level: LevelDefinition;
  onPlace: (placement: LevelPlacement) => void;
  onView: (stepId: string) => void;
}) {
  const position = levelPosition(project, level.id),
    [editing, setEditing] = useState(false),
    [placement, setPlacement] = useState<LevelPlacement>(
      afterLevel(project, level.id),
    );
  return (
    <section
      className={
        "level-campaign-position " + (position.index < 0 ? "outside" : "placed")
      }
      aria-label="Place du niveau dans la campagne"
    >
      <div>
        <span className="gd-kicker">PARCOURS DU JOUEUR</span>
        <h2>
          {position.index < 0
            ? "Hors parcours"
            : `Niveau ${position.number} · étape ${position.index + 1}`}
        </h2>
        {position.preparing && <p className="gd-preparing-note">Suite en préparation · après la fin actuelle, non publié.</p>}
        <p>
          {position.index < 0
            ? "Conservé dans le Studio. Il sera publié lorsque tu l’ajouteras au parcours."
            : `${position.previous ? "Après « " + stepTitle(project, position.previous) + " »" : "Au début du jeu"} · ${position.next ? "puis « " + stepTitle(project, position.next) + " »" : "puis fin de campagne"}`}
        </p>
      </div>
      <div className="gd-inline">
        {position.stepId && (
          <button onClick={() => onView(position.stepId)}>
            Voir dans la campagne
          </button>
        )}
        <button
          onClick={() => {
            setPlacement(afterLevel(project, level.id));
            setEditing(!editing);
          }}
        >
          {position.index < 0 ? "Ajouter au parcours…" : "Changer sa place…"}
        </button>
      </div>
      {editing && (
        <div className="level-placement-form">
          <PlacementChoice
            project={project}
            value={placement}
            onChange={setPlacement}
          />
          <p>
            Cette action déplace l’étape du niveau. Les cinématiques et les
            autres étapes conservent leur ordre relatif.
          </p>
          <div className="gd-inline">
            <button onClick={() => setEditing(false)}>
              Annuler le placement
            </button>
            <button
              className="gd-primary"
              onClick={() => {
                onPlace(placement);
                setEditing(false);
              }}
            >
              Appliquer le placement
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
export function DuplicateLevelDialog({
  project,
  level,
  onDuplicate,
  onClose,
}: {
  project: GameProject;
  level: LevelDefinition;
  onDuplicate: (placement: LevelPlacement, title: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState((level.title + " — copie").slice(0, 160)),
    [placement, setPlacement] = useState(afterLevel(project, level.id));
  return (
    <StudioDialog title="Dupliquer le niveau" onClose={onClose}>
      <p>
        La copie conserve les vagues, événements, objectifs, plantes, textes et
        images du niveau. Elle aura sa propre identité.
      </p>
      <label className="gd-field">
        <span>Nom de la copie</span>
        <input
          aria-label="Nom de la copie"
          value={title}
          maxLength={160}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <PlacementChoice
        project={project}
        value={placement}
        onChange={setPlacement}
        label="Placer la copie"
      />
      <p>
        {placement.kind === "outside"
          ? "La copie restera hors parcours."
          : levelPosition(project, level.id).index >= 0 &&
              (levelPosition(project, level.id).next?.id ===
                placement.beforeId ||
                (!levelPosition(project, level.id).next &&
                  placement.beforeId === null))
            ? "La copie sera jouée juste après ce niveau."
            : "La copie sera jouée à l’emplacement choisi."}
      </p>
      <footer>
        <button className="button subtle" onClick={onClose}>
          Garder le niveau actuel
        </button>
        <button
          className="button primary"
          disabled={!title.trim()}
          onClick={() => onDuplicate(placement, title)}
        >
          Créer la copie
        </button>
      </footer>
    </StudioDialog>
  );
}
