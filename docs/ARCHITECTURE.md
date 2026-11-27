# Architecture de Lunaria Studio

## Application et documents

Le renderer React est sous `src/renderer/`, le processus Electron sous `src/main/` et le preload sous `src/preload/index.cts`. Le renderer utilise le pont exposé par le preload ; il ne lit pas directement le disque avec Node. Electron configure l’isolation du contexte, les protocoles d’assets et les autorisations de dossiers.

Le document `lunaria-game-project` contient catalogues globaux, niveaux, parcours et `cinematics[]`. Les modes **Cinématiques** et **Niveaux** éditent le même état ; les films ne sont plus dispersés dans des fichiers obligatoires par plan. Les cinématiques sont intégrées au projet ; aucun film externe n’est importé ou lié. Les services de document gèrent fichier enregistré, jetons, historique, sauvegarde atomique, récupération locale et projets récents. La récupération du projet entier et son historique ne remplacent pas Git.

`GameEditor` coordonne les commandes d’édition. Les panneaux de niveaux, attaques, personnages, événements et présentation modifient les données d’auteur. Les aperçus utilisent les fonctions partagées de géométrie, texte, mouvement et animation, plutôt qu’un second format de rendu.

`renderer/game/ProjectDelivery.ts` possède le parcours commun de test de niveau, publication, export et déploiement. Il utilise `ProjectSession.run()` pour valider le champ actif et verrouiller l’opération, puis `saveCurrent()` avant l’appel natif. La version transmise est celle qui vient d’être enregistrée ; une modification, un conflit ou un remplacement de projet pendant l’attente bloque la livraison. Le hook `useProjectDelivery` relie son suivi à React et les boutons ne font que demander une action.

Les progrès Android portent l’identité de leur requête dans le transport interne. Le propriétaire ne les écoute que pendant le déploiement concerné et retire l’abonnement en fin, erreur ou changement de projet. Aucun identifiant de transport n’est enregistré dans le projet. Les résultats de sauvegarde et d’inspection de conflit sont également bornés à l’époque et au jeton du fichier qui a déclenché l’opération.

La lecture complète des cinématiques appartient à `renderer/playback/CinematicPlaybackSession.ts`. Elle possède chargements, horloge, pause, visibilité et audio ; le hook `useCinematicPlayback` la relie à React. L’écran commande démarrage, redémarrage, arrêt et avance sans modifier son état interne. Une génération de lecture invalide les attentes lors d’un arrêt ou d’un changement de film, projet, mode ou bibliothèque. L’arrêt débloque immédiatement un démarrage en cours, même si le décodage d’une image n’est pas encore terminé. L’aperçu ne modifie ni le document ni son historique.

## Contrats partagés

`src/shared/game/` définit schéma et validation des niveaux, combat, événements et campagne. `src/shared/presentation/` définit profils, animations, ownership, audio, VFX et calcul des poses. `src/shared/model.ts`, `schema.ts`, `motion.ts`, `bubbleEntry.ts`, `textAnimation.ts` et `cinematicAudio.ts` définissent les films et leur lecture. Les documents de jeu et films acceptent les versions prévues par leurs validateurs ; le catalogue d’animation utilise le schéma cinématique 4.

Le statut d’archivage des cinématiques et des niveaux appartient au document d’auteur. Le schéma d’auteur se génère dans `docs/game-project.schema.json`. La compilation retire ce statut de la sortie, validée par le schéma de publication `schema/game-project.schema.json`.

`src/shared/presentation/usages.ts` analyse les usages depuis le projet courant, films fermés, hors parcours et après borne compris. Cette analyse pure alimente l’affichage et le refus de suppression sans IPC ni actualisation manuelle. Après confirmation, le brouillon courant est revérifié et l’identifiant doit encore exister avant tout retrait. Une référence de film absente bloque une suppression dont les usages ne peuvent être établis.

`npm run schema` compile et génère les schémas JSON. `scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game` synchronise les schémas, le lecteur `godot/addons/lunaria_cinematics/` et la fermeture des modules compilés requis par les points d’entrée du contrat. Son option `--check` détecte les copies manquantes, divergentes ou obsolètes sans écrire. Le manifeste technique `tools/design/sync-manifest.json` côté jeu délimite les copies gérées ; les fichiers inconnus et les `.uid` du jeu sont conservés. Ce script ne publie pas la campagne et ne réalise pas un port GDScript nécessaire à une nouvelle sémantique. Voir le [contrat commun](CONTRAT_STUDIO_GODOT.md).

## Bibliothèque et publication

Les médias restent sous la racine autorisée de la bibliothèque. Le JSON conserve des `library://` relatifs, sans chemin Windows absolu. Les services vérifient chemins, références, rôles de fichier et dimensions réelles ; ils refusent la sortie de racine et les conflits de contenu. Les images d’atlas se découpent par régions, sans fabriquer une copie PNG pour chaque frame.

`campaignPublisher.ts` construit une fermeture des ressources et films référencés. Son préflight est en lecture seule. La publication prépare films immuables et médias, réutilise les octets identiques et écrit `content/design/game_content.json` en dernier. Les données globales d’un ennemi archivé restent publiables pour les références existantes. Un conflit de fichier avec des octets différents bloque la publication ; les nouvelles versions artistiques doivent avoir un nouveau chemin.

Les fonctions de lancement et d’export réutilisent cette publication. Le jeu de test utilise une progression séparée. Les builds PC/Android utilisent les scripts du dépôt Godot ; l’éditeur n’assure pas à lui seul la signature de livraison ni les essais sur téléphone.

## Validation et références

`npm test` compile et exécute les tests Node ; `npm run build` vérifie les types et construit main/preload/renderer. Playwright lance Electron sur des fichiers et profils isolés. Les tests Godot protègent aussi les ports du lecteur. Une validation navigateur seule ne prouve pas le fonctionnement du pont Electron.

`scripts/clean-output.mjs` purge uniquement les dossiers de compilation connus avant génération. Cela empêche un ancien service ou test dont la source a été supprimée de rester dans les sorties TypeScript ; les dossiers liés sont refusés. Les fichiers source, projets d’auteur et médias sont hors de ce nettoyage.

Voir le [guide](GUIDE_V1_10.md), les contrats de [campagne](ARCHITECTURE_CAMPAGNE.md), de [présentation](ARCHITECTURE_V1_10.md), le [format](FORMAT.md), l’[intégration](INTEGRATION_GODOT.md) et les [preuves datées](VALIDATION.md).
