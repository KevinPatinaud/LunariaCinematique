# Feature Specification: Lierre remplace Fougère

**Created**: 2026-10-25
**Status**: Accepté par l'utilisateur
**Input**: Remplacer entièrement Fougère par le nouveau Lierre du stade 01, supprimer l'ancien Lierre et générer les poses manquantes.
**Initiative commune**: lunaria-lierre-20261025

## User Scenarios & Testing

### User Story 1 - Jouer un Lierre unique (Priority: P1)

Le joueur retrouve Lierre à la place de Fougère dans les mêmes niveaux, avec la même puissance et une attaque de liane lisible.
**Why this priority**: Le personnage doit être cohérent et jouable immédiatement.
**Independent Test**: Ouvrir les niveaux 8 à 10, planter Lierre et déclencher son entrave puis son explosion avec une autre espèce.
**Acceptance Scenarios**:
1. **Given** la campagne actuelle, **When** le joueur entre aux niveaux 8, 9 ou 10, **Then** Lierre est proposé à la place de Fougère, une seule fois.
2. **Given** une cible entravée, **When** une autre espèce alliée la frappe, **Then** la liane éclate avec les mêmes dégâts et la même portée qu'avant.
3. **Given** les mouvements réduits, **When** Lierre attaque, **Then** les transformations sont atténuées et les règles de combat restent identiques.

### User Story 2 - Lire et monter une histoire cohérente (Priority: P1)

L'auteur et le joueur voient Lierre dans les quatre films concernés ; le récit écrit ne présente plus deux personnages issus de Fougère et de l'ancien Lierre.
**Why this priority**: Le remplacement comprend l'identité narrative et artistique.
**Independent Test**: Lire les films 08 à 11 et les passages du récit où les deux personnages agissaient ensemble.
**Acceptance Scenarios**:
1. **Given** un plan utilisant Fougère, **When** il est joué, **Then** une pose appropriée de Lierre apparaît avec pieds, échelle, cadrage, expressions et bulles cohérents.
2. **Given** une action simultanée des deux anciens personnages, **When** le récit est lu, **Then** chaque action est attribuée à un acteur disponible et les effectifs du groupe sont corrects.
3. **Given** le film 11 après la borne de campagne, **When** l'auteur le prévisualise, **Then** le remplacement y est également présent sans déplacer la borne.

### Edge Cases

- Certaines répliques s'adressent à Rose : conserver leurs accords féminins.
- Le film 11 reste éditable après la borne ; sa présence dans le projet ne le rend pas jouable dans la campagne publiée.
- Les poses ont des proportions et marges alpha différentes : préserver la hauteur visible et la position des pieds.
- Préserver les changements d'auteur et de Lavande préexistants.

## Requirements

### Functional Requirements

- **FR-001**: Un seul Lierre remplace Fougère ; l'ancien personnage à piège est retiré des catalogues actifs et des nouveaux projets.
- **FR-002**: Conserver coût 125, vie 180, attaque 24, cadence 2 s, portée 8, délai de plantation 0 s et les paramètres actuels de l'entrave, des dégâts, de la libération et de l'explosion.
- **FR-003**: Présenter Étreinte de lierre, avec projectile feuillu, enroulement, libération et éclatement adaptés au personnage.
- **FR-004**: Adapter les portraits, poses de combat et toutes les occurrences des films 08 à 11, avec génération des poses nécessaires et conservation des médias source.
- **FR-005**: Harmoniser noms, répliques, titres et récit de référence ; fusionner les rôles, accords et effectifs sans doublon.
- **FR-006**: L'enregistrement, la publication et la lecture du jeu utilisent les mêmes références valides et tous les médias nécessaires sont embarqués.
- **FR-007**: Garder les données des autres personnages, les niveaux, leurs identifiants et la borne de campagne ; préserver les travaux locaux préexistants.
- **FR-008**: Vérifier les règles et le rendu avec des profils isolés et distinguer les contrôles PC, paquet et Android réellement réalisés.
### Key Entities

Personnages, capacités, effets, projectiles, profils et poses existants ; niveaux et cinématiques intégrées ; récit de référence.

## Périmètre Lunaria

- **Dépôt responsable**: Studio pour le contenu et les formats ; jeu pour l'exécution et le récit.
- **Autres dépôts concernés**: ../Lunaria cinematic studio et ../Lunaria, liés par la même initiative.
- **Contrat de référence**: docs/CONTRAT_STUDIO_GODOT.md dans le Studio ; sources src/shared/game/ et src/shared/presentation/, lecteurs Godot intégrés.
- **Parcours affecté**: édition → enregistrement → publication → lecture Godot.
- **Contenu d'auteur et médias**: document actuel, films 08–11, poses Lierre et récit de référence.
- **Sauvegardes**: Références courantes adaptées ; aucune migration de versions antérieures.
- **Hors périmètre**: Archives narratives, équilibrage nouveau, autres personnages, déplacement de la fin de campagne, mise en ligne.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Un seul Lierre et aucune entrée Fougère/ancien Lierre dans les catalogues actifs et nouveaux projets.
- **SC-002**: Les trois niveaux conservent exactement leurs paramètres et leur liste de compagnons, avec Lierre à la place de Fougère.
- **SC-003**: Les 24 références à 17 illustrations Fougère des quatre films sont remplacées par des poses Lierre sans média manquant.
- **SC-004**: Les contrôles de combat, campagne, cinématiques et paquet concernés réussissent ; le compte rendu indique toute limite.
- **SC-005**: Le récit ne contient plus le personnage Fougère ni de seconde rencontre ou action impossible de Lierre.

## Assumptions

Lierre reprend l'arc du guide et révèle ensuite ses talents de grimpeur. Le nom Étreinte de lierre et la conservation de l'équilibrage ont été acceptés. Le téléphone n'est actuellement pas connecté ; l'essai réel sera tenté s'il devient disponible.
