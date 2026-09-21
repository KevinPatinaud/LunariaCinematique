# Lunaria Studio V1.9

Éditeur desktop React + TypeScript + Node.js/Electron : cinématiques, niveaux, campagne, calibrage global, capacités, effets, projectiles, comportements/IA, phases de boss, événements et variables.

```powershell
npm install
npm test
npm run dev
```

Node.js 22.12 minimum. Sources complètes, pas d'EXE précompilé. Extraire dans un nouveau dossier. Bibliothèque graphique et cinématiques restent partagées, sans copie par niveau.

**Cette livraison n'a pas été compilée/exécutée sous Electron Windows ou Godot.** Les tests Node et de composants navigateur passent ; le typecheck complet reste bloqué par les dépendances indisponibles lors de la livraison. Lire [le rapport de validation](docs/TEST_REPORT_V1_9.md).

## Documentation courante

- [Guide V1.9, installation et utilisation](docs/GUIDE_V1_9.md)
- [Architecture et limites](docs/ARCHITECTURE_V1_9.md)
- [Tests exécutés et tests natifs à lancer](docs/TEST_REPORT_V1_9.md)

Ouvrir `examples/atelier_comportements.game.json`, choisir `examples` comme dossier des films et `example-library` comme bibliothèque, puis publier vers le projet Godot V1.9. La campagne à 40 niveaux est `examples/lunaria.game.json`. Les autres ateliers restent disponibles.

Deux modes conservés. Les nouveaux écrans se trouvent dans Niveaux → Comportements/Variables, et dans chaque niveau → Événements. Les anciennes notes V1.x sont historiques ; ce guide V1.9 fait référence pour le contrat courant.

Le document de jeu est au schéma 3. Le format des cinématiques reste inchangé. Les profils de jeu v15 ne migrent aucune ancienne sauvegarde. Voir le guide avant de publier ou d'exporter.
