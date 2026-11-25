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
import { ProjectOverview } from "./components/ProjectOverview.js";
import { CinematicsBrowser } from "./components/CinematicsBrowser.js";
import {
  StudioNavigation,
  type GameSection,
} from "./components/StudioNavigation.js";
import { GameEditor, type GameEditorHandle } from "./game/GameEditor.js";
import { DeliveryMenu } from "./game/DeliveryMenu.js";
import { AndroidDeploymentStatus } from "./game/AndroidDeploymentStatus.js";
import { useProjectDelivery } from "./game/useProjectDelivery.js";
import { gameIssues } from "../shared/game/validation.js";
import { textIntroDuration } from "../shared/textAnimation.js";
import { api } from "./browserBridge.js";
import { ImageCache } from "./images.js";
import { useMotionPreview } from "./hooks/useMotionPreview.js";
import { useCinematicPlayback } from "./hooks/useCinematicPlayback.js";
import { useLibraryLayout } from "./hooks/useLibraryLayout.js";
import type { LibraryTab } from "./components/Library.js";
import { LibraryPickerContext } from "./components/LibraryPickerContext.js";
import type { Selection } from "./components/Scene.js";
import { usePhonePreview } from "./components/PhonePreview.js";
import { useBackgroundCorrection } from "./components/BackgroundCorrection.js";
import { renderShotJpg } from "./exportJpg.js";
import { TemplateDialog, DuplicateDialog } from "./components/PlanDialogs.js";
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
  upgradeCinematicFormat,
  type Actor,
  type Asset,
  type Bubble,
  type Cinematic,
  type LibrarySnapshot,
  type Shot,
} from "../shared/model.js";
import { demoCinematic } from "../shared/demo.js";
import { clamp } from "../shared/geometry.js";
import { centeredObject, proportionalSize } from "../shared/editing.js";
import { isAudio, isImage } from "../shared/assets.js";
import { playbackStartIndex } from "../shared/playback.js";
import { repairAudioLinks } from "../shared/cinematicAudio.js";
import { AudioEditor } from "./components/AudioEditor.js";
import { ImageTasksProvider } from "./images/ImageTasksContext.js";
import { ImageTasks } from "./images/ImageTasks.js";
import {
  PoseGenerationDialog,
  type PoseSelection,
} from "./images/PoseGenerationDialog.js";
import {
  AnimationGenerationDialog,
  type AnimationGenerationTarget,
} from "./images/AnimationGenerationDialog.js";
import { CharacterAnimationWorkshopDialog } from "./presentation/CharacterAnimationWorkshopDialog.js";
import { AnimatedElementEditor } from "./presentation/AnimatedElementEditor.js";
import { isElementClip, type ElementClip } from "../shared/presentation/animatedElements.js";
import { ensurePresentation } from "../shared/presentation/defaults.js";
import {
  CinematicWorkspace,
  type CopiedCinematicObject,
} from "./cinematics/CinematicWorkspace.js";

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
  const [gameSection, setGameSection] = useState<GameSection>("campaign");
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [showGameIssues, setShowGameIssues] = useState(false);
  const delivery = useProjectDelivery(session);
  const [selectedFilmId, setSelectedFilmId] = useState("");
  const [elementEditor, setElementEditor] = useState<{ id?: string; epoch: number; root?: string } | null>(null);
  const gameEditor = useRef<GameEditorHandle>(null);
  const libraryLayout = useLibraryLayout();
  const phonePreview = usePhonePreview();
  const emptyFilm = useRef(newCinematic());
  const selectedFilm =
    presentationProject.cinematics?.find((f) => f.id === selectedFilmId) ??
    presentationProject.cinematics?.[0];
  const doc = selectedFilm ?? emptyFilm.current;
  const [library, setLibrary] = useState<LibrarySnapshot | null>(null),
    [tab, setTab] = useState<LibraryTab>("environment");
  const [shotId, setShotId] = useState(doc.shots[0].id),
    [selection, setPrimarySelection] = useState<Selection>({ kind: "shot" });
  const [selectionIds, setSelectionIds] = useState<string[]>([]);
  const selectionIdsRef = useRef(selectionIds);
  selectionIdsRef.current = selectionIds;
  const [copiedObject, setCopiedObject] =
    useState<CopiedCinematicObject | null>(null);
  const workspaceObjects = useObjectWorkspace();
  const [studioModal, setStudioModal] = useState<
    | "templates"
    | "duplicate"
    | "versions"
    | "recents"
    | "project"
    | "films"
    | "audio"
    | "pose"
    | "animationWorkshop"
    | "animationGeneration"
    | null
  >(null);
  const filmReferences = useMemo(
    () =>
      studioModal === "films"
        ? Object.fromEntries(
            (presentationProject.cinematics ?? []).map((film) => [
              film.id,
              cinematicReferences(presentationProject, film.id),
            ]),
          )
        : {},
    [studioModal, presentationProject],
  );
  const [audioAsset, setAudioAsset] = useState<Asset["ref"]>();
  const [poseSelection, setPoseSelection] = useState<PoseSelection>();
  const [workshopSpeciesId, setWorkshopSpeciesId] = useState<string | undefined>();
  const [workshopAnimationId, setWorkshopAnimationId] = useState<string | undefined>();
  const [animationGenTarget, setAnimationGenTarget] = useState<AnimationGenerationTarget>();
  const filmTitleInput = useRef<HTMLInputElement>(null);
  const recentProjects = useMemo(
    () =>
      recent.map((p) => ({
        id: p.path,
        path: p.path,
        title: p.title,
        lastUsedAt: p.updatedAt,
        pinned: false,
      })),
    [recent],
  );
  const [snap, setSnap] = useState(true);
  const [textPreviewId, setTextPreviewId] = useState<string | null>(null);
  const [guides, setGuides] = useState(false);
  const [busy, setBusy] = useState(true),
    [booted, setBooted] = useState(false),
    [toast, setToast] = useState("");
  const [modal, setModal] = useState<"help" | "issues" | null>(null);
  const [desktop, setDesktop] = useState(!!window.lunaria);
  const docRef = useRef(doc);
  docRef.current = doc;
  const activeFilmId = useRef("");
  activeFilmId.current = selectedFilm?.id ?? "";
  const libraryRef = useRef(library);
  libraryRef.current = library;
  const currentShotRef = useRef(shotId);
  currentShotRef.current = shotId;
  const running = useRef(false),
    documentEpoch = useRef(0);
  const closeAction = useRef<() => void>(() => undefined);
  const assetCache = useRef(new ImageCache());
  const dirty = gameDirty;
  const assets = library?.assets ?? [];
  const notify = useCallback((message: string) => setToast(message), []);
  const preview = useCinematicPlayback({
    document: doc,
    project: presentationProject,
    library,
    contextKey: String(epoch),
    active: studioMode === "cinematics",
    cache: assetCache.current,
    notify,
  });
  const { playback } = preview;
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
  useEffect(() => {
    if (projectMessage && studioMode === "cinematics") notify(projectMessage);
  }, [projectMessage, studioMode, notify]);
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
      preview.stop();
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
    if (preview.isActive() || running.current) return;
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
      preview.isActive() ||
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
    const currentShot = selectedShot.id;
    commit(
      (next) => {
        const current = next.shots.find((s) => s.id === currentShot);
        if (!current) return;
        applyObjectChanges(current, [{ kind, id, patch }]);
      },
      key ? `${currentShot}:${id}:${key}` : "",
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
    preview.stop();
  }
  useEffect(() => {
    emptyFilm.current = newCinematic();
    const first = session.project.cinematics?.[0];
    replaceDocument(first ?? emptyFilm.current);
    setGameSection("campaign");
    setShowGameIssues(false);
  }, [epoch]);
  useEffect(() => {
    const loc = navigation?.location;
    if (!loc) return;
    commitFocusedInput();
    setStudioMode(loc.mode);
    if (loc.mode === "levels" && loc.section) {
      setGameSection(loc.section as GameSection);
    }
    if (loc.mode === "cinematics") {
      const film =
        session.project.cinematics?.find((f) => f.id === loc.filmId) ??
        session.project.cinematics?.[0];
      if (film) {
        if (film.id !== activeFilmId.current) replaceDocument(film);
        if (
          loc.shotId &&
          loc.shotId !== currentShotRef.current &&
          film.shots.some((s) => s.id === loc.shotId)
        )
          selectShot(loc.shotId);
      }
    }
  }, [navigation]);
  useEffect(() => {
    if (studioMode === "cinematics")
      session.setLocation({ mode: "cinematics", filmId: doc.id, shotId });
  }, [studioMode, session, doc.id, shotId]);
  async function operation<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (running.current || !booted) return;
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
      const exportSession = await api.beginJpgExport(
        cinematic.title,
        cinematic.shots.length,
      );
      if (!exportSession) return;
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
          await api.writeJpgFrame(exportSession.id, index + 1, jpg);
        }
        const folder = await api.finishJpgExport(exportSession.id);
        notify(
          `${cinematic.shots.length} JPG exporté${cinematic.shots.length > 1 ? "s" : ""} dans ${folder}`,
        );
      } catch (error) {
        await api.cancelJpgExport(exportSession.id).catch(() => undefined);
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
  const openCampaignFilm = (film: CampaignFilm) =>
    operation(async () => {
      const embedded = presentationProject.cinematics?.find(
        (item) => item.id === film.documentId,
      );
      if (!embedded) throw new Error("Cette cinématique est absente du projet.");
      replaceDocument(copy(embedded));
      preview.stop();
      motionPreview.stop();
      setStudioMode("cinematics");
    });
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
    elementId?: string,
  ): Promise<boolean> {
    if (preview.isActive() || running.current) return false;
    const targetId = selectedShot.id,
      currentEpoch = documentEpoch.current,
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
          currentEpoch !== documentEpoch.current ||
          sourceRoot !== libraryRef.current?.rootPath ||
          preview.isActive() ||
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
        const clip = elementId ? session.project.presentation?.animations.find(item => item.id === elementId) : undefined;
        if (elementId && (!isElementClip(clip) || clip.frames[0]?.asset !== asset.ref)) {
          notify("L’élément animé a changé pendant l’insertion.");
          return false;
        }
        const actor = newActor(
          asset,
          image.naturalWidth / image.naturalHeight,
          0.3 + (current.actors.length % 3) * 0.16,
          0.42,
          as === "enemy" ? "enemy" : as === "prop" || as === "animated" ? "prop" : "character",
        );
        if (isElementClip(clip)) {
          actor.name = clip.name;
          if (clip.element.placementHeight !== undefined) {
            Object.assign(actor, proportionalSize(actor.width, actor.height, clip.element.placementHeight / actor.height));
          }
          actor.animation = { mode: "animation", animationId: clip.id, speciesId: "", slot: "element", speed: 1,
            elementPlayback: { start: 0, loop: clip.loop } };
        }
        if (position) {
          const origin = clip?.element?.preset === "exhale" ? clip.element.pivot : { x: 0.5, y: 0.5 };
          actor.x = clamp(position.x - actor.width * origin.x, -1, 2);
          actor.y = clamp(position.y - actor.height * origin.y, -1, 2);
        }
        commit(
          (d) => {
            if (actor.animation?.elementPlayback) {
              const projectId = session.project.id;
              d.presentationCatalog = { projectId, file: d.presentationCatalog?.projectId === projectId ? d.presentationCatalog.file : "" };
            }
            d.shots.find((s) => s.id === targetId)?.actors.push(actor);
          },
          "",
          as === "animated" ? "Ajouter un élément animé" : as === "enemy"
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
  const elementClips = presentationProject.presentation?.animations.filter(isElementClip) ?? [];
  const editedElement = elementClips.find(clip => clip.id === elementEditor?.id);
  function saveAnimatedElement(clip: ElementClip, editing: boolean) {
    if (elementEditor?.epoch !== session.getSnapshot().epoch || elementEditor.root !== libraryRef.current?.rootPath
      || session.getSnapshot().busy || running.current || preview.isActive()) {
      throw Error("Le projet ou la bibliothèque a changé. Rouvre l’éditeur pour enregistrer.");
    }
    session.change(draft => {
      ensurePresentation(draft);
      const animations = draft.presentation!.animations;
      if (!editing) {
        if (animations.length >= 512) throw Error("Le catalogue contient déjà 512 animations.");
        animations.push(clip);
        return;
      }
      const index = animations.findIndex(item => item.id === clip.id && isElementClip(item));
      if (index < 0) throw Error("Cet élément animé a été supprimé du projet.");
      animations[index] = clip;
      for (const film of draft.cinematics ?? []) for (const shot of film.shots) for (const actor of shot.actors) {
        if (actor.animation?.elementPlayback && actor.animation.animationId === clip.id) actor.asset = clip.frames[0].asset;
      }
    }, "", editing ? "Modifier un élément animé" : "Créer un élément animé");
    setElementEditor(null);
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
      preview.isActive() ||
      running.current ||
      busy ||
      gameBusy
    )
      return;
    try {
      let added: { kind: "actor" | "bubble"; id: string } | undefined;
      const targetShotId = selectedShot.id;
      commit(
        (d) => {
          const target = d.shots.find((s) => s.id === targetShotId);
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
      preview.isActive() ||
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
  const startPlayback = (fromShotId?: string) =>
    operation(async () => {
      motionPreview.stop();
      if ((await preview.start(fromShotId)) === "invalid") setModal("issues");
    });
  const restartPlayback = () =>
    operation(async () => {
      motionPreview.stop();
      if ((await preview.restart()) === "invalid") setModal("issues");
    });
  const advance = preview.advance;
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

  const keyHandlerRef = useRef<(event: KeyboardEvent) => void>(() => undefined);
  keyHandlerRef.current = (event: KeyboardEvent) => {
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
      if (preview.isActive()) preview.stop();
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
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) &&
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
  useEffect(() => {
    const listener = (event: KeyboardEvent) => keyHandlerRef.current(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const totalSeconds = doc.shots.reduce((n, s) => n + s.duration, 0);
  const locked = busy || gameBusy;
  const gameValidationIssues = useMemo(
    () =>
      studioMode === "levels" || deliveryOpen || showGameIssues
        ? gameIssues(presentationProject)
        : [],
    [studioMode, deliveryOpen, showGameIssues, presentationProject],
  );
  const gameErrorCount = useMemo(
    () =>
      gameValidationIssues.filter((issue) => issue.severity === "error").length,
    [gameValidationIssues],
  );
  const openCinematicsMode = () => {
    commitFocusedInput();
    session.boundary();
    setStudioMode("cinematics");
  };
  const openGameSection = (nextSection: GameSection) => {
    preview.stop();
    motionPreview.stop();
    commitFocusedInput();
    session.boundary();
    setStudioMode("levels");
    gameEditor.current?.navigate(nextSection);
  };

  return (
    <div className="studio-root">
      <header className="studio-modebar">
        <button
          type="button"
          className="studio-overview"
          title={`Lunaria Studio V1.10 · ${studioProjectPath || presentationProject.title}`}
          disabled={locked || !!modal || !!studioModal || !!playback}
          onClick={() => setStudioModal("project")}
        >
          <Icon name="leaf" size={14} />
          <span>Vue du projet</span>
        </button>
        <StudioNavigation
          mode={studioMode}
          section={gameSection}
          levelCount={presentationProject.levels.length}
          cinematicCount={presentationProject.cinematics?.length ?? 0}
          disabled={locked || !!modal || !!studioModal}
          onSelectCinematics={openCinematicsMode}
          onSelectSection={openGameSection}
        />
        <div className="studio-bar-right">
          <ProjectControls
            disabled={locked || !!modal || !!studioModal || !!playback}
            onBackup={() => void backupCampaign()}
          />
          <DeliveryMenu
            busy={locked}
            disabled={locked || !!modal || !!studioModal || !!playback}
            errorCount={gameErrorCount}
            onOpenChange={setDeliveryOpen}
            onExecute={(action) => void delivery.execute(action)}
            onShowIssues={() => {
              preview.stop();
              motionPreview.stop();
              setStudioMode("levels");
              setShowGameIssues(true);
            }}
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
        </div>
      </header>
      {delivery.androidDeployment && (
        <AndroidDeploymentStatus
          state={delivery.androidDeployment}
          onClose={delivery.dismiss}
        />
      )}
      <ProjectRecovery />
      <ProjectConflictDialog />
      <CinematicWorkspace
        visible={studioMode === "cinematics"}
        presentationProject={presentationProject}
        activeFilmId={activeFilmId.current}
        filmTitleInput={filmTitleInput}
        doc={doc}
        shot={shot}
        selectedShot={selectedShot}
        selectedShotIndex={selectedShotIndex}
        selectedShotNumber={selectedShotNumber}
        totalSeconds={totalSeconds}
        assets={assets}
        library={library}
        tab={tab}
        setTab={setTab}
        collections={collections}
        libraryLayout={libraryLayout}
        phonePreview={phonePreview}
        preview={preview}
        motionPreview={motionPreview}
        backgroundCorrection={backgroundCorrection}
        workspaceObjects={workspaceObjects}
        textPreviewId={textPreviewId}
        setTextPreviewId={setTextPreviewId}
        textPreviewBubble={textPreviewBubble}
        previewDuration={previewDuration}
        selection={selection}
        selectionIds={selectionIds}
        copiedObject={copiedObject}
        snap={snap}
        setSnap={setSnap}
        guides={guides}
        setGuides={setGuides}
        busy={busy}
        locked={locked}
        desktop={desktop}
        studioProjectPath={studioProjectPath}
        diagnostics={diagnostics}
        issueCount={issueCount}
        modal={modal}
        setModal={setModal}
        recentProjects={recentProjects}
        commitFocusedInput={commitFocusedInput}
        notify={notify}
        selectFilm={selectFilm}
        onChangeTitle={(title) =>
          commit((d) => {
            d.title = title;
          }, "title")
        }
        onOpenAudioModal={() => {
          setAudioAsset(undefined);
          setStudioModal("audio");
        }}
        onCreateDocument={() => void createDocument()}
        onOpenFilmsModal={() => setStudioModal("films")}
        onExportJpg={() => void exportJpg()}
        onStartPlayback={(fromId) => void startPlayback(fromId)}
        onRestartPlayback={() => void restartPlayback()}
        onChooseLibrary={() => void chooseLibrary()}
        onRefreshLibrary={() => void refreshLibrary()}
        onLoadExample={() => void loadExample()}
        onOpenProjectModal={() => setStudioModal("project")}
        onOpenRecents={openRecents}
        onOpenRecent={(p) => void openRecent(p)}
        onUseAsset={useAsset}
        animatedElements={{
          clips: elementClips,
          open: (id) => setElementEditor({ id, epoch, root: library?.rootPath }),
          insert: async (id, position) => {
            const clip = session.project.presentation?.animations.find(item => item.id === id);
            const asset = libraryRef.current?.assets.find(item => item.ref === clip?.frames[0]?.asset);
            if (!isElementClip(clip) || !asset) {
              notify("Reconnecte l’image de base de cet élément dans la bibliothèque.");
              return false;
            }
            return useAsset(asset, "animated", position, id);
          },
        }}
        onAddBubble={addBubble}
        onSelectGroup={selectGroup}
        onBatchUpdate={batchUpdate}
        onSetSelection={setSelection}
        onUpdateObject={updateObject}
        onUpdateShot={updateShot}
        onSelectShot={selectShot}
        onMoveShotToIndex={moveShotToIndex}
        onReorderShot={reorderShot}
        onFromTemplate={fromTemplate}
        onAddShot={addShot}
        onGeneratePose={() => {
          if (selection.kind !== "actor") return;
          const actor = selectedShot.actors.find(
            (item) => item.id === selection.id,
          );
          if (!actor) return;
          setPoseSelection({
            actor: structuredClone(actor),
            documentId: doc.id,
            shotId: selectedShot.id,
            projectId: presentationProject.id,
            projectPath: session.getSnapshot().path,
          });
          setStudioModal("pose");
        }}
        onOpenAnimationWorkshop={(speciesId, animationId) => {
          setWorkshopSpeciesId(speciesId);
          setWorkshopAnimationId(animationId);
          setStudioModal("animationWorkshop");
        }}
        onGenerateAnimation={(speciesId, historyOnly) => {
          const actor = selection.kind === "actor"
            ? selectedShot.actors.find((item) => item.id === selection.id)
            : undefined;
          setAnimationGenTarget({
            speciesId,
            actor: actor ? structuredClone(actor) : undefined,
            documentId: actor ? doc.id : undefined,
            shotId: actor ? selectedShot.id : undefined,
            defaultPreset: "walk",
            scope: "cinematic",
            historyOnly,
          });
          setStudioModal("animationGeneration");
        }}
        onSetCatalog={(value) =>
          commit(
            (d) => {
              d.presentationCatalog = value;
              d.schemaVersion = 4;
            },
            "catalog-link",
            "Relier le catalogue partagé",
          )
        }
        onStartMotionPreview={startMotionPreview}
        onStartTextPreview={startTextPreview}
        onCopySelection={copySelection}
        onPasteSelection={pasteSelection}
        onAutoPlaceSelected={autoPlaceSelected}
        onRemoveSelection={remove}
        onDuplicateSelection={duplicate}
        onLayerDirection={layer}
        onMoveBubble={moveBubble}
        onSelectAll={selectAll}
        onReorderLayer={reorderLayer}
        onAlignSelection={alignSelection}
        onFocusDiagnostic={focusDiagnostic}
        onFixDiagnostic={fixDiagnostic}
        onOpenLevelFromContinuity={(levelId, tabName) => {
          preview.stop();
          motionPreview.stop();
          commitFocusedInput();
          session.boundary();
          setStudioMode("levels");
          gameEditor.current?.navigate("levels", levelId, tabName);
        }}
        onOpenCampaignStepFromContinuity={(stepId) => {
          preview.stop();
          motionPreview.stop();
          commitFocusedInput();
          session.boundary();
          setStudioMode("levels");
          gameEditor.current?.navigate("campaign", stepId);
        }}
      />
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
          onRenameTitle={(title) =>
            session.change(
              (draft) => {
                draft.title = title;
              },
              "title",
              "Renommer le projet",
            )
          }
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
        {elementEditor && elementEditor.epoch === epoch && (!elementEditor.id || editedElement) && (
          <AnimatedElementEditor key={elementEditor.id ?? "new"} value={editedElement} assets={assets}
            close={() => setElementEditor(null)} save={saveAnimatedElement}/>
        )}
        <section className="studio-game-host" hidden={studioMode !== "levels"}>
          <GameEditor
            assets={assets}
            ref={gameEditor}
            active={studioMode === "levels"}
            section={gameSection}
            onSelectSection={setGameSection}
            issues={gameValidationIssues}
            showIssues={showGameIssues}
            onShowIssuesChange={setShowGameIssues}
            onPlayLevel={(targetLevelId) =>
              void delivery.execute({ kind: "playLevel", levelId: targetLevelId })
            }
            onOpenFilm={openCampaignFilm}
            onBackupCampaign={() => void backupCampaign()}
          />
        </section>
        {studioModal === "pose" && poseSelection && (
          <PoseGenerationDialog
            target={poseSelection}
            onClose={() => setStudioModal(null)}
            notify={notify}
          />
        )}
        {studioModal === "animationWorkshop" && presentationProject.presentation && (
          <CharacterAnimationWorkshopDialog
            project={presentationProject}
            assets={assets}
            actor={
              selection.kind === "actor"
                ? selectedShot.actors.find((item) => item.id === selection.id)
                : undefined
            }
            initialSpeciesId={workshopSpeciesId}
            initialAnimationId={workshopAnimationId}
            change={(edit, key = "", label = "Modifier une animation") =>
              session.change(edit, key, label)
            }
            onApplyToActor={
              selection.kind === "actor"
                ? (binding) => {
                    const actorId = selection.id;
                    commit(
                      (d) => {
                        d.presentationCatalog = {
                          projectId: presentationProject.id,
                          file:
                            d.presentationCatalog?.projectId === presentationProject.id
                              ? d.presentationCatalog.file
                              : "",
                        };
                        d.schemaVersion = 4;
                        const targetShot = d.shots.find((s) => s.id === selectedShot.id);
                        const targetActor = targetShot?.actors.find((a) => a.id === actorId);
                        if (targetActor) targetActor.animation = binding;
                      },
                      "",
                      "Appliquer l’animation au personnage",
                    );
                    notify("Animation appliquée au personnage dans le plan.");
                  }
                : undefined
            }
            onGenerateAnimation={(speciesId, preset) => {
              const actor = selection.kind === "actor"
                ? selectedShot.actors.find((item) => item.id === selection.id)
                : undefined;
              setAnimationGenTarget({
                speciesId,
                actor: actor ? structuredClone(actor) : undefined,
                documentId: actor ? doc.id : undefined,
                shotId: actor ? selectedShot.id : undefined,
                defaultPreset: preset ?? "walk",
                scope: "cinematic",
              });
              setStudioModal("animationGeneration");
            }}
            onClose={() => setStudioModal(null)}
          />
        )}
        {studioModal === "animationGeneration" && (
          <AnimationGenerationDialog
            target={animationGenTarget}
            onClose={() => setStudioModal(null)}
            notify={notify}
          />
        )}
      </LibraryPickerContext.Provider>
    </div>
  );
}
