# Lunaria Cinematic Studio V1.4 — Objets et mouvements

## Installation

Conserver le dossier V1.3, extraire l’application complète V1.4 dans un nouveau dossier, puis ouvrir un terminal au niveau de `package.json` :

```powershell
npm install
npm test
npm run dev
```

Node.js 22.12 minimum. La première installation demande Internet. Aucun paquet supplémentaire n’a été ajouté depuis V1.3. Le badge affiche **V1.4**. L’archive livre les sources et les commandes de construction, pas un EXE précompilé.

Reconnecter la bibliothèque existante sans la recopier. Pour construire l’installateur et le portable depuis Windows : `npm run dist:win`. Le packaging doit encore être vérifié sur cette plateforme.

## Ajouter des objets de décoration

L’onglet **Objets** complète Décors, Personnages, Bulles et Audio. Exemple d’organisation :

```text
graphic_library/
├── 01_europe/...
├── 02_africa/...
├── 03_asia/...
├── 04_oceania/...
├── 05_characters/...
├── 06_ui/dialogues/...
├── 07_props/
│   ├── serre/
│   │   ├── pots/...
│   │   └── outils/...
│   └── port/...
└── 08_audio/...
```

`08_audio` est un exemple de nom, pas une migration obligatoire : un dossier audio existant reste utilisable. La catégorie Objets reconnaît aussi les dossiers `props`, `objets`, `decorations`, `accessoires` et `mobilier`, y compris sous un continent ou un lieu. Le classement des environnements demeure continent → lieu.

Ajouter les images dans la bibliothèque commune, puis actualiser si nécessaire. Double-cliquer sur une ressource pour l’ajouter, ou la glisser à sa position dans la scène. Le bouton **Objet** de la barre de scène ouvre directement cette catégorie. Dans la bibliothèque agrandie, **Ajouter comme objet de décoration** permet de réutiliser une image classée ailleurs sans la déplacer ni la copier.

Un objet possède les mêmes poignées et commandes de calque qu’un personnage : déplacement, taille proportionnelle, miroir horizontal, devant/derrière, verrouillage, masquage d’édition, duplication et suppression. Le sélecteur **Type d’élément** permet de corriger son rôle. Le sous-panneau **Orientation et transparence** contient l’angle initial et l’opacité.

**Le PNG doit représenter un élément indépendant pour l’animer séparément.** Une table déjà peinte dans un décor aplati ne devient pas un calque automatiquement. Les PNG transparents conviennent aux accessoires détourés. Les marges transparentes de l’image restent comprises dans la boîte et le pivot ; l’éditeur ne les rogne pas.

## Déplacer un élément de A vers B

Sélectionner l’objet ou le personnage et cocher **Déplacement A → B** dans **Mouvements**. La position de travail est A. Une image fantôme et une poignée B montrent la destination : glisser B directement dans la scène.

Régler la durée d’un trajet, son délai et sa progression : **Départ et arrêt en douceur** ou **Vitesse constante**. **Aller simple** conserve la position d’arrivée pendant le reste du plan ; **Aller-retour en boucle** effectue le trajet inverse, puis recommence. En aller-retour, la durée est celle d’une branche, pas du cycle aller + retour.

Le volet **Ajuster la destination** offre les décalages X/Y en pourcentage de la scène. Il permet notamment de placer une destination hors champ. Le diagnostic signale cette sortie sans interdire une sortie volontaire. Une poignée dont la destination est hors cadre est ramenée visuellement vers le bord pour rester accessible.

Le trajet est enregistré comme un décalage relatif. Déplacer ou dupliquer le personnage transporte donc son trajet avec lui. Échap pendant un glissement annule le geste ; Ctrl+Z annule un geste terminé.

## Ajouter un effet d’animation

Choisir un effet dans **Effet d’animation** :

| Effet | Résultat |
|---|---|
| Flottement | Oscillation verticale douce autour de la position courante. |
| Balancement | Oscillation de l’angle autour du point d’appui. |
| Respiration | Petite variation de taille uniforme. |
| Rotation continue | Un tour complet par cycle ; sens inversable. |
| Tremblement | Petites oscillations déterministes, sans tirage aléatoire. |
| Petit bond | Le calque monte puis revient à sa position de repos. |

L’**amplitude**, la durée d’un cycle et le délai sont réglables. La rotation continue n’a pas de réglage d’amplitude : elle fait un tour. Désactiver **Répéter en boucle** joue un seul cycle, puis revient à l’état de repos. Le petit bond étant symétrique dans le temps, il n’affiche pas de bouton d’inversion sans effet.

Pour le balancement, la respiration et la rotation, choisir le point d’appui : **Centre**, **Haut · suspendu** ou **Bas · posé au sol**. Le balancement propose par défaut le haut pour un objet et le bas pour un personnage qui n’a pas encore de pivot explicite.

Un trajet et un effet se combinent. Exemple : un accessoire rejoint B tout en flottant ; un personnage avance avec une très légère respiration. **Ces effets déplacent ou transforment l’image entière : ils n’inventent pas une marche articulée, une nouvelle pose ni des images intermédiaires.** Les bulles gardent leur disposition écran ; leurs queues automatiques suivent les personnages transformés.

## Entrées, délais et durée des plans

L’entrée existante (fondu, gauche, droite ou bas) se termine d’abord. Les délais du trajet et de l’effet commencent ensuite, chacun indépendamment. Lorsque l’entrée est « Déjà présent », ses anciens réglages de délai/durée sont ignorés.

La durée du plan reste un minimum. Un dialogue en attente du joueur prolonge le plan ; pendant cette attente, les effets bouclés continuent et un aller simple reste à B. Pause arrête le temps. Un changement de plan réinitialise les horloges d’animation. Les diagnostics avertissent lorsqu’un trajet déborde de la durée minimale ou qu’un effet ne commence qu’après elle : une réplique peut prolonger cette durée, mais ce n’est pas garanti.

## Tester sans lancer toute la cinématique

**Tester les mouvements**, ou le bouton sous la scène, ouvre un aperçu limité au plan. Il comporte pause/reprise, un curseur de temps et **Retour au placement**. Déplacer le curseur met en pause à l’instant choisi. Revenir à un instant reproduit la même pose.

Cet aperçu ne modifie ni le JSON ni l’historique. Il boucle sur la durée minimale du plan. La caméra y reste fixe, toutes les bulles restent visibles pour contrôler leurs queues, aucun son ni déroulement de dialogue n’est lancé. Les réglages de l’inspecteur restent modifiables ; la manipulation des calques dans la scène est suspendue jusqu’au retour au placement. Échap sort de cet aperçu.

**Lire** reste le contrôle complet : caméra, transitions, audio, répliques et mouvements. Vérifier avec ce bouton le rendu d’un plan qui attend le joueur au-delà de sa durée minimale.

## Dupliquer ou continuer

Dupliquer un objet ou un plan conserve ses mouvements avec des identifiants indépendants. **Continuer ce plan** retire les répliques et les entrées comme auparavant. Pour un aller simple, la nouvelle pose de départ est calculée à la fin minimale connue du plan source et le trajet est désactivé, pour ne pas le rejouer. L’effet ambiant reste configuré.

La fin exacte d’un dialogue au clic ne peut pas être connue à l’avance. Un trajet encore inachevé à la fin minimale ou un aller-retour peut donc nécessiter une reprise manuelle de la continuité. Les cycles d’effets repartent au nouveau plan : ce n’est pas un raccord physique continu entre deux plans.

## Essayer les six effets sans ajouter d’images

Charger la bibliothèque exemple avec **Essayer l’exemple**, puis ouvrir `examples/objets_mouvements.cinematic.json`. Six plans montrent les six effets ; le premier ajoute un trajet A → B.

L’exemple réutilise explicitement le cadre de dialogue orné fourni comme **panneau de démonstration**. Ce n’est pas un nouveau pack d’objets de décor. Les fichiers PNG ne sont pas dupliqués. Remplacer ensuite ce panneau par les véritables accessoires de ta bibliothèque.

## Format JSON et lecteur Godot

La V1.4 ouvre les anciens fichiers `schemaVersion: 1`. Un document simple reste v1 tant qu’il ne contient pas les nouveaux champs. Ajouter un objet typé, un angle, un pivot, un effet ou un trajet fait passer automatiquement le fichier à **`schemaVersion: 2`**. Les deux versions sont validées ; une v1 contenant ces champs est refusée, pour éviter qu’un ancien lecteur ignore silencieusement les mouvements.

**Un fichier v2 n’est pas compatible avec l’ancien éditeur/lecteur V1.3.** Conserver les originaux ou utiliser Enregistrer sous pendant les premiers essais. Les chemins restent en `library://`, sans aucune image encodée dans le JSON.

Dans le jeu, remplacer **tout** `addons/lunaria_cinematics/`, y compris le nouveau **CinematicMotion.gd** et `cinematic.schema.json`. Le lecteur fourni utilise les mêmes équations temporelles et conventions de pivot que l’éditeur. Sa bonne exécution dans Godot, le rendu mobile et le packaging Windows restent à vérifier : ils n’ont pas été exécutés dans l’environnement de livraison.

Un test de comparaison des calculs est livré. Depuis la racine du projet, avec Godot installé et accessible :

```powershell
godot --headless --path godot --script res://tests/motion_parity.gd
```

Ce mini-projet de tests n’est pas le projet de ton jeu ; ne pas recopier son `project.godot` dans Lunaria. La réussite du test vérifie les calculs, pas le rendu final, les polices, les textures importées ou les performances Android. Voir `INTEGRATION_GODOT.md` pour l’export des ressources.
