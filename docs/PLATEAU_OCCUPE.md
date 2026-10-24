# Plateau occupé

Dans **Niveaux → Paramètres → Type de niveau / objectif**, choisir **Plateau occupé**, puis ouvrir **Vagues & ennemis**.

## Placer les ennemis

Choisir un ennemi dans la palette, puis cliquer sur une case des colonnes **5 à 8**. Chaque clic ajoute une unité. Une même case peut contenir plusieurs espèces et plusieurs individus de chaque espèce.

- **Gomme −1** retire une unité de l’espèce choisie. Le clic droit fait la même chose.
- **Sélectionner une case** permet de consulter et modifier ses quantités sans ajouter d’ennemi.
- **Copier vers une case…** copie tout le contenu de la sélection vers une autre case, en remplaçant son contenu.
- **Vider la case** retire tous ses ennemis. L’annulation générale de Studio reste disponible.
- Chaque vague possède sa disposition. **Dupliquer la vague** conserve sa composition avec des identifiants indépendants.

Une vague doit contenir au moins un ennemi pour être enregistrée ou publiée, avec un maximum de 256. Un plateau temporairement vide est conservé par la récupération du brouillon.

## Règles en jeu

Les ennemis de la vague apparaissent tous à leurs positions exactes au lancement, avant tout mouvement ou attaque. Ils conservent leurs comportements habituels. Les alliés peuvent se planter uniquement dans les colonnes **1 à 4**, y compris entre deux vagues ; une case actuellement occupée par un ennemi mobile n’est pas disponible.

Les Plaques restent fixes et continuent de faire arriver une Canette dans leur allée toutes les **30 secondes**, même sans cible alliée. Ces renforts arrivent normalement depuis la droite. Une vague se termine uniquement lorsque tous ses ennemis sont KO, **renforts compris**. La récompense est versée une fois ; la dernière vague termine le niveau. Un ennemi au refuge provoque toujours la défaite.

Le plateau est partagé en deux moitiés égales : quatre colonnes à gauche pour les alliés et quatre à droite pour les positions initiales des ennemis. Les positions, quantités et vagues sont conservées à l’enregistrement, à la réouverture et à la publication. La sauvegarde de partie conserve aussi les ennemis et les cycles de renfort en cours.

## Plaques des autres niveaux

Le placement des Plaques utilise également une grille : un clic choisit une case précise. Pour une zone aléatoire, choisir **Case aléatoire dans une zone**, puis cliquer sur ses deux coins opposés. Le délai et l’intervalle restent disponibles dans ces niveaux.

## Contrat et vérification

L’objectif est `occupied_board`. Les groupes utilisent `placement` pour une case exacte, `lane` égal à sa ligne, `start: 0` et `interval: 0`. Les autres types de niveau conservent leurs arrivées temporisées. Changer de type conserve les espèces et quantités, en adaptant les positions et délais au mode choisi.

Les régressions dédiées sont `tests/occupied-board.test.ts`, `tests/e2e/occupied-board.spec.ts`, ainsi que `occupied_board_smoke.gd` et `occupied_board_visual.gd` dans Godot. Les captures de bureau ne constituent pas une validation sur un appareil Android physique.
