# Vérification de la page Campagne

**Date** 25 novembre 2026

- `npm run build` réussi, vérification TypeScript comprise. Vite signale la taille du bundle principal.
- `npm test` réussi avec 1 322 tests réussis et 4 ignorés.
- 18 scénarios Electron réussis dans `campaign.spec.ts`, `campaign-backup.spec.ts` et `levels-campaign.spec.ts`. Ils couvrent notamment l’insertion, le clavier, les déplacements, l’annulation, la navigation, la sauvegarde et la publication dans des dossiers de test isolés.
- Vérification visuelle avec une copie du projet Lunaria à 1000 × 680, 1500 × 900 et 2560 × 1350. Quatre étapes entières sont visibles à 1000 × 680 dès l’ouverture. Le raccourci de fin montre la borne et la suite en préparation dans la même vue. Le Carnet de voyage est sélectionné à l’étape 24 et identifié comme hors version jouable.

- Vérification d’un projet sans niveau à 1000 × 680. L’insertion d’une cinématique dans un parcours vide fonctionne et un titre de projet de 150 caractères ne provoque pas de défilement horizontal.

Les dimensions désignent la zone de rendu Electron. La vérification porte sur l’interface du Studio et sur des projets isolés.

## Aperçus du parcours

- La compilation et les 19 scénarios Electron ciblés ont réussi. L’essai dédié vérifie le défilement horizontal au clavier, l’ordre des plans, le chargement du dernier plan, le fond du plateau, l’état sans fond et le retour à la liste compacte.
- La suite Node compte 1 322 tests réussis et 4 ignorés.
- Dans une copie du projet Lunaria, les 26 plans de « Les racines de Lunaria » ont été parcourus jusqu’au dernier. La capture à 1480 × 1030 montre les scènes composées et le fond de « La serre assiégée ». La lisibilité a aussi été vérifiée à 1000 × 680.

## Lignes repliées à l’ouverture

Le build local est passé. Les 18 scénarios de campagne, sauvegarde et continuité ont réussi sur ce build. Le scénario de dépliage a ensuite réussi après synchronisation du test avec le chargement du projet. Il vérifie l’ouverture au clavier, l’indépendance des lignes, les commandes globales et le retour à l’état replié à la réouverture. Une copie de la campagne de 25 étapes a aussi servi à vérifier visuellement les deux états.

## Parcours sans panneau latéral

Le build local et 19 scénarios Electron ont réussi. La vérification sur une copie de la campagne a confirmé l’ouverture d’un niveau et d’une cinématique depuis leur ligne, et l’affichage d’un aperçu déplié à 1000 × 680 sans débordement horizontal. Les tests couvrent le réordonnancement et le retrait d’une étape au clavier avec confirmation.

## Réserve de contenus

- La compilation locale a réussi. Les 20 scénarios Electron ciblés ont réussi sur ce build. Le scénario de publication après réouverture a été vérifié deux fois après avoir ajouté une attente explicite du chargement dans le test.
- Le scénario dédié couvre le défilement des plans, la pause, le changement d’onglet au clavier, le dépôt d’une cinématique entre deux étapes, le dépôt d’un niveau à la fin et le retour des vignettes après retrait ou annulation.
- Sur une copie du projet Lunaria, la vignette de « 9 - Gare Radis à soif » a défilé, puis a rejoint le début du parcours par glisser-déposer. L’arrêt du défilement avec la préférence de mouvement réduit et l’affichage à 1000 × 680 ont aussi été vérifiés.

