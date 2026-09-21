# Lunaria V1.10 — installation et utilisation

## Nature de cette livraison

Deux projets sources complets : Studio React/TypeScript/Node/Electron et jeu Godot/GDScript. La présentation de combat est désormais définie dans le document de jeu et interprétée par un lecteur générique. Les deux modes principaux restent **Cinématiques** et **Niveaux**.

**L’intégration native et le build desktop ne sont pas validés dans cette livraison.** Les tests Node ont été exécutés ; les dépendances déclarées n’ont pas pu être installées et Godot n’est pas présent dans l’environnement de réalisation. Aucun EXE ni APK n’est fourni. Lire `docs/TEST_REPORT_V1_10.md` avant de remplacer une version de travail.

## Installation du Studio

Extraire les deux archives dans deux nouveaux dossiers voisins. Conserver les projets précédents. Le Studio déclare Node >= 22.12.0. Dans son dossier contenant `package.json` :

```powershell
npm install
npm test
npm run typecheck
npm run build
npm start
```

Pour développer, utiliser `npm run dev` après l’installation des dépendances. `npm run dev:web` est un mode navigateur : ce n’est pas une validation de l’application Electron ni de ses permissions de fichiers.

Les versions déclarées du projet initial ont été conservées : React/React DOM ^19.3.0, TypeScript ~5.9.3, Electron ^44.4.2, Vite ^7.3.0, types Node ^22.0.0. Leur installation et leur compatibilité ensemble restent à vérifier sur une machine disposant du registre npm. Il n’y a pas de nouveau serveur, de base de données, de Rust ou de Tauri.

En cas d’échec de `npm install`, ne pas considérer un démarrage partiel dans le navigateur comme un build réussi. En cas d’échec des tests ou du typecheck, conserver le journal avant toute publication.

## Ouvrir le jeu

Le `project.godot` fourni déclare Godot 4.7. L’ouvrir avec le moteur correspondant, laisser l’import se terminer puis lancer le projet. Les scripts et ressources de présentation sont déjà intégrés au jeu ; aucune superposition de correctifs n’est nécessaire.

Dans le dossier du jeu :

```powershell
node tools/test-game.mjs --static-only
node tools/test-game.mjs --godot "C:/Outils/Godot/Godot_console.exe"
```

Adapter uniquement le chemin de l’exécutable Godot. La première commande ne lance **aucun moteur**. La seconde lance les contrôles Node, l’import et les suites Godot, dont `presentation_runtime_smoke`. Elle doit être exécutée avant de déclarer ce runtime validé.

Le contenu actif reste la campagne principale à 40 niveaux. L’atelier est séparé et ne change pas automatiquement cette campagne.

## Relier la bibliothèque commune

Dans le Studio, mode **Cinématiques**, choisir comme bibliothèque le dossier **`game/LunariaArtLibrary`** de l’archive du jeu. Cela donne accès aux images, atlas et sons réellement fournis. Ne pas choisir le dossier `assets` ni un sous-dossier `combat` : les références partent de la racine `LunariaArtLibrary`.

`example-library` est conservée pour les anciens exemples autonomes du Studio et ses tests desktop. Elle ne contient pas le nouveau catalogue graphique de combat. Les nouvelles ressources de combat n’ont été ajoutées qu’à la bibliothèque du jeu, pas recopiées pour chaque espèce ou chaque animation.

Les sons déplacés depuis les anciens dossiers restent également utilisés par les effets d’interface et musiques historiques. `docs/ART_TRANSFER_V1_10.json` fournit la correspondance des déplacements.

## Modifier l’attaque de Radis

1. Passer en **Niveaux** et ouvrir `game/content/design/game_content.json`, ou `examples/lunaria.game.json` pour travailler sur une copie d’auteur.
2. Ouvrir la fiche de **Radis**, puis **Animations de combat**. Le slot `attack` résout `radish_throw` dans le profil de Radis.
3. Utiliser **Éditer** pour modifier l’animation partagée, ou **Dupliquer et personnaliser** pour isoler le réglage. Le Studio indique les références affectées par une modification.
4. Dans l’éditeur, lire l’animation, régler les durées, réordonner les frames, modifier les rectangles d’atlas, les ancrages et le marqueur `release`. La séquence originale de quatre poses est conservée. Une grille crée des régions de découpe, jamais de nouveaux PNG.
5. Enregistrer le projet. Utiliser **Publier la campagne** vers le dossier du jeu fourni. Les erreurs de référence ou de découpe bloquent l’écriture avant la mise à jour du contenu actif.
6. Relancer le jeu : le catalogue est chargé au démarrage, pas rechargé à chaud au milieu d’un combat. Vérifier visuellement l’attaque et le départ du projectile.

Les aperçus disposent de lecture/pause, reprise, curseur, déplacement frame par frame, retour au début, ancrages, miroir et réduction des mouvements. Les marqueurs son/VFX sont réservés à la lecture ; déplacer manuellement le curseur ne lance aucune capacité. Le bouton « Repos » rembobine la définition à t=0 ; il ne change pas l’animation sélectionnée pour une autre définition `idle`.

## Capacités, profils, audio et VFX

La navigation repliable **Présentation** regroupe Animations, Profils d’animation, Audio et VFX. Les capacités disposent d’une section Présentation : slot sémantique, mode/délai de libération et indices de présentation de lancement/impact. Ne pas mettre un identifiant comme `radish_throw` dans une capacité partagée : choisir `attack`.

Un slot absent hérite du profil global. Un slot de base doit toujours être résolu. Une liaison optionnelle vide, telle que `victory`, désactive ce slot. Une plante ne se déplace pas parce qu’elle possède une animation `move`.

Les sons proposent fichier, catégorie, volume, boucle, variation de hauteur et limite simultanée. Un champ sonore vide hérite ; si toute la chaîne est vide, aucun son n’est joué. Pour rendre un événement explicitement silencieux malgré un son global, utiliser un son référencé de volume zéro, ou retirer le son de la chaîne globale.

Les VFX sont visuels : ils ne modifient ni les PV ni les vitesses. Les préréglages sont volontairement simples, rendus par des primitives ou une image ; ce n’est pas un éditeur de particules/shaders. Une traînée de projectile utilise les paramètres de la définition comme une trace directionnelle, pas comme une seconde émission de dégâts. Le réglage « mouvements réduits » du jeu diminue les effets et supprime les traînées projetées.

## Réutiliser dans une cinématique

Conserver le bon projet de jeu ouvert dans **Niveaux**, puis passer en **Cinématiques**. Dans la fiche d’un acteur, choisir une animation du catalogue ou une espèce et un slot. Le film référence explicitement l’identifiant du projet de jeu ; il n’embarque pas une copie modifiable du catalogue.

Les déplacements A→B, entrées, sorties, transformations, bulles et effets de texte restent disponibles. La queue des bulles peut suivre le point de tête transformé du sprite. Une animation ponctuelle d’acteur de film tient sa dernière frame en fin de lecture ; le retour automatique vers `idle`/`move` est la politique du combat, pas une attaque de combat déclenchée par la cinématique.

En film, seuls les marqueurs son/VFX sont interprétés. `release` n’a **aucun effet de gameplay**. Pour ouvrir un film séparément, ouvrir aussi le projet dont l’identifiant correspond à `presentationCatalog.projectId` et sélectionner sa bibliothèque. Le lien indique la dépendance ; il ne charge pas arbitrairement un autre projet de jeu à l’insu de l’utilisateur.

Publier de préférence depuis **Publier la campagne**. La publication transforme le lien du catalogue en `content/design/game_content.json`. Le CLI `tools/cinematics.mjs` exige qu’un catalogue V1.10 correspondant soit déjà publié dans le jeu ; il ne crée pas de second catalogue autonome.

## Atelier fourni

Ouvrir `examples/Atelier_Presentation_V1_10/atelier.game.json`, choisir `examples/Atelier_Presentation_V1_10` comme dossier des cinématiques liées, et conserver `game/LunariaArtLibrary` comme bibliothèque.

Le film `animations.cinematic.json` et le niveau montrent Radis/Ronce partageant `ab_radish` avec deux gestes différents, le mouvement d’un ennemi, les images d’atlas originales, une respiration procédurale, des marqueurs son/VFX, une référence directe réutilisée dans un film et les valeurs par défaut.

La portée/dégâts de Ronce et les PV/vitesse du Jeteur sont ajustés **uniquement dans cet atelier**. Placer Radis et Ronce dans la voie centrale ; laisser un ennemi approcher pour observer son attaque et ses réactions. Les autres slots peuvent être prévisualisés dans sa fiche. Publier l’atelier sur une nouvelle extraction du jeu : il remplace le parcours actif par le scénario de démonstration.

## Sauvegardes et limites de validation

Le document de jeu est au schéma 4. Une cinématique animée utilise le schéma 4 ; les cinématiques statiques antérieures restent lisibles. La sauvegarde joueur courante est v16, isolée par l’empreinte du contenu. **Aucune migration d’ancienne sauvegarde joueur n’est développée.** Importer un ancien document d’auteur dans le Studio et lui ajouter les nouvelles données n’est pas une migration de sauvegarde joueur.

Les actions de préparation sont sérialisées avec leurs identifiants d’activation et temps restants ; la lecture native de ce mécanisme doit encore être éprouvée avec le moteur. Les tests livrés ne remplacent pas une vérification visuelle des atlas, ancrages, transitions, volumes et effets sur les appareils cibles.
