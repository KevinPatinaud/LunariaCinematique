import type { AnimationDefinition, Cue } from "./types.js";
import { crossedMarkers, duration } from "./runtime.js";
export interface PreviewEvent {
  at: number;
  cue: Cue;
}
/** Pure crossing calculation; manual seek never calls this. Clip time includes cadence scaling. */
export function previewSignals(
  animation: AnimationDefinition,
  events: PreviewEvent[],
  from: number,
  to: number,
): PreviewEvent[] {
  const signals = crossedMarkers(animation, from, to)
    .filter((x) => x.marker.type !== "release")
    .map(({ marker, at }) => ({
      at,
      cue: {
        soundId: marker.type === "sound" ? marker.ref : "",
        vfxId: marker.type === "vfx" ? marker.ref : "",
        attach: marker.attach,
      },
    }));
  const d = duration(animation),
    first = animation.loop ? Math.max(0, Math.floor(Math.max(0, from) / d)) : 0,
    last = animation.loop ? Math.floor(to / d) : 0;
  if (to < from) return [];
  for (let cycle = first; cycle <= Math.min(last, first + 64); cycle++)
    for (const event of events) {
      const at = cycle * d + event.at;
      if (at > from && at <= to) signals.push({ at, cue: event.cue });
    }
  return signals.sort((a, b) => a.at - b.at);
}
