/** File lifecycle independent from Electron. Every operation belongs to a document token. */
import { promises as fs } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { VersionStore, fileVersionKey, validVersionKey } from './versions.js';
import { atomicJson, readJson, readJsonSource } from './files.js';
import { copy, type Cinematic, type OpenResult } from '../shared/model.js';
import { parseCinematic } from '../shared/schema.js';
import { prepareCinematic } from '../shared/geometry.js';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export class DocumentFiles {
  token = randomUUID() as string;
  currentFile = '';
  private diskHash: string | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private versionKey = randomUUID() as string;
  private readonly versions: VersionStore;
  private lastDraft: Cinematic | null = null;
  private lastRoot = '';
  constructor(private readonly recoveryPath: string) { this.versions = new VersionStore(path.join(path.dirname(recoveryPath), 'versions')); }
  private async checkpointLast() {
    if (this.lastDraft) await this.versions.create(this.versionKey, this.lastDraft, this.lastRoot, 'Avant changement de projet', true, 0);
  }
  listVersions(token: string) { return this.serial(async () => { this.assertToken(token); return this.versions.list(this.versionKey); }); }
  createVersion(input: Cinematic, token: string, label: string, libraryRoot = '') {
    const requested = copy(input);
    return this.serial(async () => { this.assertToken(token); return this.versions.create(this.versionKey, requested, libraryRoot, label); });
  }
  loadVersion(token: string, id: string) { return this.serial(async () => { this.assertToken(token); return this.versions.load(this.versionKey, id); }); }
  private serial<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(fn, fn);
    this.queue = next.catch(() => undefined);
    return next;
  }
  private assertToken(token: string): void {
    if (!token || token !== this.token) throw new Error('Opération annulée : la cinématique active a changé.');
  }
  async recovery(): Promise<{ cinematic: Cinematic | null; libraryRoot: string }> {
    return this.serial(async () => {
      try {
        const value = await readJson(this.recoveryPath, 6 * 1024 * 1024) as Record<string, unknown>;
        const wrapped = value?.format === 'lunaria-recovery-v2';
        const cinematic = copy(parseCinematic(wrapped ? value.cinematic : value));
        if (wrapped && validVersionKey(value.historyKey)) this.versionKey = value.historyKey;
        return { cinematic, libraryRoot: wrapped && typeof value.libraryRoot === 'string' ? value.libraryRoot : '' };
      } catch { return { cinematic: null, libraryRoot: '' }; }
    });
  }
  reset(): Promise<string> {
    return this.serial(async () => {
      await this.checkpointLast();
      await this.unlinkRecovery();
      this.versionKey = randomUUID(); this.lastDraft = null; this.lastRoot = '';
      this.token = randomUUID(); this.currentFile = ''; this.diskHash = null;
      return this.token;
    });
  }
  open(file: string): Promise<OpenResult> {
    return this.serial(async () => {
      // Do not reset the previous session when parsing fails.
      const { value, source } = await readJsonSource(file);
      const cinematic = copy(parseCinematic(value));
      const fingerprint = hash(source);
      await this.checkpointLast();
      await this.unlinkRecovery();
      this.versionKey = fileVersionKey(file); this.lastDraft = null; this.lastRoot = '';
      this.currentFile = file; this.diskHash = fingerprint; this.token = randomUUID();
      return { path: file, cinematic, documentToken: this.token };
    });
  }
  save(file: string, input: Cinematic, token: string, libraryRoot = ''): Promise<Cinematic> {
    const requested = copy(input);
    return this.serial(async () => {
      this.assertToken(token);
      const cinematic = parseCinematic(prepareCinematic(parseCinematic(requested)));
      if (file === this.currentFile && this.diskHash !== null) {
        let fingerprint: string;
        try { fingerprint = hash(await fs.readFile(file, 'utf8')); }
        catch { throw new Error('Le fichier ouvert a été déplacé ou supprimé. Utilise Enregistrer sous pour choisir la destination.'); }
        if (fingerprint !== this.diskHash) throw new Error('Le fichier a été modifié par un autre programme depuis son ouverture. Utilise Enregistrer sous pour préserver les deux versions.');
      }
      const versionKey = fileVersionKey(file);
      await this.versions.fork(this.versionKey, versionKey);
      await this.versions.create(versionKey, requested, libraryRoot || this.lastRoot, 'Enregistrement', true, 0);
      await atomicJson(file, cinematic, true);
      this.versionKey = versionKey; this.lastDraft = copy(requested); this.lastRoot = libraryRoot || this.lastRoot;
      this.currentFile = file; this.diskHash = hash(JSON.stringify(cinematic, null, 2) + '\n');
      await this.unlinkRecovery();
      return cinematic;
    });
  }
  autosave(input: Cinematic, token: string, libraryRoot = ''): Promise<void> {
    const requested = copy(input);
    return this.serial(async () => {
      if (token !== this.token) return; // A queued snapshot of a closed document is obsolete.
      const cinematic = parseCinematic(requested); // Keep authoring data; don't turn warnings into data loss.
      await atomicJson(this.recoveryPath, { format: 'lunaria-recovery-v2', historyKey: this.versionKey, libraryRoot, cinematic });
      this.lastDraft = copy(cinematic); this.lastRoot = libraryRoot;
      await this.versions.create(this.versionKey, cinematic, libraryRoot, 'Sauvegarde automatique', true);
    });
  }
  discardRecovery(token: string): Promise<void> {
    return this.serial(async () => { this.assertToken(token); await this.unlinkRecovery(); if (!this.currentFile && !this.lastDraft) this.versionKey = randomUUID(); });
  }
  flush(): Promise<unknown> { return this.queue; }
  private async unlinkRecovery(): Promise<void> {
    try { await fs.unlink(this.recoveryPath); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }
}
