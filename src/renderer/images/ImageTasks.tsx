import React, { useEffect, useRef, useState } from "react";
import {
  imageTaskActive,
  imageTaskFinished,
  imageTaskProjectLabel,
  terrainTaskDestination,
  type ImageTask,
} from "../../shared/imageTasks.js";
import type { AssetRef, LibrarySnapshot } from "../../shared/model.js";
import { api } from "../browserBridge.js";
import { StudioDialog } from "../components/StudioDialog.js";
import { useProjectSession } from "../project/ProjectSessionContext.js";
import { useImageTasks } from "./ImageTasksContext.js";
import "./imageTasks.css";
import './poseGeneration.css';
import { PoseTaskActions } from './PoseTaskActions.js';

export function ImageTasks({
  library,
  updateLibrary,
  notify,
  disabled,
}: {
  library: LibrarySnapshot | null;
  updateLibrary: (library: LibrarySnapshot) => void;
  notify: (message: string) => void;
  disabled: boolean;
}) {
  const { tasks, error: registryError, refresh } = useImageTasks();
  const { session, project, path, epoch, dirty } = useProjectSession();
  const libraryRef = useRef(library?.rootPath);
  libraryRef.current = library?.rootPath;
  const [opened, setOpened] = useState(false),
    [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState("all"),
    [search, setSearch] = useState("");
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [grid, setGrid] = useState(false);
  const [manualDestination, setDestination] = useState<{
    id: string;
    epoch: number;
    previous?: AssetRef;
    previousRestored?: AssetRef;
  }>();
  const [chooseDestination, setChooseDestination] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const selected = tasks.find((task) => task.job.id === selectedId);
  const terrainDestination = selected && terrainTaskDestination(selected, project, path, library?.rootPath);
  const automaticTarget = terrainDestination?.target;
  const destination = chooseDestination
    ? manualDestination
    : automaticTarget && !terrainDestination.assigned.length
      ? { id: automaticTarget.id, epoch, previous: automaticTarget.terrainImage, previousRestored: automaticTarget.restoredTerrainImage }
      : undefined;
  const showDestinationPicker = chooseDestination || (!!terrainDestination && !automaticTarget && !terrainDestination.assigned.length);
  const alreadyAtDestination = !!selected && selected.kind === "terrain" && !!destination && terrainDestination?.assigned.some(level => level.id === destination.id);
  const projectLabel = (task: ImageTask) => imageTaskProjectLabel(task, project, path, library?.rootPath);
  const running = tasks.filter((task) =>
    imageTaskActive(task.job.status),
  ).length;
  const ready = tasks.filter((task) => task.job.status === "ready").length;
  useEffect(() => {
    setDestination(undefined);
    setChooseDestination(false);
    setError("");
  }, [epoch]);
  const visible = tasks.filter((task) => {
    const matches =
      filter === "all" ||
      (filter === "active"
        ? imageTaskActive(task.job.status)
        : filter === "ready"
          ? task.job.status === "ready"
          : filter === "finished"
            ? imageTaskFinished(task.job.status)
            : task.kind === filter);
    return (
      matches &&
      `${task.context?.title ?? ""} ${task.kind !== "background" ? task.job.sourceRef : task.job.ref} ${task.request.instructions} ${task.job.codexModel ?? ""}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase())
    );
  });
  function select(task: ImageTask) {
    setSelectedId(task.job.id);
    setError("");
    setGrid(false);
    setDiscarding(false);
    setDestination(undefined);
    setChooseDestination(false);
  }
  async function perform(action: () => Promise<void>) {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await action();
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setPending(false);
    }
  }
  const inLibrary = !!selected && library?.rootPath === selected.libraryRoot;
  async function apply(task: ImageTask) {
    if (!inLibrary)
      throw Error(
        "Reconnecte la bibliothèque indiquée pour utiliser cette proposition.",
      );
    const captured = {
      epoch: session.getSnapshot().epoch,
      token: session.getSnapshot().token,
      root: library?.rootPath,
    };
    const validDestination = () => {
      const state = session.getSnapshot(),
        level = session.project.levels.find(
          (item) => item.id === destination?.id,
        );
      if (
        state.busy ||
        state.epoch !== captured.epoch ||
        state.token !== captured.token ||
        destination?.epoch !== state.epoch ||
        !level ||
        level.terrainImage !== destination.previous || level.restoredTerrainImage !== destination.previousRestored
      )
        throw Error(
          "Le projet ou le terrain du niveau a changé. Choisis à nouveau sa destination.",
        );
      return level;
    };
    if (task.kind === "terrain") validDestination();
    const result =
      task.kind === "terrain"
        ? await api.applyTerrainGeneration(task.job.id)
        : await api.applyBackgroundCorrection(task.job.id);
    if (result.library && result.library.rootPath === libraryRef.current)
      updateLibrary(result.library);
    if (task.kind === "terrain") {
      const target = validDestination();
      const ref =
        "terrainRef" in result.job ? result.job.terrainRef : undefined;
      const restoredRef = "restoredTerrainRef" in result.job ? result.job.restoredTerrainRef : undefined;
      if (!ref || !restoredRef) throw Error("Les deux états du terrain sont introuvables.");
      session.change(
        (p) => {
          p.levels.find((level) => level.id === target.id)!.terrainImage = ref;
          p.levels.find((level) => level.id === target.id)!.restoredTerrainImage = restoredRef;
        },
        "",
        "Utiliser les deux terrains générés",
        { mode: "levels", section: "levels", levelId: target.id },
      );
      setDestination(undefined);
      setChooseDestination(false);
      notify(
        "Terrains pollué et nettoyé affectés au niveau. Enregistre le projet pour conserver ces choix.",
      );
    } else notify("Décor remplacé. La version originale est sauvegardée.");
  }
  const sourceUrl =
    selected?.kind === "background"
      ? selected.job.originalUrl
      : selected?.job.sourceUrl;
  return (
    <>
      <button
        className="image-tasks-launcher"
        disabled={disabled || !window.lunaria}
        onClick={() => {
          setOpened(true);
          void refresh();
        }}
      >
        Tâches et résultats
        {running > 0
          ? ` · ${running} en cours`
          : ready > 0
            ? ` · ${ready} à valider`
            : ""}
      </button>
      {opened && (
        <StudioDialog
          title="Tâches et résultats"
          onClose={() => setOpened(false)}
          disabled={pending}
          wide
        >
          <div className="image-tasks">
            <p className="image-tasks-intro">
              Poses de personnages, décors 20:9 et terrains 16:9, réunis dans une même file. Tu peux
              fermer les fenêtres pendant la génération. Les propositions
              restent disponibles au prochain démarrage.
            </p>
            <div className="image-task-toolbar">
              <label>
                Afficher
                <select
                  aria-label="Filtrer les tâches"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">
                    Toutes les tâches ({tasks.length})
                  </option>
                  <option value="active">En cours ({running})</option>
                  <option value="ready">À valider ({ready})</option>
                  <option value="finished">Terminées</option>
                  <option value="background">Décors 20:9</option>
                  <option value="terrain">Terrains 16:9</option>
                  <option value="pose">Poses de personnages</option>
                </select>
              </label>
              <label>
                Rechercher
                <input
                  type="search"
                  aria-label="Rechercher une tâche"
                  placeholder="Nom, image ou modèle…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <button
                className="button subtle"
                disabled={
                  pending ||
                  !tasks.some((task) => imageTaskFinished(task.job.status))
                }
                onClick={() =>
                  void perform(async () => {
                    const count = await api.clearImageTaskHistory();
                    notify(
                      `${count} tâche(s) terminée(s) retirée(s) du suivi.`,
                    );
                  })
                }
              >
                Nettoyer les tâches terminées
              </button>
            </div>
            {(error || registryError) && (
              <p role="alert" className="image-task-error">
                {error || registryError}
              </p>
            )}
            <div className="image-task-workspace">
              <ul
                className="image-task-list"
                aria-label="Liste des tâches d’images"
              >
                {!visible.length && (
                  <li className="image-task-empty">
                    {tasks.length
                      ? "Aucune tâche ne correspond aux filtres."
                      : "Aucune génération pour le moment. Commence depuis un personnage, un décor ou les paramètres d’un niveau."}
                  </li>
                )}
                {visible.map((task) => (
                  <li key={task.job.id} data-task-id={task.job.id}>
                    <button
                      className={`image-task-card ${selectedId === task.job.id ? "selected" : ""}`}
                      aria-pressed={selectedId === task.job.id}
                      onClick={() => select(task)}
                    >
                      <img
                        src={
                          task.job.candidateUrl ??
                          (task.kind === "background"
                            ? task.job.originalUrl
                            : task.job.sourceUrl)
                        }
                        alt=""
                      />
                      <span>
                        <small>
                          {task.kind === "background"
                            ? "Décor · 20:9"
                            : task.kind === 'pose' ? 'Pose de personnage' : "Terrain · 16:9"}
                        </small>
                        <strong>
                          {task.context?.title ||
                            (task.kind === "terrain"
                              ? (task.request as { levelTitle: string })
                                  .levelTitle
                              : task.kind === 'pose' ? task.request.characterName : task.job.ref.slice(10))}
                        </strong>
                        <span className={`image-task-state ${task.job.status}`}>
                          {projectLabel(task)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <section
                className="image-task-detail"
                aria-label="Détail de la tâche"
              >
                {!selected ? (
                  <div className="image-task-empty">
                    Sélectionne une tâche pour voir son résultat, l’annuler ou
                    la relancer.
                  </div>
                ) : (
                  <>
                    <div className="image-task-title">
                      <h3>{selected.context?.title || "Génération d’image"}</h3>
                      <span
                        className={`image-task-state ${selected.job.status}`}
                      >
                        {projectLabel(selected)}
                      </span>
                    </div>
                    <p role="status">{selected.job.message}</p>
                    <div className={`image-task-previews${selected.kind === 'pose' ? ' pose-task-previews' : ''}`}>
                      <figure>
                        <figcaption>Référence</figcaption>
                        <img
                          src={sourceUrl}
                          alt="Image de référence de la tâche"
                        />
                      </figure>
                      <figure>
                        <figcaption>
                          {selected.kind === "terrain" ? "Terrain pollué" : "Proposition"}
                          {selected.job.width
                            ? ` · ${selected.job.width} × ${selected.job.height}`
                            : ""}
                        </figcaption>
                        <div
                          className={`image-task-candidate${selected.kind === 'pose' ? ' pose-preview' : ''}`}
                          style={{
                            aspectRatio:
                              selected.kind === 'pose' ? undefined : selected.kind === "terrain" ? "16 / 9" : "20 / 9",
                          }}
                        >
                          {selected.job.candidateUrl ? (
                            <>
                              <img
                                src={selected.job.candidateUrl}
                                alt={selected.kind === "terrain" ? "Terrain pollué de la tâche" : "Proposition de la tâche"}
                              />
                              {grid && selected.kind === "terrain" && (
                                <div
                                  className="image-task-grid"
                                  aria-label="Grille indicative de 5 allées et 8 colonnes"
                                >
                                  {Array.from({ length: 40 }, (_, i) => (
                                    <span key={i} />
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <p>
                              {selected.job.status === "queued"
                                ? "Une autre image est en cours. Cette tâche démarrera ensuite."
                                : imageTaskActive(selected.job.status)
                                  ? "La création de l’image peut prendre plusieurs minutes."
                                  : "Aucune proposition disponible."}
                            </p>
                          )}
                        </div>
                      </figure>
                      {selected.kind === "terrain" && <figure>
                        <figcaption>Terrain nettoyé</figcaption>
                        <div className="image-task-candidate" style={{aspectRatio:"16 / 9"}}>
                          {selected.job.restoredCandidateUrl ? <>
                            <img src={selected.job.restoredCandidateUrl} alt="Terrain nettoyé de la tâche" />
                            {grid && <div className="image-task-grid" aria-label="Grille du terrain nettoyé">{Array.from({length:40},(_,i)=><span key={i}/>)}</div>}
                          </> : <p>Les deux états seront disponibles à la fin de la génération.</p>}
                        </div>
                      </figure>}
                    </div>
                    {selected.kind === "terrain" &&
                      selected.job.candidateUrl && (
                        <label>
                          <input
                            type="checkbox"
                            checked={grid}
                            onChange={(e) => setGrid(e.target.checked)}
                          />{" "}
                          Afficher la grille indicative de 5 × 8
                        </label>
                      )}
                    <details className="image-task-technical">
                      <summary>
                        Détails de la tâche ·{" "}
                        {selected.job.codexModel ?? "Modèle automatique"}
                      </summary>
                      <dl className="image-task-metadata">
                        <dt>Modèle Codex</dt>
                        <dd>{selected.job.codexModel ?? "Automatique"}</dd>
                          {selected.kind === "terrain" && selected.job.codexReasoningEffort && <><dt>Raisonnement</dt><dd>{selected.job.codexReasoningEffort === "xhigh" ? "Très élevé" : selected.job.codexReasoningEffort}</dd></>}
                        <dt>Création</dt>
                        <dd>
                          {selected.job.createdAt
                            ? new Date(selected.job.createdAt).toLocaleString(
                                "fr-FR",
                              )
                            : "Date inconnue"}
                        </dd>
                        <dt>Bibliothèque</dt>
                        <dd>{selected.libraryRoot}</dd>
                        <dt>Projet d’origine</dt>
                        <dd>
                          {selected.context?.projectPath ||
                            "Projet non enregistré"}
                        </dd>
                      </dl>
                    </details>
                    <details>
                      <summary>Consigne utilisée</summary>
                      <p className="image-task-instructions">
                        {selected.request.instructions ||
                          "Consigne standard du Studio."}
                      </p>
                    </details>
                    {!inLibrary && (
                      <p className="image-task-error">
                        Reconnecte la bibliothèque de cette tâche pour utiliser
                        ou relancer son résultat.
                      </p>
                    )}
                    {selected.kind === "terrain" && ["ready", "applied"].includes(selected.job.status) && terrainDestination && <div className="image-task-destination-summary">
                      {terrainDestination.assigned.length > 0 ? <p role="status">Déjà affectés à : <strong>{terrainDestination.assigned.map(level => level.title).join(", ")}</strong>. {dirty ? "Enregistre le projet pour conserver ces choix." : "Projet enregistré."}</p>
                        : automaticTarget && !chooseDestination ? <p>Les deux terrains seront affectés à : <strong>{automaticTarget.title}</strong>.</p>
                        : <p>{chooseDestination && automaticTarget ? "Choisis le niveau qui recevra les deux terrains." : terrainDestination.reason}</p>}
                      {!showDestinationPicker && <button className="button text" disabled={pending} onClick={() => { setChooseDestination(true); setDestination(undefined); }}>Choisir un autre niveau</button>}
                    </div>}
                    {selected.kind === "terrain" &&
                      ["ready", "applied"].includes(selected.job.status) && showDestinationPicker && (
                        <label className="image-task-destination">
                          Niveau de destination
                          <select
                            aria-label="Niveau de destination"
                            disabled={pending}
                            value={destination?.id ?? ""}
                            onChange={(e) => {
                              const level = project.levels.find(
                                (item) => item.id === e.target.value,
                              );
                              setDestination(
                                level
                                  ? {
                                      id: level.id,
                                      epoch,
                                      previous: level.terrainImage,
                                      previousRestored: level.restoredTerrainImage,
                                    }
                                  : undefined,
                              );
                              setChooseDestination(true);
                            }}
                          >
                            <option value="">
                              Choisir dans le projet ouvert…
                            </option>
                            {project.levels.map((level) => (
                              <option key={level.id} value={level.id}>
                                {level.title}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    {selected.kind === "background" &&
                      selected.job.status === "ready" && (
                        <p>
                          Le remplacement actualise ce décor dans tous les plans
                          qui l’utilisent. Une copie de l’original sera
                          sauvegardée.
                        </p>
                      )}
                    <div className="image-task-actions">
                      {["queued", "generating"].includes(
                        selected.job.status,
                      ) && (
                        <button
                          className="button subtle"
                          disabled={pending}
                          onClick={() =>
                            void perform(async () => {
                              if (selected.kind === 'pose') await api.cancelPoseGeneration(selected.job.id);
                              else if (selected.kind === "terrain")
                                await api.cancelTerrainGeneration(
                                  selected.job.id,
                                );
                              else
                                await api.cancelBackgroundCorrection(
                                  selected.job.id,
                                );
                            })
                          }
                        >
                          Annuler la génération
                        </button>
                      )}
                      {selected.kind !== 'pose' && (selected.job.status === "ready" ||
                        (selected.kind === "terrain" &&
                          selected.job.status === "applied")) &&
                        (selected.kind !== "terrain" || !terrainDestination?.assigned.length || showDestinationPicker) && (
                        <button
                          className="button primary"
                          disabled={
                            pending ||
                            !inLibrary ||
                            session.getSnapshot().busy ||
                            (selected.kind === "terrain" && (!destination || alreadyAtDestination))
                          }
                          onClick={() => void perform(() => apply(selected))}
                        >
                          {selected.kind === "terrain"
                            ? "Utiliser les deux terrains pour le niveau"
                            : "Remplacer le fichier d’origine"}
                        </button>
                      )}
                      {["failed", "cancelled", "interrupted"].includes(
                        selected.job.status,
                      ) && (
                        <button
                          className="button primary"
                          disabled={pending || !inLibrary}
                          onClick={() =>
                            void perform(async () => {
                              const next = await api.retryImageTask(
                                selected.kind,
                                selected.job.id,
                              );
                              setSelectedId(next.id);
                              setDiscarding(false);
                            })
                          }
                        >
                          Relancer cette tâche
                        </button>
                      )}
                      {selected.kind === "background" &&
                        selected.job.status === "applied" && (
                          <button
                            className="button subtle"
                            onClick={() =>
                              void perform(() =>
                                api.revealBackgroundBackup(selected.job.id),
                              )
                            }
                          >
                            Voir l’original sauvegardé
                          </button>
                        )}
                      {!imageTaskActive(selected.job.status) && (
                        <button
                          className="button text"
                          disabled={pending}
                          onClick={() => {
                            if (selected.job.status === "ready" && !discarding)
                              setDiscarding(true);
                            else
                              void perform(async () => {
                                await api.removeImageTask(
                                  selected.kind,
                                  selected.job.id,
                                );
                                setSelectedId("");
                                setDiscarding(false);
                              });
                          }}
                        >
                          {discarding
                            ? "Confirmer la suppression de cette proposition"
                            : "Supprimer la tâche"}
                        </button>
                      )}
                    </div>
                    {selected.kind === 'pose' && <PoseTaskActions key={selected.job.id} task={selected} library={library} updateLibrary={updateLibrary} notify={notify} />}
                  </>
                )}
              </section>
            </div>
            <footer className="image-tasks-help">
              Une génération à la fois. Les tâches interrompues attendent une
              relance manuelle. Le nettoyage retire les tâches terminées et
              leurs fichiers temporaires ; les propositions à valider, les
              images de bibliothèque et les sauvegardes sont conservées.
            </footer>
          </div>
        </StudioDialog>
      )}
    </>
  );
}
