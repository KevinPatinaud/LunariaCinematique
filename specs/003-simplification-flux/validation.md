# Validation — simplification des flux du Studio

Initiative `lunaria-structure-20261026-02`, 26 octobre 2026. Windows, Node 22.18.0 et Godot 4.7.2. La passe cible deux responsabilités entremêlées : le cycle de prévisualisation et les usages des présentations.

## Résultats

| Contrôle exécuté | Résultat |
| --- | --- |
| `npm test` avec sorties purgées | 1 219 réussites, 4 ignorés, 0 échec ; 16 nouveaux tests déterministes |
| `npm run build` | Types, compilation main/preload et renderer réussis |
| `npm run typecheck` final | Réussi après toutes les modifications de types |
| `npm run schema` | Réussi ; aucun format ni valeur de contenu changé |
| Nouveaux scénarios Electron | 3 réussis : changement de film pendant chargement, arrêt immédiat et usages/suppression avec historique et réouverture |
| Régressions Electron | 28 scénarios réussis : audio réel, actions, sélection, session, conflits, ordre, campagne et publication |
| Scénarios remis à jour | 7 réussis : planches Radis/Rose, multi-sélection, duplication, création de plan, départ choisi, raccourci et texte progressif |
| `node tools/check_architecture.mjs`, côté jeu | Réussi |
| `node tools/test.mjs --suite node` | 142 tests réussis |
| `node tools/test.mjs --suite package --skip-import` | Export et six suites réussis |
| Synchronisation finale `--check` | Réussie : 52 modules, 30 alias, 11 fichiers du lecteur ; aucun écart |

Il s’agit de **38 scénarios Electron distincts**, et non de la totalité du dossier e2e. Les quatre tests Studio ignorés sont les tests existants de liens symboliques non autorisés sur cet hôte Windows. Le build conserve son avertissement Vite sur la taille du bundle, sans erreur de compilation.

## Défauts reproduits et corrections

Avant intégration, les deux nouveaux scénarios de lecture échouaient sur l’ancien renderer : un changement de film pendant le décodage déclenchait l’ancienne lecture sur le nouveau film ; aucun arrêt n’était accessible pendant le chargement initial. Ils passent avec le propriétaire unique de lecture. Les tests déterministes vérifient aussi annulation immédiate, rejets tardifs, remplacement avec le même ID, changement de projet/bibliothèque/mode, visibilité et absence de saut de temps, audio unique entre plans et nettoyage à la fin.

La vérification élargie a d’abord donné 28 réussites et un échec de test obsolète : le scénario de planches cherchait « 1 images », puis supposait que toute animation utilisait le mode planche découpée. Le sélecteur respecte désormais le singulier et vérifie l’image sélectionnée dans les deux modes. Une autre série révélait six scénarios utilisant encore les aides de l’ancien éditeur de films seuls. Les aides d’ouverture/enregistrement passent maintenant par le projet unique et le vrai raccourci d’enregistrement sous. Les sept scénarios concernés passent après correction. Aucun bouton historique n’a été réintroduit.

Les sept nouveaux tests d’usages couvrent notamment films fermés, hors parcours et après borne, références ajoutées après confirmation, film absent, définition disparue et dernier profil. Le scénario Electron vérifie mise à jour immédiate, annulation/rétablissement, suppression d’une définition libre, enregistrement et réouverture.

## Préservation et sorties

- 201 fichiers source Studio comparés à la référence : 192 identiques, neuf changements attendus, aucune différence inattendue.
- 5 503 fichiers du jeu comparés : 5 502 identiques. La seule différence est `game/tools/design/shared/presentation/runtime.js`, copie du retrait de l’ancien calcul d’usages. Les contenus d’auteur, médias et `.uid` sont identiques.
- Les 209 différences initiales du jeu et les 31 différences initiales du Studio hors fichiers volontairement touchés sont conservées à l’identique. Les fichiers partagés avec des changements antérieurs ont été relus et leurs modifications conservées.
- Synchronisation réelle : un fichier écrit, aucun retrait ; aucun changement GDScript, schéma, contenu publié ou média.
- Les anciens `dist/main/presentationUsages.js` et `dist-tests/src/main/presentationUsages.js` sont absents après génération. Le nettoyage borné des sorties empêche leur réapparition depuis un ancien build.

## Correspondance avec les critères

| Critères | Preuves |
| --- | --- |
| FR-001, FR-003, US1-AC2 | Session de lecture unique et hook fin ; tests d’horloge, audio et scénarios de départ/relecture/texte |
| FR-002, SC-001, US1-AC1 | Course reproduite avant modification ; tests de décodage différé et invalidation réussis |
| FR-004, SC-003 | Analyse pure unique ; ancien service, IPC, calcul du film ouvert, props et actualisation manuelle retirés |
| FR-005, SC-002, US2-AC1/AC2 | Garde sur le brouillon courant et scénario Electron d’usages/suppression/annulation/réouverture |
| FR-006, SC-004, US3-AC1/AC2 | Empreintes, anciens changements, tests session/publication et paquet réussis |

## Preuves et limites

Journaux, échecs initiaux et empreintes : `C:/Users/kevin/Documents/Codex/2026-10-26/j-2/work/structure/`. Rapport Node du jeu : `game/.godot/test-results/2026-10-26T17-38-25.632Z-25140/report.json`. Rapport paquet : `game/.godot/test-results/2026-10-26T17-39-07.634Z-436/report.json`.

Rapport utilisateur et captures Electron inspectées : `C:/Users/kevin/Documents/Codex/2026-10-26/j-2/outputs/Refonte-structurelle-Lunaria-2026-10-26.md` et `outputs/structure/`.

Aucune republication réelle, aucun déploiement Android et aucune exécution distante Linux pour cette passe de l’éditeur. Les scénarios Electron utilisent des projets/profils isolés. Les autres responsabilités encore volumineuses de l’éditeur ne sont pas déclarées refondues par ce lot.
