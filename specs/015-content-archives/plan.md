# Plan d’implémentation

[Spécification](spec.md)

Le projet d’auteur conserve une liste d’identifiants archivés par type de contenu. Les commandes passent par l’historique de la session et le statut suit les changements d’identité existants. Lors d’une suppression définitive, le statut associé est retiré.

| Étape | Source | Vérification |
| --- | --- | --- |
| Édition | `CinematicsBrowser.tsx`, `LevelsWorkspace.tsx`, `CampaignEditor.tsx` et `CampaignReserve.tsx` | Filtres, indicateurs et commandes dans Electron |
| Projet d’auteur | `src/shared/game/schema.ts`, `validation.ts` et `projectSession.ts` | Enregistrement, récupération, réouverture et sauvegarde |
| Compilation | `src/shared/game/campaign.ts` | Comparaison des sorties de publication |
| Godot | Schéma consommé par le jeu, selon `docs/CONTRAT_STUDIO_GODOT.md` | Compatibilité du catalogue publié avec le schéma actuel |

Les composants React utilisent l’état de la session et le pont existants. Les archives relèvent du schéma d’auteur. Le schéma de publication garde la même forme et les lecteurs GDScript utilisent les mêmes données. Les tests utilisent un projet et un profil isolés. Le code ajouté suit la convention anglaise et les libellés sont en français.
