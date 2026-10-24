import type { Rule } from "./schema.js";
const bool: Rule = { type: "boolean" },
  number = (minimum: number, maximum: number): Rule => ({
    type: "number",
    minimum,
    maximum,
  });
const object = (
  properties: Record<string, Rule>,
  required = Object.keys(properties),
): Rule => ({
  type: "object",
  additionalProperties: false,
  properties,
  required,
});
export const ENEMY_RULES_SCHEMA: Rule = object(
  {
    spawn: object({
      mode: { type: "string", enum: ["arrival", "placement"] },
      x: number(0.5, 8.8),
    }),
    blocksEnemies: bool,
    blocksPlanting: bool,
    contact: { type: "string", enum: ["normal", "solid"] },
    boss: bool,
    pushing: object({
      stops: {type:'number', minimum:1, maximum:5, multipleOf:1},
      seedReward: {type:'number',minimum:0,maximum:10000,multipleOf:1},
      pressure: number(20,10000),
      escortCount: {type:"number",minimum:1,maximum:8,multipleOf:1},
      escortInterval: number(2,60),
      warning: number(2,20),
      retreatSpeed: number(0.5,2),
      escortEnemyId: {type:'string', minLength:1, maxLength:100, pattern:'^[a-zA-Z0-9_-]+$'},
    },['stops','pressure','escortCount','escortInterval','warning','retreatSpeed','escortEnemyId']),
    reinforcements: object({
      enemyId: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        pattern: "^[a-zA-Z0-9_-]+$",
      },
      interval: number(0.1, 3600),
    }),
  },
  [
    "spawn",
    "blocksEnemies",
    "blocksPlanting",
    "contact",
    "boss",
  ],
);
