# Plan : livraison du projet

Node 22, TypeScript, React et Electron existants. Instructions, constitution, architecture et contrat commun consultés. Studio seul : aucun contrat publié ni port Godot modifié.

## Décisions

1. ProjectDelivery possède les commandes tester/publier/exporter/déployer et le suivi Android ; le hook relie son état à React. ProjectSession garde document, historique, run() et saveCurrent().
2. Retirer onBeforePublish, devenu un simple blur déjà effectué par run(). Capturer le projet après cette validation, puis vérifier époque, identité, état dirty/conflit et niveau avant l’appel natif.
3. Chaque déploiement transmet une identité interne dans la requête et les événements IPC. Un abonnement existe seulement pendant le déploiement correspondant et est retiré en fin/erreur/reset.
4. Capturer le token de saveCurrent et vérifier l’époque avant/après inspectConflict pour ignorer les résultats d’un ancien projet.
5. Tests avec promesses différées et vrai Electron, profils/projets isolés ; tous les appels de déploiement de test restent simulés.

## Constitution

- [x] Parcours auteur et messages utiles préservés.
- [x] Contenus et médias hors des fixtures.
- [x] Contrat publié et jeu inchangés.
- [x] Frontières React/preload/main réutilisées.
- [x] Responsabilité unique sans nouveau service global.
- [x] Régressions réelles et preuves honnêtes.
- [x] Changements antérieurs capturés et préservés.

## Fichiers

src/renderer/game/{GameEditor,ProjectDelivery,useProjectDelivery,AndroidDeploymentStatus}, App.tsx, src/shared/{projectSession,game/types}, src/preload/index.cts, src/main/index.ts, tests de session/livraison et Electron Android, docs/ARCHITECTURE.md. Les autres fichiers restent hors du lot.
