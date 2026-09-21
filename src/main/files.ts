import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { isSafeAssetRef } from '../shared/schema.js';

export function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}
/** Recheck real paths on every read; symlinks cannot escape the selected root. */
export async function resolveAsset(root: string, ref: string): Promise<string> {
  if (!isSafeAssetRef(ref)) throw new Error('Référence de bibliothèque invalide.');
  const base = await fs.realpath(root);
  const candidate = path.resolve(base, ...ref.slice(10).split('/'));
  if (!isWithin(base, candidate)) throw new Error('Accès hors de la bibliothèque refusé.');
  const real = await fs.realpath(candidate);
  if (!isWithin(base, real)) throw new Error('Lien symbolique hors de la bibliothèque refusé.');
  if (!(await fs.stat(real)).isFile()) throw new Error('La référence ne désigne pas un fichier.');
  return real;
}
export async function readJsonSource(file: string, maxBytes = 5 * 1024 * 1024): Promise<{ value: unknown; source: string }> {
  const handle = await fs.open(file, 'r');
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > maxBytes) throw new Error('Fichier JSON trop volumineux ou invalide (maximum 5 Mo).');
    // A bounded read also protects against a file growing after stat().
    const buffer = Buffer.alloc(maxBytes + 1);
    let offset = 0;
    while (offset <= maxBytes) {
      const { bytesRead } = await handle.read(buffer, offset, buffer.length - offset, null);
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset > maxBytes) throw new Error('Fichier JSON trop volumineux.');
    const source = buffer.subarray(0, offset).toString('utf8');
    return { value: JSON.parse(source.replace(/^\uFEFF/, '')), source };
  } finally { await handle.close(); }
}
export async function readJson(file: string, maxBytes?: number): Promise<unknown> {
  return (await readJsonSource(file, maxBytes)).value;
}
async function replaceWithRetry(from: string, to: string): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    try { await fs.rename(from, to); return; }
    catch (error) {
      if (attempt >= 4 || !['EBUSY', 'EPERM', 'EACCES'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
      await new Promise(resolve => setTimeout(resolve, 40 * (attempt + 1)));
    }
  }
}
/** Temporary sibling + fsync + replace; optional .bak preserves the previous JSON. */
export async function atomicJson(file: string, value: unknown, backup = false): Promise<void> {
  const temporary = `${file}.${randomUUID()}.tmp`, backupTemporary = `${temporary}.bak`;
  const serialized = JSON.stringify(value, null, 2) + '\n';
  if (Buffer.byteLength(serialized, 'utf8') > 5 * 1024 * 1024) throw new Error('Le document dépasse 5 Mo. Répartis cette cinématique en plusieurs fichiers.');
  await fs.mkdir(path.dirname(file), { recursive: true });
  let handle;
  try {
    handle = await fs.open(temporary, 'wx', 0o600);
    await handle.writeFile(serialized, 'utf8');
    await handle.sync(); await handle.close(); handle = undefined;
    if (backup) {
      try {
        // Replace the backup itself, never follow a pre-existing .bak symlink.
        await fs.copyFile(file, backupTemporary);
        await replaceWithRetry(backupTemporary, `${file}.bak`);
      }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    }
    // Windows may briefly lock the destination. Never unlink the original.
    await replaceWithRetry(temporary, file);
  } finally {
    if (handle) await handle.close().catch(() => undefined);
    await fs.unlink(temporary).catch(() => undefined);
    await fs.unlink(backupTemporary).catch(() => undefined);
  }
}
