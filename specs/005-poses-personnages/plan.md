# Plan — poses de personnages

## Technical Context
Electron/React/TypeScript existants ; aucune dépendance ajoutée. Contrats partagés, service principal, preload, renderer. Références : docs/ARCHITECTURE.md et docs/CONTRAT_STUDIO_GODOT.md.

## Constitution Check
Expérience auteur directe, Master conservé, séparation renderer/disque, historique et destination capturée, tests isolés, format publié inchangé. Aucun écart.

## Phase 0 — Recherche
Voir research.md. Réemploi file/lifecycle/Codex, résolution du Master espèce/stade, suppression de la liaison d’animation et conservation de l’ancrage.

## Phase 1 — Contrats
Voir data-model.md et contracts/parcours.md. Ajouter pose dans la file, contexte acteur, demandes/résultats, manifeste et provenance.

## Implémentation
- src/shared/poseGeneration.ts : référence, demande, consigne, destination et application statique proportionnelle.
- src/main/poseGenerations.ts : références copiées, queue, annulation, PNG/alpha/hash, reprise, import non écrasant.
- codexImageCorrection.ts : plusieurs références avec interface existante compatible.
- index.ts, preload, browserBridge, model : IPC et protocole d’images.
- PoseGenerationDialog, PoseTaskActions, Inspector/App et ImageTasks : création, comparaison, correction, import et destination dans l’historique.
- Tests partagés/services/Electron et publication isolée ; documentation auteur.

## Validation
Voir quickstart.md. Essai réel et fidélité séparés des générateurs simulés. Campagne source/publiée préservée. Godot consomme les PNG comme les autres images statiques.
