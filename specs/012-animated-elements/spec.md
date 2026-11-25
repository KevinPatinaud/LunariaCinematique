# Éléments animés dans les cinématiques

Initiative commune `animated-elements`. Voir le dossier `specs/010-animated-elements` du jeu.

Un auteur choisit un préréglage et une image fixe dans la bibliothèque. Il peut ajouter une deuxième volute ou une image d’éclaboussure, vérifier le mouvement dans l’aperçu, puis placer le même élément dans plusieurs plans.

La rotation tourne autour d’un pivot réglable. Le flottement fait monter l’image avec une dérive et un balancement réglables. La chute affiche un impact à la fin du mouvement. La fumée soufflée démarre par un jet fin, puis se détache, remonte et se dissipe. Son point d’origine se place sur la bouche au glisser-déposer et reste fixe lors des réglages de taille, d’orientation et de sens dans l’inspecteur.

Chaque élément peut définir sa taille à l’insertion. Un plan règle le déclenchement, la vitesse et la répétition. La sauvegarde et la réouverture conservent ces réglages.

Le lecteur du jeu affiche les mêmes phases aux mêmes instants que le Studio. Le paquet contient les images utilisées et l’option de mouvements réduits laisse une image fixe pendant la période active.
