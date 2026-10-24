import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { atomicJson, readJsonSource } from "./files.js";
import { parseGameProject, parseGameDraft } from "../shared/game/validation.js";
import type {
  GameProject,
  GameFile,
  GameRecent,
  GameBootstrap,
  ProjectDiskConflict,
  ProjectRecoveryContext,
} from "../shared/game/types.js";
const digest = (s: string) => createHash("sha256").update(s).digest("hex");
const MAX_PROJECT_BYTES = 32 * 1024 * 1024;
/** File ownership stays in Node. Renderer tokens are not filesystem paths. */
export class GameDocuments {
  private active: {
    path: string;
    token: string;
    hash: string;
    base: GameProject;
  } | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private unreadableRecovery = false;
  private preservedRecovery:
    | { mtime: number; size: number; folder: string }
    | undefined;
  private async preserveUnreadableRecovery() {
    if (!this.unreadableRecovery) return "";
    const source = path.join(this.profile, "game-recovery.json"),
      stat = await fs.stat(source);
    if (
      this.preservedRecovery?.mtime === stat.mtimeMs &&
      this.preservedRecovery.size === stat.size
    ) {
      this.unreadableRecovery = false;
      return this.preservedRecovery.folder;
    }
    const folder = path.join(
      this.profile,
      "project-conflicts",
      "brouillon-illisible-" +
        new Date().toISOString().replaceAll(":", "-") +
        "-" +
        randomUUID().slice(0, 8),
    );
    await fs.mkdir(folder, { recursive: true });
    await fs.copyFile(source, path.join(folder, "brouillon-original.json"));
    this.preservedRecovery = { mtime: stat.mtimeMs, size: stat.size, folder };
    this.unreadableRecovery = false;
    return folder;
  }
  constructor(private readonly profile: string) {}
  private serial<T>(fn: () => Promise<T>): Promise<T> {
    const job = this.queue.then(fn, fn);
    this.queue = job.catch(() => undefined);
    return job;
  }
  async flush() {
    await this.queue;
  }
  private async recents(): Promise<GameRecent[]> {
    try {
      const v = (
        await readJsonSource(path.join(this.profile, "game-recents.json"))
      ).value;
      return Array.isArray(v)
        ? v
            .filter(
              (x): x is GameRecent =>
                !!x &&
                typeof x === "object" &&
                typeof x.path === "string" &&
                path.isAbsolute(x.path) &&
                typeof x.title === "string" &&
                typeof x.updatedAt === "string",
            )
            .slice(0, 20)
        : [];
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw e;
    }
  }
  private async remember(file: string, project: GameProject) {
    const list = await this.recents();
    const norm = (x: string) =>
      process.platform === "win32" ? x.toLowerCase() : x;
    await atomicJson(
      path.join(this.profile, "game-recents.json"),
      [
        {
          path: file,
          title: project.title,
          updatedAt: new Date().toISOString(),
        },
        ...list.filter((x) => norm(x.path) !== norm(file)),
      ].slice(0, 20),
    );
  }
  async bootstrap(): Promise<GameBootstrap> {
    let recovery: GameProject | null = null;
    let recoveryWarning: string | undefined;
    try {
      const value = (
        await readJsonSource(
          path.join(this.profile, "game-recovery.json"),
          MAX_PROJECT_BYTES,
        )
      ).value;
      recovery = parseGameDraft(value);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
        this.unreadableRecovery = true;
        const preserved = await this.preserveUnreadableRecovery();
        recoveryWarning =
          "Le brouillon local est illisible. Son fichier original a été conservé dans : " +
          preserved;
      }
    }
    let recoveryContext: ProjectRecoveryContext | undefined;
    if (recovery)
      try {
        const meta = (
          await readJsonSource(
            path.join(this.profile, "game-recovery.meta.json"),
            MAX_PROJECT_BYTES,
          )
        ).value as { hash: string; base: unknown; path: unknown };
        if (
          meta.hash === digest(JSON.stringify(recovery)) &&
          typeof meta.path === "string"
        )
          recoveryContext = {
            base: parseGameDraft(meta.base),
            path: meta.path,
          };
      } catch {}
    return {
      recovery,
      recoveryWarning,
      recoveryContext,
      recent: await this.recents(),
    };
  }
  open(file: string): Promise<GameFile> {
    return this.serial(async () => {
      const real = await fs.realpath(file);
      const { value, source } = await readJsonSource(real, MAX_PROJECT_BYTES);
      const project = parseGameProject(value);
      await this.remember(real, project);
      this.active = {
        path: real,
        token: randomUUID(),
        hash: digest(source),
        base: structuredClone(project),
      };
      return { project, path: real, token: this.active.token };
    });
  }
  async openRecent(file: unknown): Promise<GameFile> {
    if (
      typeof file !== "string" ||
      !(await this.recents()).some((x) => x.path === file)
    )
      throw new Error("Projet récent inconnu. Utilise Ouvrir.");
    return this.open(file);
  }
  currentPath(token: unknown): string | undefined {
    return typeof token === "string" && this.active?.token === token
      ? this.active.path
      : undefined;
  }
  save(value: unknown, token: unknown, chosenPath?: string): Promise<GameFile> {
    return this.serial(async () => {
      const project = parseGameProject(value);
      const owned = this.active?.token === token ? this.active : null;
      for (const film of project.campaign?.cinematics ?? [])
        if (!project.cinematics?.some((doc) => doc.id === film.documentId))
          throw new Error(
            "La cinématique « " +
              film.title +
              " » doit être intégrée au fichier du projet avant enregistrement.",
          );
      if (!chosenPath && !owned)
        throw new Error(
          "Document remplacé. Crée une copie du projet depuis Récents pour conserver ce travail.",
        );
      let target = chosenPath ? path.resolve(chosenPath) : owned!.path;
      // Save As may choose the same Windows file with different letter casing.
      if (
        owned &&
        process.platform === "win32" &&
        target.toLowerCase() === owned.path.toLowerCase()
      )
        target = owned.path;
      if (owned && target === owned.path) {
        let source: string;
        try {
          source = (await readJsonSource(target, MAX_PROJECT_BYTES)).source;
        } catch {
          throw new Error(
            "Le fichier a disparu ou est devenu illisible. Crée une copie du projet depuis Récents.",
          );
        }
        if (digest(source) !== owned.hash)
          throw new Error(
            "Le fichier a été modifié hors du Studio. Crée une copie du projet depuis Récents pour conserver les deux versions.",
          );
      }
      await atomicJson(target, project, false, MAX_PROJECT_BYTES);
      const source = (await readJsonSource(target, MAX_PROJECT_BYTES)).source;
      this.active = {
        path: target,
        token: owned && target === owned.path ? owned.token : randomUUID(),
        hash: digest(source),
        base: structuredClone(project),
      };
      // The document is safely written even if the optional MRU cannot be updated.
      await this.remember(target, project).catch((e) =>
        console.warn("Recent game project", e),
      );
      return { project, path: target, token: this.active.token };
    });
  }
  inspectConflict(token: unknown): Promise<ProjectDiskConflict | null> {
    return this.serial(async () => {
      const owned = this.active;
      if (!owned || owned.token !== token) return null;
      try {
        const { source, value } = await readJsonSource(
          owned.path,
          MAX_PROJECT_BYTES,
        );
        const revision = digest(source);
        if (revision === owned.hash) return null;
        try {
          return {
            path: owned.path,
            revision,
            base: structuredClone(owned.base),
            remote: parseGameProject(value),
          };
        } catch (e) {
          return {
            path: owned.path,
            revision,
            base: structuredClone(owned.base),
            remote: null,
            error:
              "Le fichier modifié est invalide : " +
              (e instanceof Error ? e.message : String(e)),
          };
        }
      } catch {
        return {
          path: owned.path,
          revision: "",
          base: structuredClone(owned.base),
          remote: null,
          error:
            "Le fichier a disparu ou est illisible. Enregistre ton travail dans un autre fichier.",
        };
      }
    });
  }
  reconcile(
    value: unknown,
    token: unknown,
    revision: unknown,
    draft: unknown,
  ): Promise<GameFile> {
    return this.serial(async () => {
      const owned = this.active;
      if (
        !owned ||
        owned.token !== token ||
        typeof revision !== "string" ||
        !revision
      )
        throw Error("Projet remplacé. Rouvre la comparaison.");
      const project = parseGameProject(value);
      parseGameDraft(draft);
      const disk = await readJsonSource(owned.path, MAX_PROJECT_BYTES);
      if (digest(disk.source) !== revision)
        throw Error(
          "Le fichier a encore changé. Relance la comparaison avant de réunir les versions.",
        );
      const folder = path.join(
        this.profile,
        "project-conflicts",
        new Date().toISOString().replaceAll(":", "-") +
          "-" +
          randomUUID().slice(0, 8),
      );
      await fs.mkdir(folder, { recursive: true });
      await atomicJson(
        path.join(folder, "base.game.json"),
        owned.base,
        false,
        MAX_PROJECT_BYTES,
      );
      await fs.writeFile(path.join(folder, "disque.game.json"), disk.source, {
        flag: "wx",
      });
      await atomicJson(
        path.join(folder, "brouillon.game.json"),
        draft,
        false,
        MAX_PROJECT_BYTES,
      );
      await atomicJson(
        path.join(folder, "reuni.game.json"),
        project,
        false,
        MAX_PROJECT_BYTES,
      );
      await atomicJson(
        path.join(folder, "origine.json"),
        { path: owned.path, revision },
        false,
      );
      // A second check also covers changes made while the backups were written.
      if (
        digest((await readJsonSource(owned.path, MAX_PROJECT_BYTES)).source) !==
        revision
      )
        throw Error(
          "Le fichier a encore changé. Relance la comparaison. Les copies ont été conservées.",
        );
      await atomicJson(owned.path, project, false, MAX_PROJECT_BYTES);
      const written = await readJsonSource(owned.path, MAX_PROJECT_BYTES);
      this.active = {
        ...owned,
        hash: digest(written.source),
        base: structuredClone(project),
      };
      await this.remember(owned.path, project).catch((e) =>
        console.warn("Recent game project", e),
      );
      return {
        project,
        path: owned.path,
        token: owned.token,
        preserved: folder,
      };
    });
  }
  recover(value: unknown, context?: unknown): Promise<void> {
    return this.serial(async () => {
      parseGameDraft(value);
      await this.preserveUnreadableRecovery();
      let validContext: ProjectRecoveryContext | undefined;
      if (context !== undefined) {
        if (
          !context ||
          typeof context !== "object" ||
          !("base" in context) ||
          !("path" in context) ||
          typeof context.path !== "string"
        )
          throw Error("Contexte du brouillon invalide.");
        validContext = {
          base: parseGameDraft(context.base),
          path: context.path,
        };
      }
      await atomicJson(
        path.join(this.profile, "game-recovery.json"),
        value,
        false,
        MAX_PROJECT_BYTES,
      );
      if (validContext) {
        await atomicJson(
          path.join(this.profile, "game-recovery.meta.json"),
          {
            hash: digest(JSON.stringify(parseGameDraft(value))),
            ...validContext,
          },
          false,
          MAX_PROJECT_BYTES,
        );
      } else
        await fs
          .unlink(path.join(this.profile, "game-recovery.meta.json"))
          .catch((e) => {
            if (e.code !== "ENOENT") throw e;
          });
    });
  }
  clearRecovery(): Promise<void> {
    return this.serial(async () => {
      await this.preserveUnreadableRecovery();
      await fs
        .unlink(path.join(this.profile, "game-recovery.json"))
        .catch((e) => {
          if (e.code !== "ENOENT") throw e;
        });
      await fs
        .unlink(path.join(this.profile, "game-recovery.meta.json"))
        .catch((e) => {
          if (e.code !== "ENOENT") throw e;
        });
    });
  }
}
/** Compatibility API for level-only publication. The same transitive preflight is mandatory.
 * Resources must already exist in the selected game's shared library. The Electron UI publishes project films with its connected library. */
export async function publishGameProject(
  value: unknown,
  gameRoot: string,
): Promise<string> {
  const project = parseGameProject(value);
  const { publishCampaign } = await import("./campaignPublisher.js");
  const result = await publishCampaign(
    project,
    gameRoot,
    path.join(gameRoot, "LunariaArtLibrary"),
  );
  return result.path;
}
