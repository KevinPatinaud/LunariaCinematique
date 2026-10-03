# Documentation de Lunaria Studio

Guides maintenus, actualisés le **2 octobre 2026**. Les versions du Studio, des schémas et du jeu sont distinctes.

| Document | Utilisation |
|---|---|
| [Guide d’utilisation](GUIDE_V1_10.md) | Installation, projet unique, niveaux, films, animations et publication |
| [Architecture](ARCHITECTURE.md) | Renderer, pont Electron, services de fichiers et contrats partagés |
| [Campagne](ARCHITECTURE_CAMPAGNE.md) | Document d’auteur, étapes et compilation |
| [Présentation de combat](ARCHITECTURE_V1_10.md) | Profils, animations, activations, audio et VFX |
| [Format cinématique](FORMAT.md) | Schémas 1 à 4 et extensions actuelles |
| [Sons cinématiques](SON_CINEMATIQUES.md) | Musiques multi-plans, événements et écoute |
| [Intégration Godot](INTEGRATION_GODOT.md) | Lecteur commun, bibliothèque et tests |
| [Validation courante](VALIDATION.md) | Commandes et preuves datées, avec leurs limites |
| [Sources techniques](SOURCES.md) | Références externes utilisées par le projet |

Les nouveaux effets de mouvement, entrées et sorties d’acteur sont décrits dans [Animer un élément dans une cinématique](GUIDE_V1_10.md#animer-un-élément-dans-une-cinématique), avec leurs valeurs JSON dans le [format cinématique](FORMAT.md).

Pour Lunaria, le fichier d’auteur est `C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json`, la bibliothèque source `C:/dev/Lunaria/LunariaArtLibrary`, et la destination de publication `C:/dev/Lunaria/game`. Le nombre de niveaux ou d’animations est une propriété du document, pas un invariant de l’éditeur.

## Archives

Les autres `GUIDE_V1_*`, architectures V1.6/V1.8/V1.9, audits datés, `TEST_REPORT_*.md` et `VALIDATION_*.md` conservent l’état de leur livraison. Les fichiers `validation-*`, `.tap`, `.json` et `.txt` de résultats restent des preuves d’origine. Leurs anciennes mentions « moteur non exécuté », missions fixes ou équipe de cinq ne définissent pas le produit courant. Les anciens guides spécialisés de bibliothèque, lecture, projets récents et mise à jour sont conservés pour comprendre l’évolution ; utiliser le guide courant pour les procédures.

Les guides maintenus de campagne et présentation, ainsi que l’intégration et le guide utilisateur, ont une copie dans `C:/dev/Lunaria/game/docs`. Actualiser ces copies lorsqu’un contrat change. Le [README du Studio](../README.md) est le point d’entrée pour une installation.
