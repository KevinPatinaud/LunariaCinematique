import type { AssetRef } from "./model.js";
import type { GameProject } from "./game/types.js";
import type { PoseGenerationJob, PoseGenerationRequest } from './poseGeneration.js';
import { poseTaskDestination } from './poseGeneration.js';
import type {
  BackgroundCorrectionJob,
  BackgroundCorrectionRequest,
} from "./backgroundCorrection.js";
import type {
  TerrainGenerationJob,
  TerrainGenerationRequest,
} from "./terrainGeneration.js";

export type ImageTaskStatus =
  | "queued"
  | "generating"
  | "ready"
  | "applying"
  | "applied"
  | "failed"
  | "cancelled"
  | "interrupted";
export type ImageTaskKind = "background" | "terrain" | "pose";
export interface ImageTaskContext {
  projectId: string;
  projectPath: string;
  levelId?: string;
  documentId?: string;
  shotId?: string;
  actorId?: string;
  actorRef?: AssetRef;
  actorSignature?: string;
  title: string;
  terrainRef?: AssetRef;
  restoredTerrainRef?: AssetRef;
}
export interface ImageTaskMetadata {
  createdAt?: string;
  updatedAt?: string;
}
export type ImageTask = {
  kind: ImageTaskKind;
  libraryRoot: string;
  context?: ImageTaskContext;
  request: BackgroundCorrectionRequest | TerrainGenerationRequest | PoseGenerationRequest;
} & (
  | { kind: "background"; job: BackgroundCorrectionJob }
  | { kind: "terrain"; job: TerrainGenerationJob }
  | { kind: "pose"; job: PoseGenerationJob; request: PoseGenerationRequest }
);
export const imageTaskActive = (status: ImageTaskStatus) =>
  ["queued", "generating", "applying"].includes(status);
export const imageTaskFinished = (status: ImageTaskStatus) =>
  ["applied", "failed", "cancelled", "interrupted"].includes(status);
export const imageTaskLabels: Record<ImageTaskStatus, string> = {
  queued: "En attente",
  generating: "Génération en cours",
  ready: "À valider",
  applying: "Validation en cours",
  applied: "Validée",
  failed: "Échec",
  cancelled: "Annulée",
  interrupted: "Interrompue",
};
/** Assignment belongs to the open project, not to the library import status. */
export function terrainTaskDestination(task: ImageTask, project: GameProject, projectPath: string, libraryRoot?: string) {
  if (task.kind !== "terrain") return undefined;
  const inLibrary = task.libraryRoot === libraryRoot;
  const assigned = inLibrary && task.job.terrainRef && task.job.restoredTerrainRef
    ? project.levels.filter(level => level.terrainImage === task.job.terrainRef && level.restoredTerrainImage === task.job.restoredTerrainRef)
    : [];
  const context = task.context;
  const sameProject = context?.projectId === project.id && context.projectPath === projectPath;
  const origin = sameProject ? project.levels.find(level => level.id === context?.levelId) : undefined;
  const target = inLibrary && origin && origin.terrainImage === context?.terrainRef && origin.restoredTerrainImage === context?.restoredTerrainRef
    ? origin : undefined;
  const reason = !sameProject
    ? "Cette génération vient d’un autre projet. Choisis le niveau qui recevra les deux terrains."
    : !origin
      ? "Le niveau d’origine n’existe plus. Choisis un autre niveau."
      : "Le terrain du niveau d’origine a changé depuis la génération. Choisis explicitement la destination pour le remplacer.";
  return { assigned, target, reason };
}

export function imageTaskProjectLabel(task: ImageTask, project: GameProject, projectPath: string, libraryRoot?: string) {
  if (task.kind === 'pose' && ['ready', 'applied'].includes(task.job.status)) {
    if (task.libraryRoot === libraryRoot && poseTaskDestination(task.request, task.job.poseRef, project, projectPath).assigned.length) return 'Affectée';
    return task.job.status === 'applied' ? 'À affecter' : 'À valider';
  }
  if (task.kind === "terrain" && ["ready", "applied"].includes(task.job.status)) {
    if (terrainTaskDestination(task, project, projectPath, libraryRoot)?.assigned.length) return "Affectée";
    return task.job.status === "applied" ? "À affecter" : "À valider";
  }
  return imageTaskLabels[task.job.status];
}
/** Only authored context is persisted; renderer input never supplies file paths to execute. */
export function imageTaskContext(input: unknown): ImageTaskContext | undefined {
  if (input === undefined) return;
  if (!input || typeof input !== "object")
    throw Error("Destination de génération invalide.");
  const value = input as Record<string, unknown>;
  for (const key of ["projectId", "projectPath", "title"])
    if (typeof value[key] !== "string" || (value[key] as string).length > 2000)
      throw Error("Destination de génération invalide.");
  for (const key of ["levelId", "documentId", "shotId", "terrainRef", "restoredTerrainRef", "actorId", "actorRef", "actorSignature"])
    if (
      value[key] !== undefined &&
      (typeof value[key] !== "string" || (value[key] as string).length > 2000)
    )
      throw Error("Destination de génération invalide.");
  return Object.fromEntries(
    [
      "projectId",
      "projectPath",
      "title",
      "levelId",
      "documentId",
      "shotId",
      "actorId",
      "actorRef",
      "actorSignature",
      "terrainRef",
      "restoredTerrainRef",
    ]
      .filter((key) => value[key] !== undefined)
      .map((key) => [key, value[key]]),
  ) as unknown as ImageTaskContext;
}
