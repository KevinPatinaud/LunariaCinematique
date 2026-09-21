import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { atomicJson, readJson } from './files.js';
import type { Cinematic } from '../shared/model.js';
import { MAX_PINNED_PROJECTS, MAX_RECENT_PROJECTS, projectPathKey, sortRecentProjects,
  type RecentProjectEntry, type RecentProjectsSnapshot, type ProjectAvailability } from '../shared/recentProjects.js';

const FORMAT = 'lunaria-recent-projects-v1';
const validId = (id: unknown): id is string => typeof id === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id);
const localPath = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 16000 && !/[\0\r\n]/.test(value) && path.isAbsolute(value);
const jsonPath = (value: unknown): value is string => localPath(value) && path.extname(value).toLowerCase() === '.json';
const validText = (value: unknown, max: number): value is string => typeof value === 'string' && value.length <= max;
function decode(value: unknown): RecentProjectEntry[] {
  if (!value || typeof value !== 'object' || (value as Record<string, unknown>).format !== FORMAT) throw new Error('Format d’historique inconnu.');
  const entries = (value as Record<string, unknown>).projects;
  if (!Array.isArray(entries) || entries.length > 500) throw new Error('Historique invalide.');
  const ids = new Set<string>(), paths = new Set<string>();
  const valid = entries.filter((item): item is RecentProjectEntry => {
    if (!item || typeof item !== 'object') return false;
    const p = item as RecentProjectEntry;
    return validId(p.id) && jsonPath(p.path) && validText(p.title, 200) && validText(p.cinematicId, 100)
      && Number.isInteger(p.shots) && p.shots >= 1 && p.shots <= 500
      && typeof p.lastUsedAt === 'string' && Number.isFinite(Date.parse(p.lastUsedAt))
      && (p.lastAction === 'opened' || p.lastAction === 'saved') && typeof p.pinned === 'boolean'
      && (p.libraryRoot === '' || localPath(p.libraryRoot));
  });
  // Reconstruct, don't retain arbitrary properties from a local JSON file.
  return trim(sortRecentProjects(valid).filter(p => {
    const key = projectPathKey(path.normalize(p.path));
    if (ids.has(p.id) || paths.has(key)) return false;
    ids.add(p.id); paths.add(key); return true;
  }).map(p => ({ id: p.id, path: path.normalize(p.path), title: p.title, cinematicId: p.cinematicId,
    shots: p.shots, lastUsedAt: new Date(p.lastUsedAt).toISOString(), lastAction: p.lastAction,
    pinned: p.pinned, libraryRoot: p.libraryRoot })));
}
function trim(entries: RecentProjectEntry[]): RecentProjectEntry[] {
  const sorted = sortRecentProjects(entries);
  return [...sorted.filter(p => p.pinned).slice(0, MAX_PINNED_PROJECTS), ...sorted.filter(p => !p.pinned).slice(0, MAX_RECENT_PROJECTS)];
}
async function canonical(file: string): Promise<string> {
  if (!jsonPath(file)) throw new Error('Un chemin absolu vers un fichier JSON est requis.');
  try { return await fs.realpath(file); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return path.normalize(file); throw error; }
}
async function availability(file: string): Promise<ProjectAvailability> {
  // A disconnected network drive must not freeze the entire recent-projects dialog.
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      fs.stat(file).then(s => s.isFile() ? 'available' as const : 'missing' as const).catch((error: NodeJS.ErrnoException) =>
        error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 'missing' as const : 'unavailable' as const),
      new Promise<ProjectAvailability>(resolve => { timer = setTimeout(() => resolve('unavailable'), 800); })
    ]);
  } finally { clearTimeout(timer); }
}

/** Serialized, atomic metadata registry. Mutations never delete or change project files. */
export class RecentProjects {
  private entries: RecentProjectEntry[] = [];
  private loaded = false;
  private queue: Promise<unknown> = Promise.resolve();
  private warning = '';
  private preserveInvalid = false;
  private readOnly = false;
  constructor(private readonly file: string, private readonly now: () => Date = () => new Date()) {}
  private serial<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(fn, fn); this.queue = next.catch(() => undefined); return next;
  }
  private async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const value = await readJson(this.file, 5 * 1024 * 1024);
      if (value && typeof value === 'object' && typeof (value as Record<string, unknown>).format === 'string' && (value as Record<string, unknown>).format !== FORMAT) {
        this.readOnly = true; this.warning = 'Historique créé par une autre version : il est conservé sans modification.';
      } else this.entries = decode(value);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        // Permissions/I/O failures must not be reinterpreted as an empty history and overwritten.
        if ((error as NodeJS.ErrnoException).code) throw error;
        this.preserveInvalid = true;
        try { this.entries = decode(await readJson(`${this.file}.bak`, 5 * 1024 * 1024)); this.warning = 'Historique récupéré depuis sa copie de secours.'; }
        catch { this.warning = 'Historique illisible. Les fichiers de cinématiques sont intacts ; la liste va se reconstruire aux prochaines ouvertures.'; }
      }
    }
    this.loaded = true;
  }
  private assertWritable() { if (this.readOnly) throw new Error(this.warning); }
  private async persist(next: RecentProjectEntry[]): Promise<void> {
    this.assertWritable();
    if (this.preserveInvalid) {
      await fs.copyFile(this.file, `${this.file}.invalid-${randomUUID()}`);
      // Keep the known-good .bak while replacing the corrupt primary.
      await atomicJson(this.file, { format: FORMAT, projects: next });
      this.preserveInvalid = false;
    } else await atomicJson(this.file, { format: FORMAT, projects: next }, true);
    this.entries = next; this.warning = '';
  }
  async list(checkAvailability = false): Promise<RecentProjectsSnapshot> {
    const snapshot = await this.serial(async () => { await this.load(); return { projects: structuredClone(sortRecentProjects(this.entries)), warning: this.warning }; });
    return { projects: await Promise.all(snapshot.projects.map(async p => ({ ...p, availability: checkAvailability ? await availability(p.path) : 'unchecked' as const }))),
      ...(snapshot.warning ? { warning: snapshot.warning } : {}) };
  }
  get(id: string): Promise<RecentProjectEntry> {
    return this.serial(async () => {
      await this.load(); if (!validId(id)) throw new Error('Identifiant de projet récent invalide.');
      const entry = this.entries.find(p => p.id === id); if (!entry) throw new Error('Ce projet ne figure plus dans les projets récents.');
      return structuredClone(entry);
    });
  }
  find(file: string): Promise<RecentProjectEntry | undefined> {
    return this.serial(async () => {
      await this.load(); const key = projectPathKey(await canonical(file));
      const entry = this.entries.find(p => projectPathKey(p.path) === key); return entry && structuredClone(entry);
    });
  }
  record(file: string, cinematic: Cinematic, libraryRoot: string, action: 'opened' | 'saved', previousId?: string): Promise<RecentProjectEntry> {
    return this.serial(async () => {
      await this.load(); this.assertWritable();
      if (!validText(cinematic.title, 200) || !validText(cinematic.id, 100) || !Number.isInteger(cinematic.shots?.length) || cinematic.shots.length < 1 || cinematic.shots.length > 500) throw new Error('Métadonnées de cinématique invalides.');
      if ((libraryRoot !== '' && !localPath(libraryRoot)) || !['opened', 'saved'].includes(action)) throw new Error('Métadonnées de projet invalides.');
      const target = await canonical(file), key = projectPathKey(target);
      const same = this.entries.find(p => projectPathKey(p.path) === key);
      const previous = previousId ? this.entries.find(p => p.id === previousId) : undefined;
      if (previousId && (!validId(previousId) || !previous)) throw new Error('Le projet à relocaliser n’existe plus.');
      const entry: RecentProjectEntry = { id: previous?.id ?? same?.id ?? randomUUID(), path: target,
        title: cinematic.title, cinematicId: cinematic.id, shots: cinematic.shots.length,
        lastUsedAt: this.now().toISOString(), lastAction: action, pinned: !!(previous?.pinned || same?.pinned),
        libraryRoot: libraryRoot || previous?.libraryRoot || same?.libraryRoot || '' };
      const next = trim([entry, ...this.entries.filter(p => p.id !== previous?.id && p.id !== same?.id)]);
      await this.persist(next); return structuredClone(entry);
    });
  }
  setPinned(id: string, pinned: boolean): Promise<void> {
    return this.serial(async () => {
      await this.load(); this.assertWritable();
      if (!validId(id) || typeof pinned !== 'boolean') throw new Error('Requête de projet récent invalide.');
      const entry = this.entries.find(p => p.id === id); if (!entry) throw new Error('Projet récent introuvable.');
      if (entry.pinned === pinned) return;
      if (pinned && this.entries.filter(p => p.pinned).length >= MAX_PINNED_PROJECTS) throw new Error(`Maximum ${MAX_PINNED_PROJECTS} projets épinglés. Détache un projet avant d’en épingler un autre.`);
      await this.persist(trim(this.entries.map(p => p.id === id ? { ...p, pinned } : p)));
    });
  }
  remove(id: string): Promise<void> {
    return this.serial(async () => {
      await this.load(); this.assertWritable(); if (!validId(id)) throw new Error('Identifiant de projet récent invalide.');
      await this.persist(this.entries.filter(p => p.id !== id));
    });
  }
  clearUnpinned(): Promise<void> {
    return this.serial(async () => { await this.load(); await this.persist(this.entries.filter(p => p.pinned)); });
  }
  flush(): Promise<unknown> { return this.queue; }
}
