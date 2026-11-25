# Plan de réalisation

Ajouter l’option `movement.bend` au schéma cinématique actuel. Sa valeur signée représente la distance du milieu de la courbe à la corde A → B, exprimée en proportion de la hauteur du plan. La direction perpendiculaire est calculée en pixels logiques. La valeur est facultative et bornée de −1 à 1.

Tracer une courbe de Bézier quadratique et faire progresser l’acteur sur sa longueur. Réutiliser le calcul pour la cadence et l’orientation de la marche. Ajouter la poignée et le réglage dans l’éditeur et porter le calcul dans le lecteur GDScript maintenu par le Studio. Régénérer les schémas et synchroniser les copies techniques utilisées par le jeu.

Vérifier une modification, une annulation et une relecture sous Electron. Comparer positions, distance et direction sur la courbe entre TypeScript et Godot.
