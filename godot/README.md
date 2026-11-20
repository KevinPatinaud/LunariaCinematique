# Lecteur cinématique commun — projet de test Godot

Ce mini-projet maintient `addons/lunaria_cinematics/` et les tests de parité mouvement, animation et audio. Le lecteur courant accepte les schémas 1 à 4 et inclut les entrées de bulle, catalogues de présentation et musiques multi-plans. Le script `scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game` maintient la copie de l’addon dans le jeu en conservant ses `.uid`. Son option `--check` compare les copies sans les modifier. Voir le [contrat commun](../docs/CONTRAT_STUDIO_GODOT.md) pour la génération préalable. Le projet réel de Lunaria reste distinct de ce mini-projet de test.

Guide : [intégration Godot](../docs/INTEGRATION_GODOT.md). Les commandes ci-dessous se lancent depuis la racine du Studio avec Godot 4.7.2 :

```powershell
godot --headless --path godot --script res://tests/motion_parity.gd
godot --headless --path godot --script res://tests/animations_parity.gd
godot --headless --path godot --script res://tests/audio_smoke.gd
```

Les vecteurs sont calculés depuis TypeScript. Le jeu intégré sous `C:/dev/Lunaria/game` possède aussi des suites de cinématiques et de campagne, lancées par `node tools/test.mjs` à la racine du dépôt Lunaria. Leur réussite ne signifie pas qu’un téléphone a été testé. Voir les [preuves datées](../docs/VALIDATION.md).
