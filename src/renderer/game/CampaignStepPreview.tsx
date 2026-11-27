import React, { useEffect, useRef, useState } from "react";
import type { GameProject, LevelDefinition } from "../../shared/game/types.js";
import type { Asset, Cinematic, Shot } from "../../shared/model.js";
import { Icon } from "../components/Icon.js";
import { Scene } from "../components/Scene.js";

const ignoreEdit = () => undefined;

export function CampaignShotFrame({ shot, assets, project }: { shot: Shot; assets: Asset[]; project: GameProject }) {
  return (
    <Scene
      disabled
      exporting
      shot={shot}
      assets={assets}
      presentationProject={project}
      selection={{ kind: "shot" }}
      onSelect={ignoreEdit}
      onUpdate={ignoreEdit}
      playing={false}
      elapsed={0}
      activeBubble={0}
      onAdvance={ignoreEdit}
      onDropAsset={ignoreEdit}
      guides={false}
    />
  );
}

export function CampaignFilmPreview({ film, assets, project }: {
  film: Cinematic;
  assets: Asset[];
  project: GameProject;
}) {
  const strip = useRef<HTMLOListElement>(null);
  const [visible, setVisible] = useState<ReadonlySet<string>>(() => new Set());
  const shots = film.shots;

  useEffect(() => {
    const list = strip.current;
    if (!list) return;

    // The viewport also clips against the campaign list and the film strip.
    // Keep the original-size assets for atlas and camera geometry.
    const observer = new IntersectionObserver((entries) => {
      setVisible((current) => {
        const next = new Set(current);
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-preview-shot");
          if (!id) continue;
          if (entry.isIntersecting) next.add(id);
          else next.delete(id);
        }
        return next;
      });
    });
    for (const tile of list.children) observer.observe(tile);
    return () => observer.disconnect();
  }, [shots]);

  return (
    <div className="gd-step-preview gd-film-preview" role="group" aria-label={`Plans de la cinématique « ${film.title} »`}>
      <span className="gd-preview-label">{shots.length} plan{shots.length > 1 ? "s" : ""}</span>
      <ol className="gd-film-frames" ref={strip} tabIndex={shots.length > 1 ? 0 : undefined}
        aria-label="Plans dans l’ordre de lecture">
        {shots.map((shot, index) => (
          <li key={shot.id} data-preview-shot={shot.id} title={shot.name}>
            <div className="gd-film-frame" aria-hidden="true">
              {visible.has(shot.id) ? (
                <CampaignShotFrame shot={shot} assets={assets} project={project} />
              ) : <Icon name="image" size={19} />}
            </div>
            <span className="gd-preview-caption">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{shot.name}</strong>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function CampaignLevelPreview({ level, asset }: {
  level: LevelDefinition;
  asset?: Asset;
}) {
  return (
    <figure className="gd-step-preview gd-level-preview">
      <figcaption className="gd-preview-label">Fond du plateau</figcaption>
      <CampaignLevelImage level={level} asset={asset} />
    </figure>
  );
}

export function CampaignLevelImage({ level, asset }: {
  level: LevelDefinition;
  asset?: Asset;
}) {
  const [failedUrl, setFailedUrl] = useState("");
  const src = asset?.thumbnail;
  return src && src !== failedUrl ? (
    <img src={src} alt={`Fond du plateau — ${level.title}`}
      loading="lazy" decoding="async" draggable={false} onError={() => setFailedUrl(src)} />
  ) : (
    <span className="gd-preview-empty">
      <Icon name="image" size={16} />
      {level.terrainImage ? "Image du plateau indisponible" : "Aucun fond configuré"}
    </span>
  );
}
