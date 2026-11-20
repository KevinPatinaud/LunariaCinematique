# Plan : simplification des flux du Studio

**Initiative** : lunaria-structure-20261026-02
**Spécification** : [spec.md](spec.md)

## Contexte technique

React/TypeScript/Electron existants ; Godot 4.7.2 et Node 22. La session de projet reste l’unique propriétaire du document, de l’historique et des accès fichiers. Aucun package ajouté. Les instructions AGENTS, architecture, constitution et contrat commun ont été lus.

## Décisions d’architecture

1. Propriétaire de lecture local au renderer avec commandes start/restart/stop/togglePause/advance et instantané affichable. Le hook React ne transporte que l’état et le cycle de montage ; aucune réplique du document ni nouvel historique.
2. Invalidation des chargements par génération et contexte ; toute résolution/rejet tardif est ignoré. L’image, l’horloge et l’audio se nettoient au même arrêt.
3. Analyse pure des usages dans src/shared/presentation/usages.ts ; couvrir le projet entier et conserver le refus en cas de film absent. Retirer l’ancien IPC, le calcul du film ouvert et la prop externalUsages.
4. Revalider sur le brouillon actuel après confirmation, vérifier l’identifiant avant retrait, préserver une seule action annulable.
5. Synchroniser explicitement les sorties techniques après tests. Aucun changement de sémantique GDScript ni republication réelle ; vérifier le consommateur technique et le paquet.

## Constitution Check

- [x] Parcours auteur et Android conservés.
- [x] Contenus d’auteur et médias inchangés.
- [x] Accord Studio/Godot documenté, aucune migration.
- [x] Frontières renderer/preload/processus principal conservées et simplifiées.
- [x] Processus proportionné aux deux nœuds de couplage.
- [x] Régressions réelles et preuves Electron prévues.
- [x] Modifications préexistantes sauvegardées et contrôlées.

## Fichiers concernés

Studio : src/renderer/App.tsx, nouveau propriétaire/hook de lecture sous src/renderer/, src/shared/presentation/{runtime,usages}.ts, src/renderer/game/{GameEditor,bridge}, PresentationEditor.tsx, ancien service presentationUsages, interface/preload/IPC, tests ciblés et docs/ARCHITECTURE.md.
Jeu : copies techniques sous game/tools/design/ seulement, via le synchroniseur maintenu.

Le retrait d’un service inclut ses sorties compilées : scripts/clean-output.mjs et package.json purgent les seuls dossiers techniques connus avant test/schema/build, sans conserver de JavaScript orphelin.

## Vérification

Tests déterministes avec chargements différés, horloge/visibilité et audio contrôlés ; tests d’usages sur le projet complet. npm test/build et Electron audio, sélection, ordre de plans, session et publication. Empreintes avant/après ; synchronisation --check puis suites Node/contrats/paquet du jeu. Résultats et limites dans validation.md.
