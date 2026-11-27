import React from "react";
import { flushSync } from "react-dom";
import type { GameProject } from "../../shared/game/types.js";
import type { CatalogLink } from "../../shared/presentation/types.js";
import type {
  Actor,
  Asset,
  Bubble,
  Cinematic,
  LibrarySnapshot,
  Shot,
} from "../../shared/model.js";
import type {
  Alignment,
  ObjectChange,
  ObjectKind,
  ShotTemplate,
} from "../../shared/studio.js";
import type { Diagnostic } from "../../shared/diagnostics.js";
import { textNeedsCompletion } from "../../shared/textAnimation.js";
import { Library, type LibraryTab } from "../components/Library.js";
import { Inspector, cameraLabels } from "../components/Inspector.js";
import { Scene, type Selection } from "../components/Scene.js";
import {
  PhoneFormatSelector,
  PhonePreview,
  type usePhonePreview,
} from "../components/PhonePreview.js";
import {
  BackgroundCorrectionDialog,
  BackgroundCorrectionStatus,
  type useBackgroundCorrection,
} from "../components/BackgroundCorrection.js";
import { Layers } from "../components/Layers.js";
import { Icon } from "../components/Icon.js";
import { isContentArchived } from "../../shared/game/contentArchives.js";
import type { useCinematicPlayback } from "../hooks/useCinematicPlayback.js";
import type { useMotionPreview } from "../hooks/useMotionPreview.js";
import type { useLibraryLayout } from "../hooks/useLibraryLayout.js";
import type { useCollections } from "../hooks/useCollections.js";
import type { useObjectWorkspace } from "../hooks/useObjectWorkspace.js";
import { StoryboardStrip } from "./StoryboardStrip.js";
import { CinematicHelpModal } from "./CinematicHelpModal.js";
import { CinematicContinuityBar } from "./CinematicContinuityBar.js";

export type CopiedCinematicObject =
  | { kind: "actor"; actor: Actor; catalog?: Cinematic["presentationCatalog"] }
  | { kind: "bubble"; bubble: Bubble; speaker?: Actor };

interface CinematicWorkspaceProps {
  visible: boolean;
  presentationProject: GameProject;
  activeFilmId: string;
  filmTitleInput: React.RefObject<HTMLInputElement | null>;
  doc: Cinematic;
  shot: Shot;
  selectedShot: Shot;
  selectedShotIndex: number;
  selectedShotNumber: string;
  totalSeconds: number;
  assets: Asset[];
  library: LibrarySnapshot | null;
  tab: LibraryTab;
  setTab: (tab: LibraryTab) => void;
  collections: ReturnType<typeof useCollections>;
  libraryLayout: ReturnType<typeof useLibraryLayout>;
  phonePreview: ReturnType<typeof usePhonePreview>;
  preview: ReturnType<typeof useCinematicPlayback>;
  motionPreview: ReturnType<typeof useMotionPreview>;
  backgroundCorrection: ReturnType<typeof useBackgroundCorrection>;
  workspaceObjects: ReturnType<typeof useObjectWorkspace>;
  textPreviewId: string | null;
  setTextPreviewId: (id: string | null) => void;
  textPreviewBubble: Bubble | undefined;
  previewDuration: number;
  selection: Selection;
  selectionIds: string[];
  copiedObject: CopiedCinematicObject | null;
  snap: boolean;
  setSnap: (snap: boolean) => void;
  guides: boolean;
  setGuides: (guides: boolean) => void;
  busy: boolean;
  locked: boolean;
  desktop: boolean;
  studioProjectPath: string;
  diagnostics: Diagnostic[];
  issueCount: number;
  modal: "help" | "issues" | null;
  setModal: (modal: "help" | "issues" | null) => void;
  recentProjects: Array<{
    id: string;
    path: string;
    title: string;
    lastUsedAt: string;
    pinned: boolean;
  }>;
  commitFocusedInput: () => void;
  notify: (message: string) => void;
  selectFilm: (id: string) => void;
  onChangeTitle: (title: string) => void;
  onOpenAudioModal: (options?: { tab?: "music" | "sounds"; linkActorId?: string }) => void;
  onCreateDocument: () => void;
  onOpenFilmsModal: () => void;
  onExportJpg: () => void;
  onStartPlayback: (fromShotId?: string) => void;
  onRestartPlayback: () => void;
  onChooseLibrary: () => void;
  onRefreshLibrary: () => void;
  onLoadExample: () => void;
  onOpenProjectModal: () => void;
  onOpenRecents: () => void;
  onOpenRecent: (path: string) => void;
  animatedElements: import('../presentation/AnimatedElementLibrary.js').ElementLibraryActions;
  onUseAsset: (
    asset: Asset,
    as: LibraryTab,
    position?: { x: number; y: number },
  ) => Promise<boolean>;
  onAddBubble: (kind?: Bubble["kind"]) => void;
  onSelectGroup: (ids: string[], additive?: boolean) => void;
  onBatchUpdate: (
    changes: ObjectChange[],
    label?: string,
    key?: string,
  ) => void;
  onSetSelection: (selection: Selection, additive?: boolean) => void;
  onUpdateObject: (
    kind: "actor" | "bubble",
    id: string,
    patch: Partial<Actor> | Partial<Bubble>,
    key?: string,
  ) => void;
  onUpdateShot: (patch: Partial<Shot>, key?: string) => void;
  onSelectShot: (id: string) => void;
  onMoveShotToIndex: (source: string, index: number) => void;
  onReorderShot: (source: string, target: string) => void;
  onFromTemplate: (template: ShotTemplate) => void;
  onAddShot: () => void;
  onGeneratePose: () => void;
  onOpenAnimationWorkshop: (speciesId?: string, animationId?: string) => void;
  onGenerateAnimation: (speciesId?: string, historyOnly?: boolean) => void;
  onSetCatalog: (value: CatalogLink) => void;
  onStartMotionPreview: () => void;
  onStartTextPreview: (id: string) => void;
  onCopySelection: () => void;
  onPasteSelection: () => void;
  onAutoPlaceSelected: () => void;
  onRemoveSelection: () => void;
  onDuplicateSelection: () => void;
  onLayerDirection: (direction: number) => void;
  onMoveBubble: (id: string, direction: number) => void;
  onSelectAll: () => void;
  onReorderLayer: (kind: ObjectKind, source: string, target: string) => void;
  onAlignSelection: (alignment: Alignment) => void;
  onFocusDiagnostic: (issue: Diagnostic) => void;
  onFixDiagnostic: (issue: Diagnostic) => void;
  onOpenLevelFromContinuity: (
    levelId: string,
    tab?: "settings" | "waves" | "plants" | "events",
  ) => void;
  onOpenCampaignStepFromContinuity: (stepId: string) => void;
}

export function CinematicWorkspace({
  visible,
  presentationProject,
  activeFilmId,
  filmTitleInput,
  doc,
  shot,
  selectedShot,
  selectedShotIndex,
  selectedShotNumber,
  totalSeconds,
  assets,
  library,
  tab,
  setTab,
  collections,
  libraryLayout,
  phonePreview,
  preview,
  motionPreview,
  backgroundCorrection,
  workspaceObjects,
  textPreviewId,
  setTextPreviewId,
  textPreviewBubble,
  previewDuration,
  selection,
  selectionIds,
  copiedObject,
  snap,
  setSnap,
  guides,
  setGuides,
  busy,
  locked,
  desktop,
  studioProjectPath,
  diagnostics,
  issueCount,
  modal,
  setModal,
  recentProjects,
  commitFocusedInput,
  notify,
  selectFilm,
  onChangeTitle,
  onOpenAudioModal,
  onCreateDocument,
  onOpenFilmsModal,
  onExportJpg,
  onStartPlayback,
  onRestartPlayback,
  onChooseLibrary,
  onRefreshLibrary,
  onLoadExample,
  onOpenProjectModal,
  onOpenRecents,
  onOpenRecent,
  onUseAsset,
  animatedElements,
  onAddBubble,
  onSelectGroup,
  onBatchUpdate,
  onSetSelection,
  onUpdateObject,
  onUpdateShot,
  onSelectShot,
  onMoveShotToIndex,
  onReorderShot,
  onFromTemplate,
  onAddShot,
  onGeneratePose,
  onOpenAnimationWorkshop,
  onGenerateAnimation,
  onSetCatalog,
  onStartMotionPreview,
  onStartTextPreview,
  onCopySelection,
  onPasteSelection,
  onAutoPlaceSelected,
  onRemoveSelection,
  onDuplicateSelection,
  onLayerDirection,
  onMoveBubble,
  onSelectAll,
  onReorderLayer,
  onAlignSelection,
  onFocusDiagnostic,
  onFixDiagnostic,
  onOpenLevelFromContinuity,
  onOpenCampaignStepFromContinuity,
}: CinematicWorkspaceProps) {
  const { playback, readyShot, advance } = preview;
  const activeDialogue =
    playback && !playback.finished && playback.elapsed >= shot.dialogueStart
      ? shot.bubbles[playback.dialogueIndex]
      : null;
  const awaitingShotClick =
    !!playback &&
    !playback.finished &&
    shot.endAdvance === "click" &&
    playback.elapsed >= shot.duration &&
    playback.dialogueIndex >= shot.bubbles.length &&
    playback.exitElapsed === undefined;

  return (
    <div
      style={visible ? undefined : { display: "none" }}
      className="app-shell"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <header className="topbar">
        <div className="project-heading">
          <div className="project-heading-main">
            {(presentationProject.cinematics?.length ?? 0) > 1 && (
              <select
                className="film-switcher"
                aria-label="Cinématique du projet"
                value={
                  presentationProject.cinematics?.some(
                    (f) => f.id === activeFilmId,
                  )
                    ? activeFilmId
                    : ""
                }
                onChange={(e) => selectFilm(e.target.value)}
              >
                <option value="">Choisir un film</option>
                {(presentationProject.cinematics ?? []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}{isContentArchived(presentationProject, "cinematics", f.id) ? " · Archivé" : ""}
                  </option>
                ))}
              </select>
            )}
            <input
              ref={filmTitleInput}
              aria-label="Titre de la cinématique"
              value={doc.title}
              maxLength={200}
              disabled={!!playback || locked}
              onChange={(e) => onChangeTitle(e.target.value)}
            />
          </div>
        </div>
        <div className="top-actions">
          <button
            className="button subtle"
            disabled={!!playback || locked}
            onClick={() => onOpenAudioModal()}
          >
            <Icon name="music" size={16} /> Son
          </button>
          <button
            className="button primary"
            disabled={!!playback || locked}
            onClick={onCreateDocument}
          >
            <Icon name="plus" size={15} /> Nouvelle cinématique
          </button>
          <button
            className="button subtle"
            disabled={!!playback || locked}
            onClick={onOpenFilmsModal}
          >
            Toutes les cinématiques{" "}
            <span className="film-count">
              {presentationProject.cinematics?.length ?? 0}
            </span>
          </button>
          <button
            className="button subtle"
            disabled={!!playback || locked || !desktop}
            title={
              desktop
                ? "Un JPG 1600 × 900 par plan, dans un dossier choisi"
                : "Disponible dans l’application de bureau"
            }
            onClick={onExportJpg}
          >
            Exporter en JPG
          </button>
          <div className="toolbar-divider" />
          {playback || preview.loading ? (
            <button className="button primary" onClick={preview.stop}>
              <Icon name="stop" size={16} /> Quitter l’aperçu
            </button>
          ) : (
            <div
              className="playback-actions"
              role="group"
              aria-label="Lecture de la cinématique"
            >
              <button
                className="button subtle"
                data-testid="play-all"
                disabled={locked}
                title="Lire toute la cinématique depuis le premier plan"
                onClick={() => onStartPlayback()}
              >
                <Icon name="play" size={16} /> Tout lire
              </button>
              <button
                className="button primary play-from-current"
                data-testid="play-from-current"
                disabled={locked}
                aria-label="Lire depuis ce plan"
                aria-keyshortcuts="Shift+Space"
                title={`Lire à partir du plan ${selectedShotNumber} — ${selectedShot.name}, puis les suivants (Maj+Espace)`}
                onClick={() => onStartPlayback(selectedShot.id)}
              >
                <Icon name="play" size={16} />
                <span>Lire depuis ce plan</span>
                <span className="play-from-number" aria-hidden="true">
                  {selectedShotNumber}
                </span>
              </button>
            </div>
          )}
          <button
            className="icon-button"
            title="Mode d’emploi"
            aria-label="Mode d’emploi"
            onClick={() => setModal("help")}
          >
            <Icon name="help" />
          </button>
        </div>
      </header>
      <main
        className="workspace"
        style={
          {
            "--library-width": `${libraryLayout.width}px`,
          } as React.CSSProperties
        }
      >
        <Library
          collections={collections}
          layout={libraryLayout}
          library={library}
          tab={tab}
          setTab={setTab}
          choose={onChooseLibrary}
          refresh={onRefreshLibrary}
          useAsset={onUseAsset}
          animatedElements={animatedElements}
          disabled={!!playback || locked}
          busy={busy}
        />
        <section className="workbench">
          <div className="scene-toolbar">
            <div className="scene-path">
              <span>{playback ? "APERÇU" : "SCÈNE"}</span>
              <Icon name="chevron" size={12} />
              <strong>{shot.name}</strong>
              <CinematicContinuityBar
                project={presentationProject}
                documentId={doc.id}
                disabled={!!playback || locked}
                onSelectFilm={selectFilm}
                onOpenLevel={onOpenLevelFromContinuity}
                onOpenCampaignStep={onOpenCampaignStepFromContinuity}
              />
            </div>
            <div className="scene-actions">
              <button
                className="button text"
                disabled={!!playback || locked}
                onClick={() => {
                  setTab("character");
                  notify(
                    "Glisse un PNG depuis la bibliothèque, ou double-clique sur un personnage.",
                  );
                }}
              >
                <Icon name="actor" size={16} />
                <span>Personnage</span>
              </button>
              <button
                className="button text"
                aria-label="Ajouter un ennemi"
                title="Ajouter un ennemi"
                disabled={!!playback || locked}
                onClick={() => {
                  setTab("enemy");
                  notify(
                    "Choisis un ennemi dans 03_enemies, ou glisse son image dans la scène.",
                  );
                }}
              >
                <Icon name="enemy" size={16} />
                <span>Ennemi</span>
              </button>
              <button
                className="button text"
                aria-label="Ajouter un objet de décoration"
                disabled={!!playback || locked}
                onClick={() => {
                  setTab("prop");
                  notify("Choisis un objet ou glisse son image dans la scène.");
                }}
              >
                <Icon name="prop" size={16} />
                <span>Objet</span>
              </button>
              <button
                className="button text"
                disabled={!!playback || locked}
                onClick={() => onAddBubble()}
              >
                <Icon name="bubble" size={16} /> Bulle
              </button>
              <button
                className="button text"
                aria-label="Ajouter une bulle de pensée"
                title="Ajouter une bulle de pensée"
                disabled={!!playback || locked}
                onClick={() => onAddBubble("thought")}
              >
                <Icon name="thought" size={16} /> Pensée
              </button>
              <button
                className="button text"
                disabled={!!playback || locked}
                onClick={() => onAddBubble("narration")}
              >
                <span className="text-symbol">T</span> Narration
              </button>
              <div className="toolbar-divider" />
            </div>
          </div>
          <div
            className="canvas-area"
            onPointerDownCapture={() => flushSync(commitFocusedInput)}
          >
            <div className="canvas-topline">
              <span>
                <span className="tiny-dot" />{" "}
                {playback
                  ? `Lecture · Plan ${String(playback.shotIndex + 1).padStart(2, "0")} / ${doc.shots.length}`
                  : "Composition du plan"}
              </span>
              <button
                className="button subtle background-correction-trigger"
                disabled={
                  locked ||
                  !!playback ||
                  !selectedShot.background.asset ||
                  !backgroundCorrection.available
                }
                title={
                  backgroundCorrection.available
                    ? "Adapter ce décor en 20:9 avec le Codex connecté sur cet ordinateur"
                    : "Relance le Studio pour activer la correction avec Codex"
                }
                onClick={() => {
                  const asset = assets.find(
                    (item) => item.ref === selectedShot.background.asset,
                  );
                  if (asset)
                    void backgroundCorrection.open({
                      documentId: doc.id,
                      shotId: selectedShot.id,
                      asset,
                    });
                }}
              >
                <Icon name="wand" size={14} /> Adapter en 20:9 (IA)
              </button>
              <PhoneFormatSelector
                format={phonePreview.format}
                onChange={phonePreview.setFormat}
              />
            </div>
            <div className="canvas-fit">
              <PhonePreview format={phonePreview.format}>
                <Scene
                  viewportWidth={phonePreview.width}
                  presentationRunning={
                    !!playback &&
                    !playback.paused &&
                    !playback.finished &&
                    readyShot === playback.shotIndex
                  }
                  presentationProject={presentationProject}
                  catalogMatches={
                    !doc.presentationCatalog ||
                    doc.presentationCatalog.projectId === presentationProject.id
                  }
                  key={shot.id}
                  previewBubbleId={
                    !playback && motionPreview.active
                      ? (textPreviewId ?? undefined)
                      : undefined
                  }
                  dialogueElapsed={playback?.dialogueElapsed}
                  textCompleted={playback?.textCompletedAt !== undefined}
                  motionTime={
                    motionPreview.active && !playback
                      ? motionPreview.time
                      : undefined
                  }
                  disabled={locked || motionPreview.active}
                  shot={shot}
                  assets={backgroundCorrection.assetsFor(
                    doc.id,
                    shot.id,
                    assets,
                  )}
                  selectionIds={selectionIds}
                  lockedIds={workspaceObjects.locked}
                  hiddenIds={workspaceObjects.hidden}
                  snap={snap}
                  onGroupSelect={onSelectGroup}
                  onBatchUpdate={onBatchUpdate}
                  selection={selection}
                  onSelect={onSetSelection}
                  onUpdate={onUpdateObject}
                  playing={!!playback}
                  elapsed={playback?.elapsed ?? 0}
                  exitElapsed={playback?.exitElapsed}
                  activeBubble={playback?.dialogueIndex ?? 0}
                  onAdvance={advance}
                  onDropAsset={(ref, as, position) => {
                    if (as === 'animated') {
                      void animatedElements.insert(ref, position);
                      return;
                    }
                    const asset = assets.find((a) => a.ref === ref);
                    if (asset)
                      void onUseAsset(
                        asset,
                        as ??
                          (asset.kind === "other" ? "character" : asset.kind),
                        position,
                      );
                  }}
                  guides={guides}
                />
                {!shot.background.asset &&
                  !shot.actors.length &&
                  !shot.bubbles.length &&
                  !playback && (
                    <div className="welcome">
                      <div className="welcome-symbol">
                        <Icon name="leaf" size={39} />
                      </div>
                      <span className="overline">
                        UN DÉCOR. QUELQUES MOTS. UNE HISTOIRE.
                      </span>
                      <h1>Donne vie à Lunaria.</h1>
                      <p>
                        Compose tes plans, place tes personnages et
                        <br />
                        laisse les bulles raconter la suite.
                      </p>
                      <div className="welcome-buttons">
                        <button
                          className="button primary"
                          onClick={onChooseLibrary}
                          disabled={locked}
                        >
                          <Icon name="folder" size={16} /> Choisir ma
                          bibliothèque
                        </button>
                        <button
                          className="button subtle"
                          onClick={onLoadExample}
                          disabled={locked}
                        >
                          Essayer l’exemple
                        </button>
                      </div>
                      <small>
                        Ou glisse simplement un décor dans ce cadre.
                      </small>
                      <button
                        className="link-button welcome-project-guide"
                        onClick={onOpenProjectModal}
                        disabled={locked}
                      >
                        Par où commencer ? Voir le projet →
                      </button>
                      {!!recentProjects.length && (
                        <div className="welcome-recents">
                          <div>
                            <strong>REPRENDRE UN PROJET</strong>
                            <button
                              className="link-button"
                              disabled={locked}
                              onClick={onOpenRecents}
                            >
                              Tout afficher <Icon name="chevron" size={12} />
                            </button>
                          </div>
                          {recentProjects.slice(0, 3).map((p) => (
                            <button
                              key={p.id}
                              className="welcome-recent"
                              disabled={locked}
                              title={p.path}
                              onClick={() => onOpenRecent(p.id)}
                            >
                              <Icon
                                name={p.pinned ? "pin" : "clock"}
                                size={14}
                              />
                              <span>
                                <strong>{p.title}</strong>
                                <small>{p.path.split(/[\\/]/).at(-1)}</small>
                              </span>
                              <Icon name="chevron" size={13} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                {playback?.finished && (
                  <div className="end-screen">
                    <Icon name="leaf" size={36} />
                    <h2>Fin de la cinématique</h2>
                    <div>
                      <button
                        className="button primary"
                        title="Rejouer depuis le même plan de départ"
                        onClick={onRestartPlayback}
                      >
                        <Icon name="play" size={16} /> Rejouer
                      </button>
                      <button
                        className="button subtle"
                        onClick={() => preview.stop()}
                      >
                        Retour à l’édition
                      </button>
                    </div>
                  </div>
                )}
                {(busy ||
                  (playback &&
                    !playback.finished &&
                    readyShot !== playback.shotIndex)) && (
                  <div className="busy-overlay">
                    <span className="spinner" /> Chargement…
                  </div>
                )}
              </PhonePreview>
            </div>
            <BackgroundCorrectionStatus correction={backgroundCorrection} />
            <div className="canvas-bottomline">
              {playback ? (
                <>
                  <button
                    className="icon-button"
                    aria-label={playback.paused ? "Reprendre" : "Pause"}
                    disabled={
                      playback.finished || readyShot !== playback.shotIndex
                    }
                    onClick={preview.togglePause}
                  >
                    <Icon
                      name={playback.paused ? "play" : "pause"}
                      size={16}
                    />
                  </button>
                  <span className="timecode">
                    {playback.exitElapsed !== undefined
                      ? `${shot.exitTransition?.type === "fade" ? "Fondu" : "Fondu sonore"} ${playback.exitElapsed.toFixed(1)} / ${(playback.exitDuration ?? shot.exitTransition?.duration ?? 0).toFixed(1)} s`
                      : `${Math.min(playback.elapsed, shot.duration).toFixed(1)} / ${shot.duration.toFixed(1)} s`}
                  </span>
                  <div className="playback-progress">
                    <i
                      style={{
                        width: `${playback.exitElapsed !== undefined ? Math.min(100, (playback.exitElapsed / Math.max(0.01, playback.exitDuration ?? shot.exitTransition?.duration ?? 0)) * 100) : Math.min(100, (playback.elapsed / shot.duration) * 100)}%`,
                      }}
                    />
                  </div>
                  <button
                    className="continue-button"
                    disabled={
                      (!activeDialogue && !awaitingShotClick) ||
                      playback.paused ||
                      readyShot !== playback.shotIndex
                    }
                    onClick={advance}
                  >
                    {activeDialogue &&
                    textNeedsCompletion(
                      activeDialogue,
                      playback.dialogueElapsed,
                      playback.textCompletedAt,
                    )
                      ? "Afficher tout le texte"
                      : activeDialogue?.advance.mode === "click"
                        ? "Cliquer pour continuer"
                        : activeDialogue
                          ? "Réplique suivante"
                          : awaitingShotClick &&
                              shot.exitTransition?.type === "fade"
                            ? "Lancer le fondu vers le noir"
                            : awaitingShotClick
                              ? playback.shotIndex + 1 < doc.shots.length
                                ? "Passer au plan suivant"
                                : "Terminer la cinématique"
                              : playback.finished
                                ? "Lecture terminée"
                                : playback.exitElapsed !== undefined
                                  ? "Fondu de sortie"
                                  : "Plan en cours"}{" "}
                    <kbd>ESPACE</kbd>
                  </button>
                </>
              ) : (
                <>
                  <span>
                    <Icon name="camera" size={14} />{" "}
                    {cameraLabels[shot.camera.preset]}
                  </span>
                  <span className="canvas-hint">
                    Maj + clic : sélection multiple · Alt : sans aimant
                  </span>
                  <button
                    className={`icon-button ${snap ? "toggled" : ""}`}
                    aria-label="Alignement magnétique"
                    title="Alignement magnétique · Alt pour désactiver pendant le glissement"
                    aria-pressed={snap}
                    onClick={() => setSnap(!snap)}
                  >
                    <Icon name="magnet" size={16} />
                  </button>
                  <button
                    className={`icon-button ${guides ? "toggled" : ""}`}
                    title="Afficher les repères"
                    aria-label="Afficher les repères"
                    onClick={() => setGuides(!guides)}
                  >
                    <Icon name="grid" size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
          {!playback && (
            <div
              className={`motion-preview-bar ${motionPreview.active ? "active" : ""}`}
            >
              <button
                className="button text"
                aria-label={
                  motionPreview.active
                    ? motionPreview.running
                      ? "Pause des mouvements"
                      : "Reprendre les mouvements"
                    : "Aperçu des mouvements"
                }
                disabled={locked}
                onClick={() => {
                  if (!motionPreview.active) setTextPreviewId(null);
                  motionPreview.toggle();
                }}
              >
                <Icon
                  name={motionPreview.running ? "pause" : "motion"}
                  size={15}
                />
                <span>
                  {motionPreview.active
                    ? textPreviewBubble
                      ? "Réplique animée"
                      : "Animations"
                    : "Aperçu des animations"}
                </span>
              </button>
              {motionPreview.active ? (
                <>
                  <input
                    type="range"
                    aria-label="Temps de l’aperçu des mouvements"
                    min={0}
                    max={previewDuration}
                    step={0.01}
                    value={motionPreview.time}
                    onChange={(e) => motionPreview.seek(+e.target.value)}
                  />
                  <output>
                    {motionPreview.time.toFixed(1)} /{" "}
                    {previewDuration.toFixed(1)} s
                  </output>
                  <button className="button subtle" onClick={motionPreview.stop}>
                    Retour au placement
                  </button>
                </>
              ) : (
                <small>
                  Teste les effets sans audio ni déroulement des dialogues.
                </small>
              )}
            </div>
          )}
          <StoryboardStrip
            doc={doc}
            shot={shot}
            selectedShot={selectedShot}
            selectedShotIndex={selectedShotIndex}
            selectedShotNumber={selectedShotNumber}
            totalSeconds={totalSeconds}
            assets={assets}
            playing={!!playback}
            locked={locked}
            onSelectShot={onSelectShot}
            onMoveShotToIndex={onMoveShotToIndex}
            onReorderShot={onReorderShot}
            onContinueShot={onFromTemplate}
            onPlayFromCurrent={() => onStartPlayback(selectedShot.id)}
            onAddShot={onAddShot}
          />
        </section>
        <Inspector
          generatePose={onGeneratePose}
          openAnimationWorkshop={onOpenAnimationWorkshop}
          generateAnimation={onGenerateAnimation}
          editAudio={onOpenAudioModal}
          presentationProject={presentationProject}
          setCatalog={onSetCatalog}
          previewMotion={onStartMotionPreview}
          previewText={onStartTextPreview}
          doc={doc}
          shot={shot}
          selection={playback ? { kind: "shot" } : selection}
          multiCount={playback ? 0 : selectionIds.length}
          objectLocked={
            !playback &&
            selectionIds.length === 1 &&
            workspaceObjects.locked.has(selectionIds[0])
          }
          copiedKind={copiedObject?.kind}
          copiedName={
            copiedObject?.kind === "actor"
              ? copiedObject.actor.name
              : undefined
          }
          copySelection={onCopySelection}
          pasteSelection={onPasteSelection}
          autoPlace={onAutoPlaceSelected}
          assets={assets}
          disabled={!!playback || locked}
          updateShot={onUpdateShot}
          updateObject={onUpdateObject}
          select={onSetSelection}
          remove={onRemoveSelection}
          duplicate={onDuplicateSelection}
          layer={onLayerDirection}
          moveBubble={onMoveBubble}
        >
          {!playback && (
            <Layers
              shot={shot}
              selectedIds={selectionIds}
              select={onSetSelection}
              selectAll={onSelectAll}
              locked={workspaceObjects.locked}
              hidden={workspaceObjects.hidden}
              toggle={(kind, id) => workspaceObjects.change(kind, id)}
              reorder={onReorderLayer}
              align={onAlignSelection}
              disabled={locked}
            />
          )}
        </Inspector>
      </main>
      <footer className="statusbar">
        <div>
          <Icon name="leaf" size={12} />
          <span title={studioProjectPath}>
            {studioProjectPath
              ? studioProjectPath.split(/[\\/]/).pop()
              : "Projet Lunaria non enregistré"}
          </span>
        </div>
        <button
          className={issueCount ? "has-warnings" : ""}
          onClick={() => setModal("issues")}
        >
          <Icon name={issueCount ? "warning" : "check"} size={13} />
          {issueCount
            ? `${issueCount} point(s) à vérifier`
            : "Aucune alerte détectée"}
        </button>
      </footer>
      {backgroundCorrection.opened && (
        <BackgroundCorrectionDialog correction={backgroundCorrection} />
      )}
      {modal && (
        <CinematicHelpModal
          modal={modal}
          busy={busy}
          playing={!!playback}
          diagnostics={diagnostics}
          onClose={() => setModal(null)}
          onFocusDiagnostic={onFocusDiagnostic}
          onFixDiagnostic={onFixDiagnostic}
          onChooseLibrary={onChooseLibrary}
        />
      )}
    </div>
  );
}
