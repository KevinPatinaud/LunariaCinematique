# Implementation Plan: Lierre unique

**Date**: 2026-10-25 | **Spec**: [spec.md](spec.md)
**Initiative commune**: lunaria-lierre-20261025

## Summary

Remplacer Fougère par un seul Lierre, supprimer le Lierre à piège, préserver les règles et l'histoire en adaptant poses et rôles simultanés.

## Technical Context

- Stack existante : Electron/React/TypeScript, Node ≥22.12.
- Racine : C:/dev/Lunaria cinematic studio.
- Sources consultées : AGENTS.md, docs/ARCHITECTURE.md, contrat commun, catalogues réels, auteur et recherche des trois agents (code, art, récit).
- Paramètres auteur conservés ; identifiant canonique ivy. Références : ab_ivy_binding, fx_ivy_impact, fx_ivy_bind, proj_ivy_vine, profile_ivy. Mécanique binding conservée, état temporaire binding_damage ; style visuel vine.
- Tests : npm run typecheck ; npm test ; npm run build ; Electron ivy-attack et scénario auteur isolé.

## Constitution Check

- [x] Parcours joueur Android et auteur décrits.
- [x] Auteur modifié à la source, sorties publiées régénérées.
- [x] Contrat référencé à sa source Studio ; cohérence des deux lecteurs vérifiée.
- [x] Règles en domain et effets visuels en presentation.
- [x] Profils et projets de tests isolés.
- [x] Copie du document auteur et récit avant modification ; changements de Lavande préservés ; aucune migration.

## Project Structure

src/shared/game/{seed,combatDefaults,combatMechanics,schema,combat,combatPreview,combatValidation}.ts ; src/shared/presentation/{artisticDefaults,ivyPresentation}.ts ; src/renderer/game/capabilities/ ; tests/ et scripts/ concernés.

## Impact Studio → publication → Godot

| Étape | Source | Changement | Vérification |
| --- | --- | --- | --- |
| Édition | Projet auteur + defaults Studio | Fusion espèces, nouvelles poses/animations | Validation auteur et Electron |
| Contrat | Schéma Studio | Une espèce de moins, style vine | Types, schéma, tests fixtures courantes |
| Publication | campaignPublisher | Nouvelle fermeture médias + films | Préflight, sortie isolée puis publication autorisée |
| Runtime | Godot | Références et dessin liane, règles identiques | Smoke tests, captures |
| Sauvegarde | État combat | binding_damage remplace fern_damage | JSON aller-retour et validation courante |

Référence commune : ../Lunaria cinematic studio/docs/CONTRAT_STUDIO_GODOT.md. La synchronisation n'est pas une publication.

## Validation

Résultats et limites consignés dans validation.md. Les fixtures historiques restent brutes, leur fabrique produit explicitement un exemple courant ; les pièges restent testables par une capacité générique de test, pas par l'ancien personnage. Le film 11 est aussi prévisualisé sans déplacer la borne. Aucun téléphone connecté au départ.
