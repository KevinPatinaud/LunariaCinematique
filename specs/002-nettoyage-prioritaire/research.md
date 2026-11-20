# Recherche

- Décision : commencer par les suppressions prouvées. Les cinq lanceurs game/tools/test-*.mjs délèguent au même tools/test.mjs. Les 27 fichiers legacy_before_studio documentent des modèles remplacés et ne sont pas exécutés.
- Décision : supprimer PREPARATION_TIME, dont les deux déclarations n’ont aucun consommateur; ne pas toucher les paramètres de jeu encore actifs.
- Décision : supprimer publishGameProject, utilisé par les seuls tests de l’ancienne façade, en conservant leurs vérifications sur publishCampaign.
- Défaut concret : .github/workflows/validate.yml appelle tools/cinematics.mjs, qui n’existe plus. Les suites cinématiques actuelles sont déjà intégrées au lanceur maintenu.
- Résultat de la recherche de copies : les 30 points d’entrée publics du jeu exigent 52 modules compilés par leurs imports transitifs, contre 73 copiés auparavant. Les 21 modules sans consommateur peuvent être retirés sans réduire les API disponibles.
- Décision : le Studio possède le lecteur sous godot/addons/lunaria_cinematics/ et ses 11 fichiers techniques copiés. Les neuf .uid du jeu gardent leur identité. La synchronisation prévalide les sources et propose --check sans écriture.
- Décision : tools/design/sync-manifest.json mémorise les seuls chemins techniques gérés afin de retirer les copies devenues obsolètes. L’initialisation reconnaît les modules correspondant aux sources actuelles et les anciens alias générés; les fichiers inconnus, la campagne et les médias restent exclus.
- Alternative écartée : retirer des espèces et outils génériques parce que la campagne actuelle ne les emploie pas; cette seule observation ne prouve pas leur obsolescence.
