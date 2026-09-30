import type { AudioSettings, Cinematic, Shot, SoundCue, SoundEvent } from './model.js';
import { entryEnd } from './motion.js';

export const soundEventLabels: Record<SoundEvent, string> = {
  shot_start: 'Début du plan', bubble_open: 'Ouverture d’une bulle', actor_entry: 'Entrée d’un personnage / objet',
  actor_movement: 'Début du déplacement', actor_motion: 'Début de l’effet animé', actor_exit: 'Disparition', actor_animation: 'Début de l’animation du catalogue'
};
export function soundTargetTime(shot: Shot, cue: SoundCue, opened: Record<string, number>): number | undefined {
  if (cue.event === 'shot_start') return cue.delay;
  if (cue.event === 'bubble_open') return opened[cue.targetId] === undefined ? undefined : opened[cue.targetId] + cue.delay;
  const actor = shot.actors.find(a => a.id === cue.targetId);
  if (!actor) return undefined;
  let time: number | undefined;
  if (cue.event === 'actor_entry' && actor.entry.preset !== 'none') time = actor.entry.delay;
  if (cue.event === 'actor_movement' && actor.movement?.enabled) time = entryEnd(actor) + actor.movement.delay;
  if (cue.event === 'actor_motion' && actor.motion && actor.motion.preset !== 'none') time = entryEnd(actor) + actor.motion.delay;
  if (cue.event === 'actor_exit' && actor.exit && actor.exit.preset !== 'none') time = actor.exit.start;
  if (cue.event === 'actor_animation' && actor.animation) time = actor.entry.delay;
  return time === undefined ? undefined : time + cue.delay;
}
export function musicRange(doc: Cinematic, start: string, end: string): [number, number] {
  return [doc.shots.findIndex(s => s.id === start), doc.shots.findIndex(s => s.id === end)];
}
/** Audio ends after the real last dialogue/click, never after an estimated reading time. */
export function audioExitDuration(doc: Cinematic, index: number, state?: {elapsed:number; bubbleOpenedAt?:Record<string,number>}): number {
  const shot = doc.shots[index];
  if (!shot) return 0;
  const active = (shot.sounds ?? []).filter(cue => {
    if (!state) return true;
    const at = soundTargetTime(shot,cue,state.bubbleOpenedAt ?? {});
    return at !== undefined && at < state.elapsed && (cue.duration === 0 || at + cue.duration > state.elapsed);
  });
  return Math.max(0, ...active.map(s => s.fadeOut),
    ...(doc.musicTracks ?? []).filter(t => t.endShotId === shot.id).map(t => t.fadeOut));
}
export function shotExitDuration(doc: Cinematic, index: number, state?: {elapsed:number; bubbleOpenedAt?:Record<string,number>}): number {
  const exit = doc.shots[index]?.exitTransition;
  return Math.max(exit?.type === 'fade' ? exit.duration : 0, audioExitDuration(doc, index, state));
}
export function audioGain(settings: Pick<AudioSettings, 'volume'|'fadeIn'|'fadeOut'>, age: number, remaining = Infinity): number {
  const up = settings.fadeIn > 0 ? Math.min(1, Math.max(0, age) / settings.fadeIn) : 1;
  const down = settings.fadeOut > 0 ? Math.min(1, Math.max(0, remaining) / settings.fadeOut) : 1;
  return settings.volume * Math.min(up, down);
}
/** Keep links valid after explicit deletion/reordering, inside the same undo command. */
export function repairAudioLinks(doc: Cinematic, previous: Cinematic): void {
  if (doc.musicTracks) doc.musicTracks = doc.musicTracks.filter(track => {
    let [start, end] = musicRange(doc, track.startShotId, track.endShotId);
    if (start < 0 || end < 0) {
      const [a, b] = musicRange(previous, track.startShotId, track.endShotId);
      const survivors = previous.shots.slice(a, b + 1).filter(s => doc.shots.some(n => n.id === s.id));
      if (!survivors.length) return false;
      if (start < 0) track.startShotId = survivors[0].id;
      if (end < 0) track.endShotId = survivors.at(-1)!.id;
      [start, end] = musicRange(doc, track.startShotId, track.endShotId);
    }
    if (start > end) [track.startShotId, track.endShotId] = [track.endShotId, track.startShotId];
    return true;
  });
  for (const shot of doc.shots) if (shot.sounds) shot.sounds = shot.sounds.filter(cue => cue.event === 'shot_start' ||
    (cue.event === 'bubble_open' ? shot.bubbles : shot.actors).some(o => o.id === cue.targetId));
}
