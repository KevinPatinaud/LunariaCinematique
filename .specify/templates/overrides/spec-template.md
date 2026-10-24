# Feature Specification: [FEATURE NAME]

**Created**: [DATE]
**Status**: Draft
**Input**: User description: "$ARGUMENTS"
**Initiative commune**: [identifiant partagé si plusieurs dépôts sont concernés]

## User Scenarios & Testing *(mandatory)*

### User Story 1 - [résultat observable] (Priority: P1)

[Décrire le besoin du joueur ou de l'auteur, sans imposer une solution technique.]

**Why this priority**: [valeur apportée]
**Independent Test**: [scénario permettant de constater le résultat]

**Acceptance Scenarios**:

1. **Given** [état initial], **When** [action], **Then** [résultat observable].
2. **Given** [cas limite ou donnée invalide], **When** [action], **Then** [résultat attendu].

### Edge Cases

[Ne retenir que les cas pertinents : campagne vide, référence absente, annulation,
pause/reprise, borne de campagne, dimensions tactiles, publication interrompue.]

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: [comportement attendu et vérifiable].
- **FR-002**: [contrainte issue de la demande ou des contrats actuels].

### Key Entities *(include if feature involves data)*

[Référencer les entités et schémas existants ; éviter une seconde définition.]

## Périmètre Lunaria

- **Dépôt responsable**: [Studio ou jeu Godot].
- **Autres dépôts concernés**: [chemins, parties affectées, ou aucun avec raison].
- **Contrat de référence**: `docs/CONTRAT_STUDIO_GODOT.md` dans le Studio ;
  indiquer la source précise, sa révision et les modifications locales pertinentes.
- **Parcours affecté**: [édition → enregistrement → publication → lecture Godot,
  ou parcours local concerné].
- **Contenu d'auteur et médias**: [modifications nécessaires, ou aucune].
- **Sauvegardes**: [effet sur le format courant, ou aucun ; aucune migration
  d'anciennes versions n'est exigée par défaut].
- **Hors périmètre**: [exclusions utiles pour borner le changement].

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [critère observable relié au scénario principal].
- **SC-002**: [preuve pertinente de cohérence Studio/Godot si concerné].

## Assumptions

[Hypothèses raisonnables, décisions existantes et questions réellement bloquantes.
Supprimer les rubriques sans utilité. Une incertitude n'est pas une exigence.]
