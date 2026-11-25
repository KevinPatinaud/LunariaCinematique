# Tâches

- [x] T001 Exposer la cadence du cycle actif et l’accès à son atelier dans l’inspecteur A → B.
- [x] T002 Relier la cadence des nouvelles propositions à leur aperçu et à leur affectation.
- [x] T003 Retrouver les essais du plan et réutiliser un clip déjà importé.
- [x] T004 Vérifier le changement de cadence, le redémarrage et la réutilisation sous Electron.

## Vérifications du 23 novembre 2026

- Compilation et contrôle des types réussis.
- Suite Node. 1 299 réussites, 4 essais ignorés.
- Trois scénarios Electron réussis. Le nouveau scénario ouvre le cycle, le renomme, accélère les poses, vérifie la durée du trajet, rouvre le projet et réutilise un essai sans créer de clip supplémentaire. Son entrée IA est une planche de test.
- Parité des animations Godot 4.7.2. 46 930 comparaisons, aucun échec.
- L’historique des propositions utilise le profil local du Studio. Les clips ajoutés et la cadence du personnage sont enregistrés avec le projet selon le parcours de sauvegarde habituel.

## Amélioration du cycle

- [x] T005 Guider l’alternance des appuis et proposer huit poses dans le flux de génération de cinématique.
- [x] T006 Recaler l’aperçu animé et rendre ses commandes accessibles.
- [x] T007 Vérifier une génération réelle de Radis avec huit poses sur fond transparent.

La compilation et les trois scénarios Electron passent. La suite Node compte 1 301 réussites et quatre essais ignorés. L’essai Codex produit une planche 4 × 2 de 1 664 × 872 pixels avec transparence native. Les poses de passage montrent clairement l’échange des jambes. Le mouvement des bras reste discret.

## Correction de lecture sur un trajet court

- [x] T008 Synchroniser la phase des marches de cinématique avec la distance du trajet, avec une estimation automatique de la foulée.
- [x] T009 Conserver le multiplicateur de cadence et vérifier la même horloge dans les deux lecteurs Godot.
- [x] T010 Lire le plan de Radis à partir d’une copie du brouillon, sans modifier le projet d’auteur.

La boucle du plan progresse d’environ 2,3 pas sur le trajet du brouillon, contre 7,2 avec l’ancienne horloge. La compilation, les trois scénarios Electron et 1 302 tests Node passent. Les tests de parité Godot passent dans les deux dépôts avec 46 933 comparaisons par lecteur.

## Taille à l’application d’une marche générée

La pose fixe des marches générées conserve la boîte du plan. La planche est cadrée sur la hauteur visible de cette pose et sur la ligne des pieds. Une seule échelle est calculée pour le cycle, afin de conserver les variations naturelles d’une pose à l’autre.

Le 24 novembre 2026, la planche existante de Rose a été essayée sur une copie du plan 03 de « Sous nos pas ». Dans Electron, la mesure donne 260,47 pixels logiques au repos et 259,48 sur l’image de marche observée. Le lecteur Godot donne 260,47 et 260,14 sur son image échantillonnée. Le build passe, ainsi que 1 307 tests Node, avec quatre essais ignorés.
