# Lunaria Studio V1.7 — rapport de validation

## Résultats effectivement obtenus

| Contrôle | Résultat | Portée |
|---|---:|---|
| Suite Node / TypeScript du Studio | 663 / 663 | 612 tests existants + 51 nouveaux. Modèles, opérations fichiers, validation, publication et syntaxe des sources. |
| Contrats et contrôles de sources du jeu | 89 / 89 | 67 contrôles adaptés + 22 nouveaux. Données, ordre, transitions pures partagées et câblage statique. Pas d’exécution GDScript. |
| Publieur cinématique Node existant | 49 / 49 | Régression des outils de publication sur de vrais fichiers temporaires. |
| Interface React exécutée | 34 contrôles | Ouverture, ordre, suppression, répétition, liaison, modes, sauvegarde, vérification, publication, dimensions. |
| Glisser-déposer supplémentaire au pointeur | 1 / 1 | Déplacement du dernier film avant le premier dans la vraie liste de l’interface. |
| Exemple six étapes fourni | valide | 3 niveaux, 3 films, 2 ressources communes résolues par le nouveau publieur. |

Les contrôles d’interface utilisent le véritable code React du Studio, compilé pour le banc d’essai, avec Chromium et les runtimes React 18.2 / ReactDOM 18.2 locaux. Le pont de test relie les appels aux véritables classes Node `GameDocuments`, `DocumentFiles`, `CampaignSources`, `planCampaign` et `publishCampaign`. Les sélections des boîtes de dialogue et les confirmations sont simulées. Les opérations de sauvegarde et de publication utilisent des dossiers temporaires réels, pas de réponses JSON inventées.

Les restrictions du navigateur local empêchant une navigation HTTP, le banc charge les scripts et styles en mémoire, fournit un stockage navigateur de test et transmet les appels Node via une liaison Playwright. Cela **ne teste pas le preload, l’IPC ni les fenêtres natives d’Electron**. Le runtime React 19.3 déclaré dans le projet n’a pas été installé dans cet environnement. Aucune dépendance de production n’a été remplacée pour faire passer ces essais.

La suite d’interface utilise un DataTransfer simulé pour sa vérification déterministe du réordonnancement ; un essai séparé de drag/drop au pointeur a également réussi. Les captures montrent l’interface réellement exécutée, avec une campagne et des chemins de test, pas une maquette. Les résolutions 1440×960 et 1120×780 ne présentent pas de débordement horizontal. Les listes et l’inspecteur défilent indépendamment.

## Corrections révélées par les essais

Une accolade JSX manquante dans le gestionnaire de dépôt a été corrigée ; un test de transpilation syntaxique de toutes les sources Studio empêche sa réapparition. La communication de l’état occupé entre les deux modes a été rendue réactive : un contrôle de fichiers terminé ne laisse plus le bouton Cinématiques désactivé. Les cartes ont été harmonisées avec le thème sombre, l’inspecteur revient en haut lors d’un changement de sélection, et les confirmations n’autorisent pas la perte des modifications.

La publication a été testée pour les films identiques issus de deux fichiers différents, les assets partagés, les erreurs d’identité, les chemins absolus ou traversants, les liens symboliques hors des racines autorisées, les fichiers manquants, les conflits sur une image déjà publiée, la republication identique, les verrous concurrents et le refus d’un ancien projet Godot. Le document de travail reste inchangé pendant la compilation du parcours publié.

## Ce qui n’a pas pu être validé

`npm run typecheck` a été exécuté et s’arrête sur **TS2688 : vite/client introuvable**, les dépendances complètes du projet n’étant pas disponibles et le réseau d’installation étant indisponible. Les tests Node compilent strictement leurs modules TypeScript, et la syntaxe de toutes les sources est contrôlée séparément ; cela **ne constitue pas** un typecheck complet avec les vrais types React/Electron.

La tentative `node tools/test-game.mjs --godot godot` réussit les contrôles Node, puis échoue dès `godot --version` avec **spawn godot ENOENT**. Aucun moteur Godot n’est installé ici. Les nouveaux scripts GDScript n’ont donc pas été compilés ni exécutés dans le moteur. Leur syntaxe n’a pas non plus été certifiée par un parseur GDScript externe.

Le test natif `tests/campaign_sequence_smoke.gd` est ajouté au lanceur maintenu. Il couvre les introductions, les films obligatoires, les callbacks périmés, les victoires, les replays, les sauvegardes courantes et le contrôleur de parcours. Trois nouveaux scénarios Electron natifs sont fournis dans `tests/e2e/campaign.spec.ts` ; les tests de niveaux ont été adaptés au nouvel écran par défaut. Ces tests fournis n’ont pas été exécutés ici.

Pas de build Electron Windows, pas d’EXE/APK construit, pas d’export Godot Windows/Android, pas de validation visuelle du jeu et pas de simulation complète de campagne. Les tests de lecture cinématique existants sont conservés dans le lanceur, sans prétendre qu’ils ont été exécutés.

## Vérifications à lancer sur le poste de développement

Dans le Studio :

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run test:e2e:built
```

Dans le jeu :

```powershell
node tools/test-game.mjs --static-only
node tools/test-game.mjs --godot "C:/Godot/Godot.exe"
```

Le chemin du moteur est à adapter. Après import, tester graphiquement : film initial obligatoire, interruption et reprise, défaite et reprise du niveau, victoire suivie de deux films, replay d’un niveau terminé, erreur sur un film absent, film final et rechargement de la sauvegarde. Vérifier ensuite les exports et l’équilibrage sur les appareils ciblés.

Les journaux Node, la tentative de typecheck et les résultats du banc d’interface sont livrés avec la documentation. Les limites ci-dessus restent valables même si une suite statique est entièrement verte.
