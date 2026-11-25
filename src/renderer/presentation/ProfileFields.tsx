import React, { useState } from "react";
import type { Asset } from "../../shared/model.js";
import type { GameProject } from "../../shared/game/types.js";
import { animationOwnerId, isGameAnimation } from "../../shared/presentation/ownership.js";
import {
  BASE_SLOTS,
  EMPTY_CUE,
  SLOT_LABELS,
  type AnimationProfile,
  type EventCue,
} from "../../shared/presentation/types.js";
import { AnimationPreview } from "./AnimationPreview.js";
import { Choose, CueFields } from "./PresentationFields.js";

export function ProfileFields({
  value,
  project,
  assets,
  patch,
  openAnimation,
}: {
  value: AnimationProfile;
  project: GameProject;
  assets: Asset[];
  patch: (p: Record<string, unknown>, key?: string) => void;
  openAnimation: (id: string) => void;
}) {
  const [custom, setCustom] = useState("");
  const c = project.presentation!,
    fallback = c.profiles.find((p) => p.id === c.defaultProfileId),
    profileUsers = [
      ...project.balance.plants,
      ...project.balance.enemies,
    ].filter((s) => s.animationProfileId === value.id),
    owner = profileUsers[0];
  const availableAnimations = c.animations.filter((animation) => {
    if (!isGameAnimation(animation)) return false;
    const animationOwner = animationOwnerId(project, animation);
    return (
      !animationOwner ||
      (profileUsers.length === 1 && animationOwner === owner?.id)
    );
  });
  const slots = [
    ...new Set([
      ...BASE_SLOTS,
      ...(fallback?.slots ?? []).map((s) => s.slot),
      ...value.slots.map((s) => s.slot),
    ]),
  ];
  const setSlot = (slot: string, animationId: string | null) =>
    patch({
      slots:
        animationId === null
          ? value.slots.filter((s) => s.slot !== slot)
          : [
              ...value.slots.filter((s) => s.slot !== slot),
              { slot, animationId },
            ],
    });
  return (
    <>
      <p className="gd-callout">
        Chaque carte correspond à une action du personnage. Choisis l’animation,
        vérifie-la dans l’aperçu, puis passe à la suivante.
      </p>
      <div className="lp-slots">
        {slots.map((slot) => {
          const own = value.slots.find((s) => s.slot === slot),
            id = (own ?? fallback?.slots.find((s) => s.slot === slot))
              ?.animationId,
            animation = c.animations.find((a) => a.id === id);
          return (
            <article key={slot}>
              <div className="lp-slot-heading">
                <span aria-hidden="true">
                  {slot === "attack"
                    ? "⚔"
                    : slot === "move"
                      ? "➜"
                      : slot === "hit"
                        ? "◆"
                        : slot === "death"
                          ? "✕"
                          : "●"}
                </span>
                <h3>{SLOT_LABELS[slot] ?? slot}</h3>
              </div>
              <AnimationPreview
                catalog={project.presentation}
                compact
                animation={animation}
                visual={owner?.visual ?? project.balance.plants[0].visual}
                assets={assets}
              />
              <Choose
                label="Animation utilisée"
                value={id ?? ""}
                options={availableAnimations}
                empty={
                  !["idle", "move", "attack", "hit", "death", "spawn"].includes(
                    slot,
                  )
                }
                emptyLabel="Désactiver cette action"
                change={(id) => setSlot(slot, id)}
              />
              <small>
                {own
                  ? "Réglage propre à ce personnage"
                  : "Animation commune utilisée par défaut"}
              </small>
              <div className="gd-inline">
                <button
                  disabled={!animation}
                  onClick={() => openAnimation(id!)}
                >
                  Modifier l’animation
                </button>
                <button
                  disabled={value.id === c.defaultProfileId || !own}
                  onClick={() => setSlot(slot, null)}
                >
                  Revenir au réglage commun
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <details className="lp-advanced-panel">
        <summary>Actions et sons avancés</summary>
        <p>
          Cette partie sert uniquement aux actions spéciales et aux exceptions
          sonores d’un personnage.
        </p>
        <div className="gd-inline">
          <input
            aria-label="Nouvelle action personnalisée"
            placeholder="Ex. attaque spéciale"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
          <button
            disabled={
              !/^[a-zA-Z0-9_-]+$/.test(custom) ||
              slots.includes(custom) ||
              value.slots.length >= 32
            }
            onClick={() => {
              setSlot(custom, "");
              setCustom("");
            }}
          >
            Ajouter l’action
          </button>
        </div>
        <h2>Sons et effets propres au personnage</h2>
        {(
          [
            "spawn",
            "start",
            "release",
            "impact",
            "death",
            "phase_transition",
          ] as const
        ).map((event) => (
          <CueFields
            key={event}
            label={event}
            project={project}
            value={
              value.events.find((e) => e.event === event) ?? {
                ...EMPTY_CUE,
                attach: "center",
              }
            }
            change={(cue) =>
              patch({
                events: [
                  ...value.events.filter((e) => e.event !== event),
                  { ...cue, event } as EventCue,
                ],
              })
            }
          />
        ))}
      </details>
      <details className="lp-advanced-panel">
        <summary>Réinitialiser toutes les actions</summary>
        <button
          disabled={value.id === c.defaultProfileId}
          onClick={() => patch({ slots: [], events: [] })}
        >
          Rétablir l’héritage du profil par défaut
        </button>
      </details>
    </>
  );
}
