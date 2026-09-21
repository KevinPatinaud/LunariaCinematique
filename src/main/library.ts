import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Asset, AssetRef, LibrarySnapshot } from '../shared/model.js';
import { createHash } from 'node:crypto';
import { isSafeAssetRef } from '../shared/schema.js';
import { IMAGE_EXTENSIONS, AUDIO_EXTENSIONS, classifyAsset, prettyName } from '../shared/assets.js';
export { IMAGE_EXTENSIONS, AUDIO_EXTENSIONS, classifyAsset, prettyName } from '../shared/assets.js';
export const libraryKey = (root: string) => createHash('sha256').update(root).digest('hex').slice(0, 20);
export const assetUrl = (ref: AssetRef, modified: number, thumbnail = false, rootKey = '') =>
  `lunaria-asset://library/${ref.slice(10).split('/').map(encodeURIComponent).join('/')}?v=${modified}${thumbnail ? '&thumb=1' : ''}${rootKey ? '&root=' + rootKey : ''}`;
export async function scanLibrary(root: string): Promise<LibrarySnapshot> {
  const base = await fs.realpath(root), assets: Asset[] = [], warnings: string[] = [];
  let limited = false; const key = libraryKey(base);
  const warn = (message: string) => { if (warnings.length < 30) warnings.push(message); }; 
  async function visit(folder: string, depth: number): Promise<void> {
    if (limited) return;
    if (depth > 20) { warn('Profondeur maximale atteinte : ' + path.relative(base, folder)); return; }
    let entries;
    try { entries = await fs.readdir(folder, { withFileTypes: true }); }
    catch { if (depth === 0) throw new Error('La racine de la bibliothèque est inaccessible.'); warn(`Dossier inaccessible : ${path.relative(base, folder)}`); return; }
    entries.sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true }));
    for (const entry of entries) {
      if (limited) return;
      if (entry.name.startsWith('.') || ['node_modules', 'dist', 'release'].includes(entry.name) || entry.isSymbolicLink()) continue;
      const absolute = path.join(folder, entry.name);
      if (entry.isDirectory()) { await visit(absolute, depth + 1); continue; }
      const ext = path.extname(entry.name).toLowerCase();
      if (!entry.isFile() || (!IMAGE_EXTENSIONS.has(ext) && !AUDIO_EXTENSIONS.has(ext))) continue;
      if (assets.length >= 10000) { limited = true; warn('Limite de 10 000 assets atteinte. Sélectionner un sous-dossier.'); return; }
      try {
        const stat = await fs.stat(absolute);
        const relative = path.relative(base, absolute).split(path.sep).join('/');
        const ref: AssetRef = `library://${relative}`;
        if (!isSafeAssetRef(ref)) { warn(`Chemin non compatible avec library:// : ${relative}`); continue; }
        if (stat.size === 0) { warn(`Fichier vide ignoré : ${relative}`); continue; }
        assets.push({ ref, path: relative, name: prettyName(relative), folder: relative.split('/').slice(0, -1).join('/'),
          kind: classifyAsset(relative), bytes: stat.size, modified: stat.mtimeMs,
          url: assetUrl(ref, stat.mtimeMs, false, key), thumbnail: assetUrl(ref, stat.mtimeMs, true, key) });
      } catch { warn(`Fichier inaccessible : ${entry.name}`); }
    }
  }
  await visit(base, 0);
  assets.sort((a, b) => a.path.localeCompare(b.path, 'fr'));
  return { rootName: path.basename(base), rootPath: base, assets, warnings };
}
