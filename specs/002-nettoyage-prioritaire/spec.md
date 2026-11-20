# Feature Specification: Nettoyage prioritaire — Studio

**Created**: 2026-10-26
**Status**: Réalisé et vérifié
**Input**: « Vas y commence le nettoyage par les points les plus prioritaires. »
**Initiative commune**: lunaria-cleanup-20261026-01
**Spécification associée**: C:/dev/Lunaria/specs/003-nettoyage-prioritaire/spec.md

## User Scenarios & Testing

### User Story 1 - Retrouver des chemins de développement actuels (Priority: P1)

L’auteur et le mainteneur utilisent une publication et des commandes de test clairement identifiées, sans dépendance aux anciens outils retirés.

**Why this priority**: Une étape CI pointe déjà vers un outil inexistant; les façades et archives brouillent le chemin maintenu.
**Independent Test**: Exécuter les commandes documentées et les tests de publication actuels après retrait des anciens chemins.

**Acceptance Scenarios**:

1. **Given** le dépôt nettoyé, **When** les contrôles maintenus sont lancés, **Then** ils trouvent leurs scripts et passent.
2. **Given** une publication de test isolée, **When** la publication courante est appelée, **Then** validation, refus des conflits et copie de secours restent effectifs.

### User Story 2 - Maintenir des copies techniques cohérentes (Priority: P1)

Le mainteneur peut identifier et synchroniser les copies techniques détenues par le Studio, puis détecter une divergence sans modifier le jeu.

**Independent Test**: Modifier une copie dans un projet temporaire; le contrôle doit échouer en lecture seule puis réussir après synchronisation.

**Acceptance Scenarios**:

1. **Given** deux copies identiques, **When** leur cohérence est contrôlée, **Then** aucun fichier n’est écrit.
2. **Given** une copie divergente ou absente, **When** le contrôle est lancé, **Then** l’écart est nommé et signalé comme un échec.

### User Story 3 - Conserver le travail de production (Priority: P1)

Les projets, illustrations, fonctionnalités de création et sauvegardes courantes restent utilisables pendant ce premier nettoyage.

**Independent Test**: Comparer les empreintes des sources auteur et du contenu publié, puis contrôler le jeu et le Studio.

**Acceptance Scenarios**:

1. **Given** les modifications locales existantes, **When** le nettoyage se termine, **Then** elles sont conservées.
2. **Given** le parcours actuel, **When** les guides et messages de publication sont lus, **Then** ils décrivent le profil stable et la campagne réellement publiés.

### Edge Cases

Module compilé obsolète, fichier technique modifié dans le jeu, copie absente, dossier cible invalide, commande CI supprimée, document historique avec lien ancien, test de publication possédant déjà des modifications locales.

## Requirements

### Functional Requirements

- **FR-001**: Retirer les anciens chemins uniquement après vérification de leurs références; adapter les consommateurs maintenus.
- **FR-002**: Conserver les garanties de la publication courante en supprimant la façade obsolète.
- **FR-003**: Détecter sans écriture les divergences des copies techniques gérées depuis le Studio.
- **FR-004**: Synchroniser explicitement ces copies sans publier de campagne ni remplacer des médias.
- **FR-005**: Corriger les guides courants et le message de publication contradictoires avec le comportement du jeu.
- **FR-006**: Préserver les documents d’auteur, contenus publiés, fonctionnalités actives et changements préexistants.

## Périmètre Lunaria

- **Dépôt responsable**: C:/dev/Lunaria cinematic studio.
- **Autre dépôt**: spécification associée ci-dessus, initiative commune.
- **Contrat de référence**: docs/CONTRAT_STUDIO_GODOT.md du Studio, consulté le 26 octobre; aucun format utilisateur nouveau.
- **Parcours affecté**: maintenance, contrôles, publication isolée et copies techniques.
- **Contenu d’auteur et médias**: inchangés; pas de republication du projet réel.
- **Sauvegardes**: validation et format courants conservés, aucune migration ajoutée.
- **Hors périmètre du premier lot**: suppression des espèces, objectifs, variables ou outils de création encore disponibles; uniformisation forcée des anciens formats; refonte complète des gros composants React.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Aucun ancien chemin retiré n’est requis par une commande ou un import maintenu.
- **SC-002**: Tests de publication et de synchronisation réussis; une dérive volontaire est détectée sans écriture.
- **SC-003**: Vérifications des deux dépôts réussies pour le périmètre modifié, avec limites consignées.
- **SC-004**: Empreintes auteur et contenu publié identiques avant et après le nettoyage.

## Assumptions

Commencer le nettoyage autorise un premier lot fini et vérifié. Un outil disponible mais absent des dix niveaux n’est pas déclaré obsolète sur cette seule base. Git conserve l’historique des fichiers historiques supprimés.
