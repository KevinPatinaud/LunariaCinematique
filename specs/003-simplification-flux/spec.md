# Spécification : simplification des flux du Studio

**Date** : 2026-10-26
**Statut** : Réalisé et vérifié
**Demande** : « Le code et les fonctionnalités de Lunaria méritent encore d'être nettoyées. Il y a encore beaucoup trop de spaghetti code à mon gout. »
**Initiative commune** : lunaria-structure-20261026-02
**Autre dépôt** : C:/dev/Lunaria/specs/004-simplification-flux/spec.md

## User Scenarios & Testing

### User Story 1 — Prévisualiser un film sans opération périmée (P1)

L’auteur démarre, arrête et reprend un aperçu. Une navigation ou un chargement lent ne laisse jamais jouer le mauvais film ni un son arrêté.

**Test indépendant** : différer une image, lancer la lecture puis changer de film ou quitter l’aperçu avant la fin du chargement.

1. **Given** un chargement en cours, **When** le film, projet, mode ou la bibliothèque change, **Then** l’ancien chargement ne déclenche plus de lecture ni de message périmé.
2. **Given** un plan sélectionné et un champ actif, **When** l’auteur démarre, met en pause, reprend ou recommence, **Then** les dernières valeurs et le plan de départ restent corrects, l’audio suit la lecture et le masquage met en pause.

### User Story 2 — Comprendre les usages avant suppression (P1)

Les usages d’une animation ou d’une présentation suivent directement le projet ouvert, y compris ses films fermés ou hors parcours, sans actualisation manuelle.

**Test indépendant** : utiliser une animation uniquement dans un film fermé/non placé puis tenter sa suppression, retirer le lien et recommencer avec annulation et réouverture.

1. **Given** une présentation utilisée ou une référence de film illisible, **When** sa suppression est demandée, **Then** elle est refusée avec son motif.
2. **Given** une présentation sans usage, **When** elle est supprimée, **Then** l’état courant est revérifié après confirmation et l’action reste annulable sans supprimer un autre élément disparu entre-temps.

### User Story 3 — Conserver le travail d’auteur et la livraison (P1)

La simplification des responsabilités garde un projet unique, son historique, les sauvegardes et la publication.

**Test indépendant** : enregistrement, changement de sélection, annulation/rétablissement, réouverture et publication isolée.

1. **Given** un projet édité, **When** l’auteur navigue, annule et enregistre, **Then** les données et les gestes d’édition restent corrects.
2. **Given** le contenu réel et les changements locaux existants, **When** la refonte est terminée, **Then** ils sont conservés et le jeu reste cohérent avec les copies techniques du Studio.

### Edge Cases

Chargement terminé ou rejeté après arrêt, film remplacé avec le même identifiant, changement de bibliothèque pendant un chargement, réordonnancement avant lecture, son multi-plans, pause et document masqué, définition supprimée pendant une confirmation, film hors parcours ou après borne, référence de film manquante.

## Requirements

- **FR-001** : Confier l’état, les chargements, l’horloge et l’audio de l’aperçu à un propriétaire unique, commandé explicitement par l’interface.
- **FR-002** : Invalider toute opération de lecture périmée lors d’un arrêt ou changement de contexte, sans effets tardifs.
- **FR-003** : Conserver lecture depuis l’identifiant stable du plan, validation des champs actifs, pause/reprise, redémarrage et continuité audio.
- **FR-004** : Centraliser les usages des présentations dans une analyse du projet courant et retirer les calculs, transports et actualisations redondants.
- **FR-005** : Refuser les suppressions utilisées ou invérifiables et revérifier l’état courant avant toute suppression effective.
- **FR-006** : Préserver les fonctionnalités actives, formats, contenus d’auteur, médias, historique et changements préexistants.

### Key Entities

Le projet et les films conservent leurs types actuels. L’état de lecture et les résultats d’analyse d’usages sont transitoires et ne sont pas enregistrés dans le projet.

## Périmètre Lunaria

- Dépôt responsable : Studio. Le jeu reçoit uniquement les copies techniques partagées nécessaires.
- Contrat : docs/CONTRAT_STUDIO_GODOT.md et sources courantes, relus le 26 octobre ; aucun format de publication modifié.
- Parcours : aperçu cinématique, modification/suppression des présentations, sauvegarde et publication isolées.
- Contenus/médias/profils : aucun changement prévu ; aucune migration.
- Hors périmètre : réécriture globale de React/Godot, retrait arbitraire d’espèces/objectifs et contrôleur global remplaçant la session de projet existante.

## Success Criteria

- **SC-001** : La régression de chargement différé est démontrée puis corrigée, avec arrêt et changement de film sûrs.
- **SC-002** : Les usages de films fermés/hors parcours bloquent la suppression ; une suppression autorisée reste annulable et persistante.
- **SC-003** : L’écran principal ne modifie plus directement l’état, l’horloge ou l’audio de la lecture complète ; aucune requête d’usages n’est envoyée au processus de fichiers.
- **SC-004** : Types, tests et scénarios Electron concernés passent ; contenus réels et changements antérieurs sont préservés.

## Assumptions

La demande autorise une nouvelle passe structurelle complète sur les couplages observés. Les fonctions encore utilisées sont conservées. Les constats de taille servent à cibler les responsabilités, sans objectif artificiel de nombre de fichiers.
