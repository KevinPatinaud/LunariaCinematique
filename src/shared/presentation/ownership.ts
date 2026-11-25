import type { AssetRef } from "../model.js";
import type { GameProject } from "../game/types.js";
import {
  BASE_SLOTS,
  SLOT_LABELS,
  type AnimationDefinition,
  type AnimationProfile,
  type AnimationScope,
  type Cue,
  type PresentationEvent,
} from "./types.js";
import { newId } from "../game/types.js";
import { newAnimation } from "./factories.js";
import { resolveAnimation, species } from "./runtime.js";

/** Animations default to gameplay ('game') unless explicitly marked for 'cinematic'. */
export function animationScope(
  animation: Pick<AnimationDefinition, "scope">,
): AnimationScope {
  return animation.scope === "cinematic" ? "cinematic" : "game";
}

export function isCinematicAnimation(
  animation: Pick<AnimationDefinition, "scope">,
): boolean {
  return animationScope(animation) === "cinematic";
}

export function isGameAnimation(
  animation: Pick<AnimationDefinition, "scope">,
): boolean {
  return animationScope(animation) === "game";
}

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
    if (isCinematicAnimation(animation))
      throw Error("Une animation de cinématique ne peut pas être assignée à une action de niveau.");
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

export interface RegisterSpeciesAnimationOptions {
  speciesId?: string;
  slot: string;
  name: string;
  frames: AnimationDefinition["frames"];
  loop: boolean;
  stridePx?: number;
  scope?: AnimationScope;
  sourceAssetRef?: AssetRef;
  assignSlot?: boolean;
  replaceAnimationId?: string;
}

/**
 * Create (or update) a reusable frame-based animation owned by a character or tied to a static cinematic image.
 * Cinematic animations (`scope: 'cinematic'`) stay strictly isolated from gameplay level profile slots
 * and may omit `speciesId` when animating a standalone cinematic character image.
 */
export function registerSpeciesAnimation(
  project: GameProject,
  options: RegisterSpeciesAnimationOptions,
): string {
  const targetScope: AnimationScope = options.scope === "cinematic" ? "cinematic" : "game";
  const catalog = project.presentation;
  if (!catalog)
    throw Error("Catalogue de présentation introuvable.");
  let owner: ReturnType<typeof species> | undefined;
  if (targetScope === "cinematic") {
    if (options.speciesId) {
      owner = species(project, options.speciesId);
      if (!owner) throw Error("Personnage propriétaire introuvable.");
    }
  } else {
    owner = profileContext(project, options.speciesId ?? "").owner;
  }
  if (!options.frames.length)
    throw Error("L’animation doit contenir au moins une frame.");
  const totalDuration = Math.max(
    0.01,
    Math.min(120, options.frames.reduce((sum, frame) => sum + frame.duration, 0)),
  );
  const existing = options.replaceAnimationId
    ? catalog.animations.find(
        (item) =>
          item.id === options.replaceAnimationId &&
          animationOwnerId(project, item) === owner?.id &&
          animationScope(item) === targetScope,
      )
    : undefined;
  let target: AnimationDefinition;
  if (existing) {
    target = existing;
    target.name = options.name.trim().slice(0, 160) || target.name;
    target.kind = "frames";
    target.frames = structuredClone(options.frames);
    target.duration = totalDuration;
    target.loop = options.loop;
    target.anchor = { x: 0.5, y: 1 };
    target.motion = { preset: "none", amplitude: 0, period: totalDuration };
    if (targetScope === "cinematic") target.scope = "cinematic";
    else delete target.scope;
    if (options.sourceAssetRef) target.sourceAssetRef = options.sourceAssetRef;
    else delete target.sourceAssetRef;
    if (options.stridePx && options.stridePx >= 1) target.stridePx = Math.min(4000, options.stridePx);
    else delete target.stridePx;
  } else {
    if (catalog.animations.length >= 512)
      throw Error("Le catalogue contient déjà 512 animations.");
    const created = newAnimation(options.slot);
    created.id = newId("anim");
    created.name = (
      options.name.trim() ||
      `${owner?.name ?? "Personnage"} — ${SLOT_LABELS[options.slot] ?? options.slot}`
    ).slice(0, 160);
    if (owner) created.ownerSpeciesId = owner.id;
    if (targetScope === "cinematic") created.scope = "cinematic";
    if (options.sourceAssetRef) created.sourceAssetRef = options.sourceAssetRef;
    created.kind = "frames";
    created.frames = structuredClone(options.frames);
    created.duration = totalDuration;
    created.loop = options.loop;
    created.anchor = { x: 0.5, y: 1 };
    created.motion = { preset: "none", amplitude: 0, period: totalDuration };
    if (options.stridePx && options.stridePx >= 1) created.stridePx = Math.min(4000, options.stridePx);
    catalog.animations.push(created);
    target = created;
  }
  if (targetScope !== "cinematic" && owner && options.assignSlot !== false && options.slot) {
    setSpeciesAnimation(project, owner.id, options.slot, target.id);
  }
  return target.id;
}
