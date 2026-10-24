# Lunaria Studio

Application Electron/React/TypeScript pour créer les **niveaux, le parcours, les cinématiques, l’écran d’accueil et la présentation de combat** de Lunaria. Version npm actuelle : **1.10.0**, Node **>= 22.12.0**. Le fichier `package-lock.json` fixe les dépendances reproductibles.

## Démarrer

Depuis `C:/dev/Lunaria cinematic studio` :

```powershell
npm ci
npm test
npm run build
npm start
```

`npm run build` inclut le typecheck. `npm run dev` démarre le développement Electron ; `npm run dev:web` ne valide pas le pont natif ni l’accès aux fichiers. `npm run test:e2e:built -- <fichier>` exécute les scénarios Electron après compilation.

## Éditer Lunaria

Ouvrir **`C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json`**. Connecter **`C:/dev/Lunaria/LunariaArtLibrary`**, la bibliothèque source. Le projet unique conserve films complets, niveaux et catalogues. Un nouveau document démarre sans niveau ; cela ne signifie pas que la campagne existante est vide.

**Vue du projet** donne accès aux cinématiques existantes, aux niveaux et à la campagne. Les boutons « Créer » ajoutent du contenu ; **Réglages et outils** regroupe l’accueil, les personnages, les images et sons et la vérification du projet.

Enregistrer puis utiliser **Niveaux → Publier et exporter → Publier la campagne**, vers **`C:/dev/Lunaria/game`**. Le JSON compilé `game/content/design/game_content.json` et le miroir `game/LunariaArtLibrary` sont des sorties de publication. Les médias restent des références exactes `library://...` ; tout renommage doit atteindre les projets et films concernés.

**Niveaux → Publier et exporter → Builder et Déployer sur le téléphone connecté** enregistre le projet, vérifie le téléphone Android, synchronise la campagne, compile `build/android/Lunaria.apk`, l’installe avec `adb install -r` puis lance Lunaria. Brancher un téléphone ARM64 en USB, activer le débogage USB et autoriser l’ordinateur sur son écran. Si plusieurs appareils sont disponibles, le Studio demande lequel utiliser. Les étapes et erreurs apparaissent dans le Studio ; le journal est `tools/build/.local/lunaria-android-deploy.log` dans le dépôt du jeu. ADB est recherché dans le SDK Android et le PATH. Les outils de compilation habituels restent nécessaires (Godot, JDK 17 et modèles Android). L’installation conserve les données de l’application ; le jeu applique ensuite ses règles de profil selon la campagne publiée. Une signature incompatible bloque l’opération sans désinstaller le jeu.

Le panneau **Suivi du déploiement Android**, sous le titre du projet, apparaît dès le clic. Il affiche les six étapes, le temps écoulé et l’activité de compilation (copie, import, compression, vérification et création de l’APK). La préparation des images peut prendre plusieurs minutes. La confirmation de lancement ou l’erreur reste visible jusqu’à sa fermeture.

Le jeu utilise toutes les plantes autorisées par le niveau dès son début, sans composition d’équipe. Les espèces et attaques se règlent globalement ; les terrains restent indépendants par niveau. Archiver un ennemi conserve ses données et références.

Les **[capacités de combat](docs/CAPACITES.md)** se modifient directement sur la fiche d’une plante ou d’un ennemi. Une modification est propre au personnage par défaut ; le partage est explicite. Le bouton **Tester cette capacité** ouvre un atelier Godot isolé, sans publier la campagne.

Dans **Niveaux → Paramètres → Terrain du niveau**, **Générer les terrains pollué et nettoyé (IA)** propose le dernier décor de la cinématique précédant le niveau dans la campagne. On peut choisir un autre plan de ce film, ou sélectionner/importer une image libre. Codex crée le terrain pollué, puis nettoie cette image en conservant le cadrage. Les deux PNG 16:9 sont présentés ensemble avant affectation simultanée et annulable au niveau. Voir le [guide de génération des terrains](docs/GENERATION_TERRAINS.md).

**Tâches et résultats** réunit décors et terrains dans une file commune, avec historique conservé après redémarrage, aperçu, annulation, relance et nettoyage. Réduire un formulaire laisse la génération continuer. Voir le [guide des tâches d’images](docs/TACHES_IMAGES.md).

Le type **[Plateau occupé](docs/PLATEAU_OCCUPE.md)** permet de peindre les ennemis case par case, avec plusieurs unités ou espèces par case. Chaque vague commence avec tous ses ennemis en place dans les quatre colonnes de droite ; les Plaques conservent leurs renforts.

Dans **Niveaux → Écran d’accueil**, régler le décor, les personnages, les textes, les panneaux, les boutons et la progression de l’accueil, avec un aperçu de la composition. Ces réglages sont enregistrés dans le même projet et publiés avec la campagne. Voir le [guide de l’accueil](docs/ACCUEIL.md).

## Fichiers et cinématiques

Le menu commun **Fichier**, dans la barre supérieure, regroupe Nouveau projet,
Ouvrir un projet, Projets récents et Enregistrer sous. **Ctrl+S** enregistre le
projet entier. Les cinématiques se créent et se sélectionnent dans ce projet ;
l'import/export de films JSON isolés et les liens vers un dossier externe sont
retirés. L'export JPG, l'import d'images, les sons et la sauvegarde complète avec
images et sons restent disponibles.

La publication produit toujours les fichiers cinématiques internes pour Godot.
Le jeu lit uniquement le catalogue publié : il n'ouvre plus de JSON ni de
bibliothèque externe et ne permet plus d'associer un film à une mission.
Le rejeu des films découverts reste accessible depuis **Cinématiques**.


## Documentation

Lire l’[index](docs/README.md), le [guide courant](docs/GUIDE_V1_10.md), l’[architecture](docs/ARCHITECTURE.md), les [contrats de campagne](docs/ARCHITECTURE_CAMPAGNE.md), de [présentation](docs/ARCHITECTURE_V1_10.md) et de [cinématique](docs/FORMAT.md), puis l’[intégration Godot](docs/INTEGRATION_GODOT.md). Les [validations](docs/VALIDATION.md) distinguent contrôles réussis, échecs et essais restant à faire.

Les rapports et guides des anciennes livraisons sont archivés et signalés comme tels. Les projets JSON sous [examples/](examples/README.md) sont des archives historiques ; leur compatibilité avec le contrat actuel n’est pas assurée. Les sources Godot sous `godot/` servent à maintenir le lecteur commun ; le jeu réel reste dans `C:/dev/Lunaria/game`.

Les [animations de Plaque et Canette](docs/PLAQUE_CANETTE.md) se règlent directement dans leur fiche d’ennemi et utilisent les nouvelles planches de combat de la bibliothèque source.

L’[état du projet, l’enregistrement et l’annulation](docs/SESSION_PROJET.md) sont communs aux cinématiques et aux niveaux : historique unique, récupération du projet entier et comparaison des modifications externes avant enregistrement.

Les [comportements et phases](docs/COMPORTEMENTS.md) se règlent dans la fiche de chaque personnage : réglages personnels par défaut, partage explicite, priorités ordonnées et essai de décision contextualisé.

Les [règles du plateau des ennemis](docs/REGLES_ENNEMIS.md) exposent apparition, obstacles, contact, renforts et rôles d’objectif. « Dupliquer l’ennemi » conserve ces propriétés sous une nouvelle identité, avec son comportement et ses animations propres.

Les [animations et sons](docs/ANIMATIONS_SONS.md) se règlent par action sur la fiche du personnage : geste, départ, sons et effets effectifs, origine des réglages et écoute. Les changements personnels isolent les profils partagés et restent annulables.

Les [niveaux et la campagne](docs/NIVEAUX_CAMPAGNE.md) partagent des opérations explicites de création, duplication et placement dans le parcours. Les conversions d’objectif sont expliquées avant application et les consignes rédigées sont conservées ; les primes se règlent dans les vagues avec une comparaison globale.

La deuxième simplification du Studio, du Carnet et des missions est décrite dans [SIMPLIFICATION_2026-10-19.md](docs/SIMPLIFICATION_2026-10-19.md).

## Spécifications et développement

Spec Kit est configuré pour les chantiers structurants, avec des règles propres à Lunaria et une coordination Studio/Godot. Voir le [guide Spec Kit](docs/SPEC_KIT.md), la [constitution](.specify/memory/constitution.md) et les [spécifications](specs/README.md).
