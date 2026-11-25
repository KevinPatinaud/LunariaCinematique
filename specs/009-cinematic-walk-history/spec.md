# Cadence et historique des marches de cinématique

## Scénarios

- Une marche déjà sélectionnée peut être accélérée ou ralentie depuis le déplacement A → B. La cadence est enregistrée avec le personnage du plan et la durée du trajet garde sa propre valeur.
- Une nouvelle marche de cinématique propose une cadence initiale de 12 images par seconde dans l’aperçu du cycle. Dans le plan, le mouvement des pas suit la distance du trajet et le multiplicateur de cadence du personnage.
- Après deux générations pour le même personnage dans le même plan, l’auteur retrouve les deux essais, peut revoir leur planche et réutiliser celui qu’il préfère. Rouvrir le Studio conserve les essais présents dans son historique IA.

## Exigences

- Afficher la cadence locale dès qu’une animation de marche est active, y compris pour une marche ancienne.
- Ouvrir directement le cycle actif dans l’atelier pour modifier ses images et ses réglages.
- Filtrer les essais par bibliothèque, projet, cinématique, plan et personnage.
- Préserver les clips importés et réutiliser le clip existant quand son essai est réappliqué.
- Conserver la prise en charge des plans et animations déjà enregistrés.
- Pour une nouvelle marche de cinématique, proposer huit poses guidées par défaut. Le pied d’appui alterne et l’aperçu enchaîne les poses avec un repère de sol continu. Les anciens cycles restent lisibles.

## Périmètre et acceptation

Le Studio utilise les contrats existants du catalogue et du lecteur. Le projet de recette isolé doit conserver deux essais après redémarrage, retrouver le premier, enregistrer une cadence locale et garder la durée A → B. Les générations destinées aux niveaux conservent leurs réglages.
