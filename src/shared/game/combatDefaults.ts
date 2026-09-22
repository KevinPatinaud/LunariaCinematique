import type { GameProject } from './types.js';
import type { CombatCatalog } from './combat.js';
/** Import presets for authored V1.7 projects, not a runtime fallback. No saved game is converted. */
export const DEFAULT_COMBAT:CombatCatalog={
  "abilities": [
    {
      "id": "ab_basic_shot",
      "name": "Tir simple",
      "description": "Modèle partagé entre les espèces qui utilisent exactement la même attaque.",
      "delivery": "projectile",
      "projectileId": "proj_seed",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack"
      ]
    },
    {
      "id": "ab_root_shot",
      "name": "Tir enracinant",
      "description": "Modèle partagé entre les espèces qui utilisent exactement la même attaque.",
      "delivery": "projectile",
      "projectileId": "proj_seed",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack",
        "fx_root"
      ]
    },
    {
      "id": "ab_personal_regeneration",
      "name": "Régénération personnelle",
      "description": "Modèle partagé entre les espèces qui utilisent exactement la même attaque.",
      "delivery": "instant",
      "projectileId": "",
      "target": "self",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "fixed",
      "cooldown": 1,
      "initialDelay": 0,
      "effects": [
        "fx_regen"
      ]
    },
    {
      "id": "ab_fern",
      "name": "Frondes humides",
      "description": "",
      "delivery": "projectile",
      "projectileId": "proj_seed",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_armor_break",
        "fx_attack",
        "fx_slow"
      ]
    },
    {
      "id": "ab_dandelion",
      "name": "Aigrettes éclaireuses",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack"
      ]
    },
    {
      "id": "ab_nettle",
      "name": "Garde urticante",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "opponent",
      "selection": "all",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack",
        "fx_poison_light"
      ]
    },
    {
      "id": "ab_piercing_shot",
      "name": "Tir traversant",
      "description": "Modèle partagé entre les espèces qui utilisent exactement la même attaque.",
      "delivery": "projectile",
      "projectileId": "proj_piercing",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack"
      ]
    },
    {
      "id": "ab_ally_protection",
      "name": "Protection alliée",
      "description": "Modèle partagé entre les espèces qui utilisent exactement la même attaque.",
      "delivery": "instant",
      "projectileId": "",
      "target": "ally",
      "selection": "all",
      "priority": "nearest",
      "rangeSource": "fixed",
      "range": 1.6,
      "rowRadius": 1,
      "cooldownSource": "fixed",
      "cooldown": 1,
      "initialDelay": 0,
      "effects": [
        "fx_protect"
      ]
    },
    {
      "id": "ab_aloe",
      "name": "Gel réparateur",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "ally",
      "selection": "all",
      "priority": "wounded",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 1,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_heal",
        "fx_cleanse"
      ]
    },
    {
      "id": "ab_papyrus",
      "name": "Réseau de rigoles",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "ally",
      "selection": "all",
      "priority": "wounded",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 2,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_repair",
        "fx_cleanse"
      ]
    },
    {
      "id": "ab_hibiscus",
      "name": "Appel du jardin",
      "description": "",
      "delivery": "projectile",
      "projectileId": "proj_seed",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 1,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack"
      ]
    },
    {
      "id": "ab_hibiscus_aura",
      "name": "Aura de Hibiscus",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "ally",
      "selection": "all",
      "priority": "nearest",
      "rangeSource": "fixed",
      "range": 1.5,
      "rowRadius": 1,
      "cooldownSource": "fixed",
      "cooldown": 1,
      "initialDelay": 0,
      "effects": [
        "fx_boost"
      ]
    },
    {
      "id": "ab_lavender",
      "name": "Brume parfumée",
      "description": "",
      "delivery": "projectile",
      "projectileId": "proj_splash",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 1,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack"
      ]
    },
    {
      "id": "ab_lotus",
      "name": "Calme du bassin",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "ally",
      "selection": "all",
      "priority": "wounded",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 2,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_heal",
        "fx_cleanse"
      ]
    },
    {
      "id": "ab_ginger",
      "name": "Racine explosive",
      "description": "",
      "delivery": "projectile",
      "projectileId": "proj_splash",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack"
      ]
    },
    {
      "id": "ab_chrysanthemum",
      "name": "Signal des terrasses",
      "description": "",
      "delivery": "projectile",
      "projectileId": "proj_seed",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_armor_break",
        "fx_attack",
        "fx_weaken"
      ]
    },
    {
      "id": "ab_coconut",
      "name": "Noix de vigie",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack",
        "fx_root"
      ]
    },
    {
      "id": "ab_pandanus",
      "name": "Attaches tressées",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "ally",
      "selection": "all",
      "priority": "wounded",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 1,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_repair",
        "fx_cleanse"
      ]
    },
    {
      "id": "ab_eucalyptus",
      "name": "Souffle argenté",
      "description": "",
      "delivery": "projectile",
      "projectileId": "proj_splash",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 1,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack",
        "fx_weaken"
      ]
    },
    {
      "id": "ab_banksia",
      "name": "Réserve de demain",
      "description": "",
      "delivery": "projectile",
      "projectileId": "proj_seed",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_reward",
        "fx_attack"
      ]
    },
    {
      "id": "ab_mushroom",
      "name": "Réseau vivant",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "opponent",
      "selection": "all",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 1,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack",
        "fx_poison"
      ]
    },
    {
      "id": "ab_sequoia_protection",
      "name": "Protection de Séquoia",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "ally",
      "selection": "all",
      "priority": "nearest",
      "rangeSource": "fixed",
      "range": 1.6,
      "rowRadius": 1,
      "cooldownSource": "fixed",
      "cooldown": 1,
      "initialDelay": 0,
      "effects": [
        "fx_protect_strong"
      ]
    },
    {
      "id": "ab_cactus",
      "name": "Mauvaise étreinte",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "opponent",
      "selection": "all",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack"
      ]
    },
    {
      "id": "ab_agave",
      "name": "Pointe de brèche",
      "description": "",
      "delivery": "projectile",
      "projectileId": "proj_piercing",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_armor_break",
        "fx_attack"
      ]
    },
    {
      "id": "ab_dahlia",
      "name": "Accord des jardins",
      "description": "",
      "delivery": "projectile",
      "projectileId": "proj_seed",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 2,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack"
      ]
    },
    {
      "id": "ab_dahlia_aura",
      "name": "Aura de Dahlia",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "ally",
      "selection": "all",
      "priority": "nearest",
      "rangeSource": "fixed",
      "range": 2.2,
      "rowRadius": 2,
      "cooldownSource": "fixed",
      "cooldown": 1,
      "initialDelay": 0,
      "effects": [
        "fx_boost"
      ]
    },
    {
      "id": "ab_passionflower",
      "name": "Passage secret",
      "description": "",
      "delivery": "projectile",
      "projectileId": "proj_seed",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "species",
      "cooldown": 1,
      "initialDelay": 0.35,
      "effects": [
        "fx_attack",
        "fx_root",
        "fx_weaken"
      ]
    },
    {
      "id": "ab_enemy_contact",
      "name": "Attaque de contact",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "fixed",
      "cooldown": 1,
      "initialDelay": 0,
      "effects": [
        "fx_attack"
      ]
    },
    {
      "id": "ab_jammer_pulse",
      "name": "Impulsion du brouilleur",
      "description": "",
      "delivery": "instant",
      "projectileId": "",
      "target": "opponent",
      "selection": "one",
      "priority": "nearest",
      "rangeSource": "species",
      "range": 5,
      "rowRadius": 0,
      "cooldownSource": "fixed",
      "cooldown": 6,
      "initialDelay": 3,
      "effects": [
        "fx_stun"
      ]
    }
  ],
  "effects": [
    {
      "id": "fx_attack",
      "name": "Dégâts de l’espèce",
      "description": "",
      "kind": "damage",
      "valueSource": "attack",
      "amount": 1,
      "damageType": "inherit",
      "duration": 3,
      "tickInterval": 1
    },
    {
      "id": "fx_slow",
      "name": "Ralentissement de 45 %",
      "description": "",
      "kind": "slow",
      "valueSource": "fixed",
      "amount": 0.45,
      "damageType": "inherit",
      "duration": 3,
      "tickInterval": 1
    },
    {
      "id": "fx_root",
      "name": "Immobilisation",
      "description": "",
      "kind": "root",
      "valueSource": "fixed",
      "amount": 0,
      "damageType": "inherit",
      "duration": 1,
      "tickInterval": 1
    },
    {
      "id": "fx_weaken",
      "name": "Attaque réduite de 35 %",
      "description": "",
      "kind": "weaken",
      "valueSource": "fixed",
      "amount": 0.35,
      "damageType": "inherit",
      "duration": 4,
      "tickInterval": 1
    },
    {
      "id": "fx_armor_break",
      "name": "Armure neutralisée",
      "description": "",
      "kind": "armor_break",
      "valueSource": "fixed",
      "amount": 0,
      "damageType": "inherit",
      "duration": 4,
      "tickInterval": 1
    },
    {
      "id": "fx_poison",
      "name": "Poison (7 PV par seconde × puissance)",
      "description": "",
      "kind": "poison",
      "valueSource": "strength",
      "amount": 7,
      "damageType": "toxic",
      "duration": 3.5,
      "tickInterval": 1
    },
    {
      "id": "fx_poison_light",
      "name": "Poison (4 PV par seconde × puissance)",
      "description": "",
      "kind": "poison",
      "valueSource": "strength",
      "amount": 4,
      "damageType": "toxic",
      "duration": 3.5,
      "tickInterval": 1
    },
    {
      "id": "fx_heal",
      "name": "Soin (22 PV × puissance)",
      "description": "",
      "kind": "heal",
      "valueSource": "strength",
      "amount": 22,
      "damageType": "inherit",
      "duration": 3,
      "tickInterval": 1
    },
    {
      "id": "fx_repair",
      "name": "Réparation (12 PV × puissance)",
      "description": "",
      "kind": "heal",
      "valueSource": "strength",
      "amount": 12,
      "damageType": "inherit",
      "duration": 3,
      "tickInterval": 1
    },
    {
      "id": "fx_cleanse",
      "name": "Purification des altérations",
      "description": "",
      "kind": "cleanse",
      "valueSource": "fixed",
      "amount": 0,
      "damageType": "inherit",
      "duration": 3,
      "tickInterval": 1
    },
    {
      "id": "fx_regen",
      "name": "Régénération (4 PV par seconde × puissance)",
      "description": "",
      "kind": "regeneration",
      "valueSource": "strength",
      "amount": 4,
      "damageType": "inherit",
      "duration": 1.5,
      "tickInterval": 1
    },
    {
      "id": "fx_boost",
      "name": "Soutien +18 %",
      "description": "",
      "kind": "damage_boost",
      "valueSource": "fixed",
      "amount": 0.18,
      "damageType": "inherit",
      "duration": 1.5,
      "tickInterval": 1
    },
    {
      "id": "fx_protect",
      "name": "Protection de 15 %",
      "description": "",
      "kind": "protection",
      "valueSource": "fixed",
      "amount": 0.15,
      "damageType": "inherit",
      "duration": 1.5,
      "tickInterval": 1
    },
    {
      "id": "fx_protect_strong",
      "name": "Protection de 25 %",
      "description": "",
      "kind": "protection",
      "valueSource": "fixed",
      "amount": 0.25,
      "damageType": "inherit",
      "duration": 1.5,
      "tickInterval": 1
    },
    {
      "id": "fx_reward",
      "name": "Recyclage : +12 graines",
      "description": "",
      "kind": "reward_mark",
      "valueSource": "fixed",
      "amount": 12,
      "damageType": "inherit",
      "duration": 8,
      "tickInterval": 1
    },
    {
      "id": "fx_stun",
      "name": "Étourdissement de 2 s",
      "description": "",
      "kind": "stun",
      "valueSource": "fixed",
      "amount": 0,
      "damageType": "inherit",
      "duration": 2,
      "tickInterval": 1
    }
  ],
  "projectiles": [
    {
      "id": "proj_seed",
      "name": "Projectile simple",
      "description": "",
      "speed": 4.8,
      "lifetime": 3,
      "maxHits": 1,
      "hitRadius": 0.18,
      "splashRadius": 0,
      "rowRadius": 0,
      "color": "#d4b88a",
      "size": 0.09
    },
    {
      "id": "proj_piercing",
      "name": "Projectile traversant",
      "description": "",
      "speed": 4.8,
      "lifetime": 3,
      "maxHits": 3,
      "hitRadius": 0.18,
      "splashRadius": 0,
      "rowRadius": 0,
      "color": "#a0cd70",
      "size": 0.09
    },
    {
      "id": "proj_splash",
      "name": "Projectile de zone",
      "description": "",
      "speed": 4.8,
      "lifetime": 3,
      "maxHits": 1,
      "hitRadius": 0.18,
      "splashRadius": 0.95,
      "rowRadius": 1,
      "color": "#ebcc74",
      "size": 0.13
    }
  ]
};
const assignments:Record<string,string[]>={
  "radish": [
    "ab_basic_shot"
  ],
  "bramble": [
    "ab_root_shot"
  ],
  "hazel": [
    "ab_basic_shot",
    "ab_personal_regeneration"
  ],
  "fern": [
    "ab_fern"
  ],
  "dandelion": [
    "ab_dandelion"
  ],
  "ivy": [
    "ab_root_shot"
  ],
  "nettle": [
    "ab_nettle"
  ],
  "acacia": [
    "ab_piercing_shot"
  ],
  "baobab": [
    "ab_basic_shot",
    "ab_ally_protection",
    "ab_personal_regeneration"
  ],
  "aloe": [
    "ab_aloe"
  ],
  "papyrus": [
    "ab_papyrus"
  ],
  "hibiscus": [
    "ab_hibiscus",
    "ab_hibiscus_aura"
  ],
  "lavender": [
    "ab_lavender"
  ],
  "bamboo": [
    "ab_piercing_shot"
  ],
  "lotus": [
    "ab_lotus"
  ],
  "ginger": [
    "ab_ginger"
  ],
  "chrysanthemum": [
    "ab_chrysanthemum"
  ],
  "mangrove": [
    "ab_basic_shot",
    "ab_ally_protection",
    "ab_personal_regeneration"
  ],
  "coconut": [
    "ab_coconut"
  ],
  "pandanus": [
    "ab_pandanus",
    "ab_ally_protection"
  ],
  "eucalyptus": [
    "ab_eucalyptus"
  ],
  "banksia": [
    "ab_banksia"
  ],
  "mushroom": [
    "ab_mushroom"
  ],
  "sequoia": [
    "ab_basic_shot",
    "ab_sequoia_protection",
    "ab_personal_regeneration"
  ],
  "cactus": [
    "ab_cactus"
  ],
  "agave": [
    "ab_agave"
  ],
  "dahlia": [
    "ab_dahlia",
    "ab_dahlia_aura"
  ],
  "passionflower": [
    "ab_passionflower"
  ],
  "litterer": [
    "ab_enemy_contact"
  ],
  "runner": [
    "ab_enemy_contact"
  ],
  "sprayer": [
    "ab_enemy_contact"
  ],
  "truck": [
    "ab_enemy_contact"
  ],
  "jammer": [
    "ab_enemy_contact",
    "ab_jammer_pulse"
  ],
  "tanker": [
    "ab_enemy_contact"
  ],
  "collector": [
    "ab_enemy_contact"
  ],
  "pump": [
    "ab_enemy_contact"
  ],
  "factory": [
    "ab_enemy_contact"
  ],
  "devourer": [
    "ab_enemy_contact"
  ],
  "corrupted_bramble": [
    "ab_enemy_contact"
  ],
  "furnace": [
    "ab_enemy_contact"
  ],
  "thorn_knot": [
    "ab_enemy_contact"
  ]
};
export function ensureCombat(p:GameProject):void {
 if(!p.combat){p.combat=structuredClone(DEFAULT_COMBAT);for(const x of [...p.balance.plants,...p.balance.enemies])x.ability_ids=[...(assignments[x.id]??[])];}
 if(p.schemaVersion<2)p.schemaVersion=2;
}
