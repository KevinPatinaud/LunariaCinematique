# Vérification

1. Dans le Studio : npm run typecheck, npm test, npm run build, puis npm run test:e2e:built -- tests/e2e/ivy-attack.spec.ts. Ouvrir une copie isolée du projet auteur et contrôler les films 08–11, leurs bulles et l'attaque.
2. Générer le schéma (npm run schema) puis synchroniser le contrat (node scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game). Préflight et publication isolée, puis publication du document réel.
3. Dans le jeu : node tools/check_architecture.mjs ; node tools/test.mjs --suite node ; scénarios d'attaque/présentation concernés ; suites campaign, cinematics et package.
4. Capturer les poses et effets dans les niveaux 8–10, y compris mouvements réduits ; regarder les quatre films.
5. Construire Android via tools/build/build.ps1 -Target Android. Si adb devices ne retourne aucun appareil, consigner l'absence d'essai réel.
