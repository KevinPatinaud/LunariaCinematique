import React, { useEffect, useState } from "react";
import type { Asset } from "../../shared/model.js";
import type { GameProject } from "../../shared/game/types.js";
import {
  SLOT_LABELS,
  type AnimationDefinition,
} from "../../shared/presentation/types.js";
import { species } from "../../shared/presentation/runtime.js";
import {
  animationOwnerId,
  setSpeciesAnimation,
  personalizeAnimation,
} from "../../shared/presentation/ownership.js";
import { speciesActionSlots } from "../../shared/presentation/actions.js";
import { SpeciesAction } from "./SpeciesAction.js";
import { AssetChoice, Choose } from "./PresentationFields.js";
import { Num } from "../game/CombatFields.js";
import type { Change } from "./PresentationEditor.js";

interface Props {
  project: GameProject;
  id: string;
  assets: Asset[];
  change: Change;
  openProfile: (id: string) => void;
  focusAnimationId?: string;
  editCapabilities: () => void;
  renderAnimationEditor: (
    animation: AnimationDefinition,
    patch: (data: Record<string, unknown>, key?: string) => void,
    speciesId: string,
  ) => React.ReactNode;
}
export function SpeciesAnimations({
  project,
  id,
  assets,
  change,
  openProfile,
  focusAnimationId,
  renderAnimationEditor,
  editCapabilities,
}: Props) {
  const item = species(project, id)!;
  const catalog = project.presentation!;
  const profile = catalog.profiles.find(
    (value) => value.id === item.animationProfileId,
  )!;
  const slots = speciesActionSlots(project, item);
  const owned = catalog.animations.filter(
    (animation) => animationOwnerId(project, animation) === id,
  );

  const [selectedId, setSelectedId] = useState(
    focusAnimationId || owned[0]?.id || "",
  );
  const [view, setView] = useState<"own" | "actions">(
    focusAnimationId ? "own" : "actions",
  );
  const [error, setError] = useState("");
  const safeChange: Change = (edit, key, label) => {
    try {
      change(edit, key, label);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const [custom, setCustom] = useState("");
  useEffect(() => {
    setSelectedId(
      focusAnimationId &&
        owned.some((animation) => animation.id === focusAnimationId)
        ? focusAnimationId
        : owned[0]?.id || "",
    );
    setView(focusAnimationId ? "own" : "actions");
    setError("");
  }, [id, focusAnimationId]);
  const selected = owned.find((animation) => animation.id === selectedId);
  const assign = (slot: string, animationId: string | null) =>
    safeChange(
      (draft) => setSpeciesAnimation(draft, id, slot, animationId),
      "",
      `Choisir l’animation de ${item.name}`,
    );
  const personalize = (slot: string, copy: boolean) => {
    let animationId = "";
    safeChange(
      (draft) => {
        animationId = personalizeAnimation(draft, id, slot, copy);
      },
      "",
      `Créer une animation pour ${item.name}`,
    );
    if (animationId) {
      setSelectedId(animationId);
      setView("own");
    }
  };
  const patchAnimation = (data: Record<string, unknown>, key = "") =>
    selected &&
    change(
      (draft) =>
        Object.assign(
          draft.presentation!.animations.find(
            (animation) => animation.id === selected.id,
          )!,
          data,
        ),
      `${selected.id}:${key}`,
      `Modifier l’animation de ${item.name}`,
    );
  return (
    <section
      className="lp-species-workshop"
      aria-label={"Animations de " + item.name}
    >
      <header className="lp-species-heading">
        <div>
          <span className="gd-kicker">ANIMATIONS ET SONS</span>
          <h2>Animations et sons de {item.name}</h2>
          <p>
            Pour chaque action, retrouve le geste, le moment du départ, les sons
            et les effets réellement utilisés. Les modifications du profil
            restent propres à {item.name}.
          </p>
        </div>
        <strong>
          {owned.length} personnelle{owned.length > 1 ? "s" : ""}
        </strong>
      </header>
      <nav
        className="gd-detail-tabs lp-species-subtabs"
        aria-label={"Édition des animations de " + item.name}
      >
        <button
          className={view === "own" ? "active" : ""}
          onClick={() => setView("own")}
        >
          Ses animations ({owned.length})
        </button>
        <button
          className={view === "actions" ? "active" : ""}
          onClick={() => setView("actions")}
        >
          Actions du personnage
        </button>
      </nav>
      {error && (
        <p className="gd-callout" role="alert">
          {error}
        </p>
      )}
      {view === "actions" && (
        <div className="lp-species-actions">
          {slots.map((slot) => (
            <SpeciesAction
              key={id + ":" + slot}
              project={project}
              id={id}
              slot={slot}
              assets={assets}
              change={safeChange}
              personalize={personalize}
              edit={(animationId) => {
                setSelectedId(animationId);
                setView("own");
              }}
              editCapabilities={editCapabilities}
            />
          ))}
        </div>
      )}
      {view === "own" && (
        <section className="lp-owned-section">
          <div className="lp-owned-heading">
            <div>
              <h3>Créations personnelles</h3>
              <p>
                Tu peux les modifier ici et les associer aux actions de{" "}
                {item.name}.
              </p>
            </div>
            <label className="gd-field">
              <span>Créer une animation</span>
              <select
                aria-label={"Créer une animation pour " + item.name}
                value=""
                onChange={(event) => {
                  if (event.target.value)
                    personalize(event.target.value, false);
                }}
              >
                <option value="">Choisir une action…</option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {SLOT_LABELS[slot] ?? slot}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {owned.length ? (
            <div className="lp-owned-list">
              {owned.map((animation) => (
                <button
                  key={animation.id}
                  className={selected?.id === animation.id ? "selected" : ""}
                  onClick={() => setSelectedId(animation.id)}
                >
                  {animation.name}
                  <small>
                    {animation.kind === "procedural"
                      ? "Mouvement du personnage"
                      : `${animation.frames.length} image${animation.frames.length > 1 ? "s" : ""}`}
                  </small>
                </button>
              ))}
            </div>
          ) : (
            <p className="lp-inline-empty">
              Aucune animation personnelle pour l’instant. Tu peux partir d’une
              action ci-dessus.
            </p>
          )}
          {selected && (
            <div className="lp-owned-editor" key={selected.id}>
              <div className="lp-owned-editor-heading">
                <div>
                  <span className="gd-kicker">
                    ANIMATION DE {item.name.toLocaleUpperCase()}
                  </span>
                  <h3>{selected.name}</h3>
                </div>
                <button
                  onClick={() => {
                    patchAnimation({ ownerSpeciesId: "" });
                    setSelectedId("");
                    if (owned.length === 1) setView("actions");
                  }}
                >
                  Rendre commune
                </button>
              </div>
              <label className="gd-field">
                <span>Nom de l’animation</span>
                <input
                  aria-label={"Nom de l’animation de " + item.name}
                  value={selected.name}
                  maxLength={160}
                  onChange={(event) =>
                    patchAnimation({ name: event.target.value }, "name")
                  }
                />
              </label>
              {renderAnimationEditor(selected, patchAnimation, id)}
            </div>
          )}
        </section>
      )}
      <details className="lp-advanced-panel lp-species-advanced">
        <summary>Profils, actions spéciales et image de repos</summary>
        <p>
          Changer de profil réutilise ses réglages. Le modifier ici crée une
          copie personnelle si nécessaire ; ouvrir l’éditeur avancé modifie le
          profil pour tous ses utilisateurs.
        </p>
        <Choose
          label="Profil d’animation"
          value={profile.id}
          options={catalog.profiles}
          change={(animationProfileId) =>
            change(
              (draft) => {
                species(draft, id)!.animationProfileId = animationProfileId;
              },
              "",
              "Changer le profil",
            )
          }
        />
        <button onClick={() => openProfile(profile.id)}>
          Modifier le profil et ses sons
        </button>
        <div className="gd-inline lp-custom-slot">
          <input
            aria-label="Nouvelle action personnalisée"
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            placeholder="Ex. attaque_speciale"
          />
          <button
            disabled={
              !/^[a-zA-Z0-9_-]+$/.test(custom) ||
              slots.includes(custom) ||
              profile.slots.length >= 32
            }
            onClick={() => {
              assign(custom, "");
              setCustom("");
            }}
          >
            Ajouter l’action
          </button>
        </div>
        {item.visual && (
          <details className="lp-advanced-panel">
            <summary>Image de repos et dimensions</summary>
            <p>{item.visual.note}</p>
            <AssetChoice
              label="Image de repos du personnage"
              value={item.visual.sprite.asset}
              assets={assets}
              change={(asset) =>
                change(
                  (draft) => {
                    species(draft, id)!.visual!.sprite = {
                      asset: asset as `library://${string}`,
                    };
                  },
                  "",
                  "Changer l’image de repos",
                )
              }
            />
            <label className="lp-check">
              <input
                type="checkbox"
                checked={item.visual.mirror}
                onChange={(event) =>
                  change(
                    (draft) => {
                      species(draft, id)!.visual!.mirror = event.target.checked;
                    },
                    "",
                    "Changer le miroir",
                  )
                }
              />{" "}
              Miroir horizontal
            </label>
            <div className="gd-form-grid">
              {(["width", "height", "baseline"] as const).map((key) => (
                <Num
                  key={key}
                  label={
                    {
                      width: "Largeur",
                      height: "Hauteur",
                      baseline: "Ligne des pieds",
                    }[key]
                  }
                  value={item.visual![key]}
                  min={key === "baseline" ? -100 : 1}
                  max={key === "baseline" ? 100 : 400}
                  change={(value) =>
                    change(
                      (draft) => {
                        species(draft, id)!.visual![key] = value;
                      },
                      id + ":visual:" + key,
                      "Calibrer le visuel",
                    )
                  }
                />
              ))}
              <label className="gd-field">
                <span>Teinte</span>
                <input
                  type="color"
                  value={item.visual.tint}
                  onChange={(event) =>
                    change(
                      (draft) => {
                        species(draft, id)!.visual!.tint = event.target.value;
                      },
                      "",
                      "Teinter le visuel",
                    )
                  }
                />
              </label>
            </div>
            {item.visual.walkRig&&<details className="lp-advanced-panel">
              <summary>Marche articulée</summary>
              <p>Les deux pieds alternent leurs appuis tandis que le corps reste stable. La durée du cycle se règle dans l’animation Déplacement.</p>
              <div className="gd-form-grid">
                <Num label="Longueur du pas" value={item.visual.walkRig.stride} min={.1} max={80} change={value=>change(d=>{species(d,id)!.visual!.walkRig!.stride=value;},id+':walk:stride','Régler le pas')}/>
                <Num label="Hauteur du pied" value={item.visual.walkRig.lift} min={0} max={20} change={value=>change(d=>{species(d,id)!.visual!.walkRig!.lift=value;},id+':walk:lift','Régler le pied')}/>
              </div>
            </details>}
            <details className="lp-advanced-panel">
              <summary>Roues et roulement</summary>
              <p>Le corps reste rigide. Les disques sélectionnés tournent dans l’image originale ; dans le jeu, leur rotation suit la distance réellement parcourue. Les coordonnées sont des fractions de l’image (0 à 1).</p>
              {(item.visual.rollingParts??[]).map((part,index)=><section key={index} aria-label={'Roue '+(index+1)}><div className="gd-form-grid">
                {(['center','radius'] as const).flatMap(group=>(['x','y'] as const).map(axis=><Num key={group+axis} label={(group==='center'?'Centre':'Rayon')+' '+axis+' de la roue '+(index+1)} value={part[group][axis]} min={group==='radius'?.001:0} max={group==='radius'?.5:1} change={value=>change(d=>{species(d,id)!.visual!.rollingParts![index][group][axis]=value;},id+':wheel:'+index+group+axis,'Calibrer la roue')}/>))}
              </div><button onClick={()=>change(d=>{species(d,id)!.visual!.rollingParts!.splice(index,1);},'','Retirer la roue')}>Retirer cette roue</button></section>)}
              <button disabled={(item.visual.rollingParts?.length??0)>=4} onClick={()=>change(d=>{const v=species(d,id)!.visual!;(v.rollingParts??=[]).push({center:{x:.5,y:.5},radius:{x:.05,y:.05}});},'','Ajouter une roue')}>Ajouter une roue</button>
            </details>
            <details className="lp-advanced-panel">
              <summary>Rouleaux cylindriques</summary>
              <p>La texture suit la courbure du cylindre. Place les bords sur sa surface mobile ; les supports et la carrosserie restent fixes. Les coordonnées sont des fractions de l’image.</p>
              {(item.visual.rollingDrums??[]).map((drum,index)=><section key={index} aria-label={'Rouleau '+(index+1)}><div className="gd-form-grid">
                {(['left','right'] as const).flatMap(side=>(['top','curve','bottom'] as const).flatMap(point=>(['x','y'] as const).map(axis=><Num key={side+point+axis} label={'Rouleau '+(index+1)+' · '+(side==='left'?'gauche':'droite')+' · '+({top:'haut',curve:'courbure',bottom:'bas'}[point])+' '+axis} value={drum[side][point][axis]} min={0} max={1} change={value=>change(d=>{species(d,id)!.visual!.rollingDrums![index][side][point][axis]=value;},id+':drum:'+index+side+point+axis,'Calibrer le rouleau')}/>)))}
              </div><button onClick={()=>change(d=>{species(d,id)!.visual!.rollingDrums!.splice(index,1);},'','Retirer le rouleau')}>Retirer ce rouleau</button></section>)}
              <button disabled={(item.visual.rollingDrums?.length??0)>=2} onClick={()=>change(d=>{const v=species(d,id)!.visual!;(v.rollingDrums??=[]).push({left:{top:{x:.2,y:.4},curve:{x:.1,y:.6},bottom:{x:.2,y:.8}},right:{top:{x:.8,y:.4},curve:{x:.7,y:.6},bottom:{x:.8,y:.8}}});},'','Ajouter un rouleau')}>Ajouter un rouleau cylindrique</button>
            </details>
            <label className="lp-check">
              <input
                type="checkbox"
                checked={!!item.visual.sprite.region}
                onChange={(event) =>
                  change(
                    (draft) => {
                      species(draft, id)!.visual!.sprite.region = event.target
                        .checked
                        ? { x: 0, y: 0, width: 64, height: 64 }
                        : undefined;
                    },
                    "",
                    "Définir la région de repos",
                  )
                }
              />{" "}
              Découper l’image de repos
            </label>
            {item.visual.sprite.region && (
              <div className="gd-form-grid">
                {(["x", "y", "width", "height"] as const).map((key) => (
                  <Num
                    key={key}
                    label={"Découpe " + key}
                    value={item.visual!.sprite.region![key]}
                    min={key === "width" || key === "height" ? 1 : 0}
                    max={32768}
                    integer
                    change={(value) =>
                      change(
                        (draft) => {
                          species(draft, id)!.visual!.sprite.region![key] =
                            value;
                        },
                        id + ":repos:" + key,
                        "Découper sans copier",
                      )
                    }
                  />
                ))}
              </div>
            )}
          </details>
        )}
      </details>
    </section>
  );
}
