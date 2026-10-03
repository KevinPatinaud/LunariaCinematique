# Intégrer et vérifier les cinématiques dans Godot

## Jeu maintenu

Le jeu réel est `C:/dev/Lunaria/game`, sous Godot **4.7.2**. Il possède déjà `addons/lunaria_cinematics/`, les catalogues de présentation et les contrôleurs narratifs. Publier la campagne depuis le Studio vers ce dossier ; ne pas remplacer le projet par le mini-projet de test `godot/` du Studio.

La bibliothèque d’auteur est `C:/dev/Lunaria/LunariaArtLibrary`. Le runtime utilise `res://LunariaArtLibrary`. Une référence `library://02_characters/.../image.png` conserve exactement son chemin interne lors de la publication. Les films compilés vont sous `content/cinematics/`, le catalogue sous `content/design/game_content.json`.

Le lecteur accepte les schémas cinématiques 1 à 4. L’animation de catalogue exige 4 et un lien `presentationCatalog` cohérent. Les rôles de personnage/ennemi/objet restent de la mise en scène ; ils n’instancient pas une IA. Les marqueurs `release` n’activent pas de gameplay dans un film.

## Installer dans un autre projet

Copier **tout** `godot/addons/lunaria_cinematics/`, avec son schéma, ses lecteurs de texte, mouvement, entrée de bulle, présentation et audio. Ce dossier n’est pas un plugin `@tool` à activer. Instancier `CinematicOverlay.tscn`, configurer `library_root` puis appeler `play_file()` ou `play_data()` sur le lecteur. Réagir aux signaux `finished`, `skipped`, `failed` selon le parcours de l’application.

```gdscript
var player = preload("res://addons/lunaria_cinematics/CinematicOverlay.tscn").instantiate()
add_child(player)
player.library_root = "res://LunariaArtLibrary"
player.play_file("res://content/cinematics/mon_film.cinematic.json")
```

Pour une animation de catalogue, installer aussi les lecteurs/contrats de présentation et le contenu de jeu auquel le film se lie ; copier seulement le lecteur cinématique ne suffit pas. Les images brutes peuvent utiliser le repli de chargement d’image lorsque l’import Godot n’est pas encore présent. Vérifier les imports pour les applications exportées, et inclure leurs médias réellement référencés.

## Lecture, texte et audio

Le canevas logique est 1600×900. Les positions sont relatives ; le cadrage conserve les proportions et les queues suivent les personnages transformés. L’import et le recadrage d’un écran 20:9 n’ajoutent pas automatiquement des pixels aux décors : utiliser les images préparées pour ce cadrage.

Les bulles disposent d’une entrée distincte de l’animation du texte. Le premier clic complète une révélation en cours, le suivant avance. `endAdvance` peut demander un clic après dialogues et durée minimale. `CinematicAudio.gd` conserve les musiques sur leur plage de plans et déclenche les sons sur les événements réels. Pause, reprise, sortie de scène et volumes appartiennent au lecteur ; les fondus suivent le déroulement du film. Voir [SON_CINEMATIQUES.md](SON_CINEMATIQUES.md).

Les effets **Orbite**, **Vol en huit**, **Zigzag**, **Roulade**, **Sursaut** et **Oscillation élastique**, les entrées **Chute rebondie**, **Tourbillon**, **Éclosion** et les sorties **Tourbillon**, **Envol en fondu**, **Chute en fondu** sont évalués sur l’image entière de l’acteur. Ils utilisent les mêmes horloges que les autres effets et se combinent avec les déplacements A → B. Mettre à jour ensemble le schéma et `CinematicMotion.gd` dans le lecteur intégré pour lire ces nouvelles valeurs ; une ancienne copie de l’addon peut les refuser même si elle annonce les schémas 1 à 4.

## Contrôles reproductibles

Dans le dépôt Studio, les tests autonomes sont :

```powershell
godot --headless --path godot --script res://tests/motion_parity.gd
godot --headless --path godot --script res://tests/animations_parity.gd
godot --headless --path godot --script res://tests/audio_smoke.gd
```

Dans `C:/dev/Lunaria`, le runner commun teste le lecteur **intégré** :

```powershell
node tools/test.mjs --suite cinematics
node tools/test.mjs --suite campaign
node tools/test.mjs --suite package
```

Pour un contrat modifié : `npm run schema`, puis `node scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game` depuis le Studio, en plus de la mise à jour des ports GDScript concernés. La campagne se publie ensuite séparément.

Les résultats locaux et leurs limites sont dans [VALIDATION.md](VALIDATION.md). Une parité numérique ou un paquet complet ne prouve pas les transitions, la lisibilité ou l’audio sur un téléphone réel. Le CLI cinématique historique ne remplace pas le préflight de campagne pour tous les films du projet.
