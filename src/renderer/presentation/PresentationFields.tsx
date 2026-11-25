import React from "react";
import type { Asset, Actor, Cinematic } from "../../shared/model.js";
import { enemyChoices, type GameProject } from "../../shared/game/types.js";
import type {
  Cue,
  AbilityPresentation,
  ProjectilePresentation,
  ActorAnimation,
  CatalogLink,
} from "../../shared/presentation/types.js";
import {
  BASE_SLOTS,
  DEFAULT_ABILITY_PRESENTATION,
  EMPTY_CUE,
  SLOT_LABELS,
} from "../../shared/presentation/types.js";
import { inferActorSpecies } from "../../shared/presentation/cinematicMotion.js";
import { isCinematicAnimation, isGameAnimation } from "../../shared/presentation/ownership.js";
import { speciesActionSlots } from "../../shared/presentation/actions.js";
import { Num } from "../game/CombatFields.js";
export function Choose({
  label,
  value,
  options,
  change,
  empty = false,
  emptyLabel = "Aucun",
}: {
  label: string;
  value: string;
  options: { id: string; name: string }[];
  change: (v: string) => void;
  empty?: boolean;
  emptyLabel?: string;
}) {
  return (
    <label className="gd-field field">
      <span>{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => change(e.target.value)}
      >
        {empty && <option value="">{emptyLabel}</option>}
        {value && !options.some((x) => x.id === value) && (
          <option value={value}>{value} — introuvable</option>
        )}
        {options.map((x) => (
          <option key={x.id} value={x.id}>
            {x.name}
          </option>
        ))}
      </select>
    </label>
  );
}
export function AssetChoice({
  label,
  value,
  assets,
  audio = false,
  empty = false,
  change,
}: {
  label: string;
  value: string;
  assets: Asset[];
  audio?: boolean;
  empty?: boolean;
  change: (ref: string) => void;
}) {
  return (
    <Choose
      label={label}
      value={value}
      empty={empty}
      options={assets
        .filter((a) =>
          (audio ? /\.(wav|ogg|mp3)$/i : /\.(png|jpg|jpeg|webp)$/i).test(
            a.path,
          ),
        )
        .map((a) => ({ id: a.ref, name: a.path }))}
      change={change}
    />
  );
}
export function CueFields({
  label,
  project,
  value,
  change,
}: {
  label: string;
  project: GameProject;
  value: Cue;
  change: (v: Cue) => void;
}) {
  const c = project.presentation!;
  return (
    <fieldset className="lp-cue">
      <legend>{label}</legend>
      <Choose
        label="Son"
        value={value.soundId}
        options={c.audio}
        empty
        emptyLabel="Hériter"
        change={(soundId) => change({ ...value, soundId })}
      />
      <Choose
        label="VFX"
        value={value.vfxId}
        options={c.vfx}
        empty
        emptyLabel="Hériter"
        change={(vfxId) => change({ ...value, vfxId })}
      />
      <Choose
        label="Point d’attache"
        value={value.attach}
        options={["center", "feet", "head", "launch"].map((id) => ({
          id,
          name: id,
        }))}
        change={(attach) =>
          change({ ...value, attach: attach as Cue["attach"] })
        }
      />
    </fieldset>
  );
}
export function AbilityPresentationFields({
  project,
  value,
  change,
}: {
  project: GameProject;
  value?: AbilityPresentation;
  change: (v: AbilityPresentation) => void;
}) {
  const p = value ?? DEFAULT_ABILITY_PRESENTATION;
  return (
    <section>
      <h2>Présentation</h2>
      <p>
        L’attaque demande un slot ; chaque espèce choisit sa propre animation.
        Le départ est calculé par la simulation, même sans affichage. Un
        projectile touche sa cible après son trajet.
      </p>
      <label className="gd-field">
        <span>Slot sémantique demandé</span>
        <input
          aria-label="Slot sémantique demandé"
          list="lp-semantic-slots"
          value={p.slot}
          onChange={(e) => change({ ...p, slot: e.target.value })}
        />
        <datalist id="lp-semantic-slots">
          {BASE_SLOTS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>
      <div className="gd-form-grid">
        <Choose
          label="Libération"
          value={p.release}
          options={[
            { id: "marker", name: "Repère de départ (sinon délai)" },
            { id: "delay", name: "Délai explicite" },
            { id: "immediate", name: "Départ immédiat" },
          ]}
          change={(release) =>
            change({ ...p, release: release as AbilityPresentation["release"] })
          }
        />
        <Num
          label="Délai / repli sans marqueur (s)"
          value={p.delay}
          min={0}
          max={120}
          change={(delay) => change({ ...p, delay })}
        />
      </div>
      <label>
        <input
          type="checkbox"
          checked={p.fitCadence}
          onChange={(e) => change({ ...p, fitCadence: e.target.checked })}
        />{" "}
        Accélérer l’animation et sa libération si la cadence est plus courte
      </label>
      <p className="gd-note">
        La mort annule les préparations. L’étourdissement les annule sans les
        rejouer à la reprise. Les attaques simultanées gardent chacune leur
        libération ; la première conserve le geste visible. Touché est une
        superposition locale.
      </p>
      {(["start", "releaseCue", "impact"] as const).map((key, i) => (
        <CueFields
          key={key}
          project={project}
          value={p[key]}
          label={["Préparation", "Libération", "Impact"][i]}
          change={(v) => change({ ...p, [key]: v })}
        />
      ))}
    </section>
  );
}
export function ProjectilePresentationFields({
  project,
  value,
  assets,
  change,
}: {
  project: GameProject;
  value?: ProjectilePresentation;
  assets: Asset[];
  change: (v: ProjectilePresentation) => void;
}) {
  const p = value ?? {
    asset: "",
    animationId: "",
    trailVfxId: "",
    impact: { ...EMPTY_CUE, attach: "center" },
  };
  return (
    <section>
      <h2>Présentation du tir</h2>
      <AssetChoice
        label="Image du tir (vide : forme simple)"
        value={p.asset}
        assets={assets}
        empty
        change={(asset) =>
          change({ ...p, asset: asset as ProjectilePresentation["asset"] })
        }
      />
      <Choose
        label="Animation du tir"
        value={p.animationId}
        options={project.presentation!.animations.filter(isGameAnimation)}
        empty
        change={(animationId) => change({ ...p, animationId })}
      />
      <Choose
        label="Traînée visuelle"
        value={p.trailVfxId}
        options={project.presentation!.vfx}
        empty
        change={(trailVfxId) => change({ ...p, trailVfxId })}
      />
      <CueFields
        label="Impact (repli après le profil et l’attaque)"
        project={project}
        value={p.impact}
        change={(impact) => change({ ...p, impact })}
      />
    </section>
  );
}
export function ActorBindingFields({
  actor,
  doc,
  project,
  change,
  setCatalog,
  onOpenWorkshop,
  onGenerateAnimation,
}: {
  actor: Actor;
  doc: Cinematic;
  project: GameProject;
  change: (patch: Partial<Actor>) => void;
  setCatalog: (value: CatalogLink) => void;
  onOpenWorkshop?: (speciesId?: string) => void;
  onGenerateAnimation?: (speciesId?: string) => void;
}) {
  const binding = actor.animation,
    all = [
      ...project.balance.plants,
      ...enemyChoices(project.balance.enemies, binding?.speciesId),
    ];
  const cinematicAnimations = (project.presentation?.animations ?? []).filter(clip => isCinematicAnimation(clip) && !clip.element);
  const cinematicOptions = binding?.mode === "animation" && binding.animationId && !cinematicAnimations.some((a) => a.id === binding.animationId)
    ? [
        ...cinematicAnimations,
        ...(project.presentation?.animations.filter((a) => a.id === binding.animationId) ?? []),
      ]
    : cinematicAnimations;
  const inferred = inferActorSpecies(actor, project);
  const activeSpecies = all.find((x) => x.id === (binding?.speciesId || inferred?.id));
  const knownSlots = activeSpecies
    ? [...new Set(['move', 'idle', 'talk', 'run', 'jump', ...speciesActionSlots(project, activeSpecies)])]
    : ['move', 'idle', 'talk', 'run', 'jump', ...BASE_SLOTS];
  const fallback: ActorAnimation = {
    mode: "animation",
    speciesId: inferred?.id ?? all[0].id,
    slot: actor.movement?.enabled ? "move" : "idle",
    animationId: cinematicAnimations[0]?.id ?? "",
    speed: 1,
    ...(actor.movement?.enabled ? { syncWithMovement: true, autoFlip: true } : {}),
  };
  const set = (p: ActorAnimation) => {
    setCatalog({
      projectId: project.id,
      file:
        doc.presentationCatalog?.projectId === project.id
          ? doc.presentationCatalog.file
          : "",
    });
    change({ animation: p });
  };
  return (
    <section>
      <h3>Animation de cinématique</h3>
      <Choose
        label="Source de l’acteur"
        value={binding?.mode ?? "static"}
        options={[
          { id: "static", name: "Image fixe" },
          { id: "animation", name: "Animation de cinématique" },
          { id: "species", name: "Espèce → profil → slot (héritage)" },
        ]}
        change={(mode) => {
          if (mode === "static") change({ animation: undefined });
          else
            set({
              ...(binding ?? fallback),
              mode: mode as ActorAnimation["mode"],
              animationId:
                binding?.animationId || cinematicAnimations[0]?.id || "",
            });
        }}
      />
      {(onOpenWorkshop || onGenerateAnimation) && (
        <div className="field-row">
          {onOpenWorkshop && (
            <button
              type="button"
              className="button subtle"
              onClick={() => onOpenWorkshop(binding?.speciesId || inferred?.id)}
            >
              Atelier d’animations
            </button>
          )}
        </div>
      )}
      {binding && (
        <>
          <p className="field-hint">
            Catalogue : {doc.presentationCatalog?.projectId ?? "non relié"}.
            Seules les animations dédiées aux cinématiques sont proposées ici,
            séparément des animations des niveaux.
          </p>
          {doc.presentationCatalog?.projectId !== project.id && (
            <p role="alert">
              Le catalogue du film ne correspond pas au projet ouvert.
            </p>
          )}
          <Choose
            label={
              binding.mode === "species"
                ? "Espèce animée"
                : "Espèce de repos (animation procédurale)"
            }
            value={binding.speciesId}
            options={all.map((species) => ({
              id: species.id,
              name:
                species.name +
                ("archived" in species && species.archived ? " (archivé)" : ""),
            }))}
            empty={binding.mode === "animation"}
            change={(speciesId) => set({ ...binding, speciesId })}
          />
          {binding.mode === "animation" ? (
            <Choose
              label="Animation de cinématique"
              value={binding.animationId}
              options={cinematicOptions}
              empty
              emptyLabel="Aucune animation de cinématique"
              change={(animationId) => set({ ...binding, animationId })}
            />
          ) : (
            <label className="field">
              <span>Slot de l’acteur</span>
              <input
                list="lp-actor-slots"
                value={binding.slot}
                onChange={(e) => set({ ...binding, slot: e.target.value })}
              />
              <datalist id="lp-actor-slots">
                {knownSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {SLOT_LABELS[slot] ?? slot}
                  </option>
                ))}
              </datalist>
            </label>
          )}
          <label className="check-field">
            <input
              type="checkbox"
              checked={!!binding.syncWithMovement}
              onChange={(e) =>
                set({
                  ...binding,
                  syncWithMovement: e.target.checked || undefined,
                })
              }
            />
            Synchroniser avec le déplacement A → B (repos à l’arrêt)
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={!!binding.autoFlip}
              onChange={(e) =>
                set({
                  ...binding,
                  autoFlip: e.target.checked || undefined,
                })
              }
            />
            Retourner selon le sens du trajet
          </label>
          <Num
            label="Vitesse de lecture"
            value={binding.speed}
            min={0.05}
            max={10}
            change={(speed) => set({ ...binding, speed })}
          />
          <label className="field">
            <span>Fichier du catalogue, relatif au projet publié</span>
            <input
              value={doc.presentationCatalog?.file ?? ""}
              placeholder="content/design/game_content.json"
              onChange={(e) =>
                setCatalog({ projectId: project.id, file: e.target.value })
              }
            />
          </label>
        </>
      )}
    </section>
  );
}
