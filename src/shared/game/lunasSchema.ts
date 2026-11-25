import type { Rule } from './schema.js';

const obj = (properties: Record<string, Rule>): Rule => ({
  type: 'object',
  additionalProperties: false,
  required: Object.keys(properties),
  properties,
});

const intRange = (minimum: number, maximum: number): Rule => ({
  type: 'number',
  minimum,
  maximum,
  multipleOf: 1,
});

const unitInterval: Rule = {
  type: 'number',
  minimum: 0,
  maximum: 1,
};

export const LUNA_ECONOMY_SCHEMA: Rule = obj({
  enemyDrop: obj({
    enabled: { type: 'boolean' },
    chance: unitInterval,
    smallAmount: intRange(1, 10000),
    largeAmount: intRange(1, 10000),
    largeChance: unitInterval,
  }),
});

export const LEVEL_LUNA_REWARDS_SCHEMA: Rule = obj({
  firstClear: intRange(0, 100000),
  mastery: obj({
    noPlantLost: intRange(0, 100000),
    noRain: intRange(0, 100000),
    biodiversity: intRange(0, 100000),
  }),
});
