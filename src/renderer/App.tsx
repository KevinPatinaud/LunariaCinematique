import {
  ProjectSessionProvider,
  useProjectSession,
} from "./project/ProjectSessionContext.js";
import {
  ProjectControls,
  ProjectFilesDialog,
  ProjectRecovery,
} from "./project/ProjectControls.js";
import { ProjectConflictDialog } from "./project/ProjectConflictDialog.js";
import { newId } from "../shared/game/types.js";
import type { CampaignFilm } from "../shared/game/types.js";
import { cinematicReferences } from "../shared/game/cinematicManagement.js";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { ProjectOverview } from "./components/ProjectOverview.js";
import { CinematicsBrowser } from "./components/CinematicsBrowser.js";
import { GameEditor, type GameEditorHandle } from "./game/GameEditor.js";
import {
  textIntroDuration,
  textNeedsCompletion,
} from "../shared/textAnimation.js";
import { api } from "./browserBridge.js";
import { ImageCache } from "./images.js";
import { useMotionPreview } from "./hooks/useMotionPreview.js";
import { useLibraryLayout } from "./hooks/useLibraryLayout.js";
import { Library, type LibraryTab } from "./components/Library.js";
import { LibraryPickerContext } from "./components/LibraryPickerContext.js";
import { Inspector, cameraLabels } from "./components/Inspector.js";
import { Scene, type Selection } from "./components/Scene.js";
import {
  PhoneFormatSelector,
  PhonePreview,
  usePhonePreview,
} from "./components/PhonePreview.js";
import {
  BackgroundCorrectionDialog,
  BackgroundCorrectionStatus,
  useBackgroundCorrection,
} from "./components/BackgroundCorrection.js";
import { renderShotJpg } from "./exportJpg.js";
import { Layers } from "./components/Layers.js";
import { TemplateDialog, DuplicateDialog } from "./components/PlanDialogs.js";
import { Diagnostics } from "./components/Diagnostics.js";
import { useCollections } from "./hooks/useCollections.js";
import { useObjectWorkspace } from "./hooks/useObjectWorkspace.js";
import { diagnose, type Diagnostic } from "../shared/diagnostics.js";
import {
  alignObjects,
  applyObjectChanges,
  createTemplate,
  deleteObjects,
  duplicateObjects,
  moveObjects,
  pasteActor,
  pasteBubble,
  placeBubble,
  reorderObjects,
  smartDuplicate,
  type Alignment,
  type DuplicateOptions,
  type ObjectChange,
  type ObjectKind,
  type ShotTemplate,
} from "../shared/studio.js";
import { Icon } from "./components/Icon.js";
import {
  copy,
  duplicateCinematic,
  newActor,
  newBubble,
  newCinematic,
  referencedAssets,
  upgradeCinematicFormat,
  type Actor,
  type Asset,
  type Bubble,
  type Cinematic,
  type LibrarySnapshot,
  type Shot,
} from "../shared/model.js";
import { demoCinematic } from "../shared/demo.js";
import { validationIssues } from "../shared/schema.js";
import { clamp } from "../shared/geometry.js";
import { centeredObject } from "../shared/editing.js";
import { isAudio, isImage } from "../shared/assets.js";
import {
  advanceDialogue,
  beginPlayback,
  playbackStartIndex,
  tickPlayback,
  type Playback,
} from "../shared/playback.js";
import { repairAudioLinks, musicRange } from "../shared/cinematicAudio.js";
import { CinematicAudioPlayer } from "./audio/CinematicAudioPlayer.js";
import { AudioEditor } from "./components/AudioEditor.js";
import { ImageTasksProvider } from "./images/ImageTasksContext.js";
import { ImageTasks } from "./images/ImageTasks.js";

type CopiedObject =
  | { kind: "actor"; actor: Actor; catalog?: Cinematic["presentationCatalog"] }
  | { kind: "bubble"; bubble: Bubble; speaker?: Actor };

export default function App() {
  return (
    <ProjectSessionProvider>
      <ImageTasksProvider>
        <StudioApp />
      </ImageTasksProvider>
    </ProjectSessionProvider>
  );
}
function StudioApp() {
  const {
    session,
    project: presentationProject,
    busy: gameBusy,
    dirty: gameDirty,
    path: studioProjectPath,
    epoch,
    navigation,
    recent,
    message: projectMessage,
  } = useProjectSession();
  const [studioMode, setStudioMode] = useState<"cinematics" | "levels">(
    "cinematics",
  );
  const [selectedFilmId, setSelectedFilmId] = useState("");
  const gameEditor = useRef<GameEditorHandle>(null);
  const libraryLayout = useLibraryLayout();
  const phonePreview = usePhonePreview();
  const emptyFilm = useRef(newCinematic());
  const selectedFilm =
    presentationProject.cinematics?.find((f) => f.id === selectedFilmId) ??
    presentationProject.cinematics?.[0];
  const doc = selectedFilm ?? emptyFilm.current;
  const presentationUsages = useMemo(() => {
    const uses: Record<string, string[]> = {};
    for (const s of doc.shots)
      for (const a of s.actors)
        if (a.animation?.mode === "animation" && a.animation.animationId)
          (uses[a.animation.animationId] ??= []).push(
            "Film ouvert : " + doc.title + " / " + s.name + " / " + a.name,
          );
    return uses;
  }, [doc]);
  const filmReferences = useMemo(
    () =>
      Object.fromEntries(
        (presentationProject.cinematics ?? []).map((film) => [
          film.id,
          cinematicReferences(presentationProject, film.id),
        ]),
      ),
    [presentationProject],
  );
  const [library, setLibrary] = useState<LibrarySnapshot | null>(null),
    [tab, setTab] = useState<LibraryTab>("environment");
  const [shotId, setShotId] = useState(doc.shots[0].id),
    [selection, setPrimarySelection] = useState<Selection>({ kind: "shot" });
  const [selectionIds, setSelectionIds] = useState<string[]>([]);
  const selectionIdsRef = useRef(selectionIds);
  selectionIdsRef.current = selectionIds;
  const [copiedObject, setCopiedObject] = useState<CopiedObject | null>(null);
  const workspaceObjects = useObjectWorkspace();
  const [studioModal, setStudioModal] = useState<
    | "templates"
    | "duplicate"
    | "versions"
    | "recents"
    | "project"
    | "films"
    | "audio"
    | null
  >(null);
  const [audioAsset, setAudioAsset] = useState<Asset["ref"]>();
  const filmTitleInput = useRef<HTMLInputElement>(null);
  const recentProjects = {
    projects: recent.map((p) => ({
      id: p.path,
      path: p.path,
      title: p.title,
      lastUsedAt: p.updatedAt,
      pinned: false,
    })),
  };
  const [snap, setSnap] = useState(true);
  const [textPreviewId, setTextPreviewId] = useState<string | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(null),
    [guides, setGuides] = useState(false);
  const [busy, setBusy] = useState(true),
    [booted, setBooted] = useState(false),
    [toast, setToast] = useState("");
  const [modal, setModal] = useState<"help" | "issues" | null>(null);
  const [desktop, setDesktop] = useState(!!window.lunaria);
  const [readyShot, setReadyShot] = useState(-1),
    [playbackRun, setPlaybackRun] = useState(0);
  const docRef = useRef(doc);
  docRef.current = doc;
  const activeFilmId = useRef("");
  activeFilmId.current = selectedFilm?.id ?? "";
  const libraryRef = useRef(library);
  libraryRef.current = library;
  const currentShotRef = useRef(shotId);
  currentShotRef.current = shotId;
  const playbackRef = useRef(playback);
  playbackRef.current = playback;
  // Remember the origin of the last preview, not its last displayed plan.
  const playbackStartId = useRef<string | undefined>(undefined);
  const running = useRef(false),
    documentEpoch = useRef(0),
    readyShotRef = useRef(-1);
  const closeAction = useRef<() => void>(() => undefined);
  const filmAudio = useRef<CinematicAudioPlayer | null>(null);
  const assetCache = useRef(new ImageCache());
  const dirty = gameDirty;
  const assets = library?.assets ?? [];
  const assetRefs = useMemo(() => new Set(assets.map((a) => a.ref)), [library]);
  const selectedShot = doc.shots.find((s) => s.id === shotId) ?? doc.shots[0];
  const selectedShotIndex = doc.shots.findIndex(
    (s) => s.id === selectedShot.id,
  );
  const selectedShotNumber = String(
    playbackStartIndex(doc, selectedShot.id) + 1,
  ).padStart(2, "0");
  const textPreviewBubble = selectedShot.bubbles.find(
    (b) => b.id === textPreviewId,
  );
  const previewDuration = textPreviewBubble
    ? Math.max(
        4,
        textIntroDuration(textPreviewBubble) + 2,
        (textPreviewBubble.bubbleEntry?.duration ?? 0.3) + 2,
      )
    : selectedShot.duration;
  const motionPreview = useMotionPreview(
    `${documentEpoch.current}:${selectedShot.id}`,
    previewDuration,
    !!playback || busy || !!modal || !!studioModal,
  );
  const startMotionPreview = () => {
    setTextPreviewId(null);
    motionPreview.start();
  };
  const startTextPreview = (id: string) => {
    setTextPreviewId(id);
    motionPreview.start();
  };
  useEffect(() => {
    setTextPreviewId(null);
  }, [selectedShot.id]);
  const shot = playback
    ? (doc.shots[playback.shotIndex] ?? selectedShot)
    : selectedShot;
  const notify = useCallback((message: string) => setToast(message), []);
  useEffect(() => {
    if (projectMessage) notify(projectMessage);
  }, [projectMessage, notify]);
  const backgroundCorrection = useBackgroundCorrection(
    notify,
    (updated) => {
      libraryRef.current = updated;
      setLibrary(updated);
      assetCache.current.clear();
    },
    (target) => {
      const film =
        docRef.current.id === target.documentId
          ? docRef.current
          : presentationProject.cinematics?.find(
              (item) => item.id === target.documentId,
            );
      if (
        !film?.shots.some(
          (item) =>
            item.id === target.shotId &&
            item.background.asset === target.asset.ref,
        )
      ) {
        notify(
          "Le plan ou son décor a changé. Rouvre une correction pour ce plan.",
        );
        return false;
      }
      setPlayback(null);
      motionPreview.stop();
      setStudioMode("cinematics");
      selectFilm(target.documentId);
      selectShot(target.shotId);
      return true;
    },
    library?.rootPath ?? "",
  );
  const collections = useCollections(library?.rootPath ?? "", notify);
  const diagnostics = useMemo(
    () => diagnose(doc, assets, !!library),
    [doc, library],
  );
  const issueCount = diagnostics.filter((i) => i.severity !== "info").length;
  const errors = (error: unknown) =>
    notify(error instanceof Error ? error.message : String(error));
  function commitFocusedInput() {
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      active.matches('input,textarea,[contenteditable="true"]')
    )
      active.blur();
  }
  function setSelection(next: Selection, additive = false) {
    // A scene pointerdown changes selection before the browser dispatches blur.
    // Commit while the inspector still belongs to the original element.
    commitFocusedInput();
    if (next.kind === "shot") {
      selectionIdsRef.current = [];
      setSelectionIds([]);
      setPrimarySelection(next);
      return;
    }
    const ids = additive
      ? selectionIdsRef.current.includes(next.id)
        ? selectionIdsRef.current.filter((id) => id !== next.id)
        : [...selectionIdsRef.current, next.id]
      : [next.id];
    selectGroup(ids);
  }
  function selectGroup(ids: string[], additive = false) {
    commitFocusedInput();
    const source =
      docRef.current.shots.find((s) => s.id === currentShotRef.current) ??
      docRef.current.shots[0];
    const existing = new Set(
      [...source.actors, ...source.bubbles].map((o) => o.id),
    );
    const selected = [
      ...new Set(additive ? [...selectionIdsRef.current, ...ids] : ids),
    ].filter((id) => existing.has(id));
    selectionIdsRef.current = selected;
    setSelectionIds(selected);
    const id = selected.at(-1);
    setPrimarySelection(
      id
        ? {
            kind: source.actors.some((a) => a.id === id) ? "actor" : "bubble",
            id,
          }
        : { kind: "shot" },
    );
  }
  function selectAll() {
    selectGroup(
      [...selectedShot.actors, ...selectedShot.bubbles]
        .filter(
          (o) =>
            !workspaceObjects.locked.has(o.id) &&
            !workspaceObjects.hidden.has(o.id),
        )
        .map((o) => o.id),
    );
  }
  function editableIds() {
    return selectionIdsRef.current.filter(
      (id) => !workspaceObjects.locked.has(id),
    );
  }
  function commit(
    edit: (next: Cinematic) => void,
    key = "",
    label = "Modifier la cinématique",
  ) {
    const current = docRef.current;
    const nextId = session.editFilm(
      current.id,
      (next) => {
        edit(next);
        repairAudioLinks(next, current);
        upgradeCinematicFormat(next);
      },
      key,
      label,
      current,
    );
    if (nextId !== current.id) setSelectedFilmId(nextId);
    docRef.current =
      session.project.cinematics?.find((f) => f.id === nextId) ?? current;
  }
  function batchUpdate(
    changes: ObjectChange[],
    label = "Modifier la sélection",
    key = "",
  ) {
    if (playbackRef.current || running.current) return;
    const allowed = changes.filter((c) => !workspaceObjects.locked.has(c.id));
    if (!allowed.length) return;
    const id = selectedShot.id;
    commit(
      (d) => {
        const s = d.shots.find((s) => s.id === id);
        if (s) applyObjectChanges(s, allowed);
      },
      key,
      label,
    );
  }
  function alignSelection(alignment: Alignment) {
    batchUpdate(
      alignObjects(selectedShot, editableIds(), alignment),
      "Aligner la sélection",
    );
  }
  function reorderLayer(kind: ObjectKind, source: string, target: string) {
    if (
      playbackRef.current ||
      running.current ||
      workspaceObjects.locked.has(source)
    )
      return;
    commit(
      (d) => {
        const s = d.shots.find((s) => s.id === selectedShot.id);
        if (s) reorderObjects(s, kind, source, target);
      },
      "",
      kind === "actor" ? "Réordonner les calques" : "Réordonner les répliques",
    );
  }
  function updateShot(patch: Partial<Shot>, key = "") {
    const id = selectedShot.id;
    commit(
      (next) => {
        const found = next.shots.find((s) => s.id === id);
        if (found) Object.assign(found, patch);
      },
      key ? `${id}:${key}` : "",
    );
  }
  function updateObject(
    kind: "actor" | "bubble",
    id: string,
    patch: Partial<Actor> | Partial<Bubble>,
    key = "",
  ) {
    if (workspaceObjects.locked.has(id)) return;
    const shotId = selectedShot.id;
    commit(
      (next) => {
        const current = next.shots.find((s) => s.id === shotId);
        if (!current) return;
        applyObjectChanges(current, [{ kind, id, patch }]);
      },
      key ? `${shotId}:${id}:${key}` : "",
    );
  }
  function selectShot(id: string) {
    commitFocusedInput();
    currentShotRef.current = id;
    setShotId(id);
    setSelection({ kind: "shot" });
    session.boundary();
  }
  function replaceDocument(next: Cinematic) {
    commitFocusedInput();
    session.boundary();
    documentEpoch.current++;
    setSelectedFilmId(next.id);
    activeFilmId.current = next.id;
    docRef.current = next;
    selectShot(next.shots[0].id);
    setPlayback(null);
    playbackStartId.current = undefined;
    readyShotRef.current = -1;
    setReadyShot(-1);
  }
  useEffect(() => {
    emptyFilm.current = newCinematic();
    const first = session.project.cinematics?.[0];
    replaceDocument(first ?? emptyFilm.current);
  }, [epoch]);
  useEffect(() => {
    const loc = navigation?.location;
    if (!loc) return;
    commitFocusedInput();
    setStudioMode(loc.mode);
    if (loc.mode === "cinematics") {
      const film =
        session.project.cinematics?.find((f) => f.id === loc.filmId) ??
        session.project.cinematics?.[0];
      if (film) {
        replaceDocument(film);
        if (loc.shotId && film.shots.some((s) => s.id === loc.shotId))
          selectShot(loc.shotId);
      }
    }
  }, [navigation]);
  if (studioMode === "cinematics")
    session.setLocation({ mode: "cinematics", filmId: doc.id, shotId });
  async function operation<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (running.current || !booted) return;
    // Native close / Ctrl+S do not blur fields themselves. Commit numeric drafts
    // before reading docRef or deciding whether there are unsaved changes.
    commitFocusedInput();
    running.current = true;
    setBusy(true);
    try {
      return await fn();
    } catch (error) {
      errors(error);
      return undefined;
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  const save = () => operation(() => session.save());
  const exportJpg = () =>
    operation(async () => {
      const cinematic = copy(docRef.current);
      const exportAssets = libraryRef.current?.assets ?? [];
      const imageCache = new Map<string, string>();
      const linkedCatalog =
        !cinematic.presentationCatalog ||
        cinematic.presentationCatalog.projectId === presentationProject.id;
      const session = await api.beginJpgExport(
        cinematic.title,
        cinematic.shots.length,
      );
      if (!session) return;
      try {
        for (let index = 0; index < cinematic.shots.length; index++) {
          notify(`Export JPG : plan ${index + 1} / ${cinematic.shots.length}…`);
          const jpg = await renderShotJpg(
            cinematic.shots[index],
            exportAssets,
            presentationProject,
            linkedCatalog,
            imageCache,
          );
          await api.writeJpgFrame(session.id, index + 1, jpg);
        }
        const folder = await api.finishJpgExport(session.id);
        notify(
          `${cinematic.shots.length} JPG exporté${cinematic.shots.length > 1 ? "s" : ""} dans ${folder}`,
        );
      } catch (error) {
        await api.cancelJpgExport(session.id).catch(() => undefined);
        throw error;
      }
    });
  const closeRecents = () => setStudioModal(null);
  const openRecents = () => {
    setStudioModal("recents");
    void session.refreshRecent().catch(errors);
  };
  const openRecent = (path: string) =>
    operation(async () => {
      if (await session.open(path)) setStudioModal(null);
    });
  const createDocument = () =>
    operation(async () => {
      const next = newCinematic();
      next.id = newId("CIN");
      session.upsertFilm(next);
      replaceDocument(next);
      requestAnimationFrame(() => {
        filmTitleInput.current?.focus();
        filmTitleInput.current?.select();
      });
    });
  function selectFilm(id: string) {
    commitFocusedInput();
    const film = presentationProject.cinematics?.find((item) => item.id === id);
    if (film && film.id !== activeFilmId.current) replaceDocument(copy(film));
  }
  const duplicateFilm = (id: string) =>
    operation(async () => {
      const films = presentationProject.cinematics ?? [];
      if (films.length >= 500)
        throw new Error(
          "Ce projet contient déjà le maximum de 500 cinématiques.",
        );
      const source =
        id === activeFilmId.current
          ? docRef.current
          : films.find((film) => film.id === id);
      if (!source) throw new Error("Cinématique introuvable.");
      const duplicate = duplicateCinematic(
        source,
        films.map((film) => film.title),
      );
      session.upsertFilm(duplicate);
      replaceDocument(duplicate);
      setStudioModal(null);
      notify(
        `« ${duplicate.title} » créée. Enregistre le projet pour conserver la copie.`,
      );
      requestAnimationFrame(() => {
        filmTitleInput.current?.focus();
        filmTitleInput.current?.select();
      });
    });
  function updateFilm(id: string, patch: Partial<Cinematic>) {
    const film = presentationProject.cinematics?.find((item) => item.id === id);
    if (!film) return;
    if (id === activeFilmId.current)
      commit(
        (next) => {
          Object.assign(next, patch);
          if (patch.category === "") delete next.category;
        },
        "",
        "Modifier la cinématique",
      );
    else {
      const next = copy(film);
      Object.assign(next, patch);
      if (patch.category === "") delete next.category;
      session.upsertFilm(next);
    }
  }
  const deleteFilm = (id: string) =>
    operation(async () => {
      const films = presentationProject.cinematics ?? [];
      const film = films.find((item) => item.id === id);
      if (!film) return;
      const links = cinematicReferences(presentationProject, id);
      if (links.length) {
        notify(
          `Retire d’abord « ${film.title} » de ${links.join(", ")} dans Campagne / Niveaux.`,
        );
        return;
      }
      if (!(await api.confirmDelete(film.title))) return;
      session.removeFilm(id);
      if (id === activeFilmId.current) {
        const replacement = films.find((item) => item.id !== id);
        replaceDocument(copy(replacement ?? newCinematic()));
        if (!replacement) activeFilmId.current = "";
      }
      notify(
        `« ${film.title} » supprimée du projet. Enregistre pour confirmer la suppression dans le fichier.`,
      );
    });
  const backupCampaign = () =>
    operation(async () => {
      setStudioModal(null);
      notify("Sauvegarde complète en cours…");
      const result = await session.backup();
      notify(
        result
          ? `Sauvegarde complète créée : ${result.folder} · ${result.assets} ressources`
          : "Sauvegarde annulée.",
      );
    });
  const backupProject = () =>
    operation(async () => {
      if (!(await session.save(true))) return;
      setStudioModal(null);
      notify(
        "Copie du projet enregistrée. Ce nouveau fichier est maintenant le projet ouvert.",
      );
    });
  const chooseLibrary = () =>
    operation(async () => {
      const result = await api.chooseLibrary();
      if (result) {
        libraryRef.current = result;
        setLibrary(result);
        assetCache.current.clear();
        notify(`${result.assets.length} assets liés. Aucun fichier copié.`);
      }
    });
  const refreshLibrary = () =>
    operation(async () => {
      const result = await api.refreshLibrary();
      if (result) {
        setLibrary(result);
        assetCache.current.clear();
        notify("Bibliothèque actualisée.");
      }
    });
  const loadExample = () =>
    operation(async () => {
      const result = await api.exampleLibrary();
      setLibrary(result);
      libraryRef.current = result;
      const example = demoCinematic();
      example.id = newId("CIN");
      session.upsertFilm(example);
      replaceDocument(example);
      notify(
        "Exemple ajouté au projet. Les images restent dans la bibliothèque exemple.",
      );
    });
  const open = () =>
    operation(async () => {
      await session.open();
    });
  const openCampaignFilm = (film: CampaignFilm) =>
    operation(async () => {
      const embedded = presentationProject.cinematics?.find(
        (item) => item.id === film.documentId,
      );
      if (!embedded) throw new Error("Cette cinématique est absente du projet.");
      replaceDocument(copy(embedded));
      setPlayback(null);
      motionPreview.stop();
      setStudioMode("cinematics");
    });
  async function prepareCampaignPublish(): Promise<boolean> {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    return true;
  }
  closeAction.current = () => {
    void operation(async () => {
      if (await session.prepareClose()) await api.closeWindow();
    });
  };
  function addShot() {
    setStudioModal("templates");
  }
  function insertShot(next: Shot, label: string) {
    if (docRef.current.shots.length >= 500)
      return notify("Maximum 500 plans par cinématique.");
    commit(
      (d) =>
        d.shots.splice(
          d.shots.findIndex((s) => s.id === selectedShot.id) + 1,
          0,
          next,
        ),
      "",
      label,
    );
    selectShot(next.id);
    setStudioModal(null);
  }
  function fromTemplate(template: ShotTemplate, speakers: string[] = []) {
    try {
      const next = createTemplate(selectedShot, template, speakers);
      const frame = assets.find((a) =>
        a.path.endsWith("dialogue_panel_simple_v01.png"),
      );
      if (frame)
        for (const bubble of next.bubbles) {
          bubble.style = "simple";
          bubble.frameAsset = frame.ref;
          Object.assign(bubble, placeBubble(next, bubble));
        }
      insertShot(next, "Créer un plan : " + next.name);
    } catch (error) {
      errors(error);
    }
  }
  function duplicatePlan(options: DuplicateOptions) {
    insertShot(smartDuplicate(selectedShot, options), "Dupliquer le plan");
  }
  function focusDiagnostic(issue: Diagnostic) {
    if (!issue.shotId) return;
    selectShot(issue.shotId);
    if (issue.objectId && issue.kind) {
      workspaceObjects.change("hidden", issue.objectId, false);
      setSelection({ kind: issue.kind, id: issue.objectId });
    }
    setModal(null);
  }
  function fixDiagnostic(issue: Diagnostic) {
    if (!issue.shotId || !issue.objectId || !issue.kind) return;
    if (workspaceObjects.locked.has(issue.objectId))
      return notify("Déverrouille cet élément avant de le corriger.");
    commit(
      (d) => {
        const s = d.shots.find((s) => s.id === issue.shotId);
        if (!s) return;
        const object =
          issue.kind === "actor"
            ? s.actors.find((a) => a.id === issue.objectId)
            : s.bubbles.find((b) => b.id === issue.objectId);
        if (!object) return;
        if (issue.fix === "center")
          Object.assign(object, centeredObject(object));
        else if (issue.kind === "bubble")
          Object.assign(object, placeBubble(s, object as Bubble));
      },
      "",
      "Corriger : " + issue.message,
    );
  }
  function autoPlaceSelected() {
    if (selection.kind === "bubble")
      fixDiagnostic({
        id: "placement",
        severity: "info",
        message: "Placement de la bulle",
        shotId: selectedShot.id,
        objectId: selection.id,
        kind: "bubble",
        fix: "place-bubble",
      });
  }
  function addBubble(kind: Bubble["kind"] = "speech") {
    if (selectedShot.bubbles.length >= 100)
      return notify("Maximum 100 répliques par plan.");
    const speaker =
      selection.kind === "actor" &&
      selectedShot.actors.some((a) => a.id === selection.id)
        ? selection.id
        : null;
    let bubble = newBubble(speaker, kind);
    if (selectedShot.bubbles.length) {
      bubble.x = 0.13 + (selectedShot.bubbles.length % 3) * 0.16;
      bubble.y = 0.08 + (selectedShot.bubbles.length % 3) * 0.16;
    }
    const frame = assets.find(
      (a) =>
        a.path.endsWith("/dialogue_panel_simple_v01.png") ||
        a.path === "dialogue_panel_simple_v01.png",
    );
    if (frame) {
      bubble.style = "simple";
      bubble.frameAsset = frame.ref;
    }
    bubble = placeBubble(selectedShot, bubble);
    commit(
      (d) => {
        d.shots.find((s) => s.id === selectedShot.id)?.bubbles.push(bubble);
      },
      "",
      "Ajouter une bulle",
    );
    setSelection({ kind: "bubble", id: bubble.id });
  }
  async function useAsset(
    asset: Asset,
    as: LibraryTab,
    position?: { x: number; y: number },
  ): Promise<boolean> {
    if (playbackRef.current || running.current) return false;
    const targetId = selectedShot.id,
      epoch = documentEpoch.current,
      sourceRoot = libraryRef.current?.rootPath;
    if (as === "audio" ? !isAudio(asset.path) : !isImage(asset.path)) {
      notify("Ce type de ressource ne convient pas à cette action.");
      return false;
    }
    if (as === "environment") {
      updateShot({ background: { asset: asset.ref, fit: "cover" } });
      setSelection({ kind: "shot" });
    } else if (as === "audio") {
      setAudioAsset(asset.ref);
      setStudioModal("audio");
    } else if (as === "ui") {
      const style = asset.path.endsWith("dialogue_panel_simple_v01.png")
        ? "simple"
        : asset.path.endsWith("tooltip_ornate_v01.png")
          ? "ornate"
          : null;
      if (!style) {
        notify(
          "Pour ce PNG, utilise « Ajouter comme objet ». Les cadres extensibles reconnus sont Organique et Orné.",
        );
        return false;
      }
      const existing =
        selection.kind === "bubble"
          ? selectedShot.bubbles.find((b) => b.id === selection.id)
          : null;
      if (existing && workspaceObjects.locked.has(existing.id)) {
        notify("Déverrouille la bulle avant de changer son cadre.");
        return false;
      }
      if (existing)
        updateObject("bubble", existing.id, {
          style,
          frameAsset: asset.ref,
          autoHeight: true,
        });
      else {
        if (selectedShot.bubbles.length >= 100) {
          notify("Maximum 100 répliques par plan.");
          return false;
        }
        let bubble = newBubble();
        bubble.style = style;
        bubble.frameAsset = asset.ref;
        bubble = placeBubble(selectedShot, bubble);
        commit((d) => {
          d.shots.find((s) => s.id === targetId)?.bubbles.push(bubble);
        });
        setSelection({ kind: "bubble", id: bubble.id });
      }
    } else {
      try {
        const image = await assetCache.current.load(asset.url, asset.name);
        if (
          epoch !== documentEpoch.current ||
          sourceRoot !== libraryRef.current?.rootPath ||
          playbackRef.current ||
          running.current
        ) {
          notify("Insertion annulée : le projet ou la bibliothèque a changé.");
          return false;
        }
        const current = docRef.current.shots.find((s) => s.id === targetId);
        if (!current) {
          notify("Insertion annulée : le plan a été supprimé.");
          return false;
        }
        if (current.actors.length >= 50) {
          notify("Maximum 50 objets par plan.");
          return false;
        }
        const actor = newActor(
          asset,
          image.naturalWidth / image.naturalHeight,
          0.3 + (current.actors.length % 3) * 0.16,
          0.42,
          as === "enemy" ? "enemy" : as === "prop" ? "prop" : "character",
        );
        if (position) {
          actor.x = clamp(position.x - actor.width / 2, -1, 2);
          actor.y = clamp(position.y - actor.height / 2, -1, 2);
        }
        commit(
          (d) => {
            d.shots.find((s) => s.id === targetId)?.actors.push(actor);
          },
          "",
          as === "enemy"
            ? "Ajouter un ennemi"
            : as === "prop"
              ? "Ajouter un objet"
              : "Ajouter un personnage",
        );
        if (currentShotRef.current === targetId)
          setSelection({ kind: "actor", id: actor.id });
        else notify(`Objet ajouté au plan « ${current.name} ».`);
      } catch (error) {
        errors(error);
        return false;
      }
    }
    collections.use(asset.ref);
    return true;
  }
  function duplicate() {
    if (selection.kind === "shot") {
      setStudioModal("duplicate");
      return;
    }
    const ids = editableIds();
    if (!ids.length)
      return notify("Déverrouille la sélection avant de la dupliquer.");
    try {
      let added: string[] = [];
      commit(
        (d) => {
          const s = d.shots.find((s) => s.id === selectedShot.id);
          if (s) added = duplicateObjects(s, ids);
        },
        "",
        "Dupliquer la sélection",
      );
      selectGroup(added);
    } catch (error) {
      errors(error);
    }
  }
  function copySelection() {
    if (selectionIdsRef.current.length !== 1 || selection.kind === "shot")
      return;
    if (selection.kind === "actor") {
      const actor = selectedShot.actors.find((a) => a.id === selection.id);
      if (!actor) return;
      setCopiedObject({
        kind: "actor",
        actor: copy(actor),
        catalog: doc.presentationCatalog
          ? copy(doc.presentationCatalog)
          : undefined,
      });
      notify(`« ${actor.name} » copié. Choisis un autre plan, puis colle-le.`);
    } else {
      const bubble = selectedShot.bubbles.find((b) => b.id === selection.id);
      if (!bubble) return;
      const speaker = selectedShot.actors.find(
        (a) => a.id === bubble.speakerId,
      );
      setCopiedObject({
        kind: "bubble",
        bubble: copy(bubble),
        speaker: speaker ? copy(speaker) : undefined,
      });
      notify("Bulle copiée. Choisis un autre plan, puis colle-la.");
    }
  }
  function pasteSelection() {
    if (
      !copiedObject ||
      playbackRef.current ||
      running.current ||
      busy ||
      gameBusy
    )
      return;
    try {
      let added: { kind: "actor" | "bubble"; id: string } | undefined;
      const shotId = selectedShot.id;
      commit(
        (d) => {
          const target = d.shots.find((s) => s.id === shotId);
          if (!target) return;
          if (copiedObject.kind === "actor") {
            if (
              copiedObject.actor.animation &&
              copiedObject.catalog &&
              !d.presentationCatalog
            )
              d.presentationCatalog = copy(copiedObject.catalog);
            added = {
              kind: "actor",
              id: pasteActor(target, copiedObject.actor).id,
            };
          } else
            added = {
              kind: "bubble",
              id: pasteBubble(target, copiedObject.bubble, copiedObject.speaker)
                .id,
            };
        },
        "",
        copiedObject.kind === "actor"
          ? "Coller le personnage"
          : "Coller la bulle",
      );
      if (added) {
        setSelection(added);
        notify(
          copiedObject.kind === "actor"
            ? `« ${copiedObject.actor.name} » collé à la même position et à la même taille.`
            : "Bulle collée à la même position et à la même taille.",
        );
      }
    } catch (error) {
      errors(error);
    }
  }
  function remove() {
    if (selection.kind === "shot") {
      if (doc.shots.length === 1) return;
      void operation(async () => {
        if (!(await api.confirmDelete(selectedShot.name))) return;
        const index = docRef.current.shots.findIndex(
          (s) => s.id === selectedShot.id,
        );
        commit((d) => {
          d.shots = d.shots.filter((s) => s.id !== selectedShot.id);
        });
        selectShot(docRef.current.shots[Math.max(0, index - 1)].id);
      });
    } else {
      const ids = editableIds();
      if (!ids.length)
        return notify("Déverrouille la sélection avant de la supprimer.");
      commit(
        (d) => {
          const s = d.shots.find((s) => s.id === selectedShot.id);
          if (s) deleteObjects(s, ids);
        },
        "",
        "Supprimer la sélection",
      );
      setSelection({ kind: "shot" });
    }
  }
  function layer(direction: number) {
    if (selection.kind !== "actor" || workspaceObjects.locked.has(selection.id))
      return;
    const actors = [...selectedShot.actors],
      i = actors.findIndex((a) => a.id === selection.id),
      j = i + direction;
    if (i >= 0 && j >= 0 && j < actors.length) {
      [actors[i], actors[j]] = [actors[j], actors[i]];
      updateShot({ actors });
    }
  }
  function moveBubble(id: string, direction: number) {
    if (workspaceObjects.locked.has(id)) return;
    const bubbles = [...selectedShot.bubbles],
      i = bubbles.findIndex((b) => b.id === id),
      j = i + direction;
    if (i >= 0 && j >= 0 && j < bubbles.length) {
      [bubbles[i], bubbles[j]] = [bubbles[j], bubbles[i]];
      updateShot({ bubbles });
    }
  }
  function moveShotToIndex(source: string, index: number) {
    const shots = docRef.current.shots;
    const from = shots.findIndex((s) => s.id === source);
    if (
      from < 0 ||
      index < 0 ||
      index >= shots.length ||
      from === index ||
      playbackRef.current ||
      running.current
    )
      return;
    commit(
      (d) => {
        const [moving] = d.shots.splice(from, 1);
        d.shots.splice(index, 0, moving);
      },
      "",
      "Déplacer le plan",
    );
    requestAnimationFrame(() => {
      const card = [
        ...document.querySelectorAll<HTMLButtonElement>(".shot-card"),
      ].find((button) => button.dataset.shotId === source);
      card?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }
  function reorderShot(source: string, target: string) {
    moveShotToIndex(
      source,
      docRef.current.shots.findIndex((s) => s.id === target),
    );
  }
  async function preloadShot(index: number) {
    const refs = referencedAssets({
      ...docRef.current,
      shots: docRef.current.shots.slice(index, index + 2),
    });
    const toLoad =
      libraryRef.current?.assets.filter(
        (a) => refs.includes(a.ref) && isImage(a.path),
      ) ?? [];
    await Promise.all(
      toLoad.map((a) => assetCache.current.load(a.url, a.name)),
    );
  }
  const startPlayback = (fromShotId?: string) =>
    operation(async () => {
      motionPreview.stop();
      const current = docRef.current;
      // Resolve by stable ID after committing pending edits; reordering cannot
      // leave a cached index pointing at a different plan.
      const index = playbackStartIndex(current, fromShotId);
      const needed = referencedAssets({
        ...current,
        shots: current.shots.slice(index),
      });
      if (
        needed.some((ref) => !assetRefs.has(ref)) ||
        validationIssues(current).length
      ) {
        setModal("issues");
        return;
      }
      await preloadShot(index);
      playbackStartId.current = current.shots[index]?.id;
      readyShotRef.current = index;
      setReadyShot(index);
      setPlaybackRun((n) => n + 1);
      setPlayback(beginPlayback(index));
    });
  const advance = () =>
    setPlayback((current) =>
      current && readyShotRef.current === current.shotIndex
        ? advanceDialogue(docRef.current, current)
        : current,
    );
  useEffect(() => {
    let live = true;
    api
      .bootstrap()
      .then((result) => {
        if (live) {
          libraryRef.current = result.library;
          setLibrary(result.library);
          setDesktop(result.desktop);
        }
      })
      .catch((error) => live && errors(error))
      .finally(() => {
        if (live) {
          setBooted(true);
          setBusy(false);
        }
      });
    const unsubscribe = api.onLibraryChanged((snapshot) => {
      if (live) {
        libraryRef.current = snapshot;
        setLibrary(snapshot);
      }
    });
    const close = api.onCloseRequested(() => closeAction.current());
    return () => {
      live = false;
      unsubscribe();
      close();
    };
  }, []);
  useEffect(() => {
    // Undo can remove the selected object or plan. Never keep a dangling selection.
    if (!doc.shots.some((s) => s.id === shotId)) {
      currentShotRef.current = doc.shots[0].id;
      setShotId(doc.shots[0].id);
      setSelection({ kind: "shot" });
    } else {
      const valid = new Set(
        [...selectedShot.actors, ...selectedShot.bubbles].map((o) => o.id),
      );
      const retained = selectionIdsRef.current.filter((id) => valid.has(id));
      if (retained.length !== selectionIdsRef.current.length)
        selectGroup(retained);
    }
  }, [doc, shotId, selection]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 9000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (booted) api.setDirty(gameDirty);
  }, [booted, gameDirty]);
  useEffect(() => {
    if (desktop || (!dirty && !gameDirty)) return;
    const listener = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [desktop, dirty, gameDirty]);
  useEffect(() => {
    if (!playback || playback.finished) return;
    let live = true;
    const index = playback.shotIndex;
    if (readyShotRef.current !== index) setReadyShot(-1);
    void preloadShot(index)
      .then(() => {
        if (live) {
          readyShotRef.current = index;
          setReadyShot(index);
        }
      })
      .catch((error) => {
        if (live) {
          setPlayback(null);
          errors(error);
        }
      });
    return () => {
      live = false;
    };
  }, [playback?.shotIndex, playbackRun, !!playback]);
  useEffect(() => {
    if (!playback) return;
    let frame = 0,
      last = performance.now();
    function tick(now: number) {
      const delta = (now - last) / 1000;
      last = now;
      setPlayback((state) =>
        state && state.shotIndex === readyShotRef.current && !document.hidden
          ? tickPlayback(docRef.current, state, delta)
          : state,
      );
      frame = requestAnimationFrame(tick);
    }
    const visibility = () => {
      last = performance.now();
      if (document.hidden) {
        setPlayback((s) => (s ? { ...s, paused: true } : s));
        notify("Aperçu mis en pause pendant que le studio était masqué.");
      }
    };
    document.addEventListener("visibilitychange", visibility);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [!!playback]);
  useEffect(() => {
    const player = new CinematicAudioPlayer(notify);
    filmAudio.current = player;
    return () => {
      player.stop();
      if (filmAudio.current === player) filmAudio.current = null;
    };
  }, [playbackRun, notify]);
  useEffect(() => {
    filmAudio.current?.sync(
      doc,
      playback,
      assets,
      readyShot === playback?.shotIndex,
    );
  }, [doc, playback, assets, readyShot]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (studioMode !== "cinematics") return;
      if (
        event.defaultPrevented ||
        event.isComposing ||
        (event.repeat && !event.key.startsWith("Arrow"))
      )
        return;
      const target = event.target as HTMLElement;
      const input = target?.closest(
        'input,textarea,select,[contenteditable="true"]',
      );
      if (modal || document.querySelector("dialog[open]")) {
        if (event.key === "Escape" && !busy) setModal(null);
        return;
      }
      if (event.key === "Escape" && motionPreview.active) {
        motionPreview.stop();
        return;
      }
      if (event.key === "Escape") {
        if (playback) setPlayback(null);
        else setSelection({ kind: "shot" });
        return;
      }
      if (input || busy || gameBusy) return;
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !playback &&
        event.key.toLowerCase() === "c" &&
        selection.kind !== "shot" &&
        selectionIdsRef.current.length === 1 &&
        !target?.closest("[data-library-surface]")
      ) {
        event.preventDefault();
        copySelection();
        return;
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !playback &&
        event.key.toLowerCase() === "v" &&
        copiedObject &&
        !target?.closest("[data-library-surface]")
      ) {
        event.preventDefault();
        pasteSelection();
        return;
      }
      // Works directly after clicking a storyboard card, while plain Space
      // retains native button activation and its existing full-preview shortcut.
      if (
        event.code === "Space" &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !playback
      ) {
        event.preventDefault();
        void startPlayback(currentShotRef.current);
        return;
      }
      if (motionPreview.active && !target?.closest("button,a")) {
        if (event.code === "Space") {
          event.preventDefault();
          motionPreview.toggle();
        }
        return;
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "a" &&
        !playback &&
        !target?.closest("[data-library-surface]")
      ) {
        event.preventDefault();
        selectAll();
        return;
      }
      if (
        !playback &&
        selectionIdsRef.current.length &&
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
          event.key,
        ) &&
        !target?.closest("[data-library-surface]") &&
        (!target?.closest("button") || target?.closest(".layer-row"))
      ) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        batchUpdate(
          moveObjects(
            selectedShot,
            editableIds(),
            event.key === "ArrowLeft"
              ? -step / 1600
              : event.key === "ArrowRight"
                ? step / 1600
                : 0,
            event.key === "ArrowUp"
              ? -step / 900
              : event.key === "ArrowDown"
                ? step / 900
                : 0,
          ),
          "Déplacer au clavier",
          `${selectedShot.id}:nudge`,
        );
        return;
      }
      // Focused buttons and library controls retain their native Space/Enter behavior.
      if (
        !event.ctrlKey &&
        !event.metaKey &&
        target?.closest("[data-library-surface]")
      )
        return;
      if (
        !event.ctrlKey &&
        !event.metaKey &&
        (event.code === "Space" || event.key === "Enter") &&
        target?.closest("button,a")
      )
        return;
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "d" &&
        !playback
      ) {
        event.preventDefault();
        duplicate();
      } else if (event.key === "Delete" && !playback) {
        event.preventDefault();
        remove();
      } else if (event.code === "Space") {
        event.preventDefault();
        if (playback) advance();
        else void startPlayback();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  });
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    const surface = document.querySelector<HTMLElement>(".modal");
    const focusables = () => [
      ...(surface?.querySelectorAll<HTMLElement>(
        'button:not([disabled]):not([hidden]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
      ) ?? []),
    ];
    const timer = setTimeout(() => focusables()[0]?.focus(), 0);
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const first = items[0],
        last = items[items.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !surface?.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !surface?.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", trap, true);
      previous?.focus();
    };
  }, [modal]);
  const totalSeconds = doc.shots.reduce((n, s) => n + s.duration, 0);
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
  const locked = busy || gameBusy;
  return (
    <div className="studio-root">
      <nav className="studio-modebar" aria-label="Modes du Studio">
        <b>LUNARIA STUDIO</b>
        <button
          className="studio-overview"
          disabled={locked || !!modal || !!studioModal || !!playback}
          onClick={() => setStudioModal("project")}
        >
          Vue du projet
        </button>
        <button
          className={studioMode === "cinematics" ? "active" : ""}
          aria-pressed={studioMode === "cinematics"}
          disabled={busy || !!modal || !!studioModal || gameBusy}
          onClick={() => {
            commitFocusedInput();
            session.boundary();
            setStudioMode("cinematics");
          }}
        >
          Cinématiques
        </button>
        <button
          className={studioMode === "levels" ? "active" : ""}
          aria-pressed={studioMode === "levels"}
          disabled={busy || !!modal || !!studioModal}
          onClick={() => {
            setPlayback(null);
            motionPreview.stop();
            commitFocusedInput();
            session.boundary();
            setStudioMode("levels");
          }}
        >
          Niveaux
        </button>
        <ProjectControls
          disabled={locked || !!modal || !!studioModal || !!playback}
          onBackup={() => void backupCampaign()}
        />
        <ImageTasks
          library={library}
          updateLibrary={(updated) => {
            libraryRef.current = updated;
            setLibrary(updated);
            assetCache.current.clear();
          }}
          notify={notify}
          disabled={locked || !!modal || !!studioModal || !!playback}
        />
      </nav>
      <ProjectRecovery />
      <ProjectConflictDialog />
      <div
        style={studioMode === "cinematics" ? undefined : { display: "none" }}
        className="app-shell"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">
              <Icon name="leaf" size={27} />
            </div>
            <div>
              <strong>LUNARIA</strong>
              <span>CINEMATIC STUDIO</span>
            </div>
            <span className="version-tag">V1.10</span>
          </div>
          <div className="project-heading">
            <div className="project-heading-main">
              {(presentationProject.cinematics?.length ?? 0) > 1 && (
                <select
                  className="film-switcher"
                  aria-label="Cinématique du projet"
                  value={
                    presentationProject.cinematics?.some(
                      (f) => f.id === activeFilmId.current,
                    )
                      ? activeFilmId.current
                      : ""
                  }
                  onChange={(e) => selectFilm(e.target.value)}
                >
                  <option value="">Choisir un film</option>
                  {(presentationProject.cinematics ?? []).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
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
                onChange={(e) =>
                  commit((d) => {
                    d.title = e.target.value;
                  }, "title")
                }
              />
            </div>
          </div>
          <div className="top-actions">
            <button
              className="button subtle"
              disabled={!!playback || locked}
              onClick={() => {
                setAudioAsset(undefined);
                setStudioModal("audio");
              }}
            >
              <Icon name="music" size={16} /> Son
            </button>
            <button
              className="button primary"
              disabled={!!playback || locked}
              onClick={createDocument}
            >
              <Icon name="plus" size={15} /> Nouvelle cinématique
            </button>
            <button
              className="button subtle"
              disabled={!!playback || locked}
              onClick={() => setStudioModal("films")}
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
              onClick={() => void exportJpg()}
            >
              Exporter en JPG
            </button>
            <div className="toolbar-divider" />
            {playback ? (
              <button
                className="button primary"
                onClick={() => setPlayback(null)}
              >
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
                  onClick={() => startPlayback()}
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
                  onClick={() => startPlayback(selectedShot.id)}
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
            choose={chooseLibrary}
            refresh={refreshLibrary}
            useAsset={useAsset}
            disabled={!!playback || locked}
            busy={busy}
          />
          <section className="workbench">
            <div className="scene-toolbar">
              <div className="scene-path">
                <span>{playback ? "APERÇU" : "SCÈNE"}</span>
                <Icon name="chevron" size={12} />
                <strong>{shot.name}</strong>
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
                    notify(
                      "Choisis un objet ou glisse son image dans la scène.",
                    );
                  }}
                >
                  <Icon name="prop" size={16} />
                  <span>Objet</span>
                </button>
                <button
                  className="button text"
                  disabled={!!playback || locked}
                  onClick={() => addBubble()}
                >
                  <Icon name="bubble" size={16} /> Bulle
                </button>
                <button
                  className="button text"
                  disabled={!!playback || locked}
                  onClick={() => addBubble("narration")}
                >
                  <span className="text-symbol">T</span> Narration
                </button>
                <div className="toolbar-divider" />
              </div>
            </div>
            {/* Finish the field's render before Scene starts a drag from this pointer. */}
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
                      doc.presentationCatalog.projectId ===
                        presentationProject.id
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
                    onGroupSelect={selectGroup}
                    onBatchUpdate={batchUpdate}
                    selection={selection}
                    onSelect={setSelection}
                    onUpdate={updateObject}
                    playing={!!playback}
                    elapsed={playback?.elapsed ?? 0}
                    exitElapsed={playback?.exitElapsed}
                    activeBubble={playback?.dialogueIndex ?? 0}
                    onAdvance={advance}
                    onDropAsset={(ref, as, position) => {
                      const asset = assets.find((a) => a.ref === ref);
                      if (asset)
                        void useAsset(
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
                            onClick={chooseLibrary}
                            disabled={locked}
                          >
                            <Icon name="folder" size={16} /> Choisir ma
                            bibliothèque
                          </button>
                          <button
                            className="button subtle"
                            onClick={loadExample}
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
                          onClick={() => setStudioModal("project")}
                          disabled={locked}
                        >
                          Par où commencer ? Voir le projet →
                        </button>
                        {!!recentProjects.projects.length && (
                          <div className="welcome-recents">
                            <div>
                              <strong>REPRENDRE UN PROJET</strong>
                              <button
                                className="link-button"
                                disabled={locked}
                                onClick={openRecents}
                              >
                                Tout afficher <Icon name="chevron" size={12} />
                              </button>
                            </div>
                            {recentProjects.projects.slice(0, 3).map((p) => (
                              <button
                                key={p.id}
                                className="welcome-recent"
                                disabled={locked}
                                title={p.path}
                                onClick={() => void openRecent(p.id)}
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
                          onClick={() => {
                            setPlayback(null);
                            void startPlayback(playbackStartId.current);
                          }}
                        >
                          <Icon name="play" size={16} /> Rejouer
                        </button>
                        <button
                          className="button subtle"
                          onClick={() => setPlayback(null)}
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
                      onClick={() =>
                        setPlayback((current) =>
                          current
                            ? { ...current, paused: !current.paused }
                            : current,
                        )
                      }
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
                    <button
                      className="button subtle"
                      onClick={motionPreview.stop}
                    >
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
                    disabled={!!playback || locked || selectedShotIndex === 0}
                    onClick={() =>
                      moveShotToIndex(selectedShot.id, selectedShotIndex - 1)
                    }
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Déplacer le plan vers la droite"
                    title="Avancer d’une position"
                    disabled={
                      !!playback ||
                      locked ||
                      selectedShotIndex === doc.shots.length - 1
                    }
                    onClick={() =>
                      moveShotToIndex(selectedShot.id, selectedShotIndex + 1)
                    }
                  >
                    →
                  </button>
                  <label>
                    Position{" "}
                    <select
                      aria-label="Position du plan sélectionné"
                      value={selectedShotIndex + 1}
                      disabled={!!playback || locked || doc.shots.length < 2}
                      onChange={(e) =>
                        moveShotToIndex(
                          selectedShot.id,
                          Number(e.target.value) - 1,
                        )
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
                  disabled={!!playback || locked}
                  onClick={() => fromTemplate("continue")}
                >
                  Continuer ce plan <Icon name="chevron" size={13} />
                </button>
                <button
                  className="link-button"
                  data-testid="storyboard-play-current"
                  disabled={!!playback || locked}
                  title={`Lire à partir du plan ${selectedShotNumber}, puis les suivants (Maj+Espace)`}
                  onClick={() => startPlayback(selectedShot.id)}
                >
                  <Icon name="play" size={13} /> Lire depuis ce plan
                </button>
              </div>
              <div className="storyboard-content">
                <div
                  className="shot-strip"
                  onDragOver={(e) => {
                    if (
                      e.dataTransfer.types.includes(
                        "application/x-lunaria-shot",
                      )
                    )
                      e.preventDefault();
                  }}
                  onDrop={(e) => {
                    if (e.target !== e.currentTarget) return;
                    const id = e.dataTransfer.getData(
                      "application/x-lunaria-shot",
                    );
                    if (id) reorderShot(id, doc.shots.at(-1)!.id);
                  }}
                >
                  {doc.shots.map((s, index) => (
                    <button
                      key={s.id}
                      className={`shot-card ${shot.id === s.id ? "active" : ""}`}
                      draggable={!playback && !locked}
                      disabled={!!playback || locked}
                      data-testid={`shot-card-${index}`}
                      data-shot-id={s.id}
                      onClick={() => selectShot(s.id)}
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "application/x-lunaria-shot",
                          s.id,
                        );
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        if (
                          e.dataTransfer.types.includes(
                            "application/x-lunaria-shot",
                          )
                        )
                          e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        reorderShot(
                          e.dataTransfer.getData("application/x-lunaria-shot"),
                          s.id,
                        );
                      }}
                    >
                      <div className="shot-thumbnail">
                        {assets.find((a) => a.ref === s.background.asset) ? (
                          <img
                            src={
                              assets.find((a) => a.ref === s.background.asset)!
                                .thumbnail
                            }
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
                        {(s.audio ||
                          s.sounds?.length ||
                          doc.musicTracks?.some((t) => {
                            const [a, b] = musicRange(
                              doc,
                              t.startShotId,
                              t.endShotId,
                            );
                            return index >= a && index <= b;
                          })) && (
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
                  ))}
                </div>
                <button
                  className="add-shot"
                  disabled={!!playback || locked}
                  onClick={addShot}
                >
                  <span>
                    <Icon name="plus" size={24} />
                  </span>
                  Ajouter un plan
                </button>
              </div>
            </section>
          </section>
          <Inspector
            editAudio={() => {
              setAudioAsset(undefined);
              setStudioModal("audio");
            }}
            presentationProject={presentationProject}
            setCatalog={(value) =>
              commit(
                (d) => {
                  d.presentationCatalog = value;
                  d.schemaVersion = 4;
                },
                "catalog-link",
                "Relier le catalogue partagé",
              )
            }
            previewMotion={startMotionPreview}
            previewText={startTextPreview}
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
            copySelection={copySelection}
            pasteSelection={pasteSelection}
            autoPlace={autoPlaceSelected}
            assets={assets}
            disabled={!!playback || locked}
            updateShot={updateShot}
            updateObject={updateObject}
            select={setSelection}
            remove={remove}
            duplicate={duplicate}
            layer={layer}
            moveBubble={moveBubble}
          >
            {!playback && (
              <Layers
                shot={shot}
                selectedIds={selectionIds}
                select={setSelection}
                selectAll={selectAll}
                locked={workspaceObjects.locked}
                hidden={workspaceObjects.hidden}
                toggle={(kind, id) => workspaceObjects.change(kind, id)}
                reorder={reorderLayer}
                align={alignSelection}
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
          <div
            className="modal-backdrop"
            onPointerDown={(e) => {
              if (e.target === e.currentTarget && !busy) setModal(null);
            }}
          >
            <section
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-label={
                modal === "help"
                  ? "Prendre en main le studio"
                  : "Vérification de la cinématique"
              }
            >
              <button
                disabled={busy}
                className="icon-button modal-close"
                aria-label="Fermer"
                onClick={() => setModal(null)}
              >
                <Icon name="close" />
              </button>
              {modal === "help" ? (
                <>
                  <span className="overline">LUNARIA CINEMATIC STUDIO</span>
                  <h2>Ton histoire, plan par plan.</h2>
                  <div className="help-step">
                    <b>01</b>
                    <div>
                      <h3>Connecte la bibliothèque commune.</h3>
                      <p>
                        Sélectionne le dossier qui contient les continents.
                        Garde personnages, objets (07_props) et bulles dans
                        cette même racine. L’enregistrement du projet conserve
                        les références ; « Sauvegarder la campagne… » copie
                        aussi ses images et sons.
                      </p>
                    </div>
                  </div>
                  <div className="help-step">
                    <b>02</b>
                    <div>
                      <h3>Compose un plan.</h3>
                      <p>
                        Double-clique sur un décor, puis glisse tes PNG dans la
                        scène. Sélectionne un personnage avant d’ajouter sa
                        bulle : la queue le suivra.
                      </p>
                    </div>
                  </div>
                  <div className="help-step">
                    <b>03</b>
                    <div>
                      <h3>Écris, puis regarde.</h3>
                      <p>
                        Sélectionne une vignette puis « Lire depuis ce plan » en
                        haut à droite (Maj+Espace hors saisie). La lecture
                        démarre au début de ce plan, puis poursuit les suivants.
                        « Tout lire » repart du premier plan. Échap revient au
                        plan sélectionné. Les bulles se lisent dans l’ordre
                        indiqué. Règle « Animation de la bulle » et « Animation
                        du texte », puis utilise « Tester la réplique ». Un
                        premier clic termine l’apparition du texte ; le suivant
                        passe à la réplique suivante. Pour un personnage, ennemi
                        ou objet, règle son entrée, ses Mouvements, sa
                        destination B et sa Disparition. Les boutons de test
                        donnent un aperçu avec curseur de temps.
                      </p>
                    </div>
                  </div>
                  <div className="help-step">
                    <b>04</b>
                    <div>
                      <h3>Enregistre le JSON.</h3>
                      <p>
                        Pour changer l’ordre, sélectionne un plan puis utilise
                        les flèches ou le menu Position au-dessus des vignettes.
                        Tu peux aussi faire glisser les plans. Ctrl+S enregistre
                        ; Ctrl+Z annule dans tout le projet. Le bouton
                        Historique montre les dernières actions. Le menu du
                        fichier donne accès aux projets récents et à Enregistrer
                        sous. Le dossier godot du projet contient le lecteur et
                        son guide d’intégration.
                      </p>
                    </div>
                  </div>
                  <button
                    className="button primary"
                    onClick={() => setModal(null)}
                  >
                    Commencer à créer
                  </button>
                </>
              ) : (
                <>
                  <Diagnostics
                    issues={diagnostics}
                    onFocus={focusDiagnostic}
                    onFix={fixDiagnostic}
                    disabled={busy || !!playback}
                  />
                  <div className="modal-actions">
                    <button
                      className="button subtle"
                      disabled={busy || !!playback}
                      onClick={() => {
                        setModal(null);
                        void chooseLibrary();
                      }}
                    >
                      Reconnecter la bibliothèque
                    </button>
                    <button
                      className="button primary"
                      onClick={() => setModal(null)}
                    >
                      Retour à la scène
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
        {studioModal === "recents" && (
          <ProjectFilesDialog onClose={closeRecents} />
        )}
        {studioModal === "audio" && (
          <AudioEditor
            doc={doc}
            shot={selectedShot}
            assets={assets}
            selection={selection}
            initialAsset={audioAsset}
            change={commit}
            onClose={() => setStudioModal(null)}
            onLibrary={() => {
              setStudioModal(null);
              void chooseLibrary();
            }}
            onPreview={() => {
              setStudioModal(null);
              void startPlayback(selectedShot.id);
            }}
          />
        )}
        {studioModal === "templates" && (
          <TemplateDialog
            shot={selectedShot}
            onCreate={fromTemplate}
            onClose={() => setStudioModal(null)}
            disabled={busy}
          />
        )}
        {studioModal === "duplicate" && (
          <DuplicateDialog
            onDuplicate={duplicatePlan}
            onClose={() => setStudioModal(null)}
            disabled={busy}
          />
        )}
      </div>
      {!!toast && (
        <div className="toast" role="status">
          <Icon name="leaf" size={18} />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Fermer le message"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {studioModal === "project" && (
        <ProjectOverview
          project={presentationProject}
          path={studioProjectPath}
          modified={gameDirty}
          libraryName={library?.rootPath.split(/[\\/]/).pop()}
          disabled={locked}
          onClose={() => setStudioModal(null)}
          onBackup={() => void backupCampaign()}
          onSave={() => {
            setStudioModal(null);
            void save();
          }}
          onLibrary={() => {
            setStudioModal(null);
            void chooseLibrary();
          }}
          onCreateFilm={() => {
            setStudioModal(null);
            setStudioMode("cinematics");
            void createDocument();
          }}
          onBrowseFilms={() => {
            setStudioModal("films");
            setStudioMode("cinematics");
          }}
          onCreateLevel={() => {
            setStudioModal(null);
            setStudioMode("levels");
            gameEditor.current?.createLevel();
          }}
          onLevels={() => {
            setStudioModal(null);
            setStudioMode("levels");
            gameEditor.current?.navigate("levels");
          }}
          onCampaign={() => {
            setStudioModal(null);
            setStudioMode("levels");
            gameEditor.current?.navigate("campaign");
          }}
          onHome={() => {
            setStudioModal(null);
            setStudioMode("levels");
            gameEditor.current?.navigate("home");
          }}
          onCharacters={() => {
            setStudioModal(null);
            setStudioMode("levels");
            gameEditor.current?.navigate("plants");
          }}
          onChecks={() => {
            setStudioModal(null);
            setStudioMode("levels");
            gameEditor.current?.showChecks();
          }}
        />
      )}
      {studioModal === "films" && (
        <CinematicsBrowser
          onBackupCampaign={() => void backupCampaign()}
          films={presentationProject.cinematics ?? []}
          activeId={activeFilmId.current}
          disabled={locked}
          references={filmReferences}
          onClose={() => setStudioModal(null)}
          onSelect={(id) => {
            selectFilm(id);
            setStudioModal(null);
          }}
          onCreate={() => {
            setStudioModal(null);
            void createDocument();
          }}
          onDuplicate={(id) => {
            void duplicateFilm(id);
          }}
          onRename={(id, title) => updateFilm(id, { title })}
          onCategory={(id, category) => updateFilm(id, { category })}
          onMove={(id, targetId, placement) =>
            session.moveFilm(id, targetId, placement)
          }
          onDelete={(id) => {
            void deleteFilm(id);
          }}
          onBackupProject={() => {
            void backupProject();
          }}
        />
      )}
      <LibraryPickerContext.Provider
        value={{
          library,
          choose: chooseLibrary,
          refresh: refreshLibrary,
          collections,
          layout: libraryLayout,
        }}
      >
        <section className="studio-game-host" hidden={studioMode !== "levels"}>
          <GameEditor
            assets={assets}
            externalUsages={presentationUsages}
            ref={gameEditor}
            active={studioMode === "levels"}
            onOpenFilm={openCampaignFilm}
            onBeforePublish={prepareCampaignPublish}
            onBackupCampaign={() => void backupCampaign()}
          />
        </section>
      </LibraryPickerContext.Provider>
    </div>
  );
}
