import React, { useMemo } from "react";
import {
  cinematicCampaignContext,
  type CampaignStepTarget,
} from "../../shared/campaignContinuity.js";
import type { GameProject } from "../../shared/game/types.js";

interface CinematicContinuityBarProps {
  project: GameProject;
  documentId: string;
  disabled: boolean;
  onSelectFilm: (documentId: string) => void;
  onOpenLevel: (levelId: string, tab?: "settings" | "waves" | "plants" | "events") => void;
  onOpenCampaignStep: (stepId: string) => void;
}

export function CinematicContinuityBar({
  project,
  documentId,
  disabled,
  onSelectFilm,
  onOpenLevel,
  onOpenCampaignStep,
}: CinematicContinuityBarProps) {
  const context = useMemo(
    () => cinematicCampaignContext(project, documentId),
    [project, documentId],
  );
  const primary = context.placements[0];
  const eventLink = context.eventLinks[0];
  if (!primary && !eventLink) return null;

  const renderTargetButton = (
    target: CampaignStepTarget | undefined,
    direction: "prev" | "next",
  ) => {
    if (!target || target.kind === "end" || target.kind === "unlock_travel_book" || target.kind === "unlock_herbarium" || !target.exists) return null;
    const prefix = direction === "prev" ? "← " : "";
    const suffix = direction === "next" ? " →" : "";
    if (target.kind === "level") {
      return (
        <button
          type="button"
          className="continuity-link"
          disabled={disabled}
          title={`Ouvrir le niveau « ${target.title} »`}
          onClick={() => onOpenLevel(target.levelId)}
        >
          {prefix}Niveau : {target.title}
          {suffix}
        </button>
      );
    }
    if (target.kind === "cinematic" && target.documentId) {
      return (
        <button
          type="button"
          className="continuity-link"
          disabled={disabled}
          title={`Ouvrir la cinématique « ${target.title} »`}
          onClick={() => onSelectFilm(target.documentId)}
        >
          {prefix}Film : {target.title}
          {suffix}
        </button>
      );
    }
    return null;
  };

  return (
    <div
      className="cinematic-continuity-bar"
      aria-label="Continuité dans la campagne"
    >
      {primary ? (
        <>
          <button
            type="button"
            className="continuity-step-badge"
            disabled={disabled}
            title="Voir cette étape dans l’ordre de lecture de la campagne"
            onClick={() => onOpenCampaignStep(primary.stepId)}
          >
            Étape {primary.index + 1} du parcours
            {primary.preparing ? " (après fin)" : ""}
          </button>
          {renderTargetButton(primary.previous, "prev")}
          {renderTargetButton(primary.next, "next")}
        </>
      ) : (
        eventLink && (
          <button
            type="button"
            className="continuity-link"
            disabled={disabled}
            title={`Ouvrir l’événement « ${eventLink.eventName} » dans le niveau « ${eventLink.levelTitle} »`}
            onClick={() => onOpenLevel(eventLink.levelId, "events")}
          >
            Événement de niveau : {eventLink.levelTitle} ({eventLink.eventName}) →
          </button>
        )
      )}
    </div>
  );
}
