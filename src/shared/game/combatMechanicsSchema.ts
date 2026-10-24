import type { Rule } from "./schema.js";
const n = (minimum: number, maximum: number, integer = false): Rule => ({
  type: "number",
  minimum,
  maximum,
  ...(integer ? { multipleOf: 1 } : {}),
});
const ref: Rule = {
  type: "string",
  minLength: 1,
  maxLength: 100,
  pattern: "^[a-zA-Z0-9_-]+$",
};
const object = (properties: Record<string, Rule>, optional = false): Rule => ({
  type: "object",
  additionalProperties: false,
  required: optional ? [] : Object.keys(properties),
  properties,
});
export const bindingSchema = object({
  minimumDurationRatio: n(0.01, 1),
  tickPower: n(0, 10),
  burstPower: n(0, 10),
  splashPower: n(0, 10),
  radius: n(0, 4),
});
export const mechanicsSchema = object(
  {
    ricochet: object({ chance: n(0, 1), power: n(0, 10) }),
    trap: object({ offset: n(0, 8), armDelay: n(0, 30) }),
    chain: object({ range: n(0.05, 12) }),
    rainBloom: object({ range: n(0, 4), power: n(0, 10) }),
    combo: object({
      counterPower: n(0, 10),
      push: n(0, 4),
      range: n(0.05, 12),
      recoveryEffectId: ref,
      staggerEffectId: ref,
    }),
    guard: object({
      power: n(0, 10),
      maxStacks: n(1, 10, true),
      rows: n(0, 4, true),
      poisonEffectId: ref,
    }),
    contact: { type: "boolean" },
    lockProjectileTarget: { type: "boolean" },
    boostCue: { type: "boolean" },
  },
  true,
);
