# Refonte de la page Campagne

**Créée** le 25 novembre 2026  
**Périmètre** Lunaria Studio

## Scénarios et réception

### US1 — Lire et parcourir la campagne (P1)

L’auteur ouvre la campagne pour comprendre son ordre et repérer ce que couvre la version jouable.

1. Dans une fenêtre Electron de 1000 × 680, l’auteur voit le début du parcours et les raccourcis des jalons présents.
2. Cliquer sur un raccourci sélectionne son étape et la rend visible dans la liste. Le retour depuis une fiche de niveau ou de cinématique expose également la sélection.
3. La fin actuelle sépare clairement les étapes de la suite en préparation. Un déblocage après la borne est indiqué comme hors de la version jouable.

### US2 — Modifier le parcours dans son contexte (P1)

1. L’auteur peut insérer une étape à un emplacement choisi au clavier ou à la souris, puis repérer l’étape ajoutée.
2. Il peut déplacer une étape par glisser-déposer ou avec Alt et les flèches sur sa ligne. Il ouvre un niveau ou une cinématique avec le bouton « Modifier » de sa ligne.
3. Une campagne vide permet d’insérer une première étape. La présentation accepte les titres longs et les composants restent utilisables dans une fenêtre réduite.

## Exigences

- **FR-001** Le parcours et le panneau des contenus à placer occupent la largeur du contenu de la page.
- **FR-002** Les raccourcis des jalons existants sélectionnent et révèlent leurs étapes, tout en indiquant leur position.
- **FR-003** Les insertions, les déplacements et l’ouverture des étapes conservent les actions et l’ordre en vigueur.
- **FR-004** L’interface est en français et respecte les indications visuelles de la sélection et du focus.

## Périmètre Lunaria

La refonte porte sur l’éditeur de campagne du Studio. Elle réutilise les commandes existantes. Le contrat de campagne, le schéma du projet, la publication, le lecteur Godot et les médias d’auteur sont hors de ce chantier.

## Réussite

- **SC-001** À 1000 × 680, au moins quatre étapes entières sont lisibles à l’ouverture avec les trois jalons configurés et sans défilement horizontal.
- **SC-002** Une campagne de 25 étapes permet d’atteindre la fin actuelle et un jalon après la fin par un clic chacun, avec la sélection visible.
- **SC-003** Les scénarios Electron d’insertion, de déplacement, de sauvegarde et de navigation passent sur des données isolées.

## US3 — Reconnaître une étape à partir de ses images (P1)

1. Une cinématique du parcours affiche ses plans composés, de gauche à droite dans leur ordre de lecture. Le nombre et les légendes identifient les plans, y compris ceux accessibles par défilement.
2. Une étape de niveau affiche l’image de fond utilisée sur le plateau, en conservant son cadrage. Un fond absent est indiqué dans sa carte.
3. Les aperçus sont repliés à l’ouverture du projet. Les lignes de cinématique et de niveau se déplient ou se replient individuellement. La commande en tête de parcours agit sur toutes les lignes. Sélection et réordonnancement restent disponibles.
4. Les documents, la bibliothèque et le parcours restent édités par leurs commandes habituelles. L’affichage des images ne joue ni la cinématique ni ses sons.

## US4 — Placer les contenus depuis la réserve (P1)

1. Le panneau à droite affiche deux onglets, « Cinématiques » et « Niveaux ». Chaque onglet présente les contenus du projet qui ne figurent nulle part dans le parcours.
2. La vignette d’une cinématique visible fait défiler ses plans composés dans l’ordre. La vignette d’un niveau montre son fond de plateau.
3. Glisser une vignette dans un point d’insertion crée une étape à cet emplacement. Sélectionner la vignette puis activer le point d’insertion produit le même résultat au clavier.
4. Après placement, la vignette disparaît. Elle réapparaît après retrait ou annulation du placement si aucune occurrence de ce contenu ne subsiste.
5. Les aperçus respectent la préférence de mouvement réduit. Une commande permet de les mettre en pause. Le parcours reste utilisable dans la fenêtre minimale du Studio.
