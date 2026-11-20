# Publication du premier niveau sur le site

Initiative : lunaria-premier-niveau-web.

## Parcours et vérifications

1. Dans Niveaux → Publier et exporter, l’auteur prépare le premier niveau jouable du projet enregistré. Le parcours détermine le niveau, même si un autre est sélectionné ou apparaît avant lui dans la liste.
2. Après validation du paquet, choisir la mise à jour locale, la publication du jeu seul sur savelunaria.com ou l’annulation. La cible et le niveau sont visibles avant l’envoi. Une production sans lecteur Godot compatible permet encore la mise à jour locale.
3. Une compilation échouée, une annulation ou un changement concurrent préserve la version précédente. La campagne Android et le reste du site sont indépendants de la publication du jeu.

## Exigences

- Exclure les autres niveaux et les films de campagne. Signaler un niveau dont les événements exigent un film.
- Garder les règles Godot et le parcours web mobile. Afficher le nombre de vagues et les compagnons de l’export choisi.
- Indiquer le résultat ou l’erreur et conserver les journaux en cas d’échec.

## Critères de réussite

Une seule bataille jouable est construite depuis le projet ouvert. L’auteur peut mettre à jour le site local sans toucher au serveur. En production équipée du lecteur Godot, la publication vérifie le paquet en ligne et laisse les autres fichiers actifs intacts.
