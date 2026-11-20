# Tâches : nettoyage prioritaire — Studio

## Phase 1 : État initial

- [x] T001 Consigner l’état Git initial, les empreintes auteur et npm test de référence dans work/cleanup du chat.

## Phase 2 : Suppressions et cohérence

- [x] T002 [US1] Supprimer publishGameProject de src/main/gameDocuments.ts; faire exercer publishCampaign directement par les tests de publication existants.
- [x] T003 [US2] Rendre scripts/sync-game-contract.mjs responsable des copies du lecteur Godot et proposer une vérification --check sans écriture.
- [x] T004 [US2] Ajouter les régressions utiles de synchronisation : dérive, fichiers manquants, fichiers obsolètes, absence de modification de campagne et de médias.
- [x] T005 [US2] Retirer les copies compilées obsolètes ou inutiles prouvées par la recherche; conserver tous les modules requis par les outils et tests du jeu.
- [x] T006 [US1] Corriger le message de publication dans src/main/index.ts et les docs maintenues pour décrire le profil stable réellement utilisé par le jeu.

## Phase 3 : Vérifications et livraison

- [x] T007 [US3] Exécuter tests, build et scénario Electron concerné; synchroniser explicitement les seules sorties techniques nécessaires et vérifier --check.
- [x] T008 [US3] Consigner validation.md, contrôler les empreintes auteur et vérifier la convergence avec les tâches du dépôt jeu.

## Dépendances

État initial avant suppressions. Recherche et preuve de référence avant retrait. Tests de synchronisation avant utilisation sur le jeu. Tests des deux dépôts après synchronisation. Les fichiers d’un même dépôt sont modifiés séquentiellement; l’outillage de synchronisation et les suppressions du jeu peuvent avancer séparément.
