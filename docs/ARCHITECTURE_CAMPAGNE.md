# Contrat de campagne Studio → Godot

## Projet d’auteur

Le document `kind: lunaria-game-project`, schéma courant **4**, contient `balance`, `combat`, `presentation`, `logic`, `levels`, `cinematics`, `campaign` et `homeScreen` selon leurs contrats et options. `cinematics[]` conserve les films complets. Un document neuf n’a pas de niveau ; le seed fournit les catalogues globaux. Les champs retirés ne font plus partie du format courant ; aucune migration des anciennes sauvegardes joueur n’est requise.

Pour Lunaria, éditer `C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json` avec la bibliothèque source `C:/dev/Lunaria/LunariaArtLibrary`. Le JSON sous `game/content/design/` est compilé, pas le fichier principal de montage.

## Parcours et niveaux

`campaign.steps[]` contient des étapes `level` avec `levelId`, `cinematic` avec `cinematicId` et `skippable`, ou une unique borne `end` sans autre réglage. Les identifiants d’étapes sont stables et uniques. La borne indique la fin actuelle de la partie jouable : les étapes suivantes restent dans le document Studio et sont exclues de la publication. Godot conserve le curseur sur cette borne et affiche le message de fin ; un callback ne peut pas la franchir. Sans borne, la dernière étape termine la campagne. `campaign.cinematics[]` associe la référence du parcours au `documentId` du film, son titre et son fichier publié. L’ordre du navigateur de films et ses catégories n’affectent pas cet ordre de jeu.

Un niveau référence les espèces du catalogue, toutes disponibles via `allowedPlants`, sans composition d’équipe. Statistiques, capacités et profils sont partagés. `terrainImage`, vagues, objectif, primes de graines et événements sont propres au niveau. Une copie n’est pas automatiquement ajoutée au parcours ; une nouvelle création l’est. Le jeu déduit sa carte et sa progression du parcours publié et traite explicitement un parcours vide.

Les niveaux peuvent utiliser défense, plateau occupé, case protégée, conquête des allées, escorte des jeunes pousses ou foyers invasifs. Les coordonnées JSON sont indexées depuis zéro ; les contrôles du Studio sont affichés depuis un. Les champs historiques de croissance, difficulté, équipe et bonus ne sont pas à réintroduire dans un document courant.

Pour `objective.type: "escort"`, `objective.target` reste 0 (cible calculée). Le champ `escort` contient `laneCounts` (cinq entiers 0–20), `speed` (0,03–0,23 case/s), `maxHp` (1–6000), `departureInterval` (1–60 secondes) et `image` (PNG/WebP `library://`). Le total doit être positif. Le champ est réservé à ce mode ; l’image appartient à la fermeture de publication. La cible calculée vaut cinq captures : les arrivées des pousses restent informatives et ne contribuent pas à la progression. La cinquième capture déclenche immédiatement la victoire, même si des pousses sont encore en route ou attendent leur départ. Les acteurs de mission sont distincts des plantes de combat : ils ne bloquent pas leurs mouvements. Le format de sauvegarde 29 conserve des enregistrements bornés `escort_sprouts`, vérifiés contre la mission avant restauration ; les paramètres et l’image sont reconstruits depuis la campagne.

## Publication et références

`homeScreen` conserve la composition de l’accueil (fond, libellés de continuation et éléments ordonnés en coordonnées 1280 × 720). Le Studio fournit les réglages sous **Écran d’accueil**. La compilation conserve ce contrat et ajoute les images qu’il référence à la fermeture de médias ; Godot associe les actions des boutons aux destinations existantes et calcule les textes et la barre de progression depuis le profil joueur. Voir [ACCUEIL.md](ACCUEIL.md) pour les types, les tokens de texte et les conditions d’affichage.

Le préflight résout les films atteignables par le parcours, les événements et comportements, valide schémas et références, puis examine fichiers et régions d’atlas. Les films inutilisés restent dans le document d’auteur. Le catalogue global conserve ses entrées d’auteur, y compris les ennemis archivés encore référencés.

La publication écrit des films immuables adressés par contenu et leur fermeture de médias dans le projet Godot. `content/design/game_content.json` est remplacé atomiquement en dernier. Le profil joueur conserve le chemin stable `user://lunaria_profile.json`. Le jeu réassocie la progression aux identifiants des niveaux et étapes ; un combat suspendu incompatible doit être recommencé. Le format courant et ses validations sont définis dans le dépôt jeu par `game/domain/serialization/save_schema.gd` et `game/domain/serialization/profile_archive.gd`.

Si un média a changé dans la bibliothèque source, la publication conserve l’ancienne copie et crée automatiquement une version adressée par son SHA-256 dans `LunariaArtLibrary/studio_versions/`. Les références du catalogue et des films publiés pointent vers cette version ; les noms, références et fichiers du projet de travail restent inchangés. Une publication identique réutilise la même copie. Une destination versionnée altérée reste bloquante. Ce mécanisme s’applique aussi à « Jouer ce niveau » et aux exports. La synchronisation des schémas/modules est séparée de cette publication.

Voir le [guide](GUIDE_V1_10.md), le [format cinématique](FORMAT.md), la [présentation](ARCHITECTURE_V1_10.md) et l’[intégration Godot](INTEGRATION_GODOT.md). Les tests de campagne réelle sont distincts des fixtures historiques à 40 niveaux.
