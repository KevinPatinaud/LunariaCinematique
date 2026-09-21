# Lunaria Studio V1.10 — présentation pilotée par le Studio

Sources complètes actualisées depuis V1.9. Profils par espèce, catalogue commun d’animations, atlas/séquences/procédural, marqueurs, audio et VFX, publication partagée et réutilisation cinématique.

**Validation native restante : le build Electron et l’exécution Godot ne sont pas validés. Aucun EXE/APK n’est fourni.** Les tests Node du Studio et des outils du jeu ainsi que la publication réelle de l’atelier ont été exécutés. Le rapport distingue les vérifications disponibles des étapes bloquées.

- [Installation et utilisation](docs/GUIDE_V1_10.md)
- [Architecture et contrats](docs/ARCHITECTURE_V1_10.md)
- [Rapport de validation](docs/TEST_REPORT_V1_10.md)
- [Atelier Radis / Ronce](examples/Atelier_Presentation_V1_10/README.md)

Extraire les projets dans de nouveaux dossiers et conserver les originaux. Dans le Studio, relier **`game/LunariaArtLibrary`** pour travailler sur la présentation de combat. Le petit exemple autonome `example-library` ne remplace pas cette bibliothèque.

Le jeu actif conserve ses 40 niveaux. L’atelier se publie séparément. Contrats actuels : document de jeu 4, cinématique animée 4, sauvegarde joueur 16, sans migration des anciennes sauvegardes joueur. Les anciennes notes V1.x sont historiques ; les documents V1.10 font référence pour cette livraison.
