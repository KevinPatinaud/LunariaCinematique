# Validation V1.3 — résultats et limites

Date de livraison : 18 septembre 2026. Base : sources V1.2 fournies dans la conversation. Les résultats ci-dessous concernent le code V1.3 ; les rapports V1.2/V1.1 du dossier sont historiques.

## Résumé mesuré

| Contrôle | Résultat |
|---|---|
| Tests TypeScript / Node du modèle et du système de fichiers | **228 réussis, 0 échec, 0 ignoré** |
| Nouveaux tests automatisés par rapport aux 162 tests V1.2 | **66** : 44 composition/commandes/diagnostics/collections et 22 versions/fichiers |
| Parcours et assertions UI du renderer | **34 réussis** dans le harnais décrit ci-dessous |
| Exceptions JavaScript / erreurs console durant ces deux suites UI | **0** |
| Vérification syntaxique des sources TS/TSX/CTS | Réalisée par transpilation locale |
| Vérification sémantique auxiliaire du renderer | Réalisée avec déclarations React temporaires simplifiées ; ne vaut pas le typecheck complet |
| Six scénarios Playwright Electron fournis | **Non exécutés ici** ; suite `tests/e2e/studio.spec.ts` et workflow Windows inclus |
| Installation npm complète / build avec dépendances déclarées | **Non exécutés ici** : résolution réseau du registre npm indisponible |
| Typecheck complet avec les types exacts des dépendances | **Non exécuté ici** |
| Exécutable Windows / Godot / téléphone Android | **Non exécutés ici** |

## Tests du modèle et des fichiers

Exécution réelle de `npm test` : compilation des tests, puis exécution avec le runner natif de Node. Environnement : Linux, Node 22.16.0 ; TypeScript 5.8.3 disponible localement pour cette vérification, à distinguer de `~5.9.3` déclaré par le projet. Les types Node ont été fournis depuis l’installation locale ; aucune dépendance ou symlink local de test n’est distribué dans l’archive.

Les tests utilisent de vrais répertoires temporaires pour les JSON et la récupération. Ils couvrent notamment la rétention des vingt versions, la limite de fréquence, les scopes par fichier, les sauvegardes concurrentes, la capture immuable des entrées, la copie d’historique lors d’Enregistrer sous, les versions corrompues, les chemins invalides, les liens symboliques, la reprise de récupération, les tokens périmés et l’absence d’écriture dans le fichier source lors d’un chargement de version.

Les tests de composition couvrent la sélection et les déplacements groupés, les alignements et répartitions, la duplication des identifiants et des liens de locuteur, la suppression sûre, les modèles, le placement des bulles, les diagnostics, les favoris/récents et les commandes execute/undo/redo.

## Vérifications de l’interface

Le code React et TypeScript actuel a été transpilé et réellement exécuté dans **Chromium 144.0.7559.96** au moyen de Playwright. Le runtime disponible était **React / ReactDOM 19.1.1**, et non le `^19.3.0` déclaré dans le projet. Le harnais a extrait ce runtime de l’outillage local uniquement pour les essais ; il n’est pas livré dans les sources.

Le navigateur de cet environnement bloque la navigation réseau. L’interface a donc été chargée localement, avec ses styles et images fournis en mémoire. Le pont `window.lunaria`, le stockage local et les boîtes de fichiers ont été **simulés**. La géométrie, les composants, les événements de pointeur, le clavier, les fenêtres, le chargement des PNG et le moteur d’aperçu étaient ceux de l’application. Les tests des écritures Node, décrits plus haut, sont distincts et ne sont pas simulés.

Trois PNG géométriques temporaires ont servi aux essais de sélection/redimensionnement : ce ne sont pas des personnages Lunaria, ils ne sont ni distribués ni visibles dans la capture livrée. La capture d’interface présente uniquement les décors/cadres utilisateur de la bibliothèque d’exemple.

Les parcours comprennent : favoris et récents, insertion de trois objets, sélection multiple, déplacement au clavier et au pointeur, annulation, duplication/suppression de groupe, calques et verrouillage, masquage d’édition versus lecture, bulle liée et placement, continuité, modèle de dialogue, duplication configurable, raccourcis dans les fenêtres, repères, restauration annulable, conservation du fichier enregistré jusqu’à un Enregistrer explicite, diagnostics/corrections, ressource absente, modèle invalide, lecture et tailles de fenêtre 1024×720, 1200×780 et 1920×1080.

Les 34 noms et résultats sont conservés dans `validation-ui-v1.3.json`. Ils incluent deux contrôles transversaux d’absence d’erreurs JavaScript. Une assertion sur le déplacement utilise la matrice SVG réelle plutôt que la largeur CSS du canvas, afin de tenir compte des marges liées au ratio.

## Suite Electron livrée

`npm run test:e2e` effectue le build puis lance six scénarios dans Electron, avec le vrai processus main, le preload et les fichiers temporaires. Le profil de test est isolé du profil utilisateur. Les boîtes natives de choix de fichiers sont remplacées par des réponses déterministes ; les opérations d’ouverture/sauvegarde passent ensuite par les vrais IPC et services Node.

Scénarios : isolation du renderer/sauvegarde, manipulations multiples, persistance des favoris, continuité/modèle, restauration non destructive et diagnostics. Ils sont fournis pour être exécutés sur une machine équipée et par `.github/workflows/windows-check.yml`. Aucun résultat de cette suite native n’est revendiqué pour cette livraison.

## Ce qu’il reste à vérifier dans ton environnement

Après `npm install`, exécuter `npm run typecheck`, `npm test`, puis `npm run test:e2e`. Vérifier ensuite le démarrage Windows, les boîtes natives, la surveillance de ta bibliothèque complète, la lecture avec tes PNG et sons et l’intégration Godot/Android. Le lecteur Godot est inchangé par rapport à V1.2 ; le schéma reste à la version 1.

Les contrôles de diagnostics sont des règles connues, pas une preuve d’absence de défaut. Le placement des bulles est heuristique. Les aides de calques, les collections et l’historique sont locaux au poste ; l’historique ne remplace pas une sauvegarde externe.
