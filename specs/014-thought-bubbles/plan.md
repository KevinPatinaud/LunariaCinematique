# Mise en œuvre Studio

Étendre `Bubble.kind` et le schéma du film avec `thought`. Les versions existantes restent lisibles. Le type accompagne la bulle dans le projet d’auteur et l’export de la cinématique. Le même rendu React sert à l’édition, à la lecture et à l’export JPEG. Ajouter la géométrie de la traînée au rendu partagé puis la porter dans le lecteur GDScript source.

**Contrat** · [Référence Studio–Godot](../../docs/CONTRAT_STUDIO_GODOT.md). Une pensée réutilise `speakerId` et `tail` et suit leurs validations existantes, notamment le refus d’une cible automatique sans personnage. Le Studio part du commit `7b2929d` avec des changements locaux au-delà de cette fonctionnalité.

**Vérification** · Construire le Studio, vérifier la création, la conversion, la sauvegarde, la réouverture et l’aperçu dans Electron sur un projet isolé. Générer les schémas et contrôler la synchronisation du lecteur Godot.
