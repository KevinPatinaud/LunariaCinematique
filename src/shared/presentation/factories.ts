import { newId } from "../game/types.js";
import { IDENTITY, type AnimationDefinition } from "./types.js";

/** Neutral authoring defaults. Never depend on an artistic catalogue's order or pixels. */
export function newAnimation(slot = "attack"): AnimationDefinition {
  const loop = slot === "idle" || slot === "move";
  return {
    id: newId("anim"),
    name: "Nouvelle animation",
    kind: "procedural",
    frames: [],
    duration: loop ? 1.2 : 0.4,
    loop,
    anchor: { x: 0.5, y: 1 },
    transform: { ...IDENTITY },
    motion: {
      preset:
        slot === "idle"
          ? "breath"
          : slot === "move"
            ? "bounce"
            : slot === "death"
              ? "fade_out"
              : slot === "spawn"
                ? "fade_in"
                : "none",
      amplitude: 1,
      period: 1.2,
    },
    attachments: [
      { id: "center", x: 0.5, y: 0.5 },
      { id: "feet", x: 0.5, y: 1 },
      { id: "head", x: 0.5, y: 0 },
      { id: "launch", x: 0.8, y: 0.5 },
    ],
    markers:
      slot === "attack"
        ? [
            {
              id: newId("marker"),
              type: "release",
              at: 0.2,
              ref: "",
              attach: "launch",
            },
          ]
        : [],
  };
}
