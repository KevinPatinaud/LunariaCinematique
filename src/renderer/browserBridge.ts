import { type Asset, type Cinematic, type LibrarySnapshot, type StudioAPI } from '../shared/model.js';
import { isSafeAssetRef } from '../shared/schema.js';
import { classifyAsset, prettyName, isImage, isAudio } from '../shared/assets.js';
declare global { interface Window { lunaria?: StudioAPI } }
let library: LibrarySnapshot | null = null;
let urls: string[] = [], libraryRevision = 0;
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
  async bootstrap() { return { library, desktop: false }; },
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
  async revealLibraryAsset() { throw new Error('L’Explorateur est accessible depuis l’application de bureau.'); },
  async importImages() { throw new Error('L’import d’images dans la bibliothèque est disponible dans l’application Electron.'); },
  async beginJpgExport() { return desktopOnly(); },
  async prepareBackgroundCorrection() { return desktopOnly(); },
  async listImageTasks() { return []; },
  async removeImageTask() { return desktopOnly(); },
  async clearImageTaskHistory() { return desktopOnly(); },
  async retryImageTask() { return desktopOnly(); },
  async listBackgroundModels() { return desktopOnly(); },
  async listAiModels() { return desktopOnly(); },
  async getAiProviderStatus() { return desktopOnly(); },
  async setGeminiApiKey() { return desktopOnly(); },
  async startBackgroundCorrection() { return desktopOnly(); },
  async getBackgroundCorrection() { return desktopOnly(); },
  async cancelBackgroundCorrection() { return desktopOnly(); },
  async applyBackgroundCorrection() { return desktopOnly(); },
  async revealBackgroundBackup() { return desktopOnly(); },
  async startTerrainGeneration() { return desktopOnly(); },
  async startPoseGeneration() { return desktopOnly(); },
  async getPoseGeneration() { return desktopOnly(); },
  async cancelPoseGeneration() { return desktopOnly(); },
  async applyPoseGeneration() { return desktopOnly(); },
  async startAnimationGeneration() { return desktopOnly(); },
  async getAnimationGeneration() { return desktopOnly(); },
  async cancelAnimationGeneration() { return desktopOnly(); },
  async applyAnimationGeneration() { return desktopOnly(); },
  async getTerrainGeneration() { return desktopOnly(); },
  async cancelTerrainGeneration() { return desktopOnly(); },
  async applyTerrainGeneration() { return desktopOnly(); },
  async writeJpgFrame() { return desktopOnly(); },
  async imageDataForJpg() { return desktopOnly(); },
  async finishJpgExport() { return desktopOnly(); },
  async cancelJpgExport() { return desktopOnly(); },
  setDirty() { /* beforeunload handled in App */ },
  onLibraryChanged() { return () => undefined; }
};
export const api: StudioAPI = window.lunaria ?? browser;
