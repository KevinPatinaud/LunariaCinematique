import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  campaignOf,
  ensureCampaign,
  moveCampaignStep,
} from "../../shared/game/campaign.js";
import {
  newId,
  type CampaignFilm,
  type CampaignStep,
  type GameProject,
} from "../../shared/game/types.js";
import type { Asset } from "../../shared/model.js";
import { CampaignFilmPreview, CampaignLevelPreview } from "./CampaignStepPreview.js";
import { CampaignReserve, type ReserveItem } from "./CampaignReserve.js";
import { gameAPI } from "./bridge.js";
import { api } from "../browserBridge.js";
import { placeLevel, stepTitle } from "../../shared/game/levelManagement.js";
import { isContentArchived } from "../../shared/game/contentArchives.js";
import { ArchiveStamp } from "../components/ContentArchive.js";
import { Icon } from "../components/Icon.js";
import "./campaignEditor.css";

const STEP_DRAG_TYPE = "application/x-lunaria-step";
const RESERVE_DRAG_TYPE = "application/x-lunaria-reserve";

const stepAppearance: Record<CampaignStep["kind"], { label: string; icon: string }> = {
  level: { label: "Niveau", icon: "layers" },
  cinematic: { label: "Cinématique", icon: "play" },
  end: { label: "Borne de publication", icon: "stop" },
  unlock_herbarium: { label: "Déblocage", icon: "leaf" },
  unlock_travel_book: { label: "Déblocage", icon: "file" },
};

function hasStepPreview(step: CampaignStep) {
  return step.kind === "level" || step.kind === "cinematic";
}

function formatCount(count: number, singular: string, plural = singular + "s") {
  return `${count} ${count > 1 ? plural : singular}`;
}

interface Props {
  active: boolean;
  assets: Asset[];
  createLevel: (beforeId: string | null) => void;
  selectedStepId: string;
  onSelectStep: (id: string) => void;
  showUnplaced: () => void;
  backup: () => void;
  busy: boolean;
  path: string;
  project: GameProject;
  change: (
    edit: (p: GameProject) => void,
    key?: string,
    label?: string,
  ) => void;
  run: (fn: () => Promise<void>) => Promise<void>;
  selectLevel: (id: string) => void;
  openFilm: (film: CampaignFilm) => Promise<void>;
  report: (message: string) => void;
}
export function CampaignEditor({
  active,
  assets,
  project,
  change,
  run,
  selectLevel,
  openFilm,
  report,
  createLevel,
  backup,
  busy,
  path,
  selectedStepId,
  onSelectStep: setSelected,
  showUnplaced,
}: Props) {
  const [expandedPreviews, setExpandedPreviews] = useState<ReadonlySet<string>>(() => new Set());
  const assetByRef = useMemo(() => new Map(assets.map((asset) => [asset.ref, asset])), [assets]);
  const campaign = campaignOf(project),
    selected = selectedStepId,
    [insertBefore, setInsertBefore] = useState<string | null | undefined>(
      undefined,
    ),
    [levelChoice, setLevelChoice] = useState(""),
    [filmChoice, setFilmChoice] = useState("");
  const endIndex = campaign.steps.findIndex((s) => s.kind === "end"),
    endStep = endIndex < 0 ? undefined : campaign.steps[endIndex],
    pendingCount = endIndex < 0 ? 0 : campaign.steps.length - endIndex - 1;
  const unlockIndex = campaign.steps.findIndex(
      (s) => s.kind === "unlock_travel_book",
    ),
    unlockStep = unlockIndex < 0 ? undefined : campaign.steps[unlockIndex],
    unlockAfterEnd = endIndex >= 0 && unlockIndex > endIndex;
  const herbariumUnlockIndex = campaign.steps.findIndex(
      (s) => s.kind === "unlock_herbarium",
    ),
    herbariumUnlockStep =
      herbariumUnlockIndex < 0
        ? undefined
        : campaign.steps[herbariumUnlockIndex],
    herbariumUnlockAfterEnd = endIndex >= 0 && herbariumUnlockIndex > endIndex;
  const selectedCard = useRef<HTMLButtonElement>(null);
  const sequence = useRef<HTMLOListElement>(null);
  const reserveDrag = useRef<ReserveItem | null>(null);
  const focusSelected = useRef(false);
  const previewToReveal = useRef<HTMLElement | null>(null);
  const insertionId = useId();
  const [reserveChoice, setReserveChoice] = useState<ReserveItem | null>(null);
  const [reserveDragging, setReserveDragging] = useState(false);
  const [dropTarget, setDropTarget] = useState("");
  const selectedIndex = campaign.steps.findIndex((s) => s.id === selected);
  const placedLevelIds = new Set(campaign.steps.flatMap((step) => step.kind === "level" ? [step.levelId] : []));
  const placedFilmIds = new Set(campaign.steps.flatMap((step) => step.kind === "cinematic" ? [step.cinematicId] : []));
  const placedDocumentIds = new Set(campaign.cinematics
    .filter((film) => placedFilmIds.has(film.id))
    .map((film) => film.documentId));
  const available = project.levels.filter((level) => !placedLevelIds.has(level.id));
  const availableFilms = (project.cinematics ?? []).filter((film) => !placedDocumentIds.has(film.id));
  const archivedFilmIds = new Set(campaign.cinematics
    .filter((film) => isContentArchived(project, "cinematics", film.documentId))
    .map((film) => film.id));
  const archivedStepIds = new Set(campaign.steps.filter((step) =>
    (step.kind === "level" && isContentArchived(project, "levels", step.levelId)) ||
    (step.kind === "cinematic" && archivedFilmIds.has(step.cinematicId)),
  ).map((step) => step.id));
  const full = campaign.steps.length >= 1000;

  function isAvailable(item: ReserveItem) {
    return item.kind === "level"
      ? available.some((level) => level.id === item.id)
      : availableFilms.some((film) => film.id === item.id);
  }

  const chosen = reserveChoice && isAvailable(reserveChoice) ? reserveChoice : null;
  useEffect(() => {
    if (!campaign.steps.some((s) => s.id === selected))
      setSelected(campaign.steps[0]?.id ?? "");
  }, [campaign.steps, selected]);
  useEffect(() => {
    if (
      insertBefore !== undefined &&
      insertBefore !== null &&
      !campaign.steps.some((s) => s.id === insertBefore)
    )
      setInsertBefore(undefined);
  }, [campaign.steps, insertBefore]);
  useLayoutEffect(() => {
    const card = selectedCard.current;
    if (!active || !card) return;

    const shouldFocus = focusSelected.current;
    focusSelected.current = false;
    if (shouldFocus) card.focus({ preventScroll: true });
    card.parentElement?.scrollIntoView({ block: shouldFocus ? "center" : "nearest", inline: "nearest" });
  }, [active, selected, selectedIndex]);

  useLayoutEffect(() => {
    previewToReveal.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
    previewToReveal.current = null;
  }, [expandedPreviews]);

  function jumpToStep(id: string) {
    if (id === selected) {
      selectedCard.current?.focus({ preventScroll: true });
      selectedCard.current?.parentElement?.scrollIntoView({ block: "center", inline: "nearest" });
    } else {
      focusSelected.current = true;
      setSelected(id);
    }
  }

  function insertAt(
    next: CampaignStep,
    beforeId: string | null,
    reference?: CampaignFilm,
  ) {
    let nextId = next.id;
    change(
      (p) => {
        if (next.kind === "level") {
          nextId = placeLevel(p, next.levelId, { kind: "campaign", beforeId });
          return;
        }
        const c = ensureCampaign(p);
        if (reference && !c.cinematics.some((f) => f.id === reference.id))
          c.cinematics.push(reference);
        const i =
          beforeId === null
            ? c.steps.length
            : c.steps.findIndex((s) => s.id === beforeId);
        c.steps.splice(i < 0 ? c.steps.length : i, 0, next);
      },
      "",
      "Ajouter une étape",
    );
    focusSelected.current = true;
    setSelected(nextId);
    setInsertBefore(undefined);
  }
  function openInsertion(beforeId: string | null) {
    if (chosen) {
      placeReserveItem(chosen, beforeId);
      return;
    }
    setInsertBefore((current) => (current === beforeId ? undefined : beforeId));
    setLevelChoice(available[0]?.id ?? "");
  }

  function placeLevelAt(levelId: string, beforeId: string | null) {
    insertAt({ id: newId("step"), kind: "level", levelId }, beforeId);
  }

  function placeExistingFilm(beforeId: string | null, documentId = filmChoice || project.cinematics?.[0]?.id) {
    const doc = project.cinematics?.find((item) => item.id === documentId);
    if (!doc) return;
    const existing = campaign.cinematics.find(
      (item) => item.documentId === doc.id,
    );
    const id = newId("film"),
      ref = existing ?? {
        id,
        title: doc.title,
        file: id + ".cinematic.json",
        documentId: doc.id,
      };
    insertAt(
      {
        id: newId("step"),
        kind: "cinematic",
        cinematicId: ref.id,
        skippable: true,
      },
      beforeId,
      ref,
    );
  }

  function placeReserveItem(item: ReserveItem, beforeId: string | null) {
    if (busy || full || !isAvailable(item)) return;
    if (beforeId !== null && !campaign.steps.some((step) => step.id === beforeId)) return;
    if (item.kind === "level") placeLevelAt(item.id, beforeId);
    else placeExistingFilm(beforeId, item.id);
    setReserveChoice(null);
  }

  function chooseReserveItem(item: ReserveItem | null, keyboard?: boolean) {
    if (!item || (chosen?.id === item.id && chosen.kind === item.kind)) {
      setReserveChoice(null);
      return;
    }
    setInsertBefore(undefined);
    setReserveChoice(item);
    if (keyboard) {
      const neighbor = selectedCard.current?.closest(".gd-step-item")?.previousElementSibling;
      const slot = neighbor?.querySelector<HTMLButtonElement>(".gd-insert-toggle")
        ?? sequence.current?.querySelector<HTMLButtonElement>(".gd-insert-toggle");
      slot?.focus();
    }
  }

  function startReserveDrag(event: React.DragEvent, item: ReserveItem) {
    if (busy || full || !isAvailable(item)) {
      event.preventDefault();
      return;
    }
    reserveDrag.current = item;
    setReserveDragging(true);
    setReserveChoice(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(RESERVE_DRAG_TYPE, item.id);
  }

  function finishDrag() {
    reserveDrag.current = null;
    setReserveDragging(false);
    setDropTarget("");
  }

  function move(id: string, beforeId: string | null) {
    change(
      (p) => {
        const c = ensureCampaign(p);
        c.steps = moveCampaignStep(c.steps, id, beforeId);
      },
      "",
      "Déplacer une étape",
    );
  }
  function nudge(step: CampaignStep, index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= campaign.steps.length) return;
    move(step.id, campaign.steps[target + Math.max(0, offset)]?.id ?? null);
    setSelected(step.id);
  }
  function placeEnd(beforeId: string | null) {
    if (endStep) {
      move(endStep.id, beforeId);
      jumpToStep(endStep.id);
      setInsertBefore(undefined);
    } else insertAt({ id: newId("step"), kind: "end" }, beforeId);
  }
  function placeTravelBookUnlock(beforeId: string | null) {
    if (unlockStep) {
      move(unlockStep.id, beforeId);
      jumpToStep(unlockStep.id);
      setInsertBefore(undefined);
    } else insertAt({ id: newId("step"), kind: "unlock_travel_book" }, beforeId);
  }
  function placeHerbariumUnlock(beforeId: string | null) {
    if (herbariumUnlockStep) {
      move(herbariumUnlockStep.id, beforeId);
      jumpToStep(herbariumUnlockStep.id);
      setInsertBefore(undefined);
    } else insertAt({ id: newId("step"), kind: "unlock_herbarium" }, beforeId);
  }
  function remove(step: CampaignStep, index: number) {
    void run(async () => {
      if (!(await api.confirmDelete("cette étape du parcours (le contenu reste dans le Studio)")))
        return;
      change(
        (p) => {
          const c = ensureCampaign(p);
          c.steps = c.steps.filter((s) => s.id !== step.id);
        },
        "",
        "Retirer une étape",
      );
      const next = campaign.steps[index + 1] ?? campaign.steps[index - 1];
      if (next) {
        focusSelected.current = true;
        setSelected(next.id);
      }
    });
  }

  const label = (s: CampaignStep) => stepTitle(project, s);

  function editStep(step: CampaignStep) {
    if (step.kind === "level") {
      selectLevel(step.levelId);
    } else if (step.kind === "cinematic") {
      const film = campaign.cinematics.find((item) => item.id === step.cinematicId);
      if (film) void openFilm(film);
    }
  }
  function renderStepPreview(step: CampaignStep) {
    if (step.kind === "level") {
      const level = project.levels.find((item) => item.id === step.levelId);
      if (!level) return null;
      const asset = level.terrainImage ? assetByRef.get(level.terrainImage) : undefined;
      return <CampaignLevelPreview level={level} asset={asset} />;
    }
    if (step.kind === "cinematic") {
      const reference = campaign.cinematics.find((item) => item.id === step.cinematicId);
      const film = project.cinematics?.find((item) => item.id === reference?.documentId);
      return film ? <CampaignFilmPreview film={film} project={project} assets={assets} /> : null;
    }
    return null;
  }

  function renderStepDisclosure(step: CampaignStep, index: number) {
    if (!hasStepPreview(step)) return null;

    const expanded = expandedPreviews.has(step.id);
    const previewId = `${insertionId}-preview-${step.id}`;
    const action = expanded ? "Replier" : "Déplier";

    return (
      <>
        <button
          type="button"
          className="gd-step-preview-toggle"
          aria-expanded={expanded}
          aria-controls={previewId}
          aria-label={`${action} l’aperçu de l’étape ${index + 1}`}
          onClick={(event) => {
            if (!expanded) previewToReveal.current = event.currentTarget.parentElement;
            setExpandedPreviews((current) => {
              const next = new Set(current);
              if (next.has(step.id)) next.delete(step.id);
              else next.add(step.id);
              return next;
            });
          }}
        >
          <Icon name={expanded ? "up" : "down"} size={14} />
          {action}
        </button>
        <div className="gd-step-preview-content" id={previewId} hidden={!expanded}>
          {active && expanded && renderStepPreview(step)}
        </div>
      </>
    );
  }

  const previewIds = campaign.steps.filter(hasStepPreview).map((step) => step.id);
  const allPreviewsExpanded = previewIds.length > 0 && previewIds.every((id) => expandedPreviews.has(id));
  const levelCount = campaign.steps.filter((s) => s.kind === "level").length;
  const filmCount = campaign.steps.filter((s) => s.kind === "cinematic").length;
  const milestones = [
    {
      step: endStep,
      title: "Fin actuelle",
      index: endIndex,
      description: pendingCount
        ? `${formatCount(pendingCount, "étape")} en préparation`
        : "Fin de la version jouable",
    },
    {
      step: herbariumUnlockStep,
      title: "L’herbier",
      index: herbariumUnlockIndex,
      description: herbariumUnlockAfterEnd ? "Hors version jouable" : "Déblocage",
    },
    {
      step: unlockStep,
      title: "Carnet de voyage",
      index: unlockIndex,
      description: unlockAfterEnd ? "Hors version jouable" : "Déblocage",
    },
  ];

  return (
    <section
      className={`gd-campaign${chosen || reserveDragging ? " placing-reserve" : ""}`}
      aria-labelledby="campaign-heading"
      onKeyDown={(event) => {
        if (event.key === "Escape" && chosen) {
          event.preventDefault();
          setReserveChoice(null);
        }
      }}
    >
      <header className="gd-campaign-header">
        <div className="gd-campaign-identity">
          <h1 id="campaign-heading">Campagne</h1>
          <label className="gd-campaign-title-field">
            <Icon name="pencil" size={14} />
            <input
              className="gd-campaign-project-title"
              aria-label="Titre du projet"
              title={path || "Renommer le projet"}
              maxLength={160}
              disabled={busy}
              value={project.title}
              onChange={(e) =>
                change(
                  (p) => {
                    p.title = e.target.value;
                  },
                  "title",
                  "Renommer le projet",
                )
              }
            />
          </label>
        </div>
        <div className="gd-campaign-actions">
          <button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const r = await gameAPI.checkCampaign(project);
                report(
                  `Parcours vérifié. ${r.steps} étapes, ${r.levels} niveaux, ${r.films} cinématiques, ${r.assets} ressources uniques. ${r.warnings.join(" ")}`,
                );
              })
            }
          >
            <Icon name="check" size={16} /> Vérifier le parcours
          </button>
          <button disabled={busy} onClick={backup} title="Copier le projet, ses images et ses sons dans un dossier daté">
            <Icon name="folder" size={16} /> Sauvegarder la campagne…
          </button>
        </div>
      </header>
      {milestones.some(({ step: milestone }) => milestone) && (
        <nav className="gd-campaign-milestones" aria-label="Raccourcis du parcours">
          {milestones.map(({ step: milestone, title, index, description }) => milestone && (
            <button
              key={milestone.id}
              className={`gd-milestone ${milestone.kind}`}
              aria-label={`${title}, étape ${index + 1} · ${description}`}
              aria-current={selected === milestone.id ? "step" : undefined}
              onClick={() => jumpToStep(milestone.id)}
            >
              <span className={`gd-step-symbol ${milestone.kind}`}>
                <Icon name={stepAppearance[milestone.kind].icon} size={16} />
              </span>
              <span className="gd-milestone-copy">
                <strong>{title}</strong>
                <small>Étape {index + 1} · {description}</small>
              </span>
              <span className="gd-milestone-arrow"><Icon name="chevron" size={15} /></span>
            </button>
          ))}
        </nav>
      )}
      <div className="gd-campaign-workspace">
        <section className="gd-sequence-panel" aria-labelledby="campaign-sequence-heading">
          <div className="gd-campaign-panel-heading">
            <div>
              <h2 id="campaign-sequence-heading">Parcours</h2>
              <p>
                {formatCount(campaign.steps.length, "étape")} ·{" "}
                {formatCount(levelCount, "niveau", "niveaux")} ·{" "}
                {formatCount(filmCount, "cinématique")}
              </p>
            </div>
            <div className="gd-campaign-list-actions">
              {available.length > 0 && (
                <button aria-label="Voir les niveaux hors parcours" onClick={showUnplaced}>
                  {available.length} hors parcours <Icon name="chevron" size={14} />
                </button>
              )}
              {previewIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExpandedPreviews(allPreviewsExpanded ? new Set() : new Set(previewIds))}
                >
                  <Icon name={allPreviewsExpanded ? "up" : "down"} size={15} />
                  {allPreviewsExpanded ? "Tout replier" : "Tout déplier"}
                </button>
              )}
            </div>
          </div>
          <div className="gd-sequence-hint">
            <span>Le jeu lit cette liste de haut en bas.</span>
            <span>Utilise les <b>+</b> pour insérer une étape.</span>
          </div>
          {!campaign.steps.length && (
            <div className="gd-campaign-start">
              <p>Ajoute un niveau ou une cinématique pour commencer.</p>
              <button
                className="gd-primary"
                onClick={() => createLevel(null)}
                disabled={busy || project.levels.length >= 200}
              >
                Créer un premier niveau
              </button>
            </div>
          )}
          <ol className="gd-campaign-cards" ref={sequence} aria-label="Ordre de la campagne">
            {[
              ...campaign.steps.map((s, i) => ({
                step: s,
                index: i,
                before: s.id,
              })),
              {
                step: null,
                index: campaign.steps.length,
                before: null as string | null,
              },
            ].map(({ step: s, index: i, before }) => (
              <React.Fragment key={s?.id ?? "campaign-end"}>
                {pendingCount > 0 && i === endIndex + 1 && (
                  <li className="gd-campaign-draft-divider">
                    <span>Suite en préparation</span>
                    <small>{formatCount(pendingCount, "étape")} hors version jouable</small>
                  </li>
                )}
                <li
                  role="presentation"
                  className={`gd-insert-slot${i === 0 || !s ? " edge" : ""}${insertBefore === before ? " open" : ""}${dropTarget === `slot:${before ?? "end"}` ? " drop-target" : ""}`}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" && insertBefore === before) {
                      e.stopPropagation();
                      setInsertBefore(undefined);
                      e.currentTarget.querySelector("button")?.focus();
                    }
                  }}
                  onDragOver={(event) => {
                    const types = event.dataTransfer.types;
                    if (busy || (!types.includes(STEP_DRAG_TYPE) &&
                      (!reserveDrag.current || full || !types.includes(RESERVE_DRAG_TYPE)))) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                    setDropTarget(`slot:${before ?? "end"}`);
                  }}
                  onDragLeave={(event) => {
                    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
                    setDropTarget((current) => current === `slot:${before ?? "end"}` ? "" : current);
                  }}
                  onDrop={(event) => {
                    const item = reserveDrag.current;
                    const id = event.dataTransfer.getData(STEP_DRAG_TYPE);
                    if (item && event.dataTransfer.getData(RESERVE_DRAG_TYPE) === item.id) {
                      event.preventDefault();
                      placeReserveItem(item, before);
                    } else if (id && !busy && campaign.steps.some((step) => step.id === id)) {
                      event.preventDefault();
                      move(id, before);
                      jumpToStep(id);
                    }
                    finishDrag();
                  }}
                >
                  <button
                    className="gd-insert-toggle"
                    aria-expanded={insertBefore === before}
                    aria-controls={insertBefore === before ? insertionId : undefined}
                    aria-label={
                      i === 0
                        ? "Insérer au début de la campagne"
                        : i === campaign.steps.length
                          ? "Insérer après la dernière étape"
                          : `Insérer entre les étapes ${i} et ${i + 1}`
                    }
                    onClick={() => openInsertion(before)}
                  >
                    <Icon name={insertBefore === before ? "close" : "plus"} size={15} />
                    <span>{i === 0 ? "Insérer au début" : !s ? "Ajouter à la fin" : "Insérer ici"}</span>
                  </button>
                  {insertBefore === before && (
                    <div className="gd-insert-menu" id={insertionId}>
                      <h3>
                        {i === 0
                          ? "Insérer au début"
                          : !s
                            ? "Insérer à la fin"
                            : `Insérer entre les étapes ${i} et ${i + 1}`}
                      </h3>
                      <div className="gd-insert-choice cinematic">
                        <span className="gd-step-symbol cinematic"><Icon name="play" size={16} /></span>
                        <div>
                          <strong>Cinématique</strong>
                          <small>
                            {project.cinematics?.length ? "Choisir une cinématique du projet." : "Aucune cinématique dans le projet."}
                          </small>
                        </div>
                        {!!project.cinematics?.length && (
                          <>
                            <select
                              aria-label="Cinématique à placer"
                              value={filmChoice || project.cinematics[0].id}
                              onChange={(e) => setFilmChoice(e.target.value)}
                            >
                              {project.cinematics.map((doc) => (
                                <option key={doc.id} value={doc.id}>
                                  {doc.title}{isContentArchived(project, "cinematics", doc.id) ? " · Archivé" : ""}
                                </option>
                              ))}
                            </select>
                            <button
                              disabled={campaign.steps.length >= 1000}
                              onClick={() => placeExistingFilm(before)}
                            >
                              Placer ce film
                            </button>
                          </>
                        )}

                      </div>
                      <div className="gd-insert-choice level">
                        <span className="gd-step-symbol level"><Icon name="layers" size={16} /></span>
                        <div>
                          <strong>Niveau</strong>
                          <small>
                            {available.length
                              ? "Choisir un niveau qui n’est pas encore dans le parcours."
                              : "Tous les niveaux du projet sont déjà placés."}
                          </small>
                        </div>
                        {available.length ? (
                          <>
                            <select
                              aria-label="Niveau à ajouter au parcours"
                              value={levelChoice}
                              onChange={(e) => setLevelChoice(e.target.value)}
                            >
                              {available.map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.title}{isContentArchived(project, "levels", l.id) ? " · Archivé" : ""}
                                </option>
                              ))}
                            </select>
                            <button
                              disabled={
                                !available.some((l) => l.id === levelChoice) ||
                                campaign.steps.length >= 1000
                              }
                              onClick={() => placeLevelAt(levelChoice, before)}
                            >
                              Insérer le niveau ici
                            </button>
                          </>
                        ) : null}
                        <button
                          className="gd-primary"
                          disabled={
                            busy ||
                            project.levels.length >= 200 ||
                            campaign.steps.length >= 1000
                          }
                          onClick={() => createLevel(before)}
                        >
                          Créer un niveau ici
                        </button>
                      </div>
                      <h4 className="gd-insert-milestone-heading">Jalons</h4>
                      <div className="gd-insert-choice unlock_herbarium">
                        <span className="gd-step-symbol unlock_herbarium"><Icon name="leaf" size={16} /></span>
                        <div>
                          <strong>Déblocage de L’herbier</strong>
                          <small>
                            L’herbier reste masqué jusqu’ici, puis se débloque
                            automatiquement pour le joueur.
                          </small>
                        </div>
                        <button
                          disabled={
                            !herbariumUnlockStep && campaign.steps.length >= 1000
                          }
                          onClick={() => placeHerbariumUnlock(before)}
                        >
                          {herbariumUnlockStep
                            ? "Déplacer le déblocage de L’herbier ici"
                            : "Insérer le déblocage de L’herbier ici"}
                        </button>
                      </div>
                      <div className="gd-insert-choice unlock_travel_book">
                        <span className="gd-step-symbol unlock_travel_book"><Icon name="file" size={16} /></span>
                        <div>
                          <strong>Déblocage du Carnet de voyage</strong>
                          <small>
                            Le Carnet de voyage reste masqué jusqu’ici, puis se
                            débloque automatiquement pour le joueur.
                          </small>
                        </div>
                        <button
                          disabled={!unlockStep && campaign.steps.length >= 1000}
                          onClick={() => placeTravelBookUnlock(before)}
                        >
                          {unlockStep
                            ? "Déplacer le déblocage du Carnet ici"
                            : "Insérer le déblocage du Carnet ici"}
                        </button>
                      </div>
                      <div className="gd-insert-choice end">
                        <span className="gd-step-symbol end"><Icon name="stop" size={16} /></span>
                        <div>
                          <strong>Fin actuelle de la partie jouable</strong>
                          <small>Le joueur s’arrêtera ici. La suite restera dans le Studio pour les prochaines mises à jour.</small>
                        </div>
                        <button disabled={!endStep && campaign.steps.length >= 1000} onClick={() => placeEnd(before)}>
                          {endStep ? "Déplacer la fin actuelle ici" : "Insérer la fin actuelle ici"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
                {s && (
                  <li
                    className={`gd-step-item ${s.kind}${endIndex >= 0 && i > endIndex ? " preparing" : ""}`}
                    data-archived={archivedStepIds.has(s.id) ? "" : undefined}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData(STEP_DRAG_TYPE, s.id);
                    }}
                    onDragEnd={finishDrag}
                  >
                    <div className="gd-step-entry">
                      <button
                        className="gd-step-card"
                        ref={s.id === selected ? selectedCard : undefined}
                        aria-pressed={s.id === selected}
                        aria-label={`Étape ${i + 1} · ${label(s)}${archivedStepIds.has(s.id) ? " · Archivé" : ""}`}
                        onClick={() => setSelected(s.id)}
                        onDoubleClick={() => editStep(s)}
                        aria-keyshortcuts="Delete Alt+ArrowUp Alt+ArrowDown"
                        onKeyDown={(event) => {
                          if (event.ctrlKey || event.metaKey || event.shiftKey) return;
                          if (event.key === "Delete" && !event.altKey) {
                            event.preventDefault();
                            remove(s, i);
                          } else if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
                            event.preventDefault();
                            nudge(s, i, event.key === "ArrowUp" ? -1 : 1);
                          }
                        }}
                      >
                        <span className="gd-step-number" aria-hidden="true">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={`gd-step-symbol ${s.kind}`}>
                          <Icon name={stepAppearance[s.kind].icon} size={16} />
                        </span>
                        <span className="gd-step-name">
                          <strong>{label(s)}</strong>
                          <small>{stepAppearance[s.kind].label}</small>
                        </span>
                        {archivedStepIds.has(s.id) && <ArchiveStamp />}
                        {s.kind === "cinematic" && !s.skippable && (
                          <small className="gd-step-required">Obligatoire</small>
                        )}
                        <span className="gd-step-grip" title="Glisser pour déplacer" aria-hidden="true">⠿</span>
                      </button>
                      {hasStepPreview(s) && (
                        <button
                          type="button"
                          className="gd-step-edit"
                          aria-label={`Modifier « ${label(s)} »`}
                          onClick={() => editStep(s)}
                        >
                          <Icon name="pencil" size={14} /> Modifier
                        </button>
                      )}
                      {renderStepDisclosure(s, i)}
                    </div>
                  </li>
                )}
              </React.Fragment>
            ))}
            <li className="gd-campaign-end">
              {endStep && pendingCount > 0 ? "Fin du parcours préparé" : "Fin du parcours"}
            </li>
          </ol>
        </section>
        <CampaignReserve
          active={active}
          films={availableFilms}
          levels={available}
          assets={assets}
          assetByRef={assetByRef}
          project={project}
          choice={chosen}
          full={full}
          onChoose={chooseReserveItem}
          onDragStart={startReserveDrag}
          onDragEnd={finishDrag}
        />
      </div>
    </section>
  );
}
