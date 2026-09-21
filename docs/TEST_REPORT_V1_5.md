# Validation V1.5 — animations et texte

## Résultats effectivement obtenus

**540 tests Node réussis, 0 échec**, dont **102 nouveaux tests** par rapport aux 438 de V1.4.3. Exécution par `npm test`, après compilation TypeScript du périmètre de tests. Le journal complet est `validation-v150-unit.tap`.

Les nouveaux tests couvrent les formats v1/v2/v3, l’absence de modification des anciens documents, la validation de valeurs invalides, les vingt combinaisons apparition/expression du texte, les graphèmes Unicode, le mot par mot, les horloges, les clics, la lecture automatique, les effets ponctuels/bouclés, les quatre nouveaux mouvements sur les trois rôles, les entrées, les sorties, les ancrages des bulles, la continuité, les diagnostics et la limitation des glyphes aux bords de leur zone de texte.

**40 contrôles d’interface réussis, 0 exception JavaScript capturée.** Résultats dans `validation-v150-ui.json`. Ils incluent : ouverture, presets, saisie réelle des vitesses/délais avec virgule, aperçu à plusieurs temps, retour en arrière déterministe, enregistrement sans effet de l’aperçu, annuler/rétablir, premier clic de révélation, second clic d’avancement, pause, nouvelle horloge pour la seconde réplique, sorties sur les trois rôles, conservation des animations par sauvegarde/réouverture et lecture automatique après révélation. Les captures jointes proviennent de cette application exécutée, pas d’une maquette.

## Environnement réellement utilisé

Node.js **22.16.0**, compilateur TypeScript global **5.8.3**, définitions Node disponibles localement. Le cœur, la géométrie, les validateurs, les historiques et les tests de fichiers sont compilés par `tsc` puis exécutés avec le lanceur Node.

Les interfaces ont été exécutées dans **Chromium avec React 18.2 local**, à partir des véritables sources TSX transpillées. Les entrées/sorties Electron sont remplacées par un pont de test en mémoire qui appelle les véritables fonctions `prepareCinematic` et `parseCinematic`. Les nouvelles animations et commandes React ne sont pas simulées. Les contrôles natifs Windows, les protocoles Electron et la persistance au redémarrage ne sont pas validés par ce banc.

La navigation de Chromium étant bloquée par une politique système, le banc injecte le document de test dans `about:blank` et charge ses modules depuis un serveur HTTP local doté d’en-têtes CORS. Une implémentation UUID utilisant le générateur aléatoire cryptographique du navigateur est ajoutée dans le banc pour ce contexte sans origine sécurisée. Le banc n’a pas de localStorage persistant ; aucun résultat de persistance des préférences n’est revendiqué. Aucun assouplissement de politique de sécurité n’a été ajouté à l’application livrée.

Une passe `transpileModule` de toutes les sources TypeScript/TSX produit **0 diagnostic de transpilation**. Elle ne remplace pas le contrôle de types complet.

## Contrôles non aboutis / non exécutés

- `npm run typecheck` a été tenté : arrêt sur **TS2688, définitions `vite/client` introuvables**. Journal : `validation-v150-typecheck.txt`. Les dépendances npm déclarées n’étant pas disponibles localement et le réseau npm étant inaccessible, le typecheck complet et `npm run build` n’ont pas été validés.
- L’interface n’a pas été testée avec le **React 19.3 déclaré** dans `package.json`. Aucun changement de version ni aucune dépendance n’a été ajouté pour contourner cet écart. Une installation réseau normale est nécessaire sur la machine cible.
- Aucun EXE Windows compilé, aucun packaging NSIS/portable, aucune signature et aucun lancement natif Electron Windows validé dans cet environnement.
- **Trois nouveaux scénarios Playwright Electron natifs sont fournis**, en complément de ceux déjà présents, mais non exécutés ici. Ils couvrent texte progressif, preset cri et sortie d’un ennemi avec sauvegarde native.
- **Godot n’est pas installé**. Le lecteur GDScript et son parseur n’ont pas été exécutés. Les nouvelles formules sont portées dans `CinematicText.gd` et `CinematicMotion.gd`, mais la parité native n’est pas affirmée.

## Contrats de calcul Godot fournis

`motion_vectors.json` contient **330 cas de mouvement** produits par le code TypeScript ; `animations_vectors.json` contient **840 cas de texte et 1 176 cas d’entrée/sortie d’acteur**. Ces données permettent aux scripts `motion_parity.gd` et `animations_parity.gd` de comparer les calculs dans le moteur réel. **Générer des valeurs attendues n’est pas exécuter un test de parité dans Godot** ; ces nombres ne s’ajoutent donc pas aux 540 tests réussis.

Les scripts préchargent aussi le lecteur complet pour révéler une éventuelle erreur de syntaxe d’intégration. Commandes, depuis le projet source :

```powershell
npm install
npm run typecheck
npm test
npm run test:e2e
godot --headless --path godot --script res://tests/motion_parity.gd
godot --headless --path godot --script res://tests/animations_parity.gd
```

## Points corrigés pendant les vérifications

La première capture d’un cri révélait un rognage de la lettre de gauche lors de l’expansion. Un garde-fou de transformation par glyphe a été ajouté, porté côté Godot et couvert par quatre tests de bords ainsi qu’un test de repos. Les répliques gardent leur texte et leur mise en page de base.

La continuation d’un plan utilisait auparavant seulement le temps de lecture fixe des bulles ; elle prend désormais en compte leur révélation automatique et ne fait pas réapparaître un élément déjà sorti au temps de fin estimé. L’estimation ne prédit pas le temps d’attente réel d’un joueur.

## Limites visuelles / fonctionnelles

Le cri transforme les lettres d’une réplique entière puis revient au repos ; il ne fait pas éclater physiquement la bulle. Les effets d’acteurs transforment leur PNG entier. Pas d’animation squelettique, de spritesheet animée, d’effet appliqué à un mot sélectionné ou de génération automatique d’images intermédiaires. La typographie de l’aperçu et de Godot n’est pas garantie identique au pixel, et les performances sur appareil Android restent à tester.

Ces contrôles ne garantissent pas l’absence de tout autre défaut. Les rapports des versions antérieures restent des historiques, pas des validations natives supplémentaires de cette livraison.
