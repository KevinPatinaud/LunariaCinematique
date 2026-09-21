import { ensurePresentation } from '../presentation/defaults.js';
import type { GameProject } from './types.js';
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
          "ab_radish"
        ],
        "behaviorId": "ai_defender"
      },
      {
        "id": "bramble",
        "name": "Ronce",
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
          "ab_bramble"
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
          "ab_hazel",
          "ab_hazel_regeneration"
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
          "ab_ivy"
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
          "ab_acacia"
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
          "ab_baobab",
          "ab_baobab_protection",
          "ab_baobab_regeneration"
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
          "ab_bamboo"
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
          "ab_mangrove",
          "ab_mangrove_protection",
          "ab_mangrove_regeneration"
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
          "ab_pandanus_protection"
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
          "ab_sequoia",
          "ab_sequoia_protection",
          "ab_sequoia_regeneration"
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
        "leak": 12,
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
        "leak": 10,
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
        "leak": 18,
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
        "leak": 26,
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
        "leak": 18,
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
        "leak": 30,
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
        "leak": 42,
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
        "leak": 42,
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
        "leak": 42,
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
        "leak": 46,
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
        "id": "corrupted_bramble",
        "name": "Ronce contaminée",
        "hp": 1400,
        "speed": 0.035,
        "attack": 42,
        "leak": 46,
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
        "behaviorId": "ai_corrupted_bramble"
      },
      {
        "id": "furnace",
        "name": "La Fournaise",
        "hp": 2400,
        "speed": 0.038,
        "attack": 48,
        "leak": 50,
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
        "leak": 0,
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
      "subtitle": "La jardinerie Lunaria · Radis et Ronce",
      "act": 0,
      "location": "La jardinerie Lunaria",
      "startingEnergy": 520,
      "allowedPlants": [
        "radish",
        "bramble"
      ],
      "objective": {
        "type": "defend",
        "target": 0
      },
      "objectiveText": "Protégez le dernier jardin pendant trois vagues.",
      "tip": "Plantez Radis dans les allées annoncées et Ronce devant lui. Les graines proviennent des pollueurs arrêtés.",
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
      "briefing": [],
      "outro": [
        {
          "speaker": "Narration",
          "text": "L'assaut est repoussé, mais les eaux contaminées ont déjà atteint les racines du tilleul."
        },
        {
          "speaker": "Ronce",
          "text": "La porte a tenu. Je peux encore dégager tes racines. Il doit y avoir quelque chose à faire !"
        },
        {
          "speaker": "Tilleul",
          "text": "Il y a quelque chose. Prenez ces graines. Cherchez un endroit où elles pourront grandir."
        },
        {
          "speaker": "Radis",
          "text": "Celle-ci reviendra ici. Je la garderai dans mes feuilles."
        },
        {
          "speaker": "Ronce",
          "text": "Alors il faudra qu'on revienne aussi."
        },
        {
          "speaker": "Narration",
          "text": "Les survivants sont confiés aux jardins voisins. Radis et Ronce franchissent la porte avec les graines du tilleul."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "healthy",
          "title": "Terminer avec au moins 80 % de vitalité",
          "target": 80
        },
        {
          "id": "full_garden",
          "title": "Garder 5 végétaux sur le terrain",
          "target": 5
        }
      ],
      "restoration": "L'assaut est repoussé, mais les eaux contaminées ont déjà atteint les racines du tilleul.",
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
        "bramble",
        "hazel"
      ],
      "objective": {
        "type": "repair",
        "target": 35
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
      "briefing": [
        {
          "speaker": "Noisetier",
          "text": "Dix-huit, dix-neuf… Tu viens de marcher sur mon inventaire."
        },
        {
          "speaker": "Radis",
          "text": "Tu es coincé dans ce grillage ! On peut te dégager ?"
        },
        {
          "speaker": "Noisetier",
          "text": "En commençant par ne pas perdre la dernière noisette."
        },
        {
          "speaker": "Ronce",
          "text": "Nous tenons le passage pendant que les racines desserrent la clôture. Il pourra se battre à nos côtés."
        },
        {
          "speaker": "Noisetier",
          "text": "Très bien. Je rejoins votre groupe. Provisoirement."
        }
      ],
      "outro": [
        {
          "speaker": "Noisetier",
          "text": "Toutes retrouvées. Nous prenons simplement la même direction."
        },
        {
          "speaker": "Narration",
          "text": "Le soir, une carcasse surgit du fossé. Noisetier s'interpose avant même que Radis ait vu le danger."
        },
        {
          "speaker": "Radis",
          "text": "Tu nous as suivis jusque-là pour tes noisettes ?"
        },
        {
          "speaker": "Noisetier",
          "text": "Il faut bien quelqu'un pour compter correctement."
        },
        {
          "speaker": "Ronce",
          "text": "Donne-m'en deux. Tu porteras le reste."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "diversity",
          "title": "Réunir les 3 compagnons sur le terrain",
          "target": 3
        },
        {
          "id": "low_losses",
          "title": "Perdre au plus 2 végétaux",
          "target": 2
        }
      ],
      "restoration": "Toutes retrouvées. Nous prenons simplement la même direction.",
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
        "bramble",
        "hazel",
        "fern"
      ],
      "objective": {
        "type": "water",
        "target": 40
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
      "briefing": [
        {
          "speaker": "Fougère",
          "text": "Pas par cette galerie. L'eau y goûte le métal."
        },
        {
          "speaker": "Radis",
          "text": "Tu sais où elle reste claire ? Nous cherchons une terre pour ces graines."
        },
        {
          "speaker": "Fougère",
          "text": "Une source coule dans un parc, au-delà de la gare. Mais je ne vais jamais aussi loin."
        },
        {
          "speaker": "Ronce",
          "text": "Aide-nous à rouvrir ce passage. Nous avancerons ensemble."
        },
        {
          "speaker": "Fougère",
          "text": "Il reste justement quelques canalisations que j'aimerais écouter. Je viens."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Un filet d'eau rejoint la galerie. Des racines oubliées se redressent contre les pierres."
        },
        {
          "speaker": "Radis",
          "text": "Tu es déjà plus loin que tu ne l'avais prévu."
        },
        {
          "speaker": "Fougère",
          "text": "Oui. Et il y a encore un escalier intéressant devant nous."
        },
        {
          "speaker": "Noisetier",
          "text": "Les endroits intéressants peuvent-ils parfois être secs ?"
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "diversity",
          "title": "Réunir les 4 compagnons sur le terrain",
          "target": 4
        },
        {
          "id": "plantings",
          "title": "Planter 6 végétaux",
          "target": 6
        }
      ],
      "restoration": "Un filet d'eau rejoint la galerie. Des racines oubliées se redressent contre les pierres.",
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
        "bramble",
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
      "briefing": [
        {
          "speaker": "Pissenlit",
          "text": "Ne traversez pas ! Le Ramasseur revient dès que la grande aiguille grince."
        },
        {
          "speaker": "Narration",
          "text": "Une énorme machine avale les déchets, les panneaux et les plantes. Sur son flanc : « Pour une ville plus propre »."
        },
        {
          "speaker": "Noisetier",
          "text": "Il devrait se relire."
        },
        {
          "speaker": "Pissenlit",
          "text": "Il ne regarde jamais de ce côté. Je connais les rondes. Emmenez-moi et je vous montrerai le chemin."
        },
        {
          "speaker": "Ronce",
          "text": "Tu le connais entièrement ?"
        },
        {
          "speaker": "Pissenlit",
          "text": "Le début. Ensuite, ce sera une découverte collective."
        }
      ],
      "outro": [
        {
          "speaker": "Pissenlit",
          "text": "Tous les quais sont calmes. C'est la première fois que je vois l'horloge d'en bas."
        },
        {
          "speaker": "Radis",
          "text": "Nous sommes cinq. Chacun aura sa place dans les prochaines batailles."
        },
        {
          "speaker": "Fougère",
          "text": "Une verrière rejoint le quai suivant. Quelqu'un y bouge encore."
        },
        {
          "speaker": "Pissenlit",
          "text": "Je l'avais presque repérée."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "full_garden",
          "title": "Garder 10 végétaux sur le terrain",
          "target": 10
        },
        {
          "id": "plantings",
          "title": "Planter 9 végétaux",
          "target": 9
        }
      ],
      "restoration": "Tous les quais sont calmes. C'est la première fois que je vois l'horloge d'en bas.",
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
        "bramble",
        "hazel",
        "fern",
        "dandelion",
        "ivy"
      ],
      "objective": {
        "type": "repair",
        "target": 45
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
      "briefing": [
        {
          "speaker": "Lierre",
          "text": "Vous êtes très… proches du sol. Mon raccourci devrait arranger cela."
        },
        {
          "speaker": "Narration",
          "text": "Le passage s'arrête devant un vide que seul Lierre peut franchir."
        },
        {
          "speaker": "Ronce",
          "text": "Et Noisetier, tu comptes le faire voler ?"
        },
        {
          "speaker": "Lierre",
          "text": "Naturellement, j'avais prévu de construire un pont. Je vais fixer mes tiges des deux côtés."
        },
        {
          "speaker": "Radis",
          "text": "Nous protégeons tes attaches. Ensuite tu viens avec nous."
        },
        {
          "speaker": "Lierre",
          "text": "Je vois qu'il vous faut quelqu'un de qualifié."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les attaches tiennent. Même Noisetier traverse sans abandonner une noisette."
        },
        {
          "speaker": "Noisetier",
          "text": "Ton raccourci a pris toute la journée."
        },
        {
          "speaker": "Lierre",
          "text": "Un pont de cette qualité mérite qu'on le contemple."
        },
        {
          "speaker": "Fougère",
          "text": "Regardez sous la verrière. Il y a des feuilles dans ce wagon."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "healthy",
          "title": "Terminer avec au moins 80 % de vitalité",
          "target": 80
        },
        {
          "id": "low_losses",
          "title": "Perdre au plus 3 végétaux",
          "target": 3
        }
      ],
      "restoration": "Les attaches tiennent. Même Noisetier traverse sans abandonner une noisette.",
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
        "bramble",
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
      "briefing": [
        {
          "speaker": "Ortie",
          "text": "Montrez vos racines. Les canettes aussi ont appris à marcher : je vérifie."
        },
        {
          "speaker": "Radis",
          "text": "Nous cherchons la sortie vers le parc. Qui est avec toi ?"
        },
        {
          "speaker": "Ortie",
          "text": "Les petits dont le Ramasseur a arraché le jardin. Je ne pars pas sans eux."
        },
        {
          "speaker": "Ronce",
          "text": "Alors nous tenons les portes avec toi. Ensuite nous préparons leur traversée."
        },
        {
          "speaker": "Ortie",
          "text": "Voilà une phrase que je peux entendre."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les jeunes plantes sortent de sous les sièges. Ortie les appelle une à une pour vérifier que toutes sont là."
        },
        {
          "speaker": "Radis",
          "text": "Elles ne pourront pas traverser d'un seul coup."
        },
        {
          "speaker": "Lierre",
          "text": "Je peux relier plusieurs abris."
        },
        {
          "speaker": "Ortie",
          "text": "Et je protège l'arrière. Après le parc, je continuerai avec vous. D'autres doivent encore attendre."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "diversity",
          "title": "Réunir 4 espèces sur le terrain",
          "target": 4
        },
        {
          "id": "plantings",
          "title": "Planter 8 végétaux",
          "target": 8
        }
      ],
      "restoration": "Les jeunes plantes sortent de sous les sièges. Ortie les appelle une à une pour vérifier que toutes sont là.",
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
        "bramble",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle"
      ],
      "objective": {
        "type": "escort",
        "target": 55
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
      "briefing": [
        {
          "speaker": "Pissenlit",
          "text": "Le Ramasseur est de l'autre côté. C'est maintenant."
        },
        {
          "speaker": "Fougère",
          "text": "Les plus petites par les passages bas. Les autres suivent les attaches de Lierre."
        },
        {
          "speaker": "Ronce",
          "text": "Je retiens les wagons. Continuez tant que les rails sont libres."
        },
        {
          "speaker": "Radis",
          "text": "Nous couvrirons chaque groupe jusqu'au bout."
        },
        {
          "speaker": "Noisetier",
          "text": "Je préfère compter les arrivées. Elles doivent être aussi nombreuses que les départs."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "La dernière pousse rejoint le parc. Derrière elle, le wagon se soulève grâce à toutes les racines réunies."
        },
        {
          "speaker": "Ronce",
          "text": "Vous auriez dû continuer."
        },
        {
          "speaker": "Radis",
          "text": "Nous avons continué. Ensemble."
        },
        {
          "speaker": "Ortie",
          "text": "Tout le monde est là. Je recompterai quand même."
        },
        {
          "speaker": "Narration",
          "text": "La grue retombe sur des rails vides. À l'aube, la source apparaît entre les arbres."
        }
      ],
      "midDialogue": [
        {
          "speaker": "Narration",
          "text": "Le Ramasseur heurte un wagon. Ronce retient le métal, mais une roue emprisonne ses tiges."
        },
        {
          "speaker": "Ronce",
          "text": "Continuez ! Il va revenir !"
        },
        {
          "speaker": "Radis",
          "text": "Lierre, une attache au-dessus ! Noisetier, avec moi. Ortie, protège les petites pousses. Nous revenons te chercher."
        }
      ],
      "midWave": 2,
      "optionalGoals": [
        {
          "id": "no_refuge",
          "title": "Conserver les 5 refuges",
          "target": 5
        },
        {
          "id": "healthy",
          "title": "Terminer avec au moins 85 % de vitalité",
          "target": 85
        }
      ],
      "restoration": "La dernière pousse rejoint le parc. Derrière elle, le wagon se soulève grâce à toutes les racines réunies.",
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
        "bramble",
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
      "briefing": [
        {
          "speaker": "Fougère",
          "text": "La source est claire. Nous pouvons enfin planter."
        },
        {
          "speaker": "Narration",
          "text": "Un bras de grue dépasse de la grille. Le Ramasseur a suivi les traces jusqu'au parc."
        },
        {
          "speaker": "Ronce",
          "text": "Il devra traverser toutes nos racines avant de toucher ce jardin."
        },
        {
          "speaker": "Pissenlit",
          "text": "Sa plaque s'ouvre quand il frappe. Observez ses mouvements."
        },
        {
          "speaker": "Radis",
          "text": "Protégeons la source. Cette fois, elle coulera encore après la bataille."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Le noyau s'éteint. Le Ramasseur s'affaisse loin de la source, dans un long souffle de vapeur."
        },
        {
          "speaker": "Radis",
          "text": "Nous pouvons les planter. Les graines du tilleul ont une terre."
        },
        {
          "speaker": "Narration",
          "text": "Les habitants retirent les carcasses et reviennent entretenir le parc. Une vieille dame pose un écriteau : « Merci de laisser pousser »."
        },
        {
          "speaker": "Pissenlit",
          "text": "Une hirondelle arrive d'Afrique. Un fleuve n'atteint plus ses berges."
        },
        {
          "speaker": "Ronce",
          "text": "Nous venons juste de trouver un endroit sûr."
        },
        {
          "speaker": "Radis",
          "text": "L'eau et les oiseaux continuent de voyager, même si nous restons ici."
        },
        {
          "speaker": "Narration",
          "text": "Les gardiens du parc prennent le relais. Les sept compagnons partent ensemble vers la côte."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "full_garden",
          "title": "Garder 10 végétaux sur le terrain",
          "target": 10
        },
        {
          "id": "plantings",
          "title": "Planter 9 végétaux",
          "target": 9
        }
      ],
      "restoration": "Le noyau s'éteint. Le Ramasseur s'affaisse loin de la source, dans un long souffle de vapeur.",
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
        "bramble",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle",
        "acacia"
      ],
      "objective": {
        "type": "repair",
        "target": 45
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "Après la traversée en cargo, les hirondelles guident la troupe vers un bassin fluvial. Les canaux gardent la forme de l'eau disparue."
        },
        {
          "speaker": "Acacia",
          "text": "Si vous venez demander de l'eau, prenez un seau. Si vous venez donner des conseils, asseyez-vous dessus."
        },
        {
          "speaker": "Radis",
          "text": "Nous avons reçu votre appel. Comment pouvons-nous aider ?"
        },
        {
          "speaker": "Acacia",
          "text": "Commencez par cette fuite. Mes élèves garderont le puits ; je vous accompagne au chantier."
        },
        {
          "speaker": "Ronce",
          "text": "Enfin un plan qui tient en une phrase."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "La digue retient de nouveau l'eau. Acacia attend que les jeunes pousses aient bu avant d'y tremper ses racines."
        },
        {
          "speaker": "Radis",
          "text": "Une fuite réparée paraît petite face à tout cela."
        },
        {
          "speaker": "Acacia",
          "text": "Dis-le à ceux qui boivent."
        },
        {
          "speaker": "Fougère",
          "text": "Un ancien conduit passe sous le canal. Quelqu'un a déjà dessiné son trajet."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "healthy",
          "title": "Terminer avec au moins 80 % de vitalité",
          "target": 80
        },
        {
          "id": "low_losses",
          "title": "Perdre au plus 3 végétaux",
          "target": 3
        }
      ],
      "restoration": "La digue retient de nouveau l'eau. Acacia attend que les jeunes pousses aient bu avant d'y tremper ses racines.",
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
        "bramble",
        "hazel",
        "fern",
        "dandelion",
        "ivy",
        "nettle",
        "acacia",
        "papyrus"
      ],
      "objective": {
        "type": "water",
        "target": 50
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
      "briefing": [
        {
          "speaker": "Papyrus",
          "text": "J'ai corrigé les rigoles. Il reste à dégager cette galerie."
        },
        {
          "speaker": "Pissenlit",
          "text": "La première idée était mauvaise ?"
        },
        {
          "speaker": "Papyrus",
          "text": "La première idée ignorait encore où étaient les trous."
        },
        {
          "speaker": "Fougère",
          "text": "J'entends de l'eau derrière cette paroi. Tes plans peuvent la ramener au puits."
        },
        {
          "speaker": "Papyrus",
          "text": "Alors je viens les vérifier sur place. Tenez les deux postes pendant les travaux."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Un filet d'eau traverse les nouvelles rigoles et remplit un bassin longtemps resté vide."
        },
        {
          "speaker": "Papyrus",
          "text": "Je vais dessiner ce qui fonctionne. Ceux qui restent doivent pouvoir le refaire."
        },
        {
          "speaker": "Acacia",
          "text": "Un messager arrive : un jardin isolé manque d'eau. Un jeune baobab y protège des pousses."
        },
        {
          "speaker": "Radis",
          "text": "Nous partons dès que le passage est sûr."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "diversity",
          "title": "Réunir 4 espèces sur le terrain",
          "target": 4
        },
        {
          "id": "plantings",
          "title": "Planter 8 végétaux",
          "target": 8
        }
      ],
      "restoration": "Un filet d'eau traverse les nouvelles rigoles et remplit un bassin longtemps resté vide.",
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
        "bramble",
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
        "type": "escort",
        "target": 60
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
      "briefing": [
        {
          "speaker": "Baobab",
          "text": "… Et le grand oiseau repartit chercher le chemin. Il avait oublié quelque chose. Encore."
        },
        {
          "speaker": "Radis",
          "text": "Tu sais comment ton histoire finit ?"
        },
        {
          "speaker": "Baobab",
          "text": "Oui. Mais je ne voulais pas y arriver avant les secours."
        },
        {
          "speaker": "Ortie",
          "text": "Ils sont là. Nous ramènerons toutes les pousses."
        },
        {
          "speaker": "Baobab",
          "text": "Alors je marche avec vous. Mais la dernière passe avant moi."
        },
        {
          "speaker": "Ronce",
          "text": "Je prendrai l'autre côté. Tu n'auras pas à tout retenir seul."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les voyageurs rejoignent la pépinière. Baobab s'assied seulement quand la dernière pousse est à l'ombre."
        },
        {
          "speaker": "Baobab",
          "text": "Maintenant, je peux terminer l'histoire."
        },
        {
          "speaker": "Radis",
          "text": "Tu pourrais en raconter une autre ce soir ?"
        },
        {
          "speaker": "Ronce",
          "text": "D'abord, tout le monde boit."
        },
        {
          "speaker": "Narration",
          "text": "Elle découvre qu'elle peut détourner les yeux quelques secondes sans que quelqu'un soit en danger."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "no_refuge",
          "title": "Conserver les 5 refuges",
          "target": 5
        },
        {
          "id": "healthy",
          "title": "Terminer avec au moins 85 % de vitalité",
          "target": 85
        }
      ],
      "restoration": "Les voyageurs rejoignent la pépinière. Baobab s'assied seulement quand la dernière pousse est à l'ombre.",
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
        "bramble",
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
      "briefing": [
        {
          "speaker": "Aloès",
          "text": "Les nouvelles pousses ici. Les blessés près du bassin. Et toi, Ronce : tu boites."
        },
        {
          "speaker": "Ronce",
          "text": "Je marche comme ça."
        },
        {
          "speaker": "Aloès",
          "text": "Depuis quand ?"
        },
        {
          "speaker": "Narration",
          "text": "Des patrouilles remontent le canal. Aloès rassemble de quoi soigner les défenseurs."
        },
        {
          "speaker": "Aloès",
          "text": "Je rejoins votre équipe. Cela ne vous dispense pas d'éviter les coups."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Le dispensaire tient. Aloès finit par examiner les racines de Ronce."
        },
        {
          "speaker": "Aloès",
          "text": "La prochaine fois que tu veux cacher une blessure, choisis quelqu'un de moins observateur."
        },
        {
          "speaker": "Baobab",
          "text": "Radis s'est endormi. Je vais veiller sur lui."
        },
        {
          "speaker": "Ronce",
          "text": "D'accord."
        },
        {
          "speaker": "Narration",
          "text": "Soulagée, Ronce reste pourtant un peu à l'écart. Elle ne sait pas encore partager sa peur."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "full_garden",
          "title": "Garder 10 végétaux sur le terrain",
          "target": 10
        },
        {
          "id": "plantings",
          "title": "Planter 9 végétaux",
          "target": 9
        }
      ],
      "restoration": "Le dispensaire tient. Aloès finit par examiner les racines de Ronce.",
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
      "briefing": [
        {
          "speaker": "Hibiscus",
          "text": "Vous tombez bien. Trois jardins veulent agir et aucun ne connaît le plan des deux autres."
        },
        {
          "speaker": "Papyrus",
          "text": "J'ai préparé un schéma des vannes."
        },
        {
          "speaker": "Hibiscus",
          "text": "Je peux réunir du monde. Mais il faudra l'expliquer sans employer trois fois « vanne » dans la même phrase."
        },
        {
          "speaker": "Narration",
          "text": "Une patrouille approche du rassemblement. Hibiscus guide les jeunes vers les abris."
        },
        {
          "speaker": "Hibiscus",
          "text": "Je reste avec les défenseurs. Ensuite, nous irons porter nos nouvelles ensemble."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les jardins décident de tenir les pépinières pendant qu'une équipe remontera vers la station."
        },
        {
          "speaker": "Acacia",
          "text": "L'Assoiffeur détourne le fleuve vers ses bassins. Nous connaissons ses rondes ; nous avons enfin assez de défenseurs."
        },
        {
          "speaker": "Hibiscus",
          "text": "Les messages circulent. Personne n'attendra un signal qui n'arrive pas."
        },
        {
          "speaker": "Ronce",
          "text": "Nous devons regarder ses réserves avant l'assaut."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "healthy",
          "title": "Terminer avec au moins 80 % de vitalité",
          "target": 80
        },
        {
          "id": "low_losses",
          "title": "Perdre au plus 3 végétaux",
          "target": 3
        }
      ],
      "restoration": "Les jardins décident de tenir les pépinières pendant qu'une équipe remontera vers la station.",
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
        "hibiscus"
      ],
      "objective": {
        "type": "containment",
        "target": 60
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "Une poudre claire couvre le bord d'un bassin. Un pollueur la touche, se contracte et tombe."
        },
        {
          "speaker": "Ronce",
          "text": "Vous avez vu ? Il suffirait d'en mettre dans leurs réserves."
        },
        {
          "speaker": "Acacia",
          "text": "La cendre blanche. Regarde autour du bassin avant de la toucher."
        },
        {
          "speaker": "Narration",
          "text": "Aucune herbe, aucun insecte. Les anciennes racines s'arrêtent à la limite de la poudre."
        },
        {
          "speaker": "Fougère",
          "text": "Leurs réserves rejoignent le fleuve. Nous devons isoler les cuves."
        },
        {
          "speaker": "Radis",
          "text": "Nous suivrons le plan des canaux."
        }
      ],
      "outro": [
        {
          "speaker": "Papyrus",
          "text": "Les cuves sont isolées. Les équipes locales les surveilleront pendant l'assaut."
        },
        {
          "speaker": "Ronce",
          "text": "Nous aurions pu les arrêter ici."
        },
        {
          "speaker": "Acacia",
          "text": "Et faire disparaître ce que nous essayons de sauver."
        },
        {
          "speaker": "Narration",
          "text": "Ronce replie une feuille contenant un peu de poudre. Elle la range sans rien dire."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "diversity",
          "title": "Réunir 4 espèces sur le terrain",
          "target": 4
        },
        {
          "id": "plantings",
          "title": "Planter 8 végétaux",
          "target": 8
        }
      ],
      "restoration": "Les cuves sont isolées. Les équipes locales les surveilleront pendant l'assaut.",
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
        "hibiscus"
      ],
      "objective": {
        "type": "water",
        "target": 65
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
      "briefing": [
        {
          "speaker": "Papyrus",
          "text": "Nous ouvrirons les passages l'un après l'autre. Chaque rive libérée doit rester protégée."
        },
        {
          "speaker": "Hibiscus",
          "text": "Les jardins attendent vos signaux."
        },
        {
          "speaker": "Baobab",
          "text": "Je peux tenir le canal avec Ronce."
        },
        {
          "speaker": "Ronce",
          "text": "Bien. Cette fois, on ne les laissera pas approcher des pousses."
        },
        {
          "speaker": "Radis",
          "text": "Les défenseurs avancent avec l'eau. Personne ne reste isolé."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "L'eau revient dans les premiers bassins. Au loin, la station entière se met à bouger."
        },
        {
          "speaker": "Pissenlit",
          "text": "Elle marche ! Les réservoirs ont des pattes !"
        },
        {
          "speaker": "Acacia",
          "text": "L'Assoiffeur vient reprendre ce qu'il croit lui appartenir."
        },
        {
          "speaker": "Papyrus",
          "text": "Gardez les ouvertures. Elles peuvent le déséquilibrer."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "no_refuge",
          "title": "Conserver les 5 refuges",
          "target": 5
        },
        {
          "id": "healthy",
          "title": "Terminer avec au moins 85 % de vitalité",
          "target": 85
        }
      ],
      "restoration": "L'eau revient dans les premiers bassins. Au loin, la station entière se met à bouger.",
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
        "hibiscus"
      ],
      "objective": {
        "type": "water",
        "target": 70
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "La station plonge ses tuyaux dans le courant. Les berges se fissurent sous l'aspiration."
        },
        {
          "speaker": "Papyrus",
          "text": "Si les conduites restent ouvertes, il ne pourra pas retenir tous les débits."
        },
        {
          "speaker": "Acacia",
          "text": "Les pépinières sont gardées. Occupons-nous de lui."
        },
        {
          "speaker": "Radis",
          "text": "Gardez vos positions jusqu'au dernier signal."
        },
        {
          "speaker": "Ronce",
          "text": "Noisetier, reste près de moi. La rive bouge."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les canaux ouverts déséquilibrent la station. Son noyau cède ; l'eau reprend le chemin des pépinières."
        },
        {
          "speaker": "Aloès",
          "text": "Ronce, cette racine est déchirée. Cette fois, tu te reposes."
        },
        {
          "speaker": "Ronce",
          "text": "La prochaine fois, je veux qu'ils tombent avant de nous atteindre."
        },
        {
          "speaker": "Narration",
          "text": "Les jardins se rétablissent. Acacia, Papyrus et Hibiscus confient leurs tâches à leurs proches. Baobab et Aloès choisissent aussi de poursuivre le voyage."
        },
        {
          "speaker": "Noisetier",
          "text": "Baobab prend trois places. Enfin… Il reste une noisette pour lui."
        },
        {
          "speaker": "Papyrus",
          "text": "Les pièces de la station viennent d'ateliers en Asie. Ils fabriquent de quoi étendre les colonies."
        },
        {
          "speaker": "Narration",
          "text": "Les compagnons préparent leur traversée. Ronce range soigneusement sa feuille de cendre blanche."
        }
      ],
      "midDialogue": [
        {
          "speaker": "Narration",
          "text": "Une berge cède. Ronce rattrape Noisetier, mais l'effort déchire une racine. Baobab s'ancre derrière eux."
        },
        {
          "speaker": "Papyrus",
          "text": "Radis, les conduites ! Si tu quittes ton poste, toute la ligne cède."
        },
        {
          "speaker": "Radis",
          "text": "Baobab, tiens-les ! Je reste. Nous allons ouvrir le passage."
        }
      ],
      "midWave": 3,
      "optionalGoals": [
        {
          "id": "full_garden",
          "title": "Garder 10 végétaux sur le terrain",
          "target": 10
        },
        {
          "id": "plantings",
          "title": "Planter 9 végétaux",
          "target": 9
        }
      ],
      "restoration": "Les canaux ouverts déséquilibrent la station. Son noyau cède ; l'eau reprend le chemin des pépinières.",
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
        "lavender"
      ],
      "objective": {
        "type": "smog",
        "target": 55
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "Une grande cité portuaire apparaît derrière la fumée. Depuis une terrasse, une enfant tend une planche à Radis."
        },
        {
          "speaker": "Mei",
          "text": "Attention au trou ! Ma grand-mère a de l'eau pour vous."
        },
        {
          "speaker": "Lavande",
          "text": "Trois ans que je travaille mon parfum, et on m'installe près des chaussures."
        },
        {
          "speaker": "Radis",
          "text": "Nous cherchons les ateliers qui fabriquent les pollueurs."
        },
        {
          "speaker": "Lavande",
          "text": "Commençons par mettre ce jardin à l'abri. Je vous accompagne ; je connais les terrasses et les voisins qui font semblant de ne pas nous entendre."
        }
      ],
      "outro": [
        {
          "speaker": "Mei",
          "text": "Le passage est sûr. Nous accueillons les petites plantes à l'intérieur."
        },
        {
          "speaker": "Lavande",
          "text": "Je vais prévenir les autres jardins. Il faudra parler fort, tout le monde tousse au mauvais moment."
        },
        {
          "speaker": "Narration",
          "text": "Plus loin, un homme chasse les voyageurs pour protéger sa citerne. Dans la rue voisine, des habitants réparent ensemble leurs filtres."
        },
        {
          "speaker": "Radis",
          "text": "Comment peuvent-ils agir si différemment ?"
        },
        {
          "speaker": "Acacia",
          "text": "Écoute ce qu'ils vivent. Tu n'auras pas toujours une réponse facile."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "healthy",
          "title": "Terminer avec au moins 80 % de vitalité",
          "target": 80
        },
        {
          "id": "low_losses",
          "title": "Perdre au plus 3 végétaux",
          "target": 3
        }
      ],
      "restoration": "Le passage est sûr. Nous accueillons les petites plantes à l'intérieur.",
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
        "bamboo"
      ],
      "objective": {
        "type": "repair",
        "target": 60
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
      "briefing": [
        {
          "speaker": "Bambou",
          "text": "Entrée par la gauche. Réserves à droite. Ne franchissez pas les lignes."
        },
        {
          "speaker": "Lierre",
          "text": "Cette rambarde rejoint pourtant le jardin voisin."
        },
        {
          "speaker": "Bambou",
          "text": "Ce passage n'est pas prévu."
        },
        {
          "speaker": "Narration",
          "text": "Un drone surgit d'une conduite derrière les défenses. D'autres pollueurs l'accompagnent."
        },
        {
          "speaker": "Radis",
          "text": "Nous devons ouvrir une autre sortie. Bambou, aide-nous à tenir pendant les réparations."
        },
        {
          "speaker": "Bambou",
          "text": "Je rejoins votre formation. Mais nous reparlerons de la rambarde."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les habitants ferment l'ancienne conduite et sécurisent le nouveau passage. Bambou regarde les ratures sur son plan."
        },
        {
          "speaker": "Bambou",
          "text": "Vous changez souvent d'avis aussi brusquement ?"
        },
        {
          "speaker": "Radis",
          "text": "Quand quelque chose ne fonctionne plus."
        },
        {
          "speaker": "Bambou",
          "text": "Je garderai quelques cases vides sur le prochain plan."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "diversity",
          "title": "Réunir 4 espèces sur le terrain",
          "target": 4
        },
        {
          "id": "plantings",
          "title": "Planter 8 végétaux",
          "target": 8
        }
      ],
      "restoration": "Les habitants ferment l'ancienne conduite et sécurisent le nouveau passage. Bambou regarde les ratures sur son plan.",
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
        "lotus"
      ],
      "objective": {
        "type": "water",
        "target": 65
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
      "briefing": [
        {
          "speaker": "Lotus",
          "text": "Les petites plantes attendent sur le bord le moins atteint. Je reste jusqu'à leur sortie."
        },
        {
          "speaker": "Fougère",
          "text": "Une conduite apporte la contamination depuis les ateliers."
        },
        {
          "speaker": "Papyrus",
          "text": "Les habitants peuvent la fermer. Nous devons protéger leurs postes."
        },
        {
          "speaker": "Lotus",
          "text": "Je vous aiderai. Je connais les endroits où l'eau arrive avant les secours."
        },
        {
          "speaker": "Ronce",
          "text": "Reste près des défenses. Personne ne te demandera de tenir seule."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "La conduite sale est isolée. Les dernières pousses sont installées dans des bacs propres."
        },
        {
          "speaker": "Lotus",
          "text": "Maintenant, je peux quitter le bassin."
        },
        {
          "speaker": "Radis",
          "text": "Tu reviendras ?"
        },
        {
          "speaker": "Lotus",
          "text": "Oui. Mais d'abord, je viens avec vous. L'eau relie encore beaucoup d'endroits blessés."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "no_refuge",
          "title": "Conserver les 5 refuges",
          "target": 5
        },
        {
          "id": "healthy",
          "title": "Terminer avec au moins 85 % de vitalité",
          "target": 85
        }
      ],
      "restoration": "La conduite sale est isolée. Les dernières pousses sont installées dans des bacs propres.",
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
      "briefing": [
        {
          "speaker": "Gingembre",
          "text": "Ils réparaient une porte. J'ai frappé avant qu'ils la referment."
        },
        {
          "speaker": "Aloès",
          "text": "Et toi, quand répares-tu ? Montre cette éraflure."
        },
        {
          "speaker": "Pissenlit",
          "text": "Sa porte vient vers nous. Avec le reste de la patrouille."
        },
        {
          "speaker": "Gingembre",
          "text": "D'accord, cette partie n'était pas prévue. Je prends ma place avec vous."
        },
        {
          "speaker": "Ronce",
          "text": "Enfin quelqu'un qui veut les atteindre avant qu'ils attaquent."
        },
        {
          "speaker": "Radis",
          "text": "On les arrête ensemble. Personne ne repart seul vers les ateliers."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les patrouilles sont contenues. Gingembre accepte enfin les soins d'Aloès."
        },
        {
          "speaker": "Gingembre",
          "text": "Leurs ateliers s'appellent Mille-Gueules. Il sort toujours une autre machine par une autre porte."
        },
        {
          "speaker": "Papyrus",
          "text": "Alors il faut interrompre les arrivées et les conduites, pas courir d'une porte à l'autre."
        },
        {
          "speaker": "Ronce",
          "text": "Pendant qu'on prépare, les toits continuent de s'étouffer."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "full_garden",
          "title": "Garder 10 végétaux sur le terrain",
          "target": 10
        },
        {
          "id": "plantings",
          "title": "Planter 9 végétaux",
          "target": 9
        }
      ],
      "restoration": "Les patrouilles sont contenues. Gingembre accepte enfin les soins d'Aloès.",
      "events": []
    },
    {
      "id": "mission_21",
      "title": "La passerelle blanche",
      "subtitle": "Le choix de Ronce",
      "act": 2,
      "location": "Le choix de Ronce",
      "startingEnergy": 760,
      "allowedPlants": [
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
        "ginger"
      ],
      "objective": {
        "type": "smog",
        "target": 65
      },
      "objectiveText": "Tenez le refuge pendant que la fumée coupe les passages.",
      "tip": "Protégez le jardin pendant l'évacuation, suivie dans la jauge. Pour cette mission, les épines de Ronce sont renforcées.",
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "Les quartiers les plus exposés sont évacués. Mei attend derrière une porte avec plusieurs jeunes pousses."
        },
        {
          "speaker": "Bambou",
          "text": "Les relais sont prêts. Lierre a renforcé les passerelles."
        },
        {
          "speaker": "Aloès",
          "text": "Ronce, tu n'as pas reposé ta racine."
        },
        {
          "speaker": "Ronce",
          "text": "Je me reposerai quand ils seront passés."
        },
        {
          "speaker": "Radis",
          "text": "On tient les abris. Dès que la fumée baisse, le prochain groupe traverse."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les habitants sont sauvés. Radis acclame Ronce ; Gingembre voudrait déjà repartir derrière elle."
        },
        {
          "speaker": "Lavande",
          "text": "Attendez. Les feuilles brunissent là où ses épines ont touché."
        },
        {
          "speaker": "Lotus",
          "text": "Une traînée rejoint la gouttière. Empêchons-la d'atteindre les citernes."
        },
        {
          "speaker": "Radis",
          "text": "Ronce, il faut retirer ce qui reste de poudre."
        },
        {
          "speaker": "Ronce",
          "text": "Et quand ils reviendront ?"
        },
        {
          "speaker": "Radis",
          "text": "On trouvera autre chose."
        },
        {
          "speaker": "Ronce",
          "text": "Comme pour le tilleul ? Je tenais la porte. J'ai tout fait, et il est mort quand même."
        },
        {
          "speaker": "Radis",
          "text": "Moi aussi, j'étais là."
        },
        {
          "speaker": "Ronce",
          "text": "Vous pouvez continuer à planter derrière eux. Moi, je vais les arrêter."
        },
        {
          "speaker": "Narration",
          "text": "Ronce disparaît avant l'aube. La cendre blanche a donné de la puissance à ses épines et laissé une blessure dans le groupe."
        }
      ],
      "midDialogue": [
        {
          "speaker": "Narration",
          "text": "Mille-Gueules épaissit brutalement la fumée. Ronce entend Mei derrière la porte, mais ne voit plus Radis."
        },
        {
          "speaker": "Ronce",
          "text": "Écartez-vous !"
        },
        {
          "speaker": "Narration",
          "text": "Elle enduit ses épines de cendre blanche. Les noyaux tombent à son contact ; elle dégage la passerelle."
        },
        {
          "speaker": "Gingembre",
          "text": "Vous avez vu ? Ils ne peuvent même plus l'approcher !"
        }
      ],
      "midWave": 2,
      "optionalGoals": [
        {
          "id": "healthy",
          "title": "Terminer avec au moins 80 % de vitalité",
          "target": 80
        },
        {
          "id": "low_losses",
          "title": "Perdre au plus 3 végétaux",
          "target": 3
        }
      ],
      "restoration": "Les habitants sont sauvés. Radis acclame Ronce ; Gingembre voudrait déjà repartir derrière elle.",
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
      "tip": "Ronce est partie. Composez une nouvelle équipe ; Chrysanthème affaiblit les protections ennemies.",
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
      "briefing": [
        {
          "speaker": "Radis",
          "text": "Il faut la retrouver. Elle peut encore être près du port."
        },
        {
          "speaker": "Chrysanthème",
          "text": "Les jardins attendent aussi votre signal. Vos départs ne sont décidément pas bien annoncés."
        },
        {
          "speaker": "Fougère",
          "text": "Ces pousses n'ont pas encore pu partir."
        },
        {
          "speaker": "Bambou",
          "text": "Je peux réorganiser la première ligne."
        },
        {
          "speaker": "Ortie",
          "text": "Ronce n'est pas juste une place vide à remplir."
        },
        {
          "speaker": "Radis",
          "text": "Je sais. Nous restons jusqu'à leur évacuation."
        },
        {
          "speaker": "Chrysanthème",
          "text": "Je vous rejoins. Je connais les relais, et je préfère surveiller les signaux moi-même."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les derniers jardins isolés reçoivent le signal. Les habitants rejoignent les passages sécurisés."
        },
        {
          "speaker": "Gingembre",
          "text": "J'ai trouvé sa force admirable. Puis j'ai vu les feuilles."
        },
        {
          "speaker": "Radis",
          "text": "Moi aussi."
        },
        {
          "speaker": "Chrysanthème",
          "text": "Vous pourrez lui parler quand nous l'aurons retrouvée. Pour l'instant, les ateliers se rallument."
        },
        {
          "speaker": "Ortie",
          "text": "Alors nous les arrêterons. Elle saura au moins où nous chercher."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "diversity",
          "title": "Réunir 4 espèces sur le terrain",
          "target": 4
        },
        {
          "id": "plantings",
          "title": "Planter 8 végétaux",
          "target": 8
        }
      ],
      "restoration": "Les derniers jardins isolés reçoivent le signal. Les habitants rejoignent les passages sécurisés.",
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
        "type": "repair",
        "target": 70
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
      "briefing": [
        {
          "speaker": "Papyrus",
          "text": "Les ateliers partagent plusieurs arrivées. Nous les fermerons progressivement."
        },
        {
          "speaker": "Mei",
          "text": "Ma grand-mère connaît les personnes qui entretiennent les filtres. Elles viennent vous montrer les conduites."
        },
        {
          "speaker": "Lavande",
          "text": "Nous couvrons leurs passages. Personne ne doit rester coincé entre deux ateliers."
        },
        {
          "speaker": "Chrysanthème",
          "text": "Un signal lorsque chaque équipe est prête. Gingembre, un signal reçu, pas imaginé."
        },
        {
          "speaker": "Gingembre",
          "text": "J'avais compris."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les premières cheminées s'éteignent. Les ateliers restants concentrent leur activité autour du noyau central."
        },
        {
          "speaker": "Bambou",
          "text": "Nos chemins de repli tiennent."
        },
        {
          "speaker": "Mei",
          "text": "Nous pouvons respirer un peu mieux près des fenêtres."
        },
        {
          "speaker": "Radis",
          "text": "Une dernière attaque. Ensuite nous suivrons la trace de Ronce."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "no_refuge",
          "title": "Conserver les 5 refuges",
          "target": 5
        },
        {
          "id": "healthy",
          "title": "Terminer avec au moins 85 % de vitalité",
          "target": 85
        }
      ],
      "restoration": "Les premières cheminées s'éteignent. Les ateliers restants concentrent leur activité autour du noyau central.",
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
        "type": "smog",
        "target": 75
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "L'atelier central ouvre ses portes. Derrière chacune, une nouvelle carcasse se met en mouvement."
        },
        {
          "speaker": "Gingembre",
          "text": "Cette fois, j'attends le signal."
        },
        {
          "speaker": "Chrysanthème",
          "text": "Le voici. Les équipes extérieures sont prêtes."
        },
        {
          "speaker": "Lavande",
          "text": "J'aimerais enfin savoir ce que sent cette ville sans les pneus."
        },
        {
          "speaker": "Radis",
          "text": "Nous tenons jusqu'à l'arrêt du dernier atelier."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Le noyau se sépare de ses conduites. Les dernières cheminées ralentissent, puis s'éteignent."
        },
        {
          "speaker": "Mei",
          "text": "Regardez. Là-haut. C'est du bleu."
        },
        {
          "speaker": "Radis",
          "text": "J'aurais voulu qu'elle le voie."
        },
        {
          "speaker": "Papyrus",
          "text": "Les registres indiquent des convois à travers l'Océanie, vers un site des Amériques : la Fournaise."
        },
        {
          "speaker": "Chrysanthème",
          "text": "Je maintiendrai les messages avec les jardins. Nous ne les perdrons plus de vue."
        },
        {
          "speaker": "Narration",
          "text": "Les habitants gardent les filtres en état. Un équipage propose d'emmener la troupe vers les archipels."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "full_garden",
          "title": "Garder 10 végétaux sur le terrain",
          "target": 10
        },
        {
          "id": "plantings",
          "title": "Planter 9 végétaux",
          "target": 9
        }
      ],
      "restoration": "Le noyau se sépare de ses conduites. Les dernières cheminées ralentissent, puis s'éteignent.",
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
        "type": "tide",
        "target": 60
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "Après une longue traversée, la troupe atteint une baie où les déchets reviennent à chaque marée."
        },
        {
          "speaker": "Palétuvier",
          "text": "Cette berge tient encore. Celle d'à côté, non."
        },
        {
          "speaker": "Radis",
          "text": "Nous pouvons vous aider à protéger le refuge."
        },
        {
          "speaker": "Palétuvier",
          "text": "Alors observons d'abord le courant. Les racines doivent tenir quand il change."
        },
        {
          "speaker": "Noisetier",
          "text": "Voilà une excellente raison de rester sur un sol immobile."
        },
        {
          "speaker": "Palétuvier",
          "text": "Je prends ma place avec vous. Ce sol l'est moins qu'il en a l'air."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les habitants dégagent les premiers débris et renforcent le refuge après la bataille."
        },
        {
          "speaker": "Palétuvier",
          "text": "Mes proches reprendront la garde. Vous aurez besoin de quelqu'un pour lire les berges."
        },
        {
          "speaker": "Lotus",
          "text": "Les courants apportent plus que ce qu'on peut retirer."
        },
        {
          "speaker": "Radis",
          "text": "Alors nous chercherons aussi ce qui les alimente."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "healthy",
          "title": "Terminer avec au moins 80 % de vitalité",
          "target": 80
        },
        {
          "id": "low_losses",
          "title": "Perdre au plus 3 végétaux",
          "target": 3
        }
      ],
      "restoration": "Les habitants dégagent les premiers débris et renforcent le refuge après la bataille.",
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
        "type": "repair",
        "target": 65
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
      "briefing": [
        {
          "speaker": "Pandanus",
          "text": "Si vous accueillez les plantes des rivages, il leur faut un endroit stable."
        },
        {
          "speaker": "Lierre",
          "text": "Je peux relier ces plateformes avec élégance."
        },
        {
          "speaker": "Pandanus",
          "text": "Avec des attaches, surtout. L'élégance n'a jamais retenu une caisse."
        },
        {
          "speaker": "Radis",
          "text": "Nous défendrons le chantier. Les équipages peuvent amarrer le jardin à leur bateau."
        },
        {
          "speaker": "Pandanus",
          "text": "Je vous accompagne. Je préfère vérifier mes réparations quand elles voyagent."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Le jardin flottant accueille ses premières plantes déplacées. Les habitants préparent leur retour dans des lieux adaptés."
        },
        {
          "speaker": "Lierre",
          "text": "Les attaches sont tout à fait élégantes."
        },
        {
          "speaker": "Pandanus",
          "text": "Elles tiennent. Nous pourrons discuter du reste en route."
        },
        {
          "speaker": "Noisetier",
          "text": "Ma caisse a une place au sec ?"
        },
        {
          "speaker": "Lavande",
          "text": "Et moi, loin du moteur."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "diversity",
          "title": "Réunir 4 espèces sur le terrain",
          "target": 4
        },
        {
          "id": "plantings",
          "title": "Planter 8 végétaux",
          "target": 8
        }
      ],
      "restoration": "Le jardin flottant accueille ses premières plantes déplacées. Les habitants préparent leur retour dans des lieux adaptés.",
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
        "type": "tide",
        "target": 65
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
      "briefing": [
        {
          "speaker": "Cocotier",
          "text": "J'avais prédit ce changement de courant."
        },
        {
          "speaker": "Pissenlit",
          "text": "Avant ou après la vague ?"
        },
        {
          "speaker": "Cocotier",
          "text": "Très près. Ce qui compte, c'est qu'elle annonce l'Avaleur."
        },
        {
          "speaker": "Palétuvier",
          "text": "Tu connais son trajet ?"
        },
        {
          "speaker": "Cocotier",
          "text": "Je surveille les nappes qu'il laisse derrière lui. Emmenez-moi ; je vous conduirai jusqu'à sa prochaine baie."
        },
        {
          "speaker": "Radis",
          "text": "D'abord, nous protégeons les habitants de celle-ci."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les embarcations passent la pointe et gagnent une eau plus calme. Cocotier repère une masse sombre à l'horizon."
        },
        {
          "speaker": "Cocotier",
          "text": "Il absorbe les épaves et rejette ce qui ne le nourrit pas."
        },
        {
          "speaker": "Fougère",
          "text": "Détruire tout cela d'un coup répandrait la pollution."
        },
        {
          "speaker": "Papyrus",
          "text": "Il faudra séparer ses réserves et contenir chaque partie."
        },
        {
          "speaker": "Cocotier",
          "text": "J'ai justement plusieurs questions sur la manière de faire."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "no_refuge",
          "title": "Conserver les 5 refuges",
          "target": 5
        },
        {
          "id": "healthy",
          "title": "Terminer avec au moins 85 % de vitalité",
          "target": 85
        }
      ],
      "restoration": "Les embarcations passent la pointe et gagnent une eau plus calme. Cocotier repère une masse sombre à l'horizon.",
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
        "type": "escort",
        "target": 65
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
      "briefing": [
        {
          "speaker": "Eucalyptus",
          "text": "Je garde ce terrain. Vous pouvez poursuivre votre route."
        },
        {
          "speaker": "Radis",
          "text": "Les pousses derrière toi ont besoin d'un refuge."
        },
        {
          "speaker": "Eucalyptus",
          "text": "Je le sais."
        },
        {
          "speaker": "Aloès",
          "text": "Alors acceptons d'abord de les mettre à l'abri. Nous pourrons préparer leur retour ensuite."
        },
        {
          "speaker": "Eucalyptus",
          "text": "Je prends l'arrière. Je viendrai avec vous jusqu'à ce qu'elles soient toutes en sécurité."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Eucalyptus arrive au refuge avec la dernière pousse. Il se retourne longtemps vers son ancien terrain."
        },
        {
          "speaker": "Palétuvier",
          "text": "On peut protéger un lieu en commençant par sauver ceux qui y vivent."
        },
        {
          "speaker": "Eucalyptus",
          "text": "Je veux apprendre comment le rendre accueillant. Je continuerai avec vous."
        },
        {
          "speaker": "Radis",
          "text": "Alors nous reviendrons mieux préparés."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "full_garden",
          "title": "Garder 10 végétaux sur le terrain",
          "target": 10
        },
        {
          "id": "plantings",
          "title": "Planter 9 végétaux",
          "target": 9
        }
      ],
      "restoration": "Eucalyptus arrive au refuge avec la dernière pousse. Il se retourne longtemps vers son ancien terrain.",
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
        "type": "containment",
        "target": 70
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
      "briefing": [
        {
          "speaker": "Banksia",
          "text": "Ne posez pas ce bidon près des graines. Certaines viennent de jardins qui n'existent plus."
        },
        {
          "speaker": "Radis",
          "text": "Tu les gardes depuis tout ce temps ?"
        },
        {
          "speaker": "Banksia",
          "text": "Quelqu'un doit se souvenir d'où elles pourront pousser."
        },
        {
          "speaker": "Papyrus",
          "text": "Nous pouvons isoler les arrivées de déchets autour de la réserve."
        },
        {
          "speaker": "Banksia",
          "text": "Je vous aiderai. Ensuite, j'emporterai une partie des graines dans votre jardin flottant."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "La réserve est sécurisée. Banksia répartit les graines entre plusieurs refuges avant de rejoindre la troupe."
        },
        {
          "speaker": "Radis",
          "text": "Il m'en reste une du tilleul. Je voudrais la ramener chez nous."
        },
        {
          "speaker": "Banksia",
          "text": "Montre ton enveloppe. Nous allons la conserver correctement."
        },
        {
          "speaker": "Radis",
          "text": "Tu crois que nous pourrons ?"
        },
        {
          "speaker": "Banksia",
          "text": "Nous préparerons le terrain avant de l'ouvrir."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "healthy",
          "title": "Terminer avec au moins 80 % de vitalité",
          "target": 80
        },
        {
          "id": "low_losses",
          "title": "Perdre au plus 3 végétaux",
          "target": 3
        }
      ],
      "restoration": "La réserve est sécurisée. Banksia répartit les graines entre plusieurs refuges avant de rejoindre la troupe.",
      "events": []
    },
    {
      "id": "mission_30",
      "title": "La trace blanche",
      "subtitle": "L'île traversée par Ronce",
      "act": 3,
      "location": "L'île traversée par Ronce",
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
        "type": "containment",
        "target": 75
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "Des carcasses gisent sur le rivage. Leurs plaques portent les marques des épines de Ronce."
        },
        {
          "speaker": "Jeune arbuste",
          "text": "Elle nous a sauvés. Les pollueurs ne bougent plus."
        },
        {
          "speaker": "Lavande",
          "text": "Les petites feuilles non plus. Regardez autour d'eux."
        },
        {
          "speaker": "Lotus",
          "text": "La poudre suit les rigoles jusqu'à la mer."
        },
        {
          "speaker": "Radis",
          "text": "Nous isolons ces traces. Puis nous reprenons sa piste."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les résidus sont contenus avant la marée. Les habitants indiquent la direction prise par Ronce."
        },
        {
          "speaker": "Radis",
          "text": "Quand elle nous a sauvés, j'étais heureux de sa force. Je n'ai rien vu d'autre."
        },
        {
          "speaker": "Lavande",
          "text": "Tu étais heureux qu'on soit vivants."
        },
        {
          "speaker": "Radis",
          "text": "Elle a dû croire que je comprenais."
        },
        {
          "speaker": "Lavande",
          "text": "Alors il faudra lui dire ce que tu comprends maintenant."
        },
        {
          "speaker": "Pissenlit",
          "text": "L'Avaleur approche de la lagune. Nous n'avons plus beaucoup de temps."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "diversity",
          "title": "Réunir 4 espèces sur le terrain",
          "target": 4
        },
        {
          "id": "plantings",
          "title": "Planter 8 végétaux",
          "target": 8
        }
      ],
      "restoration": "Les résidus sont contenus avant la marée. Les habitants indiquent la direction prise par Ronce.",
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
        "type": "repair",
        "target": 70
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
      "briefing": [
        {
          "speaker": "Fougère",
          "text": "Il y a quelqu'un dans ce bois."
        },
        {
          "speaker": "Mycélium",
          "text": "Plusieurs. Vous faites beaucoup de bruit au-dessus de nos filaments."
        },
        {
          "speaker": "Radis",
          "text": "Vous vivez dans les débris que transporte l'Avaleur ?"
        },
        {
          "speaker": "Mycélium",
          "text": "Nous suivons ce qui peut encore nourrir une vie. Nous connaissons les plaques qui cèdent et celles qu'il faut éviter."
        },
        {
          "speaker": "Pandanus",
          "text": "Guidez-nous. Nous préparerons les attaches pour séparer les poches toxiques."
        },
        {
          "speaker": "Mycélium",
          "text": "Nous joignons notre réseau à votre troupe."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les accès sont fixés. Mycélium révèle un passage vers le noyau, entre les matières encore vivantes."
        },
        {
          "speaker": "Pandanus",
          "text": "Les équipages retiendront les parties libérées loin de la lagune."
        },
        {
          "speaker": "Lierre",
          "text": "Je surveillerai les attaches avec toi."
        },
        {
          "speaker": "Pandanus",
          "text": "Bien. Cette fois, je te les confie."
        },
        {
          "speaker": "Radis",
          "text": "Nous avançons demain avec la marée."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "no_refuge",
          "title": "Conserver les 5 refuges",
          "target": 5
        },
        {
          "id": "healthy",
          "title": "Terminer avec au moins 85 % de vitalité",
          "target": 85
        }
      ],
      "restoration": "Les accès sont fixés. Mycélium révèle un passage vers le noyau, entre les matières encore vivantes.",
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
        "type": "tide",
        "target": 80
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "L'Avaleur avance avec une montagne d'épaves. Ses rejets obscurcissent l'entrée de la lagune."
        },
        {
          "speaker": "Cocotier",
          "text": "Les bateaux sont en place. Ils attendent notre signal."
        },
        {
          "speaker": "Mycélium",
          "text": "Le noyau est derrière les plaques humides. Nous pouvons les atteindre."
        },
        {
          "speaker": "Pandanus",
          "text": "Les attaches sont prêtes. On sépare les réserves avant de les déplacer."
        },
        {
          "speaker": "Radis",
          "text": "Gardons la lagune vivante."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Le noyau tombe. Les épaves se séparent en amas retenus par les embarcations, loin du refuge."
        },
        {
          "speaker": "Palétuvier",
          "text": "Le nettoyage prendra longtemps. Mais cette baie respire encore."
        },
        {
          "speaker": "Papyrus",
          "text": "Les cargaisons de cendre blanche partaient vers la Fournaise."
        },
        {
          "speaker": "Fougère",
          "text": "Ces réservoirs ont été arrachés. Les marques… C'est Ronce."
        },
        {
          "speaker": "Lotus",
          "text": "La Fournaise rejette dans un fleuve et par ses cheminées. Si elle y ouvre les cuves, le poison dépassera ses ennemis."
        },
        {
          "speaker": "Radis",
          "text": "Nous allons la retrouver. Avec les plans et l'aide de tous ceux que nous avons rencontrés."
        },
        {
          "speaker": "Narration",
          "text": "Le jardin flottant poursuit son travail avec les équipages. La troupe traverse vers les Amériques."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "full_garden",
          "title": "Garder 10 végétaux sur le terrain",
          "target": 10
        },
        {
          "id": "plantings",
          "title": "Planter 9 végétaux",
          "target": 9
        }
      ],
      "restoration": "Le noyau tombe. Les épaves se séparent en amas retenus par les embarcations, loin du refuge.",
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "Les voyageurs abordent près d'une région boisée. Un jeune séquoia barre un passage entre les carcasses."
        },
        {
          "speaker": "Séquoia",
          "text": "Les grands arbres savaient tenir. Je ne suis pas encore assez…"
        },
        {
          "speaker": "Baobab",
          "text": "Grand ? Regarde ceux qui attendent derrière toi. Ils savent déjà ce que tu protèges."
        },
        {
          "speaker": "Radis",
          "text": "Nous tiendrons avec toi."
        },
        {
          "speaker": "Séquoia",
          "text": "Alors je rejoins votre ligne. Dites-moi seulement si je prends trop de place."
        },
        {
          "speaker": "Noisetier",
          "text": "Nous avons de l'habitude."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Le passage est sécurisé. Les jeunes arbres retrouvent leurs proches derrière la lisière."
        },
        {
          "speaker": "Séquoia",
          "text": "Je voudrais voir ce que je peux faire ailleurs."
        },
        {
          "speaker": "Baobab",
          "text": "Tu auras des histoires à raconter en revenant."
        },
        {
          "speaker": "Pissenlit",
          "text": "La piste de Ronce continue vers des terres plus sèches. Un cactus l'aurait vue passer."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "healthy",
          "title": "Terminer avec au moins 80 % de vitalité",
          "target": 80
        },
        {
          "id": "low_losses",
          "title": "Perdre au plus 3 végétaux",
          "target": 3
        }
      ],
      "restoration": "Le passage est sécurisé. Les jeunes arbres retrouvent leurs proches derrière la lisière.",
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
        "type": "escort",
        "target": 70
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
      "briefing": [
        {
          "speaker": "Cactus",
          "text": "L'ombre est prise. L'eau aussi. La conversation n'est pas recommandée."
        },
        {
          "speaker": "Aloès",
          "text": "Nous cherchons une ronce blessée."
        },
        {
          "speaker": "Cactus",
          "text": "Elle portait des morceaux de machines. Elle a refusé l'eau et demandé le chemin de la Fournaise."
        },
        {
          "speaker": "Radis",
          "text": "Tu peux nous guider ?"
        },
        {
          "speaker": "Cactus",
          "text": "Quelqu'un doit éviter que vous preniez la route où tout s'effondre. Protégez les voyageurs, je vous montre le passage."
        },
        {
          "speaker": "Aloès",
          "text": "Merci."
        },
        {
          "speaker": "Cactus",
          "text": "Je n'ai pas encore demandé qu'on me parle."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Le groupe atteint un abri. Cactus distribue de l'eau en prétendant déplacer les récipients qui l'encombrent."
        },
        {
          "speaker": "Cactus",
          "text": "Votre amie souffre. Elle pense que marcher plus vite lui permettra de ne pas le sentir."
        },
        {
          "speaker": "Radis",
          "text": "Tu viens avec nous ?"
        },
        {
          "speaker": "Cactus",
          "text": "Vous savez déjà vous perdre. Je n'ai pas besoin de vérifier."
        },
        {
          "speaker": "Narration",
          "text": "Il prend pourtant la tête du groupe au matin."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "diversity",
          "title": "Réunir 4 espèces sur le terrain",
          "target": 4
        },
        {
          "id": "plantings",
          "title": "Planter 8 végétaux",
          "target": 8
        }
      ],
      "restoration": "Le groupe atteint un abri. Cactus distribue de l'eau en prétendant déplacer les récipients qui l'encombrent.",
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
        "type": "containment",
        "target": 75
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
      "briefing": [
        {
          "speaker": "Agave",
          "text": "Les convois empruntent ce passage. Chaque arrivée nourrit la Fournaise."
        },
        {
          "speaker": "Papyrus",
          "text": "Nous pouvons les immobiliser dans les bassins secs, puis isoler les écoulements."
        },
        {
          "speaker": "Agave",
          "text": "J'ai préparé les accès. Il me manque des défenseurs pour tenir les deux côtés."
        },
        {
          "speaker": "Bambou",
          "text": "Nous formerons une ligne."
        },
        {
          "speaker": "Radis",
          "text": "Et nous la tiendrons ensemble."
        },
        {
          "speaker": "Agave",
          "text": "Bien. Je viens jusqu'au bout."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les convois sont immobilisés dans les zones prévues. Les premières arrivées de déchets cessent."
        },
        {
          "speaker": "Agave",
          "text": "Un passage fermé. Il en reste d'autres."
        },
        {
          "speaker": "Radis",
          "text": "Nous aurons besoin des gens qui vivent autour du site."
        },
        {
          "speaker": "Cactus",
          "text": "Le prochain jardin les réunit déjà. Écoutez avant de leur annoncer votre plan."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "no_refuge",
          "title": "Conserver les 5 refuges",
          "target": 5
        },
        {
          "id": "healthy",
          "title": "Terminer avec au moins 85 % de vitalité",
          "target": 85
        }
      ],
      "restoration": "Les convois sont immobilisés dans les zones prévues. Les premières arrivées de déchets cessent.",
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
        "type": "repair",
        "target": 75
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
      "briefing": [
        {
          "speaker": "Dahlia",
          "text": "Bienvenue. Nous avions prévu une réunion, mais les câbles viennent d'être coupés."
        },
        {
          "speaker": "Hibiscus",
          "text": "Les voisins savent-ils où se rassembler ?"
        },
        {
          "speaker": "Dahlia",
          "text": "Oui. Ce qu'ils veulent savoir, c'est où ira l'eau quand vous fermerez les vannes."
        },
        {
          "speaker": "Papyrus",
          "text": "Nous devons reprendre le plan avec eux."
        },
        {
          "speaker": "Radis",
          "text": "D'abord, nous protégeons les réparations."
        },
        {
          "speaker": "Dahlia",
          "text": "Je vous accompagne. Ce qui se décide ici doit parvenir aux autres refuges."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les relais fonctionnent. Les habitants corrigent plusieurs dérivations pour protéger les quartiers en contrebas."
        },
        {
          "speaker": "Dahlia",
          "text": "Une lettre de Mei. Elle a dessiné sa fenêtre ouverte."
        },
        {
          "speaker": "Radis",
          "text": "Gardons-la près de la carte."
        },
        {
          "speaker": "Hibiscus",
          "text": "Les connaissances des cinq continents arrivent avec les messages et les équipages."
        },
        {
          "speaker": "Narration",
          "text": "Radis comprend que le voyage a relié des gens qui travaillaient chacun de leur côté."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "full_garden",
          "title": "Garder 10 végétaux sur le terrain",
          "target": 10
        },
        {
          "id": "plantings",
          "title": "Planter 9 végétaux",
          "target": 9
        }
      ],
      "restoration": "Les relais fonctionnent. Les habitants corrigent plusieurs dérivations pour protéger les quartiers en contrebas.",
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
        "type": "repair",
        "target": 80
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
      "briefing": [
        {
          "speaker": "Passiflore",
          "text": "L'entrée principale est mauvaise. J'en connais trois autres, dont deux excellentes."
        },
        {
          "speaker": "Lierre",
          "text": "Et la troisième ?"
        },
        {
          "speaker": "Passiflore",
          "text": "Je n'ai jamais pu aller jusqu'au bout. C'est celle qui m'intéresse."
        },
        {
          "speaker": "Chrysanthème",
          "text": "Naturellement."
        },
        {
          "speaker": "Radis",
          "text": "Peut-elle conduire à la salle centrale ?"
        },
        {
          "speaker": "Passiflore",
          "text": "Oui. Fixons des accès sûrs ; je vous guiderai ensuite. Je veux savoir ce qui se cache après."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les attaches sont installées. Passiflore atteint une conduite oubliée qui rejoint les installations centrales."
        },
        {
          "speaker": "Passiflore",
          "text": "Il y a des marques d'épines sur les parois."
        },
        {
          "speaker": "Radis",
          "text": "Elle est passée par ici."
        },
        {
          "speaker": "Chrysanthème",
          "text": "Les équipes extérieures doivent être prêtes avant notre entrée."
        },
        {
          "speaker": "Passiflore",
          "text": "D'accord. Je peux attendre. Un peu."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "healthy",
          "title": "Terminer avec au moins 80 % de vitalité",
          "target": 80
        },
        {
          "id": "low_losses",
          "title": "Perdre au plus 3 végétaux",
          "target": 3
        }
      ],
      "restoration": "Les attaches sont installées. Passiflore atteint une conduite oubliée qui rejoint les installations centrales.",
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
        "type": "containment",
        "target": 85
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "La Fournaise respire par ses cheminées. La décharge a englouti des ateliers et des usines ; son noyau organise maintenant les convois."
        },
        {
          "speaker": "Dahlia",
          "text": "Les registres montrent des années de dépôts oubliés. Même après le combat, il faudra empêcher les nouvelles arrivées."
        },
        {
          "speaker": "Lotus",
          "text": "Fermer ce canal envoie l'eau vers celui-ci. Les bassins isolés doivent être prêts."
        },
        {
          "speaker": "Papyrus",
          "text": "Chaque équipe a son poste. Nous attendons les réponses avant d'avancer."
        },
        {
          "speaker": "Radis",
          "text": "Nous sommes tous reliés. Gardons ces passages vivants."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les dérivations protègent enfin les zones habitées. Au-dessus du site, une branche épineuse traverse une cheminée."
        },
        {
          "speaker": "Cactus",
          "text": "Elle a trouvé la salle centrale."
        },
        {
          "speaker": "Passiflore",
          "text": "La conduite est libre. Je peux nous y mener."
        },
        {
          "speaker": "Radis",
          "text": "Alors on va chercher Ronce."
        },
        {
          "speaker": "Aloès",
          "text": "Et cette fois, elle rentre avec quelqu'un pour soigner ses blessures."
        }
      ],
      "midDialogue": [],
      "midWave": 0,
      "optionalGoals": [
        {
          "id": "diversity",
          "title": "Réunir 4 espèces sur le terrain",
          "target": 4
        },
        {
          "id": "plantings",
          "title": "Planter 8 végétaux",
          "target": 8
        }
      ],
      "restoration": "Les dérivations protègent enfin les zones habitées. Au-dessus du site, une branche épineuse traverse une cheminée.",
      "events": []
    },
    {
      "id": "mission_39",
      "title": "Je n'arrive plus à tout arrêter",
      "subtitle": "Le sauvetage de Ronce",
      "act": 4,
      "location": "Le sauvetage de Ronce",
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
        "type": "rescue",
        "target": 3
      },
      "objectiveText": "Brisez les trois excroissances contaminées et arrêtez les noyaux qui emprisonnent Ronce.",
      "tip": "Protégez l'opération de sauvetage et frappez les parties contaminées. Ronce ne rejoint pas encore l'équipe de combat.",
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
              "enemyId": "corrupted_bramble",
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "Ronce est suspendue au-dessus des conduites. Des plaques et des câbles emprisonnent ses tiges ; elle retient des cuves de cendre blanche."
        },
        {
          "speaker": "Ronce",
          "text": "N'approchez pas ! Si je détruis le cœur, ils ne pourront plus recommencer."
        },
        {
          "speaker": "Papyrus",
          "text": "Le circuit vient de changer. La Fournaise détourne le débit vers les sorties."
        },
        {
          "speaker": "Lotus",
          "text": "Le poison atteindra le fleuve avant nous."
        },
        {
          "speaker": "Narration",
          "text": "Une branche frappe malgré Ronce. Sous la plaque qui l'entoure, un noyau sombre s'est installé."
        },
        {
          "speaker": "Ronce",
          "text": "Je sais… Je n'arrive plus à tout arrêter."
        },
        {
          "speaker": "Radis",
          "text": "Nous allons dégager ce qui t'emprisonne. Reste avec nous."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "Les dernières excroissances cèdent. Radis atteint une petite poche de feuilles encore vertes."
        },
        {
          "speaker": "Ronce",
          "text": "Je voulais qu'on soit assez forts."
        },
        {
          "speaker": "Radis",
          "text": "Moi aussi. Sur la passerelle, je n'ai pas regardé ce que cela te coûtait."
        },
        {
          "speaker": "Ronce",
          "text": "Si je lâche les cuves, je ne pourrai plus les retenir."
        },
        {
          "speaker": "Radis",
          "text": "Regarde autour de toi. Les attaches, les racines, les mains. Nous sommes prêts."
        },
        {
          "speaker": "Narration",
          "text": "Ronce desserre ses tiges. Les équipes descendent les cuves fermées dans les bassins isolés. Aloès et Cactus la dégagent des carcasses."
        },
        {
          "speaker": "Ronce",
          "text": "Tu vois… Tu avais encore besoin qu'on te surveille."
        },
        {
          "speaker": "Narration",
          "text": "Radis rit malgré ses larmes. Sous eux, la Fournaise se réveille tout entière."
        }
      ],
      "midDialogue": [
        {
          "speaker": "Mycélium",
          "text": "La sève circule encore sous cette plaque. Suivez nos filaments jusqu'aux racines saines."
        },
        {
          "speaker": "Ronce",
          "text": "Je peux retenir cette branche… Quelques secondes. Passez !"
        },
        {
          "speaker": "Radis",
          "text": "Aloès, prépare les soins. Les autres attendent notre signal pour les cuves."
        }
      ],
      "midWave": 3,
      "optionalGoals": [
        {
          "id": "no_refuge",
          "title": "Conserver les 5 refuges",
          "target": 5
        },
        {
          "id": "healthy",
          "title": "Terminer avec au moins 85 % de vitalité",
          "target": 85
        }
      ],
      "restoration": "Les dernières excroissances cèdent. Radis atteint une petite poche de feuilles encore vertes.",
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
        "type": "containment",
        "target": 100
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
      "briefing": [
        {
          "speaker": "Narration",
          "text": "Des grues sortent des parois. Des pompes aspirent les bassins. Les ateliers libèrent leurs dernières carcasses."
        },
        {
          "speaker": "Pissenlit",
          "text": "Je reconnais ses mouvements. La grue frappe comme le Ramasseur."
        },
        {
          "speaker": "Papyrus",
          "text": "Trois réserves alimentent encore le cœur. Les équipes extérieures sont prêtes ; il faut protéger les postes jusqu'à leur fermeture."
        },
        {
          "speaker": "Ronce",
          "text": "Je peux me lever…"
        },
        {
          "speaker": "Aloès",
          "text": "Tu n'as plus rien à prouver aujourd'hui."
        },
        {
          "speaker": "Ronce",
          "text": "Alors j'aiderai à tenir cette conduite. Cactus, l'autre appui."
        },
        {
          "speaker": "Radis",
          "text": "Nous avançons avec tout ce que nous avons appris. Au dernier signal, ensemble."
        }
      ],
      "outro": [
        {
          "speaker": "Narration",
          "text": "La dernière vanne résiste. Radis plante ses racines dans ses rayons. Le métal ne bouge pas."
        },
        {
          "speaker": "Radis",
          "text": "J'ai besoin de vous !"
        },
        {
          "speaker": "Narration",
          "text": "Des racines rejoignent les siennes. Des mains saisissent le levier renforcé. La vanne tourne ; les réserves cessent d'alimenter la colonie."
        },
        {
          "speaker": "Narration",
          "text": "Le noyau exposé cède sous les attaques. Les bras mécaniques s'arrêtent. Le battement de la Fournaise s'interrompt."
        },
        {
          "speaker": "Ronce",
          "text": "C'est fini ?"
        },
        {
          "speaker": "Radis",
          "text": "Elle s'est arrêtée."
        },
        {
          "speaker": "Ronce",
          "text": "Bien. Parce que je commence à avoir une crampe absolument historique."
        },
        {
          "speaker": "Narration",
          "text": "Au-dehors, une voix annonce qu'une digue tient. Une autre demande de l'aide pour un tuyau. Le travail de restauration commence."
        }
      ],
      "midDialogue": [
        {
          "speaker": "Chrysanthème",
          "text": "Les jardins, les berges et les équipes des galeries répondent. Tous les signaux sont reçus."
        },
        {
          "speaker": "Gingembre",
          "text": "Cette fois, je sais pourquoi j'attends."
        },
        {
          "speaker": "Radis",
          "text": "Chaque poste gagné reste protégé. Nous avons besoin de tout le monde jusqu'à la dernière réserve."
        }
      ],
      "midWave": 3,
      "optionalGoals": [
        {
          "id": "full_garden",
          "title": "Garder 10 végétaux sur le terrain",
          "target": 10
        },
        {
          "id": "plantings",
          "title": "Planter 9 végétaux",
          "target": 9
        }
      ],
      "restoration": "La dernière vanne résiste. Radis plante ses racines dans ses rayons. Le métal ne bouge pas.",
      "events": []
    }
  ],
  "combat": {
    "abilities": [
      {
        "id": "ab_radish",
        "name": "Graines vaillantes",
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
          "fx_attack"
        ]
      },
      {
        "id": "ab_bramble",
        "name": "Étreinte épineuse",
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
          "fx_root"
        ]
      },
      {
        "id": "ab_hazel",
        "name": "Écorce obstinée",
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
          "fx_attack"
        ]
      },
      {
        "id": "ab_hazel_regeneration",
        "name": "Régénération de Noisetier",
        "description": "",
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
        "id": "ab_ivy",
        "name": "Prise de la verrière",
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
          "fx_root"
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
        "id": "ab_acacia",
        "name": "Haie des pépinières",
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
          "fx_attack"
        ]
      },
      {
        "id": "ab_baobab",
        "name": "Tronc refuge",
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
          "fx_attack"
        ]
      },
      {
        "id": "ab_baobab_protection",
        "name": "Protection de Baobab",
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
          "fx_protect"
        ]
      },
      {
        "id": "ab_baobab_regeneration",
        "name": "Régénération de Baobab",
        "description": "",
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
        "id": "ab_bamboo",
        "name": "Lance souple",
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
        "id": "ab_mangrove",
        "name": "Racines de berge",
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
          "fx_attack"
        ]
      },
      {
        "id": "ab_mangrove_protection",
        "name": "Protection de Palétuvier",
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
          "fx_protect"
        ]
      },
      {
        "id": "ab_mangrove_regeneration",
        "name": "Régénération de Palétuvier",
        "description": "",
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
        "id": "ab_pandanus_protection",
        "name": "Protection de Pandanus",
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
          "fx_protect"
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
        "id": "ab_sequoia",
        "name": "Promesse de géant",
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
          "fx_attack"
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
        "id": "ab_sequoia_regeneration",
        "name": "Régénération de Séquoia",
        "description": "",
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
        "id": "ab_factory_special",
        "name": "Mille-Gueules — onde spéciale",
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
          "fx_factory_special"
        ]
      },
      {
        "id": "ab_devourer_special",
        "name": "L’Avaleur — onde spéciale",
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
          "fx_devourer_special"
        ]
      },
      {
        "id": "ab_corrupted_bramble_special",
        "name": "Ronce contaminée — onde spéciale",
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
          "fx_corrupted_bramble_special",
          "fx_corrupted_bramble_special_stun"
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
        "id": "fx_factory_special",
        "name": "Mille-Gueules — impact",
        "description": "",
        "kind": "damage",
        "valueSource": "fixed",
        "amount": 32,
        "damageType": "physical",
        "duration": 1,
        "tickInterval": 1
      },
      {
        "id": "fx_devourer_special",
        "name": "L’Avaleur — impact",
        "description": "",
        "kind": "damage",
        "valueSource": "fixed",
        "amount": 32,
        "damageType": "physical",
        "duration": 1,
        "tickInterval": 1
      },
      {
        "id": "fx_corrupted_bramble_special",
        "name": "Ronce contaminée — impact",
        "description": "",
        "kind": "damage",
        "valueSource": "fixed",
        "amount": 25,
        "damageType": "physical",
        "duration": 1,
        "tickInterval": 1
      },
      {
        "id": "fx_corrupted_bramble_special_stun",
        "name": "Ronce contaminée — étourdissement",
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
              "ab_factory_special"
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
              "ab_factory_special"
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
              "ab_factory_special"
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
              "ab_devourer_special"
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
              "ab_devourer_special"
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
              "ab_devourer_special"
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
        "id": "ai_corrupted_bramble",
        "name": "Ronce contaminée — phases",
        "description": "Ancienne attaque spéciale représentée par des capacités globales. Les PV et dégâts de base ne changent pas entre niveaux.",
        "team": "enemies",
        "mode": "automatic",
        "fallback": "advance",
        "stopToAttack": true,
        "rules": [],
        "phases": [
          {
            "id": "ai_corrupted_bramble_p1",
            "name": "Approche",
            "healthBelow": 100,
            "speedFactor": 1,
            "attackFactor": 1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_corrupted_bramble_special"
            ],
            "onEnter": []
          },
          {
            "id": "ai_corrupted_bramble_p2",
            "name": "Colère",
            "healthBelow": 66,
            "speedFactor": 1,
            "attackFactor": 1.1,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_corrupted_bramble_special"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "Ronce contaminée change de tactique !"
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
            "id": "ai_corrupted_bramble_p3",
            "name": "Dernière offensive",
            "healthBelow": 33,
            "speedFactor": 1,
            "attackFactor": 1.2,
            "inheritAbilities": true,
            "abilityIds": [
              "ab_corrupted_bramble_special"
            ],
            "onEnter": [
              {
                "type": "message",
                "delay": 0,
                "text": "Ronce contaminée change de tactique !"
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
export function seedProject():GameProject{const p=structuredClone(GAME_SEED);ensurePresentation(p);return p;}
