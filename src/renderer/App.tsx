import type {GameProject} from '../shared/game/types.js';
import {seedProject} from '../shared/game/seed.js';
import { gameAPI } from './game/bridge.js';
import type { CampaignFilm } from '../shared/game/types.js';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { GameEditor, type GameEditorHandle } from './game/GameEditor.js';
import { textIntroDuration, textNeedsCompletion } from '../shared/textAnimation.js';
import { api } from './browserBridge.js';
import { ImageCache } from './images.js';
import { useMotionPreview } from './hooks/useMotionPreview.js';
import { useLibraryLayout } from './hooks/useLibraryLayout.js';
import { Library, type LibraryTab } from './components/Library.js';
import { Inspector, cameraLabels } from './components/Inspector.js';
import { Scene, type Selection } from './components/Scene.js';
import { Layers } from './components/Layers.js';
import { TemplateDialog, DuplicateDialog } from './components/PlanDialogs.js';
import { VersionsDialog } from './components/VersionsDialog.js';
import { RecentProjectsDialog } from './components/RecentProjectsDialog.js';
import { sameProjectPath, type RecentProjectsSnapshot } from '../shared/recentProjects.js';
import { Diagnostics } from './components/Diagnostics.js';
import { useCollections } from './hooks/useCollections.js';
import { useObjectWorkspace } from './hooks/useObjectWorkspace.js';
import { editCommand } from '../shared/commands.js';
import { diagnose, type Diagnostic } from '../shared/diagnostics.js';
import { alignObjects, applyObjectChanges, createTemplate, deleteObjects, duplicateObjects, moveObjects, objectBox, placeBubble, reorderObjects, smartDuplicate, type Alignment, type DuplicateOptions, type ObjectChange, type ObjectKind, type ShotTemplate } from '../shared/studio.js';
import type { VersionSummary } from '../shared/model.js';
import { Icon } from './components/Icon.js';
import { copy, duplicateShot, newActor, newBubble, newCinematic, newShot, referencedAssets, removeActor, uid, upgradeCinematicFormat,
  type Actor, type Asset, type Bubble, type Cinematic, type LibrarySnapshot, type Shot } from '../shared/model.js';
import { demoCinematic } from '../shared/demo.js';
import { createHistory, historyReducer, type HistoryAction } from '../shared/history.js';
import { contentWarnings, validationIssues } from '../shared/schema.js';
import { clamp } from '../shared/geometry.js';
import { centeredObject } from '../shared/editing.js';
import { isAudio, isImage } from '../shared/assets.js';
import { advanceDialogue, beginPlayback, playbackStartIndex, tickPlayback, type Playback } from '../shared/playback.js';

export default function App() {
  const [presentationProject,setPresentationProject]=useState<GameProject>(()=>seedProject());
  const [gameBusy,setGameBusy]=useState(false);
  const [studioMode,setStudioMode]=useState<'cinematics'|'levels'>('cinematics');
  const [gameDirty,setGameDirty]=useState(false);
  const gameEditor=useRef<GameEditorHandle>(null);
  const libraryLayout = useLibraryLayout();
  const [history, dispatch] = useReducer(historyReducer<Cinematic>, undefined, () => createHistory(newCinematic()));
  const doc = history.present;
  const presentationUsages=useMemo(()=>{const uses:Record<string,string[]>={};for(const s of doc.shots)for(const a of s.actors)if(a.animation?.mode==='animation'&&a.animation.animationId)(uses[a.animation.animationId]??=[]).push('Film ouvert : '+doc.title+' / '+s.name+' / '+a.name);return uses;},[doc]);
  const [saved, setSaved] = useState(() => JSON.stringify(doc)), [filePath, setFilePath] = useState('');
  const [library, setLibrary] = useState<LibrarySnapshot | null>(null), [tab, setTab] = useState<LibraryTab>('environment');
  const [shotId, setShotId] = useState(doc.shots[0].id), [selection, setPrimarySelection] = useState<Selection>({ kind: 'shot' });
  const [selectionIds, setSelectionIds] = useState<string[]>([]);
  const selectionIdsRef = useRef(selectionIds); selectionIdsRef.current = selectionIds;
  const workspaceObjects = useObjectWorkspace();
  const [studioModal, setStudioModal] = useState<'templates'|'duplicate'|'versions'|'recents'|null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProjectsSnapshot>({ projects: [] });
  const [recentError, setRecentError] = useState('');
  const recentRequest = useRef(0);
  const recentTrigger = useRef<HTMLButtonElement>(null);
  const restoreRecentFocus = useRef(false);
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [recoveryStatus, setRecoveryStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const [snap, setSnap] = useState(true);
  const [textPreviewId, setTextPreviewId] = useState<string | null>(null);
  const [playback, setPlayback] = useState<Playback | null>(null), [guides, setGuides] = useState(false);
  const [busy, setBusy] = useState(true), [booted, setBooted] = useState(false), [toast, setToast] = useState('');
  const [modal, setModal] = useState<'help' | 'issues' | 'recovery' | null>(null);
  const [recovery, setRecovery] = useState<Cinematic | null>(null), [recoveryPending, setRecoveryPending] = useState(false);
  const [recoveryRoot, setRecoveryRoot] = useState(''), [desktop, setDesktop] = useState(!!window.lunaria);
  const [readyShot, setReadyShot] = useState(-1), [playbackRun, setPlaybackRun] = useState(0);
  const docRef = useRef(doc); docRef.current = doc;
  const historyRef = useRef(history); historyRef.current = history;
  const libraryRef = useRef(library); libraryRef.current = library;
  const savedRef = useRef(saved); savedRef.current = saved;
  const currentShotRef = useRef(shotId); currentShotRef.current = shotId;
  const playbackRef = useRef(playback); playbackRef.current = playback;
  // Remember the origin of the last preview, not its last displayed plan.
  const playbackStartId = useRef<string | undefined>(undefined);
  const running = useRef(false), documentToken = useRef(''), documentEpoch = useRef(0), readyShotRef = useRef(-1);
  const closeAction = useRef<() => void>(() => undefined), audioRef = useRef<HTMLAudioElement | null>(null);
  const assetCache = useRef(new ImageCache()), autosaved = useRef(false);
  const dirty = saved !== JSON.stringify(doc);
  const assets = library?.assets ?? [];
  const assetRefs = useMemo(() => new Set(assets.map(a => a.ref)), [library]);
  const selectedShot = doc.shots.find(s => s.id === shotId) ?? doc.shots[0];
  const selectedShotNumber = String(playbackStartIndex(doc, selectedShot.id) + 1).padStart(2, '0');
  const textPreviewBubble = selectedShot.bubbles.find(b => b.id === textPreviewId);
  const previewDuration = textPreviewBubble ? Math.max(4, textIntroDuration(textPreviewBubble) + 2) : selectedShot.duration;
  const motionPreview = useMotionPreview(`${documentEpoch.current}:${selectedShot.id}`, previewDuration, !!playback || busy || !!modal || !!studioModal);
  const startMotionPreview = () => { setTextPreviewId(null); motionPreview.start(); };
  const startTextPreview = (id: string) => { setTextPreviewId(id); motionPreview.start(); };
  useEffect(() => { setTextPreviewId(null); }, [selectedShot.id]);
  const shot = playback ? doc.shots[playback.shotIndex] ?? selectedShot : selectedShot;
  const warnings = useMemo(() => [...contentWarnings(doc), ...validationIssues(doc)], [doc]);
  const missing = useMemo(() => referencedAssets(doc).filter(ref => !assetRefs.has(ref)), [doc, assetRefs]);
  const notify = useCallback((message: string) => setToast(message), []);
  const collections = useCollections(library?.rootPath ?? '', notify);
  const diagnostics = useMemo(() => diagnose(doc, assets, !!library), [doc, library]);
  const issueCount = diagnostics.filter(i=>i.severity!=='info').length;
  const errors = (error: unknown) => notify(error instanceof Error ? error.message : String(error));
  function changeHistory(action: HistoryAction<Cinematic>) {
    const next = historyReducer(historyRef.current, action);
    historyRef.current = next; docRef.current = next.present; dispatch(action);
  }
  function setSelection(next: Selection, additive=false) {
    if (next.kind==='shot') { selectionIdsRef.current=[]; setSelectionIds([]); setPrimarySelection(next); return; }
    const ids = additive ? (selectionIdsRef.current.includes(next.id) ? selectionIdsRef.current.filter(id=>id!==next.id) : [...selectionIdsRef.current,next.id]) : [next.id];
    selectGroup(ids);
  }
  function selectGroup(ids:string[], additive=false) {
    const source=docRef.current.shots.find(s=>s.id===currentShotRef.current)??docRef.current.shots[0];
    const existing=new Set([...source.actors,...source.bubbles].map(o=>o.id));
    const selected=[...new Set(additive?[...selectionIdsRef.current,...ids]:ids)].filter(id=>existing.has(id));
    selectionIdsRef.current=selected;setSelectionIds(selected);
    const id=selected.at(-1);setPrimarySelection(id?{kind:source.actors.some(a=>a.id===id)?'actor':'bubble',id}:{kind:'shot'});
  }
  function selectAll() {selectGroup([...selectedShot.actors,...selectedShot.bubbles].filter(o=>!workspaceObjects.locked.has(o.id)&&!workspaceObjects.hidden.has(o.id)).map(o=>o.id));}
  function editableIds() {return selectionIdsRef.current.filter(id=>!workspaceObjects.locked.has(id));}
  function commit(edit: (next: Cinematic) => void, key = '', label = 'Modifier la cinématique') {
    changeHistory({type:'execute',command:editCommand(docRef.current,next=>{edit(next);upgradeCinematicFormat(next);},label),key,now:Date.now()});
  }
  function batchUpdate(changes:ObjectChange[],label='Modifier la sélection',key='') {
    if (playbackRef.current||running.current) return;
    const allowed=changes.filter(c=>!workspaceObjects.locked.has(c.id));
    if (!allowed.length) return;
    const id=selectedShot.id;commit(d=>{const s=d.shots.find(s=>s.id===id);if(s)applyObjectChanges(s,allowed);},key,label);
  }
  function alignSelection(alignment:Alignment) { batchUpdate(alignObjects(selectedShot,editableIds(),alignment),'Aligner la sélection'); }
  function reorderLayer(kind:ObjectKind,source:string,target:string) {
    if (playbackRef.current||running.current||workspaceObjects.locked.has(source)) return;
    commit(d=>{const s=d.shots.find(s=>s.id===selectedShot.id);if(s)reorderObjects(s,kind,source,target);},'',kind==='actor'?'Réordonner les calques':'Réordonner les répliques');
  }
  function updateShot(patch: Partial<Shot>, key = '') {
    const id = selectedShot.id;
    commit(next => { const found = next.shots.find(s => s.id === id); if (found) Object.assign(found, patch); }, key ? `${id}:${key}` : '');
  }
  function updateObject(kind: 'actor' | 'bubble', id: string, patch: Partial<Actor> | Partial<Bubble>, key = '') {
    if (workspaceObjects.locked.has(id)) return;
    const shotId = selectedShot.id;
    commit(next => { const current = next.shots.find(s => s.id === shotId); if (!current) return;
      const object = kind === 'actor' ? current.actors.find(a => a.id === id) : current.bubbles.find(b => b.id === id);
      if (object) Object.assign(object, patch);
    }, key ? `${shotId}:${id}:${key}` : '');
  }
  function selectShot(id: string) { currentShotRef.current = id; setShotId(id); setSelection({ kind: 'shot' }); changeHistory({ type: 'boundary' }); }
  function replaceDocument(next: Cinematic, token: string, path = '', isSaved = false) {
    documentEpoch.current++; documentToken.current = token; autosaved.current = false; setRecoveryStatus('idle');
    changeHistory({ type: 'reset', value: next }); selectShot(next.shots[0].id);
    setFilePath(path); const fingerprint = isSaved ? JSON.stringify(next) : ''; savedRef.current = fingerprint; setSaved(fingerprint);
    setPlayback(null); playbackStartId.current = undefined; readyShotRef.current = -1; setReadyShot(-1);
  }
  async function operation<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (running.current || !booted) return;
    // Native close / Ctrl+S do not blur fields themselves. Commit numeric drafts
    // before reading docRef or deciding whether there are unsaved changes.
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.matches('input,textarea,[contenteditable="true"]')) active.blur();
    running.current = true; setBusy(true);
    try { return await fn(); } catch (error) { errors(error); return undefined; }
    finally { running.current = false; setBusy(false); }
  }
  async function saveDocument(saveAs = false): Promise<boolean> {
    const requested = copy(docRef.current), epoch = documentEpoch.current;
    if (validationIssues(requested).length) { setModal('issues'); return false; }
    const result = await api.saveCinematic(requested, saveAs || !filePath, documentToken.current);
    if (!result || epoch !== documentEpoch.current) return false;
    setFilePath(result.path); const fingerprint = JSON.stringify(requested); savedRef.current = fingerprint; setSaved(fingerprint);
    changeHistory({ type: 'boundary' });
    void reloadRecents();
    notify(result.warnings?.length ? result.warnings.join(' · ') : result.missing.length ? `Enregistré — ${result.missing.length} référence(s) à reconnecter.` : desktop ? 'Cinématique enregistrée. Les images restent dans la bibliothèque.' : 'Téléchargement du JSON demandé. Vérifie le fichier dans tes téléchargements.');
    return true;
  }
  const save = (saveAs = false) => operation(() => saveDocument(saveAs));
  async function reloadRecents(): Promise<void> {
    const request = ++recentRequest.current;
    try { const result = await api.listRecentProjects(); if (request === recentRequest.current) setRecentProjects(result); }
    catch (error) { if (request === recentRequest.current) setRecentError(error instanceof Error ? error.message : String(error)); }
  }
  const closeRecents = () => {
    restoreRecentFocus.current = true;
    setStudioModal(null);
  };
  useEffect(() => {
    if (studioModal === null && !busy && restoreRecentFocus.current) {
      restoreRecentFocus.current = false; recentTrigger.current?.focus();
    }
  }, [studioModal, busy]);
  const openRecents = () => {
    setStudioModal('recents'); setRecentError('');
    void operation(reloadRecents);
  };
  function applyOpened(result: Awaited<ReturnType<typeof api.openCinematic>>) {
    if (!result) return;
    if (result.library !== undefined) { libraryRef.current = result.library; setLibrary(result.library); assetCache.current.clear(); }
    replaceDocument(result.cinematic, result.documentToken, result.path, true);
    setStudioModal(null); setRecentError('');
    notify(result.warnings?.length ? result.warnings.join(' · ') : 'Cinématique ouverte.');
    void reloadRecents();
  }
  const openRecent = (id: string, locate = false) => operation(async () => {
    setRecentError('');
    // Returning to the already-open file must not discard its current draft.
    if (!locate && recentProjects.projects.some(p => p.id === id && sameProjectPath(p.path, filePath))) { closeRecents(); return; }
    try {
      if (!await canReplace('Enregistrer avant de reprendre une autre cinématique ?')) return;
      applyOpened(await (locate ? api.locateRecentProject(id) : api.openRecentProject(id)));
    } catch (error) {
      setStudioModal('recents'); setRecentError('Ouverture impossible. Le travail courant est conservé. ' + (error instanceof Error ? error.message : String(error)));
      await reloadRecents();
    }
  });
  const manageRecent = (action: () => Promise<void>) => operation(async () => {
    setRecentError('');
    try { await action(); await reloadRecents(); }
    catch (error) { setRecentError(error instanceof Error ? error.message : String(error)); }
  });

  async function canReplace(reason: string) {
    if (savedRef.current === JSON.stringify(docRef.current)) return true;
    const choice = await api.confirmUnsaved(reason);
    return choice === 'discard' || (choice === 'save' && await saveDocument());
  }
  const createDocument = () => operation(async () => {
    if (await canReplace('Enregistrer avant de créer une nouvelle cinématique ?')) replaceDocument(newCinematic(), await api.resetDocument());
  });
  const chooseLibrary = () => operation(async () => {
    const result = await api.chooseLibrary();
    if (result) { libraryRef.current = result; setLibrary(result); assetCache.current.clear(); notify(`${result.assets.length} assets liés. Aucun fichier copié.`); }
  });
  const refreshLibrary = () => operation(async () => { const result = await api.refreshLibrary(); if (result) { setLibrary(result); assetCache.current.clear(); notify('Bibliothèque actualisée.'); } });
  const loadExample = () => operation(async () => {
    if (!await canReplace('Enregistrer avant de charger l’exemple ?')) return;
    const result = await api.exampleLibrary(); setLibrary(result); libraryRef.current = result;
    replaceDocument(demoCinematic(), await api.resetDocument()); notify('Exemple chargé. Les images restent dans la bibliothèque exemple.');
  });
  const open = () => operation(async () => {
    if (!await canReplace('Enregistrer avant d’ouvrir une autre cinématique ?')) return;
    try { applyOpened(await api.openCinematic()); }
    catch (error) { setRecentError(error instanceof Error ? error.message : String(error)); throw error; }
  });
  const openCampaignFilm = (film:CampaignFilm) => operation(async () => {
    if(!await canReplace('Enregistrer la cinématique ouverte avant de passer au film du parcours ?'))return;
    const result=await gameAPI.editCampaignFilm(film.file,film.documentId);
    applyOpened(result);setPlayback(null);motionPreview.stop();setStudioMode('cinematics');
  });
  async function prepareCampaignPublish():Promise<boolean> {
    if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
    return canReplace('Enregistrer la cinématique ouverte avant de synchroniser le jeu ? La publication, le test et les builds utilisent les fichiers enregistrés, pas les brouillons.');
  }
  async function recover(accept: boolean) {
    await operation(async () => {
      if (accept && recovery) replaceDocument(recovery, documentToken.current);
      else await api.discardRecovery(documentToken.current);
      setRecoveryPending(false); setRecovery(null); setModal(null);
    });
  }
  closeAction.current = () => { void operation(async () => {
    if(gameEditor.current && !await gameEditor.current.prepareClose()) {setStudioMode('levels');return;}
    if (savedRef.current !== JSON.stringify(docRef.current)) {
      const choice = await api.confirmUnsaved('Enregistrer la cinématique avant de quitter ?');
      if (choice === 'cancel' || (choice === 'save' && !await saveDocument())) return;
      if (choice === 'discard') await api.autosave(docRef.current, documentToken.current);
    }
    await api.closeWindow();
  }); };
  function addShot() {setStudioModal('templates');}
  function insertShot(next:Shot,label:string) {
    if(docRef.current.shots.length>=500)return notify('Maximum 500 plans par cinématique.');
    commit(d=>d.shots.splice(d.shots.findIndex(s=>s.id===selectedShot.id)+1,0,next),'',label);selectShot(next.id);setStudioModal(null);
  }
  function fromTemplate(template:ShotTemplate,speakers:string[]=[]) {
    try { const next=createTemplate(selectedShot,template,speakers);
      const frame=assets.find(a=>a.path.endsWith('dialogue_panel_simple_v01.png'));
      if(frame) for(const bubble of next.bubbles) {bubble.style='simple';bubble.frameAsset=frame.ref;Object.assign(bubble,placeBubble(next,bubble));}
      insertShot(next,'Créer un plan : '+next.name);
    } catch(error) {errors(error);}
  }
  function duplicatePlan(options:DuplicateOptions) {insertShot(smartDuplicate(selectedShot,options),'Dupliquer le plan');}
  const openVersions = () => {setVersions([]);setStudioModal('versions');void operation(async()=>setVersions(await api.listVersions(documentToken.current)));};
  const createVersion = (label:string) => operation(async()=>{await api.createVersion(docRef.current,documentToken.current,label);setVersions(await api.listVersions(documentToken.current));notify('Point de repère conservé, sans copie des images.');});
  const restoreVersion = (id:string) => operation(async()=>{
    const epoch=documentEpoch.current,version=await api.loadVersion(documentToken.current,id);
    await api.createVersion(docRef.current,documentToken.current,'Avant restauration');
    if(epoch!==documentEpoch.current)return;
    commit(d=>Object.assign(d,copy(version.cinematic)),'','Restaurer une version locale'); selectShot(version.cinematic.shots[0].id);setStudioModal(null);
    notify(version.libraryRoot && version.libraryRoot !== libraryRef.current?.rootPath ? `Version restaurée. Vérifie la bibliothèque utilisée : ${version.libraryRoot}. Le fichier source n’a pas été écrasé.` : 'Version restaurée dans le brouillon. Ctrl+Z annule ; Enregistrer met à jour le fichier source.');
  });
  function focusDiagnostic(issue:Diagnostic) {
    if(!issue.shotId)return; selectShot(issue.shotId);
    if(issue.objectId&&issue.kind) {workspaceObjects.change('hidden',issue.objectId,false);setSelection({kind:issue.kind,id:issue.objectId});}
    setModal(null);
  }
  function fixDiagnostic(issue:Diagnostic) {
    if(!issue.shotId||!issue.objectId||!issue.kind)return;
    if(workspaceObjects.locked.has(issue.objectId))return notify('Déverrouille cet élément avant de le corriger.');
    commit(d=>{const s=d.shots.find(s=>s.id===issue.shotId);if(!s)return;
      const object=issue.kind==='actor'?s.actors.find(a=>a.id===issue.objectId):s.bubbles.find(b=>b.id===issue.objectId);if(!object)return;
      if(issue.fix==='center') Object.assign(object,centeredObject(object));
      else if(issue.kind==='bubble')Object.assign(object,placeBubble(s,object as Bubble));
    },'','Corriger : '+issue.message);
  }
  function autoPlaceSelected() {if(selection.kind==='bubble')fixDiagnostic({id:'placement',severity:'info',message:'Placement de la bulle',shotId:selectedShot.id,objectId:selection.id,kind:'bubble',fix:'place-bubble'});}
  function addBubble(kind: Bubble['kind'] = 'speech') {
    if (selectedShot.bubbles.length >= 100) return notify('Maximum 100 répliques par plan.');
    const speaker = selection.kind === 'actor' && selectedShot.actors.some(a => a.id === selection.id) ? selection.id : null;
    let bubble = newBubble(speaker, kind);
    if (selectedShot.bubbles.length) { bubble.x = 0.13 + (selectedShot.bubbles.length % 3) * 0.16; bubble.y = 0.08 + (selectedShot.bubbles.length % 3) * 0.16; }
    const frame = assets.find(a => a.path.endsWith('/dialogue_panel_simple_v01.png') || a.path === 'dialogue_panel_simple_v01.png');
    if (frame) { bubble.style = 'simple'; bubble.frameAsset = frame.ref; }
    bubble=placeBubble(selectedShot,bubble);
    commit(d => { d.shots.find(s => s.id === selectedShot.id)?.bubbles.push(bubble); }, '', 'Ajouter une bulle'); setSelection({ kind: 'bubble', id: bubble.id });
  }
  async function useAsset(asset: Asset, as: LibraryTab, position?: { x: number; y: number }): Promise<boolean> {
    if (playbackRef.current || running.current) return false;
    const targetId = selectedShot.id, epoch = documentEpoch.current, sourceRoot = libraryRef.current?.rootPath;
    if (as === 'audio' ? !isAudio(asset.path) : !isImage(asset.path)) { notify('Ce type de ressource ne convient pas à cette action.'); return false; }
    if (as === 'environment') { updateShot({ background: { asset: asset.ref, fit: 'cover' } }); setSelection({ kind: 'shot' }); }
    else if (as === 'audio') { updateShot({ audio: { asset: asset.ref, volume: 0.65, loop: true } }); notify('Audio ajouté à ce plan.'); }
    else if (as === 'ui') {
      const style = asset.path.endsWith('dialogue_panel_simple_v01.png') ? 'simple' : asset.path.endsWith('tooltip_ornate_v01.png') ? 'ornate' : null;
      if (!style) { notify('Pour ce PNG, utilise « Ajouter comme objet ». Les cadres extensibles reconnus sont Organique et Orné.'); return false; }
      const existing = selection.kind === 'bubble' ? selectedShot.bubbles.find(b => b.id === selection.id) : null;
      if (existing && workspaceObjects.locked.has(existing.id)) {notify('Déverrouille la bulle avant de changer son cadre.');return false;}
      if (existing) updateObject('bubble', existing.id, { style, frameAsset: asset.ref, autoHeight: true });
      else {
        if (selectedShot.bubbles.length >= 100) { notify('Maximum 100 répliques par plan.'); return false; }
        let bubble = newBubble(); bubble.style = style; bubble.frameAsset = asset.ref; bubble=placeBubble(selectedShot,bubble);
        commit(d => { d.shots.find(s => s.id === targetId)?.bubbles.push(bubble); }); setSelection({ kind: 'bubble', id: bubble.id });
      }
    } else {
      try {
        const image = await assetCache.current.load(asset.url, asset.name);
        if (epoch !== documentEpoch.current || sourceRoot !== libraryRef.current?.rootPath || playbackRef.current || running.current) { notify('Insertion annulée : le projet ou la bibliothèque a changé.'); return false; }
        const current = docRef.current.shots.find(s => s.id === targetId);
        if (!current) { notify('Insertion annulée : le plan a été supprimé.'); return false; }
        if (current.actors.length >= 50) { notify('Maximum 50 objets par plan.'); return false; }
        const actor = newActor(asset, image.naturalWidth / image.naturalHeight, 0.3 + (current.actors.length % 3) * 0.16, 0.42, as === 'enemy' ? 'enemy' : as === 'prop' ? 'prop' : 'character');
        if (position) { actor.x = clamp(position.x - actor.width / 2, -1, 2); actor.y = clamp(position.y - actor.height / 2, -1, 2); }
        commit(d => { d.shots.find(s => s.id === targetId)?.actors.push(actor); }, '', as === 'enemy' ? 'Ajouter un ennemi' : as === 'prop' ? 'Ajouter un objet' : 'Ajouter un personnage');
        if (currentShotRef.current === targetId) setSelection({ kind: 'actor', id: actor.id });
        else notify(`Objet ajouté au plan « ${current.name} ».`);
      } catch (error) { errors(error); return false; }
    }
    collections.use(asset.ref);
    return true;
  }
  function duplicate() {
    if(selection.kind==='shot') {setStudioModal('duplicate');return;}
    const ids=editableIds();if(!ids.length)return notify('Déverrouille la sélection avant de la dupliquer.');
    try {let added:string[]=[];commit(d=>{const s=d.shots.find(s=>s.id===selectedShot.id);if(s)added=duplicateObjects(s,ids);},'','Dupliquer la sélection');selectGroup(added);}catch(error){errors(error);}
  }
  function remove() {
    if (selection.kind === 'shot') {
      if (doc.shots.length === 1) return;
      void operation(async () => {
        if (!await api.confirmDelete(selectedShot.name)) return;
        const index = docRef.current.shots.findIndex(s => s.id === selectedShot.id);
        commit(d => { d.shots = d.shots.filter(s => s.id !== selectedShot.id); });
        selectShot(docRef.current.shots[Math.max(0, index - 1)].id);
      });
    } else {
      const ids=editableIds();if(!ids.length)return notify('Déverrouille la sélection avant de la supprimer.');
      commit(d=>{const s=d.shots.find(s=>s.id===selectedShot.id);if(s)deleteObjects(s,ids);},'','Supprimer la sélection');setSelection({kind:'shot'});
    }
  }
  function layer(direction: number) {
    if (selection.kind !== 'actor' || workspaceObjects.locked.has(selection.id)) return;
    const actors = [...selectedShot.actors], i = actors.findIndex(a => a.id === selection.id), j = i + direction;
    if (i >= 0 && j >= 0 && j < actors.length) { [actors[i], actors[j]] = [actors[j], actors[i]]; updateShot({ actors }); }
  }
  function moveBubble(id: string, direction: number) {
    if(workspaceObjects.locked.has(id))return;
    const bubbles = [...selectedShot.bubbles], i = bubbles.findIndex(b => b.id === id), j = i + direction;
    if (i >= 0 && j >= 0 && j < bubbles.length) { [bubbles[i], bubbles[j]] = [bubbles[j], bubbles[i]]; updateShot({ bubbles }); }
  }
  function reorderShot(source: string, target: string) {
    if (source === target || playbackRef.current || running.current) return;
    commit(d => { const from = d.shots.findIndex(s => s.id === source), to = d.shots.findIndex(s => s.id === target);
      if (from < 0 || to < 0) return; const [moving] = d.shots.splice(from, 1); d.shots.splice(to, 0, moving); });
  }
  async function preloadShot(index: number) {
    const refs = referencedAssets({ ...docRef.current, shots: docRef.current.shots.slice(index, index + 2) });
    const toLoad = libraryRef.current?.assets.filter(a => refs.includes(a.ref) && isImage(a.path)) ?? [];
    await Promise.all(toLoad.map(a => assetCache.current.load(a.url, a.name)));
  }
  const startPlayback = (fromShotId?: string) => operation(async () => {
    motionPreview.stop();
    const current = docRef.current;
    // Resolve by stable ID after committing pending edits; reordering cannot
    // leave a cached index pointing at a different plan.
    const index = playbackStartIndex(current, fromShotId);
    const needed = referencedAssets({ ...current, shots: current.shots.slice(index) });
    if (needed.some(ref => !assetRefs.has(ref)) || validationIssues(current).length) { setModal('issues'); return; }
    await preloadShot(index);
    playbackStartId.current = current.shots[index]?.id;
    readyShotRef.current = index; setReadyShot(index); setPlaybackRun(n => n + 1); setPlayback(beginPlayback(index));
  });
  const advance = () => setPlayback(current => current && readyShotRef.current === current.shotIndex ? advanceDialogue(docRef.current, current) : current);
  useEffect(() => {
    let live = true;
    api.bootstrap().then(result => { if (live) {
      if (result.recentProjects) setRecentProjects(result.recentProjects);
      documentToken.current = result.documentToken; libraryRef.current = result.library; setLibrary(result.library); setDesktop(result.desktop);
      if (result.recovery) { setRecovery(result.recovery); setRecoveryRoot(result.recoveryLibraryRoot ?? ''); setRecoveryPending(true); setModal('recovery'); }
    } }).catch(error => live && errors(error)).finally(() => { if (live) { setBooted(true); setBusy(false); } });
    const unsubscribe = api.onLibraryChanged(snapshot => { if (live) { libraryRef.current = snapshot; setLibrary(snapshot); } });
    const close = api.onCloseRequested(() => closeAction.current());
    return () => { live = false; unsubscribe(); close(); };
  }, []);
  useEffect(() => {
    // Undo can remove the selected object or plan. Never keep a dangling selection.
    if (!doc.shots.some(s => s.id === shotId)) { currentShotRef.current = doc.shots[0].id; setShotId(doc.shots[0].id); setSelection({ kind: 'shot' }); }
    else {const valid=new Set([...selectedShot.actors,...selectedShot.bubbles].map(o=>o.id));const retained=selectionIdsRef.current.filter(id=>valid.has(id));if(retained.length!==selectionIdsRef.current.length)selectGroup(retained);}
  }, [doc, shotId, selection]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 9000); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    if (!booted || !documentToken.current) return;
    api.setDirty(dirty || gameDirty);
    if (busy || recoveryPending) return;
    if (!dirty) {
      if (autosaved.current && desktop) { autosaved.current = false; void api.discardRecovery(documentToken.current).catch(errors); }
      return;
    }
    const token = documentToken.current;
    const timer = setTimeout(() => {
      if (!validationIssues(doc).length) { autosaved.current = true; setRecoveryStatus('saving'); void api.autosave(doc, token).then(()=>{if(documentToken.current===token)setRecoveryStatus('saved');}).catch(error => {if(documentToken.current===token)setRecoveryStatus('error');notify(`Récupération automatique indisponible : ${String(error)}`);}); }
    }, 300);
    return () => clearTimeout(timer);
  }, [doc, dirty, gameDirty, busy, booted, recoveryPending]);
  useEffect(() => {
    if (desktop || (!dirty && !gameDirty)) return;
    const listener = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', listener); return () => window.removeEventListener('beforeunload', listener);
  }, [desktop, dirty, gameDirty]);
  useEffect(() => {
    if (!playback || playback.finished) return;
    let live = true; const index = playback.shotIndex;
    if (readyShotRef.current !== index) setReadyShot(-1);
    void preloadShot(index).then(() => { if (live) { readyShotRef.current = index; setReadyShot(index); } }).catch(error => { if (live) { setPlayback(null); errors(error); } });
    return () => { live = false; };
  }, [playback?.shotIndex, playbackRun, !!playback]);
  useEffect(() => {
    if (!playback) return;
    let frame = 0, last = performance.now();
    function tick(now: number) {
      const delta = (now - last) / 1000; last = now;
      setPlayback(state => state && state.shotIndex === readyShotRef.current && !document.hidden ? tickPlayback(docRef.current, state, delta) : state);
      frame = requestAnimationFrame(tick);
    }
    const visibility = () => { last = performance.now(); if (document.hidden) { setPlayback(s => s ? { ...s, paused: true } : s); notify('Aperçu mis en pause pendant que le studio était masqué.'); } };
    document.addEventListener('visibilitychange', visibility);
    frame = requestAnimationFrame(tick); return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', visibility); };
  }, [!!playback]);
  const audioUrl = playback && !playback.finished && readyShot === playback.shotIndex && shot.audio ? assets.find(a => a.ref === shot.audio!.asset)?.url : undefined;
  useEffect(() => {
    if (!audioUrl || !shot.audio) return;
    const audio = new Audio(audioUrl); audio.loop = shot.audio.loop; audio.volume = shot.audio.volume; audioRef.current = audio;
    const report = () => notify('Audio illisible ou non pris en charge : ' + shot.audio?.asset);
    audio.addEventListener('error', report);
    // The pause effect below starts and resumes the newly assigned audio exactly once.
    return () => { audio.removeEventListener('error', report); audio.pause(); audio.removeAttribute('src'); audio.load(); if (audioRef.current === audio) audioRef.current = null; };
  }, [audioUrl, playback?.shotIndex, playbackRun]);
  useEffect(() => { const audio = audioRef.current; if (!audio) return; if (playback?.paused) audio.pause(); else if (playback && !playback.finished) void audio.play().catch(() => notify('Impossible de reprendre le son.')); }, [playback?.paused, audioUrl, playback?.shotIndex, playbackRun]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if(studioMode!=='cinematics')return;
      if (event.defaultPrevented || event.isComposing || (event.repeat && !event.key.startsWith('Arrow'))) return;
      const target = event.target as HTMLElement;
      const input = target?.closest('input,textarea,select,[contenteditable="true"]');
      if (modal || document.querySelector('dialog[open]')) { if (event.key === 'Escape' && modal !== 'recovery' && !busy) setModal(null); return; }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') { event.preventDefault(); if (!busy && !playback && !recoveryPending) { if (event.shiftKey) openRecents(); else void open(); } return; }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!busy && !playback) void save(event.shiftKey); return; }
      if (event.key === 'Escape' && motionPreview.active) { motionPreview.stop(); return; }
      if (event.key === 'Escape') { if(playback)setPlayback(null);else setSelection({kind:'shot'}); return; }
      if (input || busy || recoveryPending) return;
      // Works directly after clicking a storyboard card, while plain Space
      // retains native button activation and its existing full-preview shortcut.
      if (event.code === 'Space' && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey && !playback) {
        event.preventDefault(); void startPlayback(currentShotRef.current); return;
      }
      if (motionPreview.active && !target?.closest('button,a')) { if (event.code === 'Space') { event.preventDefault(); motionPreview.toggle(); } return; }
      if ((event.ctrlKey||event.metaKey) && event.key.toLowerCase()==='a' && !playback && !target?.closest('[data-library-surface]')) {event.preventDefault();selectAll();return;}
      if(!playback && selectionIdsRef.current.length && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key) && !target?.closest('[data-library-surface]') && (!target?.closest('button') || target?.closest('.layer-row'))) {
        event.preventDefault();const step=event.shiftKey?10:1;
        batchUpdate(moveObjects(selectedShot,editableIds(),event.key==='ArrowLeft'?-step/1600:event.key==='ArrowRight'?step/1600:0,event.key==='ArrowUp'?-step/900:event.key==='ArrowDown'?step/900:0),'Déplacer au clavier',`${selectedShot.id}:nudge`);return;
      }
      // Focused buttons and library controls retain their native Space/Enter behavior.
      if (!event.ctrlKey && !event.metaKey && target?.closest('[data-library-surface]')) return;
      if (!event.ctrlKey && !event.metaKey && (event.code === 'Space' || event.key === 'Enter') && target?.closest('button,a')) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !playback) { event.preventDefault(); changeHistory({ type: event.shiftKey ? 'redo' : 'undo' }); }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y' && !playback) { event.preventDefault(); changeHistory({ type: 'redo' }); }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && !playback) { event.preventDefault(); duplicate(); }
      else if (event.key === 'Delete' && !playback) { event.preventDefault(); remove(); }
      else if (event.code === 'Space') { event.preventDefault(); if (playback) advance(); else void startPlayback(); }
    };
    window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener);
  });
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    const surface = document.querySelector<HTMLElement>('.modal');
    const focusables = () => [...(surface?.querySelectorAll<HTMLElement>('button:not([disabled]):not([hidden]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]') ?? [])];
    const timer = setTimeout(() => focusables()[0]?.focus(), 0);
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusables(); if (!items.length) { event.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !surface?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !surface?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trap, true);
    return () => { clearTimeout(timer); document.removeEventListener('keydown', trap, true); previous?.focus(); };
  }, [modal]);
  const totalSeconds = doc.shots.reduce((n, s) => n + s.duration, 0);
  const activeDialogue = playback && !playback.finished && playback.elapsed >= shot.dialogueStart ? shot.bubbles[playback.dialogueIndex] : null;
  const locked = busy || recoveryPending;
  return <div className="studio-root"><nav className="studio-modebar" aria-label="Modes du Studio"><b>LUNARIA STUDIO</b><button className={studioMode==='cinematics'?'active':''} aria-pressed={studioMode==='cinematics'} disabled={busy||!!modal||!!studioModal||gameBusy} onClick={()=>{if(!gameEditor.current?.isBusy())setStudioMode('cinematics');}}>Cinématiques{dirty?' •':''}</button><button className={studioMode==='levels'?'active':''} aria-pressed={studioMode==='levels'} disabled={busy||!!modal||!!studioModal} onClick={()=>{setPlayback(null);motionPreview.stop();setStudioMode('levels');}}>Niveaux{gameDirty?' •':''}</button><small>V1.9 · campagne & création</small></nav><div style={studioMode==='cinematics'?undefined:{display:'none'}} className="app-shell" onDragOver={e => e.preventDefault()} onDrop={e => e.preventDefault()}>
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Icon name="leaf" size={27}/></div><div><strong>LUNARIA</strong><span>CINEMATIC STUDIO</span></div><span className="version-tag">V1.9</span></div>
      <div className="project-heading"><input aria-label="Titre de la cinématique" value={doc.title} maxLength={200} disabled={!!playback || locked} onChange={e => commit(d => { d.title = e.target.value; }, 'title')}/><label className="cinematic-id">ID <input aria-label="Identifiant de la cinématique" disabled={!!playback || locked} maxLength={100} value={doc.id} onChange={e => { if (e.target.value) commit(d => { d.id = e.target.value; }, 'cinematic-id'); }}/></label><span className="save-state"><span className={`status-dot ${dirty ? 'pending' : ''}`}/>{dirty ? 'Modifications non enregistrées' : filePath ? 'Enregistré' : 'Nouveau projet'}</span></div>
      <div className="top-actions"><button className="icon-button" title="Nouveau projet" aria-label="Nouveau projet" disabled={!!playback || locked} onClick={createDocument}><Icon name="file"/></button><button className="button subtle" disabled={!!playback || locked} onClick={open}><Icon name="folder" size={16}/> Ouvrir</button><button ref={recentTrigger} className="button subtle recent-project-trigger" title="Projets récents (Ctrl+Maj+O)" aria-label="Projets récents" aria-keyshortcuts="Control+Shift+O Meta+Shift+O" disabled={!!playback || locked} onClick={openRecents}><Icon name="clock" size={16}/><span>Projets récents</span></button><button className="button save" disabled={!!playback || locked} onClick={() => save()}><Icon name="save" size={16}/> Enregistrer</button><button className="icon-button save-as" title="Enregistrer sous… (Ctrl+Maj+S)" aria-label="Enregistrer sous" disabled={!!playback || locked} onClick={() => save(true)}><Icon name="down" size={14}/></button><button className="icon-button" title="Versions locales" aria-label="Versions locales" disabled={!!playback || locked} onClick={openVersions}><Icon name="history"/></button><div className="toolbar-divider"/>{playback ? <button className="button primary" onClick={() => setPlayback(null)}><Icon name="stop" size={16}/> Quitter l’aperçu</button> : <div className="playback-actions" role="group" aria-label="Lecture de la cinématique">
        <button className="button subtle" data-testid="play-all" disabled={locked} title="Lire toute la cinématique depuis le premier plan" onClick={() => startPlayback()}><Icon name="play" size={16}/> Tout lire</button>
        <button className="button primary play-from-current" data-testid="play-from-current" disabled={locked} aria-label="Lire depuis ce plan" aria-keyshortcuts="Shift+Space" title={`Lire à partir du plan ${selectedShotNumber} — ${selectedShot.name}, puis les suivants (Maj+Espace)`} onClick={() => startPlayback(selectedShot.id)}><Icon name="play" size={16}/><span>Lire depuis ce plan</span><span className="play-from-number" aria-hidden="true">{selectedShotNumber}</span></button>
      </div>}<button className="icon-button" title="Mode d’emploi" aria-label="Mode d’emploi" onClick={() => setModal('help')}><Icon name="help"/></button></div>
    </header>
    <main className="workspace" style={{ '--library-width': `${libraryLayout.width}px` } as React.CSSProperties}>
      <Library collections={collections} layout={libraryLayout} library={library} tab={tab} setTab={setTab} choose={chooseLibrary} refresh={refreshLibrary} useAsset={useAsset} disabled={!!playback || locked} busy={busy}/>
      <section className="workbench">
        <div className="scene-toolbar"><div className="scene-path"><span>{playback ? 'APERÇU' : 'SCÈNE'}</span><Icon name="chevron" size={12}/><strong>{shot.name}</strong></div><div className="scene-actions"><button className="button text" disabled={!!playback || locked} onClick={() => { setTab('character'); notify('Glisse un PNG depuis la bibliothèque, ou double-clique sur un personnage.'); }}><Icon name="actor" size={16}/><span>Personnage</span></button><button className="button text" aria-label="Ajouter un ennemi" title="Ajouter un ennemi" disabled={!!playback || locked} onClick={() => { setTab('enemy'); notify('Choisis un ennemi dans 03_enemies, ou glisse son image dans la scène.'); }}><Icon name="enemy" size={16}/><span>Ennemi</span></button><button className="button text" aria-label="Ajouter un objet de décoration" disabled={!!playback || locked} onClick={() => {setTab('prop'); notify('Choisis un objet ou glisse son image dans la scène.');}}><Icon name="prop" size={16}/><span>Objet</span></button><button className="button text" disabled={!!playback || locked} onClick={() => addBubble()}><Icon name="bubble" size={16}/> Bulle</button><button className="button text" disabled={!!playback || locked} onClick={() => addBubble('narration')}><span className="text-symbol">T</span> Narration</button><div className="toolbar-divider"/><button className="icon-button" title={`Annuler : ${history.undoCommands.at(-1)?.label??'aucune action'} (Ctrl+Z)`} aria-label="Annuler" disabled={!history.past.length || !!playback || locked} onClick={() => changeHistory({ type: 'undo' })}><Icon name="undo" size={16}/></button><button className="icon-button" title={`Rétablir : ${history.redoCommands[0]?.label??'aucune action'} (Ctrl+Y)`} aria-label="Rétablir" disabled={!history.future.length || !!playback || locked} onClick={() => changeHistory({ type: 'redo' })}><Icon name="redo" size={16}/></button></div></div>
        <div className="canvas-area">
          <div className="canvas-topline"><span><span className="tiny-dot"/> {playback ? `Lecture · Plan ${String(playback.shotIndex + 1).padStart(2, '0')} / ${doc.shots.length}` : 'Composition du plan'}</span><span>1600 × 900 <b>16:9</b></span></div>
          <div className="canvas-fit"><div className="canvas-frame">
            <Scene presentationRunning={!!playback&&!playback.paused&&!playback.finished&&readyShot===playback.shotIndex} presentationProject={presentationProject} catalogMatches={!doc.presentationCatalog||doc.presentationCatalog.projectId===presentationProject.id} key={shot.id} previewBubbleId={!playback && motionPreview.active ? textPreviewId ?? undefined : undefined} dialogueElapsed={playback?.dialogueElapsed} textCompleted={playback?.textCompletedAt !== undefined} motionTime={motionPreview.active && !playback ? motionPreview.time : undefined} disabled={locked || motionPreview.active} shot={shot} assets={assets} selectionIds={selectionIds} lockedIds={workspaceObjects.locked} hiddenIds={workspaceObjects.hidden} snap={snap} onGroupSelect={selectGroup} onBatchUpdate={batchUpdate} selection={selection} onSelect={setSelection} onUpdate={updateObject} playing={!!playback} elapsed={playback?.elapsed ?? 0} activeBubble={playback?.dialogueIndex ?? 0} onAdvance={advance} onDropAsset={(ref, as, position) => { const asset = assets.find(a => a.ref === ref); if (asset) void useAsset(asset, as ?? (asset.kind === 'other' ? 'character' : asset.kind), position); }} guides={guides}/>
            {!shot.background.asset && !shot.actors.length && !shot.bubbles.length && !playback && <div className="welcome">
              <div className="welcome-symbol"><Icon name="leaf" size={39}/></div><span className="overline">UN DÉCOR. QUELQUES MOTS. UNE HISTOIRE.</span><h1>Donne vie à Lunaria.</h1><p>Compose tes plans, place tes personnages et<br/>laisse les bulles raconter la suite.</p><div className="welcome-buttons"><button className="button primary" onClick={chooseLibrary} disabled={locked}><Icon name="folder" size={16}/> Choisir ma bibliothèque</button><button className="button subtle" onClick={loadExample} disabled={locked}>Essayer l’exemple</button></div><small>Ou glisse simplement un décor dans ce cadre.</small>
              {!!recentProjects.projects.length && <div className="welcome-recents"><div><strong>REPRENDRE UN PROJET</strong><button className="link-button" disabled={locked} onClick={openRecents}>Tout afficher <Icon name="chevron" size={12}/></button></div>{recentProjects.projects.slice(0,3).map(p => <button key={p.id} className="welcome-recent" disabled={locked} title={p.path} onClick={() => void openRecent(p.id)}><Icon name={p.pinned ? 'pin' : 'clock'} size={14}/><span><strong>{p.title}</strong><small>{p.path.split(/[\\/]/).at(-1)}</small></span><Icon name="chevron" size={13}/></button>)}</div>}
            </div>}
            {playback?.finished && <div className="end-screen"><Icon name="leaf" size={36}/><h2>Fin de la cinématique</h2><div><button className="button primary" title="Rejouer depuis le même plan de départ" onClick={() => { setPlayback(null); void startPlayback(playbackStartId.current); }}><Icon name="play" size={16}/> Rejouer</button><button className="button subtle" onClick={() => setPlayback(null)}>Retour à l’édition</button></div></div>}
            {(busy || (playback && !playback.finished && readyShot !== playback.shotIndex)) && <div className="busy-overlay"><span className="spinner"/> Chargement…</div>}
          </div></div>
          <div className="canvas-bottomline">{playback ? <><button className="icon-button" aria-label={playback.paused ? 'Reprendre' : 'Pause'} disabled={playback.finished || readyShot !== playback.shotIndex} onClick={() => setPlayback(current => current ? { ...current, paused: !current.paused } : current)}><Icon name={playback.paused ? 'play' : 'pause'} size={16}/></button><span className="timecode">{Math.min(playback.elapsed, shot.duration).toFixed(1)} / {shot.duration.toFixed(1)} s</span><div className="playback-progress"><i style={{ width: `${Math.min(100, playback.elapsed / shot.duration * 100)}%` }}/></div><button className="continue-button" disabled={!activeDialogue || playback.paused || readyShot !== playback.shotIndex} onClick={advance}>{activeDialogue && textNeedsCompletion(activeDialogue, playback.dialogueElapsed, playback.textCompletedAt) ? 'Afficher tout le texte' : activeDialogue?.advance.mode === 'click' ? 'Cliquer pour continuer' : activeDialogue ? 'Réplique suivante' : playback.finished ? 'Lecture terminée' : 'Plan en cours'} <kbd>ESPACE</kbd></button></> : <><span><Icon name="camera" size={14}/> {cameraLabels[shot.camera.preset]}</span><span className="canvas-hint">Maj + clic : sélection multiple · Alt : sans aimant</span><button className={`icon-button ${snap?'toggled':''}`} aria-label="Alignement magnétique" title="Alignement magnétique · Alt pour désactiver pendant le glissement" aria-pressed={snap} onClick={()=>setSnap(!snap)}><Icon name="magnet" size={16}/></button><button className={`icon-button ${guides ? 'toggled' : ''}`} title="Afficher les repères" aria-label="Afficher les repères" onClick={() => setGuides(!guides)}><Icon name="grid" size={16}/></button></>}</div>
        </div>
        {!playback && <div className={`motion-preview-bar ${motionPreview.active ? 'active' : ''}`}>
          <button className="button text" aria-label={motionPreview.active ? motionPreview.running ? 'Pause des mouvements' : 'Reprendre les mouvements' : 'Aperçu des mouvements'} disabled={locked} onClick={() => { if (!motionPreview.active) setTextPreviewId(null); motionPreview.toggle(); }}><Icon name={motionPreview.running ? 'pause' : 'motion'} size={15}/><span>{motionPreview.active ? textPreviewBubble ? 'Texte animé' : 'Animations' : 'Aperçu des animations'}</span></button>
          {motionPreview.active ? <><input type="range" aria-label="Temps de l’aperçu des mouvements" min={0} max={previewDuration} step={0.01} value={motionPreview.time} onChange={e => motionPreview.seek(+e.target.value)}/><output>{motionPreview.time.toFixed(1)} / {previewDuration.toFixed(1)} s</output><button className="button subtle" onClick={motionPreview.stop}>Retour au placement</button></> : <small>Teste les effets sans audio ni déroulement des dialogues.</small>}
        </div>}
        <section className="storyboard"><div className="storyboard-heading"><div><Icon name="layers" size={15}/><strong>LES PLANS</strong><span>{doc.shots.length} plan{doc.shots.length > 1 ? 's' : ''} · {totalSeconds.toFixed(0)} s minimum</span></div><button className="link-button continue-shot" disabled={!!playback || locked} onClick={()=>fromTemplate('continue')}>Continuer ce plan <Icon name="chevron" size={13}/></button><button className="link-button" data-testid="storyboard-play-current" disabled={!!playback || locked} title={`Lire à partir du plan ${selectedShotNumber}, puis les suivants (Maj+Espace)`} onClick={() => startPlayback(selectedShot.id)}><Icon name="play" size={13}/> Lire depuis ce plan</button></div>
          <div className="shot-strip" onDragOver={e=>{if(e.dataTransfer.types.includes('application/x-lunaria-shot'))e.preventDefault();}} onDrop={e=>{if(e.target!==e.currentTarget)return;const id=e.dataTransfer.getData('application/x-lunaria-shot');if(id)reorderShot(id,doc.shots.at(-1)!.id);}}>{doc.shots.map((s, index) => <button key={s.id} className={`shot-card ${shot.id === s.id ? 'active' : ''}`} draggable={!playback && !locked} disabled={!!playback || locked}
            data-testid={`shot-card-${index}`} onClick={() => selectShot(s.id)}
            onDragStart={e => { e.dataTransfer.setData('application/x-lunaria-shot', s.id); e.dataTransfer.effectAllowed = 'move'; }}
            onDragOver={e => { if (e.dataTransfer.types.includes('application/x-lunaria-shot')) e.preventDefault(); }}
            onDrop={e => { e.preventDefault(); reorderShot(e.dataTransfer.getData('application/x-lunaria-shot'), s.id); }}>
            <div className="shot-thumbnail">{assets.find(a => a.ref === s.background.asset) ? <img src={assets.find(a => a.ref === s.background.asset)!.thumbnail} alt="" loading="lazy"/> : <Icon name="image" size={27}/>}<span className="shot-number">{String(index + 1).padStart(2, '0')}</span><span className="shot-duration">{s.duration} s</span>{!!s.bubbles.length && <span className="shot-bubbles"><Icon name="bubble" size={12}/>{s.bubbles.length}</span>}</div><span className="shot-name" title={s.name}>{s.name}</span>
          </button>)}<button className="add-shot" disabled={!!playback || locked} onClick={addShot}><span><Icon name="plus" size={24}/></span>Ajouter un plan</button></div>
        </section>
      </section>
      <Inspector presentationProject={presentationProject} setCatalog={value=>commit(d=>{d.presentationCatalog=value;d.schemaVersion=4;},'catalog-link','Relier le catalogue partagé')} previewMotion={startMotionPreview} previewText={startTextPreview} doc={doc} shot={shot} selection={playback ? { kind: 'shot' } : selection} multiCount={playback?0:selectionIds.length} objectLocked={!playback && selectionIds.length===1 && workspaceObjects.locked.has(selectionIds[0])} autoPlace={autoPlaceSelected} assets={assets} disabled={!!playback || locked} updateShot={updateShot} updateObject={updateObject} select={setSelection} remove={remove} duplicate={duplicate} layer={layer} moveBubble={moveBubble}>
        {!playback&&<Layers shot={shot} selectedIds={selectionIds} select={setSelection} selectAll={selectAll} locked={workspaceObjects.locked} hidden={workspaceObjects.hidden} toggle={(kind,id)=>workspaceObjects.change(kind,id)} reorder={reorderLayer} align={alignSelection} disabled={locked}/>}
      </Inspector>
    </main>
    <footer className="statusbar"><div><Icon name="leaf" size={12}/><button className={`recovery-status ${recoveryStatus}`} title="Ouvrir les versions locales · Ctrl+S enregistre le fichier source" disabled={locked||!!playback} onClick={openVersions}><Icon name="history" size={12}/>{recoveryStatus==='saving'?'Copie automatique…':recoveryStatus==='saved'?'Récupération à jour':recoveryStatus==='error'?'Récupération en erreur':'Versions locales'}</button><span className="statusbar-divider"/><span title={filePath}>{filePath ? filePath.split(/[\\/]/).pop() : 'cinematic.json · chemins relatifs library://'}</span></div><button className={issueCount ? 'has-warnings' : ''} onClick={() => setModal('issues')}><Icon name={issueCount ? 'warning' : 'check'} size={13}/>{issueCount ? `${issueCount} point(s) à vérifier` : 'Aucune alerte détectée'}</button></footer>
    {!!toast && <div className="toast" role="status"><Icon name="leaf" size={18}/><span>{toast}</span><button className="icon-button" aria-label="Fermer le message" onClick={() => setToast('')}><Icon name="close" size={15}/></button></div>}
    {modal && <div className="modal-backdrop" onPointerDown={e => { if (e.target === e.currentTarget && modal !== 'recovery' && !busy) setModal(null); }}><section className="modal" role="dialog" aria-modal="true" aria-label={modal === 'help' ? 'Prendre en main le studio' : modal === 'issues' ? 'Vérification de la cinématique' : 'Récupérer le travail'}><button hidden={modal === 'recovery'} disabled={busy} className="icon-button modal-close" aria-label="Fermer" onClick={() => setModal(null)}><Icon name="close"/></button>
      {modal === 'help' ? <><span className="overline">LUNARIA CINEMATIC STUDIO</span><h2>Ton histoire, plan par plan.</h2><div className="help-step"><b>01</b><div><h3>Connecte la bibliothèque commune.</h3><p>Sélectionne le dossier qui contient les continents. Garde personnages, objets (07_props) et bulles dans cette même racine. Rien n’est recopié à la sauvegarde.</p></div></div><div className="help-step"><b>02</b><div><h3>Compose un plan.</h3><p>Double-clique sur un décor, puis glisse tes PNG dans la scène. Sélectionne un personnage avant d’ajouter sa bulle : la queue le suivra.</p></div></div><div className="help-step"><b>03</b><div><h3>Écris, puis regarde.</h3><p>Sélectionne une vignette puis « Lire depuis ce plan » en haut à droite (Maj+Espace hors saisie). La lecture démarre au début de ce plan, puis poursuit les suivants. « Tout lire » repart du premier plan. Échap revient au plan sélectionné. Les bulles se lisent dans l’ordre indiqué. Dans « Animation du texte », choisis Écriture, Mot par mot ou Cri, puis « Tester ce texte ». Un premier clic termine l’apparition ; le suivant passe à la réplique suivante. Pour un personnage, ennemi ou objet, règle son entrée, ses Mouvements, sa destination B et sa Disparition. Les boutons de test donnent un aperçu avec curseur de temps.</p></div></div><div className="help-step"><b>04</b><div><h3>Enregistre le JSON.</h3><p>Les plans se réordonnent en les faisant glisser. Ctrl+S enregistre ; Ctrl+Z annule. « Projets récents » (Ctrl+Maj+O) retrouve les fichiers déjà ouverts ou enregistrés, avec leurs bibliothèques. Épingle ceux que tu utilises souvent. Le dossier godot du projet contient le lecteur et son guide d’intégration.</p></div></div><button className="button primary" onClick={() => setModal(null)}>Commencer à créer</button></>
      : modal === 'recovery' ? <><span className="overline">RÉCUPÉRATION LOCALE</span><h2>Reprendre le dernier travail ?</h2><p>Une copie de récupération a été trouvée : <strong>{recovery?.title}</strong>. Les images ne sont pas incluses ; reconnecte la même bibliothèque.</p>{recoveryRoot && <p className="asset-reference">Bibliothèque utilisée : {recoveryRoot}</p>}<div className="modal-actions"><button className="button subtle" disabled={busy} onClick={() => void recover(false)}>Ne pas reprendre</button><button className="button primary" disabled={busy} onClick={() => void recover(true)}>Récupérer la cinématique</button></div></>
      : <><Diagnostics issues={diagnostics} onFocus={focusDiagnostic} onFix={fixDiagnostic} disabled={busy||!!playback}/><div className="modal-actions"><button className="button subtle" disabled={busy||!!playback} onClick={() => { setModal(null); void chooseLibrary(); }}>Reconnecter la bibliothèque</button><button className="button primary" onClick={() => setModal(null)}>Retour à la scène</button></div></>}

    </section></div>}
    {studioModal==='recents'&&<RecentProjectsDialog snapshot={recentProjects} currentPath={filePath} busy={busy} error={recentError} desktop={desktop} onOpen={id=>void openRecent(id)} onLocate={id=>void openRecent(id,true)} onPin={(id,pinned)=>void manageRecent(()=>api.setRecentProjectPinned(id,pinned))} onRemove={id=>void manageRecent(()=>api.removeRecentProject(id))} onReveal={id=>void manageRecent(()=>api.revealRecentProject(id))} onClear={()=>void manageRecent(()=>api.clearRecentProjects())} onBrowse={()=>void open()} onRefresh={()=>void manageRecent(reloadRecents)} onClose={closeRecents}/>}
    {studioModal==='templates'&&<TemplateDialog shot={selectedShot} onCreate={fromTemplate} onClose={()=>setStudioModal(null)} disabled={busy}/>}
    {studioModal==='duplicate'&&<DuplicateDialog onDuplicate={duplicatePlan} onClose={()=>setStudioModal(null)} disabled={busy}/>}
    {studioModal==='versions'&&<VersionsDialog versions={versions} desktop={desktop} busy={busy} onCreate={label=>void createVersion(label)} onRestore={id=>void restoreVersion(id)} onClose={()=>setStudioModal(null)}/>}

  </div><section className="studio-game-host" hidden={studioMode!=='levels'}><GameEditor assets={assets} onProject={setPresentationProject} externalUsages={presentationUsages} ref={gameEditor} active={studioMode==='levels'} onDirty={setGameDirty} onBusy={setGameBusy} onOpenFilm={openCampaignFilm} onBeforePublish={prepareCampaignPublish}/></section></div>;
}
