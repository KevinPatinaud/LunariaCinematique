# Validation — 28 octobre 2026

## Résultat livré

Génération de poses depuis les propriétés d’un personnage, Master du bon stade et référence personnalisable/importable, modèle Codex mémorisé, aperçu transparent, tâches persistantes, import séparé et application ciblée dans l’historique du projet. Les poses fixes retirent la liaison aux animations de sprites tout en conservant l’identifiant et les dialogues.

## Contrôles exécutés

- `npm run build` : réussi, avec typecheck renderer/main. Avertissement Vite existant sur la taille du bundle.
- `npm test` : **1 256 tests, 1 252 réussis, 4 ignorés, 0 échec**. Les nouveaux tests couvrent résolution du Master/stade, transformation sous rotation, cible, alpha réel, transport multi-images, import/provenance, traversée de chemins, tampering, file, annulation, interruption, reprise et publication isolée.
- `npm run test:e2e:built -- tests/e2e/pose-generation.spec.ts tests/e2e/image-tasks.spec.ts` : **11 réussis, 1 scénario réel désactivé par défaut**. Génération simulée, fermeture/réduction, changement de sélection et de projet, destination explicite, import seul, redémarrage, annulation/relance, sélecteur/import de référence, conversion d’un acteur animé, annulation/rétablissement, enregistrement/réouverture et fenêtre étroite.
- Essai séparé `LUNARIA_POSE_LIVE=1`, scénario `native Codex` : **1 réussi**. Appel réel à Codex depuis le Studio, avec le Master et la pose courante copiés dans une bibliothèque isolée. Résultat **1212 × 1298**, véritable alpha, Radis entier en larmes. Résultat appliqué puis projet de test enregistré. L’authentification CLI existante a été utilisée ; aucune API directe ajoutée.
- `node scripts/check-pose-runtime.mjs --image <radis-pleure-native.png> --out <native-runtime>` : **POSE_RUNTIME checks=4 failures=0**, Godot **4.7.2**, rendu OpenGL réel. Chargement du PNG, absence de liaison d’animation, lien de dialogue et présence effective de Radis dans la capture vérifiés.
- Master source comparé à la copie utilisée : **SHA-256 identique**, `5EEF2824A3872916A3AC0067B4A2F633DEFB69228516EE88883C33685E64D769`.
- Publication test : la nouvelle ressource est embarquée par le pipeline existant, l’acteur publié reste statique et le lien de dialogue est conservé. Aucun changement au format publié ni au lecteur GDScript.
- `git diff --check` sur les fichiers suivis concernés : réussi.

## Preuves conservées

Dossier `C:/Users/kevin/Documents/Codex/2026-10-28/dans-le-studio-de-lunaria-j/outputs/poses/` :

- `radis-pleure-native.png` : vrai résultat Codex, inspecté visuellement.
- `pose-live-result.png`, `pose-live-applied.png` : aperçu et application dans le Studio.
- `pose-ready.png`, `pose-form.png`, `pose-applied.png` : interface et résultat des scénarios contrôlés.
- `native-runtime/pose-runtime.png`, `native-runtime/pose-runtime.log` : capture et contrôles Godot du vrai PNG.
- `pose-live-job.json`, `live-profile.txt` : tâche et chemin du profil réel isolé.

Les fichiers de journal `pose-unit.log` et `pose-build.log` sont dans le dossier de cette conversation. Le résultat natif et le projet de test restent disponibles hors de la bibliothèque de production.

## Limites

La fidélité artistique de chaque future demande reste à apprécier par l’auteur ; un contrôle alpha ne détecte pas tous les défauts d’anatomie ou d’expression. Les générations dépendent de l’accès et du quota du Codex local. Aucun essai sur téléphone ni publication de la campagne réelle : le changement est un parcours d’auteur et produit les ressources statiques déjà prises en charge par le jeu.

Le Studio a été recompilé. Une instance déjà ouverte doit être relancée pour charger les nouveaux modules ; aucun brouillon de production ouvert n’a été fermé pour les essais.
