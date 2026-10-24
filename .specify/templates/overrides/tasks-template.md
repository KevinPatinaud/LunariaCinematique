# Tasks: [FEATURE NAME]

**Input**: `spec.md` et `plan.md` de cette fonctionnalité.
**Initiative commune**: [même identifiant que dans l'autre dépôt, si concerné].

## Règles

- Format : `- [ ] T001 [US1] action précise avec chemin réel`.
- Une tâche décrit un résultat ; `[P]` n'est utile que pour des fichiers et
  dépendances effectivement indépendants. Ce marqueur ne lance aucun sous-agent.
- Les tests sont choisis selon le risque ; une simple retouche documentaire ou
  visuelle réversible ne nécessite pas une nouvelle suite artificielle.
- Les tâches de l'autre dépôt sont référencées avec leurs dépendances ; elles ne
  deviennent pas terminées par la seule réussite de ce dépôt.

## Phase 1: Préparation et contrat

- [ ] T001 [US1] Vérifier les sources et critères de `spec.md` et `plan.md`.
- [ ] T002 [US1] [Si nécessaire] Adapter le contrat à sa source dans le Studio et
  identifier les fichiers générés ainsi que les lecteurs Godot concernés.

## Phase 2: User Story 1

**Goal**: [résultat utilisateur]
**Independent Test**: [scénario de réception]

- [ ] T003 [US1] [Implémentation dans les fichiers réels de ce dépôt].
- [ ] T004 [US1] [Si nécessaire] Adapter le producteur ou le lecteur du contrat
  et référencer le travail correspondant dans l'autre dépôt.
- [ ] T005 [US1] [Si nécessaire] Ajouter ou adapter le test qui vérifie le
  comportement et ses erreurs pertinentes, sans recopier l'implémentation.

## Phase 3: Validation et documentation

- [ ] T006 [US1] Exécuter les commandes pertinentes du plan, avec résultat et
  limites consignés dans `validation.md`.
- [ ] T007 [US1] [Si concerné] Vérifier un export Studio dans un projet Godot de
  test isolé ; ne pas remplacer la campagne réelle pour vérifier cette tâche.
- [ ] T008 [US1] Mettre à jour les documents qui font référence et vérifier les
  critères de réception ; conserver les essais non réalisés comme tels.

## Dependencies & Execution Order

[Indiquer les dépendances réelles, y compris entre dépôts. Supprimer les tâches
non applicables et ajouter les actions concrètes manquantes avant implémentation.]
