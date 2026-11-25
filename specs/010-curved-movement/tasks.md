# Tâches

- [x] T001 Définir la courbure et échantillonner le trajet et sa longueur dans `src/shared/`.
- [x] T002 Afficher et éditer la courbe dans `Scene.tsx` et `MotionInspector.tsx`.
- [x] T003 Adapter `CinematicMotion.gd` et synchroniser le contrat technique du jeu.
- [x] T004 Vérifier le parcours d’édition Electron, les trajectoires et la parité de lecture.

## Vérifications du 23 novembre 2026

- Le build, 1 305 tests Node et quatre scénarios Electron passent. Quatre tests Node sont ignorés. Le nouveau scénario couvre le glisser-déposer, l’aperçu, l’annulation, la sauvegarde et le retour à la ligne droite.
- Le geste a aussi été essayé sur une copie du plan 03 de « Sous nos pas ». Les coordonnées de A et B coïncident avant et après le geste.
- Le projet Godot du Studio passe 18 444 comparaisons de mouvement et 46 933 comparaisons d’animation. Le projet du jeu passe ses huit suites de cinématiques, dont la même parité de mouvement avec des cas de courbe, d’orientation et de retour.
- La synchronisation couvre les copies liées à la courbure. La comparaison globale du contrat signale encore quatre écarts antérieurs liés au catalogue de présentation. Les essais ont été effectués en local sur Windows.
