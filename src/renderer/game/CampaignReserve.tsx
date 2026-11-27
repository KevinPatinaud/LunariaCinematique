import React, { useEffect, useId, useRef, useState } from "react";
import type { GameProject, LevelDefinition } from "../../shared/game/types.js";
import type { Asset, Cinematic } from "../../shared/model.js";
import { isContentArchived } from "../../shared/game/contentArchives.js";
import { ArchiveStamp } from "../components/ContentArchive.js";
import { Icon } from "../components/Icon.js";
import { CampaignLevelImage, CampaignShotFrame } from "./CampaignStepPreview.js";

export type ReserveItem = { kind: "cinematic" | "level"; id: string };

const FRAME_DELAY_MS = 2400;

function ReserveFilmFrame({ film, assets, project, active, playing }: {
  film: Cinematic;
  assets: Asset[];
  project: GameProject;
  active: boolean;
  playing: boolean;
}) {
  const frame = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const count = film.shots.length;
  const shot = film.shots[index] ?? film.shots[0];

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active || !visible || !playing || count < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), FRAME_DELAY_MS);
    return () => window.clearInterval(timer);
  }, [active, count, playing, visible]);

  return (
    <span className="gd-reserve-frame gd-film-frame" ref={frame} data-preview-shot={shot?.id} aria-hidden="true">
      {active && visible && shot
        ? <CampaignShotFrame shot={shot} assets={assets} project={project} />
        : <Icon name="image" size={22} />}
    </span>
  );
}

interface Props {
  active: boolean;
  films: Cinematic[];
  levels: LevelDefinition[];
  assets: Asset[];
  assetByRef: ReadonlyMap<string, Asset>;
  project: GameProject;
  choice: ReserveItem | null;
  full: boolean;
  onChoose: (item: ReserveItem | null, keyboard?: boolean) => void;
  onDragStart: (event: React.DragEvent, item: ReserveItem) => void;
  onDragEnd: () => void;
}

export function CampaignReserve({
  active, films, levels, assets, assetByRef, project, choice, full, onChoose, onDragStart, onDragEnd,
}: Props) {
  const id = useId();
  const [tab, setTab] = useState<ReserveItem["kind"]>("cinematic");
  const [playing, setPlaying] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pauseOnReducedMotion = (event: MediaQueryListEvent) => {
      if (event.matches) setPlaying(false);
    };
    reducedMotion.addEventListener("change", pauseOnReducedMotion);
    return () => reducedMotion.removeEventListener("change", pauseOnReducedMotion);
  }, []);

  function selectTab(next: ReserveItem["kind"]) {
    if (next === tab) return;
    setTab(next);
    onChoose(null);
    if (scroller.current) scroller.current.scrollTop = 0;
  }

  const entries = tab === "cinematic" ? films : levels;
  const selectedTitle = choice?.kind === tab ? entries.find((entry) => entry.id === choice.id)?.title : undefined;

  function renderTile(item: ReserveItem, title: string, frame: React.ReactNode) {
    const archived = isContentArchived(project, item.kind === "level" ? "levels" : "cinematics", item.id);
    return (
      <li key={item.id}>
        <button
          type="button"
          className="gd-reserve-tile"
          aria-label={`Sélectionner « ${title} » pour l’insérer${archived ? " · Archivé" : ""}`}
          data-archived={archived ? "" : undefined}
          aria-pressed={choice?.kind === item.kind && choice.id === item.id}
          disabled={full}
          draggable={!full}
          onClick={(event) => onChoose(item, event.detail === 0)}
          onDragStart={(event) => onDragStart(event, item)}
          onDragEnd={onDragEnd}
        >
          {archived ? (
            <span className="gd-reserve-archive-frame">
              {frame}
              <ArchiveStamp />
            </span>
          ) : frame}
          <span className="gd-reserve-tile-title">{title}</span>
        </button>
      </li>
    );
  }

  return (
    <aside className="gd-campaign-reserve" aria-labelledby={`${id}-heading`}>
      <div className="gd-campaign-panel-heading">
        <h2 id={`${id}-heading`}>À placer</h2>
        {tab === "cinematic" && films.some((film) => film.shots.length > 1) && (
          <button type="button" className="gd-reserve-play"
            aria-label={playing ? "Mettre en pause les aperçus" : "Lancer les aperçus"}
            title={playing ? "Mettre en pause les aperçus" : "Lancer les aperçus"}
            onClick={() => setPlaying((current) => !current)}>
            <Icon name={playing ? "pause" : "play"} size={15} />
          </button>
        )}
      </div>
      <div
        className="gd-reserve-tabs"
        role="tablist"
        aria-label="Contenus à placer"
        onKeyDown={(event) => {
          let next: ReserveItem["kind"];
          if (event.key === "Home") next = "cinematic";
          else if (event.key === "End") next = "level";
          else if (event.key === "ArrowLeft" || event.key === "ArrowRight") next = tab === "cinematic" ? "level" : "cinematic";
          else return;
          event.preventDefault();
          selectTab(next);
          event.currentTarget.querySelectorAll("button")[next === "cinematic" ? 0 : 1]?.focus();
        }}
      >
        <button type="button" role="tab" id={`${id}-cinematic-tab`} aria-controls={`${id}-panel`}
          aria-selected={tab === "cinematic"} tabIndex={tab === "cinematic" ? 0 : -1}
          onClick={() => selectTab("cinematic")}>
          Cinématiques
        </button>
        <button type="button" role="tab" id={`${id}-level-tab`} aria-controls={`${id}-panel`}
          aria-selected={tab === "level"} tabIndex={tab === "level" ? 0 : -1}
          onClick={() => selectTab("level")}>
          Niveaux
        </button>
      </div>
      <div className="gd-reserve-scroll" ref={scroller} id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}-tab`}>
        {entries.length ? (
          <>
            <p className="gd-reserve-hint" role="status">
              {full ? "Le parcours contient déjà 1 000 étapes."
                : selectedTitle ? `Choisis un « + » pour placer « ${selectedTitle} ».`
                : "Glisse une vignette vers le parcours ou sélectionne-la, puis choisis un « + »."}
            </p>
            <ul className="gd-reserve-tiles">
              {tab === "cinematic"
                ? films.map((film) => renderTile({ kind: "cinematic", id: film.id }, film.title,
                  <ReserveFilmFrame film={film} assets={assets} project={project} active={active} playing={playing} />))
                : levels.map((level) => renderTile({ kind: "level", id: level.id }, level.title,
                  <span className="gd-reserve-frame gd-reserve-terrain" aria-hidden="true">
                    <CampaignLevelImage level={level} asset={level.terrainImage ? assetByRef.get(level.terrainImage) : undefined} />
                  </span>))}
            </ul>
          </>
        ) : (
          <p className="gd-reserve-empty" role="status">
            {tab === "cinematic" ? "Aucune cinématique à placer." : "Aucun niveau à placer."}
          </p>
        )}
      </div>
    </aside>
  );
}
