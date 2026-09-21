# Validation V1.9 — 21 septembre 2026

## Exécuté

**Studio : 827 tests Node réussis, aucun échec.** Les 92 cas nouveaux portent sur l'édition/validation des comportements, les références de capacités/phases, les événements, variables, seuils, budgets et films. Les sauvegardes, récupération et publication utilisent de vrais fichiers temporaires. Le code shared/main utilisé par ces tests est compilé avec TypeScript via `tsconfig.tests.json`. Les tests de syntaxe transpilent aussi les sources, sans remplacer le typecheck de l'application complète.

**Jeu : 163 tests Node de données et contrats de sources réussis**, dont 44 nouveaux pour V1.9, puis **49 tests Node du publieur de cinématiques réussis**. `tools/game-content.mjs` valide les données publiées et `tools/cinematics.mjs verify` contrôle le catalogue de démonstration. Les assertions nommées `source:` vérifient du texte et des invariants de fichiers : elles ne prétendent pas exécuter le GDScript.

**Interface : 41 contrôles réussis (12 + 29), sans exception JavaScript.** Le vrai module GameEditor et ses composants ont été exécutés dans Chromium installé localement avec React/ReactDOM 18.2, extrait du runtime JupyterLab disponible. Un pont de test appelle les véritables services Node de documents, récupération et publication. La sélection native de fichiers et les dialogues de confirmation sont simulés. Tests : création de comportement et règles, phases, attribution, duplication, variables, suppression refusée, renforts, conditions, ordre des actions, annuler/rétablir, fichiers liés, sauvegarde réelle, publication réelle et nouveau projet cohérent.

Un défaut détecté pendant cette validation a été corrigé : un nouveau projet reprenait le catalogue courant sans réinitialiser correctement les étapes du parcours. Les films du catalogue sont maintenant conservés et une étape valide est créée pour le nouveau niveau. Les notifications de statut React ne renvoient plus implicitement une valeur comme fonction de nettoyage.

Captures : module réel dans un cadre de test, pas application Electron native. Le navigateur n'accédait pas au serveur HTTP local ; les appels de fichiers passent par la liaison Playwright/Python vers Node. La version React déclarée par le projet demeure 19.3 ; aucune substitution de dépendances n'a été livrée.

## Non exécuté / limites

`npm run typecheck` a été tenté et échoue à l'entrée sur `TS2688: Cannot find type definition file for vite/client` : les dépendances de l'application ne sont pas installées dans cet environnement. Le typecheck complet React 19.3/Electron, le build Windows et les nouveaux scénarios Electron natifs n'ont donc **pas** été validés.

Godot n'est pas disponible. Aucune compilation, exécution, partie, mesure de performance, sauvegarde native ou export APK/EXE n'a été réalisé. Les préchargements de scripts sont contrôlés comme chemins de fichiers existants ; cela ne constitue pas une analyse de types GDScript.

Les suites natives fournies comprennent `logic_runtime_smoke.gd` (vraies primitives, compteurs, phases, limites, files, reprise) et `cinematics/logic_integration_smoke.gd` (hub réel, pause, permission de passage, aucune progression indue). Elles sont raccordées au runner, mais leur résultat reste à établir sur une installation Godot. Quatre nouveaux scénarios Electron se trouvent dans `tests/e2e/logic.spec.ts`.

## Reproduire

Studio :

```powershell
npm install
npm test
npm run typecheck
npm run build
npm run test:e2e
```

Vérifier le nom exact du script E2E dans package.json de la livraison. Il compile et lance Electron localement ; il ne passe pas par le pont de validation ci-dessus.

Jeu, depuis le dossier contenant project.godot :

```powershell
node tools/test-game.mjs --static-only
node tools/test-game.mjs --godot "C:/Godot/Godot.exe"
```

Adapter le chemin de l'exécutable. Le runner n'interprète pas une absence de Godot comme une réussite. Pour le test complet des événements de l'atelier, publier d'abord `examples/atelier_comportements.game.json` depuis le Studio, puis lancer le jeu. Les suites fondées sur les 40 niveaux fournis doivent être exécutées avant de remplacer leur fixture de contenu.

Avant diffusion, vérifier visuellement : passage du seuil de boss, message joué une seule fois, renforts planifiés, film obligatoire puis reprise, abandon/reprise pendant le film, variables non conservées après défaite, sauvegarde en plein effet, gain de campagne après victoire, dernière vague avec actions différées et options de réduction du mouvement.

Les attaques spéciales des boss ont changé d'implémentation et de rythme. Ces tests ne certifient pas l'équilibrage des 40 missions, ni l'identité exacte avec leurs anciennes attaques natives.
