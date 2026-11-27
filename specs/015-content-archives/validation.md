# Validation de l’archivage

**Date** 26 novembre 2026

| Contrôle | Résultat |
| --- | --- |
| `npm run build` | Vérification des types et compilation Electron réussies. |
| `npm test` | 1 325 réussites, 4 tests ignorés, aucun échec. |
| `npm run test:e2e:built` sur `levels-campaign`, `cinematics-browser`, `cinematic-reorder`, `campaign` et `campaign-backup` | 24 scénarios réussis dans Electron. |
| Scénario Electron d’archivage, avec captures avant et après | Ordre, filtres, désarchivage, suppression, historique et statut après réouverture vérifiés. Contrôle visuel des listes et de Campagne à 1 462 pixels et de la liste des cinématiques à 1 000 pixels. |
| Publication isolée avec une cinématique et un niveau archivés | Le catalogue et le film sont identiques octet pour octet à la publication réalisée avant archivage. |
| `node scripts/schema.mjs` après compilation des tests | Le champ d’auteur figure dans le schéma documenté. Le schéma de publication a la même empreinte SHA-256 avant et après génération et correspond au schéma du projet Godot. |
| `git diff --check` | Aucun écart d’espacement. |

Les tests ont utilisé des projets temporaires. Les preuves couvrent le Studio et les fichiers exportés. Aucun essai Android n’a été effectué.
