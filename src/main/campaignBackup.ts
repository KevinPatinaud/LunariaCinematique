import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, promises as fs, constants } from 'node:fs';
import path from 'node:path';
import { atomicJson, isWithin, readJsonSource, resolveAsset } from './files.js';
import { isSafeAssetRef } from '../shared/schema.js';
import { parseGameProject } from '../shared/game/validation.js';
import { presentationAssets } from '../shared/presentation/runtime.js';
import { referencedAssets } from '../shared/model.js';
import type { CampaignBackupResult, GameProject } from '../shared/game/types.js';

const PROJECT_FILE = 'lunaria.game.json';
const LIBRARY = 'LunariaArtLibrary';
const MANIFEST = 'sauvegarde.lunaria.json';
interface BackupFile { path: string; bytes: number; sha256: string }
interface BackupManifest {
  kind: 'lunaria-campaign-backup'; schemaVersion: 1; createdAt: string;
  projectFile: typeof PROJECT_FILE; libraryDirectory: typeof LIBRARY; files: BackupFile[];
}
export function campaignBackupAssets(project: GameProject): string[] {
  // Preserve every authoring resource, including unused films, levels and archived species.
  const refs = new Set(presentationAssets(project));
  for (const film of project.cinematics ?? []) for (const ref of referencedAssets(film)) refs.add(ref);
  return [...refs].sort();
}
async function fingerprint(file: string): Promise<{ bytes: number; sha256: string }> {
  const hash = createHash('sha256'); let bytes = 0;
  for await (const chunk of createReadStream(file)) { hash.update(chunk); bytes += chunk.length; }
  return { bytes, sha256: hash.digest('hex') };
}
function completeProject(value: unknown): GameProject {
  const project = parseGameProject(value);
  for (const film of project.campaign?.cinematics ?? [])
    if (!project.cinematics?.some(doc => doc.id === film.documentId))
      throw Error(`Intègre la cinématique « ${film.title} » au projet avant de sauvegarder la campagne.`);
  return project;
}
/** Separate snapshot: never saves, replaces or marks the author's working document clean. */
export async function createCampaignBackup(value: unknown, libraryRoot: string, destination: string, now = new Date()): Promise<CampaignBackupResult> {
  const project = completeProject(value), refs = campaignBackupAssets(project);
  if (refs.length && !libraryRoot) throw Error('Connecte la bibliothèque d’images et de sons avant de sauvegarder la campagne complète.');
  const sources: { ref: string; source: string; bytes: number; sha256: string }[] = [];
  const folded = new Map<string, string>();
  for (const ref of refs) {
    const relative = ref.slice(10), key = relative.normalize('NFC').toLowerCase(), prior = folded.get(key);
    if (prior && prior !== relative) throw Error(`Deux ressources ont un nom incompatible avec la sauvegarde : ${prior} / ${relative}`);
    folded.set(key, relative);
    const source = await resolveAsset(libraryRoot, ref).catch(() => { throw Error('Ressource introuvable pour la sauvegarde : ' + ref); });
    sources.push({ ref, source, ...await fingerprint(source) });
  }
  const parent = await fs.realpath(destination);
  if (!(await fs.stat(parent)).isDirectory()) throw Error('Choisis un dossier pour conserver la sauvegarde.');
  const title = project.title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/[. ]+$/g, '').slice(0, 60) || 'Lunaria';
  const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}-${String(now.getSeconds()).padStart(2,'0')}`;
  const folder = path.join(parent, `${title} - sauvegarde ${date} - ${randomUUID().slice(0,8)}`);
  const staging = await fs.mkdtemp(path.join(parent, '.lunaria-sauvegarde-'));
  try {
    const files: BackupFile[] = [];
    await fs.mkdir(path.join(staging, LIBRARY));
    for (const item of sources) {
      const relative = `${LIBRARY}/${item.ref.slice(10)}`, target = path.join(staging, ...relative.split('/'));
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.copyFile(item.source, target, constants.COPYFILE_EXCL);
      const copied = await fingerprint(target);
      if (copied.bytes !== item.bytes || copied.sha256 !== item.sha256) throw Error('Une ressource a changé pendant la sauvegarde : ' + item.ref);
      files.push({ path: relative, ...copied });
    }
    const file = path.join(staging, PROJECT_FILE);
    await atomicJson(file, project, false, 32*1024*1024);
    files.unshift({ path: PROJECT_FILE, ...await fingerprint(file) });
    const manifest: BackupManifest = { kind: 'lunaria-campaign-backup', schemaVersion: 1, createdAt: now.toISOString(), projectFile: PROJECT_FILE, libraryDirectory: LIBRARY, files };
    await atomicJson(path.join(staging, MANIFEST), manifest);
    await fs.writeFile(path.join(staging, 'LIRE_MOI.txt'), 'Sauvegarde complète de la campagne Lunaria\r\n\r\nConserve et déplace ce dossier entier.\r\nDans Lunaria Studio, utilise Ouvrir un projet et choisis lunaria.game.json.\r\nLe Studio vérifie la sauvegarde et connecte automatiquement ses images et sons.\r\nEnregistrer demandera un nouveau fichier de travail pour préserver cette sauvegarde.\r\n', { flag: 'wx' });
    // A distinct name on every run keeps earlier snapshots, even within the same second.
    await fs.rename(staging, folder);
    return { folder, path: path.join(folder, PROJECT_FILE), assets: refs.length, bytes: files.reduce((total, item) => total + item.bytes, 0) };
  } catch (error) {
    // Only this operation's freshly created directory can be removed on failure.
    if (isWithin(parent, staging) && staging !== parent && await fs.realpath(staging).catch(() => '') === staging)
      await fs.rm(staging, { recursive: true, force: true });
    throw error;
  }
}
/** Recognize a portable snapshot and verify it before opening or connecting its library. */
export async function campaignBackupLibrary(projectFile: string): Promise<string | null> {
  if (path.basename(projectFile) !== PROJECT_FILE) return null;
  const folder = await fs.realpath(path.dirname(projectFile)), manifestPath = path.join(folder, MANIFEST);
  let value: unknown;
  try { value = (await readJsonSource(manifestPath)).value; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
  const manifest = value as BackupManifest;
  if (!manifest || manifest.kind !== 'lunaria-campaign-backup' || manifest.schemaVersion !== 1 || manifest.projectFile !== PROJECT_FILE || manifest.libraryDirectory !== LIBRARY || !Array.isArray(manifest.files))
    throw Error('Le manifeste de sauvegarde Lunaria est invalide.');
  const seen = new Set<string>();
  for (const item of manifest.files) {
    if (!item || typeof item.path !== 'string' || (item.path !== PROJECT_FILE && !item.path.startsWith(LIBRARY+'/')) || !isSafeAssetRef('library://'+item.path) || !Number.isSafeInteger(item.bytes) || item.bytes < 0 || typeof item.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(item.sha256) || seen.has(item.path))
      throw Error('Le manifeste de sauvegarde Lunaria est invalide.');
    seen.add(item.path);
    const file = await fs.realpath(path.join(folder, ...item.path.split('/'))).catch(() => { throw Error('Fichier absent de la sauvegarde : '+item.path); });
    if (!isWithin(folder, file) || !(await fs.stat(file)).isFile()) throw Error('Fichier hors de la sauvegarde : '+item.path);
    const actual = await fingerprint(file);
    if (actual.bytes !== item.bytes || actual.sha256 !== item.sha256) throw Error('Sauvegarde modifiée ou endommagée : '+item.path);
  }
  if (!seen.has(PROJECT_FILE)) throw Error('Le projet manque dans le manifeste de sauvegarde.');
  const project = completeProject((await readJsonSource(path.join(folder, PROJECT_FILE), 32*1024*1024)).value);
  for (const ref of campaignBackupAssets(project)) if (!seen.has(`${LIBRARY}/${ref.slice(10)}`)) throw Error('Ressource absente du manifeste de sauvegarde : '+ref);
  const library = await fs.realpath(path.join(folder, LIBRARY));
  if (!isWithin(folder, library) || !(await fs.stat(library)).isDirectory()) throw Error('Bibliothèque de sauvegarde invalide.');
  return library;
}
