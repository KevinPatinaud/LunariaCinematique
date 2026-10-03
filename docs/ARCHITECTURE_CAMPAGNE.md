# Contrat de campagne Studio → Godot

## Projet d’auteur

Le document `kind: lunaria-game-project`, schéma courant **4**, contient `balance`, `combat`, `presentation`, `logic`, `rewards`, `levels`, `cinematics` et `campaign` selon leurs contrats et options. `cinematics[]` conserve les films complets. Un document neuf n’a pas de niveau ; le seed fournit les catalogues globaux. Les formats anciens sont traités par les chemins d’import, sans promettre la migration des sauvegardes joueur.

Pour Lunaria, éditer `C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json` avec la bibliothèque source `C:/dev/Lunaria/LunariaArtLibrary`. Le JSON sous `game/content/design/` est compilé, pas le fichier principal de montage.

## Parcours et niveaux

`campaign.steps[]` contient des étapes `level` avec `levelId`, ou `cinematic` avec `cinematicId` et `skippable`. Les identifiants d’étapes sont stables et uniques. `campaign.cinematics[]` associe la référence du parcours au `documentId` du film, son titre et son fichier publié. L’ordre du navigateur de films et ses catégories n’affectent pas cet ordre de jeu.

Un niveau référence les espèces du catalogue, toutes disponibles via `allowedPlants`, sans composition d’équipe. Statistiques, capacités et profils sont partagés. `terrainImage`, vagues, objectif, récompenses, événements et dialogues sont propres au niveau. Une copie n’est pas automatiquement ajoutée au parcours ; une nouvelle création l’est. Le jeu déduit sa carte et sa progression du parcours publié et traite explicitement un parcours vide.

Les niveaux peuvent utiliser défense, case protégée, opération, sauvetage, conquête des allées, escorte des jeunes pousses ou foyers invasifs. Les coordonnées JSON sont indexées depuis zéro ; les contrôles du Studio sont affichés depuis un. Les champs historiques de croissance, difficulté, équipe et bonus ne sont pas à réintroduire dans un document courant.

Pour `objective.type: "escort"`, `objective.target` reste 0 (cible calculée). Le champ `escort` contient `laneCounts` (cinq entiers 0–20), `speed` (0,03–0,23 case/s), `maxHp` (1–6000), `departureInterval` (1–60 secondes) et `image` (PNG/WebP `library://`). Le total doit être positif. Le champ est réservé à ce mode ; l’image appartient à la fermeture de publication. La cible calculée vaut cinq captures plus le nombre de pousses. Les acteurs de mission sont distincts des plantes de combat : ils ne bloquent pas leurs mouvements. Le format de sauvegarde 26 conserve des enregistrements bornés `escort_sprouts`, vérifiés contre la mission avant restauration ; les paramètres et l’image sont reconstruits depuis la campagne.

## Publication et références

Le préflight résout les films atteignables par le parcours, les événements et comportements, valide schémas et références, puis examine fichiers et régions d’atlas. Les films inutilisés restent dans le document d’auteur. Le catalogue global conserve ses entrées d’auteur, y compris les ennemis archivés encore référencés.

La publication écrit des films immuables adressés par contenu et leur fermeture de médias dans le projet Godot. `content/design/game_content.json` est remplacé atomiquement en dernier. La modification de la campagne produit une autre empreinte de profil joueur ; le format de sauvegarde courant est **26**, sans migration obligatoire des profils précédents.

Un conflit de média est bloquant. Renommer une nouvelle version et corriger ses références plutôt que remplacer silencieusement des octets déjà publiés. La synchronisation des schémas/modules est séparée de cette publication.

Voir le [guide](GUIDE_V1_10.md), le [format cinématique](FORMAT.md), la [présentation](ARCHITECTURE_V1_10.md) et l’[intégration Godot](INTEGRATION_GODOT.md). Les tests de campagne réelle sont distincts des fixtures historiques à 40 niveaux.
