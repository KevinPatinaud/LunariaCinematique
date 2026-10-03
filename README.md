# Lunaria Studio

Application Electron/React/TypeScript pour créer les **niveaux, le parcours, les cinématiques et la présentation de combat** de Lunaria. Version npm actuelle : **1.10.0**, Node **>= 22.12.0**. Le fichier `package-lock.json` fixe les dépendances reproductibles.

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

Enregistrer puis utiliser **Niveaux → Publier et exporter → Publier la campagne**, vers **`C:/dev/Lunaria/game`**. Le JSON compilé `game/content/design/game_content.json` et le miroir `game/LunariaArtLibrary` sont des sorties de publication. Les médias restent des références exactes `library://...` ; tout renommage doit atteindre les projets et films concernés.

Le jeu utilise toutes les plantes autorisées par le niveau dès son début, sans composition d’équipe. Les espèces et attaques se règlent globalement ; les terrains restent indépendants par niveau. Archiver un ennemi conserve ses données et références.

## Documentation

Lire l’[index](docs/README.md), le [guide courant](docs/GUIDE_V1_10.md), l’[architecture](docs/ARCHITECTURE.md), les [contrats de campagne](docs/ARCHITECTURE_CAMPAGNE.md), de [présentation](docs/ARCHITECTURE_V1_10.md) et de [cinématique](docs/FORMAT.md), puis l’[intégration Godot](docs/INTEGRATION_GODOT.md). Les [validations](docs/VALIDATION.md) distinguent contrôles réussis, échecs et essais restant à faire.

Les rapports et guides des anciennes livraisons sont archivés et signalés comme tels. L’[atelier](examples/Atelier_Presentation_V1_10/README.md) est un exemple isolé, pas la campagne active. Les sources Godot sous `godot/` servent à maintenir le lecteur commun ; le jeu réel reste dans `C:/dev/Lunaria/game`.

Les [animations de Plaque et Canette](docs/PLAQUE_CANETTE.md) se règlent directement dans leur fiche d’ennemi et utilisent les nouvelles planches de combat de la bibliothèque source.
