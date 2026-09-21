/** Browsing preferences are editor-only: never add them to cinematic.json. */
import type { Asset } from './model.js';
export const LIBRARY_TABS = ['environment', 'character', 'enemy', 'prop', 'ui', 'audio'] as const;
export type LibraryTab = typeof LIBRARY_TABS[number];
export const isLibraryTab = (value: string): value is LibraryTab => (LIBRARY_TABS as readonly string[]).includes(value);
export type LibraryView = 'grid' | 'list';
export type ThumbnailSize = 'small' | 'medium' | 'large';
export interface LibraryPreferences { width: number; view: LibraryView; size: ThumbnailSize }
export const LIBRARY_PREFERENCES_KEY = 'lunaria-library-layout-v2';
export const DEFAULT_LIBRARY_PREFERENCES: LibraryPreferences = { width: 368, view: 'grid', size: 'small' };
const labels: Record<string, string> = {
  '01_europe': 'Europe', '02_africa': 'Afrique', '03_asia': 'Asie', '04_oceania': 'Océanie',
  '07_props': 'Objets de décoration', 'props': 'Objets de décoration', 'decorations': 'Objets de décoration',
  '90_global': 'Monde & références', '02_characters': 'Personnages', '05_characters': 'Personnages',
  '03_enemies': 'Ennemis', enemies: 'Ennemis', enemy: 'Ennemis', ennemis: 'Ennemis', ennemi: 'Ennemis',
  '06_ui': 'Interface', '08_ui': 'Interface',
  lunaria: 'Lunaria', interieur_serre: 'Intérieur de la serre', exterieur_et_entree: 'Extérieur & entrée',
  sanctuaire_du_tilleul: 'Sanctuaire du Tilleul', dialogues: 'Bulles de dialogue'
};
export const folderLabel = (name: string): string => labels[name] ?? name.replace(/^\d+_/, '').replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());
export const normalizeSearch = (value: string): string => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[_/\\-]+/g, ' ').toLocaleLowerCase('fr').trim();
export function assetMatchesTab(asset: Asset, tab: LibraryTab): boolean {
  return tab === 'environment' ? asset.kind === 'environment' || asset.kind === 'other' : asset.kind === tab;
}
export const isInFolder = (path: string, folder: string): boolean => !folder || path === folder || path.startsWith(folder + '/');
export interface FolderNode { path: string; label: string; count: number; children: FolderNode[] }
export function buildFolderTree(assets: readonly Asset[]): FolderNode[] {
  const roots: FolderNode[] = [], nodes = new Map<string, FolderNode>();
  for (const asset of assets) {
    let parent = '', children = roots;
    for (const part of asset.folder.split('/').filter(Boolean)) {
      const path = parent ? `${parent}/${part}` : part;
      let node = nodes.get(path);
      if (!node) { node = { path, label: folderLabel(part), count: 0, children: [] }; nodes.set(path, node); children.push(node); }
      node.count++; parent = path; children = node.children;
    }
  }
  const sort = (siblings: FolderNode[]) => { siblings.sort((a, b) => a.label.localeCompare(b.label, 'fr', { numeric: true })); siblings.forEach(n => sort(n.children)); };
  sort(roots); return roots;
}
/** Query tokens can match the file name, a path, or the displayed French folder label. */
export function filterLibraryAssets(assets: readonly Asset[], folder: string, query: string): Asset[] {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return assets.filter(asset => {
    if (!isInFolder(asset.folder, folder)) return false;
    if (!terms.length) return true;
    const haystack = normalizeSearch(`${asset.name} ${asset.path} ${asset.folder.split('/').map(folderLabel).join(' ')}`);
    return terms.every(term => haystack.includes(term));
  });
}
export function parentFolders(path: string): string[] {
  const parts = path.split('/').filter(Boolean);
  return parts.map((_, i) => parts.slice(0, i + 1).join('/'));
}
export function maxLibraryWidth(viewport: number): number {
  // Keep at least 500px for the stage at the application's supported minimum size.
  return Math.max(280, Math.min(600, viewport - (viewport <= 1350 ? 264 : 288) - 500));
}
export function clampLibraryWidth(width: number, viewport: number): number {
  return Math.round(Math.max(280, Math.min(maxLibraryWidth(viewport), Number.isFinite(width) ? width : 368)));
}
export function parseLibraryPreferences(raw: string | null): LibraryPreferences {
  try {
    const data: unknown = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { ...DEFAULT_LIBRARY_PREFERENCES };
    const p = data as Record<string, unknown>;
    return {
      width: typeof p.width === 'number' && Number.isFinite(p.width) ? Math.min(600, Math.max(280, p.width)) : 368,
      view: p.view === 'list' ? 'list' : 'grid',
      size: p.size === 'medium' || p.size === 'large' ? p.size : 'small'
    };
  } catch { return { ...DEFAULT_LIBRARY_PREFERENCES }; }
}
