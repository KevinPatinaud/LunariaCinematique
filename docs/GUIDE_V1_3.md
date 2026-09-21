# Guide V1.3 — créer plus vite sans timeline

## Installation ou passage depuis V1.2

Fermer l’application et arrêter son terminal avec Ctrl+C. Conserver une copie de l’ancien projet. Extraire le dossier `lunaria-cinematic-studio` de cette archive dans un nouveau dossier, sans l’imbriquer dans l’ancien.

Dans un terminal ouvert à sa racine :

```powershell
npm install
npm test
npm run dev
```

Node.js 22.12 minimum est la contrainte de ce projet. La première installation npm nécessite Internet. Le badge affiche V1.3. `DEMARRER_WINDOWS.cmd` est une autre façon de lancer les mêmes étapes ; pour une mise à jour dans un dossier déjà installé, exécuter d’abord `npm install` manuellement.

La bibliothèque graphique et les cinématiques restent à leurs emplacements actuels. Choisir de nouveau la même racine logique dans l’éditeur. Ouvrir les anciens JSON normalement : le schéma ne change pas. Les trois décors et deux cadres inclus dans `example-library` servent uniquement à découvrir le studio.

Le lecteur `godot/addons/lunaria_cinematics` est conservé par rapport à V1.2. Cette V1.3 ajoute des facilités d’édition, pas de nouveaux effets nécessitant un format runtime différent. Son exécution dans Godot n’a pas été revalidée ici.

## Retrouver rapidement les ressources

Une étoile sur chaque vignette ajoute ou retire un favori. **Favoris** et **Récents** filtrent la catégorie active : Décors, Personnages, Bulles ou Audio. Un favori de Rose se retrouve donc dans Personnages, pas dans Décors. Les favoris sont limités à 500 références ; les récents gardent les 40 dernières ressources utilisées, sans doublons.

La recherche continue de fonctionner dans ces collections. Revenir sur **Tout** réactive la navigation continent → lieu. Dans la bibliothèque agrandie, choisir un dossier revient au mode Tout. Les collections sont enregistrées localement par chemin de bibliothèque : déplacer la racine physique crée une nouvelle collection de préférences, mais ne modifie pas les JSON.

Un favori référence une image ; il ne la copie jamais. Une ressource supprimée ne peut plus s’afficher parmi les favoris. L’actualisation du dossier permet de retrouver les ajouts de fichiers.

## Manipuler une scène avec les calques

Le panneau **Calques**, à droite, se replie d’un clic sur son titre. Les personnages/objets sont ordonnés du premier plan vers l’arrière-plan. Les bulles sont listées séparément dans leur **ordre de lecture** : elles ne sont pas des pistes simultanées.

Cliquer une ligne sélectionne l’objet. Maj+clic ou Ctrl+clic ajoute/retire un objet à la sélection. Dans l’image, tirer un rectangle depuis une zone vide sélectionne les objets intersectés ; avec Maj, ils s’ajoutent à la sélection existante. Tout sélectionner ignore les éléments masqués ou verrouillés.

Déplacer un membre d’un groupe déplace tous les objets sélectionnés non verrouillés, en préservant leurs écarts. Les poignées proportionnelles restent réservées à un élément sélectionné seul : cette version n’ajoute pas un redimensionnement de groupe.

Les commandes d’alignement apparaissent dès que deux éléments sont sélectionnés. La distribution exige trois éléments. L’aimant aligne sur des repères du cadre et des objets voisins ; maintenir Alt le désactive pour le geste en cours. Échap annule un glissement sans le valider.

**Œil et cadenas sont des aides d’édition locales.** Le cadenas bloque les modifications ; l’œil masque temporairement l’objet pour accéder à ce qui est derrière. Le joueur voit toujours l’objet pendant la lecture. Ces aides ne sont ni exportées dans `cinematic.json` ni transformées en animations de disparition. Elles ne font pas partie de Ctrl+Z.

## Enchaîner les plans

**Continuer ce plan** garde le décor, les personnages, leurs positions, la caméra et l’audio ; il retire les bulles et les entrées, puis utilise une coupe. C’est un raccourci pour poursuivre une scène sans refaire sa composition.

**Ajouter un plan** ouvre six modèles. Dialogue à deux utilise deux personnages différents déjà présents ; l’éditeur demande lesquels. Entrée de personnage demande un personnage existant. Aucun sprite ou personnage canonique n’est inventé.

**Dupliquer**, avec le plan sélectionné, propose de conserver ou non les dialogues, les entrées et l’audio. Les copies obtiennent de nouveaux identifiants et les liens bulle → personnage sont remappés. Avec plusieurs objets sélectionnés, Dupliquer agit sur le groupe, pas sur le plan.

Les copies et suppressions groupées sont chacune une seule commande d’historique. Ctrl+Z les annule ensemble.

## Disposer les bulles

Sélectionner un personnage, puis cliquer **Bulle**, crée une bulle liée. Le bouton **Placer automatiquement** propose une position, respecte autant que possible les marges et évite le haut des personnages ainsi que les autres bulles en édition. Le calcul est géométrique : il ne détecte pas les visages dans les PNG et ne comprend pas l’importance narrative des éléments d’un décor.

Tu gardes le contrôle du placement, de la largeur et de la queue. Le système ne coupe pas le texte et ne réduit pas automatiquement la police pour dissimuler un problème. Un texte dépassant les capacités du cadre reste signalé : élargir la bulle ou répartir la réplique sur plusieurs bulles.

Plusieurs bulles superposées dans le canvas ne signifient pas un conflit à la lecture : elles apparaissent l’une après l’autre. Ce chevauchement est donc une information, pas une erreur bloquante.

## Récupération automatique et versions locales

Il faut distinguer trois mécanismes :

- **Enregistrer / Ctrl+S** met à jour le JSON choisi. Une sauvegarde précédente `.bak` est conservée lors d’un remplacement.
- **Récupération automatique** actualise un brouillon local après environ 300 ms sans nouvelle modification valide. Elle n’écrase pas le JSON source.
- **Versions locales** garde jusqu’à 20 instantanés JSON par document, sous le profil Electron, dans `versions/`. Un instantané automatique est créé au plus toutes les 30 secondes pendant les modifications ; un changement de projet et un enregistrement capturent également l’état pertinent. Un **repère nommé** peut être créé à tout moment.

Les versions les plus anciennes, y compris les repères manuels, sont supprimées lorsque la limite de 20 est dépassée. Une version contient le JSON et le chemin de la bibliothèque, jamais les images. Ce mécanisme ne remplace pas une sauvegarde externe du projet et des assets.

Le bouton horloge en haut ou l’état de récupération en bas ouvre l’historique. Sélectionner une version puis **Restaurer cette version** sauvegarde d’abord un repère « Avant restauration », remplace uniquement le brouillon et laisse le fichier source intact. Ctrl+Z annule cette restauration. Enregistrer est nécessaire pour la rendre définitive dans le fichier choisi.

Une version restaurée conserve la bibliothèque actuellement connectée. Si son ancienne racine était différente, un message la rappelle : la reconnecter avant de valider les images. L’application ne substitue pas silencieusement un autre dossier.

Les historiques de fichiers sauvegardés sont retrouvés par leur chemin. Enregistrer sous copie l’historique vers la nouvelle destination sans supprimer l’ancien. Les brouillons sans fichier ont leur propre identité ; la récupération reprend cette identité. Les versions sont locales à la machine et au profil Electron.

En mode web de développement, la sauvegarde reste un téléchargement et les versions utilisent le stockage du navigateur. Le profil desktop est le mode prévu pour travailler régulièrement.

## Diagnostics

Cliquer l’indicateur en bas à droite pour ouvrir les diagnostics. Une référence absente ou un document invalide bloque le démarrage de la lecture. Les avertissements — objet hors cadre, texte trop grand, durée d’entrée excessive, bulle devant un personnage — sont des points à vérifier, pas des raisons de perdre un brouillon.

**Voir dans la scène** sélectionne le plan et l’objet. **Recentrer**, **Adapter la bulle** ou **Proposer un placement** n’agissent qu’après ton clic et s’annulent avec Ctrl+Z. Un objet verrouillé doit d’abord être déverrouillé. Il n’y a pas de correction globale silencieuse.

« Aucune alerte détectée » signifie uniquement que les contrôles disponibles ne trouvent rien. Cela ne remplace pas une lecture dans le jeu, la vérification des ressources exportées et un contrôle sur téléphone.

## Raccourcis

| Raccourci | Action hors champ de saisie |
|---|---|
| Ctrl+S / Ctrl+Maj+S | Enregistrer / Enregistrer sous |
| Ctrl+Z / Ctrl+Y ou Ctrl+Maj+Z | Annuler / rétablir une commande |
| Ctrl+D | Dupliquer la sélection, ou ouvrir les options du plan |
| Suppr | Supprimer les objets sélectionnés non verrouillés |
| Ctrl+A | Sélectionner tous les objets éditables du plan |
| Flèches / Maj+flèches | Déplacer de 1 / 10 pixels dans la scène de référence |
| Maj+clic / Ctrl+clic | Ajouter ou retirer un élément de la sélection |
| Alt pendant un glissement | Désactiver temporairement les aimants |
| Échap | Annuler le geste, fermer une fenêtre ou quitter l’aperçu |
| Espace en lecture | Passer à la réplique suivante |

Dans un champ de saisie, le clavier garde ses comportements usuels. Les boutons gardent leur activation par Espace/Entrée ; Suppr ne supprime jamais un fichier depuis la bibliothèque.

## Tester et produire l’exécutable

```powershell
npm test                 # modèles, historique, fichiers et versions locales
npm run typecheck        # types complets avec les dépendances du projet
npm run test:e2e          # build puis six scénarios dans Electron réel
npm run dist:win         # build et installateurs / portable Windows
```

Les tests Electron utilisent un profil temporaire et ne doivent pas toucher ton vrai profil. Ils exécutent le main, le preload, les protocoles et les fichiers réels ; seules les boîtes de dialogue natives sont pilotées pour choisir les fichiers temporaires. Ils nécessitent les dépendances npm et un environnement capable de lancer Electron.

Le workflow `.github/workflows/windows-check.yml` lance types, tests, build et tests Electron. Aucun exécutable Windows n’a été compilé dans l’environnement de livraison. Les conditions des vérifications réellement exécutées sont dans `TEST_REPORT_V1_3.md`.
