import { campaignOf } from "./game/campaign.js";
import { levelPosition, stepTitle } from "./game/levelManagement.js";
import type { AssetRef } from "./model.js";
import type {
  CampaignFilm,
  CampaignStep,
  GameProject,
} from "./game/types.js";

export type CampaignStepTarget =
  | {
      kind: "level";
      stepId: string;
      levelId: string;
      title: string;
      exists: boolean;
    }
  | {
      kind: "cinematic";
      stepId: string;
      cinematicId: string;
      documentId: string;
      film?: CampaignFilm;
      title: string;
      exists: boolean;
    }
  | {
      kind: "unlock_herbarium";
      stepId: string;
      title: string;
      exists: true;
    }
  | {
      kind: "unlock_travel_book";
      stepId: string;
      title: string;
      exists: true;
    }
  | {
      kind: "end";
      stepId: string;
      title: string;
      exists: true;
    };

export interface CinematicStepPlacement {
  stepId: string;
  index: number;
  preparing: boolean;
  previous?: CampaignStepTarget;
  next?: CampaignStepTarget;
}

export interface CinematicEventLink {
  levelId: string;
  levelTitle: string;
  eventName: string;
}

export interface CinematicCampaignContext {
  placements: CinematicStepPlacement[];
  eventLinks: CinematicEventLink[];
}

export interface TravelBookIllustrationSource {
  source: "cinematic" | "terrain" | "continent";
  asset?: AssetRef;
  filmTitle?: string;
}

/** Resolve a campaign step into an actionable navigation target for Studio bridges. */
export function resolveStepTarget(
  project: GameProject,
  step: CampaignStep | undefined,
): CampaignStepTarget | undefined {
  if (!step) return undefined;
  if (step.kind === "end") {
    return {
      kind: "end",
      stepId: step.id,
      title: stepTitle(project, step),
      exists: true,
    };
  }
  if (step.kind === "unlock_travel_book" || step.kind === "unlock_herbarium") {
    return {
      kind: step.kind,
      stepId: step.id,
      title: stepTitle(project, step),
      exists: true,
    };
  }
  if (step.kind === "level") {
    const level = project.levels.find((item) => item.id === step.levelId);
    return {
      kind: "level",
      stepId: step.id,
      levelId: step.levelId,
      title: level?.title ?? stepTitle(project, step),
      exists: !!level,
    };
  }
  const campaign = campaignOf(project);
  const film = campaign.cinematics.find((item) => item.id === step.cinematicId);
  const doc = film
    ? project.cinematics?.find((item) => item.id === film.documentId)
    : undefined;
  return {
    kind: "cinematic",
    stepId: step.id,
    cinematicId: step.cinematicId,
    documentId: film?.documentId ?? "",
    film,
    title: doc?.title ?? film?.title ?? stepTitle(project, step),
    exists: !!(film && doc),
  };
}

/** Locate where a cinematic document is placed in the campaign sequence or battle events. */
export function cinematicCampaignContext(
  project: GameProject,
  documentId: string,
): CinematicCampaignContext {
  const campaign = campaignOf(project);
  const filmIds = new Set(
    campaign.cinematics
      .filter((film) => film.documentId === documentId)
      .map((film) => film.id),
  );
  const placements: CinematicStepPlacement[] = [];
  const endIndex = campaign.steps.findIndex((step) => step.kind === "end");
  campaign.steps.forEach((step, index) => {
    if (step.kind === "cinematic" && filmIds.has(step.cinematicId)) {
      placements.push({
        stepId: step.id,
        index,
        preparing: endIndex >= 0 && index > endIndex,
        previous: resolveStepTarget(project, campaign.steps[index - 1]),
        next: resolveStepTarget(project, campaign.steps[index + 1]),
      });
    }
  });
  const eventLinks: CinematicEventLink[] = [];
  if (filmIds.size > 0) {
    for (const level of project.levels) {
      for (const event of level.events ?? []) {
        if (
          event.actions.some(
            (action) =>
              action.type === "cinematic" &&
              filmIds.has(action.cinematicId ?? ""),
          )
        ) {
          eventLinks.push({
            levelId: level.id,
            levelTitle: level.title,
            eventName: event.name,
          });
        }
      }
    }
  }
  return { placements, eventLinks };
}

/** Deduce which background asset the Travel Book displays for a placed level. */
export function levelTravelBookSource(
  project: GameProject,
  levelId: string,
): TravelBookIllustrationSource {
  const position = levelPosition(project, levelId);
  const level = project.levels.find((item) => item.id === levelId);
  if (position.index > 0) {
    const campaign = campaignOf(project);
    for (let i = position.index - 1; i >= 0; i--) {
      const candidate = campaign.steps[i];
      if (candidate.kind === "end") break;
      if (candidate.kind !== "cinematic") continue;

      const film = campaign.cinematics.find(
        (item) => item.id === candidate.cinematicId,
      );
      const doc = film
        ? project.cinematics?.find((item) => item.id === film.documentId)
        : undefined;
      if (doc) {
        for (let s = doc.shots.length - 1; s >= 0; s--) {
          const asset = doc.shots[s].background?.asset;
          if (asset) return { source: "cinematic", asset, filmTitle: doc.title };
        }
      }
      // The game falls back to the terrain if the most recent film has no backdrop.
      break;
    }
  }
  if (level?.terrainImage) {
    return { source: "terrain", asset: level.terrainImage };
  }
  return { source: "continent" };
}
