# Rapport de validation — bibliothèque V1.1

Date : 18 septembre 2026. Mise à jour testée à partir de l’archive source V1 de cette conversation.

## Tests exécutés

**76 tests automatisés du cœur et des fichiers réussis, 0 échec.** Les 57 tests existants ont été rejoués, plus 19 tests de navigation et préférences : filtres par type, recherche multi-mots et sans accents, libellés français, frontières des dossiers, compteurs des sous-dossiers, tri naturel, fil d’Ariane, validation du stockage local et bornage de la largeur selon la fenêtre. Sources dans `tests/`. Résultat brut dans `library-v11-unit-test.tap`.

Commande exécutée dans l’environnement de livraison :

```text
tsc -p tsconfig.tests.json
node --test dist-tests/tests/*.test.js
```

Environnement : Node.js 22.16.0, TypeScript 5.8.3 installé localement et typings Node disponibles. Le script `npm test` de l’application énumère les trois fichiers de tests explicitement pour ne pas dépendre de l’expansion des jokers par le shell Windows.

**20 scénarios d’interface réussis** dans Chromium piloté par Playwright :

- Galerie par défaut : largeur 368 px, 4 colonnes, au moins 20 vignettes entièrement visibles dans une fenêtre 1640 × 960 ; aucun arbre ouvert ne réduit la galerie.
- Recherche, utilisation d’un décor réel, trois tailles de vignettes et liste compacte.
- Redimensionnement à la souris, au clavier, bornes et réinitialisation.
- Enregistrement et restauration des préférences lors d’un nouveau montage.
- Navigation continent/lieu, menu sans changement de hauteur de la galerie, fermeture après sélection et dossier retenu par catégorie.
- Recherche de dossiers imbriqués, absence de résultats et réinitialisation.
- Défilement jusqu’aux 226 ressources environnementales du jeu de test, sans boutons « Afficher 24 ».
- Résumé de sélection compact ; Espace sur une ressource ne lance pas la lecture du plan.
- Fenêtre agrandie modale, grille large, aperçu, ajout, fermeture Échap et restauration du focus.
- Ajout rapide d’un personnage de test, contrat de glisser-déposer conservé et JSON enregistré sans images ni préférences d’interface.
- Fenêtres 1160 × 740, 1280 × 800 et 1920 × 1080 sans débordement horizontal global, avec galerie et scène utilisables.
- Aucune exception JavaScript non gérée pendant ces interactions.

Le résultat détaillé des 20 scénarios est dans `library-v11-ui-results.json`. Les deux captures fournies montrent les vrais composants de l’application et les décors envoyés par l’utilisateur, pas une maquette dessinée.

## Conditions et limites de ces vérifications

L’accès au registre npm était indisponible. Les sources React ont donc été transpilées et exécutées hors ligne avec le runtime **React/ReactDOM 18.2.0** disponible dans l’environnement, et non les versions React 19 déclarées dans `package.json`. Aucun diagnostic de syntaxe TS/TSX n’a été signalé. Cela ne remplace pas le `npm run typecheck` complet avec les typings et dépendances réellement installés sur la machine cible.

Le banc d’interface chargeait le pont `window.lunaria` et le stockage de préférences avec des implémentations en mémoire. Les fichiers réels étaient représentés par des miniatures issues des archives fournies ; une forme géométrique neutre servait aux essais de personnages. Ni ces fixtures, ni les miniatures de la bibliothèque complète, ni les runtimes externes du banc de test ne sont inclus dans le correctif.

Ces essais valident les composants, événements, états, styles et contrats utilisés par le front. **Ils ne valident pas une nouvelle compilation Electron Windows**, un `.exe`, les dialogues natifs, le protocole de lecture d’images Electron ou le stockage persistant du profil Electron après redémarrage réel. Le test de stockage porte sur la logique de sérialisation/restauration du composant avec un stockage simulé.

Le backend et le lecteur Godot ne changent pas dans ce correctif. Godot n’a pas été exécuté. Aucune compatibilité Android supplémentaire n’est revendiquée. Le rapport initial `TEST_REPORT.md` reste conservé pour les limites de la V1.

## Recette dans l’installation existante

Après fusion du correctif, sans changer les versions de dépendances déjà installées :

```powershell
npm run typecheck
npm test
npm run dev
```

Vérifier l’arborescence de sa vraie bibliothèque, le déplacement du séparateur, la fermeture puis réouverture réelle du studio avec les préférences conservées, le glisser-déposer, l’insertion depuis la vue agrandie et l’enregistrement d’une cinématique existante.

Pour produire un nouvel exécutable : exécuter la procédure Windows de construction du README. Elle n’a pas été exécutée dans cette livraison.
