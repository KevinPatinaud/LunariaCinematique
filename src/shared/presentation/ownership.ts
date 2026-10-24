import type { GameProject } from "../game/types.js";
import {
  BASE_SLOTS,
  SLOT_LABELS,
  type AnimationDefinition,
  type AnimationProfile,
  type Cue,
  type PresentationEvent,
} from "./types.js";
import { newId } from "../game/types.js";
import { newAnimation } from "./factories.js";
import { resolveAnimation, species } from "./runtime.js";

/** Existing projects have no owner field. A clip used by exactly one species profile belongs to it. */
export function animationOwnerId(
  project: GameProject,
  animation: AnimationDefinition,
): string | undefined {
  if (animation.ownerSpeciesId !== undefined)
    return animation.ownerSpeciesId || undefined;
  const catalog = project.presentation;
  if (!catalog) return;
  const profiles = catalog.profiles.filter((profile) =>
    profile.slots.some((slot) => slot.animationId === animation.id),
  );
  if (
    !profiles.length ||
    profiles.some((profile) => profile.id === catalog.defaultProfileId)
  )
    return;
  const owners = [...project.balance.plants, ...project.balance.enemies].filter(
    (species) =>
      profiles.some((profile) => profile.id === species.animationProfileId),
  );
  if (
    owners.length !== 1 ||
    profiles.some((profile) => profile.id !== owners[0].animationProfileId)
  )
    return;
  return owners[0].id;
}

/** Editing a link on a shared profile must not silently alter another character. */
export function setSpeciesAnimation(
  project: GameProject,
  speciesId: string,
  slot: string,
  animationId: string | null,
): void {
  const { catalog, profile: current } = profileContext(project, speciesId);
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(slot))
    throw Error("Nom d’action invalide.");
  const binding = current.slots.find((value) => value.slot === slot);
  if (
    (animationId === null &&
      (!binding || current.id === catalog.defaultProfileId)) ||
    binding?.animationId === animationId
  )
    return;
  if (
    animationId === "" &&
    BASE_SLOTS.includes(slot as (typeof BASE_SLOTS)[number]) &&
    slot !== "victory"
  )
    throw Error("Cette action de base doit garder une animation.");
  if (animationId) {
    const animation = catalog.animations.find(
      (value) => value.id === animationId,
    );
    if (!animation) throw Error("Animation introuvable.");
    const owner = animationOwnerId(project, animation);
    if (owner && owner !== speciesId)
      throw Error("Cette animation appartient à un autre personnage.");
  }
  if (animationId !== null && !binding && current.slots.length >= 32)
    throw Error("Le profil contient déjà 32 actions.");
  if (
    animationId === null &&
    ["idle", "move", "attack", "hit", "death", "spawn"].includes(slot) &&
    !catalog.profiles
      .find((p) => p.id === catalog.defaultProfileId)
      ?.slots.find((s) => s.slot === slot)?.animationId
  )
    throw Error("Aucune animation par défaut pour cette action.");
  const profile = personalProfile(project, speciesId);
  profile.slots = profile.slots.filter((value) => value.slot !== slot);
  if (animationId !== null) profile.slots.push({ slot, animationId });
}

function profileContext(project: GameProject, speciesId: string) {
  const catalog = project.presentation,
    owner = species(project, speciesId),
    profile = catalog?.profiles.find(
      (value) => value.id === owner?.animationProfileId,
    );
  if (!catalog || !owner || !profile)
    throw Error("Personnage ou profil d’animation introuvable.");
  return { catalog, owner, profile };
}

/** Slots and cues share the same copy-on-write boundary. No edit leaks to another species. */
function personalProfile(
  project: GameProject,
  speciesId: string,
): AnimationProfile {
  const { catalog, owner, profile } = profileContext(project, speciesId);
  if (
    profile.id !== catalog.defaultProfileId &&
    ![...project.balance.plants, ...project.balance.enemies].some(
      (s) => s.id !== speciesId && s.animationProfileId === profile.id,
    )
  )
    return profile;
  if (catalog.profiles.length >= 128)
    throw Error("Le catalogue contient déjà 128 profils.");
  const copy = {
    ...structuredClone(profile),
    id: uniqueProfileId(
      catalog.profiles.map((value) => value.id),
      speciesId,
    ),
    name: ("Profil de " + owner.name).slice(0, 160),
  };
  catalog.profiles.push(copy);
  owner.animationProfileId = copy.id;
  return copy;
}

/** Empty channels inherit; removing an override restores all fallback channels. */
export function setSpeciesCue(
  project: GameProject,
  speciesId: string,
  event: PresentationEvent,
  cue: Cue | null,
): void {
  const { catalog, profile: current } = profileContext(project, speciesId),
    old = current.events.find((e) => e.event === event);
  if (
    (cue === null && (!old || current.id === catalog.defaultProfileId)) ||
    (cue &&
      old &&
      old.soundId === cue.soundId &&
      old.vfxId === cue.vfxId &&
      old.attach === cue.attach)
  )
    return;
  if (
    (cue?.soundId && !catalog.audio.some((s) => s.id === cue.soundId)) ||
    (cue?.vfxId && !catalog.vfx.some((v) => v.id === cue.vfxId))
  )
    throw Error("Son ou effet visuel introuvable.");
  const profile = personalProfile(project, speciesId);
  profile.events = profile.events.filter((e) => e.event !== event);
  if (cue) profile.events.push({ ...cue, event });
}

export function personalizeAnimation(
  project: GameProject,
  speciesId: string,
  slot: string,
  copy = true,
): string {
  const { catalog, owner, profile } = profileContext(project, speciesId);
  if (catalog.animations.length >= 512)
    throw Error("Le catalogue contient déjà 512 animations.");
  if (
    !/^[a-zA-Z0-9_-]{1,100}$/.test(slot) ||
    (!profile.slots.some((s) => s.slot === slot) && profile.slots.length >= 32)
  )
    throw Error("Impossible d’ajouter cette action au profil.");
  const source = copy ? resolveAnimation(project, owner, slot) : undefined;
  const animation = source ? structuredClone(source) : newAnimation(slot);
  animation.id = newId("anim");
  animation.name = (owner.name + " — " + (SLOT_LABELS[slot] ?? slot)).slice(
    0,
    160,
  );
  animation.ownerSpeciesId = speciesId;
  animation.markers = animation.markers.map((marker) => ({
    ...marker,
    id: newId("marker"),
  }));
  const local = personalProfile(project, speciesId);
  catalog.animations.push(animation);
  local.slots = [
    ...local.slots.filter((s) => s.slot !== slot),
    { slot, animationId: animation.id },
  ];
  return animation.id;
}

function uniqueProfileId(existing: string[], speciesId: string): string {
  const base = ("profile_" + speciesId).slice(0, 94);
  if (!existing.includes(base)) return base;
  let index = 2;
  while (existing.includes(base + "_" + index)) index++;
  return base + "_" + index;
}
