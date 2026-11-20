# Tasks: poses de personnages

**Input**: spec.md et plan.md ; initiative poses-personnages-20261028.

## Phase 1: Préparation et contrat
- [x] T001 [US1] Vérifier les sources, Masters et parcours dans research.md.
- [x] T002 [US1] Définir demande, résultat et cible dans src/shared/poseGeneration.ts et imageTasks.ts.

## Phase 2: User Story 1
- [x] T003 [US1] Tester référence, consigne et contrôles du service dans tests/pose-generation.test.ts.
- [x] T004 [US1] Implémenter service principal, transport multi-images et IPC.
- [x] T005 [US1] Ajouter le formulaire et l’action dans Inspector/App.

## Phase 3: User Stories 2 et 3
- [x] T006 [US2] Ajouter import et affectation ciblée annulable dans PoseTaskActions et les fonctions partagées.
- [x] T007 [US3] Intégrer les poses au panneau ImageTasks et tester reprise/annulation.
- [x] T008 [US2] Tester le parcours Electron, les changements de destination, sauvegarde/réouverture et la publication isolée.

## Phase 4: Validation et documentation
- [x] T009 Exécuter typecheck, tests, build et scénarios Electron concernés.
- [x] T010 Vérifier un appel Codex réel et la lecture Godot ou consigner précisément les limites externes.
- [x] T011 Documenter le parcours dans docs/POSES_PERSONNAGES.md et docs/TACHES_IMAGES.md ; consigner validation.md.

## Dependencies & Execution Order
T001 → T002 → T003/T004 → T005/T006 → T007/T008 → T009/T010 → T011. Les composants partagés sont modifiés séquentiellement ; aucune publication de la campagne réelle.

