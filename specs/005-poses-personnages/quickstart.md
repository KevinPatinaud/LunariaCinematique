# Vérification

1. npm run typecheck, npm test, npm run build.
2. npm run test:e2e:built -- tests/e2e/pose-generation.spec.ts tests/e2e/image-tasks.spec.ts.
3. Profil et bibliothèque isolés : sélectionner Radis, décrire une pose, réduire et retrouver la tâche, appliquer, annuler/rétablir, enregistrer/rouvrir.
4. Erreurs : résultat opaque/vide/inchangé, annulation tardive, source changée, redémarrage, destination modifiée et bibliothèque différente.
5. Essai réel Codex avec Master copié dans une bibliothèque isolée ; inspection visuelle. Publication isolée et lecture Godot.

Preuves et limites dans validation.md.
