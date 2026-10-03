import {installPlasticBag} from './plasticBag.js';
import { ensurePresentation } from '../presentation/defaults.js';
import type { GameProject } from './types.js';
import { defaultRewards } from './types.js';
import { installCigarette } from './cigarette.js';
/** Editable starter content, not a runtime fallback. */
export const GAME_SEED:GameProject={
  rewards: defaultRewards(),
  "schemaVersion": 3,
  "kind": "lunaria-game-project",
  "id": "lunaria_campaign",
  "title": "Lunaria — campagne principale",
  "balance": {
    "plants": [
      {
        "id": "radish",
        "name": "Radis",
        "role": "Attaque régulière",
        "description": "Sa graine rebondit sur un second pollueur proche à 65 % de sa force.",
        "ability": "Graine ricochet",
        "personality": "Obstiné et curieux. Il garde la dernière graine du tilleul.",
        "cost": 100,
        "cooldown": 3,
        "max_hp": 165,
        "rate": 1.4,
        "damage": 38,
        "range": 9,
        "behavior": "projectile",
        "effect_radius": 0,
        "effect_strength": 1,
        "color": "#f28b9c",
        "chapter": 0,
        "unlock": 0,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_radish_ricochet"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "rose",
        "name": "Rose",
        "role": "Combattante au corps à corps",
        "description": "Rose se bat avec ses poings : elle esquive au contact, riposte en trois frappes et repousse son assaillant.",
        "ability": "Esquive et riposte",
        "personality": "Protectrice, méfiante. Elle apprend à partager le poids des autres.",
        "cost": 90,
        "cooldown": 5,
        "max_hp": 400,
        "rate": 1.8,
        "damage": 25,
        "range": 0.8,
        "behavior": "guard",
        "effect_radius": 0.45,
        "effect_strength": 1,
        "color": "#8fb16b",
        "chapter": 0,
        "unlock": 0,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_rose_combo"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "hazel",
        "name": "Noisetier",
        "role": "Rempart régénérant",
        "description": "Un rempart abordable qui reprend des forces au fil du combat.",
        "ability": "Écorce obstinée",
        "personality": "Bourru, prudent. Ses noisettes sont un inventaire très personnel.",
        "cost": 80,
        "cooldown": 5.5,
        "max_hp": 680,
        "rate": 2,
        "damage": 0,
        "range": 1,
        "behavior": "guard",
        "effect_radius": 0,
        "effect_strength": 1,
        "color": "#c39b65",
        "chapter": 0,
        "unlock": 1,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_personal_regeneration"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "fern",
        "name": "Fougère",
        "role": "Ralentissement",
        "description": "Ralentit les pollueurs et fragilise leur protection.",
        "ability": "Frondes humides",
        "personality": "Discrète et attentive. L'eau lui indique des chemins insoupçonnés.",
        "cost": 125,
        "cooldown": 4.5,
        "max_hp": 180,
        "rate": 2,
        "damage": 24,
        "range": 8,
        "behavior": "slow",
        "effect_radius": 0.35,
        "effect_strength": 1,
        "color": "#73d5b5",
        "chapter": 0,
        "unlock": 2,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_fern"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "dandelion",
        "name": "Pissenlit",
        "role": "Tir lointain",
        "description": "Ses aigrettes frappent au loin ; sous la pluie, chaque impact éclot et touche les voisins.",
        "ability": "Éclosion sous la pluie",
        "personality": "Rêveur et bavard. Il connaît toujours le début du chemin.",
        "cost": 140,
        "cooldown": 4.5,
        "max_hp": 130,
        "rate": 2.1,
        "damage": 61,
        "range": 10,
        "behavior": "sniper",
        "effect_radius": 0,
        "effect_strength": 1,
        "color": "#f5d268",
        "chapter": 0,
        "unlock": 3,
        "damage_type": "piercing",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_dandelion"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "ivy",
        "name": "Lierre",
        "role": "Immobilisation",
        "description": "Pose une graine dans l'allée ; ses racines jaillissent au passage d'un pollueur.",
        "ability": "Piège germinant",
        "personality": "Acrobate et prétentieux. Il construit enfin des passages pour tous.",
        "cost": 120,
        "cooldown": 5,
        "max_hp": 250,
        "rate": 2.8,
        "damage": 18,
        "range": 4,
        "behavior": "snare",
        "effect_radius": 0.5,
        "effect_strength": 1.5,
        "color": "#5daa71",
        "chapter": 0,
        "unlock": 4,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_ivy_trap"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "scindapsus",
        "name": "Scindapsus",
        "role": "Attaque régulière (provisoire)",
        "description": "Personnage à configurer dans le Studio ; ses illustrations des stades 1 et 2 sont dans la bibliothèque graphique.",
        "ability": "Tir simple",
        "personality": "À définir.",
        "cost": 100,
        "cooldown": 5,
        "max_hp": 200,
        "rate": 2,
        "damage": 25,
        "range": 6,
        "behavior": "projectile",
        "effect_radius": 0,
        "effect_strength": 1,
        "color": "#80b85a",
        "chapter": 0,
        "unlock": 0,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_basic_shot"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "nettle",
        "name": "Ortie",
        "role": "Riposte de contact",
        "description": "Fouette les pollueurs proches et riposte lorsqu'ils blessent une plante sous sa garde, même dans une ligne voisine.",
        "ability": "Retour de piqûre",
        "personality": "Franche et susceptible. Elle ne laisse aucune jeune pousse derrière.",
        "cost": 100,
        "cooldown": 4,
        "max_hp": 350,
        "rate": 1.2,
        "damage": 32,
        "range": 1.6,
        "behavior": "thorns",
        "effect_radius": 0.5,
        "effect_strength": 1,
        "color": "#9bb954",
        "chapter": 0,
        "unlock": 5,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_nettle"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "acacia",
        "name": "Acacia",
        "role": "Épines perforantes",
        "description": "Ses longues épines sont utiles contre les pollueurs protégés.",
        "ability": "Haie des pépinières",
        "personality": "Exigeante, drôle et attentionnée. Les conseils attendront après les travaux.",
        "cost": 145,
        "cooldown": 5,
        "max_hp": 310,
        "rate": 2,
        "damage": 46,
        "range": 5,
        "behavior": "pierce",
        "effect_radius": 0,
        "effect_strength": 0.75,
        "color": "#a6ba66",
        "chapter": 1,
        "unlock": 8,
        "damage_type": "piercing",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_piercing_shot"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "baobab",
        "name": "Baobab",
        "role": "Grand protecteur",
        "description": "Un rempart coûteux, très solide, pour tenir une allée exposée.",
        "ability": "Tronc refuge",
        "personality": "Jeune arbre chaleureux. Il allonge ses histoires jusqu'à l'arrivée des secours.",
        "cost": 180,
        "cooldown": 9,
        "max_hp": 1250,
        "rate": 2.6,
        "damage": 13,
        "range": 1.1,
        "behavior": "guard",
        "effect_radius": 1,
        "effect_strength": 1.3,
        "color": "#b58b60",
        "chapter": 1,
        "unlock": 10,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_basic_shot",
          "ab_ally_protection",
          "ab_personal_regeneration"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "aloe",
        "name": "Aloès",
        "role": "Soins rapprochés",
        "description": "Restaure régulièrement la vitalité des compagnons autour d'elle.",
        "ability": "Gel réparateur",
        "personality": "Douce dans ses gestes, intraitable lorsqu'on cache une blessure.",
        "cost": 130,
        "cooldown": 6,
        "max_hp": 220,
        "rate": 3,
        "damage": 0,
        "range": 1.5,
        "behavior": "healer",
        "effect_radius": 1.5,
        "effect_strength": 1.25,
        "color": "#9dc992",
        "chapter": 1,
        "unlock": 11,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_aloe"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "papyrus",
        "name": "Papyrus",
        "role": "Réparation",
        "description": "Aide les plantes proches et soutient la protection du terrain.",
        "ability": "Réseau de rigoles",
        "personality": "Méthodique et inventif. Chaque trou mérite une correction sur ses plans.",
        "cost": 130,
        "cooldown": 6.5,
        "max_hp": 235,
        "rate": 4,
        "damage": 0,
        "range": 2,
        "behavior": "repair",
        "effect_radius": 2,
        "effect_strength": 1,
        "color": "#b5cc75",
        "chapter": 1,
        "unlock": 9,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_papyrus"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "hibiscus",
        "name": "Hibiscus",
        "role": "Soutien collectif",
        "description": "Renforce les attaques des plantes voisines.",
        "ability": "Appel du jardin",
        "personality": "Sociable et fier de ses fleurs. Il connaît le prénom de chaque voisin.",
        "cost": 145,
        "cooldown": 6,
        "max_hp": 190,
        "rate": 2.5,
        "damage": 14,
        "range": 5,
        "behavior": "buffer",
        "effect_radius": 1.5,
        "effect_strength": 1,
        "color": "#ee837c",
        "chapter": 1,
        "unlock": 12,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_hibiscus",
          "ab_hibiscus_aura"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "lavender",
        "name": "Lavande",
        "role": "Nuage de zone",
        "description": "Son nuage floral touche les pollueurs proches dans plusieurs allées.",
        "ability": "Brume parfumée",
        "personality": "Théâtrale et bavarde. Elle tient à ce qu'on distingue son parfum des fumées.",
        "cost": 175,
        "cooldown": 6,
        "max_hp": 170,
        "rate": 2.1,
        "damage": 33,
        "range": 6,
        "behavior": "splash",
        "effect_radius": 1.1,
        "effect_strength": 1,
        "color": "#b49bf2",
        "chapter": 2,
        "unlock": 16,
        "damage_type": "piercing",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_lavender"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "bamboo",
        "name": "Bambou",
        "role": "Ligne perforante",
        "description": "Traverse les protections avec des attaques rapides dans son allée.",
        "ability": "Lance souple",
        "personality": "Discipliné et fier. Il apprend à ménager un chemin de repli.",
        "cost": 155,
        "cooldown": 5,
        "max_hp": 240,
        "rate": 1.5,
        "damage": 36,
        "range": 7,
        "behavior": "pierce",
        "effect_radius": 0,
        "effect_strength": 0.65,
        "color": "#a9cc70",
        "chapter": 2,
        "unlock": 17,
        "damage_type": "piercing",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_piercing_shot"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "lotus",
        "name": "Lotus",
        "role": "Soins étendus",
        "description": "Prend soin des compagnons dans un large voisinage, plus lentement qu'Aloès.",
        "ability": "Calme du bassin",
        "personality": "Paisible et tenace. Elle ne quitte pas un bassin tant qu'on y attend de l'aide.",
        "cost": 160,
        "cooldown": 6,
        "max_hp": 190,
        "rate": 4,
        "damage": 0,
        "range": 2.25,
        "behavior": "healer",
        "effect_radius": 2.25,
        "effect_strength": 1,
        "color": "#ecc0d6",
        "chapter": 2,
        "unlock": 18,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_lotus"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "ginger",
        "name": "Gingembre",
        "role": "Soutien stimulant",
        "description": "Lance des éclats de gingembre à une autre plante alliée choisie au hasard. Elle inflige trois fois plus de dégâts et attaque deux fois plus vite pendant 2 secondes.",
        "ability": "Éclats stimulants",
        "personality": "Impulsif et enthousiaste. Il apprend à attendre le signal commun.",
        "cost": 150,
        "cooldown": 4.5,
        "max_hp": 215,
        "rate": 4,
        "damage": 0,
        "range": 12,
        "behavior": "buffer",
        "effect_radius": 0,
        "effect_strength": 1,
        "color": "#dfa463",
        "chapter": 2,
        "unlock": 19,
        "damage_type": "piercing",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_ginger"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "chrysanthemum",
        "name": "Chrysanthème",
        "role": "Affaiblissement",
        "description": "Désigne les cibles dont les défenses doivent céder sous les tirs alliés.",
        "ability": "Signal des terrasses",
        "personality": "Minutieuse, inquiète, dotée d'un humour sec et d'excellents plans.",
        "cost": 135,
        "cooldown": 5,
        "max_hp": 175,
        "rate": 2,
        "damage": 19,
        "range": 8,
        "behavior": "weaken",
        "effect_radius": 0.5,
        "effect_strength": 1.25,
        "color": "#eedc89",
        "chapter": 2,
        "unlock": 21,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_chrysanthemum"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "mangrove",
        "name": "Palétuvier",
        "role": "Ancrage résistant",
        "description": "Ses racines forment un rempart durable et récupèrent leurs forces.",
        "ability": "Racines de berge",
        "personality": "Patient et tenace. Il a besoin de savoir ce que deviennent ceux qui restent.",
        "cost": 125,
        "cooldown": 7,
        "max_hp": 820,
        "rate": 2.3,
        "damage": 13,
        "range": 1.3,
        "behavior": "guard",
        "effect_radius": 1,
        "effect_strength": 1.1,
        "color": "#739c7e",
        "chapter": 3,
        "unlock": 24,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_basic_shot",
          "ab_ally_protection",
          "ab_personal_regeneration"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "coconut",
        "name": "Cocotier",
        "role": "Tir lourd lointain",
        "description": "Lance de lourdes noix à longue portée ; chaque tir demande du temps.",
        "ability": "Noix de vigie",
        "personality": "Enthousiaste. Il découvre les questions auxquelles un navigateur ne sait pas répondre.",
        "cost": 195,
        "cooldown": 6.5,
        "max_hp": 260,
        "rate": 3,
        "damage": 100,
        "range": 10,
        "behavior": "sniper",
        "effect_radius": 0,
        "effect_strength": 1.3,
        "color": "#88bd70",
        "chapter": 3,
        "unlock": 26,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_coconut"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "pandanus",
        "name": "Pandanus",
        "role": "Réparation renforcée",
        "description": "Répare à proximité et consolide le terrain depuis une position protégée.",
        "ability": "Attaches tressées",
        "personality": "Pratique et inventive. Les discours n'ont jamais retenu une plateforme.",
        "cost": 170,
        "cooldown": 7,
        "max_hp": 330,
        "rate": 4,
        "damage": 0,
        "range": 1.5,
        "behavior": "repair",
        "effect_radius": 1.5,
        "effect_strength": 1.4,
        "color": "#8fae69",
        "chapter": 3,
        "unlock": 25,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_pandanus",
          "ab_ally_protection"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "eucalyptus",
        "name": "Eucalyptus",
        "role": "Dispersion de groupe",
        "description": "Répand ses feuilles dans une large zone autour de la cible.",
        "ability": "Souffle argenté",
        "personality": "Réservé et fier. Il apprend qu'accepter un secours prépare mieux le retour.",
        "cost": 185,
        "cooldown": 6,
        "max_hp": 220,
        "rate": 2.5,
        "damage": 34,
        "range": 7,
        "behavior": "splash",
        "effect_radius": 1.5,
        "effect_strength": 0.9,
        "color": "#a4c5b9",
        "chapter": 3,
        "unlock": 27,
        "damage_type": "piercing",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_eucalyptus"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "banksia",
        "name": "Banksia",
        "role": "Recyclage ciblé",
        "description": "Marque ses cibles pour améliorer les graines récupérées à leur élimination.",
        "ability": "Réserve de demain",
        "personality": "Prévoyante et curieuse. Elle garde des graines, et les raisons de les replanter.",
        "cost": 120,
        "cooldown": 5,
        "max_hp": 210,
        "rate": 2.4,
        "damage": 25,
        "range": 6,
        "behavior": "recycler",
        "effect_radius": 0,
        "effect_strength": 1,
        "color": "#d8aa61",
        "chapter": 3,
        "unlock": 28,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_banksia"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "mushroom",
        "name": "Mycélium",
        "role": "Spores et recyclage",
        "description": "Relie les pollueurs proches : les coups se transmettent et faiblissent avec la distance.",
        "ability": "Chaîne mycélienne",
        "personality": "Un champignon collectif, attentif aux passages que personne ne voit.",
        "cost": 125,
        "cooldown": 5,
        "max_hp": 220,
        "rate": 2.6,
        "damage": 35,
        "range": 2.8,
        "behavior": "spores",
        "effect_radius": 1,
        "effect_strength": 1,
        "color": "#edb87a",
        "chapter": 3,
        "unlock": 30,
        "damage_type": "toxic",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_mushroom"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "sequoia",
        "name": "Séquoia",
        "role": "Pilier de défense",
        "description": "Un jeune arbre très résistant qui tient durablement les passages exposés.",
        "ability": "Promesse de géant",
        "personality": "Timide. Il cesse peu à peu de se mesurer aux arbres de son enfance.",
        "cost": 200,
        "cooldown": 9,
        "max_hp": 1380,
        "rate": 3,
        "damage": 16,
        "range": 1.2,
        "behavior": "guard",
        "effect_radius": 1,
        "effect_strength": 0.9,
        "color": "#b57663",
        "chapter": 4,
        "unlock": 32,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_basic_shot",
          "ab_sequoia_protection",
          "ab_personal_regeneration"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "cactus",
        "name": "Cactus",
        "role": "Rempart offensif",
        "description": "Ses épines infligent de lourds dégâts aux pollueurs proches.",
        "ability": "Mauvaise étreinte",
        "personality": "Solitaire et sarcastique. Sa générosité s'exprime sans commentaire.",
        "cost": 155,
        "cooldown": 5.5,
        "max_hp": 590,
        "rate": 1.5,
        "damage": 45,
        "range": 1.9,
        "behavior": "thorns",
        "effect_radius": 0.8,
        "effect_strength": 1.5,
        "color": "#7ab18c",
        "chapter": 4,
        "unlock": 33,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_cactus"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "agave",
        "name": "Agave",
        "role": "Brise-blindage",
        "description": "Ses attaques puissantes sont particulièrement utiles face aux protections épaisses.",
        "ability": "Pointe de brèche",
        "personality": "Résolue, peu bavarde. Elle prépare chaque effort avec précision.",
        "cost": 185,
        "cooldown": 6,
        "max_hp": 290,
        "rate": 2.5,
        "damage": 72,
        "range": 5,
        "behavior": "pierce",
        "effect_radius": 0,
        "effect_strength": 1,
        "color": "#8cafab",
        "chapter": 4,
        "unlock": 34,
        "damage_type": "piercing",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_agave"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "dahlia",
        "name": "Dahlia",
        "role": "Soutien étendu",
        "description": "Soutient les attaquants dans une zone plus large, depuis l'arrière.",
        "ability": "Accord des jardins",
        "personality": "Créative et expressive. Elle écoute les objections avant de dessiner les plans.",
        "cost": 180,
        "cooldown": 6.5,
        "max_hp": 205,
        "rate": 3,
        "damage": 19,
        "range": 6,
        "behavior": "buffer",
        "effect_radius": 2.2,
        "effect_strength": 0.8,
        "color": "#df8ec5",
        "chapter": 4,
        "unlock": 35,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_dahlia",
          "ab_dahlia_aura"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "passionflower",
        "name": "Passiflore",
        "role": "Entrave à distance",
        "description": "Ses vrilles saisissent les pollueurs loin de la première ligne.",
        "ability": "Passage secret",
        "personality": "Audacieuse et curieuse. Elle vérifie toujours s'il existe une autre entrée.",
        "cost": 155,
        "cooldown": 5.5,
        "max_hp": 210,
        "rate": 2.8,
        "damage": 27,
        "range": 6.5,
        "behavior": "snare",
        "effect_radius": 0.7,
        "effect_strength": 1.2,
        "color": "#aa91d7",
        "chapter": 4,
        "unlock": 36,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "ability_ids": [
          "ab_passionflower"
        ],
        "behaviorId": "ai_defender"
      }
    ],
    "enemies": [
      {
        "id": "litterer",
        "name": "Jeteur de déchets",
        "hp": 105,
        "speed": 0.205,
        "attack": 19,
        "reward": 35,
        "reach": 0.69,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 0,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_ground"
      },
      {
        "id": "runner",
        "name": "Canette pressée",
        "hp": 66,
        "speed": 0.34,
        "attack": 14,
        "reward": 30,
        "reach": 0.62,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 0,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_ground"
      },
      {
        "id": "sprayer",
        "name": "Pulvérisateur",
        "hp": 175,
        "speed": 0.17,
        "attack": 22,
        "reward": 50,
        "reach": 1.05,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 0,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_ground"
      },
      {
        "id": "truck",
        "name": "Camion pollueur",
        "hp": 365,
        "speed": 0.135,
        "attack": 40,
        "reward": 90,
        "reach": 0.77,
        "damage_type": "physical",
        "armor": 0.5,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 0,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_ground"
      },
      {
        "id": "jammer",
        "name": "Drone brouilleur",
        "hp": 185,
        "speed": 0.185,
        "attack": 17,
        "reward": 65,
        "reach": 1.05,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 0,
        "ability_ids": [
          "ab_enemy_contact",
          "ab_jammer_pulse"
        ],
        "behaviorId": "ai_ground"
      },
      {
        "id": "tanker",
        "name": "Citerne blindée",
        "hp": 490,
        "speed": 0.115,
        "attack": 43,
        "reward": 110,
        "reach": 0.8,
        "damage_type": "physical",
        "armor": 0.5,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 0,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_ground"
      },
      {
        "id": "collector",
        "name": "Le Ramasseur",
        "hp": 1100,
        "speed": 0.065,
        "attack": 40,
        "reward": 240,
        "reach": 0.85,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 95,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_collector"
      },
      {
        "id": "pump",
        "name": "L’Assoiffeur",
        "hp": 1450,
        "speed": 0.06,
        "attack": 42,
        "reward": 260,
        "reach": 0.85,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 22,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_pump"
      },
      {
        "id": "factory",
        "name": "Mille-Gueules",
        "hp": 1650,
        "speed": 0.055,
        "attack": 44,
        "reward": 280,
        "reach": 0.9,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 32,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_factory"
      },
      {
        "id": "devourer",
        "name": "L’Avaleur",
        "hp": 1900,
        "speed": 0.05,
        "attack": 48,
        "reward": 300,
        "reach": 1,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 32,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_devourer"
      },
      {
        "id": "corrupted_rose",
        "name": "Rose contaminée",
        "hp": 1400,
        "speed": 0.035,
        "attack": 42,
        "reward": 300,
        "reach": 1.1,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 25,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_corrupted_rose"
      },
      {
        "id": "furnace",
        "name": "La Fournaise",
        "hp": 2400,
        "speed": 0.038,
        "attack": 48,
        "reward": 400,
        "reach": 1,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 95,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_furnace"
      },
      {
        "id": "thorn_knot",
        "name": "Excroissance contaminée",
        "hp": 230,
        "speed": 0,
        "attack": 12,
        "reward": 50,
        "reach": 1,
        "damage_type": "physical",
        "armor": 0,
        "resistances": {
          "physical": 0,
          "piercing": 0,
          "toxic": 0
        },
        "special_damage": 0,
        "ability_ids": [
          "ab_enemy_contact"
        ],
        "behaviorId": "ai_fixed"
      },
      {
        "id": "plaque",
        "name": "Plaque",
        "hp": 260,
        "speed": 0,
        "attack": 22,
        "reward": 55,
        "reach": 8,
        "damage_type": "toxic",
        "armor": 0.25,
        "resistances": {
          "physical": 0.12,
          "piercing": 0,
          "toxic": 0.35
        },
        "special_damage": 0,
        "ability_ids": [
          "ab_plaque_spit"
        ],
        "behaviorId": "ai_fixed"
      }
    ]
  },
  "levels": [],
  "combat": {
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
        "id": "ab_radish_ricochet",
        "name": "Graine ricochet",
        "description": "Le tir rebondit sur un second pollueur situé à moins de 2,5 cases, à 65 % de sa force.",
        "delivery": "projectile",
        "projectileId": "proj_ricochet",
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
        "id": "ab_rose_combo",
        "name": "Esquive et riposte",
        "description": "Rose frappe au contact en trois temps. Si un coup de contact la vise et que son attaque est prête, elle l'esquive puis repousse l'assaillant.",
        "delivery": "instant",
        "projectileId": "",
        "target": "opponent",
        "selection": "one",
        "priority": "nearest",
        "rangeSource": "species",
        "range": 0.8,
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
        "id": "ab_ivy_trap",
        "name": "Piège germinant",
        "description": "Dépose une graine devant une cible ; elle germe au passage d'un pollueur, le blesse et l'immobilise.",
        "delivery": "projectile",
        "projectileId": "proj_germinating",
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
        "name": "Éclosion sous la pluie",
        "description": "L'aigrette frappe une cible ; pendant la pluie, elle inflige aussi 45 % des dégâts aux pollueurs voisins.",
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
        "name": "Retour de piqûre",
        "description": "Garde urticante : touche et empoisonne les ennemis proches sur sa ligne. Quand un ennemi blesse Ortie ou une alliée à moins de 1,6 case, sur sa ligne ou une ligne voisine, l'Ortie la plus proche riposte pour 50 % de ses dégâts. Chaque frappe subie renforce le poison jusqu'à trois paliers pendant 3,5 secondes.",
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
        "name": "Éclats stimulants",
        "description": "Un éclat atteint une autre plante en pleine attaque, tirée au sort, et triple ses dégâts et double sa cadence pendant 2 secondes.",
        "delivery": "instant",
        "projectileId": "",
        "target": "ally",
        "excludeSelf": true,
        "requiresActiveAttack": true,
        "selection": "one",
        "priority": "random",
        "rangeSource": "fixed",
        "range": 12,
        "rowRadius": 4,
        "cooldownSource": "species",
        "cooldown": 1,
        "initialDelay": 0.35,
        "effects": [
          "fx_ginger_boost",
          "fx_ginger_haste"
        ],
        "presentation": {
          "slot": "attack",
          "release": "delay",
          "delay": 0.48,
          "fitCadence": true,
          "start": {
            "soundId": "",
            "vfxId": "",
            "attach": "launch"
          },
          "releaseCue": {
            "soundId": "",
            "vfxId": "",
            "attach": "launch"
          },
          "impact": {
            "soundId": "",
            "vfxId": "",
            "attach": "center"
          }
        }
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
        "name": "Chaîne mycélienne",
        "description": "Un coup direct se propage entre pollueurs à moins de deux cases ; la force baisse avec chaque écart. Les dégâts de zone ne déclenchent pas la chaîne.",
        "delivery": "instant",
        "projectileId": "",
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
      },
      {
        "id": "ab_collector_special",
        "name": "Le Ramasseur — onde spéciale",
        "description": "Attaque configurée dans le Studio, sans code propre à ce boss.",
        "delivery": "instant",
        "projectileId": "",
        "target": "opponent",
        "selection": "one",
        "priority": "nearest",
        "rangeSource": "fixed",
        "range": 12,
        "rowRadius": 0,
        "cooldownSource": "fixed",
        "cooldown": 12,
        "initialDelay": 6,
        "effects": [
          "fx_collector_special",
          "fx_collector_special_stun"
        ]
      },
      {
        "id": "ab_pump_special",
        "name": "L’Assoiffeur — onde spéciale",
        "description": "Attaque configurée dans le Studio, sans code propre à ce boss.",
        "delivery": "instant",
        "projectileId": "",
        "target": "opponent",
        "selection": "all",
        "priority": "nearest",
        "rangeSource": "fixed",
        "range": 12,
        "rowRadius": 0,
        "cooldownSource": "fixed",
        "cooldown": 12,
        "initialDelay": 6,
        "effects": [
          "fx_pump_special",
          "fx_pump_special_stun"
        ]
      },
      {
        "id": "ab_boss_wave",
        "name": "Onde offensive",
        "description": "Modèle partagé entre les espèces qui utilisent exactement la même attaque.",
        "delivery": "instant",
        "projectileId": "",
        "target": "opponent",
        "selection": "all",
        "priority": "nearest",
        "rangeSource": "fixed",
        "range": 12,
        "rowRadius": 0,
        "cooldownSource": "fixed",
        "cooldown": 12,
        "initialDelay": 6,
        "effects": [
          "fx_boss_wave"
        ]
      },
      {
        "id": "ab_corrupted_rose_special",
        "name": "Rose contaminée — onde spéciale",
        "description": "Attaque configurée dans le Studio, sans code propre à ce boss.",
        "delivery": "instant",
        "projectileId": "",
        "target": "opponent",
        "selection": "all",
        "priority": "nearest",
        "rangeSource": "fixed",
        "range": 12,
        "rowRadius": 1,
        "cooldownSource": "fixed",
        "cooldown": 12,
        "initialDelay": 6,
        "effects": [
          "fx_corrupted_rose_special",
          "fx_corrupted_rose_special_stun"
        ]
      },
      {
        "id": "ab_furnace_special",
        "name": "La Fournaise — onde spéciale",
        "description": "Attaque configurée dans le Studio, sans code propre à ce boss.",
        "delivery": "instant",
        "projectileId": "",
        "target": "opponent",
        "selection": "all",
        "priority": "nearest",
        "rangeSource": "fixed",
        "range": 12,
        "rowRadius": 0,
        "cooldownSource": "fixed",
        "cooldown": 12,
        "initialDelay": 6,
        "effects": [
          "fx_furnace_special"
        ]
      },
      {
        "id": "ab_plaque_spit",
        "name": "Crachat de la Plaque",
        "description": "Tir toxique vers la plante la plus proche dans la même allée, à gauche ou à droite ; à distance égale, celle de droite est prioritaire.",
        "delivery": "projectile",
        "projectileId": "proj_plaque_slime",
        "target": "opponent",
        "allowBehind": true,
        "selection": "one",
        "priority": "nearest_right",
        "rangeSource": "species",
        "range": 8,
        "rowRadius": 0,
        "cooldownSource": "fixed",
        "cooldown": 2.7,
        "initialDelay": 1,
        "effects": [
          "fx_attack"
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
        "id": "fx_ginger_boost",
        "name": "Gingembre — dégâts triplés",
        "description": "Ajoute 200 % de dégâts pendant 2 secondes, sans cumul.",
        "kind": "damage_boost",
        "valueSource": "fixed",
        "amount": 2,
        "damageType": "inherit",
        "duration": 2,
        "tickInterval": 1
      },
      {
        "id": "fx_ginger_haste",
        "name": "Gingembre — cadence doublée",
        "description": "Ajoute 100 % de cadence pendant 2 secondes, sans cumul.",
        "kind": "attack_speed_boost",
        "valueSource": "fixed",
        "amount": 1,
        "damageType": "inherit",
        "duration": 2,
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
        "id": "fx_rose_recovery",
        "name": "Rose — récupération de riposte",
        "description": "Empêche une nouvelle esquive pendant 2,5 secondes après une riposte.",
        "kind": "counter_cooldown",
        "valueSource": "fixed",
        "amount": 0,
        "damageType": "inherit",
        "duration": 2.5,
        "tickInterval": 1
      },
      {
        "id": "fx_rose_stagger",
        "name": "Rose — interruption brève",
        "description": "Le coup final interrompt l'assaillant pendant 0,35 seconde.",
        "kind": "stun",
        "valueSource": "fixed",
        "amount": 0,
        "damageType": "inherit",
        "duration": 0.35,
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
      },
      {
        "id": "fx_collector_special",
        "name": "Le Ramasseur — impact",
        "description": "",
        "kind": "damage",
        "valueSource": "fixed",
        "amount": 95,
        "damageType": "physical",
        "duration": 1,
        "tickInterval": 1
      },
      {
        "id": "fx_collector_special_stun",
        "name": "Le Ramasseur — étourdissement",
        "description": "",
        "kind": "stun",
        "valueSource": "fixed",
        "amount": 0,
        "damageType": "inherit",
        "duration": 2,
        "tickInterval": 1
      },
      {
        "id": "fx_pump_special",
        "name": "L’Assoiffeur — impact",
        "description": "",
        "kind": "damage",
        "valueSource": "fixed",
        "amount": 22,
        "damageType": "physical",
        "duration": 1,
        "tickInterval": 1
      },
      {
        "id": "fx_pump_special_stun",
        "name": "L’Assoiffeur — étourdissement",
        "description": "",
        "kind": "stun",
        "valueSource": "fixed",
        "amount": 0,
        "damageType": "inherit",
        "duration": 3,
        "tickInterval": 1
      },
      {
        "id": "fx_boss_wave",
        "name": "Onde offensive — impact",
        "description": "Résultat partagé par les boss utilisant la même onde offensive.",
        "kind": "damage",
        "valueSource": "fixed",
        "amount": 32,
        "damageType": "physical",
        "duration": 1,
        "tickInterval": 1
      },
      {
        "id": "fx_corrupted_rose_special",
        "name": "Rose contaminée — impact",
        "description": "",
        "kind": "damage",
        "valueSource": "fixed",
        "amount": 25,
        "damageType": "physical",
        "duration": 1,
        "tickInterval": 1
      },
      {
        "id": "fx_corrupted_rose_special_stun",
        "name": "Rose contaminée — étourdissement",
        "description": "",
        "kind": "stun",
        "valueSource": "fixed",
        "amount": 0,
        "damageType": "inherit",
        "duration": 2,
        "tickInterval": 1
      },
      {
        "id": "fx_furnace_special",
        "name": "La Fournaise — impact",
        "description": "",
        "kind": "damage",
        "valueSource": "fixed",
        "amount": 95,
        "damageType": "physical",
        "duration": 1,
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
        "id": "proj_ricochet",
        "name": "Graine ricochet",
        "description": "Graine de Radis ; le second contact est résolu par le rebond.",
        "speed": 4.8,
        "lifetime": 3,
        "maxHits": 1,
        "hitRadius": 0.18,
        "splashRadius": 0,
        "rowRadius": 0,
        "color": "#f8a1a6",
        "size": 0.11
      },
      {
        "id": "proj_germinating",
        "name": "Graine dormante",
        "description": "Graine immobile qui germe au passage d'un pollueur.",
        "speed": 0,
        "lifetime": 8,
        "maxHits": 1,
        "hitRadius": 0.18,
        "splashRadius": 0,
        "rowRadius": 0,
        "color": "#76b779",
        "size": 0.12
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
      },
      {
        "id": "proj_plaque_slime",
        "name": "Goutte de slime violet",
        "description": "Projectile toxique de la Plaque.",
        "speed": 5.2,
        "lifetime": 2,
        "maxHits": 1,
        "hitRadius": 0.18,
        "splashRadius": 0,
        "rowRadius": 0,
        "color": "#bd39ed",
        "size": 0.13
      }
    ]
  },
  "logic": {
    "behaviors": [
      {
        "id": "ai_defender",
        "name": "Défenseur immobile",
        "description": "",
        "team": "plants",
        "mode": "automatic",
        "fallback": "hold",
        "stopToAttack": true,
        "rules": [],
        "phases": [
          {
            "id": "ai_defender_normal",
            "name": "Normal",
            "healthBelow": 100,
            "speedFactor": 1,
            "attackFactor": 1,
            "inheritAbilities": true,
            "abilityIds": [],
            "onEnter": []
          }
        ]
      },
      {
        "id": "ai_ground",
        "name": "Ennemi terrestre",
        "description": "",
        "team": "enemies",
        "mode": "automatic",
        "fallback": "advance",
        "stopToAttack": true,
        "rules": [],
        "phases": [
          {
            "id": "ai_ground_normal",
            "name": "Normal",
            "healthBelow": 100,
            "speedFactor": 1,
            "attackFactor": 1,
            "inheritAbilities": true,
            "abilityIds": [],
            "onEnter": []
          }
        ]
      },
      {
        "id": "ai_fixed",
        "name": "Ennemi immobile",
        "description": "",
        "team": "enemies",
        "mode": "automatic",
        "fallback": "hold",
        "stopToAttack": true,
        "rules": [],
        "phases": [
          {
            "id": "ai_fixed_normal",
            "name": "Normal",
            "healthBelow": 100,
            "speedFactor": 1,
            "attackFactor": 1,
            "inheritAbilities": true,
            "abilityIds": [],
            "onEnter": []
          }
        ]
      },
      {
        "id": "ai_collector",
        "name": "Le Ramasseur — phases",
        "description": "Ancienne attaque spéciale représentée par des capacités globales. Les PV et dégâts de base ne changent pas entre niveaux.",
        "team": "enemies",
        "mode": "automatic",
        "fallback": "advance",
        "stopToAttack": true,
        "rules": [],
        "phases": [
          {
            "id": "ai_collector_p1",
            "name": "Approche",
            "healthBelow": 100,
            "speedFactor": 1,
            "attackFactor": 1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_collector_special"
            ],
            "onEnter": []
          },
          {
            "id": "ai_collector_p2",
            "name": "Colère",
            "healthBelow": 66,
            "speedFactor": 1,
            "attackFactor": 1.1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_collector_special"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "Le Ramasseur change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          },
          {
            "id": "ai_collector_p3",
            "name": "Dernière offensive",
            "healthBelow": 33,
            "speedFactor": 1,
            "attackFactor": 1.2,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_collector_special"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "Le Ramasseur change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          }
        ]
      },
      {
        "id": "ai_pump",
        "name": "L’Assoiffeur — phases",
        "description": "Ancienne attaque spéciale représentée par des capacités globales. Les PV et dégâts de base ne changent pas entre niveaux.",
        "team": "enemies",
        "mode": "automatic",
        "fallback": "advance",
        "stopToAttack": true,
        "rules": [],
        "phases": [
          {
            "id": "ai_pump_p1",
            "name": "Approche",
            "healthBelow": 100,
            "speedFactor": 1,
            "attackFactor": 1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_pump_special"
            ],
            "onEnter": []
          },
          {
            "id": "ai_pump_p2",
            "name": "Colère",
            "healthBelow": 66,
            "speedFactor": 1,
            "attackFactor": 1.1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_pump_special"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "L’Assoiffeur change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          },
          {
            "id": "ai_pump_p3",
            "name": "Dernière offensive",
            "healthBelow": 33,
            "speedFactor": 1,
            "attackFactor": 1.2,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_pump_special"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "L’Assoiffeur change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          }
        ]
      },
      {
        "id": "ai_factory",
        "name": "Mille-Gueules — phases",
        "description": "Ancienne attaque spéciale représentée par des capacités globales. Les PV et dégâts de base ne changent pas entre niveaux.",
        "team": "enemies",
        "mode": "automatic",
        "fallback": "advance",
        "stopToAttack": true,
        "rules": [],
        "phases": [
          {
            "id": "ai_factory_p1",
            "name": "Approche",
            "healthBelow": 100,
            "speedFactor": 1,
            "attackFactor": 1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_boss_wave"
            ],
            "onEnter": []
          },
          {
            "id": "ai_factory_p2",
            "name": "Colère",
            "healthBelow": 66,
            "speedFactor": 1,
            "attackFactor": 1.1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_boss_wave"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "Mille-Gueules change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          },
          {
            "id": "ai_factory_p3",
            "name": "Dernière offensive",
            "healthBelow": 33,
            "speedFactor": 1,
            "attackFactor": 1.2,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_boss_wave"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "Mille-Gueules change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          }
        ]
      },
      {
        "id": "ai_devourer",
        "name": "L’Avaleur — phases",
        "description": "Ancienne attaque spéciale représentée par des capacités globales. Les PV et dégâts de base ne changent pas entre niveaux.",
        "team": "enemies",
        "mode": "automatic",
        "fallback": "advance",
        "stopToAttack": true,
        "rules": [],
        "phases": [
          {
            "id": "ai_devourer_p1",
            "name": "Approche",
            "healthBelow": 100,
            "speedFactor": 1,
            "attackFactor": 1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_boss_wave"
            ],
            "onEnter": []
          },
          {
            "id": "ai_devourer_p2",
            "name": "Colère",
            "healthBelow": 66,
            "speedFactor": 1,
            "attackFactor": 1.1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_boss_wave"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "L’Avaleur change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          },
          {
            "id": "ai_devourer_p3",
            "name": "Dernière offensive",
            "healthBelow": 33,
            "speedFactor": 1,
            "attackFactor": 1.2,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_boss_wave"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "L’Avaleur change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          }
        ]
      },
      {
        "id": "ai_corrupted_rose",
        "name": "Rose contaminée — phases",
        "description": "Ancienne attaque spéciale représentée par des capacités globales. Les PV et dégâts de base ne changent pas entre niveaux.",
        "team": "enemies",
        "mode": "automatic",
        "fallback": "advance",
        "stopToAttack": true,
        "rules": [],
        "phases": [
          {
            "id": "ai_corrupted_rose_p1",
            "name": "Approche",
            "healthBelow": 100,
            "speedFactor": 1,
            "attackFactor": 1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_corrupted_rose_special"
            ],
            "onEnter": []
          },
          {
            "id": "ai_corrupted_rose_p2",
            "name": "Colère",
            "healthBelow": 66,
            "speedFactor": 1,
            "attackFactor": 1.1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_corrupted_rose_special"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "Rose contaminée change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          },
          {
            "id": "ai_corrupted_rose_p3",
            "name": "Dernière offensive",
            "healthBelow": 33,
            "speedFactor": 1,
            "attackFactor": 1.2,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_corrupted_rose_special"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "Rose contaminée change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          }
        ]
      },
      {
        "id": "ai_furnace",
        "name": "La Fournaise — phases",
        "description": "Ancienne attaque spéciale représentée par des capacités globales. Les PV et dégâts de base ne changent pas entre niveaux.",
        "team": "enemies",
        "mode": "automatic",
        "fallback": "advance",
        "stopToAttack": true,
        "rules": [],
        "phases": [
          {
            "id": "ai_furnace_p1",
            "name": "Approche",
            "healthBelow": 100,
            "speedFactor": 1,
            "attackFactor": 1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_furnace_special"
            ],
            "onEnter": []
          },
          {
            "id": "ai_furnace_p2",
            "name": "Colère",
            "healthBelow": 66,
            "speedFactor": 1,
            "attackFactor": 1.1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_furnace_special"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "La Fournaise change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          },
          {
            "id": "ai_furnace_p3",
            "name": "Dernière offensive",
            "healthBelow": 33,
            "speedFactor": 1,
            "attackFactor": 1.2,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_furnace_special"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "La Fournaise change de tactique !"
              },
              {
                "type": "shake",
                "delay": 0,
                "amount": 4,
                "duration": 0.35
              }
            ]
          }
        ]
      }
    ],
    "variables": []
  }
};
installCigarette(GAME_SEED);
installPlasticBag(GAME_SEED);
export function seedProject():GameProject{const p=structuredClone(GAME_SEED);ensurePresentation(p);return p;}
