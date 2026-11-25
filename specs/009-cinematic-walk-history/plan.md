# Plan de réalisation

L’inspecteur édite la valeur existante `ActorAnimation.speed`. Le lecteur Studio et le lecteur Godot utilisent ce multiplicateur. Les marches de cinématique bouclées, liées au déplacement, prennent pour foulée la valeur `stridePx` du clip ou une estimation à partir de la largeur affichée de la pose. La progression suit la distance réelle du trajet, y compris à l’accélération et au freinage.

La fenêtre de génération retrouve les essais via les identifiants de destination des tâches IA persistées. Elle réutilise le lecteur de planche et l’action d’affectation. La sélection du résultat et l’ajustement de son aperçu précèdent la transaction du projet d’auteur.

Le raccourci d’édition ouvre l’atelier existant sur l’identifiant exact du cycle actif. L’atelier modifie le clip du catalogue et l’inspecteur règle la cadence locale du personnage dans le plan.

Le contrat décrit dans `docs/CONTRAT_STUDIO_GODOT.md` accepte déjà les données produites. La publication et les lecteurs Godot existants lisent ce format. Les essais Node et Electron utilisent des profils et médias isolés. Le code source est en anglais et l’interface en français.

Le Studio joint un diagramme des appuis pour les marches de cinématique en 3 × 2 ou 4 × 2. Le diagramme renseigne la position des membres, tandis que l’image du personnage fournit son apparence. Les nouvelles marches de cinématique utilisent 4 × 2 poses par défaut. L’aperçu partage une seule horloge entre le cycle et le sol et recadre précisément chaque case de la planche. Les clips utilisent le format déjà pris en charge.

La correction de lecture sur un trajet court porte l’identifiant `cinematic-walk-distance-clock`. Son pendant Godot est décrit dans `C:/dev/Lunaria/specs/007-cinematic-walk-distance-clock/spec.md`.
