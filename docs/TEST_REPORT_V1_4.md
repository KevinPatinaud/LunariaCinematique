# Validation V1.4 — Objets et mouvements

Livraison du 18 septembre 2026. Ce rapport distingue les vérifications exécutées des tests seulement fournis.

## Vérifications exécutées

**322 tests automatisés réussis, 0 échec, 0 ignoré**, avec `npm test` sur Node.js 22.16.0 et le compilateur TypeScript global disponible dans l’environnement. Les 228 tests antérieurs restent inclus ; 94 tests ont été ajoutés dans `tests/motion.test.ts`.

Les nouveaux tests portent sur le classement des objets, la compatibilité v1/v2, les limites du schéma, les six effets, les délais après entrée, les cycles et leurs fins, les trajets simples/aller-retour, les progressions douce/linéaire, la combinaison trajet + effet, les pivots, le miroir, les queues de bulles, la duplication, la continuité, annuler/rétablir, les redimensionnements tournés, les coordonnées de recentrage et les diagnostics de mouvements.

Les tests de sauvegarde/bibliothèque du cœur utilisent de vrais fichiers temporaires. La commande `npm run schema` a également été exécutée : le même JSON Schema est généré dans la documentation et dans l’addon Godot. L’exemple `examples/objets_mouvements.cinematic.json` a été validé par le validateur TypeScript.

**35 vérifications d’interface réussies, aucune exception JavaScript observée**, avec le code du renderer V1.4 effectivement exécuté dans Chromium 144.0.7559.96. Résultat détaillé : `validation-v14-ui.json`.

Le parcours contrôle la catégorie Objets, l’insertion, le déplacement réel de B au pointeur, l’annulation et le rétablissement, la combinaison trajet + effet, l’aperçu animé, la pause, le curseur temporel déterministe, l’absence de mutation du document pendant l’aperçu, la reprise et le retour au placement, les six effets visibles, le pivot, le cycle unique, la duplication, la continuité, la réouverture v2, les mouvements de personnage, le suivi des queues, la lecture complète et sa pause, ainsi que l’absence de débordement horizontal à 1200 pixels.

Les captures `apercu-v1-4.png` et les PNG livrés séparément sont issues de cette application en cours d’exécution, pas de maquettes dessinées. Le cadre UI fourni sert explicitement d’objet de démonstration ; aucun nouveau personnage canonique ni nouveau pack de décor n’a été inventé.

## Conditions du banc d’interface

Le registre npm n’était pas accessible (`EAI_AGAIN`). Il n’a donc pas été possible d’installer les dépendances déclarées. Le banc a employé **React 18.2.0 / ReactDOM 18 disponibles localement dans JupyterLab**, alors que le projet conserve **React 19.3** dans son `package.json`.

Le code TS/TSX du renderer et du modèle a été transpilé en modules pour ce banc : **34 modules contrôlés sans erreur de syntaxe de transpilation**. Cela ne constitue pas le typecheck complet du renderer avec les types de ses dépendances déclarées.

Le navigateur de l’environnement interdisant les navigations, le banc exécutait l’application dans un document en mémoire. Il injectait des images locales réduites en data URLs pour le test et simulait le stockage, les identifiants, les dialogues et les opérations du pont Electron. **Le code de production et les cinématiques livrés ne contiennent pas ces images encodées.** Les tests de sauvegarde d’interface vérifient le document échangé au pont ; ils ne prouvent pas une écriture via une fenêtre native Windows.

Le test de continuité ne peut pas prouver un raccord à un instant inconnu choisi par le joueur ; ce cas doit être composé manuellement, comme indiqué dans le guide.

## Tests fournis, NON exécutés ici

- **8 scénarios Electron natifs**, dont deux nouveaux pour les objets/mouvements, dans `tests/e2e/studio.spec.ts`. Exécution locale : `npm run test:e2e`. Ils lancent la vraie application et utilisent un profil/fichiers temporaires ; les choix de fenêtres natives y sont prédéfinis pour automatiser les tests. La CI Windows existante les inclut.
- **Test Godot de comparaison de calculs** : `godot --headless --path godot --script res://tests/motion_parity.gd`. Il doit comparer 210 jeux de valeurs (1 890 valeurs scalaires) issus de TypeScript avec GDScript et précharger le lecteur complet. Les données ont été générées, mais **Godot n’est pas installé ici et ce test n’a pas été exécuté**. Régénération des données : `npm test`, puis `node scripts/motion-fixtures.mjs`.

## Restent à vérifier avant usage de production

L’installation des versions npm déclarées, le typecheck complet, le build Vite/Electron, le packaging/EXE Windows, les scénarios natifs, la syntaxe/exécution du lecteur dans Godot, son rendu visuel, ses textures importées, les performances et les interactions Android. Les équations du port Godot ont été relues ; cette revue ne remplace pas une exécution.

Conserver V1.3 et les JSON d’origine. Tester les exports v2 dans une branche du jeu avec **tout l’addon V1.4**, notamment `CinematicMotion.gd` et le schéma actualisé. Les anciens lecteurs V1.3 ne prennent pas en charge ces fichiers v2.

Les résultats ci-dessus n’impliquent pas l’absence de tout défaut. Les rapports V1/V1.1/V1.2/V1.3 conservés dans le dossier concernent leurs livraisons respectives, pas une validation native supplémentaire de V1.4.
