# Validation V1.2 · résultats et limites

## Résultat du passage final

| Contrôle réellement exécuté | Résultat | Conditions |
|---|---|---|
| Suite V1.1 avant changements | 76 réussis / 76 | Node, environnement Linux local |
| Suite complète V1.2 | **162 réussis / 162** ; 0 échec, 0 ignoré | TypeScript compilé, modèle + Node/fichiers + cache d’images simulé |
| Scénarios d’interface V1.2 | **35 réussis / 35** | Chromium headless, vrai code React de la V1.2, pont Electron simulé |
| Transpilation syntaxique des sources TS/TSX/CTS | 0 diagnostic syntaxique | Ne remplace pas le typecheck complet |

**86 tests automatisés supplémentaires** ont été ajoutés par rapport aux 76 de la V1.1. Ces comptes désignent des cas de test, pas 86 bugs distincts. Certains tests vérifient plusieurs valeurs limites d’une même correction.

Les journaux du passage final sont fournis dans `validation-v12-unit.tap` et `validation-v12-ui.json`. Un premier passage des tests d’interface avait 30 succès et 2 échecs : l’un a révélé la largeur CSS minimale incorrecte, l’autre une assertion trop restrictive sur le nombre d’images en attente. Après correction du CSS et de l’assertion, la suite complète a été relancée ; un cas à 1000×680 a été ajouté. Une dernière revue a également reproduit deux défauts de validation des champs numériques encore en cours de saisie lors de Ctrl+S et de la fermeture. Ils ont été corrigés et ajoutés à la recette. Le résultat ci-dessus est celui du nouveau passage complet de 35 scénarios, pas une fusion de passages partiels.

## Environnement exact

Node.js **22.16.0**, TypeScript disponible **5.8.3**, Chromium **144.0.7559.96**, Playwright Python **1.57.0**, Linux Debian. Les dépendances npm du projet n’ont pas pu être téléchargées : tentative d’installation en échec réseau/DNS (`EAI_AGAIN`).

Les tests d’interface ont donc utilisé un runtime React **18.2.0** et ReactDOM **18.2.0-next-9e3b772b8-20220608** déjà présents dans l’environnement, chargés dans une page hors ligne. **Ce n’est pas une exécution avec les React 19/Electron déclarés dans package.json.** Aucun de ces runtimes de secours n’est livré dans l’archive.

Le code App, Library, Inspector, Scene, les hooks et les modules partagés est celui de cette V1.2. `window.lunaria`, les réponses des dialogues, le stockage navigateur et les lecteurs audio étaient simulés. Les déplacements ont utilisé une fixture graphique neutre, non un nouveau personnage Lunaria. Les décors et cadres de l’exemple fourni ont été réellement affichés. Les tests de fichiers Node utilisent, eux, de vrais fichiers temporaires, pas le faux pont de l’interface.

## Rejouer les tests inclus

Depuis le projet installé, dans un terminal :

```powershell
npm test
npm run typecheck
npm run build
```

`npm test` compile les tests et exécute les fichiers `tests/*.test.ts` via Node. `tests/regressions.test.ts` ajoute les cas du cycle de document, du modèle et des fichiers ; `tests/images.test.ts` couvre le cache d’images avec un faux chargeur. Sous Windows, les cas nécessitant des liens symboliques peuvent être ignorés explicitement par la suite : consulter le compteur, ne pas supposer le même nombre de tests exécutés.

Le scénario d’interface hors ligne était un harnais spécifique à l’environnement de livraison ; `npm test` ne lance pas ces 35 scénarios. Leurs noms et résultats sont conservés ci-dessous et en JSON pour servir de recette manuelle. La CI `.github/workflows/windows-check.yml` est fournie mais n’a pas été déclenchée.

## Les 35 scénarios d’interface

01. **Réussi** — Enregistrement JSON avec références.
02. **Réussi** — Saisie vide et décimale française.
03. **Réussi** — Insertion asynchrone préserve les modifications.
04. **Réussi** — Insertion retardée vise le plan initial.
05. **Réussi** — Insertion retardée annulée après nouveau projet.
06. **Réussi** — Image corrompue ne ferme pas la galerie.
07. **Réussi** — Redimensionnement vertical et miroir.
08. **Réussi** — Échap annule le glissement.
09. **Réussi** — Annuler et rétablir un déplacement.
10. **Réussi** — Bulle liée, queue manuelle et hauteur stable.
11. **Réussi** — Queue accessible même à l’intérieur.
12. **Réussi** — 1500 caractères sans perte ni blocage sauvegarde.
13. **Réussi** — Sélection et recentrage hors cadre.
14. **Réussi** — Duplication et ordre des calques.
15. **Réussi** — Copie du plan remappe ses liens.
16. **Réussi** — Annulation de suppression du plan.
17. **Réussi** — Réorganisation des plans.
18. **Réussi** — Dépôt aux coordonnées du pointeur.
19. **Réussi** — Nouveau projet annulé après refus de sauvegarde.
20. **Réussi** — Enregistrer avant de remplacer.
21. **Réussi** — Fermeture sauvegarde le dernier caractère.
22. **Réussi** — Annuler fermeture laisse ouvert.
23. **Réussi** — Actualisation dossier disparu.
24. **Réussi** — Recherche et vue grille/liste.
25. **Réussi** — Largeur et double-clic de réinitialisation.
26. **Réussi** — Lecture clic droit ignoré, pause, fin.
27. **Réussi** — Audio une lecture, pause, reprise et arrêt.
28. **Réussi** — Raccourcis ne traversent pas les modales.
29. **Réussi** — Exemple fourni affiché.
30. **Réussi** — Refus de récupération persistant.
31. **Réussi** — Reprise de récupération.
32. **Réussi** — Petit écran 1024×768.
33. **Réussi** — Fenêtre minimale 1000×680.
34. **Réussi** — Nombre en cours de saisie sauvegardé par Ctrl+S.
35. **Réussi** — Nombre en cours de saisie récupéré à la fermeture.

## Non exécuté — ne pas confondre avec un test réussi

- Installation complète des dépendances et typecheck de l’ensemble React/Electron avec les versions du package ; build Vite de production et emballage Windows.
- Exécution native de la fenêtre Electron, IPC réel, boîtes de dialogue Windows, miniatures natives, surveillance du disque et fermeture/crash réels. Le service de fichiers sous-jacent a été testé séparément.
- Son sur un périphérique réel ; synchronisation mesurée en conditions réelles ; charge mémoire de toute la bibliothèque.
- Parseur/exécution de Godot, import des textures, compilation/export du jeu et Android. Les modifications GDScript ont été relues, pas exécutées dans le moteur.

Le projet est donc livré **en sources corrigées**, pas comme un exécutable natif certifié ou un logiciel garanti sans anomalie. Les limites ci-dessus n’annulent pas les corrections vérifiées, mais doivent guider la recette avant de remplacer un flux de production.
