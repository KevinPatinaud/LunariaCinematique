import { promises as fs } from "node:fs";
import path from "node:path";
import { atomicJson, isWithin, readJson } from "./files.js";
import { imageTaskActive, type ImageTaskStatus } from "../shared/imageTasks.js";

/** One native image invocation at a time across all processors. Cancelled work
 * keeps its slot until the processor has actually stopped. */
export class ImageTaskQueue {
  private pending: { signal: AbortSignal; run: () => Promise<void> }[] = [];
  private running = false;
  enqueue(signal: AbortSignal, run: () => Promise<void>) {
    this.pending.push({ signal, run });
    this.next();
  }
  private next() {
    if (this.running) return;
    let task = this.pending.shift();
    while (task?.signal.aborted) task = this.pending.shift();
    if (!task) return;
    this.running = true;
    void task
      .run()
      .catch(() => undefined)
      .finally(() => {
        this.running = false;
        this.next();
      });
  }
}
export interface ImageRecord {
  job: {
    id: string;
    status: ImageTaskStatus;
    message: string;
    createdAt?: string;
    updatedAt?: string;
  };
  libraryRoot: string;
  folder: string;
  abort: AbortController;
}
type StoredImageRecord<R extends ImageRecord> = Omit<R, "abort" | "folder"> & {
  version: 1;
};
/** Durable lifecycle shared by terrain and panorama processors. Old folders
 * without manifests are left intact; never guess their destination or request. */
export class ImageJobStore<R extends ImageRecord> {
  readonly records = new Map<string, R>();
  private writes = new Map<string, Promise<void>>();
  private running = new Map<string, Promise<void>>();
  private removed = new Set<string>();
  constructor(
    readonly root: string,
    readonly queue = new ImageTaskQueue(),
  ) {}
  async load(
    restore: (data: StoredImageRecord<R>, folder: string) => Promise<R>,
  ) {
    await fs.mkdir(this.root, { recursive: true });
    const root = await fs.realpath(this.root);
    for (const entry of await fs.readdir(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || !/^[a-f0-9-]{36}$/.test(entry.name)) continue;
      try {
        const folder = path.join(root, entry.name);
        if ((await fs.realpath(folder)) !== folder) continue;
        const manifest = path.join(folder, "job.json");
        if (!isWithin(folder, await fs.realpath(manifest))) continue;
        const data = (await readJson(
          manifest,
          64 * 1024,
        )) as StoredImageRecord<R>;
        if (
          data.version !== 1 ||
          data.job?.id !== entry.name ||
          !path.isAbsolute(data.libraryRoot)
        )
          continue;
        const record = await restore(data, folder);
        this.records.set(record.job.id, record);
        await this.save(record);
      } catch {
        /* A corrupt manifest cannot break the Studio or grant file access. */
      }
    }
  }
  async localFile(folder: string, name: unknown) {
    if (typeof name !== "string" || path.basename(name) !== name)
      throw Error("Fichier de tâche invalide.");
    const file = path.join(folder, name);
    if (!isWithin(folder, await fs.realpath(file)))
      throw Error("Fichier de tâche hors du dossier.");
    return file;
  }
  save(record: R): Promise<void> {
    const id = record.job.id;
    if (this.removed.has(id)) return Promise.resolve();
    record.job.updatedAt = new Date().toISOString();
    const { abort, folder, ...data } = record;
    const serialized = JSON.parse(JSON.stringify({ ...data, version: 1 }));
    const previous = this.writes.get(id) ?? Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(() =>
        atomicJson(path.join(folder, "job.json"), serialized, false, 64 * 1024),
      );
    this.writes.set(id, next);
    // Callers await important transitions. Progress-only updates remain observed.
    void next.catch(() => {
      record.job.message =
        "Historique indisponible sur disque. Conserve le Studio ouvert pour récupérer le résultat.";
    });
    return next;
  }
  async register(record: R, run: () => Promise<void>) {
    record.job.createdAt = new Date().toISOString();
    record.job.status = "queued";
    record.job.message = "En attente dans la file de génération.";
    await this.save(record);
    this.records.set(record.job.id, record);
    this.queue.enqueue(record.abort.signal, () => {
      const operation = this.execute(record, run);
      this.running.set(record.job.id, operation);
      return operation.finally(() => this.running.delete(record.job.id));
    });
  }
  private async execute(record: R, run: () => Promise<void>) {
    record.job.status = "generating";
    record.job.message = "Génération de l’image…";
    try {
      await this.save(record);
      if (!record.abort.signal.aborted) await run();
    } catch (error) {
      if (!record.abort.signal.aborted) {
        record.job.status = "failed";
        record.job.message =
          error instanceof Error ? error.message : String(error);
      }
    } finally {
      await this.save(record).catch(() => undefined);
    }
  }
  async remove(id: string) {
    const record = this.records.get(id);
    if (!record) throw Error("Tâche inconnue.");
    if (imageTaskActive(record.job.status))
      throw Error("Annule la tâche avant de la retirer.");
    // Make deletion exclusive before yielding: a concurrent apply/get cannot
    // acquire a record whose scratch files are being removed.
    this.removed.add(id);
    this.records.delete(id);
    try {
      await this.running.get(id)?.catch(() => undefined);
      // Only remove this job's scratch folder. Library images, backups and native
      // provider outputs outside this directory are never deleted.
      await this.writes.get(id)?.catch(() => undefined);
      const root = await fs.realpath(this.root),
        folder = await fs.realpath(record.folder);
      if (path.dirname(folder) !== root || path.basename(folder) !== id)
        throw Error("Dossier de tâche invalide.");
      await fs.rm(folder, { recursive: true, force: true });
      this.writes.delete(id);
    } catch (error) {
      this.removed.delete(id);
      this.records.set(id, record);
      throw error;
    }
  }
  async close() {
    for (const record of this.records.values())
      if (["queued", "generating"].includes(record.job.status)) {
        record.abort.abort();
        record.job.status = "interrupted";
        record.job.message =
          "Le Studio a fermé pendant la génération. Relance cette tâche quand tu le souhaites.";
        void this.save(record);
      }
    await Promise.allSettled(this.running.values());
    await Promise.allSettled(this.writes.values());
  }
  async flush() {
    await Promise.all(this.writes.values());
  }
}
