# Implementation Plan: Nettoyage prioritaire — Studio

**Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)
**Initiative commune**: lunaria-cleanup-20261026-01

## Summary

Supprimer les anciens points d’entrée et archives de code sans usage, corriger la commande CI inexistante, puis assurer une source identifiable et un contrôle sans écriture des copies techniques. Garder les formats et fonctions de création actuels.

## Technical Context

- **Stack existante**: Electron, React, TypeScript, Node 22.
- **Racine**: C:/dev/Lunaria cinematic studio.
- **Sources consultées**: AGENTS.md, constitution, architecture, contrat commun, références par rg, état Git, validateurs et lecteurs réels.
- **Contraintes**: modifications en cours conservées, tests isolés, aucun média ou document d’auteur réécrit.
- **Testing**: Node/architecture et suites Godot côté jeu; npm test/build et scénario Electron concerné côté Studio; comparaison des copies et des empreintes.

## Constitution Check

- [x] Parcours auteur et Android préservés.
- [x] Sources auteur et sorties techniques identifiées.
- [x] Contrat commun consulté, aucun changement de format fonctionnel.
- [x] Architecture et points d’entrée maintenus réutilisés.
- [x] Régressions nécessaires aux écritures de synchronisation et publication.
- [x] État Git initial consigné, profils et fichiers auteur non utilisés comme fixtures.

## Project Structure

src/main/gameDocuments.ts, src/main/index.ts, scripts/sync-game-contract.mjs, tests/game-authoring.test.ts, tests de synchronisation et docs/ maintenus.

## Impact Studio → publication → Godot

| Étape | Responsable | Changement | Vérification |
| --- | --- | --- | --- |
| Auteur / médias | Studio | Aucun | Empreintes identiques |
| Formats | Studio | Aucun changement sémantique | Tests de contrats existants |
| Publication | Studio | Façade retirée, tests sur le chemin courant | Tests isolés et Electron |
| Copies techniques | Studio → jeu | Synchronisation du lecteur et contrôle de dérive | Contrôle lecture seule puis comparaison |
| Exécution / sauvegarde | Jeu | Constante morte et archives retirées | Godot et paquet |

## Validation

Consigner les commandes et résultats dans validation.md, distinguer compilation, publication et test Android. Aucune publication ou installation Android nécessaire si les fichiers exécutables du lecteur restent identiques et que seules les constantes mortes sont retirées.
