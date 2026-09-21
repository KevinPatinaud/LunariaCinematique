# Rapport de validation · 18 septembre 2026

## Exécuté dans l'environnement de livraison

**57 tests automatisés réussis, 0 échec**, via le runner `node:test` après compilation TypeScript du cœur partagé, des services de fichiers et du scanner.

Les tests couvrent le schéma et les versions, les propriétés inconnues (y compris les clés de prototype), les références interdites, Unicode et espaces, les IDs, la duplication et le recâblage des bulles, le détachement d'un personnage, la géométrie, les mouvements, les retours à la ligne, les zones des cadres, le déroulement des dialogues, la pause, les transitions de plans, l'historique, le confinement des chemins, les liens symboliques, les sauvegardes temporaires et copies précédentes, la lecture JSON et le scan sans modification des assets.

Commande exécutée : compilation de `tsconfig.tests.json`, puis `node --test dist-tests/tests/*.test.js`. Environnement : Node 22.16.0 et TypeScript 5.8.3 disponible localement. Le manifeste cible TypeScript 5.9.3 pour l'installation utilisateur.

**17 vérifications d'interface réussies** dans Chromium avec Playwright : les composants React et leurs gestionnaires d'événements réels ont été chargés, pas une capture d'une maquette statique. Le pont `window.lunaria` était simulé et utilisait des données en mémoire ; les dialogues natifs et le protocole Electron ne sont donc pas testés par cette session. Une image géométrique neutre a servi de fixture personnage, sans être ajoutée à la bibliothèque livrée.

Le banc local disposait d'un runtime React 19.1.1 ; package.json déclare React 19.3.0. L'installation complète avec les versions déclarées doit être vérifiée sur la machine de développement. Les captures sont celles de l'interface React réelle avec le pont simulé, et non d'un exécutable Windows.

Vérifications effectuées :
- Accueil rendu sans erreur.
- Exemple : 3 plans, bibliothèque locale, images originales.
- Texte + cadre orné + export de lignes, sans images embarquées.
- Ajout et nommage d’un PNG personnage.
- Déplacement direct du personnage dans le SVG.
- Redimensionnement avec conservation des proportions.
- Retournement + annuler/rétablir.
- Bulle de BD automatiquement liée au personnage sélectionné.
- Queue repositionnée à la souris.
- Duplication du plan avec nouveaux IDs et liens cohérents.
- Réordonnancement des plans par glisser-déposer.
- Round-trip ouverture / sauvegarde du JSON.
- Lecture : une seule bulle visible, attente du clic au-delà de la durée.
- Pause, deux répliques séquentielles, changement de plan et fin.
- Référence manquante : aperçu bloqué, brouillon enregistrable.
- Fenêtre minimale 1160×740 sans débordement horizontal global.
- Aucune exception JavaScript non gérée pendant les interactions.

La syntaxe TS/TSX du renderer a été transpilée sans diagnostic syntaxique. Cette opération **ne remplace pas** un `npm run typecheck` complet avec les typings React/Electron installés.

## Non exécuté / restant à valider

L'environnement ne permettait pas l'installation réseau npm ; aucune installation complète des dépendances, aucun build Vite/Electron de production ni packaging Windows n'a été réalisé. Aucun binaire `.exe` n'est livré. Les versions déclarées doivent être installées, verrouillées et testées ensemble.

Godot n'était pas disponible. Le lecteur GDScript et son intégration ont été écrits et relus, mais **pas exécutés dans le moteur**. Ils ne sont pas certifiés pour une version particulière de ton projet ni pour Android. La synchronisation exacte du son, les imports de textures, les contrôles tactiles, les polices, les performances et l'export du jeu restent à vérifier.

Les mesures de confinement et tests ne constituent pas un audit de sécurité exhaustif. La gestion native des dialogues Windows, les règles de fichiers du système, la fermeture de la fenêtre, la récupération après crash réel et les installateurs doivent être essayés sur la plateforme cible.

## Vérification reproductible sur ta machine

```powershell
npm install
npm run typecheck
npm test
npm run build
npm start
```

Après validation, conserver `package-lock.json`, puis lancer `npm run dist:win` depuis Windows. La configuration GitHub Actions incluse n'a pas été exécutée par cette livraison ; elle offre un point de départ pour automatiser ces contrôles.

Les sources des 57 tests du cœur/fichiers sont dans `tests/`. Le harnais Chromium hors ligne était spécifique à l'environnement de livraison ; il n'est pas ajouté comme dépendance artificielle au projet. Ses vérifications manuelles sont à reprendre lors de la recette Electron.
