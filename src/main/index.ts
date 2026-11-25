import {prepareCapabilityWorkshop,launchCapabilityWorkshop} from './capabilityWorkshop.js';
import { app, BrowserWindow, dialog, ipcMain, protocol, net, session, nativeImage, safeStorage, shell, type IpcMainInvokeEvent } from 'electron';
import { promises as fs, constants as fsConstants, watch, type FSWatcher } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { atomicJson, readJson, readJsonSource, resolveAsset, isWithin } from './files.js';
import { scanLibrary, libraryKey, IMAGE_EXTENSIONS, AUDIO_EXTENSIONS } from './library.js';
import { GameDocuments } from './gameDocuments.js';
import { createCampaignBackup, campaignBackupLibrary } from './campaignBackup.js';
import { planCampaign, publishCampaign } from './campaignPublisher.js';
import { discoverGodot, installedGodotExecutables, launchGodotLevel, prepareLevelPreview, importPreview, loadGamePreviewSettings, saveGamePreviewSettings, validGameRoot, validGodotExecutable, type GamePreviewSettings } from './gamePreview.js';
import { runGameBuild, simulateGameBuild, type GameBuildTarget } from './gameBuild.js';
import { firstWebLevel, publishFirstWebLevel, validWebsite } from './webPublication.js';
import { runAndroidDeployment, type AdbCommand } from './androidDeployment.js';
import { parseGameProject, parseGameDraft } from '../shared/game/validation.js';
import { ensureCampaign, moveCampaignStep } from '../shared/game/campaign.js';
import { type GameFile } from '../shared/game/types.js';
import { type LibrarySnapshot } from '../shared/model.js';
import { isSafeAssetRef } from '../shared/schema.js';
import { JpgExports } from './jpgExport.js';
import { BackgroundCorrections } from './backgroundCorrections.js';
import { ImageTaskQueue } from './imageJobs.js';
import { imageTaskFinished } from '../shared/imageTasks.js';
import { TerrainGenerations, createTerrainGenerator } from './terrainGenerations.js';
import { PoseGenerations, createPoseGenerator } from './poseGenerations.js';
import { AnimationGenerations, createAnimationGenerator } from './animationGenerations.js';
import { ensureTransparentBackground, stabilizeSpritesheet } from './animationSheets.js';
import { validatePosePixels } from './poseImages.js';
import { codexImagesRoot, createBackgroundGenerator } from './codexImageCorrection.js';
import { listCodexModels } from './codexModels.js';
import { findCodexExecutable } from './codexExecutable.js';
import { findAgyExecutable } from './agyExecutable.js';
import { listAgyModels } from './agyImageGeneration.js';
import { AiSettingsStore } from './aiSettings.js';
import { listGeminiImageModels } from './geminiImageGeneration.js';
import { normalizeAiProvider } from '../shared/aiProviders.js';
import { cropPanoramaCore, panoramaCanvas, finalizePanorama } from './panoramaImages.js';
import { parseDevOrigin } from './devOrigin.js';

// The opt-in E2E runner uses an isolated profile, never the author's real workspace.
// Ignored entirely in a packaged application; it does not relax renderer/IPC security.
const e2e = !app.isPackaged && process.env.LUNARIA_E2E === '1';
if (e2e) {
  const testProfile = process.env.LUNARIA_TEST_USER_DATA;
  if (!testProfile || !path.isAbsolute(testProfile)) throw new Error('Profil E2E absolu requis.');
  app.setPath('userData', testProfile);
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
  { scheme: 'lunaria-asset', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
  { scheme: 'lunaria-correction', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }
]);
const devUrl = parseDevOrigin(process.env.LUNARIA_DEV_URL, app.isPackaged);
let window: BrowserWindow | null = null;
let root = '', snapshot: LibrarySnapshot | null = null, dirty = false;
let watcher: FSWatcher | null = null, changeTimer: NodeJS.Timeout | undefined;
let generation = 0, scanRevision = 0, allowClose = false, activeOperations = 0, rendererAlive = true;
let nativeBuildRunning=false;
async function withNativeBuild<T>(operation:()=>Promise<T>):Promise<T>{
 if(nativeBuildRunning)throw Error('Une compilation ou un déploiement est déjà en cours.');
 nativeBuildRunning=true;try{return await operation();}finally{nativeBuildRunning=false;}
}
let gameDocuments: GameDocuments;
const thumbnailCache = new Map<string, Buffer>();
const jpgExports = new JpgExports();
const appRoot = () => app.getAppPath();
const rendererRoot = () => path.join(appRoot(), 'dist', 'renderer');
const dataFile = (name: string) => path.join(app.getPath('userData'), name);
const imageTaskQueue = new ImageTaskQueue();
const aiSettings = new AiSettingsStore(
  dataFile('ai-settings.json'),
  {
    available: () => safeStorage.isEncryptionAvailable(),
    encrypt: plain => safeStorage.encryptString(plain).toString('base64'),
    decrypt: encoded => safeStorage.decryptString(Buffer.from(encoded, 'base64')),
  },
  process.env,
  async () => {
    try { await findCodexExecutable(); return true; } catch { return false; }
  },
  async () => {
    try { await findAgyExecutable(); return true; } catch { return false; }
  },
);
const getGeminiApiKey = () => aiSettings.getGeminiApiKey();
const generateBackground = createBackgroundGenerator(getGeminiApiKey);
const generateTerrain = createTerrainGenerator(getGeminiApiKey);
const generatePose = createPoseGenerator(getGeminiApiKey);
const generateAnimation = createAnimationGenerator(
  ({ pixels, width, height }) => nativeImage.createFromBitmap(pixels, { width, height }).toPNG(),
  getGeminiApiKey,
);
const backgroundCorrections = new BackgroundCorrections({
  queue: imageTaskQueue,
  jobsRoot: dataFile('background-corrections'), generatedRoot: codexImagesRoot(),
  generate: async task => {
    // An opt-in fixture can only read inside the isolated E2E profile.
    const fixture = e2e ? process.env.LUNARIA_E2E_IMAGE_RESULT : undefined;
    if (!fixture) return generateBackground(task);
    const real = await fs.realpath(fixture), profile = await fs.realpath(app.getPath('userData'));
    if (!isWithin(profile, real)) throw new Error('Fixture de correction hors du profil isolé.');
    if (process.env.LUNARIA_E2E_IMAGE_MANUAL === '1') {
      const deadline = Date.now() + 60000;
      while (!task.signal.aborted && !(await fs.stat(path.join(task.folder, 'fixture-release')).catch(() => undefined))) {
        if (Date.now() > deadline) throw new Error('Fixture de correction non libérée.');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    if (task.signal.aborted) throw new Error('Correction annulée.');
    const result = path.join(task.folder, 'fixture-result.png');
    await fs.copyFile(real, result); return result;
  },
  inspect: bytes => nativeImage.createFromBuffer(bytes).getSize(),
  crop: cropPanoramaCore, canvas: panoramaCanvas, finalize: finalizePanorama,
  encode: (bytes, extension) => {
    const image = nativeImage.createFromBuffer(bytes);
    if (image.isEmpty()) throw new Error('Image de correction illisible.');
    return extension === '.jpg' || extension === '.jpeg' ? image.toJPEG(95) : bytes;
  },
});
const terrainGenerations = new TerrainGenerations({
  queue: imageTaskQueue,
  jobsRoot: dataFile('terrain-generations'), generatedRoot: codexImagesRoot(),
  generate: async task => {
    const fixture = e2e ? (task.state === 'restored' ? process.env.LUNARIA_E2E_TERRAIN_RESTORED_RESULT : process.env.LUNARIA_E2E_TERRAIN_RESULT) : undefined;
    if (e2e && process.env.LUNARIA_E2E_TERRAIN_RESULT && !fixture) throw Error('Fixture du terrain nettoyé manquante.');
    if (!fixture) return generateTerrain(task);
    const real = await fs.realpath(fixture), profile = await fs.realpath(app.getPath('userData'));
    if (!isWithin(profile, real)) throw new Error('Fixture de terrain hors du profil isolé.');
    await fs.writeFile(path.join(path.dirname(task.folder), 'fixture-request.json'), JSON.stringify(task.request));
    await new Promise(resolve => setTimeout(resolve, 300));
    if (task.signal.aborted) throw new Error('Génération annulée.');
    const result = path.join(task.folder, 'fixture-result.png');
    await fs.copyFile(real, result); return result;
  },
  inspect: bytes => nativeImage.createFromBuffer(bytes).getSize(),
  png: bytes => nativeImage.createFromBuffer(bytes).toPNG(),
  finalize: (bytes, targetSize) => {
    let image = nativeImage.createFromBuffer(bytes);
    if (image.isEmpty()) throw new Error('Terrain généré illisible.');
    const pixels = image.toBitmap();
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] !== 255) throw new Error('Le terrain généré contient des zones transparentes. Relance une proposition.');
    if (targetSize) image=image.resize({...targetSize,quality:'best'});
    return image.toPNG();
  },
});
const poseGenerations = new PoseGenerations({
  queue: imageTaskQueue,
  jobsRoot: dataFile('pose-generations'), generatedRoot: codexImagesRoot(),
  generate: async task => {
    const fixture = e2e ? process.env.LUNARIA_E2E_POSE_RESULT : undefined;
    if (!fixture) return generatePose(task);
    const real = await fs.realpath(fixture), profile = await fs.realpath(app.getPath('userData'));
    if (!isWithin(profile, real)) throw Error('Fixture de pose hors du profil isolé.');
    await fs.writeFile(path.join(task.folder, 'fixture-request.json'), JSON.stringify(task.request));
    if (process.env.LUNARIA_E2E_POSE_MANUAL === '1') {
      const deadline = Date.now() + 60000;
      while (!task.signal.aborted && !(await fs.stat(path.join(task.folder, 'fixture-release')).catch(() => undefined))) {
        if (Date.now() > deadline) throw Error('Fixture de pose non libérée.');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    if (task.signal.aborted) throw Error('Génération annulée.');
    const output = path.join(task.folder, 'fixture-result.png');
    await fs.copyFile(real, output); return output;
  },
  inspect: bytes => nativeImage.createFromBuffer(bytes).getSize(),
  png: bytes => nativeImage.createFromBuffer(bytes).toPNG(),
  finalize: (bytes, provider) => {
    let image = nativeImage.createFromBuffer(bytes);
    if (image.isEmpty()) throw Error('Pose générée illisible.');
    if (provider === 'gemini') {
      const size = image.getSize();
      const cleaned = ensureTransparentBackground(image.toBitmap(), size.width, size.height);
      image = nativeImage.createFromBitmap(cleaned, size);
    }
    validatePosePixels(image.toBitmap(), image.getSize());
    return image.toPNG();
  },
});
const animationGenerations = new AnimationGenerations({
  queue: imageTaskQueue,
  jobsRoot: dataFile('animation-generations'), generatedRoot: codexImagesRoot(),
  generate: async task => {
    const fixture = e2e ? process.env.LUNARIA_E2E_ANIMATION_RESULT : undefined;
    if (!fixture) return generateAnimation(task);
    const real = await fs.realpath(fixture), profile = await fs.realpath(app.getPath('userData'));
    if (!isWithin(profile, real)) throw Error('Fixture d’animation hors du profil isolé.');
    await fs.writeFile(path.join(task.folder, 'fixture-request.json'), JSON.stringify(task.request));
    if (task.signal.aborted) throw Error('Génération annulée.');
    const output = path.join(task.folder, 'fixture-result.png');
    await fs.copyFile(real, output); return output;
  },
  inspect: bytes => nativeImage.createFromBuffer(bytes).getSize(),
  png: bytes => nativeImage.createFromBuffer(bytes).toPNG(),
  stabilize: (bytes, columns, rows, requireNativeAlpha) => {
    const image = nativeImage.createFromBuffer(bytes);
    if (image.isEmpty()) throw Error('Planche d’animation générée illisible.');
    const size = image.getSize();
    const result = stabilizeSpritesheet(image.toBitmap(), size.width, size.height, columns, rows, requireNativeAlpha);
    const png = nativeImage.createFromBitmap(result.pixels, { width: result.width, height: result.height }).toPNG();
    return {
      png,
      width: result.width,
      height: result.height,
      cellWidth: result.cellWidth,
      cellHeight: result.cellHeight,
      frameCount: result.frameCount,
      recommendedStridePx: result.recommendedStridePx,
    };
  },
});
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
async function previewSettings():Promise<GamePreviewSettings>{return loadGamePreviewSettings(dataFile('game-preview.json'));}
async function rememberPreview(patch:GamePreviewSettings):Promise<GamePreviewSettings>{const value={...await previewSettings(),...patch};await saveGamePreviewSettings(dataFile('game-preview.json'),value);return value;}
async function choosePreviewGameRoot(settings:GamePreviewSettings):Promise<string|null>{
 const configured=await validGameRoot(settings.gameRoot);if(configured)return configured;
 if(!e2e&&!app.isPackaged){const sibling=await validGameRoot(path.resolve(appRoot(),'..','Lunaria','game'));if(sibling){await rememberPreview({gameRoot:sibling});return sibling;}}
 const result=await dialog.showOpenDialog(window!,{title:'Choisir le dossier game du projet Godot Lunaria',properties:['openDirectory']});
 if(result.canceled||!result.filePaths[0])return null;
 const selected=await validGameRoot(result.filePaths[0]);if(!selected)throw Error('Choisis le dossier game de Lunaria contenant project.godot.');
 await rememberPreview({gameRoot:selected});return selected;
}
async function chooseGodot(settings:GamePreviewSettings):Promise<string|null>{
 const programFiles=process.env.ProgramFiles??'C:\\Program Files';
 const installed=process.platform==='win32'?await installedGodotExecutables(path.join(programFiles,'Godot')):[];
 const automatic=await discoverGodot([settings.godotPath,process.env.GODOT_BIN,...installed]);
 if(automatic){if(automatic!==settings.godotPath)await rememberPreview({godotPath:automatic});return automatic;}
 const result=await dialog.showOpenDialog(window!,{title:'Choisir Godot pour lancer ou construire le jeu',properties:['openFile'],filters:process.platform==='win32'?[{name:'Godot',extensions:['exe']}]:undefined});
 if(result.canceled||!result.filePaths[0])return null;
 const selected=await validGodotExecutable(result.filePaths[0]);if(!selected)throw Error('Choisis un exécutable Godot valide.');
 await rememberPreview({godotPath:selected});return selected;
}
function previewProject(value:unknown,levelId:string){
 const project=parseGameProject(value),level=project.levels.find(item=>item.id===levelId);if(!level)throw Error('Le niveau sélectionné n’existe plus.');
 const preview=structuredClone(project),campaign=ensureCampaign(preview);
 // Only the selected draft level crosses the boundary in this disposable preview.
 const end=campaign.steps.findIndex(step=>step.kind==='end'),index=campaign.steps.findIndex(step=>step.kind==='level'&&step.levelId===levelId);
 if(index<0)campaign.steps.splice(end<0?campaign.steps.length:end,0,{id:'studio_preview_'+globalThis.crypto.randomUUID().replaceAll('-','').slice(0,12),kind:'level',levelId});
 else if(end>=0&&index>end)campaign.steps=moveCampaignStep(campaign.steps,campaign.steps[index].id,campaign.steps[end].id);
 return{preview,level};
}
async function openAuthoringProject(file:string,recent=false):Promise<GameFile>{
  const project=parseGameProject((await readJsonSource(file,32*1024*1024)).value);
  for(const film of project.campaign?.cinematics??[])if(!project.cinematics?.some(doc=>doc.id===film.documentId))throw Error('Cinématique absente du projet : '+film.title+'. Ouvre le fichier de travail du Studio.');
  const backupLibrary=await campaignBackupLibrary(file);
  if(backupLibrary){const linked=await selectRoot(backupLibrary);window?.webContents.send('library:changed',linked);}
  const opened=recent?await gameDocuments.openRecent(file):await gameDocuments.open(file);
  if(backupLibrary){opened.token='';opened.backup=true;}
  return opened;
}

function setupIpc() {
  handle('game:bootstrap', () => gameDocuments.bootstrap());
  handle('game:open', async () => {
    const result = await dialog.showOpenDialog(window!, {title:'Ouvrir un projet Lunaria',properties:['openFile'],filters:[{name:'Projet Lunaria',extensions:['json']}]});
    return result.canceled||!result.filePaths[0]?null:openAuthoringProject(result.filePaths[0]);
  });
  handle('game:recent', file => {if(typeof file!=='string')throw Error('Projet récent invalide.');return openAuthoringProject(file,true);});
  handle('game:save', async (value, token, saveAs) => {
    parseGameProject(value);
    if(typeof token!=='string'||typeof saveAs!=='boolean')throw new Error('Requête invalide.');
    let target:string|undefined;
    if(saveAs||!gameDocuments.currentPath(token)){
      const result=await dialog.showSaveDialog(window!,{title:'Enregistrer le projet Lunaria',defaultPath:gameDocuments.currentPath(token)||'lunaria.game.json',filters:[{name:'Projet Lunaria',extensions:['json']}]});
      if(result.canceled||!result.filePath)return null;target=result.filePath;
    }
    if(target&&await campaignBackupLibrary(target))throw Error('Ce fichier appartient à une sauvegarde. Choisis un autre dossier pour enregistrer ton fichier de travail.');
    return gameDocuments.save(value,token,target);
  });
  handle('game:recover',(value,context)=>gameDocuments.recover(value,context));
  handle('game:conflict',token=>gameDocuments.inspectConflict(token));
  handle('game:reconcile',(value,token,revision,draft)=>gameDocuments.reconcile(value,token,revision,draft));
  handle('game:backup',async value=>{
    parseGameProject(value);
    const result=await dialog.showOpenDialog(window!,{title:'Choisir où conserver la sauvegarde complète de la campagne',properties:['openDirectory','createDirectory']});
    if(result.canceled||!result.filePaths[0])return null;
    return createCampaignBackup(value,root,result.filePaths[0]);
  });
  handle('game:clear-recovery',()=>gameDocuments.clearRecovery());
  handle('campaign:check',async value=>(await planCampaign(value,root)).check);
  handle('game:publish',async value=>{
    const project=parseGameProject(value),libraryRoot=root;
    const result=await dialog.showOpenDialog(window!,{title:'Choisir le dossier du jeu V1.10 contenant project.godot',properties:['openDirectory']});
    if(result.canceled||!result.filePaths[0])return null;
    const gameRoot=await validGameRoot(result.filePaths[0]);
    if(!gameRoot)throw Error('Choisis le projet Godot fourni avec Lunaria Studio V1.10.');
    const check=(await planCampaign(project,libraryRoot,gameRoot)).check;
    const answer=await dialog.showMessageBox(window!,{type:'warning',title:'Publier la campagne',message:`Publier ${check.steps} étapes : ${check.levels} niveaux et ${check.films} films ?`,detail:`${check.assets} ressources uniques seront réutilisées ou copiées dans la bibliothèque commune du jeu. Les images existantes différentes ne seront jamais écrasées. Le contenu actif est remplacé en dernier, avec une copie .bak. Ferme le jeu puis relance-le. ${check.warnings.join(' ')} La progression est conservée lors des mises à jour. Un combat suspendu devenu incompatible devra être recommencé.`,buttons:['Annuler','Publier'],defaultId:0,cancelId:0});
    if(answer.response!==1)return null;
    const published=await publishCampaign(project,gameRoot,libraryRoot);
    await rememberPreview({gameRoot});
    return published;
  });
  handle('game:publish-web', value => withNativeBuild(async () => {
    firstWebLevel(value);
    const gameRoot = await choosePreviewGameRoot(await previewSettings());
    if (!gameRoot) return null;
    const executable = await chooseGodot(await previewSettings());
    if (!executable) return null;
    const settingsPath = dataFile('web-publication.json');
    const saved = await readJson(settingsPath).catch(() => null) as { website?: string } | null;
    let website = await validWebsite(typeof saved?.website === 'string' ? saved.website : '');
    if (!website && !e2e) website = await validWebsite(path.resolve(gameRoot, '..', '..', 'LunariaWebsite'));
    if (!website) {
      const selection = await dialog.showOpenDialog(window!, { title: 'Choisir le dossier LunariaWebsite', properties: ['openDirectory'] });
      if (selection.canceled || !selection.filePaths[0]) return null;
      website = await validWebsite(selection.filePaths[0]);
      if (!website) throw Error('Choisis le dépôt LunariaWebsite avec les outils d’export et de publication Web.');
    }
    // The desktop tests may only execute tools inside their own profile.
    if (e2e && !isWithin(await fs.realpath(app.getPath('userData')), website)) throw Error('Le site de test doit être dans le profil isolé.');
    await atomicJson(settingsPath, { website });
    return publishFirstWebLevel(value, {
      website, gameRoot, libraryRoot: root, godot: executable, work: dataFile('web-publications'), allowLive: !e2e,
      confirm: async (title, destination, canPublishLive) => {
        const { response } = await dialog.showMessageBox(window!, {
          type: 'question', title: 'Publier le premier niveau sur le Web',
          message: `« ${title} » est prêt. Où veux-tu le publier ?`,
          detail: `Site local : ${destination}.\n${canPublishLive
            ? 'La mise en ligne remplace la démo jouable sur savelunaria.com.'
            : 'Pour publier en ligne, le lecteur Godot Web et sa configuration Nginx doivent être installés sur savelunaria.com.'}`,
          buttons: ['Annuler', 'Mettre à jour le site local', ...(canPublishLive ? ['Publier sur savelunaria.com'] : [])],
          cancelId: 0, defaultId: 0, noLink: true,
        });
        return response === 1 ? 'local' : response === 2 && canPublishLive ? 'live' : null;
      },
    });
  }));
  handle('game:test-ability',async(value,sourceId,abilityId,targetId)=>{
    if(typeof sourceId!=='string'||typeof abilityId!=='string'||typeof targetId!=='string'||[sourceId,abilityId,targetId].some(id=>!id||id.length>100))throw Error('Choix de capacité invalide.');
    const gameRoot=await choosePreviewGameRoot(await previewSettings());if(!gameRoot)return null;
    const executable=await chooseGodot(await previewSettings());if(!executable)return null;
    const file=await prepareCapabilityWorkshop(value,sourceId,abilityId,targetId,dataFile('capability-workshops'));
    if(!e2e)await launchCapabilityWorkshop(executable,gameRoot,file,sourceId,abilityId,targetId);
    return {path:file};
  });
  handle('game:play-level',async(value,rawLevelId)=>{
    if(typeof rawLevelId!=='string')throw Error('Identifiant de niveau invalide.');
    const {preview,level}=previewProject(value,rawLevelId),settings=await previewSettings();
    const gameRoot=await choosePreviewGameRoot(settings);if(!gameRoot)return null;
    const executable=await chooseGodot(await previewSettings());if(!executable)return null;
    const staged=await prepareLevelPreview(preview,gameRoot,root,dataFile('level-previews'));
    try{
      if(!e2e){
        await importPreview(executable,staged.gameRoot);
        await launchGodotLevel(executable,staged.gameRoot,level.id,undefined,()=>{void staged.dispose().catch(()=>undefined);});
      }
      return{path:staged.path,levelId:level.id,title:level.title,gameRoot:staged.gameRoot,executable,simulated:e2e};
    }catch(error){await staged.dispose();throw error;}
  });
  handle('game:build',async(value,rawTarget)=>withNativeBuild(async()=>{
    if(rawTarget!=='windows'&&rawTarget!=='android')throw Error('Cible de build invalide.');
    const target:GameBuildTarget=rawTarget,project=parseGameProject(value),settings=await previewSettings();
    const gameRoot=await choosePreviewGameRoot(settings);if(!gameRoot)return null;
    const executable=await chooseGodot(await previewSettings());if(!executable)return null;
    await publishCampaign(project,gameRoot,root);
    return e2e?simulateGameBuild(gameRoot,target):runGameBuild(gameRoot,executable,target);
  }));
  handle('game:deploy-android',async(value,requestId)=>withNativeBuild(async()=>{
    if(typeof requestId!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(requestId))throw Error('Requête de déploiement invalide.');
    const project=parseGameProject(value),gameRoot=await choosePreviewGameRoot(await previewSettings());if(!gameRoot)return null;
    const executable=await chooseGodot(await previewSettings());if(!executable)return null;
    const progress=(event:import('../shared/game/types.js').AndroidDeploymentProgress)=>window?.webContents.send('game:android-deployment-progress',{...event,requestId});
    // Simulation is restricted to the isolated, unpackaged E2E profile.
    const simulatedCommand:AdbCommand=async(_adb,args)=>{
      if(args[0]==='devices')return process.env.LUNARIA_E2E_ANDROID_DEVICES??'e2e-phone device model:Téléphone_test';
      if(args.includes('getprop'))return 'arm64-v8a,armeabi-v7a';
      if(args.includes('install')){await new Promise(resolve=>setTimeout(resolve,150));return 'Success';}
      if(args.includes('resolve-activity'))return `${args.at(-1)}/org.godotengine.godot.GodotApp`;
      if(args.includes('start'))return 'Status: ok';
      return '';
    };
    return runAndroidDeployment(gameRoot,async()=>{
      progress({phase:'publish',message:'Synchronisation de la campagne et de ses ressources…'});
      await publishCampaign(project,gameRoot,root);
      progress({phase:'build',message:'Compilation de l’APK Android… Cette étape peut prendre plusieurs minutes.'});
      return e2e?simulateGameBuild(gameRoot,'android'):runGameBuild(gameRoot,executable,'android',undefined,message=>progress({phase:'build',message}));
    },{
      progress,...(e2e?{adb:'adb-e2e',command:simulatedCommand}:{}),
      chooseDevice:async devices=>{
        const choice=await dialog.showMessageBox(window!,{type:'question',title:'Téléphone Android',message:'Choisir le téléphone pour installer et lancer Lunaria',buttons:[...devices.map(device=>`${device.name} (${device.serial})`),'Annuler'],defaultId:0,cancelId:devices.length,noLink:true});
        return devices[choice.response]??null;
      }
    });
  }));
  handle('studio:bootstrap', () => ({ library: snapshot, desktop: true }));
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
  handle('studio:close', async () => { await gameDocuments.flush(); allowClose = true; window?.close(); });
  handle('library:choose', async () => {
    const result = await dialog.showOpenDialog(window!, { title: 'Choisir la racine de la bibliothèque commune', properties: ['openDirectory'] });
    return result.canceled || !result.filePaths[0] ? null : selectRoot(result.filePaths[0]);
  });
  handle('library:example', () => selectRoot(devUrl ? path.join(appRoot(), 'example-library') : rendererRoot()));
  handle('library:refresh', () => refresh());
  handle('background-correction:prepare', ref => { if (!root) throw new Error('Connecte une bibliothèque avant d’adapter un décor.'); return backgroundCorrections.prepare(root, ref); });
  const imageProcessor = (kind: unknown) => {
    if (kind === 'animation') return animationGenerations;
    if (kind === 'pose') return poseGenerations;
    if (kind === 'terrain') return terrainGenerations;
    if (kind === 'background') return backgroundCorrections;
    throw Error('Type de tâche inconnu.');
  };
  handle('image-tasks:list', async () => (await Promise.all([backgroundCorrections.list(), terrainGenerations.list(), poseGenerations.list(), animationGenerations.list()])).flat().sort((a,b) => (b.job.createdAt ?? '').localeCompare(a.job.createdAt ?? '')));
  handle('image-tasks:remove', async (kind, id) => { if (typeof id !== 'string') throw Error('Tâche invalide.'); return imageProcessor(kind).remove(id); });
  handle('image-tasks:clear', async () => {
    let count = 0;
    for (const task of (await Promise.all([backgroundCorrections.list(), terrainGenerations.list(), poseGenerations.list(), animationGenerations.list()])).flat()) if (imageTaskFinished(task.job.status)) { await imageProcessor(task.kind).remove(task.job.id); count++; }
    return count;
  });
  handle('image-tasks:retry', async (kind, id) => { if (!root) throw Error('Connecte la bibliothèque de cette tâche.'); if (typeof id !== 'string') throw Error('Tâche invalide.'); return imageProcessor(kind).retry(root, id); });
  handle('terrain-generation:start', request => {
    if (!root || isWithin(appRoot(), root)) throw new Error('Choisis une bibliothèque de production avant de générer un terrain.');
    return terrainGenerations.start(root, request);
  });
  handle('terrain-generation:get', id => terrainGenerations.get(id));
  handle('pose-generation:start', request => {
    if (!root || isWithin(appRoot(), root)) throw Error('Choisis une bibliothèque de production avant de générer une pose.');
    return poseGenerations.start(root, request);
  });
  handle('pose-generation:get', id => poseGenerations.get(id));
  handle('pose-generation:cancel', async id => { const job = poseGenerations.cancel(id); await poseGenerations.flush(); return job; });
  handle('pose-generation:apply', async id => {
    if (!root) throw Error('La bibliothèque est déconnectée.');
    const job = await poseGenerations.apply(root, id);
    return { job, library: await refresh(true) };
  });
  handle('animation-generation:start', request => {
    if (!root || isWithin(appRoot(), root)) throw Error('Choisis une bibliothèque de production avant de générer une animation.');
    return animationGenerations.start(root, request);
  });
  handle('animation-generation:get', id => animationGenerations.get(id));
  handle('animation-generation:cancel', async id => { const job = animationGenerations.cancel(id); await animationGenerations.flush(); return job; });
  handle('animation-generation:apply', async id => {
    if (!root) throw Error('La bibliothèque est déconnectée.');
    const job = await animationGenerations.apply(root, id);
    return { job, library: await refresh(true) };
  });
  handle('terrain-generation:cancel', async id => { const job = terrainGenerations.cancel(id); await terrainGenerations.flush(); return job; });
  handle('terrain-generation:apply', async id => {
    if (!root) throw new Error('La bibliothèque est déconnectée.');
    const job = await terrainGenerations.apply(root, id);
    return { job, library: await refresh(true) };
  });
  const listOpenAiModels = async () => {
    if (e2e && process.env.LUNARIA_E2E_CODEX_MODELS_LIVE !== '1') {
      const fixture = path.join(app.getPath('userData'), 'codex-models.json');
      try {
        const real = await fs.realpath(fixture), profile = await fs.realpath(app.getPath('userData'));
        if (!isWithin(profile, real)) throw new Error('Fixture de modèles hors du profil isolé.');
        const data = JSON.parse(await fs.readFile(real, 'utf8'));
        if (!Array.isArray(data)) throw new Error('Détection des modèles indisponible pour ce test.');
        return data;
      } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
    }
    return listCodexModels();
  };
  handle('background-correction:models', () => listOpenAiModels());
  handle('ai:status', () => aiSettings.status());
  handle('ai:set-gemini-key', key => aiSettings.setGeminiApiKey(key));
  handle('ai:models', async rawProvider => {
    const provider = normalizeAiProvider(rawProvider);
    if (provider === 'gemini') {
      if (e2e) {
        const fixture = path.join(app.getPath('userData'), 'gemini-models.json');
        try {
          const real = await fs.realpath(fixture), profile = await fs.realpath(app.getPath('userData'));
          if (!isWithin(profile, real)) throw new Error('Fixture de modèles Gemini hors du profil isolé.');
          const data = JSON.parse(await fs.readFile(real, 'utf8'));
          if (Array.isArray(data)) return data;
        } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      }
      const agy = await findAgyExecutable().catch(() => undefined);
      if (agy) return listAgyModels();
      return listGeminiImageModels(await aiSettings.getGeminiApiKey());
    }
    return (await listOpenAiModels()).map(item => ({ ...item, provider: 'openai' as const }));
  });
  handle('background-correction:start', request => { if (!root) throw new Error('Connecte une bibliothèque avant de corriger un décor.'); return backgroundCorrections.start(root, request); });
  handle('background-correction:get', id => backgroundCorrections.get(id));
  handle('background-correction:cancel', async id => { const job = backgroundCorrections.cancel(id); await backgroundCorrections.flush(); return job; });
  handle('background-correction:apply', async id => {
    if (!root) throw new Error('La bibliothèque est déconnectée.');
    const job = await backgroundCorrections.apply(root, id); thumbnailCache.clear();
    return { job, library: await refresh(true) };
  });
  handle('background-correction:reveal-backup', id => {
    const job = backgroundCorrections.get(id);
    if (job.status !== 'applied' || !job.backupPath) throw new Error('Aucune sauvegarde disponible.');
    shell.showItemInFolder(job.backupPath);
  });
  handle('library:import-images', async () => {
    if (!root || isWithin(appRoot(), root)) throw Error('Choisis une bibliothèque de production avant d’importer des images.');
    const result = await dialog.showOpenDialog(window!, { title: 'Importer des images dans la bibliothèque Lunaria', properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }] });
    if (result.canceled || !result.filePaths.length) return null;
    if (result.filePaths.length > 512) throw Error('Sélectionne au maximum 512 images à la fois.');
    const base = await fs.realpath(root), folder = path.join(base, 'studio_imports');
    await fs.mkdir(folder, { recursive: true });
    if (!isWithin(base, await fs.realpath(folder))) throw Error('Le dossier d’import sort de la bibliothèque.');
    const imported: string[] = [];
    for (const selected of result.filePaths) {
      const source = await fs.realpath(selected), stat = await fs.stat(source), ext = path.extname(source).toLowerCase();
      if (!stat.isFile() || stat.size < 1 || stat.size > 40 * 1024 * 1024 || !IMAGE_EXTENSIONS.has(ext)) throw Error('Image invalide ou supérieure à 40 Mo : ' + path.basename(selected));
        const existingRef = 'library://' + path.relative(base, source).split(path.sep).join('/');
        if (isWithin(base, source) && isSafeAssetRef(existingRef)) { imported.push(existingRef); continue; }
      const stem = path.basename(source, ext).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 90) || 'image';
      let destination = '';
      for (let index = 1; index <= 1000; index++) {
        const candidate = path.join(folder, `${stem}${index === 1 ? '' : '_' + index}${ext}`);
        try { await fs.copyFile(source, candidate, fsConstants.COPYFILE_EXCL); destination = candidate; break; }
        catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
      }
      if (!destination) throw Error('Trop de fichiers portent le même nom : ' + stem);
      imported.push('library://' + path.relative(base, destination).split(path.sep).join('/'));
    }
    const updated = await refresh(true);
      const resolved = imported.map(ref => updated?.assets.find(asset => asset.ref === ref));
      if (resolved.some(asset => !asset)) throw Error('Certaines images importées ne sont pas visibles dans la bibliothèque.');
      return resolved.filter((asset): asset is NonNullable<typeof asset> => !!asset);
  });
  handle('cinematic-jpg:begin', async (title, count) => {
    if (typeof title !== 'string' || typeof count !== 'number') throw new Error('Demande d’export JPG invalide.');
    const result = await dialog.showOpenDialog(window!, { title: 'Choisir où exporter les JPG de la cinématique', properties: ['openDirectory', 'createDirectory'] });
    return result.canceled || !result.filePaths[0] ? null : jpgExports.begin(result.filePaths[0], title, count);
  });
  handle('cinematic-jpg:write', (id, index, dataUrl) => {
    if (typeof id !== 'string' || typeof index !== 'number' || typeof dataUrl !== 'string') throw new Error('Image JPG invalide.');
    return jpgExports.write(id, index, dataUrl);
  });
  handle('cinematic-jpg:image', async ref => {
    if (typeof ref !== 'string' || !root) throw new Error('Image de bibliothèque introuvable.');
    const file = await resolveAsset(root, ref);
    const extension = path.extname(file).toLowerCase();
    const mime = extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : '';
    if (!mime) throw new Error('Format d’image non pris en charge.');
    const stat = await fs.stat(file);
    if (stat.size > 80 * 1024 * 1024) throw new Error('Image trop volumineuse pour l’export.');
    return `data:${mime};base64,${(await fs.readFile(file)).toString('base64')}`;
  });
  handle('cinematic-jpg:finish', id => {
    if (typeof id !== 'string') throw new Error('Session JPG invalide.');
    return jpgExports.finish(id);
  });
  handle('cinematic-jpg:cancel', id => {
    if (typeof id !== 'string') throw new Error('Session JPG invalide.');
    return jpgExports.cancel(id);
  });
  ipcMain.on('studio:dirty', (event, value: unknown) => {
    try { validateSender(event); if (typeof value === 'boolean') { dirty = value; window?.setDocumentEdited(dirty); } }
    catch (error) { console.warn('Skipped IPC message:', error); }
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
  protocol.handle('lunaria-correction', async request => {
    try {
      const url = new URL(request.url), parts = url.pathname.split('/').filter(Boolean);
      if (!['image', 'terrain', 'pose', 'animation'].includes(url.hostname) || parts.length !== 2) return new Response('Introuvable', { status: 404 });
      const result = await (url.hostname === 'animation' ? animationGenerations : url.hostname === 'pose' ? poseGenerations : url.hostname === 'terrain' ? terrainGenerations : backgroundCorrections).image(parts[0], parts[1]);
      return new Response(new Uint8Array(result.bytes), { headers: { 'Content-Type': result.mime, 'Cache-Control': 'no-store' } });
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
    gameDocuments = new GameDocuments(app.getPath('userData'));
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    setupProtocols(); setupIpc();
    try { const settings = await readJson(dataFile('settings.json')) as { libraryRoot?: string }; if (typeof settings.libraryRoot === 'string') await selectRoot(settings.libraryRoot); }
    catch { /* Reconnect explicitly if the saved location is unavailable. */ }
    await Promise.all([backgroundCorrections.ready, terrainGenerations.ready, poseGenerations.ready, animationGenerations.ready]);
    createWindow();
  }).catch(error => { console.error(error); app.quit(); });
}
app.on('window-all-closed', () => { watcher?.close(); clearTimeout(changeTimer); void Promise.all([backgroundCorrections.close(), terrainGenerations.close(), poseGenerations.close(), animationGenerations.close()]).finally(() => app.quit()); });
