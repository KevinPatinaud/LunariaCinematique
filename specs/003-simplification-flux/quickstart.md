# Vérifier la refonte

Depuis le Studio : npm test, npm run build, puis npm run test:e2e:built -- avec les scénarios audio-workflow, shot-order, inspector-selection, project-session, campagne et les régressions ajoutées. Depuis le jeu : node tools/check_architecture.mjs, suites Node/contrats et package après synchronisation contrôlée.

Différer une image, lancer l’aperçu et changer de film/arrêter avant résolution. Aucune lecture ou erreur ancienne ne doit réapparaître. Tester aussi pause au masquage, redémarrage et continuité audio. Une présentation utilisée dans un film fermé/hors parcours doit rester protégée ; une suppression valide doit être annulable et retrouvée après réouverture.
