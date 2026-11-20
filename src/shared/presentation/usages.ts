import type { GameProject } from "../game/types.js";
import type { PresentationSection } from "./types.js";

export interface PresentationUsages {
  references: Record<string, string[]>;
  errors: string[];
}

const REFERENCE_FIELDS = new Set([
  "animationId",
  "animationProfileId",
  "defaultProfileId",
  "soundId",
  "vfxId",
  "trailVfxId",
  "ref",
]);

/** All definitions and embedded films share one authoring project, including
 * films outside the campaign and after its current endpoint. No filesystem or
 * asynchronous lookup is needed to protect their presentation references. */
export function presentationUsages(project: GameProject): PresentationUsages {
  const references: Record<string, string[]> = Object.create(null);
  const errors: string[] = [];
  const catalog = project.presentation;
  const ids = new Set(
    catalog
      ? [...catalog.animations, ...catalog.profiles, ...catalog.audio, ...catalog.vfx]
          .map((definition) => definition.id)
      : [],
  );
  const visit = (value: unknown, location: string) => {
    if (!value || typeof value !== "object") return;
    for (const [field, entry] of Object.entries(value)) {
      const path = location + "." + field;
      if (typeof entry === "string" && ids.has(entry) && REFERENCE_FIELDS.has(field))
        (references[entry] ??= []).push(path);
      else if (entry && typeof entry === "object") visit(entry, path);
    }
  };
  const { cinematics = [], ...rest } = project;
  visit(rest, "projet");
  for (const film of cinematics) visit(film, "Film « " + film.title + " »");

  const films = new Set(cinematics.map((film) => film.id));
  for (const film of project.campaign?.cinematics ?? [])
    if (!films.has(film.documentId))
      errors.push(film.title + " : Cinématique absente du projet.");
  return { references, errors };
}

/** Validate the current draft after any asynchronous confirmation. Returning an
 * index only for an existing, unused definition prevents accidental splice(-1). */
export function presentationRemovalIndex(
  project: GameProject,
  section: PresentationSection,
  id: string,
): number {
  const list = project.presentation?.[section];
  const index = list?.findIndex((definition) => definition.id === id) ?? -1;
  if (!list || index < 0) throw Error("Cette définition n’existe plus dans le projet.");
  const usages = presentationUsages(project);
  if (usages.errors.length)
    throw Error("Suppression bloquée : " + usages.errors.join("; "));
  const references = usages.references[id] ?? [];
  if (references.length)
    throw Error("Cette définition est encore utilisée : " + references.join(", "));
  if (section === "profiles" && list.length === 1)
    throw Error("Le dernier profil de présentation doit être conservé.");
  return index;
}
