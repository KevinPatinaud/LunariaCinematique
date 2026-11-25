import React, { useEffect, useState } from "react";
import type { Asset } from "../../shared/model.js";
import { enemyChoices, newId, type GameProject } from "../../shared/game/types.js";
import { duration } from "../../shared/presentation/runtime.js";
import {
  MOTIONS,
  type AnimationDefinition,
  type AnimationFrame,
} from "../../shared/presentation/types.js";
import { replaceAnimationSheet } from "../../shared/presentation/sheetReplacement.js";
import { AnimationPreview, useImageSize } from "./AnimationPreview.js";
import { ImagePicker, ImagePreview } from "./ImagePicker.js";
import { detectSheetGrid, sheetGrid, type SheetGrid } from "./sheetGrid.js";
import { Choose } from "./PresentationFields.js";
import { Num } from "../game/CombatFields.js";

const MOTION_LABELS: Record<string, string> = {
  roll: "Roulement mécanique",
  press: "Poussée mécanique",
  walk: "Marche articulée",
  none: "Aucun mouvement",
  breath: "Respiration",
  sway: "Balancement",
  bounce: "Rebond",
  shake: "Tremblement",
  recoil: "Recul",
  spin: "Rotation",
  pulse: "Pulsation",
  fade_in: "Apparition",
  fade_out: "Disparition",
};

const MARKER_LABELS = {
  release: "Départ de l’attaque",
  sound: "Jouer un son",
  vfx: "Afficher un effet visuel",
} as const;

const ATTACH_LABELS = {
  center: "Centre",
  feet: "Pieds",
  head: "Tête",
  launch: "Point de tir",
} as const;

export function AnimationFields({
  value: a,
  project,
  assets,
  patch,
  previewSpeciesId,
}: {
  value: AnimationDefinition;
  project: GameProject;
  assets: Asset[];
  patch: (p: Record<string, unknown>, key?: string) => void;
  previewSpeciesId?: string;
}) {
  const existingSheet =
    a.frames.length > 1 &&
    a.frames.every((frame) => frame.asset === a.frames[0].asset && frame.region)
      ? a.frames[0].asset
      : "";
  type SheetFormat = {
    atlas: string;
    grid: SheetGrid | null;
    manual: SheetGrid | null;
    status: "loading" | "saved" | "detected" | "uncertain";
  };
  const [frameIndex, setFrameIndex] = useState(0),
    [atlas, setAtlas] = useState<string>(existingSheet),
    [imageMode, setImageMode] = useState<"sheet" | "files">(
      existingSheet ? "sheet" : "files",
    ),
    [previewSpecies, setPreviewSpecies] = useState(
      previewSpeciesId ?? project.balance.plants[0].id,
    ),
    [fps, setFps] = useState(12),
    [advanced, setAdvanced] = useState(false);
  const [sheetFormat, setSheetFormat] = useState<SheetFormat>(() => ({
    atlas: existingSheet,
    grid: existingSheet ? sheetGrid(a.frames) : null,
    manual: null,
    status: existingSheet ? "saved" : "loading",
  }));
  const selected = a.frames[frameIndex],
    all = [
      ...project.balance.plants,
      ...enemyChoices(
        project.balance.enemies,
        previewSpeciesId ?? previewSpecies,
      ),
    ],
    visual = all.find((x) => x.id === previewSpecies)?.visual,
    atlasAsset = assets.find((x) => x.ref === atlas),
    atlasSize = useImageSize(atlasAsset?.url ?? "");
  useEffect(() => {
    if (!atlas) {
      setSheetFormat({
        atlas: "",
        grid: null,
        manual: null,
        status: "loading",
      });
      return;
    }
    if (atlas === existingSheet) {
      setSheetFormat({
        atlas,
        grid: sheetGrid(a.frames),
        manual: null,
        status: "saved",
      });
      return;
    }
    if (!atlasAsset?.url) {
      setSheetFormat({ atlas, grid: null, manual: null, status: "loading" });
      return;
    }
    let live = true;
    setSheetFormat({ atlas, grid: null, manual: null, status: "loading" });
    void detectSheetGrid(atlasAsset.url).then(
      (grid) => {
        if (live)
          setSheetFormat({
            atlas,
            grid,
            manual: grid ? null : { columns: 1, rows: 1 },
            status: grid ? "detected" : "uncertain",
          });
      },
      () => {
        if (live)
          setSheetFormat({
            atlas,
            grid: null,
            manual: { columns: 1, rows: 1 },
            status: "uncertain",
          });
      },
    );
    return () => {
      live = false;
    };
  }, [atlas, atlasAsset?.url]);
  const activeFormat: SheetFormat =
    sheetFormat.atlas === atlas
      ? sheetFormat
      : { atlas, grid: null, manual: null, status: "loading" };
  const grid = activeFormat.manual ?? activeFormat.grid,
    columns = grid?.columns ?? 1,
    rows = grid?.rows ?? 1;
  const updateFrame = (data: Record<string, unknown>) =>
    patch(
      {
        frames: a.frames.map((f, i) =>
          i === frameIndex ? { ...f, ...data } : f,
        ),
      },
      "frame" + frameIndex,
    );
  const addImages = (refs: string[]) => {
    const images = refs.slice(0, 512 - a.frames.length);
    if (!images.length) return;
    patch(
      {
        frames: [
          ...a.frames,
          ...images.map((asset) => ({
            asset: asset as `library://${string}`,
            duration: 1 / fps,
          })),
        ],
      },
      "images",
    );
    setFrameIndex(a.frames.length);
  };
  const sheetFrames = (): AnimationFrame[] => {
    if (!atlasSize || !atlas) return [];
    const frames: AnimationFrame[] = [];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < columns; x++) {
        const left = Math.floor((x * atlasSize.width) / columns),
          top = Math.floor((y * atlasSize.height) / rows);
        frames.push({
          asset: atlas as `library://${string}`,
          duration: 1 / fps,
          region: {
            x: left,
            y: top,
            width: Math.floor(((x + 1) * atlasSize.width) / columns) - left,
            height: Math.floor(((y + 1) * atlasSize.height) / rows) - top,
          },
        });
      }
    return frames;
  };
  const regions =
    atlas === existingSheet
      ? a.frames
      : atlasSize && grid && columns * rows <= 512
        ? sheetFrames()
        : [];
  const replacement =
    atlasSize && atlas
      ? replaceAnimationSheet(
          a.frames,
          atlas as `library://${string}`,
          atlasSize,
        )
      : null;
  const move = (by: number) => {
    const to = frameIndex + by;
    if (to < 0 || to >= a.frames.length) return;
    const frames = structuredClone(a.frames);
    [frames[frameIndex], frames[to]] = [frames[to], frames[frameIndex]];
    patch({ frames });
    setFrameIndex(to);
  };
  const total = Math.max(0.01, duration(a));
  const addMarker = (type: "release" | "sound" | "vfx") =>
    patch({
      markers: [
        ...a.markers,
        {
          id: newId("marker"),
          type,
          at: total * 0.5,
          ref: "",
          attach: "launch",
        },
      ],
    });
  return (
    <>
      <div
        className="lp-workflow"
        aria-label="Étapes de création de l’animation"
      >
        <span>
          <b>1</b>
          <strong>Mouvement</strong>
          <small>Style et rythme</small>
        </span>
        <i aria-hidden="true">›</i>
        <span>
          <b>2</b>
          <strong>Images</strong>
          <small>
            {a.kind === "procedural"
              ? "Sprite du personnage"
              : `${a.frames.length} frame${a.frames.length > 1 ? "s" : ""}`}
          </small>
        </span>
        <i aria-hidden="true">›</i>
        <span>
          <b>3</b>
          <strong>Synchronisation</strong>
          <small>
            {a.markers.length} repère{a.markers.length > 1 ? "s" : ""}
          </small>
        </span>
        <button
          className={advanced ? "active" : ""}
          aria-pressed={advanced}
          onClick={() => setAdvanced(!advanced)}
        >
          {advanced ? "Masquer" : "Afficher"} les réglages avancés
        </button>
      </div>

      <div className="lp-animation-workspace">
        <section className="lp-step-card">
          <div className="lp-step-heading">
            <b>1</b>
            <div>
              <h2>Mouvement</h2>
              <p>
                Choisis simplement l’allure générale. L’aperçu se met à jour
                immédiatement.
              </p>
            </div>
          </div>
          <Choose
            label="Style de l’animation"
            value={a.kind}
            options={[
              { id: "procedural", name: "Mouvement simple du personnage" },
              { id: "frames", name: "Suite d’images" },
              { id: "combined", name: "Suite d’images + mouvement" },
            ]}
            change={(kind) =>
              patch({ kind, frames: kind === "procedural" ? [] : a.frames })
            }
          />
          {previewSpeciesId ? (
            <p className="lp-owner-preview">
              Aperçu avec{" "}
              {all.find((species) => species.id === previewSpeciesId)?.name ??
                previewSpeciesId}
            </p>
          ) : (
            <Choose
              label="Personnage affiché dans l’aperçu"
              value={previewSpecies}
              options={all}
              change={setPreviewSpecies}
            />
          )}
          <Choose
            label="Mouvement"
            value={a.motion.preset}
            options={MOTIONS.map((id) => ({
              id,
              name: MOTION_LABELS[id] ?? id,
            }))}
            change={(preset) => patch({ motion: { ...a.motion, preset } })}
          />
          <div className="gd-form-grid">
            <Num
              label="Intensité du mouvement"
              value={a.motion.amplitude}
              max={5}
              change={(amplitude) =>
                patch({ motion: { ...a.motion, amplitude } })
              }
            />
            <Num
              label="Vitesse du mouvement (s)"
              value={a.motion.period}
              min={0.05}
              max={120}
              change={(period) => patch({ motion: { ...a.motion, period } })}
            />
          </div>
          <label className="lp-check">
            <input
              type="checkbox"
              checked={a.loop}
              onChange={(e) => patch({ loop: e.target.checked })}
            />
            <span>
              <b>Jouer en boucle</b>
              <small>
                À utiliser surtout pour l’attente et le déplacement.
              </small>
            </span>
          </label>
          {a.loop && (
            <div className="gd-form-grid">
              <Num
                label="Foulée par cycle (px · 0 = automatique en marche cinématique)"
                value={a.stridePx ?? 0}
                min={0}
                max={4000}
                change={(value) =>
                  patch(
                    { stridePx: value >= 1 ? value : undefined },
                    "stridePx",
                  )
                }
              />
            </div>
          )}
          {a.kind === "procedural" && (
            <Num
              label="Durée totale (s)"
              value={a.duration}
              min={0.01}
              max={120}
              change={(duration) => patch({ duration })}
            />
          )}
        </section>
        <aside className="lp-preview-sticky">
          <div className="lp-preview-label">
            <span className="gd-kicker">APERÇU EN DIRECT</span>
            <small>{total.toFixed(2)} s</small>
          </div>
          <AnimationPreview
            catalog={project.presentation}
            animation={a}
            visual={visual}
            assets={assets}
          />
        </aside>
      </div>

      {a.kind !== "procedural" && (
        <section className="lp-step-card lp-images-step">
          <div className="lp-step-heading">
            <b>2</b>
            <div>
              <h2>Images</h2>
              <p>
                Une planche peut contenir toutes les poses d’une seule
                animation. Leur ordre et leur durée se règlent ci-dessous.
              </p>
            </div>
          </div>
          <div
            className="lp-image-source-tabs"
            role="group"
            aria-label="Source des images"
          >
            <button
              className={imageMode === "sheet" ? "active" : ""}
              aria-pressed={imageMode === "sheet"}
              onClick={() => setImageMode("sheet")}
            >
              Une planche de frames
            </button>
            <button
              className={imageMode === "files" ? "active" : ""}
              aria-pressed={imageMode === "files"}
              onClick={() => setImageMode("files")}
            >
              Plusieurs images
            </button>
          </div>
          {imageMode === "sheet" ? (
            <div className="lp-sheet-layout">
              <div className="lp-sheet-controls">
                <ImagePicker
                  label="Planche à découper"
                  value={atlas ? [atlas] : []}
                  assets={assets}
                  change={(refs) => setAtlas(refs[0] ?? "")}
                  buttonLabel="Choisir ou importer une planche"
                />
                {existingSheet && (
                  <p
                    className="lp-sheet-current"
                    aria-label="Planche utilisée par l’animation"
                  >
                    Planche utilisée :{" "}
                    <strong>{existingSheet.split("/").at(-1)}</strong>
                  </p>
                )}
                {atlas && existingSheet && atlas !== existingSheet && (
                  <div className="lp-sheet-replacement">
                    <button
                      disabled={!replacement}
                      onClick={() => {
                        if (replacement) {
                          patch({ frames: replacement }, "sheet");
                          setSheetFormat({
                            atlas,
                            grid: sheetGrid(replacement),
                            manual: null,
                            status: "saved",
                          });
                        }
                      }}
                    >
                      Remplacer la planche
                    </button>
                    <p>
                      {replacement
                        ? "Les poses, durées, ancrages et repères actuels seront conservés."
                        : "Cette image ne contient pas toutes les découpes actuelles. Choisis une planche de dimensions compatibles."}
                    </p>
                  </div>
                )}
                {atlas && (
                  <div className="lp-sheet-format" role="status">
                    <span>
                      {activeFormat.status === "loading"
                        ? "Analyse du format de la planche…"
                        : activeFormat.status === "uncertain"
                          ? "Format non détecté : indique les colonnes et les lignes."
                          : `${activeFormat.status === "saved" ? "Format retrouvé" : "Format détecté"} : ${activeFormat.grid!.columns} colonne${activeFormat.grid!.columns > 1 ? "s" : ""} × ${activeFormat.grid!.rows} ligne${activeFormat.grid!.rows > 1 ? "s" : ""}`}
                    </span>
                    {activeFormat.grid &&
                      (activeFormat.manual ? (
                        <button
                          onClick={() =>
                            setSheetFormat((current) => ({
                              ...current,
                              manual: null,
                            }))
                          }
                        >
                          Utiliser le format détecté
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setSheetFormat((current) => ({
                              ...current,
                              manual: { ...current.grid! },
                            }))
                          }
                        >
                          Corriger manuellement
                        </button>
                      ))}
                  </div>
                )}
                {activeFormat.manual && (
                  <div className="gd-form-grid">
                    <Num
                      label="Colonnes"
                      value={columns}
                      min={1}
                      max={64}
                      integer
                      change={(value) =>
                        setSheetFormat((current) => ({
                          ...current,
                          manual: { ...current.manual!, columns: value },
                        }))
                      }
                    />
                    <Num
                      label="Lignes"
                      value={rows}
                      min={1}
                      max={64}
                      integer
                      change={(value) =>
                        setSheetFormat((current) => ({
                          ...current,
                          manual: { ...current.manual!, rows: value },
                        }))
                      }
                    />
                  </div>
                )}
                {atlasSize && grid && (
                  <p>
                    {atlasSize.width} × {atlasSize.height} pixels ·{" "}
                    {columns * rows} frame{columns * rows > 1 ? "s" : ""}
                  </p>
                )}
                <button
                  disabled={
                    !atlasSize ||
                    !grid ||
                    columns * rows > 512 ||
                    columns > atlasSize.width ||
                    rows > atlasSize.height ||
                    a.frames.length + columns * rows > 512
                  }
                  onClick={() => {
                    const frames = sheetFrames();
                    patch({ frames: [...a.frames, ...frames] }, "sheet");
                    setFrameIndex(a.frames.length);
                  }}
                >
                  Ajouter les {columns * rows} frames
                </button>
              </div>
              {regions.length > 0 && (
                <div
                  className="lp-sheet-preview"
                  aria-label="Aperçu des découpes"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(columns, 4)},minmax(0,1fr))`,
                  }}
                >
                  {regions.slice(0, 16).map((frame, i) => (
                    <div key={i}>
                      <ImagePreview asset={atlasAsset} region={frame.region} />
                      <small>{i + 1}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ImagePicker
              label="Images séparées dans l’ordre"
              value={[]}
              assets={assets}
              multiple
              change={addImages}
              buttonLabel="Sélectionner ou importer plusieurs images"
            />
          )}
          <div className="lp-image-tools">
            <Num
              label="Vitesse globale (images/s)"
              value={fps}
              min={1}
              max={100}
              change={setFps}
            />
            <button
              disabled={!a.frames.length}
              onClick={() =>
                patch({
                  frames: a.frames.map((f) => ({ ...f, duration: 1 / fps })),
                })
              }
            >
              Appliquer la vitesse
            </button>
          </div>
          {a.frames.length ? (
            <div className="lp-frame-strip" aria-label="Images de l’animation">
              {a.frames.map((f, i) => (
                <button
                  key={i}
                  className={i === frameIndex ? "selected" : ""}
                  onClick={() => setFrameIndex(i)}
                >
                  <span>
                    <ImagePreview
                      asset={assets.find((asset) => asset.ref === f.asset)}
                      region={f.region}
                    />
                  </span>
                  <b>{i + 1}</b>
                  <small>{Math.round(f.duration * 1000)} ms</small>
                </button>
              ))}
            </div>
          ) : (
            <div className="lp-inline-empty">
              Ajoute une première image pour construire la séquence.
            </div>
          )}
          {selected && (
            <div className="lp-frame-editor">
              <div className="lp-frame-editor-heading">
                <div>
                  <span className="gd-kicker">
                    IMAGE {frameIndex + 1} SUR {a.frames.length}
                  </span>
                  <strong>Réglage de la pose sélectionnée</strong>
                </div>
                <div className="gd-inline">
                  <button
                    aria-label="Déplacer l’image vers la gauche"
                    disabled={frameIndex === 0}
                    onClick={() => move(-1)}
                  >
                    ←
                  </button>
                  <button
                    aria-label="Déplacer l’image vers la droite"
                    disabled={frameIndex >= a.frames.length - 1}
                    onClick={() => move(1)}
                  >
                    →
                  </button>
                  <button
                    aria-label="Dupliquer cette frame"
                    disabled={a.frames.length >= 512}
                    onClick={() => {
                      const next = structuredClone(a.frames);
                      next.splice(frameIndex + 1, 0, structuredClone(selected));
                      patch({ frames: next });
                      setFrameIndex(frameIndex + 1);
                    }}
                  >
                    Dupliquer
                  </button>
                  <button
                    aria-label="Inverser l’ordre des frames"
                    disabled={a.frames.length < 2}
                    onClick={() => {
                      patch({ frames: [...a.frames].reverse() });
                      setFrameIndex(a.frames.length - 1 - frameIndex);
                    }}
                  >
                    Inverser
                  </button>
                  <button
                    onClick={() => {
                      patch({
                        frames: a.frames.filter((_, i) => i !== frameIndex),
                      });
                      setFrameIndex(Math.max(0, frameIndex - 1));
                    }}
                  >
                    Retirer
                  </button>
                </div>
              </div>
              <div className="gd-form-grid">
                <ImagePicker
                  label="Image de cette frame"
                  value={[selected.asset]}
                  assets={assets}
                  region={selected.region}
                  change={(refs) => {
                    if (refs[0])
                      updateFrame({ asset: refs[0], region: undefined });
                  }}
                />
                <Num
                  label="Temps d’affichage (s)"
                  value={selected.duration}
                  min={0.01}
                  max={60}
                  change={(duration) => updateFrame({ duration })}
                />
              </div>
              {advanced && (
                <details className="lp-advanced-panel" open>
                  <summary>Découpe et point d’ancrage de cette image</summary>
                  <label className="lp-check">
                    <input
                      type="checkbox"
                      checked={!!selected.region}
                      onChange={(e) =>
                        updateFrame({
                          region: e.target.checked
                            ? { x: 0, y: 0, width: 64, height: 64 }
                            : undefined,
                        })
                      }
                    />
                    <span>
                      <b>Découper une zone de la planche</b>
                      <small>L’image originale n’est jamais modifiée.</small>
                    </span>
                  </label>
                  {selected.region && (
                    <div className="gd-form-grid">
                      {(["x", "y", "width", "height"] as const).map((k) => (
                        <Num
                          key={k}
                          label={
                            {
                              x: "Décalage horizontal",
                              y: "Décalage vertical",
                              width: "Largeur",
                              height: "Hauteur",
                            }[k]
                          }
                          value={selected.region![k]}
                          min={k === "width" || k === "height" ? 1 : 0}
                          max={32768}
                          integer
                          change={(v) =>
                            updateFrame({
                              region: { ...selected.region, [k]: v },
                            })
                          }
                        />
                      ))}
                    </div>
                  )}
                  <label className="lp-check">
                    <input
                      type="checkbox"
                      checked={!!selected.anchor}
                      onChange={(e) =>
                        updateFrame({
                          anchor: e.target.checked
                            ? { ...a.anchor }
                            : undefined,
                        })
                      }
                    />
                    <span>
                      <b>Position des pieds propre à cette image</b>
                      <small>
                        Utile seulement si le personnage saute entre les poses.
                      </small>
                    </span>
                  </label>
                  {selected.anchor && (
                    <div className="gd-form-grid">
                      <Num
                        label="Pieds — horizontal"
                        value={selected.anchor.x}
                        min={-2}
                        max={3}
                        change={(x) =>
                          updateFrame({ anchor: { ...selected.anchor!, x } })
                        }
                      />
                      <Num
                        label="Pieds — vertical"
                        value={selected.anchor.y}
                        min={-2}
                        max={3}
                        change={(y) =>
                          updateFrame({ anchor: { ...selected.anchor!, y } })
                        }
                      />
                    </div>
                  )}
                </details>
              )}
            </div>
          )}
        </section>
      )}

      <section className="lp-step-card lp-sync-step">
        <div className="lp-step-heading">
          <b>3</b>
          <div>
            <h2>Synchronisation</h2>
            <p>
              Place le départ de l’attaque (tir ou coup direct), puis les sons
              et effets. Un projectile touche sa cible plus tard, selon son
              trajet.
            </p>
          </div>
        </div>
        <div className="lp-quick-markers">
          <button
            disabled={
              a.markers.some((m) => m.type === "release") ||
              a.markers.length >= 64
            }
            onClick={() => addMarker("release")}
          >
            + Départ de l’attaque
          </button>
          <button
            disabled={a.markers.length >= 64}
            onClick={() => addMarker("sound")}
          >
            + Son
          </button>
          <button
            disabled={a.markers.length >= 64}
            onClick={() => addMarker("vfx")}
          >
            + Effet visuel
          </button>
        </div>
        {a.markers.length ? (
          <div className="lp-marker-list">
            {a.markers.map((m, i) => (
              <article className={"lp-marker-card " + m.type} key={m.id}>
                <header>
                  <span>
                    {m.type === "release"
                      ? "●"
                      : m.type === "sound"
                        ? "♪"
                        : "✦"}
                  </span>
                  <div>
                    <b>{MARKER_LABELS[m.type]}</b>
                    <small>
                      à {m.at.toFixed(2)} seconde{m.at >= 2 ? "s" : ""}
                    </small>
                  </div>
                  <button
                    aria-label={"Retirer " + MARKER_LABELS[m.type]}
                    onClick={() =>
                      patch({ markers: a.markers.filter((_, j) => j !== i) })
                    }
                  >
                    ×
                  </button>
                </header>
                <input
                  aria-label={"Moment de " + MARKER_LABELS[m.type]}
                  type="range"
                  min={0}
                  max={total}
                  step={0.001}
                  value={Math.min(m.at, total)}
                  onChange={(e) =>
                    patch(
                      {
                        markers: a.markers.map((x, j) =>
                          j === i ? { ...x, at: +e.target.value } : x,
                        ),
                      },
                      m.id,
                    )
                  }
                />
                <div className="gd-form-grid">
                  <Num
                    label="Moment précis (s)"
                    value={m.at}
                    min={0}
                    max={total}
                    change={(at) =>
                      patch({
                        markers: a.markers.map((x, j) =>
                          j === i ? { ...x, at } : x,
                        ),
                      })
                    }
                  />
                  {m.type !== "release" && (
                    <Choose
                      label={
                        m.type === "sound" ? "Son à jouer" : "Effet à afficher"
                      }
                      value={m.ref}
                      options={
                        m.type === "sound"
                          ? project.presentation!.audio
                          : project.presentation!.vfx
                      }
                      empty
                      change={(ref) =>
                        patch({
                          markers: a.markers.map((x, j) =>
                            j === i ? { ...x, ref } : x,
                          ),
                        })
                      }
                    />
                  )}
                </div>
                {advanced && (
                  <Choose
                    label="Position sur le personnage"
                    value={m.attach}
                    options={Object.entries(ATTACH_LABELS).map(
                      ([id, name]) => ({ id, name }),
                    )}
                    change={(attach) =>
                      patch({
                        markers: a.markers.map((x, j) =>
                          j === i ? { ...x, attach } : x,
                        ),
                      })
                    }
                  />
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="lp-inline-empty">
            Aucun repère. Pour une attaque, place le repère de départ si la
            capacité utilise ce mode.
          </div>
        )}
      </section>

      {advanced && (
        <details className="lp-advanced-panel lp-global-advanced" open>
          <summary>Position, taille et points d’attache avancés</summary>
          <div className="gd-form-grid">
            <Num
              label="Ancrage horizontal"
              value={a.anchor.x}
              min={-2}
              max={3}
              change={(x) => patch({ anchor: { ...a.anchor, x } })}
            />
            <Num
              label="Ancrage vertical"
              value={a.anchor.y}
              min={-2}
              max={3}
              change={(y) => patch({ anchor: { ...a.anchor, y } })}
            />
            {(
              ["x", "y", "rotation", "scaleX", "scaleY", "opacity"] as const
            ).map((k) => (
              <Num
                key={k}
                label={
                  {
                    x: "Décalage horizontal",
                    y: "Décalage vertical",
                    rotation: "Rotation",
                    scaleX: "Échelle horizontale",
                    scaleY: "Échelle verticale",
                    opacity: "Opacité",
                  }[k]
                }
                value={a.transform[k]}
                min={
                  k === "opacity"
                    ? 0
                    : k.startsWith("scale")
                      ? 0.01
                      : k === "rotation"
                        ? -720
                        : -200
                }
                max={
                  k === "opacity"
                    ? 1
                    : k.startsWith("scale")
                      ? 5
                      : k === "rotation"
                        ? 720
                        : 200
                }
                change={(v) => patch({ transform: { ...a.transform, [k]: v } })}
              />
            ))}
          </div>
          <h3>Points d’attache</h3>
          {a.attachments.map((point, i) => (
            <div className="lp-attachment-row" key={point.id}>
              <b>
                {ATTACH_LABELS[point.id as keyof typeof ATTACH_LABELS] ??
                  point.id}
              </b>
              <Num
                label="Horizontal"
                value={point.x}
                min={-2}
                max={3}
                change={(x) =>
                  patch({
                    attachments: a.attachments.map((q, j) =>
                      j === i ? { ...q, x } : q,
                    ),
                  })
                }
              />
              <Num
                label="Vertical"
                value={point.y}
                min={-2}
                max={3}
                change={(y) =>
                  patch({
                    attachments: a.attachments.map((q, j) =>
                      j === i ? { ...q, y } : q,
                    ),
                  })
                }
              />
            </div>
          ))}
        </details>
      )}
    </>
  );
}
