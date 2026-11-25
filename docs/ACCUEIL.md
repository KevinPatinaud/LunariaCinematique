# Données d’accueil dans le projet

L’écran d’accueil du jeu est rendu par la Serre vivante dans Godot. Elle utilise les libellés de continuation de `homeScreen` lorsqu’ils sont présents dans la campagne publiée. Le fichier d’auteur et la sauvegarde complète conservent l’ancienne composition et ses références.

## Contrat `homeScreen`

Le contrat est défini dans `src/shared/game/homeScreen.ts` et validé par le schéma du projet. Il est indépendant du format des films décrit dans [FORMAT.md](FORMAT.md).

| Champ | Contenu |
|---|---|
| `background` | `mode`, `chapter` (`-1` automatique, `0` à `4` continent fixé), `color`, `image`, `fit`, `opacity`, `overlayColor`, `overlayOpacity` |
| `continueLabels` | `start`, `continue`, `battle`, `cinematic`, `finished`, `unavailable`, `suffix` |
| `elements` | Liste ordonnée d’éléments, chacun avec `id`, `name`, `kind`, `visible`, `rect: {x, y, w, h}`, `opacity`, puis les propriétés du type |

Les identifiants des éléments sont uniques. Les couleurs acceptent les formes hexadécimales `#RRGGBB` et `#RRGGBBAA`. Les propriétés facultatives `showIfPlantUnlocked` et `hideIfPlantUnlocked` référencent des espèces du catalogue. Les propriétés propres à un type sont contrôlées à la validation ; le JSON ne contient ni script ni destination arbitraire.

Le jeu charge ses libellés par défaut si le projet publié ne contient pas de champ `homeScreen`. Pour respecter le schéma du catalogue, la [publication de la campagne](ARCHITECTURE_CAMPAGNE.md) accompagne les libellés d’un fond de jardin sans image et d’une liste d’éléments vide.
