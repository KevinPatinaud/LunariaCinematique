# Architecture du parcours de campagne — V1.7

## Frontières

Le projet du Studio est un document d’auteur. Sa bibliothèque de niveaux peut contenir des essais non utilisés. Le champ `campaign` contient un catalogue de films liés et une liste d’étapes. Un film, une étape et un niveau ont chacun une identité distincte. Une étape n’embarque pas de statistiques ni d’images. Chaque niveau est utilisé au plus une fois ; un film peut être utilisé plusieurs fois avec des règles de passage différentes.

`src/shared/game/campaign.ts` contient les transformations pures : parcours initial, réordonnancement, compilation des éléments utilisés et modèle de transition. `validation.ts` applique les contraintes de références et d’unicité. La forme JSON reste `kind: lunaria-game-project`, version 1 ; le lecteur de projets d’auteur sans champ campaign fournit l’ordre initial des niveaux. Il ne s’agit pas d’une migration de sauvegardes du jeu.

`CampaignEditor.tsx` ne lit pas le disque. Il manipule le modèle via l’historique du `GameEditor`. Le parent App protège le document cinématique en cours lors de l’ouverture d’un lien ou de la publication. Le preload expose seulement six opérations de campagne explicitement nommées, sans API d’accès disque arbitraire.

## Autorisation et publication

`CampaignSources` résout uniquement les JSON sous un dossier choisi dans une fenêtre native. `realpath`, les bornes du dossier, l’extension, les tailles et l’identité interne sont vérifiés. Les références `library://` utilisent la racine graphique autorisée séparément.

`planCampaign` compile une copie du projet, relit les films utilisés et construit un plan de fichiers. Les images sont partagées par chemin relatif ; les JSON canoniques sont nommés par SHA-256. Deux sources identiques partagent un film publié, même si elles avaient des noms différents dans l’espace de travail. Les identifiants d’étapes restent inchangés.

`publishCampaign` acquiert un verrou exclusif, pré-vérifie les destinations, installe les ressources manquantes sans écraser les fichiers différents, puis utilise `atomicJson` pour remplacer le seul fichier de contenu actif. Le JSON actif est le point de commit. Une erreur gérée nettoie les fichiers créés par cette opération seulement si leur empreinte correspond toujours. Les anciens blobs ne sont pas collectés automatiquement ; un crash peut laisser des fichiers inutilisés, pas une campagne pointant vers des films partiellement écrits.

Le contrat JS compilé est synchronisé vers le jeu avec `node scripts/sync-game-contract.mjs --game <dossier-game>`. Le schéma JSON est partagé, et le validateur GDScript applique les contraintes de références que son sous-ensemble de JSON Schema ne peut pas exprimer seul.

## Jeu

`domain/campaign/campaign_sequence.gd` possède la séquence chargée et les fonctions de progression. Aucun rendu, aucune écriture de fichier, aucun contrôle d’interface n’y est placé. Les catalogues de niveaux sont projetés dans l’ordre de la séquence.

`PlayerProgress` enregistre les résultats puis tente d’achever l’étape Niveau courante, seulement si l’identifiant du niveau correspond. Une victoire de replay améliore éventuellement un résultat mais ne saute pas l’étape courante. Les films n’accordent ni récompenses ni victoires de niveau.

`app/controllers/campaign_flow.gd` orchestre le passage à la préparation, la reprise d’un combat ou le lancement d’un film. Les fins de film passent par un identifiant d’étape ; une notification périmée ne valide pas une autre occurrence du même film. L’enchaînement est différé pour éviter une récursion entre plusieurs films courts.

`CinematicHub` différencie trois usages : galerie libre, événement interne de l’histoire et étape du parcours. Seule une lecture appartenant au parcours émet `campaign_completed`. L’interruption et l’erreur libèrent les ressources sans avancer. Les étapes obligatoires empêchent le passage et la recherche en avant. Le moteur cinématique existant conserve ses responsabilités de rendu et d’animation.

Le profil v13 dépend de l’empreinte du contenu publié, y compris les chemins de films immuables. Pas de migration. Une modification du contenu ouvre un profil distinct, ce qui évite de réinterpréter un index de sauvegarde dans un autre parcours.

## Tests

Les tests purs ne remplacent pas le moteur : `campaign-authoring.test.ts`, `campaign_sequence.test.mjs` et les essais de publication couvrent les transformations/fichiers. `campaign_sequence_smoke.gd` est le test natif de progression. Les essais Electron du preload et des boîtes natives sont séparés des contrôles Chromium. Les résultats réellement exécutés figurent dans le rapport V1.7.
