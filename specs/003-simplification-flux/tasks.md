# Tâches : simplification des flux

## Phase 1 : Référence

- [x] T001 Capturer les différences et empreintes initiales dans work/structure ; lire les sources et consigner les deux couplages dans research.md.

## Phase 2 : Lecture sûre — US1

- [x] T002 [US1] Ajouter les régressions de lecture différée, arrêt et invalidation dans tests/ ; reproduire le défaut sur l’interface Electron actuelle.
- [x] T003 [US1] Implémenter le propriétaire de lecture et son hook sous src/renderer/ ; posséder chargements, annulation, horloge, audio et visibilité.
- [x] T004 [US1] Raccorder App.tsx aux commandes et à l’état affichable, retirer ses mutateurs et effets de lecture ; conserver validation des champs et cache d’images.

## Phase 3 : Usages directs — US2

- [x] T005 [US2] Ajouter l’analyse pure sous src/shared/presentation/usages.ts et les cas de films fermés/hors parcours/absents dans tests/presentation.test.ts.
- [x] T006 [US2] Retirer ancien service/IPC/types/bridge et calculs externalUsages dans App.tsx, GameEditor.tsx et PresentationEditor.tsx ; revalider la suppression sur le brouillon courant.
- [x] T007 [US2] Vérifier la protection visible et une suppression annulable avec réouverture dans un scénario tests/e2e/ isolé.

## Phase 4 : Préservation et livraison — US3

- [x] T008 [US3] Exécuter npm test/build et Electron ciblés, enregistrement/annulation/sélection/publication compris ; documenter tout échec dans validation.md.
- [x] T009 [US3] Synchroniser explicitement les copies techniques et contrôler Node/architecture/contrats/paquet du jeu ; vérifier empreintes et anciens changements.
- [x] T010 [US3] Actualiser docs/ARCHITECTURE.md, consigner validation.md et livrer le rapport dans outputs ; vérifier la convergence.

## Dépendances et répartition

Référence avant toute écriture. Les tests de course précèdent la refonte. Les axes lecture et usages peuvent avancer séparément, App.tsx et GameEditor.tsx restent modifiés par le responsable principal. Validation complète après intégration, synchronisation après génération, puis consommateur Godot. Les exemples parallèles sont les tests purs d’usages et de lecture, avec un seul build Electron à la fois.
