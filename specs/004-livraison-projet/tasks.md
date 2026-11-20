# Tâches : livraison du projet

## Référence

- [x] T001 Capturer état et empreintes dans work/delivery ; consigner la recherche dans research.md.

## US1 — Protocole commun

- [x] T002 [US1] Ajouter les tests différés de sauvegarde, modifications concurrentes, niveau et double action dans tests/project-delivery.test.ts.
- [x] T003 [US1] Créer ProjectDelivery et son hook ; raccorder GameEditor et retirer onBeforePublish de App/GameEditor.

## US2 — Progression liée à la requête

- [x] T004 [US2] Corréler les requêtes/événements dans game/types.ts, preload et main ; limiter l’abonnement au déploiement courant.
- [x] T005 [US2] Reproduire puis corriger l’événement tardif et le suivi d’un ancien projet dans tests/e2e/android-deployment.spec.ts.

## US3 — Préservation

- [x] T006 [US3] Protéger saveCurrent contre anciens conflits et ajouter les promesses différées dans tests/project-session.test.ts.
- [x] T007 [US3] Vérifier npm test/build et Electron concernés, conflits, sauvegarde, aperçu et publication compris.
- [x] T008 [US3] Comparer les empreintes, actualiser l’architecture, consigner validation.md et livrer le rapport ; effectuer la convergence.

## Dépendances

Référence et reproduction avant raccord. Tests d’un même fichier séquentiels. Le transport et le propriétaire doivent être intégrés ensemble avant build. Un seul groupe Electron à la fois. Les tâches T003/T004 sont couplées ; la session et ses tests peuvent être préparés séparément.
