# Lunaria Studio V1.7 — Campagne

## Ce qui est livré

Deux projets complets : le Studio React / TypeScript / Node.js / Electron et le jeu Godot qui exécute le parcours. Pas d’exécutable Windows ni d’APK précompilé. Le code des cinématiques et leurs schémas 1, 2 et 3 restent présents. Le jeu conserve une difficulté unique, une forme par plante, des capacités fixes et un plateau ordinaire de 5 × 8 cases.

Le mode **Niveaux** contient désormais **Campagne**, **Niveaux**, **Plantes alliées** et **Ennemis**. Le mode **Cinématiques** reste distinct. Il n’y a pas de troisième mode ni de timeline supplémentaire.

## Installation

Conserver les anciens dossiers et extraire les deux archives dans de nouveaux dossiers. Ne pas superposer les anciennes sources : la version du jeu doit comprendre le nouveau parcours. La bibliothèque personnelle et les cinématiques de l’auteur restent dans leurs dossiers actuels.

Dans le dossier du Studio contenant `package.json` :

```powershell
npm install
npm test
npm run dev
```

Node.js 22.12 minimum est demandé par ce projet ; Internet est nécessaire pour installer les dépendances la première fois. Les dépendances déclarées de la V1.6 n’ont pas été remplacées. Le badge courant est V1.7. Le script `DEMARRER_WINDOWS.cmd` est conservé. `npm run build` effectue le typecheck et le build, `npm run dist:win` prépare les installateurs après ce build sur votre machine.

Dans Godot, importer `game/project.godot`, laisser les ressources s’importer puis lancer F5. Il faut publier dans le dossier `game` qui contient effectivement `project.godot`, pas dans le dossier parent de l’archive. Aucune police binaire n’est livrée ; les mécanismes de repli existants sont conservés.

## Composer le parcours

Ouvrir **Niveaux → Campagne**. Le projet initial conserve les 40 missions comme 40 étapes Niveau, dans leur ordre existant. Il ne remplace pas votre histoire par les cinématiques de démonstration.

Une carte représente une utilisation d’un contenu, pas le contenu lui-même. Les identifiants d’étapes et de contenus sont distincts. Pour changer l’ordre, glisser une carte devant une autre, déposer à la fin de liste, ou utiliser **Monter / Descendre**. Les boutons sont aussi utilisables au clavier. **Ctrl+Z / Ctrl+Y** annulent/rétablissent les changements du projet de niveaux ; le mode Cinématiques conserve son propre historique.

**+ Niveau** propose les niveaux du projet qui ne sont pas encore dans le parcours. La nouvelle étape est insérée après la sélection. **Retirer du parcours** retire seulement cette étape : le niveau demeure disponible dans la section Niveaux. Les niveaux inutilisés sont signalés et ne sont pas publiés. Un niveau ne peut apparaître qu’une seule fois dans un parcours ; pour créer une seconde rencontre distincte sur la même base, dupliquer son contenu dans Niveaux, puis ajouter cette copie.

**+ Cinématique** sélectionne un fichier `cinematic.json` existant. À la première liaison, choisir le dossier parent commun de vos films. Par exemple :

```text
MesCinematiques/
├── europe/
│   ├── reveil.cinematic.json
│   └── depart.cinematic.json
└── afrique/
    └── arrivee.cinematic.json
```

Choisir `MesCinematiques`, pas un fichier PNG ni la bibliothèque graphique. La référence enregistrée est relative, telle que `europe/reveil.cinematic.json`. Le dossier autorisé est une préférence locale du Studio, pas un chemin absolu publié dans le jeu. Si vous changez de machine ou travaillez avec un autre ensemble de films, reconnecter la racine avec **Choisir le dossier…**. Le Studio vérifie aussi l’identifiant interne du film pour ne pas charger silencieusement un autre document au même emplacement.

Les deux dossiers sont différents : **dossier de films** pour les JSON, **bibliothèque commune** du mode Cinématiques pour les images/sons `library://`. Choisir l’un ne remplace pas l’autre.

Un film peut apparaître plusieurs fois : **Répéter ce film dans le parcours** crée une autre étape, sans copier son fichier. Plusieurs films ou plusieurs niveaux consécutifs sont autorisés. L’option **Autoriser le joueur à passer cette cinématique** se règle indépendamment pour chaque occurrence.

**Ouvrir dans l’éditeur de cinématiques**, ou un double-clic sur une carte Film, ouvre le vrai document dans le mode Cinématiques. Les changements non enregistrés sont protégés par une confirmation. Revenir au mode Niveaux conserve le projet de campagne en mémoire. Pour un niveau, le double-clic ou **Ouvrir le niveau** ouvre directement sa fiche.

**Changer le fichier lié…** répare une liaison déplacée ou remplace un film par un autre JSON. Toutes les étapes utilisant cette référence sont reconnectées ensemble. Choisir un fichier déjà lié réutilise sa référence. Cette opération est annulable et ne supprime aucun fichier sur disque. Reconnecter d’abord le dossier parent si le nouveau fichier est hors de la racine autorisée.

Le titre d’une carte Film est celui enregistré lors de sa liaison ; l’éditeur et la publication relisent le vrai contenu du fichier. Changer son identifiant interne nécessite une reconnexion explicite. Les modifications non enregistrées dans un autre logiciel ne peuvent pas être publiées : enregistrer les films avant de publier.

## Répartition des rôles

La section **Niveaux** devient la bibliothèque des niveaux. Ses flèches organisent cette bibliothèque, sans modifier le parcours déjà composé. **Seul l’ordre dans Campagne décide de l’ordre joué.** Supprimer réellement un niveau de la bibliothèque supprime aussi son étape pour ne pas laisser de référence cassée.

Les statistiques des plantes et ennemis restent définies une seule fois dans les catalogues globaux. Le parcours ne contient aucun multiplicateur ni équilibrage particulier par étape.

La séquence gère les moments entre les combats. Les dialogues textuels de milieu de vague et les associations intermédiaires du lecteur existant restent disponibles. Les anciennes répliques textuelles d’introduction et de fin restent consultables/éditables dans les niveaux mais ne se lancent plus automatiquement autour de chaque combat : ajouter les films souhaités dans le parcours. Le journal historique est une lecture libre, pas une validation de campagne. Aucun écran d’embranchements, de choix conditionnels ou de simulation de combat n’est ajouté.

## Enregistrement et publication groupée

**Enregistrer** sauvegarde le projet de travail `.game.json` : catalogue global, bibliothèque des niveaux, références aux films et liste ordonnée. Ni image, ni audio, ni contenu des films n’est incorporé à ce document. Les récents et la récupération locale du projet restent disponibles.

**Vérifier les fichiers du parcours** relit les films utilisés, valide leur schéma et leur identité, résout les images/sons et signale les absences avant de modifier le jeu. Les identifiants incohérents, références absolues ou sortant du dossier, doublons de niveau et parcours sans niveau sont refusés. Cette vérification ne simule pas les combats et ne décode pas toutes les ressources comme le moteur Godot : une image dont le fichier existe mais dont les octets sont corrompus reste à vérifier par le lecteur.

Pour publier : fermer le jeu, enregistrer les films, cliquer **Publier la campagne**, sélectionner le dossier Godot fourni, lire le récapitulatif puis confirmer. Le Studio propose d’abord d’enregistrer un film modifié ouvert dans l’application ; Annuler stoppe la publication. Continuer sans enregistrer utilise volontairement la version sur disque, sans perdre le brouillon ouvert.

La publication produit :

```text
game/
├── content/design/game_content.json        # catalogue + niveaux utilisés + parcours
├── content/design/game_content.json.bak    # contenu précédent
├── content/cinematics/studio/<hash>.cinematic.json
└── LunariaArtLibrary/<chemins_partagés>     # images et sons utilisés
```

Les niveaux publiés sont ordonnés selon leur passage dans la campagne, sans modifier la bibliothèque du projet de travail. Seuls les films référencés sont installés. Un même chemin de ressource est partagé entre tous les films. Deux sources JSON de contenu identique réutilisent un seul film publié. Les films conservent leurs références `library://` ; le jeu les résout vers `res://LunariaArtLibrary`.

Le publieur vérifie les conflits avant l’installation, prépare les fichiers manquants puis remplace le contenu actif **en dernier**. Une image déjà présente avec des octets différents est refusée : renommer sa nouvelle version pour éviter d’altérer d’autres cinématiques. L’ancienne campagne n’est pas remplacée si une référence manque ou si un conflit est détecté. Les fichiers nouvellement créés par une publication qui échoue sont retirés lorsque leur contenu est toujours celui de cette opération. Un verrou empêche deux publications simultanées.

Les anciens fichiers publiés devenus inutilisés ne sont pas supprimés automatiquement, pour protéger les autres usages de la bibliothèque. En cas d’arrêt forcé du processus, des fichiers non référencés peuvent subsister. Après avoir vérifié qu’aucun Studio ne publie, on peut retirer un verrou résiduel `.lunaria-campaign-publish.lock` avant de recommencer. Le dossier de publication doit se trouver sur un système prenant en charge les liens physiques de fichiers, notamment NTFS ; le traitement refuse un échec plutôt que d’écraser des ressources en place.

Relancer Godot et réimporter les nouvelles ressources après publication, puis lancer/exporter le jeu. Les presets conservent `all_resources` et les JSON sous `content/**/*.json`. Il n’est pas nécessaire d’ajouter une copie brute supplémentaire des PNG dans l’export : le lecteur utilise les ressources importées quand elles existent. L’export final Windows/Android reste à tester dans Godot.

## Progression dans le jeu

**Continuer / Nouvelle aventure** suit la première étape non terminée. Fin normale d’un film : étape suivante. Passage explicite d’un film autorisé : étape suivante. Film obligatoire : le joueur peut quitter vers l’accueil sans le valider, mais ne peut pas avancer au plan suivant par le sélecteur de plans ni passer l’étape.

Une interruption ou une erreur de lecture n’avance pas la campagne. **Continuer** reprend le film depuis son début, pas au milieu d’une phrase. Une fois devant un niveau, le jeu ouvre la préparation de l’équipe ; un combat suspendu se reprend avec son état courant. Une défaite laisse l’étape en attente. La victoire enregistre le résultat puis **La suite de l’histoire** reprend le parcours à l’étape suivante. Les éventuels films après le dernier niveau sont donc encore à terminer avant la fin de campagne.

Un niveau déjà gagné reste rejouable depuis la carte. Sa victoire peut améliorer son résultat, mais ne saute pas un film en attente et n’accorde pas une seconde récompense de première victoire. La galerie cinématique du jeu et l’aperçu du Studio restent des lectures libres. Le lecteur suspend le gameplay et son audio pendant une cinématique de campagne, puis rend la main au contrôleur de parcours.

## Sauvegardes : pas de migration

Le format courant devient `user://lunaria_profile_v13_<empreinte_du_contenu>.json`. La position dans le parcours est enregistrée dans `campaign_cursor`. L’empreinte isole le profil d’un contenu publié : modifier les étapes, les niveaux, les statistiques ou un film référencé entraîne une nouvelle empreinte et une nouvelle partie de développement. Publier exactement les mêmes données conserve le profil correspondant. Les anciens profils ne sont ni recherchés, ni convertis, ni supprimés.

Ce comportement est intentionnel : une position numérique enregistrée ne peut pas être réutilisée silencieusement dans un autre ordre de campagne. Aucune migration de sauvegarde n’a été réintroduite.

## Exemple prêt à relier

Ouvrir `examples/campagne_decouverte.game.json`. Choisir le dossier `examples` comme racine des films et `example-library` comme bibliothèque du mode Cinématiques. L’exemple comprend six étapes : réveil, défense de la serre, départ, quartier ferroviaire, jardins, film final. Trois films partagent deux ressources graphiques déjà fournies, sans copie supplémentaire par film. Publier cet exemple remplace la campagne de test par ses trois niveaux ; le projet initial à 40 missions est conservé dans `examples/lunaria.game.json`.

Les essais de cette livraison, leurs environnements et leurs limites sont détaillés dans `TEST_REPORT_V1_7.md`. Ne pas confondre les tests de publication de fichiers avec une exécution du moteur Godot.
