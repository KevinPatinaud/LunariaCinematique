import React, { useState } from "react";
import type { Asset } from "../../shared/model.js";
import type { GameProject } from "../../shared/game/types.js";
import { actionPresentation } from "../../shared/presentation/actions.js";
import {
  animationOwnerId,
  isGameAnimation,
  setSpeciesAnimation,
  setSpeciesCue,
} from "../../shared/presentation/ownership.js";
import { species, type CueSource } from "../../shared/presentation/runtime.js";
import {
  SLOT_LABELS,
  type Cue,
  type PresentationEvent,
} from "../../shared/presentation/types.js";
import { AnimationPreview } from "./AnimationPreview.js";
import { SoundPreview } from "./SoundPreview.js";
import type { Change } from "./PresentationEditor.js";
const SOURCES: Record<CueSource, string> = {
  character: "Profil du personnage",
  ability: "Capacité",
  projectile: "Projectile",
  default: "Profil par défaut",
};
const EVENTS: Record<PresentationEvent, string> = {
  spawn: "Apparition",
  start: "Préparation",
  release: "Départ de l’attaque",
  impact: "Impact sur la cible",
  death: "Mort",
  phase_transition: "Transition de phase",
};
const ATTACH = {
  center: "Centre",
  feet: "Pieds",
  head: "Tête",
  launch: "Point de tir",
};
export function SpeciesAction({
  project,
  id,
  slot,
  assets,
  change,
  personalize,
  edit,
  editCapabilities,
}: {
  project: GameProject;
  id: string;
  slot: string;
  assets: Asset[];
  change: Change;
  personalize: (slot: string, copy: boolean) => void;
  edit: (id: string) => void;
  editCapabilities: () => void;
}) {
  const owner = species(project, id)!,
    catalog = project.presentation!,
    profile = catalog.profiles.find((p) => p.id === owner.animationProfileId)!,
    [abilityId, setAbilityId] = useState(""),
    [expanded, setExpanded] = useState(false);
  const action = actionPresentation(project, owner, slot, abilityId),
    animation = action.animation,
    label = SLOT_LABELS[slot] ?? slot,
    clipOwner = animation && animationOwnerId(project, animation);
  const own =
    profile.id !== catalog.defaultProfileId
      ? profile.slots.find((s) => s.slot === slot)
      : undefined;
  const available = catalog.animations.filter(
    (a) => isGameAnimation(a) && (!animationOwnerId(project, a) || animationOwnerId(project, a) === id),
  );
  const inherited = catalog.profiles
    .find((p) => p.id === catalog.defaultProfileId)
    ?.slots.find((s) => s.slot === slot)?.animationId;
  const required = ["idle", "move", "attack", "hit", "death", "spawn"].includes(
    slot,
  );
  return (
    <article
      className={"lp-action-card" + (expanded ? " expanded" : "")}
      aria-label={"Action : " + label}
    >
      <div className="lp-species-action-heading">
        <h3>{label}</h3>
        <small>
          {action.source === "disabled"
            ? "Désactivée"
            : action.source === "inherited" || action.source === "default"
              ? "Profil par défaut"
              : clipOwner === id
                ? "Animation personnelle"
                : "Animation du profil"}
        </small>
      </div>
      <div className="lp-action-gesture">
        <AnimationPreview
          catalog={catalog}
          compact
          animation={action.previewAnimation}
          visual={owner.visual}
          assets={assets}
          events={action.keepsBase ? [] : action.previewEvents}
          speed={action.keepsBase ? 1 : (action.plan?.speed ?? 1)}
        />
        <label className="gd-field">
          <span>Animation pour {label}</span>
          <select
            aria-label={"Animation pour " + label}
            value={own?.animationId ?? "@inherit"}
            onChange={(e) =>
              change(
                (draft) =>
                  setSpeciesAnimation(
                    draft,
                    id,
                    slot,
                    e.target.value === "@inherit" ? null : e.target.value,
                  ),
                "",
                `Animer ${owner.name} : ${label}`,
              )
            }
          >
            <option value="@inherit" disabled={required && !inherited}>
              Hériter du profil par défaut
              {inherited
                ? " — " +
                  (catalog.animations.find((a) => a.id === inherited)?.name ??
                    inherited)
                : " — aucune animation"}
            </option>
            {!required && <option value="">Désactiver cette action</option>}
            {available.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <div className="gd-inline">
          {clipOwner === id ? (
            <button onClick={() => edit(animation!.id)}>Modifier ici</button>
          ) : (
            <button onClick={() => personalize(slot, true)}>
              Créer une version pour {owner.name}
            </button>
          )}
        </div>
        <p className="lp-action-duration">
          {animation
            ? `${action.duration.toFixed(3)} s · ${animation.loop ? "en boucle" : "une fois"}`
            : "Aucune animation"}
        </p>
        {action.keepsBase && (
          <p>
            Cette capacité de soutien conserve l’attente ou le déplacement dans
            le jeu. L’aperçu montre l’attente ; ses signaux s’écoutent
            ci-dessous. Choisir un geste personnel permet de le jouer.
          </p>
        )}
      </div>
      {slot === "hit" && (
        <p>
          Réaction aux coups reçus. Les sons d’impact sont choisis par
          l’attaquant ; les repères de cette animation s’y ajoutent.
        </p>
      )}
      {!!action.abilities.length && (
        <div className="lp-action-timing">
          <label className="gd-field">
            <span>Capacité utilisant cette action</span>
            <select
              aria-label={"Capacité pour " + label}
              value={action.ability?.id}
              onChange={(e) => setAbilityId(e.target.value)}
            >
              {action.abilities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <strong>Départ après {action.plan!.delay.toFixed(3)} s</strong>
          <p>
            {
              {
                marker: "Repère de départ de l’animation",
                delay: "Délai de la capacité",
                immediate: "Départ immédiat",
                fallback: "Repère absent : délai de repli",
              }[action.releaseSource!]
            }{" "}
            · lecture ×{action.plan!.speed.toFixed(2)} · cadence de base{" "}
            {action.interval.toFixed(3)} s.
          </p>
          <small>
            Valeurs sans bonus, ralentissement ni multiplicateur de phase.
            L’impact d’un projectile dépend ensuite de son trajet.
          </small>
          <button onClick={editCapabilities}>Régler dans Capacités</button>
        </div>
      )}
      <details
        className="lp-action-cues"
        onToggle={(event) => setExpanded(event.currentTarget.open)}
      >
        <summary>
          Sons et effets · {action.cues.filter((c) => c.cue.soundId).length}{" "}
          signal(s) sonore(s),{" "}
          {animation?.markers.filter((m) => m.type === "sound").length ?? 0}{" "}
          repère(s)
        </summary>
        {expanded && (
          <>
            {!!action.cues.length && (
              <p>
                Un champ vide hérite. Chaque canal se résout séparément : profil
                du personnage, capacité, projectile, puis profil par défaut. Les
                réglages ci-dessous s’appliquent à toutes les capacités de{" "}
                {owner.name} pour cet événement.
              </p>
            )}
            <div className="lp-action-cue-grid">
              {action.cues.map((resolved) => {
                const event = resolved.event,
                  personal =
                    profile.id !== catalog.defaultProfileId
                      ? profile.events.find((e) => e.event === event)
                      : undefined,
                  value: Cue = personal ?? {
                    soundId: "",
                    vfxId: "",
                    attach: "center",
                  };
                const sound = catalog.audio.find(
                    (s) => s.id === resolved.cue.soundId,
                  ),
                  vfx = catalog.vfx.find((v) => v.id === resolved.cue.vfxId);
                const patch = (cue: Cue | null) =>
                  change(
                    (draft) => setSpeciesCue(draft, id, event, cue),
                    "",
                    `Son et effet de ${owner.name} : ${EVENTS[event]}`,
                  );
                return (
                  <section
                    className="lp-action-cue"
                    key={event}
                    aria-label={EVENTS[event]}
                  >
                    <h4>{EVENTS[event]}</h4>
                    <dl>
                      <div>
                        <dt>Son effectif</dt>
                        <dd>
                          {sound?.name ?? "Silence"}
                          <small>
                            {resolved.soundSource
                              ? SOURCES[resolved.soundSource]
                              : "Aucune source"}
                          </small>
                        </dd>
                      </div>
                      <div>
                        <dt>Effet effectif</dt>
                        <dd>
                          {vfx?.name ?? "Aucun"}
                          <small>
                            {resolved.vfxSource
                              ? SOURCES[resolved.vfxSource]
                              : "Aucune source"}
                          </small>
                        </dd>
                      </div>
                    </dl>
                    <SoundPreview
                      sound={sound}
                      assets={assets}
                      label={"Écouter : " + EVENTS[event]}
                    />
                    {sound && !assets.some((a) => a.ref === sound.asset) && (
                      <p role="status">
                        Fichier audio absent de la bibliothèque liée.
                      </p>
                    )}
                    {sound && sound.volume === 0 && (
                      <p>Ce son est réglé à volume nul.</p>
                    )}
                    <label className="gd-field">
                      <span>Son propre au personnage</span>
                      <select
                        aria-label={"Son de " + EVENTS[event]}
                        value={value.soundId}
                        onChange={(e) =>
                          patch({ ...value, soundId: e.target.value })
                        }
                      >
                        <option value="">Hériter</option>
                        {catalog.audio.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="gd-field">
                      <span>Effet propre au personnage</span>
                      <select
                        aria-label={"Effet de " + EVENTS[event]}
                        value={value.vfxId}
                        onChange={(e) =>
                          patch({ ...value, vfxId: e.target.value })
                        }
                      >
                        <option value="">Hériter</option>
                        {catalog.vfx.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="gd-field">
                      <span>Point d’attache propre au personnage</span>
                      <select
                        aria-label={"Position de " + EVENTS[event]}
                        value={value.attach}
                        onChange={(e) =>
                          patch({
                            ...value,
                            attach: e.target.value as Cue["attach"],
                          })
                        }
                      >
                        {Object.entries(ATTACH).map(([id, name]) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <small>
                      Position effective : {ATTACH[resolved.cue.attach]}
                      {resolved.attachSource
                        ? " · " + SOURCES[resolved.attachSource]
                        : ""}
                      . Le premier signal non vide choisit la position des deux
                      canaux.
                    </small>
                    <button disabled={!personal} onClick={() => patch(null)}>
                      Rétablir l’héritage des sons et effets
                    </button>
                  </section>
                );
              })}
            </div>
            <h4>Repères dans l’animation</h4>
            {animation?.markers.filter((m) => m.type !== "release").length ? (
              <ul>
                {animation.markers
                  .filter((m) => m.type !== "release")
                  .map((m) => (
                    <li key={m.id}>
                      {m.at.toFixed(3)} s ·{" "}
                      {m.type === "sound"
                        ? (catalog.audio.find((s) => s.id === m.ref)?.name ??
                          "Son introuvable")
                        : (catalog.vfx.find((v) => v.id === m.ref)?.name ??
                          "Effet introuvable")}
                    </li>
                  ))}
              </ul>
            ) : (
              <p>Aucun son ni effet placé sur une image.</p>
            )}
            <p>
              Les repères s’ajoutent aux signaux ci-dessus. L’aperçu joue le
              geste et ses signaux ; les impacts de projectile s’écoutent
              séparément.
            </p>
          </>
        )}
      </details>
    </article>
  );
}
