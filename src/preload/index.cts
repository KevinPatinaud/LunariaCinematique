import { contextBridge, ipcRenderer } from 'electron';
import type { StudioAPI, LibrarySnapshot } from '../shared/model.js';
import type { AndroidDeploymentProgress } from '../shared/game/types.js';
const api: StudioAPI = {
  bootstrap: () => ipcRenderer.invoke('studio:bootstrap'),
  chooseLibrary: () => ipcRenderer.invoke('library:choose'),
  exampleLibrary: () => ipcRenderer.invoke('library:example'),
  refreshLibrary: () => ipcRenderer.invoke('library:refresh'),
  prepareBackgroundCorrection: ref => ipcRenderer.invoke('background-correction:prepare', ref),
  listImageTasks: () => ipcRenderer.invoke('image-tasks:list'),
  removeImageTask: (kind, id) => ipcRenderer.invoke('image-tasks:remove', kind, id),
  clearImageTaskHistory: () => ipcRenderer.invoke('image-tasks:clear'),
  retryImageTask: (kind, id) => ipcRenderer.invoke('image-tasks:retry', kind, id),
  listBackgroundModels: () => ipcRenderer.invoke('background-correction:models'),
  startBackgroundCorrection: request => ipcRenderer.invoke('background-correction:start', request),
  getBackgroundCorrection: id => ipcRenderer.invoke('background-correction:get', id),
  cancelBackgroundCorrection: id => ipcRenderer.invoke('background-correction:cancel', id),
  applyBackgroundCorrection: id => ipcRenderer.invoke('background-correction:apply', id),
  revealBackgroundBackup: id => ipcRenderer.invoke('background-correction:reveal-backup', id),
  startTerrainGeneration: request => ipcRenderer.invoke('terrain-generation:start', request),
  getTerrainGeneration: id => ipcRenderer.invoke('terrain-generation:get', id),
  cancelTerrainGeneration: id => ipcRenderer.invoke('terrain-generation:cancel', id),
  applyTerrainGeneration: id => ipcRenderer.invoke('terrain-generation:apply', id),
  importImages: () => ipcRenderer.invoke('library:import-images'),
  beginJpgExport: (title, count) => ipcRenderer.invoke('cinematic-jpg:begin', title, count),
  writeJpgFrame: (id, index, dataUrl) => ipcRenderer.invoke('cinematic-jpg:write', id, index, dataUrl),
  imageDataForJpg: ref => ipcRenderer.invoke('cinematic-jpg:image', ref),
  finishJpgExport: id => ipcRenderer.invoke('cinematic-jpg:finish', id),
  cancelJpgExport: id => ipcRenderer.invoke('cinematic-jpg:cancel', id),
  confirmUnsaved: reason => ipcRenderer.invoke('studio:confirm-unsaved', reason),
  confirmDelete: name => ipcRenderer.invoke('studio:confirm-delete', name),
  closeWindow: () => ipcRenderer.invoke('studio:close'),
  onCloseRequested: callback => {
    const listener = () => callback();
    ipcRenderer.on('studio:close-requested', listener);
    return () => ipcRenderer.removeListener('studio:close-requested', listener);
  },
  setDirty: dirty => ipcRenderer.send('studio:dirty', dirty),
  onLibraryChanged: callback => {
    const listener = (_event: unknown, snapshot: LibrarySnapshot) => callback(snapshot);
    ipcRenderer.on('library:changed', listener);
    return () => ipcRenderer.removeListener('library:changed', listener);
  }
};
contextBridge.exposeInMainWorld('lunaria', api);

// Separate, explicitly enumerated capability: no raw IPC or arbitrary filesystem API.
contextBridge.exposeInMainWorld('lunariaGame', {
  bootstrap:()=>ipcRenderer.invoke('game:bootstrap'),open:()=>ipcRenderer.invoke('game:open'),
  openRecent:(path:string)=>ipcRenderer.invoke('game:recent',path),
  save:(project:unknown,token:string,saveAs:boolean)=>ipcRenderer.invoke('game:save',project,token,saveAs),
  inspectConflict:(token:string)=>ipcRenderer.invoke('game:conflict',token),
  reconcile:(project:unknown,token:string,revision:string,draft:unknown)=>ipcRenderer.invoke('game:reconcile',project,token,revision,draft),
  backup:(project:unknown)=>ipcRenderer.invoke('game:backup',project),
  recover:(project:unknown,context:unknown)=>ipcRenderer.invoke('game:recover',project,context),clearRecovery:()=>ipcRenderer.invoke('game:clear-recovery'),
  testAbility:(project:unknown,sourceId:string,abilityId:string,targetId:string)=>ipcRenderer.invoke('game:test-ability',project,sourceId,abilityId,targetId),
  playLevel:(project:unknown,levelId:string)=>ipcRenderer.invoke('game:play-level',project,levelId),
  build:(project:unknown,target:'windows'|'android')=>ipcRenderer.invoke('game:build',project,target),
  deployAndroid:(project:unknown)=>ipcRenderer.invoke('game:deploy-android',project),
  onAndroidDeploymentProgress:(callback:(progress:AndroidDeploymentProgress)=>void)=>{
    const listener=(_event:unknown,progress:AndroidDeploymentProgress)=>callback(progress);
    ipcRenderer.on('game:android-deployment-progress',listener);
    return()=>ipcRenderer.removeListener('game:android-deployment-progress',listener);
  },
  publish:(project:unknown)=>ipcRenderer.invoke('game:publish',project),
  checkCampaign:(project:unknown)=>ipcRenderer.invoke('campaign:check',project),
  presentationUsages:(project:unknown)=>ipcRenderer.invoke('presentation:usages',project)
});
