# Archivage des cinématiques et des niveaux

**Date** 26 novembre 2026

## Scénarios

1. Dans la liste des cinématiques ou des niveaux, l’auteur utilise **Archiver**. L’élément conserve sa place et reste modifiable. Son affichage devient gris avec la mention **Archivé**. **Désarchiver** rétablit l’apparence habituelle. L’historique permet d’annuler et de rétablir ces actions.
2. **Tous** est sélectionné par défaut. **Actifs** et **Archivés** filtrent la liste et se combinent aux filtres existants. Le filtre conserve l’ordre des éléments affichés.
3. Un élément archivé déjà placé reste présent à son emplacement dans **Campagne**, avec une mention **Archivé**. Les vignettes archivées de la réserve portent la même mention.
4. **Supprimer** garde les confirmations et vérifications de références existantes. Une copie créée par **Dupliquer** est active. Un document dépourvu de statut affiche ses éléments comme actifs.

## Exigences

- **FR-001** Enregistrer l’état d’archivage dans le projet d’auteur et ses sauvegardes.
- **FR-002** Utiliser un marquage gris lisible, accompagné d’un libellé.
- **FR-003** Conserver les identités, l’ordre, les références et les réglages du parcours lors du changement de statut.
- **FR-004** Publier la même campagne et les mêmes films à statut d’archivage seul différent.
- **FR-005** Présenter les commandes et leurs libellés en français.

## Périmètre Lunaria

Le Studio gère l’édition et l’export. Le contrat publié vers Godot est vérifié avec le schéma du jeu. Le document d’auteur et les médias réels sont hors périmètre des essais.

## Critères de réussite

- Un cycle archivage, sauvegarde et réouverture conserve le statut pour les deux types de contenu.
- Les trois filtres et les deux actions sont utilisables dans Electron, et le parcours signale tous les éléments archivés qu’il contient.
- Les publications avant et après archivage produisent les mêmes octets de catalogue et de films.
