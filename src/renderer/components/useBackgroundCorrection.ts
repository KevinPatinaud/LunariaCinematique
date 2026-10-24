import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../browserBridge.js";
import type { Asset, LibrarySnapshot } from "../../shared/model.js";
import type {
  BackgroundCorrectionJob,
  BackgroundPreparation,
  CodexModelOption,
  PanoramaMode,
  PanoramaResolution,
} from "../../shared/backgroundCorrection.js";
import { normalizeCodexModel } from "../../shared/backgroundCorrection.js";
import { useProjectSession } from "../project/ProjectSessionContext.js";
import { useImageTasks } from "../images/ImageTasksContext.js";
import type { ImageTaskContext } from "../../shared/imageTasks.js";

interface ModelPreference {
  codexModel: string;
}
const MODEL_PREFERENCE_KEY = "lunaria.backgroundCorrection.model";
function modelPreference(): ModelPreference {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(MODEL_PREFERENCE_KEY) ?? "null",
    );
    if (
      saved &&
      typeof saved === "object" &&
      "codexModel" in saved &&
      typeof saved.codexModel === "string" &&
      saved.codexModel.length <= 128
    ) {
      return {
        codexModel:
          "customModel" in saved && saved.customModel === false
            ? ""
            : saved.codexModel.trim(),
      };
    }
  } catch {
    /* Missing, corrupt or unavailable local storage keeps automatic. */
  }
  return { codexModel: "" };
}

interface Target {
  documentId: string;
  shotId: string;
  asset: Asset;
}
interface Entry extends ModelPreference {
  context?: ImageTaskContext;
  id: string;
  libraryRoot: string;
  target: Target;
  job?: BackgroundCorrectionJob;
  preparation?: BackgroundPreparation;
  pending: boolean;
  testing: boolean;
  error: string;
  instructions: string;
  mode: PanoramaMode;
  useOriginal: boolean;
  cropPosition: number;
  outputWidth: PanoramaResolution;
}
const DEFAULT_INSTRUCTIONS =
  "Créer un panorama 20:9 harmonieux et détaillé à partir de ce décor. Prolonger naturellement les côtés et améliorer raisonnablement le centre si cela renforce la cohérence de l’image. Préserver le lieu, son ambiance, son point de vue et sa composition générale. Éviter les raccords visibles, les répétitions et le flou. Ne pas ajouter de personnages ni de texte.";
const message = (reason: unknown) =>
  reason instanceof Error ? reason.message : String(reason);
const busy = (entry: Entry) =>
  entry.pending ||
  entry.job?.status === "queued" ||
  entry.job?.status === "generating" ||
  entry.job?.status === "applying";

export function useBackgroundCorrection(
  notify: (message: string) => void,
  updateLibrary: (library: LibrarySnapshot) => void,
  focusTarget: (target: Target) => boolean,
  libraryRoot: string,
) {
  const { session, epoch } = useProjectSession();
  const { tasks, refresh } = useImageTasks();
  const available =
    !!window.lunaria && typeof api.prepareBackgroundCorrection === "function";
  const [entries, setEntries] = useState<Entry[]>([]);
  const entriesRef = useRef(entries);
  const registeredIds = useRef(new Set<string>());
  const [selectedId, setSelectedId] = useState<string>();
  const selectedRef = useRef<string | undefined>(undefined);
  const [opened, setOpened] = useState(false);
  const [models, setModels] = useState<{
    items: CodexModelOption[];
    loading: boolean;
    loaded: boolean;
    error: string;
  }>({ items: [], loading: false, loaded: false, error: "" });
  const modelsRef = useRef(models);
  const refreshModels = useCallback(async () => {
    if (modelsRef.current.loading) return;
    const update = (patch: Partial<typeof models>) => {
      modelsRef.current = { ...modelsRef.current, ...patch };
      setModels(modelsRef.current);
    };
    update({ loading: true, error: "" });
    try {
      if (typeof api.listBackgroundModels !== "function")
        throw new Error(
          "Relance le Studio pour activer la détection des modèles.",
        );
      const items = await api.listBackgroundModels();
      update({ items, loaded: true });
    } catch (reason) {
      update({ error: message(reason) });
    } finally {
      update({ loading: false });
    }
  }, []);
  const trigger = useRef<HTMLElement | null>(null);
  const libraryRef = useRef(libraryRoot);
  libraryRef.current = libraryRoot;
  // Update the ref synchronously: async completions and fast clicks always
  // address their own entry, even after another modal has been opened.
  const change = useCallback((update: (entries: Entry[]) => Entry[]) => {
    entriesRef.current = update(entriesRef.current);
    setEntries(entriesRef.current);
  }, []);
  const patch = useCallback(
    (id: string, update: Partial<Entry>) => {
      change((items) =>
        items.map((entry) =>
          entry.id === id ? { ...entry, ...update } : entry,
        ),
      );
    },
    [change],
  );
  useEffect(() => {
    const currentIds = new Set(
      tasks
        .filter((task) => task.kind === "background")
        .map((task) => task.job.id),
    );
    change((items) =>
      items
        .filter(
          (entry) =>
            !entry.job ||
            entry.pending ||
            !registeredIds.current.has(entry.job.id) ||
            currentIds.has(entry.job.id),
        )
        .map((entry) => {
          if (!entry.job || entry.pending) return entry;
          const task = tasks.find(
            (task) =>
              task.kind === "background" && task.job.id === entry.job!.id,
          );
          if (
            ["applied", "cancelled", "failed", "interrupted"].includes(
              entry.job.status,
            )
          )
            return entry;
          return task?.kind === "background" &&
            (task.job.updatedAt ?? "") >= (entry.job.updatedAt ?? "")
            ? {
                ...entry,
                job: task.job,
                testing: entry.testing && task.job.status === "ready",
              }
            : entry;
        }),
    );
    for (const id of currentIds) registeredIds.current.add(id);
  }, [tasks, change]);
  useEffect(() => {
    change((items) => items.map((entry) => ({ ...entry, testing: false })));
  }, [epoch, change]);

  function inspect(id: string) {
    if (!entriesRef.current.some((entry) => entry.id === id)) return;
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    selectedRef.current = id;
    setSelectedId(id);
    setOpened(true);
    if (!modelsRef.current.loaded) void refreshModels();
  }
  function close(id = selectedRef.current) {
    if (selectedRef.current !== id) return;
    setOpened(false);
    requestAnimationFrame(() => {
      if (trigger.current?.isConnected) trigger.current.focus();
    });
  }
  async function open(target: Target) {
    if (!available) {
      notify("Relance le Studio pour activer la correction avec Codex.");
      return;
    }
    const context: ImageTaskContext = {
      projectId: session.project.id,
      projectPath: session.getSnapshot().path,
      documentId: target.documentId,
      shotId: target.shotId,
      title: target.asset.name,
    };
    const existing = entriesRef.current.find(
      (entry) =>
        entry.context?.projectId === context.projectId &&
        entry.context.projectPath === context.projectPath &&
        entry.libraryRoot === libraryRoot &&
        entry.target.asset.ref === target.asset.ref &&
        !["applied", "cancelled"].includes(entry.job?.status ?? ""),
    );
    if (existing) {
      patch(existing.id, {
        target,
        testing:
          existing.testing &&
          existing.target.shotId === target.shotId &&
          existing.target.documentId === target.documentId,
      });
      inspect(existing.id);
      return;
    }
    const id = crypto.randomUUID();
    let recovered = tasks.find(
      (task) =>
        task.kind === "background" &&
        task.libraryRoot === libraryRoot &&
        task.job.ref === target.asset.ref &&
        ["queued", "generating", "ready"].includes(task.job.status),
    );
    if (recovered?.kind === "background") {
      try {
        const fresh = await api.getBackgroundCorrection(recovered.job.id);
        recovered = ["queued", "generating", "ready"].includes(fresh.status)
          ? { ...recovered, job: fresh }
          : undefined;
      } catch {
        recovered = undefined;
      }
    }
    const request = recovered?.request as
      | import("../../shared/backgroundCorrection.js").BackgroundCorrectionRequest
      | undefined;
    change((items) => [
      ...items,
      {
        id,
        context,
        libraryRoot,
        target,
        pending: true,
        testing: false,
        error: "",
        instructions: request?.instructions ?? DEFAULT_INSTRUCTIONS,
        mode: request?.mode ?? "extend",
        useOriginal: request?.useOriginal ?? false,
        cropPosition: request?.cropPosition ?? 0.5,
        outputWidth: request?.outputWidth ?? "native",
        ...modelPreference(),
        ...(request ? { codexModel: request.codexModel ?? "" } : {}),
        job: recovered?.kind === "background" ? recovered.job : undefined,
      },
    ]);
    inspect(id);
    try {
      const preparation = await api.prepareBackgroundCorrection(
        target.asset.ref,
      );
      patch(id, {
        preparation,
        ...(request
          ? {}
          : {
              mode: preparation.suggestedMode,
              useOriginal:
                preparation.suggestedMode === "rebuild" &&
                !!preparation.original,
            }),
      });
    } catch (reason) {
      patch(id, { error: message(reason) });
    } finally {
      patch(id, { pending: false });
    }
  }
  const selected = entries.find((entry) => entry.id === selectedId);
  const current = () =>
    entriesRef.current.find((entry) => entry.id === selectedRef.current);
  function inCurrentLibrary(entry: Entry) {
    if (entry.libraryRoot === libraryRef.current) return true;
    patch(entry.id, {
      error:
        "Reconnecte la bibliothèque de ce décor pour poursuivre ce traitement.",
    });
    return false;
  }
  async function generate() {
    const entry = current();
    if (!entry?.preparation || busy(entry) || !inCurrentLibrary(entry)) return;
    const {
      id,
      target,
      instructions,
      mode,
      useOriginal,
      cropPosition,
      outputWidth,
    } = entry;
    let codexModel: string | undefined;
    try {
      codexModel = normalizeCodexModel(entry.codexModel);
      if (
        codexModel &&
        (modelsRef.current.loading ||
          !modelsRef.current.items.some((model) => model.id === codexModel))
      )
        throw new Error(
          "Ce modèle n’est pas détecté. Actualise la liste ou choisis un autre modèle.",
        );
    } catch (reason) {
      patch(id, { error: message(reason) });
      return;
    }
    patch(id, { pending: true, error: "", testing: false });
    try {
      if (entry.job?.status === "ready") {
        await api.cancelBackgroundCorrection(entry.job.id);
        patch(id, { job: undefined });
      }
      const job = await api.startBackgroundCorrection({
        ref: target.asset.ref,
        instructions,
        mode,
        useOriginal: mode === "rebuild" && useOriginal,
        cropPosition,
        outputWidth,
        codexModel,
        context: entry.context,
      });
      patch(id, { job });
    } catch (reason) {
      patch(id, { error: message(reason) });
    } finally {
      patch(id, { pending: false });
      void refresh();
    }
  }
  async function discard() {
    const entry = current();
    if (!entry || entry.pending || entry.job?.status === "applying") return;
    patch(entry.id, { pending: true });
    try {
      if (entry.job && entry.job.status !== "applied")
        await api.cancelBackgroundCorrection(entry.job.id);
      change((items) => items.filter((item) => item.id !== entry.id));
      close(entry.id);
      void refresh();
    } catch (reason) {
      patch(entry.id, { error: message(reason) });
    } finally {
      patch(entry.id, { pending: false });
    }
  }
  async function edit() {
    const entry = current();
    if (!entry || busy(entry)) return;
    patch(entry.id, { pending: true });
    try {
      if (entry.job) await api.cancelBackgroundCorrection(entry.job.id);
      patch(entry.id, { job: undefined, testing: false, error: "" });
    } catch (reason) {
      patch(entry.id, { error: message(reason) });
    } finally {
      patch(entry.id, { pending: false });
    }
  }
  async function apply() {
    const entry = current();
    if (
      !entry ||
      entry.job?.status !== "ready" ||
      entry.pending ||
      !inCurrentLibrary(entry)
    )
      return;
    patch(entry.id, { pending: true, error: "" });
    try {
      const result = await api.applyBackgroundCorrection(entry.job.id);
      if (result.library && result.library.rootPath === libraryRef.current)
        updateLibrary(result.library);
      patch(entry.id, { job: result.job, testing: false });
      void refresh();
      close(entry.id);
      notify(
        `${entry.target.asset.name} : décor 20:9 remplacé. La version précédente est sauvegardée.`,
      );
    } catch (reason) {
      patch(entry.id, { error: message(reason) });
    } finally {
      patch(entry.id, { pending: false });
    }
  }
  function assetsFor(
    documentId: string,
    shotId: string,
    assets: Asset[],
  ): Asset[] {
    const entry = entries.find(
      (item) =>
        item.testing &&
        item.context?.projectId === session.project.id &&
        item.context.projectPath === session.getSnapshot().path &&
        item.libraryRoot === libraryRoot &&
        item.target.documentId === documentId &&
        item.target.shotId === shotId &&
        item.job?.status === "ready" &&
        item.job.candidateUrl,
    );
    if (!entry) return assets;
    return assets.map((asset) =>
      asset.ref === entry.target.asset.ref
        ? {
            ...asset,
            url: entry.job!.candidateUrl!,
            thumbnail: entry.job!.candidateUrl!,
          }
        : asset,
    );
  }
  function test() {
    const entry = current();
    if (
      entry?.context &&
      (entry.context.projectId !== session.project.id ||
        entry.context.projectPath !== session.getSnapshot().path)
    ) {
      notify("Rouvre le projet de ce plan pour y tester la proposition.");
      return;
    }
    if (
      entry?.job?.status !== "ready" ||
      !inCurrentLibrary(entry) ||
      !focusTarget(entry.target)
    )
      return;
    change((items) =>
      items.map((item) => ({
        ...item,
        testing:
          item.id === entry.id ||
          (item.testing &&
            (item.target.documentId !== entry.target.documentId ||
              item.target.shotId !== entry.target.shotId)),
      })),
    );
    close(entry.id);
    notify(
      "Proposition en test dans ce plan. Tu peux lancer la lecture ; le fichier original reste conservé.",
    );
  }
  function setting(update: Partial<Entry>) {
    const entry = current();
    if (entry && !busy(entry)) patch(entry.id, update);
  }
  function setModel(codexModel: string) {
    const entry = current();
    if (!entry || busy(entry) || entry.job?.status === "applied") return;
    if (
      codexModel &&
      !modelsRef.current.items.some((model) => model.id === codexModel)
    )
      return;
    const preference = { codexModel };
    patch(entry.id, { ...preference, error: "" });
    try {
      localStorage.setItem(MODEL_PREFERENCE_KEY, JSON.stringify(preference));
    } catch {
      /* Selection still works for this treatment. */
    }
  }
  return {
    available,
    entries,
    selectedId,
    target: selected?.target,
    job: selected?.job,
    opened: opened && !!selected,
    testing: selected?.testing ?? false,
    busy: !!selected && busy(selected),
    error: selected?.error ?? "",
    preparation: selected?.preparation,
    instructions: selected?.instructions ?? DEFAULT_INSTRUCTIONS,
    setInstructions: (instructions: string) => setting({ instructions }),
    mode: selected?.mode ?? "extend",
    setMode: (mode: PanoramaMode) => setting({ mode }),
    useOriginal: selected?.useOriginal ?? false,
    setUseOriginal: (useOriginal: boolean) => setting({ useOriginal }),
    cropPosition: selected?.cropPosition ?? 0.5,
    setCropPosition: (cropPosition: number) => setting({ cropPosition }),
    outputWidth: selected?.outputWidth ?? "native",
    setOutputWidth: (outputWidth: PanoramaResolution) =>
      setting({ outputWidth }),
    codexModel: selected?.codexModel ?? "",
    setCodexModel: setModel,
    models,
    refreshModels,
    modelUnavailable:
      !!selected?.codexModel &&
      !models.items.some((model) => model.id === selected.codexModel),
    open,
    close: () => close(),
    generate,
    discard,
    edit,
    apply,
    assetsFor,
    inspect,
    test,
    original: (id: string) => patch(id, { testing: false }),
    revealBackup: () => {
      const entry = current();
      if (entry?.job)
        void api
          .revealBackgroundBackup(entry.job.id)
          .catch((reason) => notify(message(reason)));
    },
  };
}
