import type { Asset, AudioSettings, Cinematic } from '../../shared/model.js';
import type { Playback } from '../../shared/playback.js';
import { audioGain, musicRange, soundTargetTime } from '../../shared/cinematicAudio.js';

type Voice = { audio: HTMLAudioElement; settings: AudioSettings; duration: number; origin: number; kind: 'music'|'sound'; shotId: string; endShotId: string; failed: boolean; started: boolean; cleanup: () => void };
/** One instance for a whole preview: music is deliberately not owned by a Scene component. */
export class CinematicAudioPlayer {
  private voices = new Map<string, Voice>();
  private ended = new Set<string>();
  private shotId = '';
  private paused = false;
  constructor(private report: (message: string) => void, private create: (url: string) => HTMLAudioElement = url => new Audio(url)) {}
  private add(id: string, settings: AudioSettings, assets: readonly Asset[], kind: Voice['kind'], origin: number, shotId: string, endShotId: string, duration = 0) {
    if (this.voices.has(id) || this.ended.has(id)) return;
    const url = assets.find(a => a.ref === settings.asset)?.url;
    if (!url) { this.ended.add(id); this.report('Son introuvable : ' + settings.asset); return; }
    const audio = this.create(url);
    audio.loop = settings.loop; audio.preload = 'auto'; audio.volume = 0;
    const voice: Voice = {audio, settings, duration, origin, kind, shotId, endShotId, failed: false, started: false, cleanup: () => undefined};
    const error = () => { if (!voice.failed) this.report('Son illisible : ' + settings.asset); voice.failed = true; };
    audio.addEventListener('error', error);
    voice.cleanup = () => audio.removeEventListener('error', error);
    this.voices.set(id, voice);
  }
  private remove(id: string) {
    const voice = this.voices.get(id);
    if (voice) { voice.cleanup(); voice.audio.pause(); voice.audio.removeAttribute('src'); voice.audio.load(); this.voices.delete(id); }
    this.ended.add(id);
  }
  sync(doc: Cinematic, state: Playback | null, assets: readonly Asset[], ready = true): void {
    if (!state || state.finished) { this.stop(); return; }
    const shot = doc.shots[state.shotIndex]; if (!shot) { this.stop(); return; }
    this.paused = state.paused;
    if (!ready) {
      for (const [id,v] of this.voices) {
        const track = doc.musicTracks?.find(t => t.id === id);
        const [start,end] = track ? musicRange(doc,track.startShotId,track.endShotId) : [-1,-1];
        if (v.kind === 'sound' ? v.shotId !== shot.id : state.shotIndex < start || state.shotIndex > end) this.remove(id);
        else if (state.paused) v.audio.pause();
      }
      return;
    }
    if (this.shotId !== shot.id) {
      for (const [id, v] of this.voices) if (v.kind === 'sound') this.remove(id);
      // Cue IDs are unique to a shot. Keep music completion markers across boundaries.
      this.shotId = shot.id;
    }
    const clock = state.clock ?? state.elapsed;
    const activeMusic = new Set<string>();
    for (const track of doc.musicTracks ?? []) {
      const [start, end] = musicRange(doc, track.startShotId, track.endShotId);
      if (start < 0 || state.shotIndex < start || state.shotIndex > end) continue;
      activeMusic.add(track.id);
      this.add(track.id, track, assets, 'music', clock - state.elapsed, shot.id, track.endShotId);
    }
    for (const [id,v] of this.voices) if (v.kind === 'music' && !activeMusic.has(id)) this.remove(id);
    if (shot.audio) this.add('legacy:' + shot.id, {...shot.audio, fadeIn:0, fadeOut:0}, assets, 'sound', 0, shot.id, shot.id);
    const opened = { ...state.bubbleOpenedAt };
    const bubble = shot.bubbles[state.dialogueIndex];
    if (bubble && state.elapsed >= shot.dialogueStart && opened[bubble.id] === undefined) opened[bubble.id] = state.elapsed - state.dialogueElapsed;
    for (const cue of shot.sounds ?? []) {
      const at = soundTargetTime(shot, cue, opened);
      // No new events during a final fade; delayed cues can still outlive their source bubble.
      if (at !== undefined && state.elapsed >= at && (state.exitElapsed === undefined || at < state.elapsed - state.exitElapsed))
        this.add(cue.id, cue, assets, 'sound', at, shot.id, shot.id, cue.duration);
    }
    for (const [id, voice] of this.voices) {
      const audio = voice.audio, age = Math.max(0, (voice.kind === 'music' ? clock : state.elapsed) - voice.origin);
      let remaining = voice.duration > 0 ? voice.duration - age : Infinity;
      if (!voice.settings.loop && Number.isFinite(audio.duration)) remaining = Math.min(remaining, audio.duration - age);
      if (state.exitElapsed !== undefined && voice.endShotId === shot.id) remaining = Math.min(remaining, voice.settings.fadeOut - state.exitElapsed);
      if (voice.failed || audio.ended || remaining <= 0) { this.remove(id); continue; }
      audio.volume = audioGain(voice.settings, age, remaining);
      if (state.paused) { audio.pause(); continue; }
      if (!voice.started && audio.readyState >= 1) {
        const position = voice.settings.loop && audio.duration > 0 ? age % audio.duration : age;
        try { audio.currentTime = position; } catch { /* Metadata can arrive between frames. */ }
        voice.started = true;
      }
      if (audio.paused) {
        // Mark as pending synchronously; HTMLMediaElement.paused may stay true until canplay.
        if (!audio.dataset.playPending) {
          audio.dataset.playPending = '1';
          void audio.play().catch((error: unknown) => {
            // A deliberate pause can abort an outstanding play request before canplay.
            if (error instanceof Error && error.name === 'AbortError') return;
            if (this.voices.get(id) === voice && !this.paused) { voice.failed = true; this.report('Impossible de lire : ' + voice.settings.asset); }
          }).finally(() => { delete audio.dataset.playPending; });
        }
      }
    }
  }
  stop(): void { for (const id of this.voices.keys()) this.remove(id); this.ended.clear(); this.shotId = ''; }
}
