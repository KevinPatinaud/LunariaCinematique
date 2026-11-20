# Tâches de génération d’images

Les **poses de personnages** sont également suivies dans cette file. Depuis les propriétés d’un personnage sélectionné, **Générer une pose avec Codex** ouvre le formulaire. Le filtre **Poses de personnages** retrouve les propositions. **Ajouter à la bibliothèque** importe un nouveau PNG transparent ; **Utiliser cette pose dans le plan** l’affecte à une destination vérifiée et annulable. Voir [le parcours complet](POSES_PERSONNAGES.md).

Le bouton **Tâches et résultats**, dans la barre du Studio, rassemble les adaptations de décors **20:9** et les générations de terrains **16:9**. Il affiche le nombre de travaux en cours ou de propositions à valider. Les formulaires de création restent accessibles depuis le décor d’un plan et les paramètres d’un niveau.

## Créer, réduire et retrouver

Une seule génération s’exécute à la fois. Les suivantes sont placées en **attente**, en conservant leurs consignes et leur choix de modèle. **Réduire**, fermer le formulaire ou passer aux niveaux laisse la tâche continuer. Pour un même décor, rouvrir l’adaptation retrouve le travail existant. Le terrain d’un niveau retrouve également sa tâche en attente, en cours ou prête.

Dans **Tâches et résultats**, sélectionner une carte pour comparer référence et proposition, consulter la consigne, afficher la grille indicative d’un terrain, annuler ou utiliser le résultat. Les filtres distinguent les travaux en cours, les propositions à valider, les tâches terminées et les deux types d’images. La recherche porte sur le nom, la référence et le modèle. Le volet **Détails de la tâche** contient la date, le modèle demandé, la bibliothèque et le projet d’origine.

L’historique et les propositions sont conservés sur disque. Recharger l’interface ou redémarrer le Studio retrouve les tâches enregistrées. Quitter le Studio arrête les générations encore actives : elles deviennent **interrompues**. Elles attendent **Relancer cette tâche** ; aucun nouvel appel au générateur n’est lancé au démarrage. Une proposition entièrement écrite avant une interruption est récupérée quand ses contrôles de fichier et de format réussissent.

## Valider la bonne image

- Un **décor** remplace son fichier dans la bibliothèque et actualise tous les plans qui le référencent. Une copie de l’original est sauvegardée. Un changement du fichier source depuis la génération bloque le remplacement. **Voir l’original sauvegardé** retrouve la copie.
- Une tâche **terrain** crée une paire de PNG : terrain pollué puis le même terrain nettoyé. Comparer les deux aperçus, puis **Utiliser les deux terrains pour le niveau** : le niveau d’origine est reconnu sans sélection supplémentaire si le projet, son chemin et ses deux anciens terrains correspondent encore. **Choisir un autre niveau** permet de réutiliser la paire ailleurs. Dans un autre projet, si le niveau d’origine a disparu ou si son terrain a changé, le choix explicite de destination est obligatoire. Un changement de projet ou de l’un des deux terrains pendant la validation bloque l’affectation. Une paire incomplète ne peut pas être validée.
- **À affecter** signifie que les fichiers du terrain sont dans la bibliothèque, mais que le projet ouvert ne les utilise pas ensemble. **Affectée** et **Déjà affectés à…** indiquent les niveaux qui utilisent actuellement les deux fichiers. Ce suivi se met à jour après annulation, rétablissement et réouverture. Enregistrer le projet pour conserver les affectations ; le panneau précise si des modifications restent à enregistrer.
- L’affectation du terrain est annulable/rétablissable dans l’historique du projet. Enregistrer ensuite le projet. La publication vers Godot reste une action séparée.

Les choix **Modèle Codex** restent propres aux formulaires de décor et de terrain. La tâche conserve le modèle effectivement demandé ; modifier une préférence ne change pas une proposition existante. **Relancer cette tâche** utilise sa consigne et son modèle d’origine. Pour choisir d’autres réglages, repartir du formulaire du décor ou du niveau.

## Annuler et nettoyer

**Annuler la génération** retire une tâche en attente ou arrête son processus en cours. La file attend la fin de ce processus avant de démarrer l’image suivante. Une réponse tardive ne transforme pas une tâche annulée en proposition prête.

**Nettoyer les tâches terminées** retire les tâches validées, échouées, annulées et interrompues, avec leurs dossiers temporaires. Les travaux actifs et les propositions **à valider** sont conservés. **Supprimer la tâche** permet de retirer une proposition prête après confirmation dans le bouton. Ces suppressions ne touchent ni les images importées dans la bibliothèque, ni les fichiers source, ni les sauvegardes d’originaux, ni les images natives produites hors du dossier temporaire. Il n’est plus nécessaire de redémarrer après 100 tâches.

Les dossiers d’anciennes générations créés avant l’introduction des manifestes `job.json` restent en place. Sans les métadonnées nécessaires, le Studio ne leur invente pas de destination : leur contenu reste récupérable manuellement depuis les dossiers `background-corrections` et `terrain-generations` du profil utilisateur.

## Organisation du code et vérification

`src/main/imageJobs.ts` possède la file, les transitions persistées, l’arrêt et le nettoyage. `imageFiles.ts` centralise la lecture bornée et les empreintes des images. `backgroundCorrections.ts` et `terrainGenerations.ts` gardent leurs traitements et validations propres. Le contrat est dans `src/shared/imageTasks.ts`. `ImageTasksContext.tsx` fournit un seul suivi périodique aux deux formulaires et au panneau global.

Le profil contient un dossier isolé par tâche, avec les sources préparées, le résultat et un manifeste atomique. Les chemins de prévisualisation sont reconstruits lors de la récupération. Un manifeste abîmé n’empêche pas la récupération des autres tâches. Les contrôles de bibliothèque et de source restent exécutés au moment de l’application.

Les tests unitaires couvrent les deux processeurs, le partage de la file, l’annulation avant démarrage et après lancement, la reprise, les validations interrompues, les erreurs, la suppression limitée et plus de 100 tâches. Les scénarios Electron vérifient les formulaires, la réduction, le rechargement, le redémarrage complet, le changement de projet, la validation, l’annulation/rétablissement, l’enregistrement et le nettoyage. Ils utilisent un générateur simulé : ils n’établissent pas la qualité artistique ni la disponibilité réelle du service de génération.
