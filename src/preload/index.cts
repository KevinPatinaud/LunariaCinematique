import { contextBridge, ipcRenderer } from 'electron';
import type { StudioAPI, LibrarySnapshot } from '../shared/model.js';
const api: StudioAPI = {
  bootstrap: () => ipcRenderer.invoke('studio:bootstrap'),
  chooseLibrary: () => ipcRenderer.invoke('library:choose'),
  exampleLibrary: () => ipcRenderer.invoke('library:example'),
  refreshLibrary: () => ipcRenderer.invoke('library:refresh'),
  importImages: () => ipcRenderer.invoke('library:import-images'),
  openCinematic: () => ipcRenderer.invoke('cinematic:open'),
  listRecentProjects: () => ipcRenderer.invoke('projects:recent-list'),
  openRecentProject: id => ipcRenderer.invoke('projects:recent-open', id),
  locateRecentProject: id => ipcRenderer.invoke('projects:recent-locate', id),
  setRecentProjectPinned: (id, pinned) => ipcRenderer.invoke('projects:recent-pin', id, pinned),
  removeRecentProject: id => ipcRenderer.invoke('projects:recent-remove', id),
  clearRecentProjects: () => ipcRenderer.invoke('projects:recent-clear'),
  revealRecentProject: id => ipcRenderer.invoke('projects:recent-reveal', id),
  saveCinematic: (cinematic, saveAs, token) => ipcRenderer.invoke('cinematic:save', cinematic, saveAs, token),
  autosave: (cinematic, token) => ipcRenderer.invoke('cinematic:autosave', cinematic, token),
  listVersions: token => ipcRenderer.invoke('versions:list', token),
  createVersion: (cinematic, token, label) => ipcRenderer.invoke('versions:create', cinematic, token, label),
  loadVersion: (token, id) => ipcRenderer.invoke('versions:load', token, id),
  resetDocument: () => ipcRenderer.invoke('document:reset'),
  discardRecovery: token => ipcRenderer.invoke('document:discard-recovery', token),
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
  recover:(project:unknown)=>ipcRenderer.invoke('game:recover',project),clearRecovery:()=>ipcRenderer.invoke('game:clear-recovery'),
  playLevel:(project:unknown,levelId:string)=>ipcRenderer.invoke('game:play-level',project,levelId),
  build:(project:unknown,target:'windows'|'android')=>ipcRenderer.invoke('game:build',project,target),
  publish:(project:unknown)=>ipcRenderer.invoke('game:publish',project),
  campaignFolder:()=>ipcRenderer.invoke('campaign:folder'),
  chooseCampaignFolder:()=>ipcRenderer.invoke('campaign:choose-folder'),
  addCampaignFilm:()=>ipcRenderer.invoke('campaign:add-film'),
  editCampaignFilm:(file:string,documentId:string)=>ipcRenderer.invoke('campaign:edit-film',file,documentId),
  checkCampaign:(project:unknown)=>ipcRenderer.invoke('campaign:check',project),
  presentationUsages:(project:unknown)=>ipcRenderer.invoke('presentation:usages',project)
});
