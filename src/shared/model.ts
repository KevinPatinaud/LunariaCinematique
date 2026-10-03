import type { ActorAnimation, CatalogLink } from './presentation/types.js';
import type { RecentProjectsSnapshot } from './recentProjects.js';
import { actorAnchor } from './motion.js';
/** Coordinates are relative to a fixed logical 1600 × 900 stage. All times are seconds. */
export type AssetRef = `library://${string}`;
export type CameraPreset = 'fixed' | 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'pan_up' | 'pan_down';
export type EntryPreset = 'none' | 'fade' | 'left' | 'right' | 'bottom' | 'top' | 'pop' | 'zoom' | 'drop' | 'spiral' | 'rise';
export type ExitPreset = 'none' | 'fade' | 'left' | 'right' | 'top' | 'bottom' | 'shrink' | 'spiral' | 'rise' | 'fall';
export interface ExitAnimation { preset: ExitPreset; start: number; duration: number }
export type BubbleStyle = 'parchment' | 'plain' | 'simple' | 'ornate';
export interface Box { x: number; y: number; width: number; height: number }
export type MotionPreset = 'none' | 'float' | 'sway' | 'pulse' | 'spin' | 'shake' | 'bounce' | 'nod' | 'recoil' | 'heartbeat' | 'flutter' | 'orbit' | 'figure8' | 'zigzag' | 'tumble' | 'surprise' | 'jelly';
export type Pivot = 'center' | 'top' | 'bottom';
/** A cinematic role, never a request to spawn a gameplay AI. */
export type ActorRole = 'character' | 'enemy' | 'prop';
/** Independent from travel: one gentle effect can be combined with one A→B path. */
export interface MotionEffect {
  preset: MotionPreset; intensity: number; period: number; delay: number; loop: boolean; reverse: boolean;
}
export interface ObjectMovement {
  enabled: boolean; dx: number; dy: number; duration: number; delay: number;
  easing: 'smooth' | 'linear'; repeat: 'once' | 'pingpong';
}
export interface Actor extends Box {
  animation?:ActorAnimation;
  /** Optional in legacy projects. Missing role means character, missing transforms mean identity. */
  role?: ActorRole; rotation?: number; pivot?: Pivot;
  motion?: MotionEffect; movement?: ObjectMovement; exit?: ExitAnimation;
  id: string; name: string; asset: AssetRef; flipX: boolean; opacity: number;
  entry: { preset: EntryPreset; duration: number; delay: number };
}
export type TextReveal = 'instant' | 'typewriter' | 'words' | 'fade';
export type TextEffect = 'none' | 'shout' | 'wave' | 'shake' | 'bounce';
/** Times relative to the beginning of this dialogue, NOT the shot. A loop never blocks input. */
export interface TextAnimation {
  reveal: TextReveal; effect: TextEffect; speed: number; delay: number;
  duration: number; intensity: number; loop: boolean;
}
export type BubbleEntryPreset = 'none' | 'pop' | 'left' | 'right' | 'burst' | 'shake' | 'bounce';
export interface BubbleEntry { preset: BubbleEntryPreset; duration: number }
export interface Bubble extends Box {
  textAnimation?: TextAnimation;
  /** Optional: older films use the same gentle pop as newly created bubbles. */
  bubbleEntry?: BubbleEntry;
  id: string; kind: 'speech' | 'narration'; style: BubbleStyle; frameAsset: AssetRef | null;
  speakerId: string | null; text: string; fontSize: number; autoHeight: boolean;
  tail: { mode: 'auto' | 'manual' | 'none'; x: number; y: number };
  advance: { mode: 'click' | 'auto'; seconds: number };
  /** Computed at save-time. The Godot player reuses these line breaks. */
  lines?: string[];
}
export interface AudioSettings {
  asset: AssetRef; volume: number; loop: boolean; fadeIn: number; fadeOut: number;
}
export interface MusicTrack extends AudioSettings {
  id: string; startShotId: string; endShotId: string;
}
export type SoundEvent = 'shot_start' | 'bubble_open' | 'actor_entry' | 'actor_movement' | 'actor_motion' | 'actor_exit' | 'actor_animation';
export interface SoundCue extends AudioSettings {
  id: string; event: SoundEvent; targetId: string; delay: number;
  /** Zero: play to the end of the file (or this shot). Otherwise limit in seconds. */
  duration: number;
}
export interface Shot {
  id: string; name: string; duration: number;
  /** Missing in existing films means automatic passage after duration and dialogues. */
  endAdvance?: 'auto' | 'click';
  background: { asset: AssetRef | null; fit: 'cover' | 'contain' };
  camera: { preset: CameraPreset; intensity: number };
  transition: { type: 'cut' | 'fade'; duration: number };
  /** Optional so existing projects keep an immediate cut at the end. */
  exitTransition?: { type: 'cut' | 'fade'; duration: number };
  actors: Actor[]; bubbles: Bubble[]; dialogueStart: number;
  audio: { asset: AssetRef; volume: number; loop: boolean } | null;
  sounds?: SoundCue[];
}
export interface Cinematic {
  schemaVersion: 1 | 2 | 3 | 4; presentationCatalog?:CatalogLink; id: string; title: string;
  /** Optional Studio category used to browse films in a project. */
  category?: string;
  stage: { width: 1600; height: 900 };
  shots: Shot[];
  musicTracks?: MusicTrack[];
}
export interface Asset {
  ref: AssetRef; path: string; name: string; folder: string;
  kind: 'environment' | 'character' | 'enemy' | 'prop' | 'ui' | 'audio' | 'other';
  bytes: number; modified: number; url: string; thumbnail: string;
}
export interface LibrarySnapshot { rootName: string; rootPath: string; assets: Asset[]; warnings: string[] }
export interface Bootstrap { recentProjects?: RecentProjectsSnapshot; documentToken: string; recoveryLibraryRoot?: string; library: LibrarySnapshot | null; recovery: Cinematic | null; desktop: boolean }
export interface SaveResult { warnings?: string[]; path: string; missing: AssetRef[]; cinematic: Cinematic }
export interface OpenResult { library?: LibrarySnapshot | null; warnings?: string[]; documentToken: string; path: string; cinematic: Cinematic }
export interface StudioAPI {
  bootstrap(): Promise<Bootstrap>;
  chooseLibrary(): Promise<LibrarySnapshot | null>;
  exampleLibrary(): Promise<LibrarySnapshot>;
  refreshLibrary(): Promise<LibrarySnapshot | null>;
  importImages(): Promise<Asset[] | null>;
  openCinematic(): Promise<OpenResult | null>;
  listRecentProjects(): Promise<RecentProjectsSnapshot>;
  openRecentProject(id: string): Promise<OpenResult>;
  locateRecentProject(id: string): Promise<OpenResult | null>;
  setRecentProjectPinned(id: string, pinned: boolean): Promise<void>;
  removeRecentProject(id: string): Promise<void>;
  clearRecentProjects(): Promise<void>;
  revealRecentProject(id: string): Promise<void>;
  saveCinematic(cinematic: Cinematic, saveAs: boolean, documentToken: string): Promise<SaveResult | null>;
  beginJpgExport(title: string, count: number): Promise<{ id: string; path: string } | null>;
  writeJpgFrame(id: string, index: number, dataUrl: string): Promise<void>;
  imageDataForJpg(ref: AssetRef): Promise<string>;
  finishJpgExport(id: string): Promise<string>;
  cancelJpgExport(id: string): Promise<void>;
  autosave(cinematic: Cinematic, documentToken: string): Promise<void>;
  listVersions(documentToken: string): Promise<VersionSummary[]>;
  createVersion(cinematic: Cinematic, documentToken: string, label: string): Promise<VersionSummary>;
  loadVersion(documentToken: string, id: string): Promise<LocalVersion>;
  resetDocument(): Promise<string>;
  discardRecovery(documentToken: string): Promise<void>;
  confirmUnsaved(reason: string): Promise<'save' | 'discard' | 'cancel'>;
  confirmDelete(name: string): Promise<boolean>;
  closeWindow(): Promise<void>;
  onCloseRequested(callback: () => void): () => void;
  setDirty(dirty: boolean): void;
  onLibraryChanged(callback: (snapshot: LibrarySnapshot) => void): () => void;
}
export const STAGE = { width: 1600, height: 900 } as const;
export const uid = () => globalThis.crypto.randomUUID();
export const copy = <T>(value: T): T => structuredClone(value);
export function newShot(background: AssetRef | null = null): Shot {
  return { id: uid(), name: 'Nouveau plan', duration: 6, endAdvance: 'auto', background: { asset: background, fit: 'cover' },
    camera: { preset: 'fixed', intensity: 0.35 }, transition: { type: 'fade', duration: 0.6 }, exitTransition: { type: 'cut', duration: 0 },
    actors: [], bubbles: [], dialogueStart: 0.8, audio: null };
}
export function hasV2Features(cinematic: Cinematic): boolean {
  return cinematic.shots.some(s => s.actors.some(a => ['role', 'rotation', 'pivot', 'motion', 'movement'].some(k => Object.hasOwn(a, k))));
}
export function hasV3Features(cinematic: Cinematic): boolean {
  return cinematic.shots.some(s => s.bubbles.some(b => Object.hasOwn(b, 'textAnimation') || Object.hasOwn(b, 'bubbleEntry')) || s.actors.some(a =>
    Object.hasOwn(a, 'exit') || ['top', 'pop', 'zoom', 'drop', 'spiral', 'rise'].includes(a.entry.preset) ||
    ['nod', 'recoil', 'heartbeat', 'flutter', 'orbit', 'figure8', 'zigzag', 'tumble', 'surprise', 'jelly'].includes(a.motion?.preset ?? 'none')));
}
/** Upgrade only when needed; never silently downgrade a file written with newer semantics. */
export function upgradeCinematicFormat(cinematic: Cinematic): void {
  if(cinematic.presentationCatalog || cinematic.shots.some(s=>s.actors.some(a=>a.animation))) cinematic.schemaVersion=4;
  else if (hasV3Features(cinematic) && cinematic.schemaVersion < 3) cinematic.schemaVersion = 3;
  else if (hasV2Features(cinematic) && cinematic.schemaVersion < 2) cinematic.schemaVersion = 2;
}
export function newCinematic(): Cinematic {
  return { schemaVersion: 1, id: 'CIN_NOUVELLE_SCENE', title: 'Nouvelle cinématique', stage: { ...STAGE }, shots: [newShot()] };
}
/** Explicit insertion intent wins over the library category; never rewrite asset paths. */
export function newActor(asset: Asset, ratio: number, x = 0.35, y = 0.42,
  role: ActorRole = asset.kind === 'enemy' ? 'enemy' : 'character'): Actor {
  if (!Number.isFinite(ratio) || ratio <= 0) throw new Error('Dimensions de l’image invalides.');
  let height = 0.43, width = height * STAGE.height / STAGE.width * ratio;
  const lower = Math.max(0.03 / width, 0.03 / height), upper = Math.min(2 / width, 2 / height);
  if (lower > upper) throw new Error('Image trop allongée : utilise une image individuelle plutôt qu’une planche de sprites.');
  const factor = Math.max(lower, Math.min(upper, 0.65 / width, 1));
  height = Math.max(0.03, Math.min(2, height * factor));
  width = Math.max(0.03, Math.min(2, width * factor));
  return { ...(role === 'character' ? {} : { role }), id: uid(), name: asset.name.slice(0, 180), asset: asset.ref, x: Math.max(-1, Math.min(2, x)), y: Math.max(-1, Math.min(2, y)), width, height,
    flipX: false, opacity: 1, entry: { preset: 'none', duration: 0.8, delay: 0 } };
}
export function newBubble(speakerId: string | null = null, kind: Bubble['kind'] = 'speech'): Bubble {
  return { id: uid(), kind, style: 'parchment', frameAsset: null, speakerId,
    text: kind === 'speech' ? 'Écris ta réplique ici.' : 'Écris la narration ici.',
    x: 0.30, y: 0.12, width: 0.38, height: 0.16, fontSize: 28, autoHeight: true,
    tail: { mode: kind === 'narration' ? 'none' : speakerId ? 'auto' : 'manual', x: 0.55, y: 0.52 },
    advance: { mode: 'click', seconds: 3.5 } };
}
export function duplicateShot(source: Shot): Shot {
  const shot = copy(source); const ids = new Map<string, string>();
  shot.id = uid(); shot.name = (shot.name + ' — copie').slice(0, 180);
  shot.actors.forEach(actor => { const id = uid(); ids.set(actor.id, id); actor.id = id; });
  shot.bubbles.forEach(bubble => { const old = bubble.id; bubble.id = uid(); ids.set(old, bubble.id); if (bubble.speakerId) bubble.speakerId = ids.get(bubble.speakerId) ?? null; });
  shot.sounds?.forEach(cue => { cue.id = uid(); cue.targetId = ids.get(cue.targetId) ?? ''; });
  return shot;
}
/** Copy a whole film without sharing editable objects or internal identifiers. */
export function duplicateCinematic(source: Cinematic, existingTitles: readonly string[] = []): Cinematic {
  const cinematic = copy(source);
  cinematic.id = `CIN_${uid().replaceAll('-', '').slice(0, 12)}`;
  const used = new Set(existingTitles.map(title => title.normalize('NFC').toLocaleLowerCase()));
  const base = source.title.trim() || 'Cinématique';
  let number = 1;
  let suffix = ' — copie';
  let title = base.slice(0, 200 - suffix.length) + suffix;
  while (used.has(title.normalize('NFC').toLocaleLowerCase())) {
    suffix = ` — copie ${++number}`;
    title = base.slice(0, 200 - suffix.length) + suffix;
  }
  cinematic.title = title;
  cinematic.shots = source.shots.map(shot => {
    const duplicate = duplicateShot(shot);
    duplicate.name = shot.name;
    return duplicate;
  });
  cinematic.musicTracks?.forEach(track => {
    track.id = uid();
    track.startShotId = cinematic.shots[source.shots.findIndex(s => s.id === track.startShotId)]?.id ?? '';
    track.endShotId = cinematic.shots[source.shots.findIndex(s => s.id === track.endShotId)]?.id ?? '';
  });
  return cinematic;
}
export function removeActor(shot: Shot, id: string): void {
  const removed = shot.actors.find(actor => actor.id === id);
  shot.actors = shot.actors.filter(actor => actor.id !== id);
  for (const bubble of shot.bubbles) if (bubble.speakerId === id) {
    bubble.speakerId = null;
    if (bubble.tail.mode === 'auto') {
      const actor = removed;
      if (actor) { const head = actorAnchor(actor,0,false); bubble.tail.x = Math.max(-1, Math.min(2, head.x / STAGE.width)); bubble.tail.y = Math.max(-1, Math.min(2, head.y / STAGE.height)); }
      bubble.tail.mode = 'manual';
    }
  }
}
export function referencedAssets(cinematic: Cinematic): AssetRef[] {
  const refs = new Set<AssetRef>();
  cinematic.musicTracks?.forEach(track => refs.add(track.asset));
  for (const shot of cinematic.shots) {
    if (shot.background.asset) refs.add(shot.background.asset);
    if (shot.audio) refs.add(shot.audio.asset);
    shot.sounds?.forEach(cue => refs.add(cue.asset));
    shot.actors.forEach(actor => refs.add(actor.asset));
    shot.bubbles.forEach(bubble => { if (bubble.frameAsset) refs.add(bubble.frameAsset); });
  }
  return [...refs];
}

export interface VersionSummary { id: string; createdAt: string; label: string; title: string; shots: number; libraryRoot: string }
export interface LocalVersion extends VersionSummary { cinematic: Cinematic }
