import {presentationFilmUsages} from './presentationUsages.js';
import { app, BrowserWindow, dialog, ipcMain, protocol, net, session, nativeImage, shell, type IpcMainInvokeEvent } from 'electron';
import { promises as fs, watch, type FSWatcher } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { atomicJson, readJson, resolveAsset, isWithin } from './files.js';
import { scanLibrary, libraryKey, IMAGE_EXTENSIONS, AUDIO_EXTENSIONS } from './library.js';
import { GameDocuments } from './gameDocuments.js';
import { CampaignSources } from './campaignSources.js';
import { planCampaign, publishCampaign } from './campaignPublisher.js';
import { parseGameProject, parseGameDraft } from '../shared/game/validation.js';
import { DocumentFiles } from './documents.js';
import { RecentProjects } from './recentProjects.js';
import { ProjectHistory } from './projectHistory.js';
import { referencedAssets, type Cinematic, type LibrarySnapshot } from '../shared/model.js';
import { parseCinematic } from '../shared/schema.js';

// The opt-in E2E runner uses an isolated profile, never the author's real workspace.
// Ignored entirely in a packaged application; it does not relax renderer/IPC security.
if (!app.isPackaged && process.env.LUNARIA_E2E === '1') {
  const testProfile = process.env.LUNARIA_TEST_USER_DATA;
  if (!testProfile || !path.isAbsolute(testProfile)) throw new Error('Profil E2E absolu requis.');
  app.setPath('userData', testProfile);
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
  { scheme: 'lunaria-asset', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }
]);
const devUrl = !app.isPackaged ? process.env.LUNARIA_DEV_URL : undefined;
if (devUrl && devUrl !== 'http://127.0.0.1:5173') throw new Error('Origine de développement non autorisée.');
let window: BrowserWindow | null = null;
let root = '', snapshot: LibrarySnapshot | null = null, dirty = false;
let watcher: FSWatcher | null = null, changeTimer: NodeJS.Timeout | undefined;
let generation = 0, scanRevision = 0, allowClose = false, activeOperations = 0, rendererAlive = true;
let documents: DocumentFiles;
let gameDocuments: GameDocuments;
let campaignSources: CampaignSources;
let recentProjects: RecentProjects;
let projectHistory: ProjectHistory;
const thumbnailCache = new Map<string, Buffer>();
const appRoot = () => app.getAppPath();
const rendererRoot = () => path.join(appRoot(), 'dist', 'renderer');
const dataFile = (name: string) => path.join(app.getPath('userData'), name);
const validateSender = (event: IpcMainInvokeEvent | Electron.IpcMainEvent) => {
  if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || !event.senderFrame) throw new Error('IPC non autorisé.');
  const url = new URL(event.senderFrame.url);
  if (devUrl ? url.origin !== devUrl : url.protocol !== 'app:' || url.hostname !== 'studio') throw new Error('Origine IPC non autorisée.');
};
function handle(channel: string, callback: (...args: unknown[]) => unknown) {
  ipcMain.handle(channel, async (event, ...args: unknown[]) => {
    validateSender(event); activeOperations++;
    try { return await callback(...args); } finally { activeOperations--; }
  });
}
async function refresh(emit = false): Promise<LibrarySnapshot | null> {
  if (!root) return null;
  const revision = ++scanRevision, selected = generation, scanned = await scanLibrary(root);
  if (generation !== selected || revision !== scanRevision) return snapshot;
  snapshot = scanned;
  if (emit) window?.webContents.send('library:changed', snapshot);
  return snapshot;
}
async function selectRoot(next: string): Promise<LibrarySnapshot> {
  const canonical = await fs.realpath(next), request = ++generation;
  // Read first: a refused/missing directory must not destroy the working library.
  const result = await scanLibrary(canonical);
  if (request !== generation) throw new Error('Sélection de bibliothèque remplacée par une autre.');
  await atomicJson(dataFile('settings.json'), { libraryRoot: canonical });
  if (request !== generation) throw new Error('Sélection de bibliothèque remplacée par une autre.');
  watcher?.close(); watcher = null; clearTimeout(changeTimer); scanRevision++;
  root = canonical; snapshot = result; thumbnailCache.clear();
  try {
    watcher = watch(root, { recursive: true }, () => {
      clearTimeout(changeTimer);
      changeTimer = setTimeout(() => { void refresh(true).catch(error => {
        if (snapshot) { snapshot = { ...snapshot, warnings: [...snapshot.warnings.slice(-20), String(error)] }; window?.webContents.send('library:changed', snapshot); }
      }); }, 650);
    });
    watcher.on('error', error => {
      if (snapshot) { snapshot = { ...snapshot, warnings: [...snapshot.warnings.slice(-20), 'Surveillance interrompue : ' + String(error)] }; window?.webContents.send('library:changed', snapshot); }
    });
  } catch { result.warnings.push('Surveillance indisponible. Utiliser le bouton Actualiser.'); }
  return result;
}
function disconnectLibrary() {
  generation++; scanRevision++; watcher?.close(); watcher = null; clearTimeout(changeTimer);
  root = ''; snapshot = null; thumbnailCache.clear();
}
function recentId(value: unknown): string {
  if (typeof value !== 'string' || value.length > 60) throw new Error('Identifiant de projet invalide.');
  return value;
}
function setupIpc() {
  handle('game:bootstrap', () => gameDocuments.bootstrap());
  handle('game:open', async () => {
    const result = await dialog.showOpenDialog(window!, {title:'Ouvrir un projet de niveaux',properties:['openFile'],filters:[{name:'Projet Lunaria',extensions:['json']}]});
    return result.canceled||!result.filePaths[0]?null:gameDocuments.open(result.filePaths[0]);
  });
  handle('game:recent', file => gameDocuments.openRecent(file));
  handle('game:save', async (value, token, saveAs) => {
    parseGameProject(value);
    if(typeof token!=='string'||typeof saveAs!=='boolean')throw new Error('Requête invalide.');
    let target:string|undefined;
    if(saveAs||!gameDocuments.currentPath(token)){
      const result=await dialog.showSaveDialog(window!,{title:'Enregistrer le projet de niveaux',defaultPath:gameDocuments.currentPath(token)||'lunaria.game.json',filters:[{name:'Projet Lunaria',extensions:['json']}]});
      if(result.canceled||!result.filePath)return null;target=result.filePath;
    }
    return gameDocuments.save(value,token,target);
  });
  handle('game:recover',value=>gameDocuments.recover(value));
  handle('game:clear-recovery',()=>gameDocuments.clearRecovery());
  handle('campaign:folder',()=>campaignSources.folder());
  handle('campaign:choose-folder',async()=>{
    const result=await dialog.showOpenDialog(window!,{title:'Choisir le dossier commun des fichiers cinematic.json',properties:['openDirectory']});
    return result.canceled||!result.filePaths[0]?null:campaignSources.select(result.filePaths[0]);
  });
  handle('campaign:add-film',async()=>{
    const folder=await campaignSources.folder();if(!folder)throw Error('Choisis le dossier des cinématiques.');
    const result=await dialog.showOpenDialog(window!,{title:'Ajouter une cinématique au parcours',defaultPath:folder,properties:['openFile'],filters:[{name:'Cinématique Lunaria',extensions:['json']}]});
    return result.canceled||!result.filePaths[0]?null:campaignSources.add(result.filePaths[0]);
  });
  handle('campaign:edit-film',async(file,documentId)=>{
    if(typeof documentId!=='string')throw Error('Identifiant de film invalide.');
    const resolved=await campaignSources.resolve(file,documentId);
    return projectHistory.openPath(resolved.path);
  });
  handle('campaign:check',async value=>(await planCampaign(value,await campaignSources.folder(),root)).check);
  handle('presentation:usages',value=>presentationFilmUsages(parseGameDraft(value),campaignSources));
  handle('game:publish',async value=>{
    const project=parseGameProject(value);
    const result=await dialog.showOpenDialog(window!,{title:'Choisir le dossier du jeu V1.10 contenant project.godot',properties:['openDirectory']});
    if(result.canceled||!result.filePaths[0])return null;
    const sources=await campaignSources.folder(),check=(await planCampaign(project,sources,root)).check;
    const answer=await dialog.showMessageBox(window!,{type:'warning',title:'Publier la campagne',message:`Publier ${check.steps} étapes : ${check.levels} niveaux et ${check.films} films ?`,detail:`${check.assets} ressources uniques seront réutilisées ou copiées dans la bibliothèque commune du jeu. Les images existantes différentes ne seront jamais écrasées. Le contenu actif est remplacé en dernier, avec une copie .bak. Ferme le jeu puis relance-le. ${check.warnings.join(' ')} Une publication modifiée démarre un nouveau profil, sans migration.`,buttons:['Annuler','Publier'],defaultId:0,cancelId:0});
    return answer.response===1?publishCampaign(project,result.filePaths[0],sources,root):null;
  });
  handle('studio:bootstrap', async () => {
    const recovery = await documents.recovery();
    const recent = await recentProjects.list().catch(error => ({ projects: [], warning: 'Historique indisponible : ' + String(error) }));
    return { recentProjects: recent, library: snapshot, recovery: recovery.cinematic, recoveryLibraryRoot: recovery.libraryRoot, documentToken: documents.token, desktop: true };
  });
  handle('document:reset', () => documents.reset());
  handle('document:discard-recovery', token => {
    if (typeof token !== 'string') throw new Error('Requête invalide.');
    return documents.discardRecovery(token);
  });
  handle('studio:confirm-unsaved', async reason => {
    if (typeof reason !== 'string' || reason.length > 300) throw new Error('Requête invalide.');
    const result = await dialog.showMessageBox(window!, { type: 'question', title: 'Modifications non enregistrées', message: reason,
      detail: 'Enregistrer conserve tes changements. Annuler te ramène dans le studio.',
      buttons: ['Enregistrer', 'Continuer sans enregistrer', 'Annuler'], defaultId: 0, cancelId: 2 });
    return (['save', 'discard', 'cancel'] as const)[result.response] ?? 'cancel';
  });
  handle('studio:confirm-delete', async name => {
    if (typeof name !== 'string' || name.length > 180) throw new Error('Requête invalide.');
    const result = await dialog.showMessageBox(window!, { type: 'question', title: 'Supprimer l’élément', message: `Supprimer « ${name} » ?`,
      detail: 'Cette opération pourra être annulée avec Ctrl+Z.', buttons: ['Annuler', 'Supprimer'], defaultId: 0, cancelId: 0 });
    return result.response === 1;
  });
  handle('studio:close', async () => { await documents.flush(); await recentProjects.flush(); await gameDocuments.flush(); allowClose = true; window?.close(); });
  handle('library:choose', async () => {
    const result = await dialog.showOpenDialog(window!, { title: 'Choisir la racine de la bibliothèque commune', properties: ['openDirectory'] });
    return result.canceled || !result.filePaths[0] ? null : selectRoot(result.filePaths[0]);
  });
  handle('library:example', () => selectRoot(devUrl ? path.join(appRoot(), 'example-library') : rendererRoot()));
  handle('library:refresh', () => refresh());
  handle('cinematic:open', async () => {
    const result = await dialog.showOpenDialog(window!, { title: 'Ouvrir une cinématique', properties: ['openFile'], filters: [{ name: 'Cinématique Lunaria', extensions: ['json'] }] });
    return result.canceled || !result.filePaths[0] ? null : projectHistory.openPath(result.filePaths[0]);
  });
  handle('projects:recent-list', () => recentProjects.list(true));
  handle('projects:recent-open', id => projectHistory.openRecent(recentId(id)));
  handle('projects:recent-locate', async id => {
    const entry = await recentProjects.get(recentId(id));
    const result = await dialog.showOpenDialog(window!, { title: `Retrouver « ${entry.title} »`,
      properties: ['openFile'], filters: [{ name: 'Cinématique Lunaria', extensions: ['json'] }] });
    return result.canceled || !result.filePaths[0] ? null : projectHistory.relocate(entry.id, result.filePaths[0]);
  });
  handle('projects:recent-pin', (id, pinned) => {
    if (typeof pinned !== 'boolean') throw new Error('Requête invalide.');
    return recentProjects.setPinned(recentId(id), pinned);
  });
  handle('projects:recent-remove', id => recentProjects.remove(recentId(id)));
  handle('projects:recent-clear', () => recentProjects.clearUnpinned());
  handle('projects:recent-reveal', async id => {
    const entry = await recentProjects.get(recentId(id));
    if (!(await fs.stat(entry.path)).isFile()) throw new Error('Le fichier a été déplacé. Utilise Retrouver le fichier.');
    shell.showItemInFolder(entry.path);
  });
  handle('cinematic:save', async (data, saveAs, token) => {
    if (typeof saveAs !== 'boolean' || typeof token !== 'string' || token !== documents.token) throw new Error('Session de document invalide.');
    const cinematic = parseCinematic(data);
    let target = documents.currentFile;
    if (!target || saveAs) {
      const result = await dialog.showSaveDialog(window!, { title: 'Enregistrer cinematic.json',
        defaultPath: target || `${cinematic.id.replace(/[^a-z0-9_-]/gi, '_')}.cinematic.json`,
        filters: [{ name: 'Cinématique Lunaria', extensions: ['json'] }] });
      if (result.canceled || !result.filePath) return null;
      target = result.filePath;
      if (path.extname(target).toLowerCase() !== '.json') target += '.json';
    }
    const { cinematic: saved, warnings } = await projectHistory.save(target, cinematic, token, root);
    const missing = [];
    for (const ref of referencedAssets(saved)) {
      try { if (!root) throw new Error(); await resolveAsset(root, ref); } catch { missing.push(ref); }
    }
    return { path: target, missing, cinematic: saved, warnings };
  });
  handle('versions:list', token => {
    if (typeof token !== 'string') throw new Error('Session invalide.');
    return documents.listVersions(token);
  });
  handle('versions:create', (data, token, label) => {
    if (typeof token !== 'string' || typeof label !== 'string' || label.length > 120) throw new Error('Requête invalide.');
    return documents.createVersion(parseCinematic(data), token, label, root);
  });
  handle('versions:load', (token, id) => {
    if (typeof token !== 'string' || typeof id !== 'string') throw new Error('Requête invalide.');
    return documents.loadVersion(token, id);
  });
  handle('cinematic:autosave', (data, token) => {
    if (typeof token !== 'string') throw new Error('Session invalide.');
    return documents.autosave(data as Cinematic, token, root);
  });
  ipcMain.on('studio:dirty', (event, value: unknown) => {
    try { validateSender(event); if (typeof value === 'boolean') { dirty = value; window?.setDocumentEdited(dirty); } }
    catch (error) { console.warn('Message IPC ignoré :', error); }
  });
}
function setupProtocols() {
  protocol.handle('app', async request => {
    try {
      const url = new URL(request.url);
      if (url.hostname !== 'studio') return new Response('Interdit', { status: 403 });
      const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
      const target = path.resolve(rendererRoot(), `.${relative}`);
      if (!isWithin(rendererRoot(), target)) return new Response('Interdit', { status: 403 });
      return await net.fetch(pathToFileURL(target).toString());
    } catch { return new Response('Introuvable', { status: 404 }); }
  });
  protocol.handle('lunaria-asset', async request => {
    try {
      const url = new URL(request.url), activeRoot = root;
      if (url.hostname !== 'library' || !activeRoot) return new Response('Bibliothèque absente', { status: 404 });
      if (url.searchParams.has('root') && url.searchParams.get('root') !== libraryKey(activeRoot)) return new Response('Ancienne bibliothèque', { status: 410 });
      const ref = 'library://' + url.pathname.slice(1).split('/').map(decodeURIComponent).join('/');
      const target = await resolveAsset(activeRoot, ref), extension = path.extname(target).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(extension) && !AUDIO_EXTENSIONS.has(extension)) return new Response('Type interdit', { status: 403 });
      if (url.searchParams.get('thumb') === '1' && IMAGE_EXTENSIONS.has(extension)) {
        const stat = await fs.stat(target), key = `${target}:${stat.mtimeMs}:${stat.size}`;
        if (stat.size > 80 * 1024 * 1024) return new Response('Image trop volumineuse', { status: 413 });
        let buffer = thumbnailCache.get(key);
        if (!buffer) {
          // Native thumbnail decoding yields back to the UI instead of decoding every PNG synchronously.
          if (process.platform !== 'win32' && process.platform !== 'darwin') return net.fetch(pathToFileURL(target).toString());
          const image = await nativeImage.createThumbnailFromPath(target, { width: 360, height: 240 });
          if (image.isEmpty()) return new Response('Image illisible', { status: 415 });
          buffer = image.toPNG();
          if (thumbnailCache.size >= 200) thumbnailCache.delete(thumbnailCache.keys().next().value!);
          thumbnailCache.set(key, buffer);
        }
        return new Response(new Uint8Array(buffer), { headers: { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache' } });
      }
      const response = await net.fetch(pathToFileURL(target).toString(), { headers: request.headers });
      const headers = new Headers(response.headers); headers.set('Access-Control-Allow-Origin', '*'); headers.set('Cache-Control', 'no-cache');
      return new Response(response.body, { status: response.status, headers });
    } catch { return new Response('Asset introuvable ou illisible', { status: 404 }); }
  });
}
function createWindow() {
  allowClose = false; rendererAlive = true;
  window = new BrowserWindow({ width: 1540, height: 980, minWidth: 1000, minHeight: 680,
    title: 'Lunaria Studio', backgroundColor: '#171c1b', autoHideMenuBar: true,
    webPreferences: { preload: path.join(appRoot(), 'dist', 'preload', 'index.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true } });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.webContents.on('render-process-gone', () => { rendererAlive = false; });
  window.on('close', event => {
    if (allowClose || !rendererAlive) return;
    // Always give the renderer a chance to flush an edit/debounced recovery, even in the same frame.
    if (!window?.webContents.isLoadingMainFrame()) { event.preventDefault(); window?.webContents.send('studio:close-requested'); }
    else if (dirty || activeOperations > 0) event.preventDefault();
  });
  window.on('closed', () => { window = null; });
  void window.loadURL(devUrl || 'app://studio/index.html').catch(error => {
    rendererAlive = false;
    void dialog.showMessageBox({ type: 'error', message: 'Impossible de démarrer le studio.', detail: String(error) });
  });
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (window?.isMinimized()) window.restore(); window?.show(); window?.focus(); });
  app.whenReady().then(async () => {
    documents = new DocumentFiles(dataFile('recovery.json'));
    gameDocuments = new GameDocuments(app.getPath('userData'));
    campaignSources = new CampaignSources(app.getPath('userData'));
    recentProjects = new RecentProjects(dataFile('recent-projects.json'));
    projectHistory = new ProjectHistory(documents, recentProjects, { current: () => snapshot, select: selectRoot, disconnect: disconnectLibrary });
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    setupProtocols(); setupIpc();
    try { const settings = await readJson(dataFile('settings.json')) as { libraryRoot?: string }; if (typeof settings.libraryRoot === 'string') await selectRoot(settings.libraryRoot); }
    catch { /* Reconnect explicitly if the saved location is unavailable. */ }
    createWindow();
  }).catch(error => { console.error(error); app.quit(); });
}
app.on('window-all-closed', () => { watcher?.close(); clearTimeout(changeTimer); app.quit(); });
