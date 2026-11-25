import React, { useMemo, useState } from "react";
import type { Asset } from "../../shared/model.js";
import type { GameProject } from "../../shared/game/types.js";
import { newId } from "../../shared/game/types.js";
import { newAnimation } from "../../shared/presentation/defaults.js";
import {
  presentationUsages,
  presentationRemovalIndex,
} from "../../shared/presentation/usages.js";
import { animationOwnerId, isGameAnimation } from "../../shared/presentation/ownership.js";
import type {
  PresentationSection,
  AnimationDefinition,
  AnimationProfile,
  SoundDefinition,
  VfxDefinition,
} from "../../shared/presentation/types.js";
import { AnimationFields } from "./AnimationFields.js";
import { ProfileFields } from "./ProfileFields.js";
import { AudioFields } from "./AudioFields.js";
import { VfxFields } from "./VfxFields.js";
import { api } from "../browserBridge.js";
import "./presentation.css";

export { AnimationFields } from "./AnimationFields.js";
export { ProfileFields } from "./ProfileFields.js";
export { AudioFields } from "./AudioFields.js";
export { VfxFields } from "./VfxFields.js";

const TITLES = {
  animations: "Animations communes",
  profiles: "Profils avancés",
  audio: "Sons",
  vfx: "Effets visuels",
};
const SECTION_UI = {
  animations: {
    icon: "▶",
    create: "+ Animation commune",
    hint: "Ces mouvements sont réutilisables par tous. Les animations propres à un personnage se règlent sur sa fiche.",
  },
  profiles: {
    icon: "♟",
    create: "+ Nouveau profil",
    hint: "Associe les animations aux actions d’une plante ou d’un ennemi.",
  },
  audio: {
    icon: "♪",
    create: "+ Nouveau son",
    hint: "Prépare les sons utilisés par les attaques et les personnages.",
  },
  vfx: {
    icon: "✦",
    create: "+ Nouvel effet visuel",
    hint: "Crée les impacts, traînées, halos et particules.",
  },
} as const;

export type Change = (
  edit: (p: GameProject) => void,
  key?: string,
  label?: string,
) => void;
interface Props {
  project: GameProject;
  section: PresentationSection;
  id: string;
  select: (id: string) => void;
  assets: Asset[];
  change: Change;
  report: (s: string) => void;
  run: (fn: () => Promise<void>) => Promise<void>;
  openAnimation: (id: string) => void;
}
export function PresentationEditor({
  project,
  section,
  id,
  select,
  assets,
  change,
  report,
  run,
  openAnimation,
}: Props) {
  const [query, setQuery] = useState(""),
    c = project.presentation!,
    list =
      section === "animations"
        ? c.animations.filter(
            (animation) => isGameAnimation(animation) && !animationOwnerId(project, animation),
          )
        : c[section],
    item = list.find((x) => x.id === id) ?? list[0];
  const usages = useMemo(() => presentationUsages(project), [project]);
  const refs = item ? usages.references[item.id] ?? [] : [];
  const patch = (data: Record<string, unknown>, key = "") =>
    item &&
    change(
      (p) =>
        Object.assign(
          p.presentation![section].find((x) => x.id === item.id)!,
          data,
        ),
      `${item.id}:${key}`,
      "Modifier " + TITLES[section],
    );
  function create() {
    let value:
      | AnimationDefinition
      | AnimationProfile
      | SoundDefinition
      | VfxDefinition;
    if (section === "animations")
      value = { ...newAnimation(), ownerSpeciesId: "" };
    else if (section === "profiles")
      value = {
        id: newId("profile"),
        name: "Nouveau profil",
        slots: [],
        events: [],
      };
    else if (section === "audio") {
      const asset = assets.find((x) => /\.(wav|ogg|mp3)$/i.test(x.path));
      if (!asset) {
        report(
          "Relie la bibliothèque contenant les sons dans le mode Cinématiques. Aucun fichier audio n’a été inventé.",
        );
        return;
      }
      value = {
        id: newId("sound"),
        name: "Nouveau son",
        asset: asset.ref,
        bus: "sfx",
        volume: 0.6,
        loop: false,
        pitchVariation: 0,
        maxInstances: 4,
      };
    } else
      value = {
        id: newId("vfx"),
        name: "Nouvel effet visuel",
        preset: "impact",
        duration: 0.35,
        size: 32,
        color: "#b0db90",
        intensity: 0.7,
        quantity: 8,
        asset: "",
        attach: "center",
        maxInstances: 12,
      };
    change(
      (p) => (p.presentation![section] as typeof list).push(value as never),
      "",
      "Créer " + TITLES[section],
    );
    select(value.id);
  }
  function duplicate() {
    if (!item) return;
    const value = structuredClone(item);
    value.id = newId(section);
    value.name = (item.name + " — copie").slice(0, 160);
    if (section === "animations")
      (value as AnimationDefinition).ownerSpeciesId = "";
    change(
      (p) => (p.presentation![section] as typeof list).push(value as never),
      "",
      "Dupliquer " + item.name,
    );
    select(value.id);
  }
  async function remove() {
    if (!item) return;
    if (usages.errors.length) {
      report("Suppression bloquée : " + usages.errors.join("; "));
      return;
    }
    if (refs.length) {
      report("Suppression impossible : " + refs.join(", "));
      return;
    }
    await run(async () => {
      if (!(await api.confirmDelete(item.name))) return;
      change(
        (p) => {
          const index = presentationRemovalIndex(p, section, item.id);
          p.presentation![section].splice(index, 1);
        },
        "",
        "Supprimer " + item.name,
      );
    });
  }
  const meta = SECTION_UI[section];
  return (
    <div className="gd-balance lp-editor">
      <aside className="gd-catalog lp-catalog">
        <div className="lp-catalog-heading">
          <span aria-hidden="true">{meta.icon}</span>
          <div>
            <b>{TITLES[section]}</b>
            <small>
              {list.length} élément{list.length > 1 ? "s" : ""}
            </small>
          </div>
        </div>
        <input
          aria-label="Rechercher une présentation"
          placeholder={
            "Rechercher dans " + TITLES[section].toLocaleLowerCase() + "…"
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="gd-primary" onClick={create}>
          {meta.create}
        </button>
        <div className="lp-catalog-items">
          {list
            .filter((x) =>
              (x.name + " " + x.id)
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase()),
            )
            .map((x) => (
              <button
                key={x.id}
                className={x.id === item?.id ? "selected" : ""}
                onClick={() => select(x.id)}
              >
                <span className="lp-catalog-icon" aria-hidden="true">
                  {meta.icon}
                </span>
                <span>
                  <b>{x.name}</b>
                  <small>
                    {section === "animations" && "frames" in x
                      ? x.kind === "procedural"
                        ? "Mouvement du personnage"
                        : `${x.frames.length} image${x.frames.length > 1 ? "s" : ""}`
                      : section === "profiles" && "slots" in x
                        ? `${x.slots.length} action${x.slots.length > 1 ? "s" : ""}`
                        : section === "audio" && "bus" in x
                          ? x.bus
                          : section === "vfx" && "preset" in x
                            ? x.preset
                            : ""}
                  </small>
                </span>
              </button>
            ))}
        </div>
      </aside>
      <main
        className="gd-scroll gd-balance-form lp-editor-main"
        key={item?.id ?? section}
      >
        {item ? (
          <>
            <header className="lp-editor-heading">
              <div>
                <div className="gd-kicker">
                  ANIMATIONS DE COMBAT · {TITLES[section].toLocaleUpperCase()}
                </div>
                <h1>{item.name}</h1>
                <p>{meta.hint}</p>
              </div>
              <div className="gd-inline">
                <button onClick={duplicate}>Dupliquer</button>
                <button
                  disabled={
                    usages.errors.length > 0 ||
                    refs.length > 0 ||
                    (section === "profiles" && c.profiles.length === 1)
                  }
                  onClick={() => void remove()}
                >
                  Supprimer
                </button>
              </div>
            </header>
            <section className="lp-identity">
              <label className="gd-field">
                <span>Nom affiché dans le Studio</span>
                <input
                  aria-label="Nom de la présentation"
                  value={item.name}
                  maxLength={160}
                  onChange={(e) => patch({ name: e.target.value }, "name")}
                />
              </label>
              <details className="lp-technical">
                <summary>
                  Informations techniques et utilisations <b>{refs.length}</b>
                </summary>
                <code>{item.id}</code>
                {refs.length ? (
                  <div className="lp-reference-list">
                    {refs.map((r, i) => (
                      <span key={i}>{r}</span>
                    ))}
                  </div>
                ) : (
                  <p>Cet élément n’est encore utilisé nulle part.</p>
                )}
                <p>Les utilisations sont mises à jour automatiquement.</p>
                {usages.errors.map((e, i) => (
                  <p key={"error" + i} role="alert">
                    {e} — suppression bloquée.
                  </p>
                ))}
              </details>
            </section>
            {section === "animations" ? (
              <AnimationFields
                value={item as AnimationDefinition}
                project={project}
                assets={assets}
                patch={patch}
              />
            ) : section === "profiles" ? (
              <ProfileFields
                value={item as AnimationProfile}
                project={project}
                assets={assets}
                patch={patch}
                openAnimation={openAnimation}
              />
            ) : section === "audio" ? (
              <AudioFields
                value={item as SoundDefinition}
                assets={assets}
                patch={patch}
              />
            ) : (
              <VfxFields
                value={item as VfxDefinition}
                assets={assets}
                patch={patch}
              />
            )}
          </>
        ) : (
          <div className="lp-empty">
            <span aria-hidden="true">{meta.icon}</span>
            <h1>{TITLES[section]}</h1>
            <p>Ce catalogue est vide. Commence par créer un premier élément.</p>
            <button className="gd-primary" onClick={create}>
              {meta.create}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
