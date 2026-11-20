# Tasks: Lierre unique

**Input**: spec.md, plan.md, recherche et demande acceptée.
**Initiative commune**: lunaria-lierre-20261025

## Phase 1: Préparation et contrat

- [x] T001 Cadrer spec.md, plan.md et les dépendances de l'initiative commune avec le jeu.
- [x] T002 Adapter src/shared/game/schema.ts au catalogue à 27–28 plantes et au style vine.

## Phase 2: User Story 1 — Lierre jouable et éditable

- [x] T003 [US1] Fusionner src/shared/game/seed.ts, combatDefaults.ts et combatMechanics.ts en un seul ivy et une capacité ab_ivy_binding.
- [x] T004 [US1] Créer src/shared/presentation/ivyPresentation.ts et adapter artisticDefaults.ts aux poses et clips du nouveau Lierre.
- [x] T005 [US1] Adapter libellés et tests courants des capacités, du comportement et de l'aperçu ; maintenir tests/fixtures/seed40.ts brut avec une frontière d'adaptation explicite.

## Phase 3: User Story 2 — Publication cohérente

- [x] T006 [US2] Valider la copie auteur avec les films 08–11, toutes les régions et les références au même catalogue.
- [x] T007 [US2] Générer les schémas et synchroniser scripts/sync-game-contract.mjs vers le jeu après adaptation du consommateur.
- [x] T008 [US2] Préflight et publication isolée via src/main/campaignPublisher.ts ; publier ensuite le projet réel autorisé.

## Phase 4: Validation et documentation

- [x] T009 Exécuter npm run typecheck, npm test et npm run build ; consigner résultats dans validation.md.
- [x] T010 Exécuter tests/e2e/ivy-attack.spec.ts et un parcours Electron isolé de l'auteur réel, incluant film 11.
- [x] T011 Vérifier les dépendances Godot et la cohérence du catalogue publié, puis constater la convergence.

## Dependencies & Execution Order

Préparation → données/schema et consommateur → poses/animations/auteur/récit → compilation Studio → synchronisation → publication isolée puis réelle → contrôles Godot/visuels/paquet → build et rapport. Les recherches indépendantes ont été déléguées selon speckit-plan ; les écritures du document auteur restent séquentielles.
