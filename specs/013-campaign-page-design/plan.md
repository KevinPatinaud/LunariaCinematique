# Plan de refonte de la page Campagne

**Date** 25 novembre 2026 · [Spécification](spec.md)

## Approche

Regrouper les commandes de sauvegarde et de vérification en tête de page. Présenter les jalons dans une barre de raccourcis. Afficher le parcours à côté de la réserve de contenus, avec des points d’insertion compacts entre les étapes et un bouton « Modifier » dans les lignes de niveau et de cinématique.

## Constitution et structure

- L’édition relève du renderer Electron, avec React et TypeScript.
- `src/renderer/game/CampaignEditor.tsx` porte la présentation et la navigation locale. La nouvelle feuille `campaignEditor.css` remplace les anciens sélecteurs de campagne dispersés.
- Les opérations documentaires, les identifiants, la sauvegarde et la publication continuent de passer par les commandes existantes. Le contrat Studio/Godot, les médias et le format de sauvegarde ne demandent aucune adaptation.
- Le projet et le profil des essais sont isolés. Le code est en anglais et les textes de l’interface en français.

## Validation

Compiler et exécuter les tests Node et les suites Electron de campagne, sauvegarde et continuité des niveaux. Vérifier aussi sur un parcours représentatif de 25 étapes, à la taille minimale de la fenêtre et sur grand écran. Les résultats figurent dans [validation.md](validation.md).

## Aperçus du parcours

Utiliser les plans des cinématiques intégrées au projet et le fond de plateau déjà référencé par le niveau. Réutiliser la composition du Studio en image fixe et limiter le montage des scènes aux plans à proximité de la zone visible. Employer les ressources de la bibliothèque active. Prévoir des aperçus repliés par défaut et des commandes de dépliage dans les lignes et en tête du parcours. Vérifier le défilement horizontal sur un film de 26 plans, les fonds existants et l’ouverture indépendante des lignes.

## Réserve de contenus

Ajouter le panneau « À placer » à droite du parcours. Déduire les contenus disponibles des identifiants des étapes et des documents associés. Utiliser la composition du Studio pour le plan courant de chaque vignette visible. Brancher le glisser-déposer et la sélection clavier sur les points d’insertion existants. Vérifier les deux types de contenu, le retour après retrait et annulation, les onglets et la largeur minimale dans Electron.
