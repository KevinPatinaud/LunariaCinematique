# Lunaria Studio V1.10 — présentation pilotée par le Studio

Sources complètes actualisées depuis V1.9. Profils par espèce, catalogue commun d’animations, atlas/séquences/procédural, marqueurs, audio et VFX, publication partagée et réutilisation cinématique.

Le projet d’auteur `lunaria.game.json` contient maintenant les niveaux, le parcours et les documents complets des cinématiques. Le Studio ouvre, modifie et enregistre ce seul fichier. Les images restent référencées dans `LunariaArtLibrary`.

Au lancement de l’application de bureau, le dernier projet ouvert ou enregistré se recharge automatiquement. Si une copie locale non enregistrée existe, le Studio propose de la reprendre après avoir chargé le projet.

Le bouton **Enregistrer le projet**, présent dans la barre commune aux deux modes, écrit les niveaux et toutes les cinématiques dans le même JSON. Au premier enregistrement, il demande un emplacement ; ensuite, il met à jour ce fichier. Pour créer volontairement un second fichier, ouvrir **Récents → Créer une copie du projet…**. Le menu **Publier et exporter**, dans Niveaux, permet de publier la campagne ou d’exporter le jeu pour PC et Android.

Le bouton **Vue du projet** donne accès à la création de niveaux et de cinématiques, au parcours de campagne, à la bibliothèque et aux vérifications. La barre commune indique si le projet est enregistré ou modifié. Les outils **Animations et sons** se déplient à la demande ; une recherche par nom ou rôle permet de retrouver les personnages, même sans saisir les accents.

- [Installation et utilisation](docs/GUIDE_V1_10.md)
- [Architecture et contrats](docs/ARCHITECTURE_V1_10.md)
- [Rapport de validation](docs/TEST_REPORT_V1_10.md)
- [Atelier Radis / Rose](examples/Atelier_Presentation_V1_10/README.md)

Extraire les projets dans de nouveaux dossiers et conserver les originaux. Dans le Studio, relier **`game/LunariaArtLibrary`** pour travailler sur la présentation de combat. Le petit exemple autonome `example-library` ne remplace pas cette bibliothèque.

Le projet initial et le contenu actif du jeu ne contiennent plus de missions par défaut. L’introduction cinématique reste dans le parcours. La carte du jeu crée ses onglets selon les continents qui possèdent des missions ; un continent vide n’apparaît pas. Les anciens projets liés à des fichiers de cinématiques séparés sont importés dans le document unique lors de leur ouverture dans l’application de bureau.

## Son des cinématiques

Le bouton **Son** permet de choisir une plage de plans pour chaque musique, de régler les fondus et de lier les bruitages aux dialogues et animations. [Guide des musiques et événements sonores](docs/SON_CINEMATIQUES.md).
