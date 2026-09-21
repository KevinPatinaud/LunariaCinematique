# Validation V1.8 — exécutions et limites

Date de préparation : 21 septembre 2026. Base : archives Studio V1.7 et jeu Campagne Studio fournies. Ce rapport remplace les résultats historiques pour cette livraison.

## Résultats effectivement exécutés

| Contrôle | Résultat | Environnement |
|---|---:|---|
| Tests Studio `npm test` | **735 / 735** | Node 22.16.0, TypeScript local 5.9 ; modules partagés et services Node compilés. |
| Contrats/données/sources du jeu | **119 / 119** | Node ; pas d’exécution de GDScript. |
| Tests de publication des cinématiques | **49 / 49** | Node, fichiers temporaires réels. |
| Contrôles d’interface V1.8 | **32 / 32** | Chromium, React 18.2 local, module GameEditor réel. |
| Projets exemple du Studio | **3 valides** | Campagne initiale, campagne découverte et atelier de capacités. |
| Catalogue cinéma embarqué | **valide** | Un film technique, cinq références de ressources ; non associé à l’histoire. |

Par rapport au Studio V1.7, 72 tests Node ont été ajoutés pour les catalogues, les valeurs, le calcul, les références, le brouillon et la publication. Les tests de publication utilisent de vrais fichiers temporaires, pas seulement des assertions sur du texte source.

Les premières passes ont détecté une incohérence de l’ordre de la marque de recyclage et des assertions historiques à mettre à jour après la centralisation des dégâts. Les sources finales ont été corrigées avant les passes réussies. Dans le test d’interface, une assertion attendait un ancien libellé (« Brise-armure » au lieu du nom de catalogue « Armure neutralisée ») ; l’assertion a été corrigée après contrôle. Aucune exception React n’a été observée pendant la passe finale.

## Ce que les 32 contrôles d’interface vérifient

Montage du véritable éditeur, trois nouveaux onglets, définition protégée lorsqu’elle est référencée, virgule décimale, incompatibilité de cible, blocage de publication, brouillon à liste vide conservé sur disque, réorganisation des effets, aperçu chiffré, porteur ennemi, création de poison et de projectile, période invalide puis corrigée, enregistrement réel, attribution de la même capacité aux deux camps, navigation de la fiche vers la définition, publication groupée réelle, réouverture, annuler/rétablir et largeur 1 120 pixels sans débordement horizontal global.

Le harnais a transpilé les 27 modules de production nécessaires à GameEditor en CommonJS, sans réécrire les composants. Son en-tête de montage de test est distinct de l’application ; les captures livrées sont celles du module réel, recadrées sur `.gd-shell`. Le navigateur échange avec les véritables classes Node GameDocuments et campaignPublisher, via un pont HTTP local fourni par le harnais. Les sélecteurs de fichiers et confirmations ont été simulés. **Ce n’est pas une exécution Electron native.**

La version React 18.2 utilisée pour ce contrôle provient du runtime JupyterLab local. Elle n’est ni ajoutée au projet ni distribuée. Le package du Studio conserve React 19.3 et Electron 44 déclarés ; leurs dépendances n’ont pas pu être installées dans cet environnement réseau indisponible.

## Vérifications non exécutées ou non abouties

- `npm run typecheck` : **non abouti**, `TS2688: Cannot find type definition file for 'vite/client'`. Le typecheck complet du renderer et du main Electron n’est donc pas validé. `npm test` compile en revanche les modules qu’il importe et contrôle la syntaxe TS/TSX des sources.
- Build Vite/Electron, packaging EXE et tests Playwright natifs : **non exécutés**. Quatre scénarios Electron V1.8 sont fournis dans `tests/e2e/combat.spec.ts`; les marqueurs de publication et le badge des anciennes suites ont été actualisés.
- Godot : **exécutable absent**. Pas de compilation GDScript, pas de partie lancée, pas de validation du rendu, de l’audio, des performances ou de la reprise dans le moteur.
- `tests/combat_runtime_smoke.gd` : fourni et référencé par le lanceur, **non exécuté**. Il doit contrôler les règles de combat et une sauvegarde courante dans le vrai moteur.
- Campagne complète et équilibrage : **non simulés ni rejoués**. Les pourcentages de victoire ne sont pas estimés.

Les assertions de sources ne sont pas des preuves d’exécution du jeu. Le calcul chiffré du Studio n’est pas une simulation ni une validation de parité du moteur. Cette livraison constitue une intégration de sources à tester nativement avant distribution, pas un build certifié jouable.

## Reproduire sur un poste équipé

Studio : `npm install`, `npm test`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.

Jeu : `node tools/test-game.mjs --static-only`, puis `node tools/test-game.mjs --godot "C:/Godot/Godot.exe"`.

Publier l’atelier, placer Radis sur l’allée 3, observer contacts et poison, tester un ennemi doté de la même capacité, puis interrompre/reprendre une bataille. Rejouer ensuite plusieurs missions et boss avant de publier commercialement. Les tests natifs doivent être exécutés avec l’installation Godot du projet, et non déduits des résultats Node.

## Sources de référence consultées

Documentation officielle Godot (ligne de commande et dictionnaires immuables), documentation de sécurité Electron et page officielle des versions React. Ces consultations guident les API ; elles ne remplacent aucune exécution native. Aucun contenu connecté privé, dépôt externe, e-mail ou calendrier n’a été utilisé pour reconstruire les projets.
