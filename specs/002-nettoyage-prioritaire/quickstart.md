# Vérification

Jeu : node tools/check_architecture.mjs, node tools/test.mjs --suite node, suites Godot concernées puis package.

Studio : npm test, npm run build, scénario Electron de publication concerné. Le contrôle de synchronisation doit être utilisable sans écriture; sa synchronisation explicite ne publie jamais game_content.json.

Consulter validation.md pour les résultats exécutés et leurs limites.
