import { copy, referencedAssets, type Asset, type Cinematic, type LibrarySnapshot, type LocalVersion, type VersionSummary, type StudioAPI } from '../shared/model.js';
import { parseCinematic, isSafeAssetRef } from '../shared/schema.js';
import { prepareCinematic } from '../shared/geometry.js';
import { classifyAsset, prettyName, isImage, isAudio } from '../shared/assets.js';
declare global { interface Window { lunaria?: StudioAPI } }
let library: LibrarySnapshot | null = null, token = crypto.randomUUID() as string;
let urls: string[] = [], libraryRevision = 0, historyKey = crypto.randomUUID() as string;
let lastVersionAt = 0;
const versionStorage = () => 'lunaria-versions-v13:' + historyKey;
function readVersions(): LocalVersion[] {
  try { const value=JSON.parse(localStorage.getItem(versionStorage())??'[]');
    return Array.isArray(value)?value.filter(v=>{try{return !!parseCinematic(v.cinematic) && typeof v.id==='string';}catch{return false;}}).slice(0,20):[];
  } catch { return []; }
}
const versionSummary=({cinematic: _cinematic,...value}:LocalVersion):VersionSummary=>value;
function checkpoint(input: Parameters<StudioAPI['createVersion']>[0], label: string, auto=false):VersionSummary {
  const previous=readVersions(), cinematic=copy(parseCinematic(input)), latest=previous[0], now=Date.now(), libraryRoot=library?.rootPath??'';
  if (auto && latest && ((JSON.stringify(latest.cinematic)===JSON.stringify(cinematic) && latest.libraryRoot===libraryRoot) || now-(lastVersionAt||Date.parse(latest.createdAt))<30000)) return versionSummary(latest);
  const version:LocalVersion={id:crypto.randomUUID(),createdAt:new Date(now).toISOString(),label,title:cinematic.title,shots:cinematic.shots.length,libraryRoot,cinematic};
  localStorage.setItem(versionStorage(),JSON.stringify([version,...previous].slice(0,20))); lastVersionAt=now; return versionSummary(version);
}
function checkToken(requestToken:string) {if(requestToken!==token) throw new Error('La cinématique active a changé.');} 
function releaseUrls() { urls.forEach(URL.revokeObjectURL); urls = []; }
function assetsFromPaths(paths: { path: string; url: string; bytes: number; modified: number }[]): Asset[] {
  return paths.filter(p => (isImage(p.path) || isAudio(p.path)) && isSafeAssetRef(`library://${p.path}`)).map(p => ({
    ref: `library://${p.path}` as const, path: p.path, name: prettyName(p.path), folder: p.path.split('/').slice(0, -1).join('/'),
    kind: classifyAsset(p.path), bytes: p.bytes, modified: p.modified, url: p.url, thumbnail: p.url
  })).sort((a,b) => a.path.localeCompare(b.path, 'fr'));
}
function pickFiles(directory = false): Promise<FileList | null> {
  return new Promise(resolve => {
    const input = document.createElement('input'); input.type = 'file';
    if (directory) { input.setAttribute('webkitdirectory', ''); input.multiple = true; } else input.accept = '.json';
    input.style.display = 'none'; document.body.append(input);
    let done = false;
    const finish = (files: FileList | null) => { if (done) return; done = true; resolve(files); input.remove(); };
    input.addEventListener('change', () => finish(input.files), { once: true });
    input.addEventListener('cancel', () => finish(null), { once: true }); input.click();
  });
}
function ask(message: string, options: string[]): Promise<number> {
  return new Promise(resolve => {
    const dialog = document.createElement('dialog'); dialog.className = 'confirm-dialog';
    const heading = document.createElement('h2'); heading.textContent = message; dialog.append(heading);
    const actions = document.createElement('div'); actions.className = 'modal-actions'; dialog.append(actions);
    const finish = (choice: number) => { dialog.close(); dialog.remove(); resolve(choice); };
    options.forEach((label,index) => { const button = document.createElement('button'); button.className = 'button subtle'; button.textContent = label; button.onclick = () => finish(index); actions.append(button); });
    dialog.oncancel = e => { e.preventDefault(); finish(options.length - 1); };
    dialog.addEventListener('keydown', e => e.stopPropagation());
    document.body.append(dialog); dialog.showModal();
  });
}
const desktopOnly = () => { throw new Error('Les projets récents avec accès direct aux fichiers sont disponibles dans l’application Electron. Utilise Ouvrir en mode navigateur.'); };
const browser: StudioAPI = {
  async listRecentProjects() { return { projects: [], warning: 'Mode navigateur : utilise Ouvrir pour sélectionner à nouveau le JSON. Les projets récents persistants sont disponibles dans l’application Electron.' }; },
  async openRecentProject() { return desktopOnly(); },
  async locateRecentProject() { return desktopOnly(); },
  async setRecentProjectPinned() { desktopOnly(); },
  async removeRecentProject() { desktopOnly(); },
  async clearRecentProjects() { desktopOnly(); },
  async revealRecentProject() { desktopOnly(); },
  async bootstrap() {
    let recovery: Cinematic | null = null, recoveryLibraryRoot = '';
    try { const raw = localStorage.getItem('lunaria-recovery-v1'); if (raw) { const data = JSON.parse(raw); recovery = parseCinematic(data.format === 'lunaria-recovery-v2' ? data.cinematic : data); recoveryLibraryRoot = data.libraryRoot ?? ''; if (typeof data.historyKey==='string') historyKey=data.historyKey; } } catch { /* Invalid recovery is never interpreted as executable data. */ }
    return { library, recovery, recoveryLibraryRoot, documentToken: token, desktop: false };
  },
  async resetDocument() { historyKey = crypto.randomUUID(); lastVersionAt=0; token = crypto.randomUUID(); localStorage.removeItem('lunaria-recovery-v1'); return token; },
  async listVersions(requestToken) { checkToken(requestToken); return readVersions().map(versionSummary); },
  async createVersion(cinematic,requestToken,label) { checkToken(requestToken); return checkpoint(cinematic,label); },
  async loadVersion(requestToken,id) { checkToken(requestToken); const version=readVersions().find(v=>v.id===id); if(!version) throw new Error('Version introuvable.'); return copy(version); },
  async discardRecovery(requestToken) { if (requestToken === token) {localStorage.removeItem('lunaria-recovery-v1');historyKey=crypto.randomUUID();lastVersionAt=0;} },
  async confirmUnsaved(reason) { return (['save','discard','cancel'] as const)[await ask(reason, ['Enregistrer','Continuer sans enregistrer','Annuler'])]; },
  async confirmDelete(name) { return await ask(`Supprimer « ${name} » ?`, ['Supprimer','Annuler']) === 0; },
  async closeWindow() { window.close(); },
  onCloseRequested() { return () => undefined; },
  async chooseLibrary() {
    const files = await pickFiles(true); if (!files?.length) return null;
    const retained = [...files].filter(file => (isImage(file.name) || isAudio(file.name)) && file.size > 0);
    if (retained.length > 10000) throw new Error('Bibliothèque trop volumineuse : maximum 10 000 ressources.');
    const paths = retained.map(file => {
      const url = URL.createObjectURL(file);
      return { path: file.webkitRelativePath.split('/').slice(1).join('/'), url, bytes: file.size, modified: file.lastModified };
    });
    releaseUrls(); urls = paths.map(p => p.url);
    const rootName = files[0].webkitRelativePath.split('/')[0];
    library = { rootName, rootPath: `browser:${rootName}:${++libraryRevision}`, assets: assetsFromPaths(paths), warnings: ['Mode navigateur : rouvrir le dossier pour détecter les nouveaux fichiers.'] };
    if (library.assets.length !== paths.length) library.warnings.push('Certains chemins ne sont pas compatibles avec library:// et ont été ignorés.');
    return library;
  },
  async exampleLibrary() {
    const response = await fetch(new URL('sample-manifest.json', location.href));
    if (!response.ok) throw new Error('Bibliothèque exemple introuvable.');
    const paths = await response.json() as string[];
    if (!Array.isArray(paths) || paths.some(p => typeof p !== 'string' || !isSafeAssetRef(`library://${p}`))) throw new Error('Manifeste exemple invalide.');
    releaseUrls();
    library = { rootName: 'Bibliothèque exemple', rootPath: 'example-library/', warnings: [],
      assets: assetsFromPaths(paths.map(path => ({ path, url: new URL(path.split('/').map(encodeURIComponent).join('/'), location.href).href, bytes: 0, modified: 0 }))) };
    return library;
  },
  async refreshLibrary() { return library; },
  async openCinematic() {
    const files = await pickFiles(); if (!files?.length) return null;
    if (files[0].size > 5 * 1024 * 1024) throw new Error('JSON trop volumineux (maximum 5 Mo).');
    const cinematic = parseCinematic(JSON.parse((await files[0].text()).replace(/^\uFEFF/, '')));
    token = crypto.randomUUID(); historyKey = 'file:'+files[0].name; lastVersionAt=0; localStorage.removeItem('lunaria-recovery-v1');
    return { path: files[0].name, cinematic, documentToken: token };
  },
  async saveCinematic(input, _saveAs, requestToken) {
    if (requestToken !== token) throw new Error('La cinématique active a changé.');
    const cinematic = parseCinematic(prepareCinematic(parseCinematic(copy(input))));
    const blob = new Blob([JSON.stringify(cinematic, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url;
    link.download = cinematic.id.replace(/[^a-zA-Z0-9_-]/g, '_') + '.cinematic.json'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    // Keep browser recovery: a download request does not prove that the user saved it.
    return { path: link.download, cinematic, missing: referencedAssets(cinematic).filter(ref => !library?.assets.some(a => a.ref === ref)) };
  },
  async autosave(cinematic, requestToken) {
    if (token === requestToken) { localStorage.setItem('lunaria-recovery-v1', JSON.stringify({ format: 'lunaria-recovery-v2', historyKey, libraryRoot: library?.rootPath ?? '', cinematic: parseCinematic(cinematic) })); checkpoint(cinematic,'Sauvegarde automatique',true); }
  },
  setDirty() { /* beforeunload handled in App */ },
  onLibraryChanged() { return () => undefined; }
};
export const api: StudioAPI = window.lunaria ?? browser;
