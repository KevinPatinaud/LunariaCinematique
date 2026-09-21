# Validation V1.4.1 — bouton de lecture depuis le plan courant

## Contrôles exécutés

- **335 tests du cœur et des fichiers réussis**, dont 13 nouveaux tests dans `tests/playback-start.test.ts`. Exécution de `npm test` : compilation TypeScript des tests et du modèle partagé, puis `node --test`.
- **19 contrôles d’interface réussis** dans Chromium, avec les composants réels de l’application transpilés localement. Résultats détaillés dans `validation-v141-ui.json`.
- Transpilation de 34 modules renderer/shared sans erreur syntaxique. Ce contrôle ne remplace pas un typecheck complet de l’application.
- Contrôles visuels des deux boutons sur fenêtres 1648 × 920, 1366 × 768, 1150 × 740 et 1000 × 740 : aucun chevauchement entre eux, aucun débordement horizontal du document dans ces essais.

Les essais couvrent le départ au plan courant, Tout lire, le bouton du storyboard, Maj+Espace avec une vignette ayant le focus, son inhibition pendant une saisie ou une modale, la réorganisation réelle par glisser-déposer, la poursuite jusqu’au plan suivant, Rejouer depuis la même origine, le retour à la sélection et l’absence de mutation du JSON. Un asset absent dans un plan antérieur n’empêche pas l’aperçu des suivants, mais déclenche toujours le diagnostic lors d’une lecture complète.

## Environnement réellement utilisé

Node.js 22.16.0 et compilateur TypeScript préinstallé. Le type Node nécessaire aux tests vient du runtime local ; aucune installation npm réseau n’a été effectuée.

Les tests d’interface sont effectués **hors réseau**, dans une page Chromium `about:blank` : modules et images locales injectés dans la page, API Electron et stockage local simulés. Aucun protocole Electron réel, boîte de dialogue Windows native ni accès fichier du renderer n’est testé par cette partie.

Runtime de test : **React 18.2.0** et **ReactDOM 18.2.0-next-9e3b772b8-20220608**, disponibles localement. Ils ne sont pas les versions déclarées dans `package.json`, qui reste inchangé pour ses dépendances. Aucun bundle tiers provenant du banc de test n’est inclus dans la livraison.

## Non exécuté ici

- Installation complète avec les dépendances déclarées, typecheck global React/Electron, build Vite/Electron et exécutable Windows.
- Les tests Electron natifs de `tests/e2e/studio.spec.ts`, dont trois scénarios V1.4.1 ajoutés pour la lecture depuis la sélection. Ils sont fournis pour l’exécution dans l’environnement de développement normal : `npm run test:e2e`.
- Exécution dans Godot ; aucun fichier de son lecteur n’a été modifié par ce correctif.

## Fichiers de preuve

- `validation-v141-unit.tap` : sortie complète des 335 tests réussis.
- `validation-v141-ui.json` : résultats et environnement des 19 contrôles d’interface.
- `apercu-v1-4-1.png` (archive complète) : capture réelle du renderer dans ce banc de test.

## Référence technique consultée

MDN, `KeyboardEvent.shiftKey` : https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/shiftKey (consulté pendant cette intervention). Les contrôles de focus et de modales de l’application restent prioritaires sur le raccourci de lecture.
