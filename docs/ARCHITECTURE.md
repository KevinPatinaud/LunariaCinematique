# Architecture

```text
React + TypeScript + SVG
    ↓ window.lunaria (API limitée)
Preload Electron / contextBridge
    ↓ IPC validé
Node.js / processus principal Electron
    ↓
Bibliothèque partagée + cinematic.json
    ↓
Lecteur GDScript dans Godot
```

## Modules

`src/renderer/components/Scene.tsx` : composition SVG, sélection, glisser, poignées, queues, aperçu. La manipulation utilise les coordonnées du canevas via sa matrice SVG, indépendamment de la taille de la fenêtre.

`Library.tsx` : arbre, catégories, recherche et vignettes. `Inspector.tsx` : propriétés contextuelles. `App.tsx` : orchestration des plans, historique, fichiers et lecture. `browserBridge.ts` est un adaptateur facultatif de test/édition web ; les accès disque de référence passent par Electron.

`src/shared/model.ts` : types, création et duplication. `geometry.ts` : mouvements, dispositions, zones des cadres et préparation à l'export. `schema.ts` : validation et génération du JSON Schema. `playback.ts` : machine de lecture pure. `history.ts` : historique borné et regroupement des frappes.

`src/main/index.ts` : fenêtres, cycle de vie, protocoles et handlers IPC. `files.ts` : confinement des chemins et sauvegarde. `library.ts` : scan et classification. `src/preload/index.cts` est compilé en CommonJS pour le preload sandboxé.

## Frontière locale de sécurité

Le renderer n'a pas d'accès Node direct : `nodeIntegration: false`, `contextIsolation: true`, sandbox activée. Le preload n'expose que les fonctions de l'éditeur, pas `ipcRenderer`, `fs`, `shell` ou `exec`. Chaque appel IPC vérifie son origine et sa fenêtre. La navigation externe, les nouvelles fenêtres et les permissions sont refusées.

`lunaria-asset://library/...` ne sert que des extensions d'images/audio autorisées sous la racine choisie, vérifiée par `realpath`. Le schéma `app://studio` sert le renderer empaqueté. Une CSP limite scripts et ressources. Le serveur Vite de développement n'écoute que 127.0.0.1 ; il n'y a pas de serveur HTTP métier en production.

Il s'agit de mesures de réduction de risque, **pas d'un audit de sécurité certifié**. Mettre à jour les dépendances et valider les versions avant distribution.

## Volumétrie

Le scan ignore les liens symboliques et les dossiers techniques/cachés, limite la profondeur à 20 et le nombre d'assets à 10 000. Les résultats sont affichés progressivement par lots de 60. Les miniatures Electron sont réduites à 360 px et mises en cache en mémoire (200 entrées maximum) ; les PNG sources ne sont pas réécrits.

Le lecteur aperçu conserve un petit cache d'images (24 entrées) et précharge les premiers plans à lire. Godot charge les textures du plan courant et du suivant. Ces limites ne constituent pas une garantie de fluidité sur téléphone : mesurer mémoire et performances sur les assets finaux.

Le JSON seul ne suffit pas au build du jeu : les ressources référencées doivent être présentes et incluses dans l'export Godot, une seule fois dans sa bibliothèque commune.

## Construction

Le projet utilise deux compilations TypeScript (renderer et principal), Vite pour le frontend et electron-builder pour les sorties Windows. Le script `npm run schema` régénère le JSON Schema et doit rester synchronisé avec la copie utilisée par Godot. Les scripts, tests et configurations sont inclus ; les dépendances et les binaires ne sont pas fournis.


## Cycle de document V1.2

`src/main/documents.ts` isole le cycle des fichiers du runtime Electron : destination courante, empreinte disque, file d’opérations, jeton de document et récupération. Les opérations sont testables avec Node sans installer Electron. Le preload n’expose que les commandes nécessaires ; le jeton permet d’écarter les requêtes retardées d’un projet remplacé.

`src/shared/assets.ts` centralise les catégories et extensions ; `editing.ts` regroupe les proportions et conversions de saisie ; `src/renderer/images.ts` possède le cache de décodage borné. Les images en cours de chargement ne peuvent pas remplacer un état historique du projet : App réapplique l’ajout dans l’état courant et dans son plan d’origine.

Le lecteur Godot V1.2 possède un `CinematicLayout.gd` pour préparer les champs dérivés. Son exécution et la parité visuelle doivent encore être testées dans le moteur.


## V1.4.3 — registre de projets récents

`RecentProjects` est un registre de métadonnées local, distinct des JSON de cinématiques et des versions de récupération. `ProjectHistory` coordonne les ouvertures/enregistrements validés de `DocumentFiles` avec ce registre et la reconnexion de bibliothèque. Les commandes du preload utilisent des identifiants opaques déjà présents dans le registre ; le sélecteur de fichiers reste côté Node/Electron. Toutes les nouvelles routes IPC utilisent le contrôle d’émetteur existant.

`RecentProjectsDialog` présente recherche, épingles, état des fichiers et actions. `App.tsx` réutilise le flux de confirmation/sauvegarde du document courant. Le retour au fichier déjà actif ne remplace pas le brouillon. Aucun des types `RecentProject` n’est sérialisé dans `cinematic.json`.
