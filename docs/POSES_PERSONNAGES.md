# Générer une pose de personnage

Dans une cinématique, sélectionne un seul personnage puis clique sur **Générer une pose avec Codex** dans ses propriétés.

1. Vérifie la **Référence officielle du personnage**. Le Studio propose le Master à la racine du même personnage et du même stade d’évolution. Si aucun Master unique n’est trouvé, choisis la référence avec le sélecteur de bibliothèque ; il permet aussi d’importer une image.
2. Dans **Décris la pose souhaitée**, décris posture, expression et regard, par exemple « Radis pleure, tête baissée et mains devant le visage ».
3. Choisis le **Modèle Codex** ou le choix automatique, puis **Générer la pose**. Cette préférence est mémorisée séparément des décors et terrains. Codex utilise la connexion locale existante et son outil natif de génération d’images ; le modèle de session choisi est distinct du moteur d’image natif.
4. Compare le Master et la proposition sur le damier de transparence. Vérifie l’identité, le stade, les membres et la silhouette complète. Les contrôles de fichier/transparence ne remplacent pas cette appréciation artistique. Tu peux modifier la description et générer une autre proposition ; les précédentes restent dans l’historique des tâches.
5. **Utiliser cette pose dans le plan** importe l’image et l’affecte au personnage d’origine. **Ajouter à la bibliothèque** importe seulement l’image.

**Réduire** ou fermer le formulaire laisse la génération continuer. **Tâches et résultats → Poses de personnages** permet de retrouver, prévisualiser, annuler, relancer ou utiliser les propositions. Une génération à la fois partage la file des décors et terrains. Les propositions prêtes survivent au redémarrage ; une génération interrompue attend une relance manuelle.

L’affectation garde l’identifiant du personnage et les liens de ses dialogues, ses effets d’entrée, de mouvement et de sortie, sa rotation et son miroir. Les dimensions respectent les proportions de la nouvelle image en conservant le point des pieds. La liaison éventuelle à une animation de sprites est retirée : le résultat est une pose fixe. Les sons spécifiques à cette animation ne se déclenchent plus ; leurs réglages restent dans le plan et reviennent avec l’annulation.

L’affectation est annulable/rétablissable avec **Ctrl+Z / Ctrl+Y**. Enregistre le projet pour conserver le choix. Les fichiers importés restent réutilisables dans la bibliothèque même après une annulation.

Si le projet, le plan ou l’image du personnage a changé, la destination doit être choisie explicitement. Le panneau indique **À affecter** pour une pose importée qui n’est utilisée par aucun personnage du projet ouvert, et **Affectée** lorsqu’elle y est utilisée.

Le Master reste inchangé. Une nouvelle image PNG et sa provenance sont ajoutées sous `02_characters/<personnage>/<stade>/poses/generated/` lorsque la référence suit ce classement, sinon sous `studio_generated/characters/poses/generated/`. Chaque tâche utilise un nom unique. La provenance conserve la consigne, les références, le modèle demandé et les empreintes des images.

La publication habituelle de la campagne embarque cette image comme toute ressource de cinématique. La génération nécessite Codex connecté et disponible sur l’ordinateur ; le jeu Android lit ensuite le média hors ligne.

## Vérification du lecteur

Après `npm run build`, `node scripts/check-pose-runtime.mjs --image <PNG> --out <dossier>` ouvre une pose statique dans un projet Godot isolé, contrôle le chargement et le lien de dialogue, puis produit une capture. Les tests de la fonctionnalité sont `tests/pose-generation.test.ts`, `tests/pose-publication.test.ts` et `tests/e2e/pose-generation.spec.ts`. L’essai réel du dernier scénario Electron est activé par `LUNARIA_POSE_LIVE=1` ; il appelle réellement Codex et conserve le profil isolé.
