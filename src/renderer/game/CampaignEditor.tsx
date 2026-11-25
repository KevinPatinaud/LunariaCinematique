import React, { useEffect, useRef, useState } from "react";
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
import { gameAPI } from "./bridge.js";
import { api } from "../browserBridge.js";
import { placeLevel, stepTitle } from "../../shared/game/levelManagement.js";
interface Props {
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
  const inspector = useRef<HTMLElement>(null);
  useEffect(() => {
    if (inspector.current) inspector.current.scrollTop = 0;
  }, [selected]);
  const [dragged, setDragged] = useState(""),
    [dropTarget, setDropTarget] = useState("");
  const step = campaign.steps.find((s) => s.id === selected),
    film =
      step?.kind === "cinematic"
        ? campaign.cinematics.find((f) => f.id === step.cinematicId)
        : undefined;
  const level =
    step?.kind === "level"
      ? project.levels.find((l) => l.id === step.levelId)
      : undefined;
  const available = project.levels.filter(
    (l) =>
      !campaign.steps.some((s) => s.kind === "level" && s.levelId === l.id),
  );
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
    setSelected(nextId);
    setInsertBefore(undefined);
  }
  function openInsertion(beforeId: string | null) {
    setInsertBefore((current) => (current === beforeId ? undefined : beforeId));
    setLevelChoice(available[0]?.id ?? "");
  }
  function after(id: string): string | null {
    const i = campaign.steps.findIndex((s) => s.id === id);
    return campaign.steps[i + 1]?.id ?? null;
  }
  const placeExistingFilm = (beforeId: string | null) => {
    const doc = project.cinematics?.find(
      (item) => item.id === (filmChoice || project.cinematics?.[0]?.id),
    );
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
  };
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
  function nudge(by: number) {
    if (!step) return;
    const i = campaign.steps.findIndex((s) => s.id === step.id),
      j = i + by;
    if (j < 0 || j >= campaign.steps.length) return;
    move(
      step.id,
      by < 0 ? campaign.steps[j].id : (campaign.steps[j + 1]?.id ?? null),
    );
  }
  function placeEnd(beforeId: string | null) {
    if (endStep) {
      move(endStep.id, beforeId);
      setSelected(endStep.id);
      setInsertBefore(undefined);
    } else insertAt({ id: newId("step"), kind: "end" }, beforeId);
  }
  function placeTravelBookUnlock(beforeId: string | null) {
    if (unlockStep) {
      move(unlockStep.id, beforeId);
      setSelected(unlockStep.id);
      setInsertBefore(undefined);
    } else insertAt({ id: newId("step"), kind: "unlock_travel_book" }, beforeId);
  }
  function placeHerbariumUnlock(beforeId: string | null) {
    if (herbariumUnlockStep) {
      move(herbariumUnlockStep.id, beforeId);
      setSelected(herbariumUnlockStep.id);
      setInsertBefore(undefined);
    } else insertAt({ id: newId("step"), kind: "unlock_herbarium" }, beforeId);
  }
  const remove = () =>
    void run(async () => {
      if (
        !step ||
        !(await api.confirmDelete(
          "cette étape du parcours (le contenu reste dans le Studio)",
        ))
      )
        return;
      // run owns the document lock; use a prepared edit only after the native prompt.
      const id = step.id;
      change(
        (p) => {
          const c = ensureCampaign(p);
          c.steps = c.steps.filter((s) => s.id !== id);
        },
        "",
        "Retirer une étape",
      );
    });
  // Parent run blocks ordinary edits; asynchronous commands are committed through its explicitly unlocked callback.
  const label = (s: CampaignStep) => stepTitle(project, s);
  const edit = () => {
    if (level) selectLevel(level.id);
    else if (film) void openFilm(film);
  };
  return (
    <section className={`gd-campaign${endStep ? " has-boundary" : ""}`}>
      <header className="gd-campaign-header">
        <div>
          <span className="gd-kicker">LE PARCOURS DU JOUEUR</span>
          <div className="gd-campaign-title-row">
            <h1>Campagne</h1>
            <input
              className="gd-campaign-project-title"
              aria-label="Titre du projet"
              title="Renommer le projet"
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
          </div>
          {path && (
            <small className="gd-campaign-project-path" title={path}>
              {path}
            </small>
          )}
          <p>
            <strong>Le jeu lit cette liste de haut en bas.</strong> Une
            cinématique placée entre deux niveaux se lance après la victoire du
            premier, avant le chargement du suivant.
            {" "}La borne de fin actuelle arrête la partie jouable à l’endroit choisi.
            {" "}Les jalons L’herbier et Carnet de voyage définissent le moment où chaque écran apparaît pour le joueur.
          </p>
        </div>
        <div className="gd-campaign-count">
          <b>{campaign.steps.length}</b>
          <span>étapes</span>
          <small>
            {campaign.steps.filter((s) => s.kind === "level").length} niveaux ·{" "}
            {campaign.steps.filter((s) => s.kind === "cinematic").length}{" "}
            cinématiques
          </small>
        </div>
      </header>
      {endStep && (
        <div className="gd-campaign-boundary" role="status">
          <strong>Fin actuelle à l’étape {endIndex + 1}</strong>
          <span>{pendingCount ? `${pendingCount} étape(s) après la borne : suite en préparation, conservée dans le Studio et non publiée.` : "Toutes les étapes précédentes seront publiées. Déplace la borne pour prolonger l’aventure."}</span>
          <button onClick={() => setSelected(endStep.id)}>Sélectionner la fin actuelle</button>
        </div>
      )}
      {herbariumUnlockStep && (
        <div className="gd-campaign-unlock herbarium" role="status">
          <strong>
            {herbariumUnlockAfterEnd
              ? `Déblocage de L’herbier à l’étape ${herbariumUnlockIndex + 1} (après la fin actuelle)`
              : herbariumUnlockIndex === 0
                ? "L’herbier débloqué dès le début (étape 1)"
                : `Déblocage de L’herbier à l’étape ${herbariumUnlockIndex + 1}`}
          </strong>
          <span>
            {herbariumUnlockAfterEnd
              ? "Placé dans la suite en préparation : L’herbier restera masqué dans la version publiée."
              : herbariumUnlockIndex === 0
                ? "Aucune étape précédente : L’herbier est accessible dès l’ouverture du jeu."
                : `Masqué avant ce jalon, puis débloqué automatiquement après « ${label(campaign.steps[herbariumUnlockIndex - 1])} ».`}
          </span>
          <button onClick={() => setSelected(herbariumUnlockStep.id)}>
            Sélectionner le déblocage de L’herbier
          </button>
        </div>
      )}
      {unlockStep && (
        <div className="gd-campaign-unlock" role="status">
          <strong>
            {unlockAfterEnd
              ? `Déblocage du Carnet de voyage à l’étape ${unlockIndex + 1} (après la fin actuelle)`
              : unlockIndex === 0
                ? "Carnet de voyage débloqué dès le début (étape 1)"
                : `Déblocage du Carnet de voyage à l’étape ${unlockIndex + 1}`}
          </strong>
          <span>
            {unlockAfterEnd
              ? "Placé dans la suite en préparation : le Carnet de voyage restera masqué dans la version publiée."
              : unlockIndex === 0
                ? "Aucune étape précédente : le Carnet de voyage est accessible dès l’ouverture du jeu."
                : `Masqué avant ce jalon, puis débloqué automatiquement après « ${label(campaign.steps[unlockIndex - 1])} ».`}
          </span>
          <button onClick={() => setSelected(unlockStep.id)}>
            Sélectionner le déblocage du Carnet
          </button>
        </div>
      )}
      <div className="gd-campaign-backup">
        <p>
          <strong>Garder une copie de la campagne</strong>
          <span>
            Tout le projet, ses images et ses sons, dans un dossier daté.
          </span>
        </p>
        <button disabled={busy} onClick={backup}>
          Sauvegarder la campagne…
        </button>
      </div>
      <div
        className="gd-campaign-explainer"
        aria-label="Exemple d’enchaînement de campagne"
      >
        <div>
          <span className="gd-flow-node start">DÉBUT</span>
          <b>→</b>
          <span className="gd-flow-node cinematic">▶ CINÉMATIQUE</span>
          <b>→</b>
          <span className="gd-flow-node level">⚑ NIVEAU</span>
          <b>→</b>
          <span className="gd-flow-node cinematic">▶ CINÉMATIQUE</span>
          <b>→</b>
          <span className="gd-flow-node level">⚑ NIVEAU</span>
        </div>
        <p>
          Clique sur <strong>« Insérer ici »</strong> exactement à l’endroit où
          le film ou le niveau doit être joué. Tu peux ensuite glisser les
          cartes pour les réordonner.
        </p>
      </div>
      {!campaign.steps.length && (
        <div className="gd-campaign-start">
          <div>
            <strong>Construis la première étape du voyage.</strong>
            <p>
              Commence par un niveau, ou utilise « Insérer ici » pour placer une
              cinématique déjà créée.
            </p>
          </div>
          <button
            className="gd-primary"
            onClick={() => createLevel(null)}
            disabled={project.levels.length >= 200}
          >
            Créer un premier niveau
          </button>
        </div>
      )}
      <div className="gd-campaign-layout">
        <div className="gd-sequence-panel">
          <ol className="gd-campaign-cards" aria-label="Ordre de la campagne">
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
                <li
                  role="presentation"
                  className={`gd-insert-slot ${insertBefore === before ? "open " : ""}${dropTarget === `slot:${before ?? "end"}` ? "drop-target" : ""}`}
                  onDragOver={(e) => {
                    if (dragged) {
                      e.preventDefault();
                      setDropTarget(`slot:${before ?? "end"}`);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData(
                      "application/x-lunaria-step",
                    );
                    if (id) move(id, before);
                    setDragged("");
                    setDropTarget("");
                  }}
                >
                  <span className="gd-insert-line" />
                  <button
                    className="gd-insert-toggle"
                    aria-expanded={insertBefore === before}
                    aria-label={
                      i === 0
                        ? "Insérer au début de la campagne"
                        : i === campaign.steps.length
                          ? "Insérer après la dernière étape"
                          : `Insérer entre les étapes ${i} et ${i + 1}`
                    }
                    onClick={() => openInsertion(before)}
                  >
                    <b>＋</b> Insérer ici{" "}
                    <small>
                      {i === 0
                        ? "au démarrage"
                        : i === campaign.steps.length
                          ? "après la dernière étape"
                          : `entre ${i} et ${i + 1}`}
                    </small>
                  </button>
                  <span className="gd-insert-line" />
                  {insertBefore === before && (
                    <div className="gd-insert-menu">
                      <div className="gd-insert-choice cinematic">
                        <span className="gd-step-symbol cinematic">▶</span>
                        <div>
                          <strong>Cinématique</strong>
                          <small>
                            Les films sont enregistrés avec les niveaux.
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
                                  {doc.title}
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
                      <span className="gd-insert-or">OU</span>
                      <div className="gd-insert-choice level">
                        <span className="gd-step-symbol level">⚑</span>
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
                                  {l.title}
                                </option>
                              ))}
                            </select>
                            <button
                              disabled={
                                !available.some((l) => l.id === levelChoice) ||
                                campaign.steps.length >= 1000
                              }
                              onClick={() =>
                                insertAt(
                                  {
                                    id: newId("step"),
                                    kind: "level",
                                    levelId: levelChoice,
                                  },
                                  before,
                                )
                              }
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
                      <div className="gd-insert-choice unlock_herbarium">
                        <span className="gd-step-symbol unlock_herbarium">🌿</span>
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
                        <span className="gd-step-symbol unlock_travel_book">📖</span>
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
                        <span className="gd-step-symbol end">🏁</span>
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
                    className={`gd-step-item ${s.kind} ${endIndex >= 0 && i > endIndex ? "preparing " : ""}${s.id === selected ? "selected " : ""}`}
                    draggable
                    onDragStart={(e) => {
                      setDragged(s.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData(
                        "application/x-lunaria-step",
                        s.id,
                      );
                    }}
                    onDragEnd={() => {
                      setDragged("");
                      setDropTarget("");
                    }}
                  >
                    <button
                      className="gd-step-card"
                      aria-pressed={s.id === selected}
                      aria-label={`Étape ${i + 1} · ${label(s)}`}
                      onClick={() => setSelected(s.id)}
                      onDoubleClick={() => {
                        if (s.kind === "level") selectLevel(s.levelId);
                        else if (s.kind === "cinematic") {
                          const ref = campaign.cinematics.find(
                            (f) => f.id === s.cinematicId,
                          );
                          if (ref) void openFilm(ref);
                        }
                      }}
                    >
                      <span className="gd-step-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`gd-step-symbol ${s.kind}`}>
                        {s.kind === "end"
                          ? "🏁"
                          : s.kind === "unlock_travel_book"
                            ? "📖"
                            : s.kind === "unlock_herbarium"
                              ? "🌿"
                              : s.kind === "level"
                                ? "⚑"
                                : "▶"}
                      </span>
                      <span className="gd-step-name">
                        <small>
                          {endIndex >= 0 && i > endIndex && "SUITE EN PRÉPARATION · "}
                          {s.kind === "end"
                            ? "LIMITE DE LA VERSION JOUABLE"
                            : s.kind === "unlock_travel_book" ||
                                s.kind === "unlock_herbarium"
                              ? "JALON DE PROGRESSION"
                              : s.kind === "level"
                                ? endIndex >= 0 && i > endIndex
                                  ? "NIVEAU"
                                  : "NIVEAU JOUABLE"
                                : "CINÉMATIQUE"}
                        </small>
                        <strong>{label(s)}</strong>
                        <small>
                          {s.kind === "end"
                            ? "Écran de fin · la suite reste dans le Studio"
                            : s.kind === "unlock_travel_book"
                              ? endIndex >= 0 && i > endIndex
                                ? "Après la fin actuelle · Carnet masqué dans la version publiée"
                                : i === 0
                                  ? "Au démarrage · Carnet accessible dès le début"
                                  : "Masqué avant · débloqué automatiquement à ce moment"
                              : s.kind === "unlock_herbarium"
                                ? endIndex >= 0 && i > endIndex
                                  ? "Après la fin actuelle · Herbier masqué dans la version publiée"
                                  : i === 0
                                    ? "Au démarrage · Herbier accessible dès le début"
                                    : "Masqué avant · débloqué automatiquement à ce moment"
                                : endIndex >= 0 && i > endIndex
                                  ? "Conservé dans le projet · non publié"
                                  : s.kind === "level"
                                    ? "Victoire → passage à l’étape suivante"
                                    : s.skippable
                                      ? "Film pouvant être passé par le joueur"
                                      : "Film obligatoire avant la suite"}
                        </small>
                      </span>
                      <span className="gd-step-grip" aria-hidden="true">
                        ⠿
                      </span>
                    </button>
                  </li>
                )}
              </React.Fragment>
            ))}
            <li className="gd-campaign-end">
              <strong>{endStep ? "FIN DU PARCOURS PRÉPARÉ" : "FIN DE CAMPAGNE"}</strong>
              <small>{endStep ? "La partie jouable s’arrête à la borne de fin actuelle." : "Le parcours s’arrête après la dernière étape."}</small>
            </li>
          </ol>
        </div>
        <aside className="gd-campaign-inspector" ref={inspector}>
          {step ? (
            <>
              <div className="gd-kicker">
                ÉTAPE {campaign.steps.indexOf(step) + 1} ·{" "}
                {step.kind === "end"
                  ? "FIN ACTUELLE"
                  : step.kind === "unlock_travel_book" ||
                      step.kind === "unlock_herbarium"
                    ? "JALON DE PROGRESSION"
                    : step.kind === "level"
                      ? "NIVEAU JOUABLE"
                      : "CINÉMATIQUE"}
              </div>
              <h2>{label(step)}</h2>
              <div className="gd-step-context">
                <span>
                  {campaign.steps[campaign.steps.indexOf(step) - 1]
                    ? `Après « ${label(campaign.steps[campaign.steps.indexOf(step) - 1])} »`
                    : "Au début du jeu"}
                </span>
                <b>
                  {step.kind === "end"
                    ? "→ ARRÊT DU JOUEUR"
                    : step.kind === "unlock_travel_book"
                      ? "→ DÉBLOCAGE DU CARNET →"
                      : step.kind === "unlock_herbarium"
                        ? "→ DÉBLOCAGE DE L’HERBIER →"
                        : "→ CETTE ÉTAPE →"}
                </b>
                <span>
                  {campaign.steps[campaign.steps.indexOf(step) + 1]
                    ? `${step.kind === "end" ? "Suite en préparation :" : "Puis"} « ${label(campaign.steps[campaign.steps.indexOf(step) + 1])} »`
                    : "Puis fin de campagne"}
                </span>
              </div>
              {endIndex >= 0 && campaign.steps.indexOf(step) > endIndex && (
                <p className="gd-preparing-note">Suite en préparation : cette étape reste modifiable et testable dans le Studio. Déplace la fin actuelle après cette étape pour la rendre jouable dans la campagne publiée.</p>
              )}
              <div className="gd-inline">
                <button
                  aria-label="Monter l’étape"
                  disabled={campaign.steps[0] === step}
                  onClick={() => nudge(-1)}
                >
                  ↑ Monter
                </button>
                <button
                  aria-label="Descendre l’étape"
                  disabled={campaign.steps.at(-1) === step}
                  onClick={() => nudge(1)}
                >
                  ↓ Descendre
                </button>
              </div>
              {step.kind === "end" ? (
                <>
                  <p>Le jeu affiche le message de fin de la version actuelle, avec le retour à l’accueil. Aucun niveau ni aucune cinématique placé après cette borne n’est publié dans le parcours.</p>
                  <p className="gd-note">Déplace cette carte lorsque tu prolonges l’aventure. Les étapes suivantes restent enregistrées et modifiables dans le Studio. Une seule borne de fin actuelle est nécessaire.</p>
                  <p className="gd-note">Retirer cette borne rend à nouveau publiable tout le parcours.</p>
                </>
              ) : step.kind === "unlock_travel_book" ? (
                <>
                  <p>Le bouton « Carnet de voyage » reste masqué sur l’accueil et dans l’herbier tant que le joueur n’a pas atteint ce point du parcours. Dès que l’étape précédente est accomplie, le Carnet de voyage se débloque automatiquement, sans interrompre l’enchaînement des cinématiques et des niveaux.</p>
                  <p className="gd-note">Glisse cette carte ou utilise Monter / Descendre pour déplacer librement le moment du déblocage (par exemple entre deux parties d’une cinématique). Un seul jalon est nécessaire.</p>
                  <p className="gd-note">Retirer ce jalon rend le Carnet de voyage accessible dès le début de la partie.</p>
                </>
              ) : step.kind === "unlock_herbarium" ? (
                <>
                  <p>Le bouton « L’herbier » reste masqué sur l’accueil et dans le Carnet de voyage tant que le joueur n’a pas atteint ce point du parcours. Dès que l’étape précédente est accomplie, L’herbier se débloque automatiquement, sans interrompre l’enchaînement des cinématiques et des niveaux.</p>
                  <p className="gd-note">Glisse cette carte ou utilise Monter / Descendre pour déplacer librement le moment du déblocage (par exemple entre deux parties d’une cinématique). Un seul jalon est nécessaire.</p>
                  <p className="gd-note">Retirer ce jalon rend L’herbier accessible dès le début de la partie.</p>
                </>
              ) : film ? (
                <>
                  <p className="gd-note">
                    Ce film est enregistré avec les niveaux dans le projet
                    Lunaria.
                  </p>
                  <label className="gd-check">
                    <input
                      type="checkbox"
                      checked={step.kind === "cinematic" && step.skippable}
                      onChange={(e) =>
                        change(
                          (p) => {
                            const s = ensureCampaign(p).steps.find(
                              (s) => s.id === step.id,
                            );
                            if (s?.kind === "cinematic")
                              s.skippable = e.target.checked;
                          },
                          "",
                          "Autoriser le passage du film",
                        )
                      }
                    />
                    Autoriser le joueur à passer cette cinématique
                  </label>
                  <button onClick={edit}>
                    Ouvrir dans l’éditeur de cinématiques
                  </button>
                  <button
                    disabled={campaign.steps.length >= 1000}
                    onClick={() =>
                      insertAt(
                        {
                          id: newId("step"),
                          kind: "cinematic",
                          cinematicId: film.id,
                          skippable:
                            step.kind === "cinematic" && step.skippable,
                        },
                        after(step.id),
                      )
                    }
                  >
                    Répéter ce film juste après
                  </button>
                </>
              ) : (
                <>
                  <p>
                    {level?.waves.length ?? 0} vagues ·{" "}
                    {level?.allowedPlants.length ?? 0} plantes disponibles
                  </p>
                  <button onClick={edit}>Ouvrir le niveau</button>
                  <p className="gd-note">
                    Après la victoire, le jeu passe automatiquement à la carte
                    placée juste en dessous : film ou niveau. Une défaite ne
                    débloque pas la suite.
                  </p>
                </>
              )}
              <button className="gd-remove-step" onClick={remove}>
                Retirer du parcours
              </button>
            </>
          ) : (
            <p>
              Ajoute une première cinématique ou un premier niveau quand tu
              seras prêt.
            </p>
          )}
          <hr />
          <section
            className="campaign-unplaced"
            aria-label="Niveaux hors parcours"
          >
            <h3>
              {available.length} niveau{available.length > 1 ? "x" : ""} hors
              parcours
            </h3>
            <p className="gd-note">
              Ces fiches restent dans le projet. Elles seront jouables dans la
              campagne après leur insertion.
            </p>
            <button disabled={!available.length} onClick={showUnplaced}>
              Voir les niveaux hors parcours
            </button>
          </section>
          <hr />
          <h3>Avant publication</h3>
          <p className="gd-note">
            Vérifie les films et les médias du parcours. Le dossier Godot
            sélectionné est vérifié avant la confirmation de publication.
          </p>
          <button
            onClick={() =>
              void run(async () => {
                const r = await gameAPI.checkCampaign(project);
                report(
                  `Parcours vérifié. ${r.steps} étapes, ${r.levels} niveaux, ${r.films} cinématiques, ${r.assets} ressources uniques. ${r.warnings.join(" ")}`,
                );
              })
            }
          >
            Vérifier le parcours
          </button>
        </aside>
      </div>
    </section>
  );
}
