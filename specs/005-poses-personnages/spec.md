# Feature Specification: Poses de personnages avec Codex

**Created**: 2026-10-28
**Status**: Validée pour implémentation
**Input**: Sélectionner un personnage pendant la composition d’une cinématique, décrire une pose et générer son image via Codex.
**Initiative commune**: poses-personnages-20261028

## User Scenarios & Testing

### User Story 1 - Créer une pose fidèle (Priority: P1)

L’auteur sélectionne Radis dans un plan, ouvre « Générer une pose avec Codex », vérifie sa référence officielle et décrit sa posture/expression. Il reçoit une proposition transparente, peut ajuster sa demande et relancer.

**Why this priority**: compléter une cinématique sans quitter le Studio.
**Independent Test**: générer « Radis pleure » depuis un personnage sélectionné.
**Acceptance Scenarios**:
1. Une référence du même personnage et du même stade est proposée et reste modifiable.
2. La consigne et le modèle choisis sont conservés avec la tâche.
3. Une image opaque, vide, identique à la référence ou hors des dossiers autorisés est refusée.

### User Story 2 - Utiliser et réutiliser la pose (Priority: P1)

**Independent Test**: importer la proposition, l’affecter au personnage, annuler/rétablir, enregistrer et rouvrir.
**Acceptance Scenarios**:
1. La pose est un nouveau média ; le Master et les autres plans sont conservés.
2. L’affectation conserve l’identifiant et les dialogues, l’ancrage et les effets de mouvement ; une animation de sprites est remplacée par la pose fixe.
3. Si le projet ou le personnage a changé, une destination explicite est requise. Un changement pendant l’import bloque l’affectation.
4. La pose peut être ajoutée uniquement à la bibliothèque, puis affectée plus tard.

### User Story 3 - Retrouver les travaux (Priority: P2)

**Independent Test**: réduire la fenêtre, retrouver la tâche dans « Tâches et résultats », redémarrer et retrouver la proposition.
**Acceptance Scenarios**: file commune, annulation effective, reprise manuelle des interruptions, prévisualisation, recherche/filtre et nettoyage borné.

### Edge Cases

Master absent/ambigu, personnage renommé, stade distinct, changement de sélection/projet/bibliothèque, suppression du plan, double validation, réponse tardive après annulation, source modifiée, import interrompu et indisponibilité Codex.

## Requirements

- **FR-001**: accès depuis les propriétés d’un personnage unique sélectionné.
- **FR-002**: référence officielle du bon stade, visible et modifiable sans déduction depuis le seul nom de l’acteur.
- **FR-003**: consigne libre obligatoire, modèle Codex mémorisé et appel natif connecté sur l’ordinateur.
- **FR-004**: PNG avec contenu visible et véritable transparence ; conservation des sources.
- **FR-005**: prévisualisation, import séparé, application ciblée annulable, réutilisation et provenance.
- **FR-006**: destination validée avant/après import ; pas d’affectation à une sélection différente par accident.
- **FR-007**: suivi persistant dans la file commune, annulation, relance et nettoyage sûr.
- **FR-008**: enregistrement/réouverture et publication des médias via le contrat existant.

### Key Entities

Acteur et référence `library://` existants ; nouvelle demande et tâche de pose ; provenance du média. Le format des cinématiques et les sauvegardes du joueur restent ceux en vigueur.

## Périmètre Lunaria

- **Dépôt responsable**: Studio.
- **Autres dépôts concernés**: consommateur Godot vérifié par une publication de test isolée ; aucune nouvelle fonction runtime.
- **Contrat de référence**: `docs/CONTRAT_STUDIO_GODOT.md`, `src/shared/model.ts`, `src/main/campaignPublisher.ts` et lecteur GDScript existant.
- **Parcours affecté**: édition → bibliothèque → enregistrement → publication → lecture.
- **Contenu d’auteur et médias**: essais isolés ; aucun remplacement de média existant.
- **Sauvegardes**: aucun changement du format publié ou des sauvegardes joueur.
- **Hors périmètre**: création d’animations ou génération sur Android.

## Success Criteria

- **SC-001**: parcours Electron sélection → génération → aperçu → application → annuler/rétablir → enregistrer/rouvrir démontré.
- **SC-002**: tests des erreurs, annulation, reprise et changement de destination ; nouvelles images présentes dans une publication de test.
- **SC-003**: essai réel Codex et inspection du résultat, ou limite de service explicitement documentée.

## Assumptions

Une pose est une image fixe. Le Master est la référence d’identité ; la pose actuelle peut servir de référence complémentaire. L’auteur valide la fidélité artistique.
