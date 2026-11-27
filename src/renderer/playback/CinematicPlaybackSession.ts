import type { Asset, Cinematic } from '../../shared/model.js';
import { referencedAssets } from '../../shared/model.js';
import { validationIssues } from '../../shared/schema.js';
import { advanceDialogue, beginPlayback, playbackStartIndex, tickPlayback, type Playback } from '../../shared/playback.js';

export interface PlaybackContext {
  key: string;
  document: Cinematic;
  libraryRoot: string | null;
  assets: readonly Asset[];
  active: boolean;
}
export interface PlaybackSnapshot {
  readonly playback: Readonly<Playback> | null;
  readonly loading: boolean;
  readonly readyShot: number;
  readonly startShotId?: string;
}
interface PlaybackAudio {
  sync(document: Cinematic, state: Playback | null, assets: readonly Asset[], ready: boolean): void;
  stop(): void;
}
export interface PlaybackEffects {
  preload(document: Cinematic, index: number, assets: readonly Asset[]): Promise<void>;
  createAudio(): PlaybackAudio;
  requestFrame(callback: (now: number) => void): number;
  cancelFrame(frame: number): void;
  now(): number;
  hidden(): boolean;
  observeVisibility(callback: () => void): () => void;
  report(message: string): void;
}
export type PlaybackStart = 'started' | 'canceled' | 'invalid';

/** Owns one transient preview. The project, its edits and history stay in ProjectSession. */
export class CinematicPlaybackSession {
  private context?: PlaybackContext;
  private snapshot: PlaybackSnapshot = { playback: null, loading: false, readyShot: -1 };
  private listeners = new Set<() => void>();
  private generation = 0;
  private cancelLoad?: () => void;
  private frame?: number;
  private lastTime = 0;
  private unobserve?: () => void;
  private audio?: PlaybackAudio;

  constructor(private readonly effects: PlaybackEffects) {}

  getSnapshot = (): PlaybackSnapshot => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  isActive = () => this.snapshot.loading || this.snapshot.playback !== null;

  setContext(context: PlaybackContext): void {
    const previous = this.context;
    // The watcher replaces the asset list without changing the active library.
    if (!previous || previous.key !== context.key || previous.document !== context.document
      || previous.libraryRoot !== context.libraryRoot || previous.active !== context.active) this.stop();
    this.context = context;
  }

  private publish(snapshot: PlaybackSnapshot): void {
    this.snapshot = snapshot;
    if (this.context) this.audio?.sync(this.context.document, snapshot.playback,
      this.context.assets, snapshot.readyShot === snapshot.playback?.shotIndex);
    for (const listener of this.listeners) listener();
  }

  private cancelFrame(): void {
    if (this.frame !== undefined) this.effects.cancelFrame(this.frame);
    this.frame = undefined;
  }

  private releaseEffects(): void {
    this.cancelFrame();
    this.unobserve?.();
    this.unobserve = undefined;
    this.audio?.stop();
    this.audio = undefined;
  }

  stop = (): void => {
    this.generation++;
    this.cancelLoad?.();
    this.cancelLoad = undefined;
    this.releaseEffects();
    this.publish({ playback: null, loading: false, readyShot: -1 });
  };

  private current(generation: number): boolean {
    return generation === this.generation && !!this.context?.active;
  }

  /** Canceling resolves immediately even if an image decoder is still pending. */
  private async load(index: number, generation: number): Promise<boolean> {
    const context = this.context!;
    let cancel!: () => void;
    const canceled = new Promise<false>(resolve => { cancel = () => resolve(false); });
    this.cancelLoad = cancel;
    const loaded = Promise.resolve()
      .then(() => this.effects.preload(context.document, index, context.assets))
      .then(() => true);
    try {
      return await Promise.race([loaded, canceled]) && this.current(generation);
    } catch (error) {
      if (this.current(generation)) throw error;
      return false;
    } finally {
      if (this.cancelLoad === cancel) this.cancelLoad = undefined;
    }
  }

  start = async (fromShotId?: string): Promise<PlaybackStart> => {
    this.stop();
    const context = this.context;
    if (!context?.active) return 'canceled';
    const document = context.document;
    const index = playbackStartIndex(document, fromShotId);
    const available = new Set(context.assets.map(asset => asset.ref));
    const required = referencedAssets({ ...document, shots: document.shots.slice(index) });
    if (required.some(ref => !available.has(ref)) || validationIssues(document).length) return 'invalid';
    const generation = this.generation;
    this.publish({ playback: null, loading: true, readyShot: -1, startShotId: document.shots[index]?.id });
    try {
      if (!(await this.load(index, generation))) return 'canceled';
      this.audio = this.effects.createAudio();
      this.unobserve = this.effects.observeVisibility(this.visibilityChanged);
      this.publish({ ...this.snapshot, playback: { ...beginPlayback(index), paused: this.effects.hidden() }, loading: false, readyShot: index });
      this.lastTime = this.effects.now();
      this.scheduleFrame();
      return 'started';
    } catch (error) {
      if (!this.current(generation)) return 'canceled';
      this.stop();
      throw error;
    }
  };

  restart = (): Promise<PlaybackStart> => this.start(this.snapshot.startShotId);

  togglePause = (): void => {
    const state = this.snapshot.playback;
    if (!state || state.finished || this.snapshot.loading) return;
    this.publish({ ...this.snapshot, playback: { ...state, paused: !state.paused } });
    this.lastTime = this.effects.now();
    this.cancelFrame();
    this.scheduleFrame();
  };

  private visibilityChanged = (): void => {
    this.lastTime = this.effects.now();
    const state = this.snapshot.playback;
    if (this.effects.hidden() && state && !state.finished && !state.paused) {
      this.publish({ ...this.snapshot, playback: { ...state, paused: true } });
      this.cancelFrame();
      this.effects.report('Aperçu mis en pause pendant que le studio était masqué.');
    }
  };

  advance = (): void => {
    const state = this.snapshot.playback;
    if (!state || this.snapshot.loading || !this.context) return;
    this.accept(advanceDialogue(this.context.document, state));
  };

  private scheduleFrame(): void {
    const state = this.snapshot.playback;
    if (this.frame === undefined && state && !state.paused && !state.finished && !this.snapshot.loading)
      this.frame = this.effects.requestFrame(this.tick);
  }

  private tick = (now: number): void => {
    this.frame = undefined;
    const state = this.snapshot.playback;
    const delta = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (state && this.context && !this.effects.hidden()) this.accept(tickPlayback(this.context.document, state, delta));
    this.scheduleFrame();
  };

  private accept(state: Playback): void {
    if (state === this.snapshot.playback) return;
    const changedShot = state.shotIndex !== this.snapshot.readyShot;
    this.publish({ ...this.snapshot, playback: state, loading: changedShot && !state.finished,
      readyShot: changedShot ? -1 : this.snapshot.readyShot });
    if (state.finished) {
      this.releaseEffects();
    } else if (changedShot) {
      this.cancelFrame();
      const generation = this.generation;
      void this.load(state.shotIndex, generation).then(ready => {
        if (!ready) return;
        this.publish({ ...this.snapshot, loading: false, readyShot: state.shotIndex });
        this.lastTime = this.effects.now();
        this.scheduleFrame();
      }).catch(error => {
        if (!this.current(generation)) return;
        this.stop();
        this.effects.report(error instanceof Error ? error.message : String(error));
      });
    }
  }
}
