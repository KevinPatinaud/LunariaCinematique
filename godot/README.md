# Lecteur Godot V1.5

Copier **tout** `addons/lunaria_cinematics` dans le dossier `addons` du jeu.

Guide : `../docs/INTEGRATION_GODOT.md`. Nouveaux fichiers v3 : animations de texte, nouvelles entrées/effets et sorties. **`CinematicText.gd` et le schéma JSON actualisé sont requis.** Les fichiers v1/v2 restent acceptés. Le rôle ennemi est une information de mise en scène, pas une création d’intelligence artificielle.

Cette partie est fournie en sources et n’a pas été exécutée dans Godot pendant la livraison. Le mini-projet `project.godot` sert uniquement aux tests, pas à remplacer celui du jeu.

```powershell
godot --headless --path godot --script res://tests/motion_parity.gd
godot --headless --path godot --script res://tests/animations_parity.gd
```

Les vecteurs de référence sont générés depuis TypeScript. Les scripts comparent les valeurs dans le moteur et préchargent le lecteur entier. Leur présence n’est pas une preuve de parité exécutée.
