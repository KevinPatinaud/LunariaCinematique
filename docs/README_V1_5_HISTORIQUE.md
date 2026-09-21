# Lunaria Cinematic Studio · V1.5

Éditeur local de cinématiques **par plans**, en **React + TypeScript + Node.js + Electron**. Le canvas est rendu en SVG par React. Les images, bulles et sons restent dans ta bibliothèque commune ; `cinematic.json` ne contient que leurs références `library://`.

**Archive complète des sources, pas un exécutable Windows précompilé.** Les dossiers de l’éditeur, du lecteur Godot, des exemples et des tests sont inclus. Aucun Rust, serveur métier ou compte cloud.

## Nouveautés V1.5 — animations pour les éléments et pour le texte

**Personnages, ennemis et objets** : nouvelles apparitions (haut, rebond, zoom), acquiescement, recul/impact, battement et virevolte, plus des sorties configurables (fondu, quatre directions, rétrécissement). Les effets existants et les trajets A → B restent disponibles.

**Bulles et narrations** : écriture progressive, mot par mot, fondu du texte, cri avec jaillissement des lettres, vague, tremblement et bonds. Réglages simples dans l’inspecteur et bouton **Tester ce texte**. Premier clic : terminer l’apparition ; second : avancer. Le temps de lecture automatique commence après la révélation.

**Nouveau format v3 pour ces fonctions.** Les anciens documents v1/v2 restent lisibles sans réécriture obligatoire. Un fichier utilisant les nouveaux champs passe à `schemaVersion: 3`. Remplacer **tout l’addon Godot**, dont le nouveau `CinematicText.gd`, avant de lire ces fichiers dans le jeu. Aucune image n’est copiée et aucune dépendance npm n’est ajoutée.

[Guide V1.5](docs/GUIDE_V1_5.md) · [Tests et limites de validation](docs/TEST_REPORT_V1_5.md) · Exemple : `examples/animations_texte.cinematic.json`.

![Animation du texte dans l’application exécutée](docs/animations-v1-5.png)

## Fonctions V1.4.3 conservées — Projets récents

Le bouton **Projets récents** et **Ctrl+Maj+O** donnent accès à 20 fichiers récents et jusqu’à 10 projets épinglés, conservés dans le profil local de l’application. Recherche, ouverture en un clic, accès au dossier et reconnexion d’un fichier déplacé sont inclus. Retirer une ligne ne supprime pas le fichier. Les modifications en cours sont protégées avant changement de projet. Ne pas effacer ce profil en mettant à jour l’application.

L’historique ne peut pas reconstituer les ouvertures faites dans les versions antérieures à V1.4.3 : ouvrir ou enregistrer un ancien projet une fois l’ajoute à la liste. [Guide Projets récents](docs/PROJETS_RECENTS_V1_4_3.md).

## Fonction V1.4.2 conservée — Ennemis

**Ennemis** est une catégorie distincte, alimentée par `03_enemies` et ses sous-dossiers, sans déplacer ni copier les images. Un bouton **Ennemi** est disponible au-dessus de la scène. Déplacement, effets, bulles, duplication et lecture depuis le plan sélectionné restent utilisables.

L’inspecteur permet de convertir un élément en ennemi ; la grande bibliothèque propose **Ajouter comme ennemi** pour une image rangée ailleurs. Le JSON conserve les éléments dans `actors`, avec `role: "enemy"`. Les anciens documents v1/v2 restent acceptés. **Mettre à jour tout l’addon Godot, notamment son schéma JSON, pour lire les nouveaux rôles** : le schéma v2 de V1.4.1 les refusait.

[Guide Ennemis V1.4.2](docs/ENNEMIS_V1_4_2.md) · [Validation V1.4.2](docs/TEST_REPORT_V1_4_2.md).

## Fonctions V1.4.1 conservées — lecture depuis le plan courant

Deux boutons bien visibles en haut à droite : **Lire depuis ce plan** (avec le numéro sélectionné) et **Tout lire**. Le premier démarre au début de la vignette choisie puis enchaîne les suivantes. **Maj+Espace** lance aussi cet aperçu hors saisie ; **Échap** revient à la sélection. **Rejouer** garde la même origine.

Le correctif historique V1.4.1 ne changeait pas le format JSON ni le lecteur. **La V1.4.2 nécessite en revanche le schéma Godot actualisé pour accepter le rôle `enemy`**, comme indiqué plus haut. Les commandes de lecture restent inchangées.

Consulter le [guide du correctif](docs/LECTURE_V1_4_1.md) et le [rapport V1.4.1](docs/TEST_REPORT_V1_4_1.md). Les résultats des anciennes versions ci-dessous restent des rapports historiques, pas une nouvelle validation de toutes leurs fonctionnalités.

## Fonctions V1.4 conservées

| Zone | Ajout |
|---|---|
| Bibliothèque | Catégorie **Objets** et ajout explicite d’une image comme accessoire. |
| Placement | Angle initial, opacité, point d’appui et poignées adaptées à la rotation. |
| Trajet | **A → B** réglé dans la scène, durée, délai, progression douce/linéaire, aller simple ou aller-retour. |
| Effets | Flottement, balancement, respiration, rotation, tremblement, petit bond ; combinables avec un trajet. |
| Aperçu local | Pause, reprise et curseur de temps pour le plan, sans audio ni changement du document. |
| Continuité | Les bulles suivent le personnage animé ; Continuer reprend l’arrivée d’un trajet simple. |
| Godot | Calculs de mouvement et validation v1/v2 ; module `CinematicMotion.gd` fourni. |

Les fonctions V1.3 restent présentes : calques, sélection multiple, favoris/récents, alignements, modèles de plans, versions locales et diagnostics.

**Compatibilité historique V1.4 :** les rôles et mouvements de cette version utilisaient v2. Les animations ajoutées en V1.5 nécessitent v3, comme indiqué plus haut. Les références restent `library://`, sans copie des images.

Pour cette archive complète : extraire la V1.5 dans un nouveau dossier, conserver la version précédente, puis lancer `npm install`, `npm test`, `npm run dev`. Aucune dépendance supplémentaire n’est nécessaire par rapport à V1.4.3.

Consulter le [guide Objets et mouvements](docs/GUIDE_V1_4.md) et le [rapport de validation V1.4](docs/TEST_REPORT_V1_4.md).

![Interface V1.4 — cadre UI réutilisé comme panneau de démonstration](docs/apercu-v1-4.png)

## Démarrage sous Windows

Prérequis du projet : **Node.js 22.12 minimum**, npm, une connexion Internet pour la première installation des dépendances. Pas de Rust, Python, Java, base de données, serveur métier ou compte cloud.

Décompresser cette archive dans un dossier local, par exemple `C:\dev\lunaria-cinematic-studio`, puis ouvrir un terminal dans ce dossier :

```powershell
npm install
npm run dev
```

Le script compile le processus Node/preload, démarre Vite sur `127.0.0.1:5173`, puis ouvre Electron. Le port doit être libre. Les modifications React sont reprises par Vite ; après une modification de `src/main` ou `src/preload`, relancer `npm run dev`.

Le fichier `DEMARRER_WINDOWS.cmd` effectue ces mêmes opérations. Il n'installe pas Node ni de dépendances globales. Il demande confirmation avant la première installation npm.

Il n'y a volontairement pas de faux `package-lock.json` : l'installation réseau n'était pas disponible ici. Le premier `npm install` crée le verrouillage ; le conserver ensuite dans Git et utiliser `npm ci` pour les installations reproductibles.

## Première cinématique

À l'accueil, **Essayer l'exemple** ouvre trois plans avec trois de tes décors et tes deux cadres de dialogue. Ce scénario de démonstration n'est pas une validation du récit canonique. Aucun dessin de Rose ou Radis n'a été inventé ou substitué à tes personnages.

Pour travailler avec ta bibliothèque complète :

1. Cliquer sur **Choisir ma bibliothèque** et sélectionner la racine commune.
2. Choisir un continent, puis un lieu. Double-cliquer sur un décor ou le glisser dans la scène.
3. Ajouter tes personnages depuis **Personnages** ou tes ennemis depuis **Ennemis** ; les déplacer et les redimensionner dans l’aperçu.
4. Sélectionner un personnage ou un ennemi et cliquer sur **Bulle**. Écrire sa réplique, choisir un cadre et déplacer la bulle. La queue le suit ; déplacer son extrémité la passe en mode manuel.
5. Ajouter des plans, régler caméra et durée, puis cliquer sur **Lire depuis ce plan** ou **Tout lire**. Enregistrer le fichier JSON avec **Enregistrer**.

## Une seule bibliothèque

Les 227 images précédemment triées ne sont **pas réembarquées** dans cette archive. L'exemple constitue seulement une petite bibliothèque indépendante pour essayer l'éditeur.

Ta bibliothèque actuelle peut conserver cette organisation ; aucun déplacement n’est requis :

```text
Lunaria/
├── LunariaArtLibrary/                ← sélectionner CE dossier dans l’éditeur
│   ├── 02_characters/
│   ├── 03_enemies/
│   │   └── Canette/Stage 01/...
│   ├── 05_environments/
│   │   ├── 01_europe/
│   │   ├── 02_africa/
│   │   ├── 03_asia/
│   │   └── 04_oceania/
│   ├── 07_props/
│   └── 08_ui/
└── cinematics/
    └── CIN_PROLOGUE.cinematic.json
```

Les autres dossiers de ta bibliothèque restent en place. Les anciennes structures, notamment `05_characters`, `06_ui` et les continents directement à la racine, restent reconnues. `example-library/` conserve ses chemins historiques ; ils ne sont pas un modèle à recopier sur ta bibliothèque.

Tu peux conserver le nom `Lunaria_graphic_library_sorted_complete` comme racine : ce nom physique n'est pas enregistré dans les références. Les sous-dossiers existants sont conservés. Le Stage 01 reste l'unique référence graphique d'un personnage ; aucun dossier `reference` supplémentaire n'est nécessaire.

**Important : sélectionner la même racine logique dans l'éditeur et dans Godot.** `library://01_europe/.../image.png` devient par exemple `res://graphic_library/01_europe/.../image.png`. Changer la racine ne casse pas les fichiers ; renommer un fichier ou un sous-dossier à l'intérieur peut les casser. Les références manquantes sont signalées.

Le dossier `example-library/06_ui/dialogues` contient les deux PNG originaux fournis. Les ajouter une seule fois à ta vraie bibliothèque UI s'ils n'y sont pas déjà. La V1 reconnaît leurs noms exacts.

## Fonctions présentes

| Domaine | Dans cette version |
|---|---|
| Bibliothèque | Colonne redimensionnable, navigation par dossiers et fil d’Ariane, recherche, grille ou liste, trois tailles, défilement continu, vue agrandie et aperçu ; reconnexion, actualisation et surveillance locale Electron |
| Plans | Modèles, continuité, duplication configurable, sélection, suppression et réorganisation par glisser-déposer |
| Composition | Décor et PNG, sélection multiple, calques, déplacement groupé, alignement, aimants, poignées proportionnelles et miroir |
| Bulles BD | Deux cadres fournis, variantes Parchemin/BD, dialogue/narration, texte, hauteur automatique, queue libre ou attachée |
| Mise en scène | Caméra, entrées, fondu depuis le noir ; trajets A → B, dix effets au choix, sorties configurables, pivots et rotation statique |
| Lecture | Aperçu entier ou depuis le plan courant, pause, répliques séquentielles, clic/Espace ou durée automatique |
| Audio | Un fichier audio par plan, volume et boucle |
| Fichiers | Ouvrir/enregistrer JSON, validation, sauvegarde temporaire puis remplacement, copie précédente `.bak` |
| Confort | Historique de commandes, raccourcis, récupération automatique, versions locales, diagnostics et repères de composition |
| Godot | Lecteur GDScript, validateur du même schéma et scène d'intégration fournis en sources |

Les bulles sont toutes visibles pour les disposer en mode édition ; **une seule réplique apparaît à la fois pendant la lecture**. Une durée de plan est un minimum : la lecture attend ses répliques. Les entrées déplacent le PNG ; elles ne produisent pas une animation de marche articulée.

## Raccourcis

| Action | Raccourci |
|---|---|
| Enregistrer / enregistrer sous | `Ctrl+S` / `Ctrl+Maj+S` |
| Annuler / rétablir | `Ctrl+Z` / `Ctrl+Y` ou `Ctrl+Maj+Z` |
| Dupliquer la sélection | `Ctrl+D` |
| Supprimer la sélection | `Suppr` |
| Sélectionner tous les objets éditables | `Ctrl+A` |
| Sélection multiple | `Maj+clic` ou `Ctrl+clic` |
| Déplacer la sélection | Flèches / `Maj+flèches` |
| Glisser sans aimants | `Alt` pendant le geste |
| Lire / réplique suivante | `Espace` |
| Quitter l'aperçu / fermer la bibliothèque agrandie | `Échap` |
| Utiliser une ressource sélectionnée au clavier | `Entrée` |
| Redimensionner la bibliothèque après sélection du séparateur | `←` / `→`, `Début` / `Fin` |

Dans un champ de texte, les raccourcis d'édition habituels restent ceux du champ.

## Validation de cette livraison

**540 tests Node réussis, dont 102 nouveaux, et 40 contrôles d’interface réussis**. Les interfaces ont été exécutées dans Chromium avec React 18.2 local et un pont Electron simulé ; les tests du cœur et des fichiers sont compilés et exécutés dans Node 22.16.

Le typecheck complet a été tenté et s’arrête faute de `vite/client` installé. L’installation réseau n’étant pas disponible ici, ni le build avec les dépendances déclarées, ni Electron Windows, ni le lecteur Godot n’ont été exécutés. Les trois nouveaux scénarios Electron natifs et les contrats de calcul Godot sont fournis, pas présentés comme réussis. Le [rapport V1.5](docs/TEST_REPORT_V1_5.md) détaille chaque limite.

## Construire l'application

```powershell
npm run typecheck
npm test
npm run build
npm start
```

Pour générer les livrables Windows **depuis Windows** :

```powershell
npm run dist:win
```

Les sorties sont attendues dans `release/` : installateur NSIS et application portable. Aucune signature de code ni configuration de certificat n'est incluse. Ce packaging n'a pas été exécuté ici. Une CI Windows est fournie, mais n'a pas été déclenchée.

`npm run dev:web` ouvre une variante navigateur pour travailler sur l'interface. Le choix de dossier et les sauvegardes passent alors par le navigateur ; il n'y a pas de surveillance automatique du disque dans ce mode. **Electron est la version de référence** pour les fichiers locaux.

## Limites explicites de cette version

Pas de timeline multipiste, de courbes manuelles, de spritesheets animées, de particules, de déplacement articulé, de branches narratives, de montage de plusieurs sons, de musique continue entre plans ou d'export MP4. Le fondu est une apparition depuis le noir, pas un fondu croisé entre décors.

L'aperçu et Godot partagent le format, les coordonnées, les retours à la ligne exportés et les calculs de mouvement. **La typographie n'est pas garantie pixel pour pixel** entre les moteurs : l'éditeur utilise Georgia/serif système et Godot une police à configurer. Aucune police n'est distribuée. Les performances et la lisibilité Android restent à tester dans le jeu.

Les cadres sont adaptés à l'affichage par régions extensibles du PNG, sans réécrire les images originales ; leur queue dynamique est vectorielle. Les raccords décoratifs peuvent demander un ajustement artistique dans une version ultérieure.

## Documentation et architecture

- [Guide V1.5 — Animations et texte](docs/GUIDE_V1_5.md)
- [Validation V1.5](docs/TEST_REPORT_V1_5.md)

- [Guide V1.4.2 — Ennemis](docs/ENNEMIS_V1_4_2.md)
- [Validation V1.4.2](docs/TEST_REPORT_V1_4_2.md)
- [Guide V1.4 — Objets et mouvements](docs/GUIDE_V1_4.md)
- [Validation V1.4](docs/TEST_REPORT_V1_4.md)

- [Guide V1.3](docs/GUIDE_V1_3.md)
- [Changements V1.3](docs/CHANGELOG_V1_3.md)
- [Validation V1.3](docs/TEST_REPORT_V1_3.md)
- [Audit et corrections V1.2](docs/AUDIT_V1_2.md)
- [Validation V1.2](docs/TEST_REPORT_V1_2.md)
- [Installation du correctif V1.2](docs/MISE_A_JOUR_V1_2.md)
- [Contrat du format cinematic.json](docs/FORMAT.md)
- [Intégration Godot](docs/INTEGRATION_GODOT.md)
- [Architecture technique](docs/ARCHITECTURE.md)
- [Bibliothèque V1.1 : utilisation et mise à jour](docs/BIBLIOTHEQUE_V1_1.md)
- [Tests V1.1 et limites de validation](docs/TEST_REPORT_V1_1.md)
- [Rapport initial V1](docs/TEST_REPORT.md)
- [Documentation officielle consultée](docs/SOURCES.md)

Le canevas de cette V1 est rendu en **SVG piloté par React**, plutôt qu'en Konva : mêmes manipulations directes, moins de dépendances. Le modèle et l'historique sont en TypeScript ; le backend local reste intégralement en Node.js. Pas de Zustand ni Zod nécessaires à cette implémentation : validation partagée et JSON Schema explicite.

Les images de démonstration viennent des fichiers Lunaria fournis par l'utilisateur. Les droits sur ces images restent ceux de leurs ayants droit ; cette livraison ne confère aucun droit supplémentaire sur des créations tierces.
