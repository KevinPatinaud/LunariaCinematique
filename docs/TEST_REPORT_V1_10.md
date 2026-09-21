# Lunaria V1.10 — rapport de validation

Date : 21 septembre 2026. Ce rapport concerne les sources V1.10 jointes, pas les résultats des anciennes livraisons conservés dans les documents historiques.

## Résultats réellement exécutés

| Contrôle | Résultat | Portée réelle |
|---|---|---|
| `npm test` | **887 tests, 887 réussis, 0 échec** | TypeScript compilé puis tests Node : logique partagée, contrats, sources et opérations réelles de fichiers. Ce ne sont pas des tests UI ni du GDScript. |
| Nouveau `tests/presentation.test.ts` | **60 tests réussis**, inclus dans les 887 | Résolution, atlas, transformations, plans de libération, marqueurs de film sans gameplay, validations, historique, récupération, lecture des films liés et publication. |
| `node tools/test-game.mjs --static-only` | **163 tests de contrats/architecture + 49 tests Node de publication réussis** | Aucun moteur Godot. Contrôle du contenu actif et du catalogue cinématique embarqué exécuté également. |
| Publication réelle de l’atelier | **Réussie deux fois** | Vrais fichiers Node, vraie bibliothèque fournie, une cinématique, un niveau, 34 ressources uniques, 35 fichiers préparés hors contenu actif. La seconde publication réutilise les mêmes chemins. Dossier de test temporaire supprimé après contrôle. |
| Analyse TypeScript du cœur | Réussie | Cœur partagé, tests Node et modules principaux qu’ils importent. Compilateur disponible de secours, pas toolchain déclarée. |
| Analyse structurelle TSX | Sans diagnostic dans ce périmètre | Déclarations React simplifiées utilisées uniquement pour chercher des incohérences de composants. **Ce n’est pas le typecheck React réel**, ni un build, ni un essai visuel. |

### Compilateur effectivement utilisé

L’installation des dépendances déclarées a échoué. Pour rendre possible une partie de la validation, les tests ont été compilés avec **TypeScript 5.8.3**, **Node 22.16.0** et **@types/node 25.1.0**, disponibles dans l’environnement. Les versions déclarées sont TypeScript ~5.9.3 et @types/node ^22.0.0. Des liens temporaires de dépendances ont été utilisés localement ; ils ne figurent pas dans les archives.

Il ne faut donc pas lire « npm test réussi » comme « toutes les dépendances déclarées ont été installées et validées ». Le journal `npm-test-global-compiler.log` précise la commande réelle ; `available-toolchain.txt` précise les versions.

## Commandes tentées mais bloquées

| Commande | Résultat observé | Conséquence |
|---|---|---|
| `npm install --no-audit --no-fund --fetch-retries=0 --fetch-timeout=8000` | `EAI_AGAIN` sur `registry.npmjs.org` | Dépendances déclarées non installées. |
| `npm run typecheck` | Échec TS2688 : définition `vite/client` absente | Le typecheck complet React/Node/Electron n’est pas validé. |
| `npm run build` | Arrêt au même typecheck | Aucun bundle desktop complet construit. |
| `node tools/test-game.mjs` | Les contrôles Node réussissent puis `spawn godot ENOENT` | Import, compilation GDScript et tests Godot non exécutés. |

## Non exécuté — ne pas interpréter comme réussi

Import des ressources dans Godot, validation native des scripts, exécution du scheduler GDScript headless, tests natifs des snapshots v16, comparaison de poses TS/Godot, rendu des atlas/ancrages/miroirs, transitions hit/death/phases en combat, lecture des sons et VFX dans le moteur, essai visuel complet Radis→publication→combat→cinématique, lancement Electron natif et tests Playwright Electron, exports Windows/Android.

Les fichiers `tests/presentation_runtime_smoke.gd` et `tests/presentation_math_parity.json` sont fournis et intégrés au lanceur natif. Leur présence ne constitue pas une exécution. Aucun résultat ni capture de Godot ou d’Electron n’a été fabriqué.

## Ce qui reste à terminer avant validation de bout en bout

Installer la toolchain déclarée, réussir `npm test`, `npm run typecheck` et `npm run build` avec cette toolchain, lancer les tests Electron puis importer et tester le runtime avec Godot 4.7. Examiner et corriger tout diagnostic natif éventuel. Effectuer l’atelier visuel sur les appareils cibles, y compris pause/reprise, mort pendant préparation, profils partagés, réouverture du projet et récupération.

Ces étapes sont **restantes**, pas implicitement validées par les tests Node. L’implémentation source des fonctionnalités est livrée ; une version desktop/mobile certifiée fonctionnelle n’est pas livrée.

## Commandes à lancer localement

Studio :

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run test:e2e:built
npm start
```

Jeu :

```powershell
node tools/test-game.mjs --static-only
node tools/test-game.mjs --godot "C:/Outils/Godot/Godot_console.exe"
```

Pour isoler la nouvelle suite après un import réussi :

```powershell
& "C:/Outils/Godot/Godot_console.exe" --headless --audio-driver Dummy --path . --script res://tests/presentation_runtime_smoke.gd
```

Adapter le chemin à l’exécutable installé. Les essais visuels restent distincts des tests headless et l’export d’un EXE/APK reste distinct du lancement dans l’éditeur.

## Traçabilité fournie

`docs/validation-v1-10` contient les journaux sélectionnés : tests Node du Studio, tests Node du runtime, tentative native, publication réelle, échec d’installation, typecheck/build bloqués et versions des outils disponibles. Les manifestes de livraison contiennent les empreintes des fichiers emballés. Aucun `node_modules`, cache `.godot`, fichier de police, EXE ou APK n’est redistribué.
