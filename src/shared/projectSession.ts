import {
  createHistory,
  historyReducer,
  type History,
  type HistoryAction,
} from "./history.js";
import type { Cinematic } from "./model.js";
import { seedProject } from "./game/seed.js";
import { ensureCombat } from "./game/combatDefaults.js";
import { ensureLogic } from "./game/logicDefaults.js";
import { ensurePresentation } from "./presentation/defaults.js";
import { ensureCampaign } from "./game/campaign.js";
import { setContentArchived } from "./game/contentArchives.js";
import {
  cinematicReferences,
  moveCinematic,
  updateCinematicReferences,
  type CinematicPlacement,
} from "./game/cinematicManagement.js";
import {
  newId,
  type GameAPI,
  type GameFile,
  type GameProject,
  type GameRecent,
  type ProjectDiskConflict,
  type ProjectRecoveryContext,
} from "./game/types.js";
import { mergeProject } from "./projectMerge.js";

export type ProjectLocation = {
  mode: "cinematics" | "levels";
  filmId?: string;
  shotId?: string;
  section?: string;
  levelId?: string;
  species?: string;
  detail?: string;
  speciesTab?: string;
  campaignStepId?: string;
};
export interface ProjectSessionState {
  history: History<GameProject>;
  dirty: boolean;
  path: string;
  token: string;
  busy: boolean;
  ready: boolean;
  epoch: number;
  navigation: { revision: number; location: ProjectLocation } | null;
  recent: GameRecent[];
  recovery: GameProject | null;
  recoveryContext?: ProjectRecoveryContext;
  recoveryStatus: string;
  message: string;
  conflict: {
    disk: ProjectDiskConflict;
    local: GameProject;
    kind?: "recovery";
  } | null;
}
type SessionIO = Pick<
  GameAPI,
  | "bootstrap"
  | "open"
  | "openRecent"
  | "save"
  | "recover"
  | "clearRecovery"
  | "backup"
  | "inspectConflict"
  | "reconcile"
>;
export function emptyProject(): GameProject {
  const p = seedProject();
  p.levels = [];
  p.campaign = { steps: [], cinematics: [] };
  p.cinematics = [];
  ensureCombat(p);
  ensureLogic(p);
  ensurePresentation(p);
  return p;
}
/** One document, one baseline and one chronological history for every Studio view. */
export class ProjectSession {
  private state: ProjectSessionState;
  private saved: string;
  private savedProject: GameProject;
  private closing = false;
  private listeners = new Set<() => void>();
  private locations = new WeakMap<object, ProjectLocation>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private recoveryQueue: Promise<unknown> = Promise.resolve();
  private bootPromise: Promise<void> | undefined;
  private location: ProjectLocation = { mode: "cinematics" };
  private pendingBoundary = false;
  constructor(
    private io: SessionIO,
    private confirm: (reason: string) => Promise<"save" | "discard" | "cancel">,
    initial = emptyProject(),
  ) {
    this.saved = JSON.stringify(initial);
    this.savedProject = initial;
    this.state = {
      history: createHistory(initial),
      dirty: false,
      path: "",
      token: "",
      busy: true,
      ready: false,
      epoch: 0,
      navigation: null,
      recent: [],
      recovery: null,
      recoveryStatus: "",
      message: "",
      conflict: null,
    };
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private patch(patch: Partial<ProjectSessionState>) {
    this.state = { ...this.state, ...patch };
    for (const l of this.listeners) l();
  }
  get project() {
    return this.state.history.present;
  }
  setLocation(location: ProjectLocation) {
    if (JSON.stringify(this.location) !== JSON.stringify(location))
      this.pendingBoundary = true;
    this.location = location;
  }
  locationOf(command: object) {
    return this.locations.get(command);
  }
  boundary() {
    this.pendingBoundary = false;
    this.patch({
      history: historyReducer(this.state.history, { type: "boundary" }),
    });
  }
  action(
    action: HistoryAction<GameProject>,
    location = this.location,
    allowBusy = false,
  ) {
    if (this.state.busy && !allowBusy) return;
    const before = this.pendingBoundary
      ? historyReducer(this.state.history, { type: "boundary" })
      : this.state.history;
    const target =
      action.type === "undo"
        ? before.undoCommands.at(-1)
        : action.type === "redo"
          ? before.redoCommands[0]
          : undefined;
    const history = historyReducer(before, action);
    if (history === before) return;
    this.pendingBoundary = false;
    if (action.type === "commit" || action.type === "execute")
      this.locations.set(history.undoCommands.at(-1)!, { ...location });
    const navigate = target && this.locations.get(target);
    this.patch({
      history,
      dirty: JSON.stringify(history.present) !== this.saved,
      ...(navigate
        ? {
            navigation: {
              revision: (this.state.navigation?.revision ?? 0) + 1,
              location: navigate,
            },
          }
        : {}),
    });
    this.scheduleRecovery();
  }
  change(
    edit: (draft: GameProject) => void,
    key = "",
    label = "Modifier le projet",
    location = this.location,
    allowBusy = false,
  ) {
    if (this.state.busy && !allowBusy) return;
    const next = structuredClone(this.project);
    edit(next);
    if (location.mode === "levels" && location.section === "levels") {
      const added = next.levels.find(
        (level) => !this.project.levels.some((old) => old.id === level.id),
      );
      if (added) location = { ...location, levelId: added.id };
    }
    const scope =
      location.filmId ??
      (location.mode === "levels"
        ? `${location.section}:${location.levelId ?? ""}:${location.species ?? ""}`
        : "");
    this.action(
      {
        type: "commit",
        value: next,
        key: key ? `${scope}:${key}` : "",
        label,
        now: Date.now(),
      },
      location,
      allowBusy,
    );
  }
  editFilm(
    id: string,
    edit: (film: Cinematic) => void,
    key = "",
    label = "Modifier la cinématique",
    fallback?: Cinematic,
  ) {
    const location: ProjectLocation = {
      ...this.location,
      mode: "cinematics",
      filmId: id,
    };
    let resultId = id;
    this.change(
      (p) => {
        const films = (p.cinematics ??= []);
        let film = films.find((f) => f.id === id);
        if (!film && fallback) {
          film = structuredClone(fallback);
          films.push(film);
        }
        if (!film) return;
        edit(film);
        if (
          p.cinematics!.some((other) => other !== film && other.id === film.id)
        )
          throw Error("Cet identifiant de cinématique existe déjà.");
        resultId = film.id;
        location.filmId = film.id;
        updateCinematicReferences(p, id, film);
      },
      key,
      label,
      location,
    );
    return resultId;
  }
  upsertFilm(
    doc: Cinematic,
    previousId = doc.id,
    label = "Ajouter une cinématique",
  ) {
    this.change(
      (p) => {
        const films = (p.cinematics ??= []);
        const i = films.findIndex((f) => f.id === previousId);
        if (i < 0) films.push(structuredClone(doc));
        else films[i] = structuredClone(doc);
        updateCinematicReferences(p, previousId, doc);
      },
      "",
      label,
      { mode: "cinematics", filmId: doc.id },
    );
  }
  moveFilm(id: string, target: string, placement: CinematicPlacement) {
    this.change(
      (p) => moveCinematic(p, id, target, placement),
      "",
      "Réordonner les cinématiques",
      { mode: "cinematics", filmId: id },
    );
  }
  removeFilm(id: string) {
    this.change(
      (p) => {
        if (cinematicReferences(p, id).length)
          throw Error(
            "Cette cinématique est encore utilisée dans la campagne.",
          );
        p.cinematics = (p.cinematics ?? []).filter((f) => f.id !== id);
        setContentArchived(p, "cinematics", id, false);
        if (p.campaign)
          p.campaign.cinematics = p.campaign.cinematics.filter(
            (f) => f.documentId !== id,
          );
      },
      "",
      "Supprimer la cinématique",
      { mode: "cinematics", filmId: id },
    );
  }
  report(error: unknown) {
    this.patch({
      message: error instanceof Error ? error.message : String(error),
    });
  }
  message(message: string) {
    this.patch({ message });
  }
  async run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (this.state.busy) return;
    this.closing = false;
    this.flushInput();
    this.patch({ busy: true });
    clearTimeout(this.timer);
    try {
      return await fn();
    } catch (e) {
      this.report(e);
      return undefined;
    } finally {
      this.patch({ busy: false });
      this.scheduleRecovery();
    }
  }
  private flushInput() {
    if (
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
    )
      document.activeElement.blur();
  }
  private recoveryJob(fn: () => Promise<void>) {
    const job = this.recoveryQueue.then(fn, fn);
    this.recoveryQueue = job.catch(() => {});
    return job;
  }
  private scheduleRecovery() {
    clearTimeout(this.timer);
    if (
      !this.state.ready ||
      this.state.busy ||
      this.state.recovery ||
      this.closing
    )
      return;
    const epoch = this.state.epoch,
      value = this.project,
      dirty = this.state.dirty,
      context = { base: this.savedProject, path: this.state.path };
    this.patch({
      recoveryStatus: dirty
        ? "Brouillon local en attente…"
        : this.state.path
          ? "Fichier enregistré"
          : "",
    });
    this.timer = setTimeout(() => {
      void this.recoveryJob(() =>
        dirty ? this.io.recover(value, context) : this.io.clearRecovery(),
      )
        .then(() => {
          if (this.state.epoch === epoch && this.project === value)
            this.patch({
              recoveryStatus: dirty
                ? "Brouillon local à jour"
                : this.state.path
                  ? "Fichier enregistré"
                  : "",
            });
        })
        .catch((e) => {
          if (this.state.epoch === epoch) {
            this.patch({ recoveryStatus: "Échec de la récupération locale" });
            this.report(e);
          }
        });
    }, 500);
  }
  private apply(
    project: GameProject,
    file?: GameFile,
    modified = false,
    preserveRecovery = true,
  ) {
    clearTimeout(this.timer);
    project = structuredClone(project);
    ensureCampaign(project);
    ensureCombat(project);
    ensureLogic(project);
    ensurePresentation(project);
    this.saved = modified ? "" : JSON.stringify(project);
    this.savedProject = project;
    this.locations = new WeakMap();
    this.patch({
      history: createHistory(project),
      dirty: modified,
      path: file?.path ?? "",
      token: file?.token ?? "",
      epoch: this.state.epoch + 1,
      navigation: null,
      ...(!preserveRecovery
        ? { recovery: null, recoveryContext: undefined }
        : {}),
      conflict: null,
      recoveryStatus: file ? "Fichier ouvert" : "",
    });
  }
  boot() {
    return (this.bootPromise ??= (async () => {
      try {
        const snapshot = await this.io.bootstrap();
        this.patch({ recent: snapshot.recent });
        const latest = snapshot.recent[0];
        if (latest) {
          try {
            const file = await this.io.openRecent(latest.path);
            this.apply(file.project, file, !!file.migrated);
            this.message("Dernier projet chargé automatiquement.");
          } catch (e) {
            this.report(e);
          }
        }
        // A recovery identical to the last written file is redundant (e.g. interrupted cleanup).
        this.patch({
          recoveryContext: snapshot.recoveryContext,
          recovery:
            snapshot.recovery &&
            JSON.stringify(snapshot.recovery) !== JSON.stringify(this.project)
              ? snapshot.recovery
              : null,
        });
        if (snapshot.recoveryWarning) this.message(snapshot.recoveryWarning);
      } catch (e) {
        this.report(e);
      } finally {
        this.patch({ busy: false, ready: true });
        if (this.state.dirty) this.scheduleRecovery();
      }
    })());
  }
  async refreshRecent() {
    this.patch({ recent: (await this.io.bootstrap()).recent });
  }
  /** Called inside a session operation, including publishing. Edits made while IO is pending remain dirty. */
  async saveCurrent(
    as = false,
    value = this.project,
    applyOnSave = false,
  ): Promise<boolean> {
    clearTimeout(this.timer);
    const epoch = this.state.epoch,
      token = this.state.token,
      current = value,
      original = this.project;
    let result: GameFile | null;
    try {
      result = await this.io.save(current, token, as);
    } catch (error) {
      if (epoch !== this.state.epoch) return false;
      const disk = await this.io
        .inspectConflict(token)
        .catch(() => null);
      if (epoch !== this.state.epoch) return false;
      if (disk) {
        this.patch({
          conflict: { disk, local: structuredClone(this.project) },
        });
        this.message(
          "Le fichier a changé sur le disque. Compare les versions avant d’enregistrer.",
        );
        return false;
      }
      throw error;
    }
    if (!result || epoch !== this.state.epoch) return false;
    if (applyOnSave && this.project === original)
      this.action(
        {
          type: "commit",
          value: structuredClone(value),
          label: "Reprendre le brouillon dans une copie",
        },
        this.location,
        true,
      );
    // Parser normalization must not create a second editable copy of the project.
    this.saved = JSON.stringify(current);
    this.savedProject = current;
    this.patch({
      path: result.path,
      token: result.token,
      dirty: JSON.stringify(this.project) !== this.saved,
      history: historyReducer(this.state.history, { type: "boundary" }),
      ...(applyOnSave ? { recovery: null, recoveryContext: undefined } : {}),
      conflict: null,
    });
    let cleanupError = "";
    if (!this.state.dirty && !this.state.recovery)
      await this.recoveryJob(() => this.io.clearRecovery()).catch((e) => {
        cleanupError = e instanceof Error ? e.message : String(e);
      });
    if (epoch !== this.state.epoch) return false;
    this.message(
      cleanupError
        ? "Projet enregistré. Le nettoyage du brouillon local sera réessayé : " +
            cleanupError
        : "Niveaux et cinématiques enregistrés dans le même fichier.",
    );
    await this.refreshRecent().catch(() => {});
    if (epoch !== this.state.epoch) return false;
    return true;
  }
  closeConflict() {
    this.patch({ conflict: null });
  }
  resolveConflict(project: GameProject) {
    return this.run(async () => {
      const conflict = this.state.conflict;
      if (!conflict) return;
      if (conflict.kind === "recovery") {
        this.action(
          {
            type: "commit",
            value: structuredClone(project),
            label: "Reprendre et réunir le brouillon local",
          },
          this.location,
          true,
        );
        this.patch({
          conflict: null,
          recovery: null,
          recoveryContext: undefined,
        });
        this.message(
          "Brouillon réuni avec le projet ouvert. Enregistre pour conserver le résultat.",
        );
        return;
      }
      try {
        const file = await this.io.reconcile(
          project,
          this.state.token,
          conflict.disk.revision,
          conflict.local,
        );
        this.action(
          {
            type: "commit",
            value: structuredClone(file.project),
            label: "Réunir le brouillon et le fichier modifié",
          },
          this.location,
          true,
        );
        this.saved = JSON.stringify(this.project);
        this.savedProject = this.project;
        this.boundary();
        this.patch({ dirty: false, conflict: null });
        if (!this.state.recovery)
          await this.recoveryJob(() => this.io.clearRecovery());
        this.message(
          "Versions réunies et enregistrées. Copies conservées dans : " +
            file.preserved,
        );
        await this.refreshRecent().catch(() => {});
      } catch (error) {
        const disk = await this.io
          .inspectConflict(this.state.token)
          .catch(() => null);
        if (disk)
          this.patch({
            conflict: { disk, local: structuredClone(this.project) },
          });
        throw error;
      }
    });
  }
  save(as = false) {
    return this.run(() => this.saveCurrent(as)).then(
      (result) => result ?? false,
    );
  }
  saveConflictCopy() {
    return this.run(() =>
      this.saveCurrent(true, this.state.conflict?.local ?? this.project, true),
    );
  }
  async canReplace(reason: string) {
    this.flushInput();
    if (!this.state.dirty) return true;
    const choice = await this.confirm(reason);
    return choice === "save" ? this.saveCurrent() : choice === "discard";
  }
  open(path?: string) {
    return this.run(async () => {
      if (
        !(await this.canReplace(
          "Enregistrer avant d’ouvrir un autre projet Lunaria ?",
        ))
      )
        return false;
      const file = await (path ? this.io.openRecent(path) : this.io.open());
      if (!file) return false;
      this.apply(file.project, file, !!file.migrated);
      if (!this.state.recovery)
        await this.recoveryJob(() => this.io.clearRecovery());
      await this.refreshRecent();
      this.message(
        file.backup
          ? "Sauvegarde ouverte avec ses images et sons. Enregistre-la dans un nouveau fichier de travail."
          : file.migrated
            ? "Projet ouvert. Enregistre-le pour intégrer ses anciens films."
            : "Projet ouvert.",
      );
      return true;
    });
  }
  fresh() {
    return this.run(async () => {
      if (
        !(await this.canReplace(
          "Enregistrer avant de créer un projet Lunaria ?",
        ))
      )
        return;
      const next = emptyProject();
      next.id = newId("project");
      next.title = "Nouveau projet Lunaria";
      for (const key of ["balance", "combat", "logic", "presentation"] as const)
        Object.assign(next, { [key]: structuredClone(this.project[key]) });
      this.apply(next, undefined, true);
      if (!this.state.recovery)
        await this.recoveryJob(() => this.io.clearRecovery());
      this.message("Projet vide créé. Ajoute des niveaux et des cinématiques.");
    });
  }
  backup() {
    return this.run(() => this.io.backup(this.project));
  }
  prepareClose() {
    return this.run(async () => {
      if (
        !(await this.canReplace(
          "Enregistrer le projet Lunaria avant de quitter ?",
        ))
      )
        return false;
      // Discard means discard: a confirmed abandoned edit must not reappear at next startup.
      if (!this.state.recovery)
        await this.recoveryJob(() => this.io.clearRecovery());
      this.closing = true;
      return true;
    }).then((result) => result ?? false);
  }
  resumeRecovery() {
    return this.run(async () => {
      const draft = this.state.recovery;
      if (!draft) return;
      const context = this.state.recoveryContext;
      if (
        draft.id === this.project.id &&
        (!context || context.path === this.state.path)
      ) {
        let value = structuredClone(draft);
        if (context && context.path === this.state.path) {
          const merged = mergeProject(context.base, draft, this.project);
          if (merged.conflicts.length) {
            this.patch({
              conflict: {
                kind: "recovery",
                local: draft,
                disk: {
                  path: this.state.path,
                  revision: "recovery",
                  base: context.base,
                  remote: this.project,
                },
              },
            });
            return;
          }
          value = merged.project;
        }
        this.action(
          {
            type: "commit",
            value,
            label: "Reprendre le brouillon local",
          },
          this.location,
          true,
        );
        this.patch({ recovery: null, recoveryContext: undefined });
      } else {
        if (
          !(await this.canReplace(
            "Enregistrer le projet ouvert avant de reprendre cet autre brouillon ?",
          ))
        )
          return;
        this.apply(draft, undefined, true, false);
      }
      this.message(
        "Brouillon repris. Enregistre le projet pour conserver ces modifications dans le fichier.",
      );
    });
  }
  discardRecovery() {
    return this.run(async () => {
      await this.recoveryJob(() => this.io.clearRecovery());
      this.patch({ recovery: null, recoveryContext: undefined });
    });
  }
  dispose() {
    clearTimeout(this.timer);
  }
}
