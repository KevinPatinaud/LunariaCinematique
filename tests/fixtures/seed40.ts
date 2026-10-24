import {importCombatMechanics} from '../../src/shared/game/combatMechanics.js';
import { ensurePresentation } from '../../src/shared/presentation/defaults.js';
import type { GameProject } from '../../src/shared/game/types.js';
/** Editable starter content, not a runtime fallback. */
export const GAME_SEED:GameProject={
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
        "description": "Un tir fiable dans son allée, à un coût accessible.",
        "ability": "Graines vaillantes",
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
          "ab_basic_shot"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "rose",
        "name": "Rose",
        "role": "Entrave défensive",
        "description": "Ses épines accrochent les pollueurs proches et freinent leur avancée.",
        "ability": "Étreinte épineuse",
        "personality": "Protectrice, méfiante. Elle apprend à partager le poids des autres.",
        "cost": 90,
        "cooldown": 5,
        "max_hp": 400,
        "rate": 1.8,
        "damage": 25,
        "range": 2.25,
        "behavior": "snare",
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
          "ab_root_shot"
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
        "damage": 9,
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
          "ab_basic_shot",
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
        "description": "Ses aigrettes atteignent les menaces lointaines avec précision.",
        "ability": "Aigrettes éclaireuses",
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
        "description": "Accroche une cible à moyenne portée pour laisser les attaquants agir.",
        "ability": "Prise de la verrière",
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
          "ab_root_shot"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "nettle",
        "name": "Ortie",
        "role": "Riposte de contact",
        "description": "Punit les pollueurs qui s'approchent de ses protégés.",
        "ability": "Garde urticante",
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
        "role": "Explosion rapprochée",
        "description": "Frappe fort un groupe compact, mais doit être placé près du front.",
        "ability": "Racine explosive",
        "personality": "Impulsif et enthousiaste. Il apprend à attendre le signal commun.",
        "cost": 150,
        "cooldown": 4.5,
        "max_hp": 215,
        "rate": 2.2,
        "damage": 52,
        "range": 3.5,
        "behavior": "splash",
        "effect_radius": 0.7,
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
        "description": "Son réseau de spores attaque à courte portée et aide au recyclage des cibles.",
        "ability": "Réseau vivant",
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
      }
    ]
  },
  "levels": [
    {
      "id": "mission_01",
      "title": "Derrière la vitre",
      "subtitle": "La jardinerie Lunaria · Radis et Rose",
      "act": 0,
      "location": "La jardinerie Lunaria",
      "startingEnergy": 520,
      "allowedPlants": [
        "radish",
        "rose"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez le dernier jardin pendant trois vagues.",
      "tip": "Plantez Radis dans les allées annoncées et Rose devant lui. Les graines proviennent des pollueurs arrêtés.",
      "waves": [
        {
          "id": "mission_01_wave_1",
          "groups": [
            {
              "id": "mission_01_w1_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": 2,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_01_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": 1,
              "start": 3.95,
              "interval": 1.25
            },
            {
              "id": "mission_01_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": 3,
              "start": 7.65,
              "interval": 1.25
            },
            {
              "id": "mission_01_w1_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": 0,
              "start": 11.35,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_01_wave_2",
          "groups": [
            {
              "id": "mission_01_w2_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": 2,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_01_w2_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": 1,
              "start": 3.95,
              "interval": 1.25
            },
            {
              "id": "mission_01_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": 3,
              "start": 7.65,
              "interval": 1.25
            },
            {
              "id": "mission_01_w2_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": 0,
              "start": 11.35,
              "interval": 1.25
            },
            {
              "id": "mission_01_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": 4,
              "start": 15.05,
              "interval": 1.25
            },
            {
              "id": "mission_01_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": 2,
              "start": 18.75,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_01_wave_3",
          "groups": [
            {
              "id": "mission_01_w3_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": 2,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_01_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": 1,
              "start": 3.95,
              "interval": 1.25
            },
            {
              "id": "mission_01_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": 3,
              "start": 7.65,
              "interval": 1.25
            },
            {
              "id": "mission_01_w3_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": 0,
              "start": 11.35,
              "interval": 1.25
            },
            {
              "id": "mission_01_w3_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": 4,
              "start": 15.05,
              "interval": 1.25
            },
            {
              "id": "mission_01_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": 2,
              "start": 18.75,
              "interval": 1.25
            },
            {
              "id": "mission_01_w3_g7",
              "enemyId": "litterer",
              "count": 1,
              "lane": 1,
              "start": 22.45,
              "interval": 1.25
            },
            {
              "id": "mission_01_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": 3,
              "start": 26.15,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_02",
      "title": "L'inventaire de Noisetier",
      "subtitle": "Une clôture le long des rails",
      "act": 0,
      "location": "Une clôture le long des rails",
      "startingEnergy": 530,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Gardez le passage libre pour dégager la clôture.",
      "tip": "Le chantier avance pendant les vagues tant qu'une plante est vivante dans le jardin. Noisetier peut retenir les assaillants.",
      "waves": [
        {
          "id": "mission_02_wave_1",
          "groups": [
            {
              "id": "mission_02_w1_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": 2,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_02_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": 1,
              "start": 3.45,
              "interval": 1.25
            },
            {
              "id": "mission_02_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": 3,
              "start": 6.65,
              "interval": 1.25
            },
            {
              "id": "mission_02_w1_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": 0,
              "start": 9.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_02_wave_2",
          "groups": [
            {
              "id": "mission_02_w2_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": 2,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_02_w2_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": 1,
              "start": 3.45,
              "interval": 1.25
            },
            {
              "id": "mission_02_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": 3,
              "start": 6.65,
              "interval": 1.25
            },
            {
              "id": "mission_02_w2_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": 0,
              "start": 9.85,
              "interval": 1.25
            },
            {
              "id": "mission_02_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": 4,
              "start": 13.05,
              "interval": 1.25
            },
            {
              "id": "mission_02_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": 2,
              "start": 16.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_02_wave_3",
          "groups": [
            {
              "id": "mission_02_w3_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": 2,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_02_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": 1,
              "start": 3.45,
              "interval": 1.25
            },
            {
              "id": "mission_02_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": 3,
              "start": 6.65,
              "interval": 1.25
            },
            {
              "id": "mission_02_w3_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": 0,
              "start": 9.85,
              "interval": 1.25
            },
            {
              "id": "mission_02_w3_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": 4,
              "start": 13.05,
              "interval": 1.25
            },
            {
              "id": "mission_02_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": 2,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_02_w3_g7",
              "enemyId": "litterer",
              "count": 1,
              "lane": 1,
              "start": 19.45,
              "interval": 1.25
            },
            {
              "id": "mission_02_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": 3,
              "start": 22.65,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_03",
      "title": "L'eau derrière les murs",
      "subtitle": "Les passages de Fougère",
      "act": 0,
      "location": "Les passages de Fougère",
      "startingEnergy": 550,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Défendez les racines qui rouvrent le petit canal.",
      "tip": "La remise en eau avance pendant les vagues, avec l'aide des plantes vivantes. Toutes les parcelles sont disponibles ; Fougère ralentit les cibles.",
      "waves": [
        {
          "id": "mission_03_wave_1",
          "groups": [
            {
              "id": "mission_03_w1_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_03_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_03_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_03_w1_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.45,
              "interval": 1.25
            },
            {
              "id": "mission_03_w1_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.7,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_03_wave_2",
          "groups": [
            {
              "id": "mission_03_w2_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_03_w2_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_03_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_03_w2_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.1,
              "interval": 1.25
            },
            {
              "id": "mission_03_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.35,
              "interval": 1.25
            },
            {
              "id": "mission_03_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.1,
              "interval": 1.25
            },
            {
              "id": "mission_03_w2_g7",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.95,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_03_wave_3",
          "groups": [
            {
              "id": "mission_03_w3_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_03_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_03_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_03_w3_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 4.75,
              "interval": 1.25
            },
            {
              "id": "mission_03_w3_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6,
              "interval": 1.25
            },
            {
              "id": "mission_03_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.75,
              "interval": 1.25
            },
            {
              "id": "mission_03_w3_g7",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.25,
              "interval": 1.25
            },
            {
              "id": "mission_03_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.5,
              "interval": 1.25
            },
            {
              "id": "mission_03_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_04",
      "title": "L'horloge de Pissenlit",
      "subtitle": "Les quais du Ramasseur",
      "act": 0,
      "location": "Les quais du Ramasseur",
      "startingEnergy": 560,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Arrêtez les patrouilles sous le poste d'observation.",
      "tip": "Les canettes pressées courent vite. Pissenlit porte loin, mais ses feuilles sont fragiles.",
      "waves": [
        {
          "id": "mission_04_wave_1",
          "groups": [
            {
              "id": "mission_04_w1_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_04_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_04_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_04_w1_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.45,
              "interval": 1.25
            },
            {
              "id": "mission_04_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.7,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_04_wave_2",
          "groups": [
            {
              "id": "mission_04_w2_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_04_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_04_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_04_w2_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.1,
              "interval": 1.25
            },
            {
              "id": "mission_04_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.35,
              "interval": 1.25
            },
            {
              "id": "mission_04_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.1,
              "interval": 1.25
            },
            {
              "id": "mission_04_w2_g7",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.95,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_04_wave_3",
          "groups": [
            {
              "id": "mission_04_w3_g1",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_04_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_04_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_04_w3_g4",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 4.75,
              "interval": 1.25
            },
            {
              "id": "mission_04_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6,
              "interval": 1.25
            },
            {
              "id": "mission_04_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.75,
              "interval": 1.25
            },
            {
              "id": "mission_04_w3_g7",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.25,
              "interval": 1.25
            },
            {
              "id": "mission_04_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.5,
              "interval": 1.25
            },
            {
              "id": "mission_04_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_05",
      "title": "Un pont pour tout le monde",
      "subtitle": "La verrière de Lierre",
      "act": 0,
      "location": "La verrière de Lierre",
      "startingEnergy": 570,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez les attaches pendant la réparation du passage.",
      "tip": "Défendez le jardin pendant les travaux : chaque parcelle vide est disponible. Choisissez cinq espèces parmi vos six compagnons.",
      "waves": [
        {
          "id": "mission_05_wave_1",
          "groups": [
            {
              "id": "mission_05_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_05_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_05_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_05_w1_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 5.45,
              "interval": 1.25
            },
            {
              "id": "mission_05_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.7,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_05_wave_2",
          "groups": [
            {
              "id": "mission_05_w2_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_05_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_05_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_05_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 5.1,
              "interval": 1.25
            },
            {
              "id": "mission_05_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.35,
              "interval": 1.25
            },
            {
              "id": "mission_05_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.1,
              "interval": 1.25
            },
            {
              "id": "mission_05_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.95,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_05_wave_3",
          "groups": [
            {
              "id": "mission_05_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_05_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_05_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_05_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.75,
              "interval": 1.25
            },
            {
              "id": "mission_05_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6,
              "interval": 1.25
            },
            {
              "id": "mission_05_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.75,
              "interval": 1.25
            },
            {
              "id": "mission_05_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.25,
              "interval": 1.25
            },
            {
              "id": "mission_05_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.5,
              "interval": 1.25
            },
            {
              "id": "mission_05_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_06",
      "title": "Personne dans le dernier wagon",
      "subtitle": "Le refuge d'Ortie",
      "act": 0,
      "location": "Le refuge d'Ortie",
      "startingEnergy": 585,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Défendez les jeunes pousses rassemblées par Ortie.",
      "tip": "Ortie punit le contact. Gardez des tirs derrière les plantes qui retiennent les pollueurs.",
      "waves": [
        {
          "id": "mission_06_wave_1",
          "groups": [
            {
              "id": "mission_06_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_06_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_06_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_06_w1_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 5.45,
              "interval": 1.25
            },
            {
              "id": "mission_06_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.7,
              "interval": 1.25
            },
            {
              "id": "mission_06_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.45,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_06_wave_2",
          "groups": [
            {
              "id": "mission_06_w2_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_06_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_06_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_06_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 5.1,
              "interval": 1.25
            },
            {
              "id": "mission_06_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.35,
              "interval": 1.25
            },
            {
              "id": "mission_06_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.1,
              "interval": 1.25
            },
            {
              "id": "mission_06_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.95,
              "interval": 1.25
            },
            {
              "id": "mission_06_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 11.2,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_06_wave_3",
          "groups": [
            {
              "id": "mission_06_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_06_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_06_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_06_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.75,
              "interval": 1.25
            },
            {
              "id": "mission_06_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6,
              "interval": 1.25
            },
            {
              "id": "mission_06_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.75,
              "interval": 1.25
            },
            {
              "id": "mission_06_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.25,
              "interval": 1.25
            },
            {
              "id": "mission_06_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.5,
              "interval": 1.25
            },
            {
              "id": "mission_06_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_06_w3_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.75,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_07",
      "title": "Des racines entre les rails",
      "subtitle": "La traversée des jeunes plantes",
      "act": 0,
      "location": "La traversée des jeunes plantes",
      "startingEnergy": 600,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Escortez les jeunes pousses jusqu'au refuge sans les perdre.",
      "tip": "L'escorte avance hors du plateau pendant les vagues. Gardez une défense vivante et protégez les cinq allées du jardin.",
      "waves": [
        {
          "id": "mission_07_wave_1",
          "groups": [
            {
              "id": "mission_07_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_07_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_07_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_07_w1_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 5.45,
              "interval": 1.25
            },
            {
              "id": "mission_07_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.7,
              "interval": 1.25
            },
            {
              "id": "mission_07_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.45,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_07_wave_2",
          "groups": [
            {
              "id": "mission_07_w2_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_07_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_07_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_07_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 5.1,
              "interval": 1.25
            },
            {
              "id": "mission_07_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.35,
              "interval": 1.25
            },
            {
              "id": "mission_07_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.1,
              "interval": 1.25
            },
            {
              "id": "mission_07_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.95,
              "interval": 1.25
            },
            {
              "id": "mission_07_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 11.2,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_07_wave_3",
          "groups": [
            {
              "id": "mission_07_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_07_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_07_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_07_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.75,
              "interval": 1.25
            },
            {
              "id": "mission_07_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6,
              "interval": 1.25
            },
            {
              "id": "mission_07_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.75,
              "interval": 1.25
            },
            {
              "id": "mission_07_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.25,
              "interval": 1.25
            },
            {
              "id": "mission_07_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.5,
              "interval": 1.25
            },
            {
              "id": "mission_07_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_07_w3_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.75,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_08",
      "title": "Le Ramasseur",
      "subtitle": "Le parc de la source",
      "act": 0,
      "location": "Le parc de la source",
      "startingEnergy": 625,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Repoussez les vagues et arrêtez le Ramasseur.",
      "tip": "Conservez des graines pour réparer votre ligne. Le Ramasseur frappe et perturbe les défenses proches.",
      "waves": [
        {
          "id": "mission_08_wave_1",
          "groups": [
            {
              "id": "mission_08_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_08_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_08_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_08_w1_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 5.45,
              "interval": 1.25
            },
            {
              "id": "mission_08_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.7,
              "interval": 1.25
            },
            {
              "id": "mission_08_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.45,
              "interval": 1.25
            },
            {
              "id": "mission_08_w1_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 10.65,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_08_wave_2",
          "groups": [
            {
              "id": "mission_08_w2_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_08_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_08_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_08_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 5.1,
              "interval": 1.25
            },
            {
              "id": "mission_08_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.35,
              "interval": 1.25
            },
            {
              "id": "mission_08_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.1,
              "interval": 1.25
            },
            {
              "id": "mission_08_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.95,
              "interval": 1.25
            },
            {
              "id": "mission_08_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 11.2,
              "interval": 1.25
            },
            {
              "id": "mission_08_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.95,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_08_wave_3",
          "groups": [
            {
              "id": "mission_08_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_08_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_08_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_08_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.75,
              "interval": 1.25
            },
            {
              "id": "mission_08_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6,
              "interval": 1.25
            },
            {
              "id": "mission_08_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.75,
              "interval": 1.25
            },
            {
              "id": "mission_08_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.25,
              "interval": 1.25
            },
            {
              "id": "mission_08_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.5,
              "interval": 1.25
            },
            {
              "id": "mission_08_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_08_w3_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.75,
              "interval": 1.25
            },
            {
              "id": "mission_08_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 15,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_08_wave_4",
          "groups": [
            {
              "id": "mission_08_w4_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.4,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.65,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.4,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.55,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.8,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.55,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.7,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.95,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g12",
              "enemyId": "collector",
              "count": 1,
              "lane": -1,
              "start": 15.7,
              "interval": 1.25
            },
            {
              "id": "mission_08_w4_g13",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 16.85,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_09",
      "title": "Commencez par cette fuite",
      "subtitle": "La pépinière d'Acacia",
      "act": 1,
      "location": "La pépinière d'Acacia",
      "startingEnergy": 600,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle",
        "acacia"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Gardez le chantier de la pépinière en activité.",
      "tip": "Gardez des plantes vivantes dans le jardin pour faire avancer les travaux. Acacia est efficace contre les protections.",
      "waves": [
        {
          "id": "mission_09_wave_1",
          "groups": [
            {
              "id": "mission_09_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_09_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_09_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_09_w1_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 5.25,
              "interval": 1.25
            },
            {
              "id": "mission_09_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.5,
              "interval": 1.25
            },
            {
              "id": "mission_09_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_09_wave_2",
          "groups": [
            {
              "id": "mission_09_w2_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_09_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_09_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_09_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.9,
              "interval": 1.25
            },
            {
              "id": "mission_09_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.15,
              "interval": 1.25
            },
            {
              "id": "mission_09_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.9,
              "interval": 1.25
            },
            {
              "id": "mission_09_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.55,
              "interval": 1.25
            },
            {
              "id": "mission_09_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.8,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_09_wave_3",
          "groups": [
            {
              "id": "mission_09_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_09_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_09_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_09_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.55,
              "interval": 1.25
            },
            {
              "id": "mission_09_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.8,
              "interval": 1.25
            },
            {
              "id": "mission_09_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.55,
              "interval": 1.25
            },
            {
              "id": "mission_09_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.85,
              "interval": 1.25
            },
            {
              "id": "mission_09_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.1,
              "interval": 1.25
            },
            {
              "id": "mission_09_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.85,
              "interval": 1.25
            },
            {
              "id": "mission_09_w3_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.15,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_10",
      "title": "Les trous sur le plan",
      "subtitle": "Les canaux de Papyrus",
      "act": 1,
      "location": "Les canaux de Papyrus",
      "startingEnergy": 625,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle",
        "acacia",
        "papyrus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Rouvrez le circuit d'eau en défendant ses deux postes.",
      "tip": "L'eau revient pendant les vagues avec une défense vivante. Papyrus soigne à proximité et accélère l'opération depuis n'importe quelle parcelle.",
      "waves": [
        {
          "id": "mission_10_wave_1",
          "groups": [
            {
              "id": "mission_10_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_10_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_10_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_10_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.25,
              "interval": 1.25
            },
            {
              "id": "mission_10_w1_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.5,
              "interval": 1.25
            },
            {
              "id": "mission_10_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_10_wave_2",
          "groups": [
            {
              "id": "mission_10_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_10_w2_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_10_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_10_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.9,
              "interval": 1.25
            },
            {
              "id": "mission_10_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.15,
              "interval": 1.25
            },
            {
              "id": "mission_10_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.9,
              "interval": 1.25
            },
            {
              "id": "mission_10_w2_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 9.55,
              "interval": 1.25
            },
            {
              "id": "mission_10_w2_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.8,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_10_wave_3",
          "groups": [
            {
              "id": "mission_10_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_10_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_10_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_10_w3_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.55,
              "interval": 1.25
            },
            {
              "id": "mission_10_w3_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.8,
              "interval": 1.25
            },
            {
              "id": "mission_10_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.55,
              "interval": 1.25
            },
            {
              "id": "mission_10_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.85,
              "interval": 1.25
            },
            {
              "id": "mission_10_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.1,
              "interval": 1.25
            },
            {
              "id": "mission_10_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.85,
              "interval": 1.25
            },
            {
              "id": "mission_10_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.15,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_11",
      "title": "Une histoire jusqu'aux secours",
      "subtitle": "Le jardin de Baobab",
      "act": 1,
      "location": "Le jardin de Baobab",
      "startingEnergy": 640,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle",
        "acacia",
        "baobab",
        "papyrus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Escortez les jeunes pousses vers la pépinière.",
      "tip": "Baobab tient longtemps au contact. Soutenez-le avec des attaquants pour protéger le jardin pendant l'escorte.",
      "waves": [
        {
          "id": "mission_11_wave_1",
          "groups": [
            {
              "id": "mission_11_w1_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_11_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_11_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_11_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.25,
              "interval": 1.25
            },
            {
              "id": "mission_11_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.5,
              "interval": 1.25
            },
            {
              "id": "mission_11_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_11_wave_2",
          "groups": [
            {
              "id": "mission_11_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_11_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_11_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_11_w2_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.9,
              "interval": 1.25
            },
            {
              "id": "mission_11_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.15,
              "interval": 1.25
            },
            {
              "id": "mission_11_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.9,
              "interval": 1.25
            },
            {
              "id": "mission_11_w2_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 9.55,
              "interval": 1.25
            },
            {
              "id": "mission_11_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.8,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_11_wave_3",
          "groups": [
            {
              "id": "mission_11_w3_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_11_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_11_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_11_w3_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.55,
              "interval": 1.25
            },
            {
              "id": "mission_11_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.8,
              "interval": 1.25
            },
            {
              "id": "mission_11_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.55,
              "interval": 1.25
            },
            {
              "id": "mission_11_w3_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.85,
              "interval": 1.25
            },
            {
              "id": "mission_11_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.1,
              "interval": 1.25
            },
            {
              "id": "mission_11_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.85,
              "interval": 1.25
            },
            {
              "id": "mission_11_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.15,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_12",
      "title": "Ceux qui cachent leurs blessures",
      "subtitle": "Le dispensaire d'Aloès",
      "act": 1,
      "location": "Le dispensaire d'Aloès",
      "startingEnergy": 650,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle",
        "acacia",
        "baobab",
        "aloe",
        "papyrus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez le jardin de soins pendant l'arrivée des patrouilles.",
      "tip": "Aloès soigne les plantes voisines. Placez-la à l'abri, près d'un défenseur ou d'un groupe d'attaquants.",
      "waves": [
        {
          "id": "mission_12_wave_1",
          "groups": [
            {
              "id": "mission_12_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_12_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_12_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_12_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.25,
              "interval": 1.25
            },
            {
              "id": "mission_12_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.5,
              "interval": 1.25
            },
            {
              "id": "mission_12_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_12_w1_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 10.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_12_wave_2",
          "groups": [
            {
              "id": "mission_12_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_12_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_12_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_12_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.9,
              "interval": 1.25
            },
            {
              "id": "mission_12_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.15,
              "interval": 1.25
            },
            {
              "id": "mission_12_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.9,
              "interval": 1.25
            },
            {
              "id": "mission_12_w2_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 9.55,
              "interval": 1.25
            },
            {
              "id": "mission_12_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.8,
              "interval": 1.25
            },
            {
              "id": "mission_12_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_12_wave_3",
          "groups": [
            {
              "id": "mission_12_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_12_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_12_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_12_w3_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.55,
              "interval": 1.25
            },
            {
              "id": "mission_12_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.8,
              "interval": 1.25
            },
            {
              "id": "mission_12_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.55,
              "interval": 1.25
            },
            {
              "id": "mission_12_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.85,
              "interval": 1.25
            },
            {
              "id": "mission_12_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.1,
              "interval": 1.25
            },
            {
              "id": "mission_12_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.85,
              "interval": 1.25
            },
            {
              "id": "mission_12_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.15,
              "interval": 1.25
            },
            {
              "id": "mission_12_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 14.4,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_13",
      "title": "Un jardin pour se parler",
      "subtitle": "Le rassemblement d'Hibiscus",
      "act": 1,
      "location": "Le rassemblement d'Hibiscus",
      "startingEnergy": 665,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle",
        "acacia",
        "baobab",
        "aloe",
        "papyrus",
        "hibiscus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Défendez le lieu de rencontre des jardins voisins.",
      "tip": "Hibiscus renforce les plantes proches. Une défense répartie protège les cinq allées.",
      "waves": [
        {
          "id": "mission_13_wave_1",
          "groups": [
            {
              "id": "mission_13_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_13_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_13_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_13_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.25,
              "interval": 1.25
            },
            {
              "id": "mission_13_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.5,
              "interval": 1.25
            },
            {
              "id": "mission_13_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_13_w1_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 10.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_13_wave_2",
          "groups": [
            {
              "id": "mission_13_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_13_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_13_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_13_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.9,
              "interval": 1.25
            },
            {
              "id": "mission_13_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.15,
              "interval": 1.25
            },
            {
              "id": "mission_13_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.9,
              "interval": 1.25
            },
            {
              "id": "mission_13_w2_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 9.55,
              "interval": 1.25
            },
            {
              "id": "mission_13_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.8,
              "interval": 1.25
            },
            {
              "id": "mission_13_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_13_wave_3",
          "groups": [
            {
              "id": "mission_13_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_13_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_13_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_13_w3_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.55,
              "interval": 1.25
            },
            {
              "id": "mission_13_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.8,
              "interval": 1.25
            },
            {
              "id": "mission_13_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.55,
              "interval": 1.25
            },
            {
              "id": "mission_13_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.85,
              "interval": 1.25
            },
            {
              "id": "mission_13_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.1,
              "interval": 1.25
            },
            {
              "id": "mission_13_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.85,
              "interval": 1.25
            },
            {
              "id": "mission_13_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.15,
              "interval": 1.25
            },
            {
              "id": "mission_13_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 14.4,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_14",
      "title": "La cendre blanche",
      "subtitle": "Les cuves abandonnées",
      "act": 1,
      "location": "Les cuves abandonnées",
      "startingEnergy": 675,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle",
        "acacia",
        "baobab",
        "aloe",
        "papyrus",
        "hibiscus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez les postes qui isolent les réserves toxiques.",
      "tip": "Gardez une défense vivante pendant les vagues jusqu'à la fin du confinement, suivi dans la jauge de mission.",
      "waves": [
        {
          "id": "mission_14_wave_1",
          "groups": [
            {
              "id": "mission_14_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_14_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_14_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_14_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.25,
              "interval": 1.25
            },
            {
              "id": "mission_14_w1_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.5,
              "interval": 1.25
            },
            {
              "id": "mission_14_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_14_w1_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 10.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_14_wave_2",
          "groups": [
            {
              "id": "mission_14_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_14_w2_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_14_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_14_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.9,
              "interval": 1.25
            },
            {
              "id": "mission_14_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.15,
              "interval": 1.25
            },
            {
              "id": "mission_14_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.9,
              "interval": 1.25
            },
            {
              "id": "mission_14_w2_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 9.55,
              "interval": 1.25
            },
            {
              "id": "mission_14_w2_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.8,
              "interval": 1.25
            },
            {
              "id": "mission_14_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_14_wave_3",
          "groups": [
            {
              "id": "mission_14_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_14_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_14_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_14_w3_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.55,
              "interval": 1.25
            },
            {
              "id": "mission_14_w3_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.8,
              "interval": 1.25
            },
            {
              "id": "mission_14_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.55,
              "interval": 1.25
            },
            {
              "id": "mission_14_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.85,
              "interval": 1.25
            },
            {
              "id": "mission_14_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.1,
              "interval": 1.25
            },
            {
              "id": "mission_14_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.85,
              "interval": 1.25
            },
            {
              "id": "mission_14_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.15,
              "interval": 1.25
            },
            {
              "id": "mission_14_w3_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 14.4,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_15",
      "title": "Bassin après bassin",
      "subtitle": "La remise en eau",
      "act": 1,
      "location": "La remise en eau",
      "startingEnergy": 700,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle",
        "acacia",
        "baobab",
        "aloe",
        "papyrus",
        "hibiscus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Faites progresser l'eau tout en repoussant les vagues.",
      "tip": "Les plantes vivantes font avancer l'ouverture des canaux pendant les vagues. Toutes les parcelles vides sont disponibles.",
      "waves": [
        {
          "id": "mission_15_wave_1",
          "groups": [
            {
              "id": "mission_15_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_15_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_15_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_15_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.25,
              "interval": 1.25
            },
            {
              "id": "mission_15_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.5,
              "interval": 1.25
            },
            {
              "id": "mission_15_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_15_w1_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 10.25,
              "interval": 1.25
            },
            {
              "id": "mission_15_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.5,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_15_wave_2",
          "groups": [
            {
              "id": "mission_15_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_15_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_15_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_15_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.9,
              "interval": 1.25
            },
            {
              "id": "mission_15_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.15,
              "interval": 1.25
            },
            {
              "id": "mission_15_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.9,
              "interval": 1.25
            },
            {
              "id": "mission_15_w2_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 9.55,
              "interval": 1.25
            },
            {
              "id": "mission_15_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.8,
              "interval": 1.25
            },
            {
              "id": "mission_15_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            },
            {
              "id": "mission_15_w2_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 14.2,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_15_wave_3",
          "groups": [
            {
              "id": "mission_15_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_15_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_15_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_15_w3_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.55,
              "interval": 1.25
            },
            {
              "id": "mission_15_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.8,
              "interval": 1.25
            },
            {
              "id": "mission_15_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.55,
              "interval": 1.25
            },
            {
              "id": "mission_15_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.85,
              "interval": 1.25
            },
            {
              "id": "mission_15_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.1,
              "interval": 1.25
            },
            {
              "id": "mission_15_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.85,
              "interval": 1.25
            },
            {
              "id": "mission_15_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.15,
              "interval": 1.25
            },
            {
              "id": "mission_15_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 14.4,
              "interval": 1.25
            },
            {
              "id": "mission_15_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 16.15,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_16",
      "title": "L'Assoiffeur",
      "subtitle": "Le fleuve reprend son chemin",
      "act": 1,
      "location": "Le fleuve reprend son chemin",
      "startingEnergy": 725,
      "allowedPlants": [
        "radish",
        "rose",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle",
        "acacia",
        "baobab",
        "aloe",
        "papyrus",
        "hibiscus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Tenez les canaux et neutralisez l'Assoiffeur.",
      "tip": "Protégez le jardin pendant la remise en eau et préparez une défense capable de résister aux attaques du boss.",
      "waves": [
        {
          "id": "mission_16_wave_1",
          "groups": [
            {
              "id": "mission_16_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_16_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.5,
              "interval": 1.25
            },
            {
              "id": "mission_16_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w1_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 10.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.5,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_16_wave_2",
          "groups": [
            {
              "id": "mission_16_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_16_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.9,
              "interval": 1.25
            },
            {
              "id": "mission_16_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.15,
              "interval": 1.25
            },
            {
              "id": "mission_16_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.9,
              "interval": 1.25
            },
            {
              "id": "mission_16_w2_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 9.55,
              "interval": 1.25
            },
            {
              "id": "mission_16_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.8,
              "interval": 1.25
            },
            {
              "id": "mission_16_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            },
            {
              "id": "mission_16_w2_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 14.2,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_16_wave_3",
          "groups": [
            {
              "id": "mission_16_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_16_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w3_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.55,
              "interval": 1.25
            },
            {
              "id": "mission_16_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.8,
              "interval": 1.25
            },
            {
              "id": "mission_16_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.55,
              "interval": 1.25
            },
            {
              "id": "mission_16_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.85,
              "interval": 1.25
            },
            {
              "id": "mission_16_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.1,
              "interval": 1.25
            },
            {
              "id": "mission_16_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.85,
              "interval": 1.25
            },
            {
              "id": "mission_16_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.15,
              "interval": 1.25
            },
            {
              "id": "mission_16_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 14.4,
              "interval": 1.25
            },
            {
              "id": "mission_16_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 16.15,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_16_wave_4",
          "groups": [
            {
              "id": "mission_16_w4_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g13",
              "enemyId": "pump",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_16_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_17",
      "title": "Un parfum derrière la fumée",
      "subtitle": "Le toit de Mei · rencontre avec Lavande",
      "act": 2,
      "location": "Le toit de Mei",
      "startingEnergy": 690,
      "allowedPlants": [
        "radish",
        "rose",
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
        "lavender"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez le refuge et son évacuation sous la fumée.",
      "tip": "L'évacuation avance pendant les vagues, sans case bloquée par la fumée. Lavande couvre plusieurs allées ; protégez-la.",
      "waves": [
        {
          "id": "mission_17_wave_1",
          "groups": [
            {
              "id": "mission_17_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_17_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.15,
              "interval": 1.25
            },
            {
              "id": "mission_17_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.4,
              "interval": 1.25
            },
            {
              "id": "mission_17_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.15,
              "interval": 1.25
            },
            {
              "id": "mission_17_w1_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 10.05,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_17_wave_2",
          "groups": [
            {
              "id": "mission_17_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_17_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.8,
              "interval": 1.25
            },
            {
              "id": "mission_17_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.05,
              "interval": 1.25
            },
            {
              "id": "mission_17_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.8,
              "interval": 1.25
            },
            {
              "id": "mission_17_w2_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 9.35,
              "interval": 1.25
            },
            {
              "id": "mission_17_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.6,
              "interval": 1.25
            },
            {
              "id": "mission_17_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.35,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_17_wave_3",
          "groups": [
            {
              "id": "mission_17_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_17_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w3_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.45,
              "interval": 1.25
            },
            {
              "id": "mission_17_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.7,
              "interval": 1.25
            },
            {
              "id": "mission_17_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.45,
              "interval": 1.25
            },
            {
              "id": "mission_17_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.65,
              "interval": 1.25
            },
            {
              "id": "mission_17_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.9,
              "interval": 1.25
            },
            {
              "id": "mission_17_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.65,
              "interval": 1.25
            },
            {
              "id": "mission_17_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.85,
              "interval": 1.25
            },
            {
              "id": "mission_17_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 14.1,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_17_wave_4",
          "groups": [
            {
              "id": "mission_17_w4_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_17_w4_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_18",
      "title": "Le plan et la rambarde",
      "subtitle": "La terrasse de Bambou",
      "act": 2,
      "location": "La terrasse de Bambou",
      "startingEnergy": 710,
      "allowedPlants": [
        "radish",
        "rose",
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
        "bamboo"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez la réparation des nouveaux chemins de repli.",
      "tip": "Les travaux avancent grâce aux plantes vivantes, quelle que soit leur position. Bambou frappe les pollueurs protégés à longue portée.",
      "waves": [
        {
          "id": "mission_18_wave_1",
          "groups": [
            {
              "id": "mission_18_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_18_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.15,
              "interval": 1.25
            },
            {
              "id": "mission_18_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.4,
              "interval": 1.25
            },
            {
              "id": "mission_18_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.15,
              "interval": 1.25
            },
            {
              "id": "mission_18_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 10.05,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_18_wave_2",
          "groups": [
            {
              "id": "mission_18_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_18_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.8,
              "interval": 1.25
            },
            {
              "id": "mission_18_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.05,
              "interval": 1.25
            },
            {
              "id": "mission_18_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.8,
              "interval": 1.25
            },
            {
              "id": "mission_18_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.35,
              "interval": 1.25
            },
            {
              "id": "mission_18_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.6,
              "interval": 1.25
            },
            {
              "id": "mission_18_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.35,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_18_wave_3",
          "groups": [
            {
              "id": "mission_18_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_18_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.45,
              "interval": 1.25
            },
            {
              "id": "mission_18_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.7,
              "interval": 1.25
            },
            {
              "id": "mission_18_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.45,
              "interval": 1.25
            },
            {
              "id": "mission_18_w3_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.65,
              "interval": 1.25
            },
            {
              "id": "mission_18_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.9,
              "interval": 1.25
            },
            {
              "id": "mission_18_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.65,
              "interval": 1.25
            },
            {
              "id": "mission_18_w3_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.85,
              "interval": 1.25
            },
            {
              "id": "mission_18_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 14.1,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_18_wave_4",
          "groups": [
            {
              "id": "mission_18_w4_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_18_w4_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_19",
      "title": "La dernière feuille du bassin",
      "subtitle": "Le refuge de Lotus",
      "act": 2,
      "location": "Le refuge de Lotus",
      "startingEnergy": 725,
      "allowedPlants": [
        "radish",
        "rose",
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
        "lotus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Rétablissez le circuit d'eau avant de quitter le bassin.",
      "tip": "Protégez le jardin pendant les travaux hydrauliques. Lotus soigne largement ; gardez assez d'attaquants pour arrêter les vagues.",
      "waves": [
        {
          "id": "mission_19_wave_1",
          "groups": [
            {
              "id": "mission_19_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_19_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.15,
              "interval": 1.25
            },
            {
              "id": "mission_19_w1_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.4,
              "interval": 1.25
            },
            {
              "id": "mission_19_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.15,
              "interval": 1.25
            },
            {
              "id": "mission_19_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 10.05,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_19_wave_2",
          "groups": [
            {
              "id": "mission_19_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w2_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_19_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.8,
              "interval": 1.25
            },
            {
              "id": "mission_19_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.05,
              "interval": 1.25
            },
            {
              "id": "mission_19_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.8,
              "interval": 1.25
            },
            {
              "id": "mission_19_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.35,
              "interval": 1.25
            },
            {
              "id": "mission_19_w2_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.6,
              "interval": 1.25
            },
            {
              "id": "mission_19_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.35,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_19_wave_3",
          "groups": [
            {
              "id": "mission_19_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_19_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.45,
              "interval": 1.25
            },
            {
              "id": "mission_19_w3_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.7,
              "interval": 1.25
            },
            {
              "id": "mission_19_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.45,
              "interval": 1.25
            },
            {
              "id": "mission_19_w3_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.65,
              "interval": 1.25
            },
            {
              "id": "mission_19_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.9,
              "interval": 1.25
            },
            {
              "id": "mission_19_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.65,
              "interval": 1.25
            },
            {
              "id": "mission_19_w3_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.85,
              "interval": 1.25
            },
            {
              "id": "mission_19_w3_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 14.1,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_19_wave_4",
          "groups": [
            {
              "id": "mission_19_w4_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_19_w4_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_20",
      "title": "Attendre le bon moment",
      "subtitle": "Les raids de Gingembre",
      "act": 2,
      "location": "Les raids de Gingembre",
      "startingEnergy": 740,
      "allowedPlants": [
        "radish",
        "rose",
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
        "ginger"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Repoussez les patrouilles qui poursuivent Gingembre.",
      "tip": "Gingembre frappe les groupes proches. Protégez-le pendant qu'il recharge ses attaques.",
      "waves": [
        {
          "id": "mission_20_wave_1",
          "groups": [
            {
              "id": "mission_20_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_20_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.15,
              "interval": 1.25
            },
            {
              "id": "mission_20_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.4,
              "interval": 1.25
            },
            {
              "id": "mission_20_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.15,
              "interval": 1.25
            },
            {
              "id": "mission_20_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 10.05,
              "interval": 1.25
            },
            {
              "id": "mission_20_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.3,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_20_wave_2",
          "groups": [
            {
              "id": "mission_20_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_20_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.8,
              "interval": 1.25
            },
            {
              "id": "mission_20_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.05,
              "interval": 1.25
            },
            {
              "id": "mission_20_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.8,
              "interval": 1.25
            },
            {
              "id": "mission_20_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.35,
              "interval": 1.25
            },
            {
              "id": "mission_20_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.6,
              "interval": 1.25
            },
            {
              "id": "mission_20_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.35,
              "interval": 1.25
            },
            {
              "id": "mission_20_w2_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.9,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_20_wave_3",
          "groups": [
            {
              "id": "mission_20_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_20_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.45,
              "interval": 1.25
            },
            {
              "id": "mission_20_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.7,
              "interval": 1.25
            },
            {
              "id": "mission_20_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.45,
              "interval": 1.25
            },
            {
              "id": "mission_20_w3_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.65,
              "interval": 1.25
            },
            {
              "id": "mission_20_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.9,
              "interval": 1.25
            },
            {
              "id": "mission_20_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.65,
              "interval": 1.25
            },
            {
              "id": "mission_20_w3_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.85,
              "interval": 1.25
            },
            {
              "id": "mission_20_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 14.1,
              "interval": 1.25
            },
            {
              "id": "mission_20_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_20_wave_4",
          "groups": [
            {
              "id": "mission_20_w4_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_20_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_21",
      "title": "La passerelle blanche",
      "subtitle": "Le choix de Rose",
      "act": 2,
      "location": "Le choix de Rose",
      "startingEnergy": 760,
      "allowedPlants": [
        "radish",
        "rose",
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
        "ginger"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Tenez le refuge pendant que la fumée coupe les passages.",
      "tip": "Protégez le jardin pendant l'évacuation, suivie dans la jauge. Pour cette mission, les épines de Rose sont renforcées.",
      "waves": [
        {
          "id": "mission_21_wave_1",
          "groups": [
            {
              "id": "mission_21_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_21_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.15,
              "interval": 1.25
            },
            {
              "id": "mission_21_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.4,
              "interval": 1.25
            },
            {
              "id": "mission_21_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.15,
              "interval": 1.25
            },
            {
              "id": "mission_21_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 10.05,
              "interval": 1.25
            },
            {
              "id": "mission_21_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.3,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_21_wave_2",
          "groups": [
            {
              "id": "mission_21_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_21_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.8,
              "interval": 1.25
            },
            {
              "id": "mission_21_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.05,
              "interval": 1.25
            },
            {
              "id": "mission_21_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.8,
              "interval": 1.25
            },
            {
              "id": "mission_21_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.35,
              "interval": 1.25
            },
            {
              "id": "mission_21_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.6,
              "interval": 1.25
            },
            {
              "id": "mission_21_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.35,
              "interval": 1.25
            },
            {
              "id": "mission_21_w2_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.9,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_21_wave_3",
          "groups": [
            {
              "id": "mission_21_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_21_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.45,
              "interval": 1.25
            },
            {
              "id": "mission_21_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.7,
              "interval": 1.25
            },
            {
              "id": "mission_21_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.45,
              "interval": 1.25
            },
            {
              "id": "mission_21_w3_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.65,
              "interval": 1.25
            },
            {
              "id": "mission_21_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.9,
              "interval": 1.25
            },
            {
              "id": "mission_21_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.65,
              "interval": 1.25
            },
            {
              "id": "mission_21_w3_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.85,
              "interval": 1.25
            },
            {
              "id": "mission_21_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 14.1,
              "interval": 1.25
            },
            {
              "id": "mission_21_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_21_wave_4",
          "groups": [
            {
              "id": "mission_21_w4_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_21_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_22",
      "title": "La place laissée vide",
      "subtitle": "Les signaux de Chrysanthème",
      "act": 2,
      "location": "Les signaux de Chrysanthème",
      "startingEnergy": 740,
      "allowedPlants": [
        "radish",
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
        "chrysanthemum"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez les relais entre les jardins et les abris.",
      "tip": "Rose est partie. Composez une nouvelle équipe ; Chrysanthème affaiblit les protections ennemies.",
      "waves": [
        {
          "id": "mission_22_wave_1",
          "groups": [
            {
              "id": "mission_22_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_22_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w1_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 5.15,
              "interval": 1.25
            },
            {
              "id": "mission_22_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.4,
              "interval": 1.25
            },
            {
              "id": "mission_22_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.15,
              "interval": 1.25
            },
            {
              "id": "mission_22_w1_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 10.05,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_22_wave_2",
          "groups": [
            {
              "id": "mission_22_w2_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_22_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.8,
              "interval": 1.25
            },
            {
              "id": "mission_22_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.05,
              "interval": 1.25
            },
            {
              "id": "mission_22_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.8,
              "interval": 1.25
            },
            {
              "id": "mission_22_w2_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 9.35,
              "interval": 1.25
            },
            {
              "id": "mission_22_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.6,
              "interval": 1.25
            },
            {
              "id": "mission_22_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.35,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_22_wave_3",
          "groups": [
            {
              "id": "mission_22_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_22_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w3_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.45,
              "interval": 1.25
            },
            {
              "id": "mission_22_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.7,
              "interval": 1.25
            },
            {
              "id": "mission_22_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.45,
              "interval": 1.25
            },
            {
              "id": "mission_22_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.65,
              "interval": 1.25
            },
            {
              "id": "mission_22_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.9,
              "interval": 1.25
            },
            {
              "id": "mission_22_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.65,
              "interval": 1.25
            },
            {
              "id": "mission_22_w3_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.85,
              "interval": 1.25
            },
            {
              "id": "mission_22_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 14.1,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_22_wave_4",
          "groups": [
            {
              "id": "mission_22_w4_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_22_w4_g13",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_23",
      "title": "Fermer les arrivées",
      "subtitle": "Les ateliers reliés",
      "act": 2,
      "location": "Les ateliers reliés",
      "startingEnergy": 770,
      "allowedPlants": [
        "radish",
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
        "chrysanthemum"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez les équipes qui coupent les alimentations.",
      "tip": "Protégez le jardin pendant les deux chantiers, suivis hors du plateau. Un soutien seul ne remplace pas les attaquants.",
      "waves": [
        {
          "id": "mission_23_wave_1",
          "groups": [
            {
              "id": "mission_23_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_23_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.15,
              "interval": 1.25
            },
            {
              "id": "mission_23_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.4,
              "interval": 1.25
            },
            {
              "id": "mission_23_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.15,
              "interval": 1.25
            },
            {
              "id": "mission_23_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 10.05,
              "interval": 1.25
            },
            {
              "id": "mission_23_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.3,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_23_wave_2",
          "groups": [
            {
              "id": "mission_23_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_23_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.8,
              "interval": 1.25
            },
            {
              "id": "mission_23_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.05,
              "interval": 1.25
            },
            {
              "id": "mission_23_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.8,
              "interval": 1.25
            },
            {
              "id": "mission_23_w2_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 9.35,
              "interval": 1.25
            },
            {
              "id": "mission_23_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.6,
              "interval": 1.25
            },
            {
              "id": "mission_23_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.35,
              "interval": 1.25
            },
            {
              "id": "mission_23_w2_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.9,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_23_wave_3",
          "groups": [
            {
              "id": "mission_23_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_23_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w3_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.45,
              "interval": 1.25
            },
            {
              "id": "mission_23_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.7,
              "interval": 1.25
            },
            {
              "id": "mission_23_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.45,
              "interval": 1.25
            },
            {
              "id": "mission_23_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.65,
              "interval": 1.25
            },
            {
              "id": "mission_23_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.9,
              "interval": 1.25
            },
            {
              "id": "mission_23_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.65,
              "interval": 1.25
            },
            {
              "id": "mission_23_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.85,
              "interval": 1.25
            },
            {
              "id": "mission_23_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 14.1,
              "interval": 1.25
            },
            {
              "id": "mission_23_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_23_wave_4",
          "groups": [
            {
              "id": "mission_23_w4_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g13",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_23_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_24",
      "title": "Mille-Gueules",
      "subtitle": "L'atelier qui n'en finit pas",
      "act": 2,
      "location": "L'atelier qui n'en finit pas",
      "startingEnergy": 790,
      "allowedPlants": [
        "radish",
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
        "chrysanthemum"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez le refuge et stoppez le noyau de Mille-Gueules.",
      "tip": "La colonie produit des renforts. Gardez des moyens de traiter les groupes et les pollueurs protégés.",
      "waves": [
        {
          "id": "mission_24_wave_1",
          "groups": [
            {
              "id": "mission_24_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_24_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.15,
              "interval": 1.25
            },
            {
              "id": "mission_24_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.4,
              "interval": 1.25
            },
            {
              "id": "mission_24_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.15,
              "interval": 1.25
            },
            {
              "id": "mission_24_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 10.05,
              "interval": 1.25
            },
            {
              "id": "mission_24_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.3,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_24_wave_2",
          "groups": [
            {
              "id": "mission_24_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_24_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.8,
              "interval": 1.25
            },
            {
              "id": "mission_24_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.05,
              "interval": 1.25
            },
            {
              "id": "mission_24_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.8,
              "interval": 1.25
            },
            {
              "id": "mission_24_w2_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 9.35,
              "interval": 1.25
            },
            {
              "id": "mission_24_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.6,
              "interval": 1.25
            },
            {
              "id": "mission_24_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.35,
              "interval": 1.25
            },
            {
              "id": "mission_24_w2_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.9,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_24_wave_3",
          "groups": [
            {
              "id": "mission_24_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_24_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w3_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.45,
              "interval": 1.25
            },
            {
              "id": "mission_24_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.7,
              "interval": 1.25
            },
            {
              "id": "mission_24_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.45,
              "interval": 1.25
            },
            {
              "id": "mission_24_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.65,
              "interval": 1.25
            },
            {
              "id": "mission_24_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.9,
              "interval": 1.25
            },
            {
              "id": "mission_24_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.65,
              "interval": 1.25
            },
            {
              "id": "mission_24_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.85,
              "interval": 1.25
            },
            {
              "id": "mission_24_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 14.1,
              "interval": 1.25
            },
            {
              "id": "mission_24_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_24_wave_4",
          "groups": [
            {
              "id": "mission_24_w4_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g13",
              "enemyId": "factory",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_24_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_25",
      "title": "Des racines dans la marée",
      "subtitle": "Les berges de Palétuvier",
      "act": 3,
      "location": "Les berges de Palétuvier",
      "startingEnergy": 760,
      "allowedPlants": [
        "radish",
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
        "mangrove"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez le refuge pendant les changements de marée.",
      "tip": "Le refuge se prépare hors du plateau pendant les vagues. La marée ne réserve aucune parcelle ; répartissez vos défenses.",
      "waves": [
        {
          "id": "mission_25_wave_1",
          "groups": [
            {
              "id": "mission_25_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_25_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.05,
              "interval": 1.25
            },
            {
              "id": "mission_25_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.3,
              "interval": 1.25
            },
            {
              "id": "mission_25_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.05,
              "interval": 1.25
            },
            {
              "id": "mission_25_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 9.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_25_wave_2",
          "groups": [
            {
              "id": "mission_25_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_25_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.7,
              "interval": 1.25
            },
            {
              "id": "mission_25_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.95,
              "interval": 1.25
            },
            {
              "id": "mission_25_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.7,
              "interval": 1.25
            },
            {
              "id": "mission_25_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.15,
              "interval": 1.25
            },
            {
              "id": "mission_25_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.4,
              "interval": 1.25
            },
            {
              "id": "mission_25_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.15,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_25_wave_3",
          "groups": [
            {
              "id": "mission_25_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_25_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.35,
              "interval": 1.25
            },
            {
              "id": "mission_25_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.6,
              "interval": 1.25
            },
            {
              "id": "mission_25_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.35,
              "interval": 1.25
            },
            {
              "id": "mission_25_w3_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.45,
              "interval": 1.25
            },
            {
              "id": "mission_25_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.7,
              "interval": 1.25
            },
            {
              "id": "mission_25_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.45,
              "interval": 1.25
            },
            {
              "id": "mission_25_w3_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            },
            {
              "id": "mission_25_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.8,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_25_wave_4",
          "groups": [
            {
              "id": "mission_25_w4_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_25_w4_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_26",
      "title": "Ce qui tient vraiment",
      "subtitle": "L'atelier de Pandanus",
      "act": 3,
      "location": "L'atelier de Pandanus",
      "startingEnergy": 780,
      "allowedPlants": [
        "radish",
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
        "pandanus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Défendez les travaux du jardin flottant.",
      "tip": "Protégez le jardin pendant les travaux. Pandanus soigne à proximité et accélère l'opération depuis n'importe quelle parcelle.",
      "waves": [
        {
          "id": "mission_26_wave_1",
          "groups": [
            {
              "id": "mission_26_w1_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_26_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w1_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 5.05,
              "interval": 1.25
            },
            {
              "id": "mission_26_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.3,
              "interval": 1.25
            },
            {
              "id": "mission_26_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.05,
              "interval": 1.25
            },
            {
              "id": "mission_26_w1_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 9.85,
              "interval": 1.25
            },
            {
              "id": "mission_26_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.1,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_26_wave_2",
          "groups": [
            {
              "id": "mission_26_w2_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_26_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w2_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.7,
              "interval": 1.25
            },
            {
              "id": "mission_26_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.95,
              "interval": 1.25
            },
            {
              "id": "mission_26_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.7,
              "interval": 1.25
            },
            {
              "id": "mission_26_w2_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 9.15,
              "interval": 1.25
            },
            {
              "id": "mission_26_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.4,
              "interval": 1.25
            },
            {
              "id": "mission_26_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.15,
              "interval": 1.25
            },
            {
              "id": "mission_26_w2_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.6,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_26_wave_3",
          "groups": [
            {
              "id": "mission_26_w3_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_26_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w3_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.35,
              "interval": 1.25
            },
            {
              "id": "mission_26_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.6,
              "interval": 1.25
            },
            {
              "id": "mission_26_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.35,
              "interval": 1.25
            },
            {
              "id": "mission_26_w3_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.45,
              "interval": 1.25
            },
            {
              "id": "mission_26_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.7,
              "interval": 1.25
            },
            {
              "id": "mission_26_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.45,
              "interval": 1.25
            },
            {
              "id": "mission_26_w3_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            },
            {
              "id": "mission_26_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.8,
              "interval": 1.25
            },
            {
              "id": "mission_26_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_26_wave_4",
          "groups": [
            {
              "id": "mission_26_w4_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g13",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_26_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_27",
      "title": "Le navigateur et la vague",
      "subtitle": "La vigie de Cocotier",
      "act": 3,
      "location": "La vigie de Cocotier",
      "startingEnergy": 800,
      "allowedPlants": [
        "radish",
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
        "pandanus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Gardez le refuge côtier en sécurité pendant les marées.",
      "tip": "Cocotier tire loin et fort, mais lentement. Prévoyez une réponse aux canettes rapides.",
      "waves": [
        {
          "id": "mission_27_wave_1",
          "groups": [
            {
              "id": "mission_27_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_27_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w1_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 5.05,
              "interval": 1.25
            },
            {
              "id": "mission_27_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.3,
              "interval": 1.25
            },
            {
              "id": "mission_27_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.05,
              "interval": 1.25
            },
            {
              "id": "mission_27_w1_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.85,
              "interval": 1.25
            },
            {
              "id": "mission_27_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.1,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_27_wave_2",
          "groups": [
            {
              "id": "mission_27_w2_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_27_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w2_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.7,
              "interval": 1.25
            },
            {
              "id": "mission_27_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.95,
              "interval": 1.25
            },
            {
              "id": "mission_27_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.7,
              "interval": 1.25
            },
            {
              "id": "mission_27_w2_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 9.15,
              "interval": 1.25
            },
            {
              "id": "mission_27_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.4,
              "interval": 1.25
            },
            {
              "id": "mission_27_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.15,
              "interval": 1.25
            },
            {
              "id": "mission_27_w2_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.6,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_27_wave_3",
          "groups": [
            {
              "id": "mission_27_w3_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_27_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w3_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.35,
              "interval": 1.25
            },
            {
              "id": "mission_27_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.6,
              "interval": 1.25
            },
            {
              "id": "mission_27_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.35,
              "interval": 1.25
            },
            {
              "id": "mission_27_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.45,
              "interval": 1.25
            },
            {
              "id": "mission_27_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.7,
              "interval": 1.25
            },
            {
              "id": "mission_27_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.45,
              "interval": 1.25
            },
            {
              "id": "mission_27_w3_g10",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            },
            {
              "id": "mission_27_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.8,
              "interval": 1.25
            },
            {
              "id": "mission_27_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_27_wave_4",
          "groups": [
            {
              "id": "mission_27_w4_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g13",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_27_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_28",
      "title": "Revenir avec les autres",
      "subtitle": "Le terrain d'Eucalyptus",
      "act": 3,
      "location": "Le terrain d'Eucalyptus",
      "startingEnergy": 810,
      "allowedPlants": [
        "radish",
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
        "eucalyptus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Escortez les jeunes pousses jusqu'aux abris côtiers.",
      "tip": "Protégez le jardin pendant l'escorte, suivie dans la jauge de mission. Eucalyptus frappe une large zone ; surveillez les attaques isolées.",
      "waves": [
        {
          "id": "mission_28_wave_1",
          "groups": [
            {
              "id": "mission_28_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_28_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.05,
              "interval": 1.25
            },
            {
              "id": "mission_28_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.3,
              "interval": 1.25
            },
            {
              "id": "mission_28_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.05,
              "interval": 1.25
            },
            {
              "id": "mission_28_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 9.85,
              "interval": 1.25
            },
            {
              "id": "mission_28_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.1,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_28_wave_2",
          "groups": [
            {
              "id": "mission_28_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_28_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.7,
              "interval": 1.25
            },
            {
              "id": "mission_28_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.95,
              "interval": 1.25
            },
            {
              "id": "mission_28_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.7,
              "interval": 1.25
            },
            {
              "id": "mission_28_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.15,
              "interval": 1.25
            },
            {
              "id": "mission_28_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.4,
              "interval": 1.25
            },
            {
              "id": "mission_28_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.15,
              "interval": 1.25
            },
            {
              "id": "mission_28_w2_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.6,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_28_wave_3",
          "groups": [
            {
              "id": "mission_28_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_28_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.35,
              "interval": 1.25
            },
            {
              "id": "mission_28_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.6,
              "interval": 1.25
            },
            {
              "id": "mission_28_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.35,
              "interval": 1.25
            },
            {
              "id": "mission_28_w3_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.45,
              "interval": 1.25
            },
            {
              "id": "mission_28_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.7,
              "interval": 1.25
            },
            {
              "id": "mission_28_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.45,
              "interval": 1.25
            },
            {
              "id": "mission_28_w3_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            },
            {
              "id": "mission_28_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.8,
              "interval": 1.25
            },
            {
              "id": "mission_28_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_28_wave_4",
          "groups": [
            {
              "id": "mission_28_w4_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_28_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_29",
      "title": "Les graines qu'on ne voit plus",
      "subtitle": "La réserve de Banksia",
      "act": 3,
      "location": "La réserve de Banksia",
      "startingEnergy": 825,
      "allowedPlants": [
        "radish",
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
        "banksia"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Isolez les déchets qui menacent la réserve de graines.",
      "tip": "Banksia augmente les graines obtenues sur les cibles marquées et accélère le confinement tant qu'elle reste vivante.",
      "waves": [
        {
          "id": "mission_29_wave_1",
          "groups": [
            {
              "id": "mission_29_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_29_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.05,
              "interval": 1.25
            },
            {
              "id": "mission_29_w1_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.3,
              "interval": 1.25
            },
            {
              "id": "mission_29_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.05,
              "interval": 1.25
            },
            {
              "id": "mission_29_w1_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 9.85,
              "interval": 1.25
            },
            {
              "id": "mission_29_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.1,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_29_wave_2",
          "groups": [
            {
              "id": "mission_29_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w2_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_29_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w2_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.7,
              "interval": 1.25
            },
            {
              "id": "mission_29_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.95,
              "interval": 1.25
            },
            {
              "id": "mission_29_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.7,
              "interval": 1.25
            },
            {
              "id": "mission_29_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.15,
              "interval": 1.25
            },
            {
              "id": "mission_29_w2_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.4,
              "interval": 1.25
            },
            {
              "id": "mission_29_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.15,
              "interval": 1.25
            },
            {
              "id": "mission_29_w2_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.6,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_29_wave_3",
          "groups": [
            {
              "id": "mission_29_w3_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_29_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.35,
              "interval": 1.25
            },
            {
              "id": "mission_29_w3_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.6,
              "interval": 1.25
            },
            {
              "id": "mission_29_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.35,
              "interval": 1.25
            },
            {
              "id": "mission_29_w3_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.45,
              "interval": 1.25
            },
            {
              "id": "mission_29_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.7,
              "interval": 1.25
            },
            {
              "id": "mission_29_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.45,
              "interval": 1.25
            },
            {
              "id": "mission_29_w3_g10",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            },
            {
              "id": "mission_29_w3_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.8,
              "interval": 1.25
            },
            {
              "id": "mission_29_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_29_wave_4",
          "groups": [
            {
              "id": "mission_29_w4_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_29_w4_g14",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_30",
      "title": "La trace blanche",
      "subtitle": "L'île traversée par Rose",
      "act": 3,
      "location": "L'île traversée par Rose",
      "startingEnergy": 840,
      "allowedPlants": [
        "radish",
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
        "banksia"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Confinez les résidus avant qu'ils rejoignent la mer.",
      "tip": "Le confinement avance grâce aux plantes vivantes, sans position imposée. Gardez des graines pour remplacer les pertes.",
      "waves": [
        {
          "id": "mission_30_wave_1",
          "groups": [
            {
              "id": "mission_30_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_30_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.05,
              "interval": 1.25
            },
            {
              "id": "mission_30_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.3,
              "interval": 1.25
            },
            {
              "id": "mission_30_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.05,
              "interval": 1.25
            },
            {
              "id": "mission_30_w1_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 9.85,
              "interval": 1.25
            },
            {
              "id": "mission_30_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.1,
              "interval": 1.25
            },
            {
              "id": "mission_30_w1_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_30_wave_2",
          "groups": [
            {
              "id": "mission_30_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_30_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w2_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.7,
              "interval": 1.25
            },
            {
              "id": "mission_30_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.95,
              "interval": 1.25
            },
            {
              "id": "mission_30_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.7,
              "interval": 1.25
            },
            {
              "id": "mission_30_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 9.15,
              "interval": 1.25
            },
            {
              "id": "mission_30_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.4,
              "interval": 1.25
            },
            {
              "id": "mission_30_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.15,
              "interval": 1.25
            },
            {
              "id": "mission_30_w2_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.6,
              "interval": 1.25
            },
            {
              "id": "mission_30_w2_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 14.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_30_wave_3",
          "groups": [
            {
              "id": "mission_30_w3_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.35,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.6,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.35,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.45,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.7,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.45,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g10",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.8,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.55,
              "interval": 1.25
            },
            {
              "id": "mission_30_w3_g13",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 16.65,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_30_wave_4",
          "groups": [
            {
              "id": "mission_30_w4_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            },
            {
              "id": "mission_30_w4_g15",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 19.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_31",
      "title": "Des voix sous les épaves",
      "subtitle": "Le réseau de Mycélium",
      "act": 3,
      "location": "Le réseau de Mycélium",
      "startingEnergy": 850,
      "allowedPlants": [
        "radish",
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
        "mushroom"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez l'installation des accès sur la carcasse.",
      "tip": "Mycélium attaque à courte portée et aide au recyclage. Protégez le jardin pendant la préparation des accès.",
      "waves": [
        {
          "id": "mission_31_wave_1",
          "groups": [
            {
              "id": "mission_31_w1_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_31_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w1_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 5.05,
              "interval": 1.25
            },
            {
              "id": "mission_31_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.3,
              "interval": 1.25
            },
            {
              "id": "mission_31_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.05,
              "interval": 1.25
            },
            {
              "id": "mission_31_w1_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 9.85,
              "interval": 1.25
            },
            {
              "id": "mission_31_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.1,
              "interval": 1.25
            },
            {
              "id": "mission_31_w1_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_31_wave_2",
          "groups": [
            {
              "id": "mission_31_w2_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_31_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w2_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.7,
              "interval": 1.25
            },
            {
              "id": "mission_31_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.95,
              "interval": 1.25
            },
            {
              "id": "mission_31_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.7,
              "interval": 1.25
            },
            {
              "id": "mission_31_w2_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 9.15,
              "interval": 1.25
            },
            {
              "id": "mission_31_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.4,
              "interval": 1.25
            },
            {
              "id": "mission_31_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.15,
              "interval": 1.25
            },
            {
              "id": "mission_31_w2_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 13.6,
              "interval": 1.25
            },
            {
              "id": "mission_31_w2_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 14.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_31_wave_3",
          "groups": [
            {
              "id": "mission_31_w3_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.35,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.6,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.35,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.45,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.7,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.45,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g10",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.8,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.55,
              "interval": 1.25
            },
            {
              "id": "mission_31_w3_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.65,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_31_wave_4",
          "groups": [
            {
              "id": "mission_31_w4_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g13",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            },
            {
              "id": "mission_31_w4_g15",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 19.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_32",
      "title": "L'Avaleur",
      "subtitle": "La lagune et la montagne flottante",
      "act": 3,
      "location": "La lagune et la montagne flottante",
      "startingEnergy": 875,
      "allowedPlants": [
        "radish",
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
        "mushroom"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Tenez le refuge et arrêtez l'Avaleur sans abandonner les protections.",
      "tip": "Toutes les parcelles restent disponibles. L'Avaleur annonce une projection qui frappe directement les plantes d'une allée : la pluie l'interrompt.",
      "waves": [
        {
          "id": "mission_32_wave_1",
          "groups": [
            {
              "id": "mission_32_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_32_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 5.05,
              "interval": 1.25
            },
            {
              "id": "mission_32_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.3,
              "interval": 1.25
            },
            {
              "id": "mission_32_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 8.05,
              "interval": 1.25
            },
            {
              "id": "mission_32_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 9.85,
              "interval": 1.25
            },
            {
              "id": "mission_32_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.1,
              "interval": 1.25
            },
            {
              "id": "mission_32_w1_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_32_wave_2",
          "groups": [
            {
              "id": "mission_32_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_32_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.7,
              "interval": 1.25
            },
            {
              "id": "mission_32_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.95,
              "interval": 1.25
            },
            {
              "id": "mission_32_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.7,
              "interval": 1.25
            },
            {
              "id": "mission_32_w2_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 9.15,
              "interval": 1.25
            },
            {
              "id": "mission_32_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.4,
              "interval": 1.25
            },
            {
              "id": "mission_32_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.15,
              "interval": 1.25
            },
            {
              "id": "mission_32_w2_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.6,
              "interval": 1.25
            },
            {
              "id": "mission_32_w2_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 14.85,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_32_wave_3",
          "groups": [
            {
              "id": "mission_32_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.35,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.6,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.35,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.45,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.7,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.45,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.55,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.8,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.55,
              "interval": 1.25
            },
            {
              "id": "mission_32_w3_g13",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 16.65,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_32_wave_4",
          "groups": [
            {
              "id": "mission_32_w4_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g13",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g14",
              "enemyId": "devourer",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            },
            {
              "id": "mission_32_w4_g15",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 19.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_33",
      "title": "À l'ombre des géants",
      "subtitle": "Le passage de Séquoia",
      "act": 4,
      "location": "Le passage de Séquoia",
      "startingEnergy": 840,
      "allowedPlants": [
        "radish",
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
        "sequoia"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Défendez le passage qui protège les jeunes arbres.",
      "tip": "Séquoia est très résistant, mais coûteux. Gardez assez de graines pour couvrir les autres allées.",
      "waves": [
        {
          "id": "mission_33_wave_1",
          "groups": [
            {
              "id": "mission_33_w1_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_33_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w1_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.95,
              "interval": 1.25
            },
            {
              "id": "mission_33_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.2,
              "interval": 1.25
            },
            {
              "id": "mission_33_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.95,
              "interval": 1.25
            },
            {
              "id": "mission_33_w1_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 9.65,
              "interval": 1.25
            },
            {
              "id": "mission_33_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.9,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_33_wave_2",
          "groups": [
            {
              "id": "mission_33_w2_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_33_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w2_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.6,
              "interval": 1.25
            },
            {
              "id": "mission_33_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.85,
              "interval": 1.25
            },
            {
              "id": "mission_33_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.6,
              "interval": 1.25
            },
            {
              "id": "mission_33_w2_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.95,
              "interval": 1.25
            },
            {
              "id": "mission_33_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.2,
              "interval": 1.25
            },
            {
              "id": "mission_33_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.95,
              "interval": 1.25
            },
            {
              "id": "mission_33_w2_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 13.3,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_33_wave_3",
          "groups": [
            {
              "id": "mission_33_w3_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_33_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w3_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_33_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w3_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_33_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w3_g10",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_33_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_33_wave_4",
          "groups": [
            {
              "id": "mission_33_w4_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g13",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_33_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_34",
      "title": "L'hospitalité de Cactus",
      "subtitle": "Le passage des terres arides",
      "act": 4,
      "location": "Le passage des terres arides",
      "startingEnergy": 860,
      "allowedPlants": [
        "radish",
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
        "cactus"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Escortez les voyageurs jusqu'au prochain abri.",
      "tip": "Cactus protège au contact ; accompagnez-le de tirs à distance pour protéger le jardin pendant l'escorte.",
      "waves": [
        {
          "id": "mission_34_wave_1",
          "groups": [
            {
              "id": "mission_34_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_34_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.95,
              "interval": 1.25
            },
            {
              "id": "mission_34_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.2,
              "interval": 1.25
            },
            {
              "id": "mission_34_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.95,
              "interval": 1.25
            },
            {
              "id": "mission_34_w1_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 9.65,
              "interval": 1.25
            },
            {
              "id": "mission_34_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.9,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_34_wave_2",
          "groups": [
            {
              "id": "mission_34_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_34_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w2_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.6,
              "interval": 1.25
            },
            {
              "id": "mission_34_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.85,
              "interval": 1.25
            },
            {
              "id": "mission_34_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.6,
              "interval": 1.25
            },
            {
              "id": "mission_34_w2_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.95,
              "interval": 1.25
            },
            {
              "id": "mission_34_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.2,
              "interval": 1.25
            },
            {
              "id": "mission_34_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.95,
              "interval": 1.25
            },
            {
              "id": "mission_34_w2_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 13.3,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_34_wave_3",
          "groups": [
            {
              "id": "mission_34_w3_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_34_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w3_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_34_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w3_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_34_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w3_g10",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_34_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_34_wave_4",
          "groups": [
            {
              "id": "mission_34_w4_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_34_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_35",
      "title": "Couper le ravitaillement",
      "subtitle": "Le verrou d'Agave",
      "act": 4,
      "location": "Le verrou d'Agave",
      "startingEnergy": 880,
      "allowedPlants": [
        "radish",
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
        "agave"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Tenez les postes qui isolent les convois de déchets.",
      "tip": "Agave est efficace contre les blindages. Protégez le jardin jusqu'à la fin du confinement, suivi dans la jauge.",
      "waves": [
        {
          "id": "mission_35_wave_1",
          "groups": [
            {
              "id": "mission_35_w1_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_35_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w1_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.95,
              "interval": 1.25
            },
            {
              "id": "mission_35_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.2,
              "interval": 1.25
            },
            {
              "id": "mission_35_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.95,
              "interval": 1.25
            },
            {
              "id": "mission_35_w1_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 9.65,
              "interval": 1.25
            },
            {
              "id": "mission_35_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.9,
              "interval": 1.25
            },
            {
              "id": "mission_35_w1_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.65,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_35_wave_2",
          "groups": [
            {
              "id": "mission_35_w2_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_35_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w2_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.6,
              "interval": 1.25
            },
            {
              "id": "mission_35_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.85,
              "interval": 1.25
            },
            {
              "id": "mission_35_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.6,
              "interval": 1.25
            },
            {
              "id": "mission_35_w2_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.95,
              "interval": 1.25
            },
            {
              "id": "mission_35_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.2,
              "interval": 1.25
            },
            {
              "id": "mission_35_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.95,
              "interval": 1.25
            },
            {
              "id": "mission_35_w2_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 13.3,
              "interval": 1.25
            },
            {
              "id": "mission_35_w2_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 14.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_35_wave_3",
          "groups": [
            {
              "id": "mission_35_w3_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g10",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w3_g13",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_35_wave_4",
          "groups": [
            {
              "id": "mission_35_w4_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g13",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            },
            {
              "id": "mission_35_w4_g15",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 19.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_36",
      "title": "La place de chaque voix",
      "subtitle": "Le jardin commun de Dahlia",
      "act": 4,
      "location": "Le jardin commun de Dahlia",
      "startingEnergy": 890,
      "allowedPlants": [
        "radish",
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
        "dahlia"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez la remise en état des communications entre refuges.",
      "tip": "Dahlia soutient un large voisinage. Répartissez les attaquants pour protéger le jardin pendant les deux chantiers.",
      "waves": [
        {
          "id": "mission_36_wave_1",
          "groups": [
            {
              "id": "mission_36_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_36_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.95,
              "interval": 1.25
            },
            {
              "id": "mission_36_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.2,
              "interval": 1.25
            },
            {
              "id": "mission_36_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.95,
              "interval": 1.25
            },
            {
              "id": "mission_36_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 9.65,
              "interval": 1.25
            },
            {
              "id": "mission_36_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.9,
              "interval": 1.25
            },
            {
              "id": "mission_36_w1_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.65,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_36_wave_2",
          "groups": [
            {
              "id": "mission_36_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_36_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.6,
              "interval": 1.25
            },
            {
              "id": "mission_36_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.85,
              "interval": 1.25
            },
            {
              "id": "mission_36_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.6,
              "interval": 1.25
            },
            {
              "id": "mission_36_w2_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.95,
              "interval": 1.25
            },
            {
              "id": "mission_36_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.2,
              "interval": 1.25
            },
            {
              "id": "mission_36_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.95,
              "interval": 1.25
            },
            {
              "id": "mission_36_w2_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.3,
              "interval": 1.25
            },
            {
              "id": "mission_36_w2_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 14.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_36_wave_3",
          "groups": [
            {
              "id": "mission_36_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w3_g13",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_36_wave_4",
          "groups": [
            {
              "id": "mission_36_w4_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g13",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            },
            {
              "id": "mission_36_w4_g15",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 19.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_37",
      "title": "L'entrée que personne ne regarde",
      "subtitle": "Les passages de Passiflore",
      "act": 4,
      "location": "Les passages de Passiflore",
      "startingEnergy": 910,
      "allowedPlants": [
        "radish",
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
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Sécurisez les accès permettant d'entrer dans la Fournaise.",
      "tip": "Passiflore entrave à distance. Protégez les travaux sans perdre de vue les autres allées.",
      "waves": [
        {
          "id": "mission_37_wave_1",
          "groups": [
            {
              "id": "mission_37_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_37_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.95,
              "interval": 1.25
            },
            {
              "id": "mission_37_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.2,
              "interval": 1.25
            },
            {
              "id": "mission_37_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.95,
              "interval": 1.25
            },
            {
              "id": "mission_37_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 9.65,
              "interval": 1.25
            },
            {
              "id": "mission_37_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.9,
              "interval": 1.25
            },
            {
              "id": "mission_37_w1_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.65,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_37_wave_2",
          "groups": [
            {
              "id": "mission_37_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_37_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.6,
              "interval": 1.25
            },
            {
              "id": "mission_37_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.85,
              "interval": 1.25
            },
            {
              "id": "mission_37_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.6,
              "interval": 1.25
            },
            {
              "id": "mission_37_w2_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.95,
              "interval": 1.25
            },
            {
              "id": "mission_37_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.2,
              "interval": 1.25
            },
            {
              "id": "mission_37_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.95,
              "interval": 1.25
            },
            {
              "id": "mission_37_w2_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.3,
              "interval": 1.25
            },
            {
              "id": "mission_37_w2_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 14.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_37_wave_3",
          "groups": [
            {
              "id": "mission_37_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w3_g13",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_37_wave_4",
          "groups": [
            {
              "id": "mission_37_w4_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g13",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            },
            {
              "id": "mission_37_w4_g15",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 19.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_38",
      "title": "Ce qu'on ne peut plus abandonner",
      "subtitle": "Les derniers canaux de la Fournaise",
      "act": 4,
      "location": "Les derniers canaux de la Fournaise",
      "startingEnergy": 940,
      "allowedPlants": [
        "radish",
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
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Isolez les circuits qui menacent les quartiers et les zones humides.",
      "tip": "Le confinement avance hors du plateau avec l'aide des plantes vivantes. Gardez des graines pour remplacer vos défenseurs.",
      "waves": [
        {
          "id": "mission_38_wave_1",
          "groups": [
            {
              "id": "mission_38_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_38_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.95,
              "interval": 1.25
            },
            {
              "id": "mission_38_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.2,
              "interval": 1.25
            },
            {
              "id": "mission_38_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.95,
              "interval": 1.25
            },
            {
              "id": "mission_38_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 9.65,
              "interval": 1.25
            },
            {
              "id": "mission_38_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.9,
              "interval": 1.25
            },
            {
              "id": "mission_38_w1_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.65,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_38_wave_2",
          "groups": [
            {
              "id": "mission_38_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_38_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.6,
              "interval": 1.25
            },
            {
              "id": "mission_38_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.85,
              "interval": 1.25
            },
            {
              "id": "mission_38_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.6,
              "interval": 1.25
            },
            {
              "id": "mission_38_w2_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.95,
              "interval": 1.25
            },
            {
              "id": "mission_38_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.2,
              "interval": 1.25
            },
            {
              "id": "mission_38_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.95,
              "interval": 1.25
            },
            {
              "id": "mission_38_w2_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.3,
              "interval": 1.25
            },
            {
              "id": "mission_38_w2_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 14.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_38_wave_3",
          "groups": [
            {
              "id": "mission_38_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w3_g13",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_38_wave_4",
          "groups": [
            {
              "id": "mission_38_w4_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g13",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            },
            {
              "id": "mission_38_w4_g15",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 19.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_39",
      "title": "Je n'arrive plus à tout arrêter",
      "subtitle": "Le sauvetage de Rose",
      "act": 4,
      "location": "Le sauvetage de Rose",
      "startingEnergy": 980,
      "allowedPlants": [
        "radish",
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
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Brisez les trois excroissances contaminées et arrêtez les noyaux qui emprisonnent Rose.",
      "tip": "Protégez l'opération de sauvetage et frappez les parties contaminées. Rose ne rejoint pas encore l'équipe de combat.",
      "waves": [
        {
          "id": "mission_39_wave_1",
          "groups": [
            {
              "id": "mission_39_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_39_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.95,
              "interval": 1.25
            },
            {
              "id": "mission_39_w1_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 6.2,
              "interval": 1.25
            },
            {
              "id": "mission_39_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.95,
              "interval": 1.25
            },
            {
              "id": "mission_39_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 9.65,
              "interval": 1.25
            },
            {
              "id": "mission_39_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.9,
              "interval": 1.25
            },
            {
              "id": "mission_39_w1_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.65,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_39_wave_2",
          "groups": [
            {
              "id": "mission_39_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w2_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_39_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.6,
              "interval": 1.25
            },
            {
              "id": "mission_39_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.85,
              "interval": 1.25
            },
            {
              "id": "mission_39_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.6,
              "interval": 1.25
            },
            {
              "id": "mission_39_w2_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.95,
              "interval": 1.25
            },
            {
              "id": "mission_39_w2_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.2,
              "interval": 1.25
            },
            {
              "id": "mission_39_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.95,
              "interval": 1.25
            },
            {
              "id": "mission_39_w2_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.3,
              "interval": 1.25
            },
            {
              "id": "mission_39_w2_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 14.55,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_39_wave_3",
          "groups": [
            {
              "id": "mission_39_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w3_g13",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_39_wave_4",
          "groups": [
            {
              "id": "mission_39_w4_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g13",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g14",
              "enemyId": "corrupted_rose",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_g15",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 19.25,
              "interval": 1.25
            },
            {
              "id": "mission_39_w4_rescue0",
              "enemyId": "thorn_knot",
              "count": 1,
              "lane": 0,
              "start": 1,
              "interval": 1
            },
            {
              "id": "mission_39_w4_rescue2",
              "enemyId": "thorn_knot",
              "count": 1,
              "lane": 2,
              "start": 1,
              "interval": 1
            },
            {
              "id": "mission_39_w4_rescue4",
              "enemyId": "thorn_knot",
              "count": 1,
              "lane": 4,
              "start": 1,
              "interval": 1
            }
          ]
        }
      ],
      "events": []
    },
    {
      "id": "mission_40",
      "title": "Ce que nous laisserons pousser",
      "subtitle": "La Fournaise · les cinq continents réunis",
      "act": 4,
      "location": "La Fournaise",
      "startingEnergy": 1050,
      "allowedPlants": [
        "radish",
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
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Isolez les dernières réserves et neutralisez le cœur de la Fournaise.",
      "tip": "Protégez le jardin pendant les cinq vagues et le confinement. Adaptez vos positions aux attaques successives du cœur.",
      "waves": [
        {
          "id": "mission_40_wave_1",
          "groups": [
            {
              "id": "mission_40_w1_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w1_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w1_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w1_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.95,
              "interval": 1.25
            },
            {
              "id": "mission_40_w1_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 6.2,
              "interval": 1.25
            },
            {
              "id": "mission_40_w1_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.95,
              "interval": 1.25
            },
            {
              "id": "mission_40_w1_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 9.65,
              "interval": 1.25
            },
            {
              "id": "mission_40_w1_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 10.9,
              "interval": 1.25
            },
            {
              "id": "mission_40_w1_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 12.65,
              "interval": 1.25
            },
            {
              "id": "mission_40_w1_g10",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 14.35,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_40_wave_2",
          "groups": [
            {
              "id": "mission_40_w2_g1",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w2_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w2_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w2_g4",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 4.6,
              "interval": 1.25
            },
            {
              "id": "mission_40_w2_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.85,
              "interval": 1.25
            },
            {
              "id": "mission_40_w2_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.6,
              "interval": 1.25
            },
            {
              "id": "mission_40_w2_g7",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 8.95,
              "interval": 1.25
            },
            {
              "id": "mission_40_w2_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 10.2,
              "interval": 1.25
            },
            {
              "id": "mission_40_w2_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.95,
              "interval": 1.25
            },
            {
              "id": "mission_40_w2_g10",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 13.3,
              "interval": 1.25
            },
            {
              "id": "mission_40_w2_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 14.55,
              "interval": 1.25
            },
            {
              "id": "mission_40_w2_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 16.3,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_40_wave_3",
          "groups": [
            {
              "id": "mission_40_w3_g1",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g4",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g7",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g10",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g13",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w3_g14",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_40_wave_4",
          "groups": [
            {
              "id": "mission_40_w4_g1",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g2",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g4",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g5",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g7",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g8",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g10",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g11",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g13",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g14",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g15",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 19.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w4_g16",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 20.25,
              "interval": 1.25
            }
          ]
        },
        {
          "id": "mission_40_wave_5",
          "groups": [
            {
              "id": "mission_40_w5_g1",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 0.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g2",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 1.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g3",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 3.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g4",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 4.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g5",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 5.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g6",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 7.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g7",
              "enemyId": "jammer",
              "count": 1,
              "lane": -1,
              "start": 8.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g8",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 9.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g9",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 11.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g10",
              "enemyId": "tanker",
              "count": 1,
              "lane": -1,
              "start": 12.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g11",
              "enemyId": "runner",
              "count": 1,
              "lane": -1,
              "start": 13.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g12",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 15.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g13",
              "enemyId": "sprayer",
              "count": 1,
              "lane": -1,
              "start": 16.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g14",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 17.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g15",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 19.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g16",
              "enemyId": "truck",
              "count": 1,
              "lane": -1,
              "start": 20.25,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g17",
              "enemyId": "furnace",
              "count": 1,
              "lane": -1,
              "start": 21.5,
              "interval": 1.25
            },
            {
              "id": "mission_40_w5_g18",
              "enemyId": "litterer",
              "count": 1,
              "lane": -1,
              "start": 23.25,
              "interval": 1.25
            }
          ]
        }
      ],
      "events": []
    }
  ],
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
import {ensureEnemyRules} from '../../src/shared/game/enemyRules.js';
ensureEnemyRules(GAME_SEED);
export function seedProject():GameProject{const p=structuredClone(GAME_SEED);ensurePresentation(p);importCombatMechanics(p.combat!);return p;}
