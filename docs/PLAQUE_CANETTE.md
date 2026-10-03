# Plaque et Canette : animations de combat

Dans **Niveaux → Ennemis → Plaque / Canette pressée → Animations de…**, les actions utilisent désormais des planches transparentes dessinées : cinq actions pour Plaque (24 poses), six pour Canette (28 poses). Plaque dispose aussi d’une goutte de slime violette. Sa présentation de déplacement reprend son attente immobile ; Canette conserve sa marche et son coup de pince.

Les valeurs initiales, les découpes et les ancrages sont dans `src/shared/presentation/polluterAnimations.ts`. Les animations déjà nommées `plaque_idle`, `plaque_spawn`, `plaque_attack` et `move_runner` conservent leurs identifiants. Les caractéristiques de combat et la cadence des renforts sont conservées. Les PNG se trouvent dans la bibliothèque source, sous `03_enemies/plaque` et `03_enemies/canette`, avec des noms versionnés `v01`. Les illustrations précédentes restent disponibles pour les films.

Les tests sont `tests/polluter-animations.test.ts` et `tests/e2e/polluter-animations.spec.ts`. Le second ouvre le véritable projet d’auteur et inspecte ses deux attaques sans enregistrer de modification. La description complète et le manifeste des prompts sont dans `C:/dev/Lunaria/docs/design/plaque-canette-animations.md` et `C:/dev/Lunaria/docs/art_provenance/animations/plaque_canette_2026-10-01.json`.
