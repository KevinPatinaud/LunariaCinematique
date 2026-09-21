import type { Cinematic } from './model.js';
import {autoDialogueDuration, textNeedsCompletion} from './textAnimation.js';
/** Resolve a selected plan against the current order. Omitted/stale IDs fall back to the first plan. */
export function playbackStartIndex(doc: Pick<Cinematic, 'shots'>, shotId?: string): number {
  return shotId === undefined ? 0 : Math.max(0, doc.shots.findIndex(shot => shot.id === shotId));
}
export interface Playback { textCompletedAt?: number; shotIndex: number; elapsed: number; dialogueIndex: number; dialogueElapsed: number; paused: boolean; finished: boolean }
export const beginPlayback = (shotIndex = 0): Playback => ({ shotIndex, elapsed: 0, dialogueIndex: 0, dialogueElapsed: 0, paused: false, finished: false });
const EPS = 1e-9;
function settle(doc: Cinematic, state: Playback): Playback {
  const shot = doc.shots[state.shotIndex];
  if (!shot) return { ...state, finished: true };
  if (state.elapsed + EPS >= shot.duration && state.dialogueIndex >= shot.bubbles.length) {
    if (state.shotIndex + 1 >= doc.shots.length) return { ...state, finished: true };
    return beginPlayback(state.shotIndex + 1);
  }
  return state;
}
/** Consume real elapsed time, including boundaries. Never discard slow frames or auto-dialogue overflow. */
export function tickPlayback(doc: Cinematic, state: Playback, delta: number): Playback {
  if (state.paused || state.finished || !Number.isFinite(delta) || delta <= 0) return state;
  let next = { ...state }, remaining = delta;
  // Bound events, not elapsed seconds. The document has at most 50,000 dialogues.
  for (let guard = 0; guard < 52000 && remaining > EPS && !next.finished; guard++) {
    const shot = doc.shots[next.shotIndex];
    if (!shot) return { ...next, finished: true };
    const bubble = shot.bubbles[next.dialogueIndex];
    let step = remaining;
    if (bubble && next.elapsed < shot.dialogueStart - EPS) step = Math.min(step, shot.dialogueStart - next.elapsed);
    else if (bubble?.advance.mode === 'auto') step = Math.min(step, Math.max(0, autoDialogueDuration(bubble, next.textCompletedAt) - next.dialogueElapsed));
    if (!bubble) step = Math.min(step, Math.max(0, shot.duration - next.elapsed));
    const activeBefore = next.elapsed + EPS >= shot.dialogueStart;
    next.elapsed += step;
    if (bubble && activeBefore) next.dialogueElapsed += step;
    remaining -= step;
    let event = false;
    if (bubble?.advance.mode === 'auto' && next.elapsed + EPS >= shot.dialogueStart && next.dialogueElapsed + EPS >= autoDialogueDuration(bubble, next.textCompletedAt)) {
      next.dialogueIndex++; next.dialogueElapsed = 0; delete next.textCompletedAt; event = true;
    }
    const settled = settle(doc, next);
    if (settled !== next) event = true;
    next = settled;
    if (step < EPS && !event) break;
  }
  return next;
}
export function advanceDialogue(doc: Cinematic, state: Playback): Playback {
  const shot = doc.shots[state.shotIndex];
  if (state.paused || state.finished || !shot || state.elapsed < shot.dialogueStart || state.dialogueIndex >= shot.bubbles.length) return state;
  const bubble = shot.bubbles[state.dialogueIndex];
  if (textNeedsCompletion(bubble, state.dialogueElapsed, state.textCompletedAt)) return {...state, textCompletedAt: state.dialogueElapsed};
  const next = {...state, dialogueIndex: state.dialogueIndex + 1, dialogueElapsed: 0};
  delete next.textCompletedAt;
  return settle(doc, next);
}
