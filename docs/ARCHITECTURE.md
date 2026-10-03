# Architecture de Lunaria Studio

## Application et documents

Le renderer React est sous `src/renderer/`, le processus Electron sous `src/main/` et le preload sous `src/preload/index.cts`. Le renderer utilise le pont exposé par le preload ; il ne lit pas directement le disque avec Node. Electron configure l’isolation du contexte, les protocoles d’assets et les autorisations de dossiers.

Le document `lunaria-game-project` contient catalogues globaux, niveaux, parcours et `cinematics[]`. Les modes **Cinématiques** et **Niveaux** éditent le même état ; les films ne sont plus dispersés dans des fichiers obligatoires par plan. Les documents cinématiques autonomes restent importables. Les services de document gèrent fichier enregistré, jetons, historique, sauvegarde atomique, récupération locale et projets récents. La récupération et les versions locales ne remplacent pas Git.

`GameEditor` coordonne les commandes d’édition. Les panneaux de niveaux, attaques, personnages, événements et présentation modifient les données d’auteur. Les aperçus utilisent les fonctions partagées de géométrie, texte, mouvement et animation, plutôt qu’un second format de rendu.

## Contrats partagés

`src/shared/game/` définit schéma et validation des niveaux, combat, événements et campagne. `src/shared/presentation/` définit profils, animations, ownership, audio, VFX et calcul des poses. `src/shared/model.ts`, `schema.ts`, `motion.ts`, `bubbleEntry.ts`, `textAnimation.ts` et `cinematicAudio.ts` définissent les films et leur lecture. Les documents de jeu et films acceptent les versions prévues par leurs validateurs ; le catalogue d’animation utilise le schéma cinématique 4.

`npm run schema` compile et génère les schémas JSON. `scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game` copie les modules partagés compilés et schémas vers le jeu. Ce script ne publie pas la campagne et ne remplace pas un port GDScript nécessaire à une nouvelle sémantique.

## Bibliothèque et publication

Les médias restent sous la racine autorisée de la bibliothèque. Le JSON conserve des `library://` relatifs, sans chemin Windows absolu. Les services vérifient chemins, références, rôles de fichier et dimensions réelles ; ils refusent la sortie de racine et les conflits de contenu. Les images d’atlas se découpent par régions, sans fabriquer une copie PNG pour chaque frame.

`campaignPublisher.ts` construit une fermeture des ressources et films référencés. Son préflight est en lecture seule. La publication prépare films immuables et médias, réutilise les octets identiques et écrit `content/design/game_content.json` en dernier. Les données globales d’un ennemi archivé restent publiables pour les références existantes. Un conflit de fichier avec des octets différents bloque la publication ; les nouvelles versions artistiques doivent avoir un nouveau chemin.

Les fonctions de lancement et d’export réutilisent cette publication. Le jeu de test utilise une progression séparée. Les builds PC/Android utilisent les scripts du dépôt Godot ; l’éditeur n’assure pas à lui seul la signature de livraison ni les essais sur téléphone.

## Validation et références

`npm test` compile et exécute les tests Node ; `npm run build` vérifie les types et construit main/preload/renderer. Playwright lance Electron sur des fichiers et profils isolés. Les tests Godot protègent aussi les ports du lecteur. Une validation navigateur seule ne prouve pas le fonctionnement du pont Electron.

Voir le [guide](GUIDE_V1_10.md), les contrats de [campagne](ARCHITECTURE_CAMPAGNE.md), de [présentation](ARCHITECTURE_V1_10.md), le [format](FORMAT.md), l’[intégration](INTEGRATION_GODOT.md) et les [preuves datées](VALIDATION.md).
