# Validation V1.4.3 — Projets récents

## Périmètre et résultat

Évolution de V1.4.2 limitée à l’accès aux projets récents, à leur registre local, aux points d’ouverture/enregistrement et à l’interface correspondante. Le schéma des cinématiques et l’addon Godot ne sont pas modifiés.

| Vérification | Résultat | Portée réelle |
|---|---:|---|
| `npm test` | **438 réussites, 0 échec** | Tests Node compilés par TypeScript, avec fichiers temporaires réels. |
| Nouveaux tests Node V1.4.3 | **45 réussites** | Registre, coordination avec DocumentFiles et bibliothèques, chemins et affichage. |
| Scénarios d’interface | **22 réussites, 0 erreur de page** | Application React réelle dans Chromium, pont RPC de test vers les classes Node réelles. |
| Captures | **2 captures finales**, plus une vue compacte | L’interface exécutée avec les images de la bibliothèque exemple et des cinématiques fictives de test. |
| Transpilation de syntaxe | **44 fichiers, 0 diagnostic** | Source main/preload/shared/renderer ; ce n’est pas un typecheck complet. |
| `npm run typecheck` | **Non abouti** | Dépendance absente : `Cannot find type definition file for 'vite/client'` (TS2688). |
| Nouveaux scénarios Electron natifs fournis | **6, non exécutés** | Nécessitent les dépendances npm et le build exact. |
| EXE Windows, installation Electron, lancement Godot | **Non exécutés** | Aucune validation native revendiquée. |

Les 393 tests historiques présents dans V1.4.2 sont inclus dans les 438 tests Node effectivement relancés ici. Les anciens rapports d’interface restent historiques et ne sont pas ajoutés au compte des tests V1.4.3.

## Environnement utilisé

Node.js 22.16.0 et TypeScript global pour les tests. Seules les déclarations Node nécessaires aux tests ont été rendues disponibles depuis l’installation locale. Les dépendances React/Electron/Vite déclarées par le projet n’ont pas été installées : les requêtes vers le registre npm ont échoué (`EAI_AGAIN`). Aucun verrouillage de dépendances fictif ni binaire Windows n’a été généré.

Les tests d’interface utilisent Python Playwright et le Chromium local, avec **React 18.2.0** et **ReactDOM 18.2.0-next-9e3b772b8-20220608** extraits des bundles JupyterLab déjà installés. Ce n’est **pas le React 19.3 déclaré** par le projet. Les fichiers TSX sont transpillés pour cet environnement d’essai, sans modifier les dépendances livrées.

La navigation normale Chromium étant bloquée par la configuration de cet environnement, le banc charge les sources dans une page locale préparée en mémoire. Les ressources sont transmises par le banc de test et les appels du pont par RPC local. Les polyfills et adaptateurs de ce banc ne sont pas ajoutés à l’application de production.

**Les composants React testés sont ceux du projet.** Pour les fichiers, les classes `DocumentFiles`, `RecentProjects` et `ProjectHistory` réellement compilées sont utilisées avec un profil et des JSON temporaires. Les choix de boîtes de dialogue sont contrôlés par les tests. Le rendu de l’explorateur Windows, le sandbox Electron, le preload réel et les protocoles de la version packagée ne sont donc pas validés par ces essais Chromium.

## Tests du cœur et du stockage

Les 45 nouveaux tests couvrent notamment :

- Déduplication des chemins, comparaison Windows/POSIX, recherche sans accents, ordre épinglé/récent et dates.
- Conservation des métadonnées entre deux instances du service, limites de 20 récents et 10 épingles, enregistrement sous distinct, épingles conservées lors des réouvertures.
- Retrait et effacement de liste sans suppression des fichiers ; chemins manquants conservés et disponibilité réévaluée.
- Reconnexion d’un fichier déplacé, conservation de l’identifiant, fusion lorsque le nouveau chemin est déjà connu.
- Validation d’un registre corrompu, récupération depuis `.bak`, préservation d’un format futur, validation des champs et suppression des propriétés arbitraires à la lecture.
- Écritures séquentielles et atomiques, comportement en cas d’échec d’écriture, absence de mutation mémoire non persistée.
- Validation du JSON avant bascule de document, sauvegarde ratée n’ajoutant pas de récent, avertissement d’historique distinct d’une sauvegarde réussie.
- Reconnexion de bibliothèque, bibliothèque manquante dissociée plutôt que conservée silencieusement, récupération et jeton du document précédent préservés en cas d’ouverture invalide.

Voir `tests/recent-projects.test.ts` et `docs/validation-v143-unit.tap`.

## Scénarios d’interface exécutés

1. Bouton d’accès, Ctrl+Maj+O, focus de recherche puis restitution du focus après Échap.
2. Recherche par titre sans accents, nom de fichier et résultat vide.
3. Ouverture d’une cinématique récente avec sa bibliothèque et ses trois plans.
4. Retour au document déjà actif sans rechargement ni perte du brouillon/jeton.
5. Enregistrement actualisant le titre et la date, sans entrée dupliquée.
6. Enregistrer sous conservant ancien fichier et copie distincte.
7. Épinglage et détachement conservés après recréation des services sur le même profil.
8. Retrait d’une entrée laissant son JSON intact.
9. Confirmation d’effacement, annulation, conservation des épingles/fichiers et du résultat après redémarrage des services.
10. Fichier manquant conservé avec action Retrouver le fichier.
11. Annulation de la sélection d’un fichier déplacé préservant le brouillon courant.
12. Reconnexion validée sous le même identifiant, sans entrée supplémentaire.
13. Annulation de changement de document avec modifications non enregistrées.
14. Annulation d’Enregistrer empêchant la bascule de document.
15. Enregistrer avant de changer : vérification du titre sur le disque du précédent JSON.
16. JSON invalide : avertissement visible, ancien brouillon et jeton conservés.
17. Fichier supprimé après vérification de la liste : erreur traitée, disponibilité actualisée.
18. Ouvrir un autre fichier depuis le panneau enrichit la liste.
19. Premier lancement sans historique : explication et bouton d’ouverture.
20. Récupération d’un brouillon prioritaire au démarrage, sans perdre les récents.
21. Fenêtre 1000 × 680 : commandes accessibles, pas de débordement horizontal.
22. Mode navigateur : message explicite et absence de faux historique réouvrable.

Résultats détaillés : `docs/validation-v143-ui.json`. Les captures finales ne sont pas comptées comme scénarios supplémentaires.

## Défaut corrigé pendant ces essais

L’ouverture du panneau désactive brièvement le déclencheur pendant la lecture de l’historique. La restauration générique du focus capturait alors un élément inadéquat : après Échap, le clavier ne revenait pas au bouton Projets récents. Un retour explicite au déclencheur, après retrait du panneau, corrige ce comportement ; le scénario 1 a ensuite réussi.

Deux sélecteurs du banc ont été corrigés : le bouton Annuler est recherché dans le dialogue, pour ne pas le confondre avec Annuler/Ctrl+Z du canvas ; le bouton d’actualisation est volontairement désactivé dans le mode navigateur. Ces corrections du banc n’ont pas modifié le comportement de production.

## Scénarios natifs fournis, à lancer sur la machine de développement

`tests/e2e/studio.spec.ts` contient six scénarios supplémentaires pour : métadonnées/pins sur disque, annulation et retour au courant, reconnexion d’un fichier déplacé, effacement non destructif, focus/raccourci, refus d’un chemin arbitraire à la place d’un identifiant de récent. Ils utilisent un profil temporaire isolé ; les boîtes de sélection natives sont remplacées par des choix déterministes, mais le preload/IPC/filesystem sont ceux d’Electron.

Ces six scénarios n’ont **pas été exécutés** ici. Les tests Node vérifient déjà la persistance entre instances ; le cycle complet d’un exécutable Windows reste une validation distincte.

Après installation des dépendances réelles :

```powershell
npm install
npm test
npm run typecheck
npm run test:e2e
npm run dist:win
```

Le build native et le test end-to-end restent à exécuter avant de considérer cette livraison comme validée sur Windows. Aucune nouvelle dépendance ni changement de schéma Godot n’a été introduit par V1.4.3.
