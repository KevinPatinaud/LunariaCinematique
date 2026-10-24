# Simplification du 19 octobre 2026

Le menu commun **Fichier**, dans la barre supérieure, regroupe Nouveau projet,
Ouvrir un projet, Projets récents et Enregistrer sous. **Ctrl+S** enregistre le
projet entier. Les cinématiques se créent et se sélectionnent dans ce projet ;
l'import/export de films JSON isolés et les liens vers un dossier externe sont
retirés. L'export JPG, l'import d'images, les sons et la sauvegarde complète avec
images et sons restent disponibles.

La publication produit toujours les fichiers cinématiques internes pour Godot.
Le jeu lit uniquement le catalogue publié : il n'ouvre plus de JSON ni de
bibliothèque externe et ne permet plus d'associer un film à une mission.
Le rejeu des films découverts reste accessible depuis **Cinématiques**.

La progression du jeu utilise un indicateur `completed` de valeur 0 ou 1 par
niveau. Les scores restent séparés. Le format de sauvegarde est **28**, sans
migration. Les modificateurs historiques de mission et la notation à plusieurs
étoiles ont été retirés ; les règles normales de pluie, biodiversité et graines
sont conservées.
