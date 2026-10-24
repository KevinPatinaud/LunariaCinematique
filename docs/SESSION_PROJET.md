# État du projet, enregistrement et annulation

Le Studio édite un seul projet : cinématiques, niveaux, campagne et réglages du jeu. Tous les écrans utilisent désormais la même session et le même historique.

## Utilisation

- **Enregistrer le projet** ou **Ctrl+S** écrit l’ensemble du projet dans son fichier JSON.
- **Annuler / Rétablir** agissent sur les modifications dans leur ordre chronologique, même en changeant de cinématique ou de mode. Le Studio revient à l’écran concerné.
- **Historique** affiche les actions de la session. Enregistrer conserve cet historique. Ouvrir ou créer un autre projet le réinitialise. La limite est de 80 actions ; il ne constitue pas une archive durable.
- Le bandeau commun distingue le fichier enregistré et le **brouillon local de récupération**. Il affiche le nom du fichier et l’état du brouillon séparément.
- Le menu **Fichier** donne accès aux nouveaux projets, à l’ouverture, aux projets récents, à **Enregistrer sous…** et à la sauvegarde complète avec les images et les sons. **Ctrl+Maj+O** ouvre les projets récents ; **Ctrl+Maj+S** ouvre Enregistrer sous.
- **Enregistrer sous…** change le fichier de travail. La **sauvegarde complète** crée un instantané indépendant avec ses ressources et conserve le projet ouvert.

Les anciens boutons d’annulation propres à un écran et le champ d’identifiant interne de la cinématique ont été retirés. Les identifiants existants dans les fichiers sont conservés. La vue du projet s’adapte également aux fenêtres courtes.

## Brouillons et fichiers modifiés ailleurs

La récupération automatique conserve le projet entier et la version du fichier dont il provient. Au démarrage, le brouillon reste disponible jusqu’à **Reprendre** ou **Ignorer**, y compris après une ouverture ou un enregistrement d’un autre projet.

Reprendre un brouillon du fichier courant réunit ses modifications avec celles du projet ouvert. Les champs modifiés différemment des deux côtés demandent un choix. La reprise est annulable. Un brouillon rattaché à un autre fichier devient un projet sans fichier de travail, même si les deux fichiers portent le même identifiant de projet.

Les anciens brouillons sans référence de départ peuvent toujours être repris ; leur reprise remplace le contenu affiché et reste annulable. Ils ne permettent pas la même réunion automatique que les nouveaux brouillons.

Si le fichier change sur le disque pendant une session :

1. L’enregistrement ordinaire refuse de le remplacer.
2. La comparaison réunit les modifications indépendantes et présente les désaccords champ par champ.
3. L’utilisateur choisit les valeurs à conserver, revient au brouillon ou enregistre une copie.
4. Avant de réunir et enregistrer, le Studio conserve la référence de départ, le brouillon, le fichier du disque et le résultat dans `project-conflicts`, sous le profil local du Studio. L’emplacement est affiché après l’opération.
5. Le fichier est revérifié avant l’écriture. S’il a encore changé, la comparaison est renouvelée.

Un brouillon illisible est conservé tel quel avant nettoyage ; un message indique son emplacement. Un abandon confirmé à la fermeture ne recrée pas automatiquement le brouillon abandonné.

## Organisation du code

- `ProjectSession` possède le projet, son historique, la référence enregistrée, le chemin autorisé et le jeton de document. Elle assure aussi l’ouverture, la fermeture, la récupération et les opérations d’enregistrement. Sa logique est testable sans React ni Electron.
- `ProjectSessionContext` expose cette session aux écrans par abonnement. `App` dérive la cinématique sélectionnée depuis le projet ; `GameEditor` garde uniquement son état de navigation et d’édition visuelle.
- `ProjectControls`, `ProjectFilesDialog` et `ProjectConflictDialog` rendent les commandes communes et la comparaison.
- `mergeProject` réunit trois versions : référence, brouillon et fichier. Les collections d’objets utilisent leur identifiant ; les suppressions opposées à des modifications et les réordonnancements contradictoires demandent un choix.
- `GameDocuments` conserve les autorisations de fichier et les empreintes côté Electron, écrit atomiquement et conserve les versions avant une réunion. Le résultat est validé avant écriture.

Les saisies en cours sont validées avant une opération de document. Une modification arrivée pendant un enregistrement reste marquée à enregistrer. Le retour par Annuler au point d’enregistrement remet le projet à l’état enregistré ; un nouvel enregistrement ne supprime pas les commandes précédentes.

Cette refonte ne change pas le format de contenu exporté vers Godot et ne réécrit pas la campagne de travail.
