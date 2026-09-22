export type Rule = {type?:string;const?:unknown;enum?:unknown[];minimum?:number;maximum?:number;multipleOf?:number;minLength?:number;maxLength?:number;pattern?:string;minItems?:number;maxItems?:number;items?:Rule;properties?:Record<string,Rule>;required?:string[];additionalProperties?:boolean;[key:string]:unknown};
export const GAME_SCHEMA:Rule = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://lunaria.local/game-project.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "kind",
    "id",
    "title",
    "balance",
    "levels"
  ],
  "properties": {
    "schemaVersion": {
      "const": 1
    },
    "kind": {
      "const": "lunaria-game-project"
    },
    "id": {
      "type": "string",
      "maxLength": 100,
      "minLength": 1,
      "pattern": "^[a-zA-Z0-9_-]+$"
    },
    "title": {
      "type": "string",
      "maxLength": 160,
      "minLength": 1
    },
    "balance": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "plants",
        "enemies"
      ],
      "properties": {
        "plants": {
          "type": "array",
          "minItems": 28,
          "maxItems": 28,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "id",
              "name",
              "role",
              "description",
              "ability",
              "personality",
              "cost",
              "cooldown",
              "max_hp",
              "rate",
              "damage",
              "range",
              "behavior",
              "effect_radius",
              "effect_strength",
              "color",
              "chapter",
              "unlock",
              "damage_type",
              "armor",
              "resistances"
            ],
            "properties": {
              "id": {
                "type": "string",
                "enum": [
                  "radish",
                  "bramble",
                  "hazel",
                  "fern",
                  "dandelion",
                  "ivy",
                  "nettle",
                  "acacia",
                  "baobab",
                  "aloe",
                  "papyrus",
                  "hibiscus",
                  "lavender",
                  "bamboo",
                  "lotus",
                  "ginger",
                  "chrysanthemum",
                  "mangrove",
                  "coconut",
                  "pandanus",
                  "eucalyptus",
                  "banksia",
                  "mushroom",
                  "sequoia",
                  "cactus",
                  "agave",
                  "dahlia",
                  "passionflower"
                ]
              },
              "name": {
                "type": "string",
                "maxLength": 80,
                "minLength": 1
              },
              "role": {
                "type": "string",
                "maxLength": 160,
                "minLength": 0
              },
              "description": {
                "type": "string",
                "maxLength": 1000,
                "minLength": 0
              },
              "ability": {
                "type": "string",
                "maxLength": 160,
                "minLength": 0
              },
              "personality": {
                "type": "string",
                "maxLength": 1000,
                "minLength": 0
              },
              "cost": {
                "type": "number",
                "minimum": 0,
                "maximum": 10000,
                "multipleOf": 1
              },
              "cooldown": {
                "type": "number",
                "minimum": 0,
                "maximum": 120
              },
              "max_hp": {
                "type": "number",
                "minimum": 1,
                "maximum": 6000,
                "multipleOf": 1
              },
              "rate": {
                "type": "number",
                "minimum": 0.1,
                "maximum": 15
              },
              "damage": {
                "type": "number",
                "minimum": 0,
                "maximum": 600,
                "multipleOf": 1
              },
              "range": {
                "type": "number",
                "minimum": 0,
                "maximum": 12
              },
              "behavior": {
                "type": "string",
                "enum": [
                  "projectile",
                  "guard",
                  "pierce",
                  "splash",
                  "sniper",
                  "spores",
                  "thorns",
                  "healer",
                  "repair",
                  "buffer",
                  "water",
                  "slow",
                  "snare",
                  "weaken",
                  "recycler"
                ]
              },
              "effect_radius": {
                "type": "number",
                "minimum": 0,
                "maximum": 4
              },
              "effect_strength": {
                "type": "number",
                "minimum": 0,
                "maximum": 5
              },
              "color": {
                "type": "string",
                "maxLength": 7,
                "minLength": 7,
                "pattern": "^#[0-9a-fA-F]{6}$"
              },
              "chapter": {
                "type": "number",
                "minimum": 0,
                "maximum": 4,
                "multipleOf": 1
              },
              "unlock": {
                "type": "number",
                "minimum": 0,
                "maximum": 199,
                "multipleOf": 1
              },
              "damage_type": {
                "type": "string",
                "enum": [
                  "physical",
                  "piercing",
                  "toxic",
                  "pure"
                ]
              },
              "armor": {
                "type": "number",
                "minimum": 0,
                "maximum": 0.95
              },
              "resistances": {
                "type": "object",
                "additionalProperties": false,
                "required": [
                  "physical",
                  "piercing",
                  "toxic"
                ],
                "properties": {
                  "physical": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 0.95
                  },
                  "piercing": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 0.95
                  },
                  "toxic": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 0.95
                  }
                }
              }
            }
          }
        },
        "enemies": {
          "type": "array",
          "minItems": 13,
          "maxItems": 13,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "id",
              "name",
              "hp",
              "speed",
              "attack",
              "leak",
              "reward",
              "reach",
              "damage_type",
              "armor",
              "resistances",
              "special_damage"
            ],
            "properties": {
              "id": {
                "type": "string",
                "enum": [
                  "litterer",
                  "runner",
                  "sprayer",
                  "truck",
                  "jammer",
                  "tanker",
                  "collector",
                  "pump",
                  "factory",
                  "devourer",
                  "corrupted_bramble",
                  "furnace",
                  "thorn_knot"
                ]
              },
              "name": {
                "type": "string",
                "maxLength": 80,
                "minLength": 1
              },
              "hp": {
                "type": "number",
                "minimum": 1,
                "maximum": 20000,
                "multipleOf": 1
              },
              "speed": {
                "type": "number",
                "minimum": 0,
                "maximum": 2
              },
              "attack": {
                "type": "number",
                "minimum": 0,
                "maximum": 200,
                "multipleOf": 1
              },
              "leak": {
                "type": "number",
                "minimum": 0,
                "maximum": 100,
                "multipleOf": 1
              },
              "reward": {
                "type": "number",
                "minimum": 0,
                "maximum": 400,
                "multipleOf": 1
              },
              "reach": {
                "type": "number",
                "minimum": 0,
                "maximum": 9
              },
              "damage_type": {
                "type": "string",
                "enum": [
                  "physical",
                  "piercing",
                  "toxic",
                  "pure"
                ]
              },
              "armor": {
                "type": "number",
                "minimum": 0,
                "maximum": 0.95
              },
              "resistances": {
                "type": "object",
                "additionalProperties": false,
                "required": [
                  "physical",
                  "piercing",
                  "toxic"
                ],
                "properties": {
                  "physical": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 0.95
                  },
                  "piercing": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 0.95
                  },
                  "toxic": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 0.95
                  }
                }
              },
              "special_damage": {
                "type": "number",
                "minimum": 0,
                "maximum": 600,
                "multipleOf": 1
              }
            }
          }
        }
      }
    },
    "levels": {
      "type": "array",
      "minItems": 1,
      "maxItems": 200,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "title",
          "subtitle",
          "act",
          "location",
          "startingEnergy",
          "allowedPlants",
          "objective",
          "objectiveText",
          "tip",
          "waves",
          "briefing",
          "outro",
          "midDialogue",
          "midWave",
          "restoration"
        ],
        "properties": {
          "id": {
            "type": "string",
            "maxLength": 100,
            "minLength": 1,
            "pattern": "^[a-zA-Z0-9_-]+$"
          },
          "title": {
            "type": "string",
            "maxLength": 160,
            "minLength": 1
          },
          "subtitle": {
            "type": "string",
            "maxLength": 300,
            "minLength": 0
          },
          "act": {
            "type": "number",
            "minimum": 0,
            "maximum": 4,
            "multipleOf": 1
          },
          "location": {
            "type": "string",
            "maxLength": 200,
            "minLength": 0
          },
          "startingEnergy": {
            "type": "number",
            "minimum": 0,
            "maximum": 100000,
            "multipleOf": 1
          },
          "allowedPlants": {
            "type": "array",
            "minItems": 1,
            "maxItems": 28,
            "items": {
              "type": "string",
              "maxLength": 100,
              "minLength": 1
            }
          },
          "objective": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "type",
              "target"
            ],
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "defend",
                  "escort",
                  "repair",
                  "water",
                  "smog",
                  "tide",
                  "rescue",
                  "containment"
                ]
              },
              "target": {
                "type": "number",
                "minimum": 0,
                "maximum": 3600,
                "multipleOf": 1
              }
            }
          },
          "objectiveText": {
            "type": "string",
            "maxLength": 1000,
            "minLength": 0
          },
          "tip": {
            "type": "string",
            "maxLength": 1000,
            "minLength": 0
          },
          "waves": {
            "type": "array",
            "minItems": 1,
            "maxItems": 50,
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "id",
                "groups"
              ],
              "properties": {
                "id": {
                  "type": "string",
                  "maxLength": 100,
                  "minLength": 1,
                  "pattern": "^[a-zA-Z0-9_-]+$"
                },
                "groups": {
                  "type": "array",
                  "minItems": 1,
                  "maxItems": 256,
                  "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "required": [
                      "id",
                      "enemyId",
                      "count",
                      "lane",
                      "start",
                      "interval"
                    ],
                    "properties": {
                      "id": {
                        "type": "string",
                        "maxLength": 100,
                        "minLength": 1,
                        "pattern": "^[a-zA-Z0-9_-]+$"
                      },
                      "enemyId": {
                        "type": "string",
                        "maxLength": 100,
                        "minLength": 1
                      },
                      "count": {
                        "type": "number",
                        "minimum": 1,
                        "maximum": 256,
                        "multipleOf": 1
                      },
                      "lane": {
                        "type": "number",
                        "minimum": -1,
                        "maximum": 4,
                        "multipleOf": 1
                      },
                      "start": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 600
                      },
                      "interval": {
                        "type": "number",
                        "minimum": 0.1,
                        "maximum": 120
                      }
                    }
                  }
                }
              }
            }
          },
          "briefing": {
            "type": "array",
            "minItems": 0,
            "maxItems": 100,
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "speaker",
                "text"
              ],
              "properties": {
                "speaker": {
                  "type": "string",
                  "maxLength": 100,
                  "minLength": 1
                },
                "text": {
                  "type": "string",
                  "maxLength": 8000,
                  "minLength": 1
                }
              }
            }
          },
          "outro": {
            "type": "array",
            "minItems": 0,
            "maxItems": 100,
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "speaker",
                "text"
              ],
              "properties": {
                "speaker": {
                  "type": "string",
                  "maxLength": 100,
                  "minLength": 1
                },
                "text": {
                  "type": "string",
                  "maxLength": 8000,
                  "minLength": 1
                }
              }
            }
          },
          "midDialogue": {
            "type": "array",
            "minItems": 0,
            "maxItems": 100,
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "speaker",
                "text"
              ],
              "properties": {
                "speaker": {
                  "type": "string",
                  "maxLength": 100,
                  "minLength": 1
                },
                "text": {
                  "type": "string",
                  "maxLength": 8000,
                  "minLength": 1
                }
              }
            }
          },
          "midWave": {
            "type": "number",
            "minimum": 0,
            "maximum": 50,
            "multipleOf": 1
          },
          "restoration": {
            "type": "string",
            "maxLength": 1000,
            "minLength": 0
          }
        }
      }
    },
    "campaign": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "steps",
        "cinematics"
      ],
      "properties": {
        "steps": {
          "type": "array",
          "minItems": 1,
          "maxItems": 1000,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "id",
              "kind"
            ],
            "properties": {
              "id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120,
                "pattern": "^[a-zA-Z0-9_-]+$"
              },
              "kind": {
                "enum": [
                  "level",
                  "cinematic"
                ]
              },
              "levelId": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120,
                "pattern": "^[a-zA-Z0-9_-]+$"
              },
              "cinematicId": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120,
                "pattern": "^[a-zA-Z0-9_-]+$"
              },
              "skippable": {
                "type": "boolean"
              }
            }
          }
        },
        "cinematics": {
          "type": "array",
          "minItems": 0,
          "maxItems": 500,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "id",
              "title",
              "file",
              "documentId"
            ],
            "properties": {
              "id": {
                "type": "string",
                "minLength": 1,
                "maxLength": 120,
                "pattern": "^[a-zA-Z0-9_-]+$"
              },
              "title": {
                "type": "string",
                "maxLength": 200,
                "minLength": 1
              },
              "file": {
                "type": "string",
                "maxLength": 1024,
                "minLength": 1
              },
              "documentId": {
                "type": "string",
                "maxLength": 160,
                "minLength": 1
              }
            }
          }
        }
      }
    }
  }
};

// V1.8: global reusable combat catalog. No scripts, URLs or executable expressions.
const obj=(properties:Record<string,Rule>):Rule=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
const num=(minimum:number,maximum:number,integer=false):Rule=>({type:'number',minimum,maximum,...(integer?{multipleOf:1}:{})});
const str=(maxLength=200,minLength=0):Rule=>({type:'string',minLength,maxLength});
const idRule:Rule={...str(100,1),pattern:'^[a-zA-Z0-9_-]+$'};
const enumeration=(...values:string[]):Rule=>({type:'string',enum:values});
const ids:Rule={type:'array',minItems:0,maxItems:8,items:idRule};
const base={id:idRule,name:str(120,1),description:str(1000)};
const effect=obj({...base,kind:enumeration('damage','heal','poison','regeneration','slow','root','stun','weaken','armor_break','damage_boost','protection','cleanse','reward_mark'),valueSource:enumeration('fixed','attack','strength'),amount:num(0,10000),damageType:enumeration('inherit','physical','piercing','toxic','pure'),duration:num(.05,120),tickInterval:num(.05,30)});
const projectile=obj({...base,speed:num(.1,20),lifetime:num(.1,30),maxHits:num(1,16,true),hitRadius:num(.01,.5),splashRadius:num(0,4),rowRadius:num(0,4,true),color:{...str(7,7),pattern:'^#[0-9a-fA-F]{6}$'},size:num(.02,.3)});
const ability=obj({...base,delivery:enumeration('instant','projectile'),projectileId:{...str(100),pattern:'^[a-zA-Z0-9_-]*$'},target:enumeration('opponent','ally','self'),selection:enumeration('one','all'),priority:enumeration('nearest','strongest','wounded'),rangeSource:enumeration('species','fixed'),range:num(0,12),rowRadius:num(0,4,true),cooldownSource:enumeration('species','fixed'),cooldown:num(.1,120),initialDelay:num(0,120),effects:{...ids,minItems:1}});
const array=(items:Rule,maxItems:number):Rule=>({type:'array',minItems:1,maxItems,items});
GAME_SCHEMA.properties!.schemaVersion={type:'number',enum:[1,2],multipleOf:1};
GAME_SCHEMA.properties!.combat=obj({abilities:array(ability,256),effects:array(effect,256),projectiles:array(projectile,128)});
for(const role of ['plants','enemies'])GAME_SCHEMA.properties!.balance.properties![role].items!.properties!.ability_ids=ids;

// V1.9: bounded behaviors, phases, variables and level events.
import { extendLogicSchema } from './logicSchema.js';
extendLogicSchema(GAME_SCHEMA);

import { extendPresentationSchema } from '../presentation/schema.js';
extendPresentationSchema(GAME_SCHEMA);
