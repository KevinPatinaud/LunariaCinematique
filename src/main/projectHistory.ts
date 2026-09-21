import type { Cinematic, LibrarySnapshot, OpenResult } from '../shared/model.js';
import type { RecentProjectEntry } from '../shared/recentProjects.js';
import { DocumentFiles } from './documents.js';
import { RecentProjects } from './recentProjects.js';

export interface ProjectLibrary {
  current(): LibrarySnapshot | null;
  select(root: string): Promise<LibrarySnapshot>;
  disconnect(): void;
}
const detail = (error: unknown) => error instanceof Error ? error.message : String(error);
/** Coordinates existing documents, metadata and library reconnection; no renderer-supplied paths. */
export class ProjectHistory {
  constructor(private readonly documents: DocumentFiles, private readonly recents: RecentProjects, private readonly library: ProjectLibrary) {}
  async openPath(file: string): Promise<OpenResult> {
    let recent: RecentProjectEntry | undefined;
    const warnings: string[] = [];
    try { recent = await this.recents.find(file); }
    catch (error) { warnings.push('Historique indisponible : ' + detail(error)); }
    return this.open(file, recent, warnings);
  }
  async openRecent(id: string): Promise<OpenResult> {
    const recent = await this.recents.get(id);
    return this.open(recent.path, recent);
  }
  async relocate(id: string, selectedFile: string): Promise<OpenResult> {
    const recent = await this.recents.get(id);
    return this.open(selectedFile, recent, [], true);
  }
  private async open(file: string, recent?: RecentProjectEntry, warnings: string[] = [], relocate = false): Promise<OpenResult> {
    // Parse/read succeeds before the current token, recovery, library or MRU changes.
    const result = await this.documents.open(file);
    let library = this.library.current();
    const rememberedRoot = recent?.libraryRoot ?? '';
    if (rememberedRoot && rememberedRoot !== library?.rootPath) {
      try { library = await this.library.select(rememberedRoot); }
      catch (error) {
        // Never display a different library's images under the same relative refs.
        this.library.disconnect(); library = null;
        warnings.push(`Bibliothèque à reconnecter : ${rememberedRoot}. ${detail(error)}`);
      }
    }
    try { await this.recents.record(file, result.cinematic, library?.rootPath || rememberedRoot, 'opened', relocate ? recent?.id : undefined); }
    catch (error) { warnings.push('Cinématique ouverte, mais historique non mis à jour : ' + detail(error)); }
    return { ...result, library, ...(warnings.length ? { warnings } : {}) };
  }
  async save(file: string, input: Cinematic, token: string, libraryRoot: string): Promise<{ cinematic: Cinematic; warnings: string[] }> {
    const cinematic = await this.documents.save(file, input, token, libraryRoot);
    const warnings: string[] = [];
    // A metadata write failing cannot make a successful document save look like a failure.
    try { await this.recents.record(file, cinematic, libraryRoot, 'saved'); }
    catch (error) { warnings.push('Cinématique enregistrée, mais historique non mis à jour : ' + detail(error)); }
    return { cinematic, warnings };
  }
}
