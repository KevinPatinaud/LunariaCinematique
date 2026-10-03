# Lunaria V1.10 — installation et utilisation

**Guide courant, actualisé le 2 octobre 2026.** Un seul fichier `lunaria.game.json` enregistre les niveaux, le parcours et les cinématiques complètes. Un nouveau document démarre sans mission ; le projet Lunaria existant possède sa propre campagne. Les anciennes 40 missions d’exemple restent dans certaines fixtures, sans constituer le contenu actif. Les images restent dans la bibliothèque source.

## Prise en main du Studio courant

Dans **Niveaux → Récompenses**, régler le bonus de combo (activation, graines supplémentaires par palier, plafond) et les graines de fin de vague du niveau choisi. Le bonus de graines du combo est **désactivé par défaut**, y compris à l’ouverture d’un projet sans ce réglage. S’il est activé, il commence à la troisième élimination ; chaque élimination doit suivre la précédente en moins de quatre secondes. Les montants de fin de vague existants sont conservés ; 0 supprime la prime de la vague choisie. Ces mêmes montants restent accessibles dans **Vagues & ennemis**. Enregistrer puis publier, ou lancer un test depuis le Studio, pour les utiliser dans le jeu.

1. Ouvrir **Vue du projet**, dans la barre du haut. Cette vue indique le nombre de niveaux, de cinématiques et d’étapes du parcours, ainsi que l’état de l’enregistrement.
2. Utiliser **Connecter** pour relier la bibliothèque, puis **Créer un niveau** ou **Créer une cinématique**. La campagne vide propose aussi **Créer un premier niveau**.
3. Dans **Plantes alliées** ou **Ennemis**, chercher un personnage par nom ou rôle. Les accents sont facultatifs : `aloes` retrouve `Aloès`. **Effacer la recherche** permet de revenir au catalogue après une recherche sans résultat.
4. Utiliser **Enregistrer le projet** ou **Ctrl+S**. La copie locale de récupération est distincte du fichier enregistré. Le bouton **Enregistrer** et Ctrl+S fonctionnent aussi depuis la vue du projet.
5. Organiser l’ordre de jeu dans **Campagne**. Un niveau créé est ajouté au parcours ; une copie de niveau doit y être ajoutée explicitement.
6. Ouvrir **Animations et sons** pour les catalogues communs et les profils avancés. Les animations propres à un personnage restent accessibles dans sa fiche.
7. Dans **Niveaux → Publier et exporter**, choisir **Publier la campagne**, **Exporter pour PC** ou **Exporter pour Android**. Ces actions enregistrent le projet puis mettent à jour le contenu du jeu sélectionné ; l’export construit ensuite son application. Les erreurs bloquantes proposent d’ouvrir **Vérifier le projet**. Les avertissements restent consultables sans empêcher la publication.

Dans **Ennemis**, sélectionner une espèce puis cliquer sur **Archiver l’ennemi** pour la retirer du catalogue actif et des nouveaux choix. **Archives** permet de la retrouver et de cliquer sur **Restaurer l’ennemi**. L’archivage conserve toutes ses caractéristiques, animations et références existantes ; un niveau qui l’utilise continue à fonctionner. Enregistrer le projet après ce changement.

Dans **Niveaux → Paramètres → Type de niveau / objectif**, choisir **Conquérir les allées** pour activer le déplacement des plantes alliées. Le joueur peut les placer dans les deux premières colonnes des cinq allées. Elles avancent pendant les vagues ; au contact face à face, plante et ennemi cessent d’avancer mais leurs attaques restent actives. Une plante arrivée au bord droit ferme son allée aux nouvelles apparitions et verse une seule fois le bonus **Graines par allée capturée**, réglable dans les paramètres du niveau ou dans **Récompenses** (0 par défaut). Le décor se restaure de 20 % à chaque allée capturée, indépendamment des vagues, jusqu’à 100 % pour cinq allées. La victoire demande les cinq allées conquises, indépendamment du nombre de vagues déjà terminées. Le bord gauche reste une défaite immédiate. Les vagues, espèces et arrivées se configurent dans **Vagues & ennemis** comme dans les autres niveaux ; les anciennes missions restent en défense tant que cet objectif n’est pas choisi.

Dans **Conquérir les allées**, **Aléatoire équilibré** répartit chaque série de cinq arrivées entre les cinq allées dans un ordre mélangé. Le nombre saisi correspond au maximum avec les cinq allées ouvertes. Une capture annule les arrivées encore prévues sur cette allée, sans les transférer ni rapprocher les autres arrivées. Les vagues suivantes et les renforts aléatoires appliquent la même réduction : il reste environ 80 %, 60 %, 40 %, puis 20 % des ennemis avec une, deux, trois, puis quatre allées conquises. Pour des groupes multiples de cinq, la proportion est exacte ; un petit groupe peut varier d’un ennemi par allée. Les groupes affectés à une allée précise gardent leur quantité sur cette allée tant qu’elle est ouverte. L’aperçu montre le planning maximal avec toutes les allées ouvertes ; les captures se produisent seulement pendant la partie.

Choisir **Escorter les jeunes pousses** dans **Niveaux → Paramètres → Type de niveau / objectif** pour une variante de la conquête. Dans **Jeunes pousses à escorter**, régler le nombre par allée (0 à 20 ; au moins une pousse au total), leurs points de vie, leur vitesse, l’intervalle entre deux départs sur la même allée et leur image. Par défaut : une pousse sur l’allée 3, 120 PV, 0,12 case/s et 8 secondes entre deux départs sur une même allée. Chaque pousse part complètement à gauche ; elle avance seulement pendant les vagues et s’arrête au contact d’un ennemi. Pousses et alliés peuvent se dépasser dans les deux sens. Les alliés gardent les placements, contacts, captures, arrivées aléatoires et récompenses de la conquête. Une capture ne supprime pas les pousses : elles finissent leur trajet même sur une allée conquise. La victoire exige les cinq allées conquises **et toutes les pousses arrivées vivantes à droite**. Une pousse détruite ou un pollueur au refuge entraîne la défaite. La pluie soigne aussi les pousses encore en route. Les arrivées ennemies ne sont pas annoncées en jeu ; l’aperçu du planning reste un outil d’auteur dans le Studio. Les positions, PV, départs différés et arrivées des pousses sont sauvegardés avec la bataille.

Chaque **Plaque**, quel que soit le type de niveau, fait arriver une **Canette pressée** dans sa propre allée toutes les **30 secondes de combat**. La première arrive après 30 secondes de présence ; chaque Plaque possède son compteur, conservé dans la sauvegarde. La génération fonctionne même sans plante à attaquer et s’arrête à la destruction de la Plaque. Les canettes entrent par le bord droit, avancent et rapportent leurs graines habituelles au recyclage. Il faut aussi les éliminer pour terminer la vague. L’aperçu des arrivées montre les groupes programmés ; le texte de la Plaque signale ses renforts continus.

Choisir **Foyers invasifs** pour placer deux ou trois foyers sur la grille des paramètres. Sélectionner un foyer, puis cliquer sur sa case (colonnes 3 à 8). Les réglages par défaut, **Canette pressée / 30 secondes**, utilisent la génération normale de la Plaque sans la doubler. Un autre ennemi ou intervalle (5 à 60 secondes) ajoute les renforts du niveau. Les foyers utilisent la Plaque du catalogue global et occupent leurs cases dès la préparation ; ne pas ajouter de Plaques dans les vagues de ce niveau. Ils envoient chacun des renforts dans leur allée pendant les vagues, y compris après la dernière vague tant qu’ils survivent. La préparation et les pauses ne consomment pas le délai de génération. La victoire demande la destruction de tous les foyers puis des ennemis encore présents. Le bord gauche reste une défaite immédiate. Les vagues ordinaires se règlent toujours dans **Vagues & ennemis**.

Dans **Cinématiques**, **Nouvelle cinématique** crée un film dans le projet et sélectionne son titre pour le renommer aussitôt. **Toutes les cinématiques** affiche les films du projet, leur nombre de plans et leur durée ; la recherche accepte le titre ou l’identifiant, avec ou sans accents. La même liste est accessible depuis **Vue du projet**. Les films restent enregistrés avec les niveaux dans le fichier unique du projet.

Dans **Toutes les cinématiques**, **Dupliquer** crée une nouvelle cinématique indépendante dans le projet, avec tous ses plans, personnages, dialogues et réglages. Renommer la copie si besoin, puis utiliser **Enregistrer le projet** pour la conserver. Pour une sauvegarde dans un fichier distinct, choisir **Créer une copie du projet…** dans la même fenêtre : le nouveau fichier contient aussi les niveaux et devient le projet ouvert. Les images de la bibliothèque restent référencées ; elles ne sont pas recopiées.

La même fenêtre permet de **renommer**, **monter ou descendre** et **supprimer** un film. La liste peut être filtrée par catégorie ; pour en créer une, choisir **+ Nouvelle catégorie…** sur un film, puis classer les autres avec **Classer dans**. Les catégories servent uniquement à retrouver les films dans Studio. Le déplacement dans cette liste ne change pas le parcours du joueur, qui se règle dans **Campagne**. Si un film est utilisé dans le parcours, un événement ou un comportement, retirez ces liens avant de le supprimer. Enregistrez ensuite le projet pour conserver les changements.

**Exporter en JPG** demande un dossier puis crée un sous-dossier au titre de la cinématique. Il contient une image 1600 × 900 par plan, dans l’ordre du storyboard, nommée `01 - Titre de la cinématique.jpg`, `02 - Titre de la cinématique.jpg`, etc. L’image montre la composition fixe et toutes les bulles du plan, sans les poignées et repères de l’éditeur. Les animations et l’audio ne figurent pas dans ces images. Les caractères interdits dans un nom de fichier sont retirés du titre ; un nouvel export crée un autre sous-dossier pour conserver les JPG précédents.

La fenêtre **Vérifier le projet** se ferme avec **Échap**. Cliquer une erreur de nom de niveau ouvre ce niveau et place le curseur dans son champ de nom. Les recherches et filtres de niveaux sont effacés lors d’une création ou d’une duplication, pour que le nouveau niveau reste visible.

## Sources maintenues

Deux projets sources complets : Studio React/TypeScript/Node/Electron et jeu Godot/GDScript. La présentation de combat est désormais définie dans le document de jeu et interprétée par un lecteur générique. Les deux modes principaux restent **Cinématiques** et **Niveaux**.

Les [preuves courantes et leurs limites](VALIDATION.md) sont distinctes du [rapport historique V1.10](TEST_REPORT_V1_10.md). Le numéro du Studio est 1.10.0 ; les versions du jeu et des schémas évoluent indépendamment.

## Installation du Studio

Utiliser le dépôt `C:/dev/Lunaria cinematic studio` et Node >= 22.12.0. Dans son dossier contenant `package.json` et `package-lock.json` :

```powershell
npm ci
npm test
npm run typecheck
npm run build
npm start
```

Pour développer, utiliser `npm run dev` après l’installation des dépendances. `npm run dev:web` est un mode navigateur : ce n’est pas une validation de l’application Electron ni de ses permissions de fichiers.

Le lockfile fixe les dépendances. `npm run build` inclut le typecheck et construit l’application Electron ; son succès et les tests sont consignés dans [VALIDATION.md](VALIDATION.md). Le mode navigateur ne vérifie pas les fonctions natives de publication et d’accès aux fichiers.

En cas d’échec de `npm ci`, ne pas considérer un démarrage partiel dans le navigateur comme un build réussi. En cas d’échec des tests ou du typecheck, conserver le journal avant toute publication.

## Ouvrir le jeu

Ouvrir `C:/dev/Lunaria/game/project.godot` avec Godot **4.7.2**, laisser l’import se terminer puis lancer le projet. Le lecteur de présentation et les ressources publiées y sont intégrés.

Depuis la racine `C:/dev/Lunaria` :

```powershell
node tools/test.mjs --suite node
node tools/test.mjs --suite all --godot "C:/Program Files/Godot/Godot_v4.7.2-stable_win64_console.exe"
```

Adapter uniquement le chemin de l’exécutable Godot. La première commande ne lance **aucun moteur**. La seconde lance les contrôles Node, l’import et les suites Godot, dont `presentation_runtime_smoke`. Elle doit être exécutée avant de déclarer ce runtime validé.

La publication remplace la campagne jouable par le parcours enregistré dans le projet. Pour travailler sur la campagne existante, ouvrir `C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json`, pas le JSON compilé du runtime.

## Relier la bibliothèque commune

Dans le Studio, choisir la bibliothèque source **`C:/dev/Lunaria/LunariaArtLibrary`**. Les références partent de sa racine, pas de `assets` ni d’un sous-dossier `combat`. La publication alimente son miroir `C:/dev/Lunaria/game/LunariaArtLibrary`, destiné au jeu. Ce miroir peut servir en lecture pour une démonstration isolée ; créer ou modifier les médias dans la bibliothèque source.

`example-library` est conservée pour les anciens exemples autonomes du Studio et ses tests desktop. Elle ne contient pas le nouveau catalogue graphique de combat. La bibliothèque source conserve les ressources communes ; la publication ne recopie pas un média par espèce ou par animation.

Les sons déplacés depuis les anciens dossiers restent également utilisés par les effets d’interface et musiques historiques. `docs/ART_TRANSFER_V1_10.json` fournit la correspondance des déplacements.

## Choisir et régler une attaque

Dans **Niveaux**, les anciens catalogues séparés sont réunis dans un seul onglet **Attaque**. Chaque fiche y regroupe le type d’attaque, les cibles, la cadence, les résultats appliqués et, lorsqu’elle existe, la trajectoire du tir. Les fiches **Plantes alliées** et **Ennemis** permettent de choisir directement une attaque principale et d’ajouter des attaques supplémentaires ; chaque option affiche aussi son type en langage clair.

Le bouton **Modifier cette attaque** ouvre sa fiche globale. Une modification s’applique donc à toutes les espèces qui utilisent cette attaque. Pour obtenir une variante indépendante, dupliquer l’attaque avant de l’attribuer à l’espèce concernée.

Le catalogue de départ contient **38 capacités** au relevé du 1 octobre 2026 ; ce nombre peut évoluer avec les données d’auteur. Les attaques strictement identiques utilisent six modèles partagés : Tir simple, Régénération personnelle, Protection alliée, Tir enracinant, Tir traversant et Onde offensive. Les variantes dont la portée, la zone ou les résultats diffèrent restent séparées.

## Modifier l’attaque de Radis

1. Ouvrir `C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json`, ou une copie de ce projet, puis passer en **Niveaux**.
2. Ouvrir la fiche de **Radis**, puis **Animations de combat**. Le slot `attack` résout `radish_throw` dans le profil de Radis.
3. Utiliser **Éditer** pour modifier l’animation partagée, ou **Dupliquer et personnaliser** pour isoler le réglage. Le Studio indique les références affectées par une modification.
4. Dans l’éditeur, lire l’animation, régler les durées, réordonner les frames, modifier les rectangles d’atlas, les ancrages et le marqueur `release`. La séquence originale de quatre poses est conservée. Une grille crée des régions de découpe, jamais de nouveaux PNG.
5. Enregistrer le projet. Utiliser **Publier la campagne** vers le dossier du jeu fourni. Les erreurs de référence ou de découpe bloquent l’écriture avant la mise à jour du contenu actif.
6. Relancer le jeu : le catalogue est chargé au démarrage, pas rechargé à chaud au milieu d’un combat. Vérifier visuellement l’attaque et le départ du projectile.

Les aperçus disposent de lecture/pause, reprise, curseur, déplacement frame par frame, retour au début, ancrages, miroir et réduction des mouvements. Les marqueurs son/VFX sont réservés à la lecture ; déplacer manuellement le curseur ne lance aucune attaque. Le bouton « Repos » rembobine la définition à t=0 ; il ne change pas l’animation sélectionnée pour une autre définition `idle`.

## Attaques, profils, audio et VFX

La navigation repliable **Animations et sons** regroupe les animations communes, les profils d’animation, l’audio et les VFX. Les attaques disposent d’une section Présentation : slot sémantique, mode/délai de libération et indices de présentation de lancement/impact. Ne pas mettre un identifiant comme `radish_throw` dans une attaque partagée : choisir `attack`.

Un slot absent hérite du profil global. Un slot de base doit toujours être résolu. Une liaison optionnelle vide, telle que `victory`, désactive ce slot. Une plante ne se déplace pas parce qu’elle possède une animation `move`.

Les sons proposent fichier, catégorie, volume, boucle, variation de hauteur et limite simultanée. Un champ sonore vide hérite ; si toute la chaîne est vide, aucun son n’est joué. Pour rendre un événement explicitement silencieux malgré un son global, utiliser un son référencé de volume zéro, ou retirer le son de la chaîne globale.

Les VFX sont visuels : ils ne modifient ni les PV ni les vitesses. Les préréglages sont volontairement simples, rendus par des primitives ou une image ; ce n’est pas un éditeur de particules/shaders. Une traînée de projectile utilise les paramètres de la définition comme une trace directionnelle, pas comme une seconde émission de dégâts. Le réglage « mouvements réduits » du jeu diminue les effets et supprime les traînées projetées.

## Animer un élément dans une cinématique

Dans **Cinématiques**, sélectionner un personnage, un ennemi ou un objet. Dans l’inspecteur à droite, **Mouvements → Effet d’animation** propose notamment les nouveaux effets **Orbite**, **Vol en huit**, **Zigzag**, **Roulade**, **Sursaut** et **Oscillation élastique**. Ils transforment l’image entière : trajectoire autour de sa position, déplacement en huit ou en zigzag, rotation, réaction de surprise ou oscillation de taille. Ils peuvent se combiner avec **Déplacement A → B**.

Régler l’intensité, la durée du cycle et le délai, puis choisir une lecture ponctuelle ou en boucle et inverser le sens si nécessaire. Le délai du mouvement commence après l’entrée. Une sortie peut interrompre l’effet à l’heure choisie dans le plan.

Dans **Apparition → Entrée**, choisir aussi **Chute rebondie**, **Tourbillon** ou **Éclosion**. Dans **Disparition → Sortie**, choisir **Tourbillon**, **Envol en fondu** ou **Chute en fondu**. Les durées et délais restent réglables comme pour les autres entrées et sorties ; **Déjà présent** et **Reste dans la scène** conservent leur rôle.

Utiliser **Tester les animations de l’élément** pour voir la combinaison, puis **Lire depuis ce plan** pour la vérifier avec le film. Enregistrer le projet pour conserver les réglages. Ces effets fonctionnent sur une image fixe et n’exigent pas de créer une planche d’animation ; une animation du catalogue reste utilisable en complément.

## Réutiliser dans une cinématique

Conserver le bon projet de jeu ouvert dans **Niveaux**, puis passer en **Cinématiques**. Dans la fiche d’un acteur, choisir une animation du catalogue ou une espèce et un slot. Le film référence explicitement l’identifiant du projet de jeu ; il n’embarque pas une copie modifiable du catalogue.

Les déplacements A→B, entrées, sorties, transformations, bulles et effets de texte restent disponibles. La queue des bulles peut suivre le point de tête transformé du sprite. Une animation ponctuelle d’acteur de film tient sa dernière frame en fin de lecture ; le retour automatique vers `idle`/`move` est la politique du combat, pas une attaque de combat déclenchée par la cinématique.

En film, seuls les marqueurs son/VFX sont interprétés. `release` n’a **aucun effet de gameplay**. Pour ouvrir un film séparément, ouvrir aussi le projet dont l’identifiant correspond à `presentationCatalog.projectId` et sélectionner sa bibliothèque. Le lien indique la dépendance ; il ne charge pas arbitrairement un autre projet de jeu à l’insu de l’utilisateur.

Publier de préférence depuis **Publier la campagne**. La publication transforme le lien du catalogue en `content/design/game_content.json`. Le CLI `tools/cinematics.mjs` exige qu’un catalogue V1.10 correspondant soit déjà publié dans le jeu ; il ne crée pas de second catalogue autonome.

## Atelier fourni

Ouvrir `examples/Atelier_Presentation_V1_10/atelier.game.json`, suivre le [README de l’atelier](../examples/Atelier_Presentation_V1_10/README.md) pour ses anciens films liés et choisir la bibliothèque source de Lunaria.

Le film `animations.cinematic.json` et le niveau montrent Radis/Rose partageant `ab_basic_shot` avec deux gestes différents, le mouvement d’un ennemi, les images d’atlas originales, une respiration procédurale, des marqueurs son/VFX, une référence directe réutilisée dans un film et les valeurs par défaut.

La portée/dégâts de Rose et les PV/vitesse du Jeteur sont ajustés **uniquement dans cet atelier**. Placer Radis et Rose dans la voie centrale ; laisser un ennemi approcher pour observer son attaque et ses réactions. Les autres slots peuvent être prévisualisés dans sa fiche. Publier l’atelier sur une copie distincte du jeu : il remplace le parcours actif par le scénario de démonstration.

## Sauvegardes et limites de validation

Le document de jeu est au schéma 4. Une cinématique liée au catalogue d’animation utilise le schéma 4 ; les nouveaux effets de mouvement, entrées et sorties exigent au minimum le schéma 3. Le Studio adapte la version à l’enregistrement et conserve la lecture des anciens films. La sauvegarde joueur courante est v26, isolée par l’empreinte du contenu. **Aucune migration d’ancienne sauvegarde joueur n’est développée.** Importer un ancien document d’auteur dans le Studio et lui ajouter les nouvelles données n’est pas une migration de sauvegarde joueur.

Les actions de préparation sont sérialisées avec leurs identifiants d’activation, cibles et temps restants. Les suites Godot exercent les activations et reprises ; leurs résultats datés sont distincts des essais visuels et sur appareil. Vérifier atlas, ancrages, transitions, volumes et effets sur les cibles réelles ; voir [VALIDATION.md](VALIDATION.md).

## Compagnons, terrains et cibles

Dans **Niveaux → Plantes disponibles**, cocher les espèces autorisées par l’histoire. **Toutes** active le catalogue entier pour ce niveau. Toutes les espèces cochées sont disponibles dès le début ; le joueur ne choisit pas une équipe de cinq et peut planter plusieurs exemplaires d’une même espèce. Les coûts et statistiques restent ceux du catalogue global.

Dans **Paramètres → Terrain du niveau**, choisir ou importer l’image de ce niveau. Changer le terrain d’une mission ne change pas les autres. Pour **Protéger une case**, régler séparément case, image, PV, armure et résistances de la cible. Les coordonnées de l’interface commencent à un ; celles du JSON commencent à zéro.

Le ciblage de Plaque sur sa propre allée compare la distance en premier ; à distance égale, il choisit la plante de droite. Un délai d’apparition se configure sur le groupe d’ennemis, indépendamment de la cadence de ses attaques. Noisetier reste défensif et se régénère sans tirer.

Sac Plastique vole vers la première plante à gauche sur sa propre allée, se pose dessus et lui retire lentement des PV. **Ennemis → Sac Plastique → Modifier cette attaque →** propose **Se poser sur la cible** et **Empêcher la cible d’attaquer**. La destruction du sac libère la plante ; la mort de celle-ci fait repartir le sac. Ses huit animations dessinées se modifient depuis **Animations de Sac Plastique**. Il se choisit comme ennemi dans les groupes de vagues.

Une nouvelle image publiée doit conserver un chemin de version distinct si les octets changent : le publieur refuse les conflits avec les fichiers déjà présents. En cas de renommage, corriger les références dans les films et projets d’auteur, puis vérifier et republier. Les schémas et modules partagés se synchronisent séparément de la publication de campagne ; voir [architecture](ARCHITECTURE.md).

**Jouer ce niveau** publie un parcours de test dans le projet Godot sélectionné avant de le lancer. Le profil joueur utilisé pour ce test est séparé, mais le contenu publié de ce dossier Godot est remplacé. Choisir une copie du jeu pour conserver une autre campagne dans le dossier principal ; republier le projet complet pour retrouver son parcours normal.

Les animations propres à un personnage apparaissent dans sa fiche ; le catalogue commun regroupe les animations partagées. Une ancienne animation utilisée par un seul profil d’espèce peut être reconnue comme personnelle. Une liaison modifiée sur un profil partagé crée un profil propre au personnage afin de préserver les autres utilisateurs. Modifier directement une définition d’animation partagée conserve son effet global.
