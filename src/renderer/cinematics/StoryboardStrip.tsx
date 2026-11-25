import React, { useMemo } from "react";
import { musicRange } from "../../shared/cinematicAudio.js";
import type { Asset, Cinematic, Shot } from "../../shared/model.js";
import type { ShotTemplate } from "../../shared/studio.js";
import { Icon } from "../components/Icon.js";

interface StoryboardStripProps {
  doc: Cinematic;
  shot: Shot;
  selectedShot: Shot;
  selectedShotIndex: number;
  selectedShotNumber: string;
  totalSeconds: number;
  assets: Asset[];
  playing: boolean;
  locked: boolean;
  onSelectShot: (id: string) => void;
  onMoveShotToIndex: (sourceId: string, index: number) => void;
  onReorderShot: (sourceId: string, targetId: string) => void;
  onContinueShot: (template: ShotTemplate) => void;
  onPlayFromCurrent: () => void;
  onAddShot: () => void;
}

export function StoryboardStrip({
  doc,
  shot,
  selectedShot,
  selectedShotIndex,
  selectedShotNumber,
  totalSeconds,
  assets,
  playing,
  locked,
  onSelectShot,
  onMoveShotToIndex,
  onReorderShot,
  onContinueShot,
  onPlayFromCurrent,
  onAddShot,
}: StoryboardStripProps) {
  const assetByRef = useMemo(
    () => new Map(assets.map((item) => [item.ref, item])),
    [assets],
  );
  const disabled = playing || locked;

  return (
    <section className="storyboard">
      <div className="storyboard-heading">
        <div>
          <Icon name="layers" size={15} />
          <strong>LES PLANS</strong>
          <span>
            {doc.shots.length} plan{doc.shots.length > 1 ? "s" : ""} ·{" "}
            {totalSeconds.toFixed(0)} s minimum
          </span>
        </div>
        <div
          className="shot-order-controls"
          role="group"
          aria-label="Ordre des plans"
        >
          <span>Déplacer le plan {selectedShotNumber}</span>
          <button
            type="button"
            aria-label="Déplacer le plan vers la gauche"
            title="Reculer d’une position"
            disabled={disabled || selectedShotIndex === 0}
            onClick={() =>
              onMoveShotToIndex(selectedShot.id, selectedShotIndex - 1)
            }
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Déplacer le plan vers la droite"
            title="Avancer d’une position"
            disabled={disabled || selectedShotIndex === doc.shots.length - 1}
            onClick={() =>
              onMoveShotToIndex(selectedShot.id, selectedShotIndex + 1)
            }
          >
            →
          </button>
          <label>
            Position{" "}
            <select
              aria-label="Position du plan sélectionné"
              value={selectedShotIndex + 1}
              disabled={disabled || doc.shots.length < 2}
              onChange={(e) =>
                onMoveShotToIndex(selectedShot.id, Number(e.target.value) - 1)
              }
            >
              {doc.shots.map((_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1} / {doc.shots.length}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="link-button continue-shot"
          disabled={disabled}
          onClick={() => onContinueShot("continue")}
        >
          Continuer ce plan <Icon name="chevron" size={13} />
        </button>
        <button
          className="link-button"
          data-testid="storyboard-play-current"
          disabled={disabled}
          title={`Lire à partir du plan ${selectedShotNumber}, puis les suivants (Maj+Espace)`}
          onClick={onPlayFromCurrent}
        >
          <Icon name="play" size={13} /> Lire depuis ce plan
        </button>
      </div>
      <div className="storyboard-content">
        <div
          className="shot-strip"
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes("application/x-lunaria-shot"))
              e.preventDefault();
          }}
          onDrop={(e) => {
            if (e.target !== e.currentTarget) return;
            const id = e.dataTransfer.getData("application/x-lunaria-shot");
            if (id) onReorderShot(id, doc.shots.at(-1)!.id);
          }}
        >
          {doc.shots.map((s, index) => {
            const backgroundAsset = s.background.asset
              ? assetByRef.get(s.background.asset)
              : undefined;
            const hasAudio =
              !!s.audio ||
              !!s.sounds?.length ||
              !!doc.musicTracks?.some((t) => {
                const [a, b] = musicRange(doc, t.startShotId, t.endShotId);
                return index >= a && index <= b;
              });
            return (
              <button
                key={s.id}
                className={`shot-card ${shot.id === s.id ? "active" : ""}`}
                draggable={!disabled}
                disabled={disabled}
                data-testid={`shot-card-${index}`}
                data-shot-id={s.id}
                onClick={() => onSelectShot(s.id)}
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/x-lunaria-shot", s.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (
                    e.dataTransfer.types.includes("application/x-lunaria-shot")
                  )
                    e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  onReorderShot(
                    e.dataTransfer.getData("application/x-lunaria-shot"),
                    s.id,
                  );
                }}
              >
                <div className="shot-thumbnail">
                  {backgroundAsset ? (
                    <img
                      src={backgroundAsset.thumbnail}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <Icon name="image" size={27} />
                  )}
                  <span className="shot-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="shot-duration">{s.duration} s</span>
                  {hasAudio && (
                    <span
                      className="shot-audio-badge"
                      title="Ce plan contient du son"
                    >
                      ♪
                    </span>
                  )}
                  {!!s.bubbles.length && (
                    <span className="shot-bubbles">
                      <Icon name="bubble" size={12} />
                      {s.bubbles.length}
                    </span>
                  )}
                </div>
                <span className="shot-name" title={s.name}>
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
        <button className="add-shot" disabled={disabled} onClick={onAddShot}>
          <span>
            <Icon name="plus" size={24} />
          </span>
          Ajouter un plan
        </button>
      </div>
    </section>
  );
}
