# Validation — Lunaria Studio V1.6 et jeu alimenté par le Studio

## Périmètre et environnement

Base : Studio V1.5 complet et jeu Plateau libre, fournis dans cette conversation. Sources React/TypeScript/Node/Electron et GDScript modifiées. Aucun moteur Godot ni Electron natif exécutable installé ici. Accès npm indisponible (erreur réseau EAI_AGAIN lors de l’essai d’installation).

Node réel : 22.16.0. TypeScript local pour les tests partagés et services de fichiers. Interface : Chromium/Playwright, React 18.2 disponible localement ; application injectée dans une page locale à cause de la politique de navigation du navigateur de test. Le pont de tests appelle les vraies classes `GameDocuments` et `publishGameProject` via un serveur Node temporaire, sans fenêtres Electron ni preload natif.

## Résultats effectivement exécutés

| Contrôle | Résultat | Portée |
|---|---:|---|
| `npm test` Studio | **612/612** | 540 tests préexistants + 72 nouveaux ; types, validation, planning, duplication, calendrier narratif, formule de dégâts, fichiers, conflits, récents, récupération, publication et confinement des chemins |
| `node --test tests/game_content.test.mjs` | **67/67** | JSON fourni, cohérence, 40 niveaux, préchargements résolus, contrôles de sources/architecture et contrat ; ne compile pas GDScript |
| Tests Node de publication des cinématiques | **49/49** | Vrais fichiers temporaires, références, publication et associations stables |
| `node tools/game-content.mjs` | réussi | 40 niveaux, 28 plantes, 13 ennemis, 1 511 ennemis explicitement planifiés |
| `node tools/cinematics.mjs verify` | réussi | Démonstration embarquée et ses cinq ressources |
| Interface Chromium | **37/37** | Voir `ui-v1-6.json` : bascule des modes, édition, catalogue partagé, nombres, décimales, groupes/vagues, sauvegarde et réouverture Node réelles, publication, historique, diagnostics et largeur compacte |
| Transpilation de 49 modules renderer/shared | aucune erreur syntaxique relevée | Exécutés ensuite dans le harnais ; ce n’est pas un typecheck complet |

Les nouveaux tests Node incluent l’interdiction d’une surcharge de stats par niveau, du terrain spécial, de la difficulté, de l’évolution et des compétences progressives. Ils vérifient les 1–200 niveaux, les 50 vagues, les références, les effectifs max, le changement global sans réécriture des niveaux, la stabilité des timings et la récupération d’un brouillon sémantiquement incomplet.

Les trois scénarios ajoutés dans `tests/e2e/levels.spec.ts` ciblent le vrai Electron : catalogue partagé après bascule et sauvegarde, effectifs et plantes autorisées, publication native avec sauvegarde `.bak` et conservation des autres fichiers. Ils sont **fournis, non exécutés ici**, comme les anciens scénarios Electron.

## Contrôles non aboutis / non exécutés

`npm run typecheck` s’arrête avec :

```text
error TS2688: Cannot find type definition file for 'vite/client'.
```

La chaîne build réelle dépend des bibliothèques déclarées (React 19.3, Electron et Vite notamment), non installées dans cet environnement. Aucune validation complète TypeScript du renderer/preload/main, aucun build Windows, aucun test de dialogue natif n’est revendiqué.

Godot non disponible : pas d’import, de compilation GDScript, de scène lancée, de sauvegarde testée dans le moteur, de combat simulé ou d’export APK/EXE. Les contrôles de sources et Node ne couvrent ni le typage natif ni le rendu. Le test `tests/studio_content_smoke.gd` est livré pour le chargement validé, les catalogues figés, toutes les compositions de vague, les statistiques communes, les résistances, le roster, le nombre dynamique de niveaux et les associations cinématiques.

L’ancien équilibrage variait par niveau/vague ; il n’est pas conservé au sens de la difficulté d’une partie. Les chiffres de base sont importés et les vagues explicites constituent une base de travail. Il faut réaliser des parties sur les niveaux de début, milieu et fin de campagne après calibration.

## Commandes à exécuter dans l’environnement de développement

Studio :

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run test:e2e
npm run dist:win
```

Jeu, depuis `game/` :

```powershell
node tools/test-game.mjs --static-only
node tools/test-game.mjs --godot "C:/Godot/Godot.exe"
```

La deuxième commande importe le jeu et exécute les tests natifs d’intégration, de contenu et de cinématiques. Elle utilise des données de test ; les essais visuels et de campagne réelle restent complémentaires. Un test historique archivé en `.txt` n’est pas compté comme réussi.

Les copies finales des archives ont également été relues et testées CRC avant livraison. Les polices binaires, node_modules, caches Godot, profils de tests et dossiers de compilation ne sont pas inclus.
