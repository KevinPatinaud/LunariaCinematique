# Écran d’accueil dans Lunaria Studio

L’accueil se règle dans **Niveaux → Écran d’accueil**, ou depuis **Vue du projet → Configurer l’accueil**. Sa composition est enregistrée dans `homeScreen` du même `lunaria.game.json` que les niveaux et les films. Les réglages de l’accueil concernent tout le jeu.

## Composer l’écran

Choisir un élément dans **Éléments de l’accueil** ou dans l’aperçu. Les champs **Position X**, **Position Y**, **Largeur** et **Hauteur** utilisent un canevas logique de **1280 × 720**. Le jeu adapte l’ensemble aux dimensions de sa fenêtre ; les coordonnées ne sont pas des pixels physiques de téléphone.

Chaque élément possède un nom d’auteur, une visibilité et une opacité. La liste conserve les éléments masqués pour pouvoir les réafficher. **Ajouter un élément**, **Dupliquer l’élément** et **Supprimer l’élément** modifient la composition ; **Avancer d’un plan** et **Reculer d’un plan** règlent les superpositions. Le dernier élément du tableau JSON est dessiné devant les précédents. Les actions **Annuler** et **Rétablir** de la barre du Studio s’appliquent à ces changements.

| Type | Réglages propres |
|---|---|
| Panneau | Fond, bordure, épaisseur, arrondi et ombre |
| Texte | Contenu, police, taille, couleur, alignement, interligne et nombre de lignes |
| Bouton | Libellé, destination, police, couleurs, bordure, arrondi et ombre |
| Image | Image de la bibliothèque, cadrage et miroir horizontal |
| Plante | Espèce du catalogue, taille d’affichage et animation |
| Ligne | Couleur et épaisseur |
| Progression | Couleur de remplissage, piste et arrondi ; valeur issue de la progression réelle |
| Halo | Fond, contour, épaisseur et angles de l’arc |

Les plantes utilisent les visuels du catalogue global. Leurs conditions d’affichage permettent de montrer un élément lorsque l’espèce choisie est débloquée, ou de le masquer lorsqu’une autre espèce l’est. La composition initiale emploie ainsi des variantes pour les compagnons débloqués.

Le fond peut utiliser le **jardin du jeu**, une **image de bibliothèque** ou une **couleur unie**. Le jardin suit le continent courant ou le continent fixé par l’auteur. Le cadrage d’image propose remplir en recadrant (`cover`), montrer l’image entière (`contain`) et étirer (`stretch`). Couleur, opacité et voile de fond sont réglables.

## Boutons et progression

Les destinations disponibles sont **Continuer l’aventure**, **Carnet de voyage**, **La troupe**, **Cinématiques** et **Paramètres**. Modifier le texte d’un bouton ne modifie pas sa destination ; celle-ci se règle séparément. Les destinations restent les écrans et le parcours déjà gérés par le jeu.

Les libellés du bouton principal couvrent le début d’aventure, la continuation, la reprise d’une bataille, la suite narrative, la fin du parcours et l’absence de mission publiée. Un suffixe commun permet par exemple d’ajouter une flèche. Le sélecteur **État du joueur dans l’aperçu** montre les variantes sans modifier une sauvegarde joueur.

Les textes peuvent employer `{completed}`, `{total}` et `{version}`. Ils sont remplacés à l’affichage par les niveaux terminés, les niveaux publiés et la version du jeu. `{continue}` affiche le libellé de continuation correspondant à l’état courant. La barre de progression utilise ces mêmes données de campagne.

## Enregistrer et publier

**Enregistrer le projet** conserve la composition d’auteur. **Niveaux → Publier et exporter → Publier la campagne** écrit les données jouables dans `game/content/design/game_content.json`, avec les images de bibliothèque référencées par l’accueil. Relancer le jeu après publication pour utiliser les données modifiées.

Une image absente ou une référence invalide doit être corrigée avant publication. Les chemins restent relatifs à la bibliothèque, sous la forme `library://...`. Le jardin intégré n’exige pas de référence de bibliothèque supplémentaire. Le contrôle de présence d’un fichier ne remplace pas la vérification de lisibilité de la composition.

## Contrat `homeScreen`

Le contrat est défini dans `src/shared/game/homeScreen.ts` et validé par le schéma du projet. Il est indépendant du format des films décrit dans [FORMAT.md](FORMAT.md).

| Champ | Contenu |
|---|---|
| `background` | `mode`, `chapter` (`-1` automatique, `0` à `4` continent fixé), `color`, `image`, `fit`, `opacity`, `overlayColor`, `overlayOpacity` |
| `continueLabels` | `start`, `continue`, `battle`, `outro`, `epilogue`, `unavailable`, `suffix` |
| `elements` | Liste ordonnée d’éléments, chacun avec `id`, `name`, `kind`, `visible`, `rect: {x, y, w, h}`, `opacity`, puis les propriétés du type |

Les identifiants des éléments sont uniques. Les couleurs acceptent les formes hexadécimales `#RRGGBB` et `#RRGGBBAA`. Les propriétés facultatives `showIfPlantUnlocked` et `hideIfPlantUnlocked` référencent des espèces du catalogue. Les propriétés propres à un type sont contrôlées à la validation ; le JSON ne contient ni script ni destination arbitraire.

Un document sans `homeScreen` affiche la composition par défaut ; l’ouverture seule ne l’ajoute pas au fichier. La première modification de l’accueil matérialise cette composition dans le projet, puis **Enregistrer le projet** la conserve. Une composition déjà enregistrée garde ses choix, son ordre et ses éléments masqués. Pour les sources de travail et la publication, voir le [contrat de campagne](ARCHITECTURE_CAMPAGNE.md).
