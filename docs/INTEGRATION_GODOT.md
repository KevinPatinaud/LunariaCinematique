# Intégration dans Lunaria / Godot

Le lecteur est livré **en sources GDScript pour Godot 4.x**. Il n'a pas été exécuté dans un moteur Godot pendant cette livraison. Faire les essais ci-dessous dans une branche du jeu avant toute intégration de production.

## Installer le lecteur

**V1.5 : remplacer le dossier complet, pas seulement CinematicPlayer.gd.** Le nouveau `CinematicText.gd`, les mouvements, la disposition et le schéma actualisé sont requis. Le lecteur accepte v1, v2 et v3 ; les nouvelles animations de texte/acteurs utilisent v3. Les anciennes références `library://` restent identiques.

`role: "enemy"` reste un rôle de mise en scène, pas une création d’intelligence artificielle. Une animation transforme le PNG entier. Les réglages de texte peuvent être appliqués aux bulles comme aux narrations. Premier clic : finir la révélation ; suivant : avancer. La durée automatique additionne l’apparition et le temps de lecture. Voir [le guide V1.5](GUIDE_V1_5.md).

Copier le dossier `godot/addons/lunaria_cinematics` dans le dossier `addons/` du projet Godot. Le nom `addons` organise les sources : ce lecteur n'est pas un plugin `@tool` à activer dans les paramètres de l'éditeur.

```text
res://
├── addons/lunaria_cinematics/
│   ├── CinematicPlayer.gd
│   ├── CinematicText.gd               ← nouveau en V1.5, requis
│   ├── CinematicLayout.gd             ← requis
│   ├── CinematicMotion.gd             ← nouveau en V1.4, requis
│   ├── CinematicValidator.gd
│   ├── CinematicOverlay.tscn
│   └── cinematic.schema.json
├── graphic_library/...
└── cinematics/CIN_PROLOGUE.cinematic.json
```

Instancier `CinematicOverlay.tscn` dans la scène du jeu. Son `CanvasLayer` affiche le lecteur au-dessus du gameplay. Régler `library_root` sur le chemin `res://` de la bibliothèque commune, **avec les mêmes chemins internes que dans l'éditeur**.

Exemple :

```text
Éditeur : C:\Lunaria\graphic_library\01_europe\lunaria\...\image.png
JSON    : library://01_europe/lunaria/.../image.png
Godot   : res://graphic_library/01_europe/lunaria/.../image.png
```

Une bibliothèque source située dans le projet Godot peut être sélectionnée directement par Electron : nul besoin de la recopier dans l'éditeur. Une bibliothèque extérieure au projet doit d'abord être intégrée à la chaîne d'assets du jeu ; Godot ne lit pas automatiquement un chemin Windows enregistré ailleurs.

## Exemple d'appel

Avec une instance `CinematicOverlay` dans ta scène :

```gdscript
extends Node

@onready var cinematic: LunariaCinematicPlayer = $CinematicOverlay/CinematicPlayer

func _ready() -> void:
    cinematic.library_root = "res://graphic_library"
    cinematic.finished.connect(_on_cinematic_finished)
    cinematic.failed.connect(_on_cinematic_failed)
    cinematic.stopped.connect(_on_cinematic_stopped)
    cinematic.play_file("res://cinematics/CIN_PROLOGUE.cinematic.json")

func _on_cinematic_finished(cinematic_id: String) -> void:
    print("Cinématique terminée : ", cinematic_id)
    # Reprendre ici ton gameplay / la quête / le changement de scène.

func _on_cinematic_failed(message: String) -> void:
    push_error(message)
    # Afficher un retour contrôlé et rétablir l'état du gameplay.

func _on_cinematic_stopped(cinematic_id: String) -> void:
    print("Cinématique interrompue : ", cinematic_id)
```

Méthodes : `play_file(path) -> bool`, `play_data(dictionary) -> bool`, `pause()`, `resume()`, `advance()`, `stop()`, `is_playing()`. Signaux : `finished(id)`, `stopped(id)`, `failed(message)`, `shot_started(id)`.

`pause_gameplay` est désactivé par défaut. Si activé, le lecteur restaure l'état de pause précédent à sa fermeture ; ton jeu doit néanmoins empêcher ses autres gestionnaires d'entrée d'agir pendant la cinématique. Le lecteur reste actif lorsque l'arbre est en pause. Le choix de pause relève de ton intégration, pas du JSON.

Le clic gauche, le toucher et `ui_accept` avancent les répliques. Les événements souris/tactiles émulés sont filtrés pour éviter une double avance. Les interactions tactiles restent à tester sur Android.

## Police et rendu

Affecter la police du jeu à `dialogue_font`. Sans affectation, Godot utilise sa police de secours. L'éditeur n'embarque pas de fichier de police ; il utilise Georgia/serif disponible sur la machine. Les retours à la ligne exportés sont communs, mais les glyphes, l'anticrénelage et les métriques peuvent différer.

Les cadres originaux sont dessinés par régions de texture ; la pointe est vectorielle. Aucun fichier d'image supplémentaire n'est requis pour chaque bulle. Les deux PNG doivent être importés comme textures et ne pas avoir été redimensionnés ou remplacés par une version de dimensions différentes : les découpes attendent 1536×1024.

Le canevas logique reste 1600×900 ; des bandes sont ajoutées pour les autres proportions. Vérifier la lisibilité du texte et les marges sur écran de téléphone. Le lecteur ne réalise ni reflow narratif par orientation ni gestion automatique d'une interface portrait.

## Export du jeu : point indispensable

Inclure les cinématiques et `addons/lunaria_cinematics/cinematic.schema.json` dans les filtres d'export des fichiers non ressources, par exemple `*.json`.

Les PNG et sons sont chargés par chemins calculés. Ils doivent donc figurer dans les ressources exportées même sans référence `.tscn` statique. Utiliser l'export de toutes les ressources ou une sélection explicite vérifiée de la bibliothèque. Oublier ce point peut produire un aperçu correct dans l'éditeur mais des fichiers introuvables dans l'APK/PCK. Voir la documentation officielle citée dans `SOURCES.md`.

La V1 charge les ressources importées avec `ResourceLoader`. Un PNG brut simplement téléchargé dans `user://` n'est pas une ressource importée équivalente : cette livraison ne fournit pas de système de contenus additionnels ou d'import dynamique.

## Recette avant livraison du jeu

Tester une cinématique simple sans personnage, puis un plan avec un personnage et une bulle attachée. Vérifier l'ordre des répliques, les clics rapides, la pause, le son, la sortie normale et l'interruption. Tester une image introuvable, une version JSON refusée, plusieurs rapports d'écran et une exportation de développement Android.

Comparer l'aperçu React et Godot sur les mêmes plans. Confirmer que la caméra et les pointes restent cohérentes et adapter la police si nécessaire. Le lecteur ne déclenche aucune quête et n'enregistre aucune partie de lui-même : raccorder ces opérations dans les gestionnaires des signaux.


## Changements du lecteur V1.2 à vérifier dans Godot

Recalcul des lignes dérivées, temps écoulé aux frontières de plans/répliques, conservation des StyleBox utilisés par le dessin différé, miroir horizontal sans rectangle de taille négative, volume nul effectivement converti en silence et erreurs de texture rendues explicites. Ces sources ont été relues, mais ni le parseur GDScript ni les scènes n’ont été exécutés ici.

## Recette complémentaire V1.4

Tester un objet en balancement avec pivot haut, un personnage en respiration avec pivot bas et un trajet combiné à un flottement. Comparer les retours à l’état de repos, les délais après entrée, le miroir horizontal, les pointes de bulles, la caméra, la pause et les attentes du joueur. Vérifier une sortie de cadre volontaire.

Le calcul est pur et piloté par le temps du plan ; aucune animation `Tween` n’est lancée séparément. Les effets bouclés continuent durant l’attente d’une réplique, mais pas durant une pause. Les textes restent dans leur espace écran. Les images sont toujours chargées depuis la bibliothèque partagée.

La commande `godot --headless --path godot --script res://tests/motion_parity.gd`, depuis la racine de cette distribution, compare 330 jeux de valeurs générés par TypeScript avec les calculs GDScript et précharge le lecteur complet. Elle n’a pas été exécutée ici. Ne pas copier le mini-projet de tests `godot/project.godot` dans le jeu.


## Contrôle des nouvelles animations

Le sous-projet `godot/` permet de lancer `tests/animations_parity.gd` en mode headless. Le script compare les glyphes, durées et transformations aux cas de référence générés par le code TypeScript. Il précharge le lecteur complet pour détecter aussi les erreurs de syntaxe. Ce test **n’a pas été exécuté dans l’environnement de livraison**.

```powershell
godot --headless --path godot --script res://tests/animations_parity.gd
```

`CinematicText.gd` utilise le découpage en caractères composites du `TextServer` pour éviter de fragmenter un caractère accentué ou un emoji joint. La segmentation ne garantit pas que la police du jeu possède tous les glyphes nécessaires. Configurer et tester sa propre police ; aucune police n’est fournie.
