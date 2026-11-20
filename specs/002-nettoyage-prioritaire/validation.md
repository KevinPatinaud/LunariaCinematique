# Validation du premier nettoyage — 26 octobre 2026

Initiative `lunaria-cleanup-20261026-01`, vérifiée sur Windows avec Node 22.18.0 et Godot 4.7.2 stable. Les deux dépôts possédaient des changements locaux avant ce lot ; leurs différences initiales ont été conservées dans le répertoire de travail du chat.

## Résultats exécutés

| Contrôle | Résultat |
| --- | --- |
| Référence `npm test` avant nettoyage | 1 194 réussites, 4 ignorés, 0 échec |
| `npm test` après nettoyage | 1 203 réussites, 4 ignorés, 0 échec ; neuf régressions de synchronisation ajoutées |
| `npm run build` | Types main/renderer, compilation Electron et build Vite réussis |
| `npm run schema` | Génération réussie ; sources techniques du jeu déjà identiques |
| Scénarios Electron de campagne | Trois réussites : publication groupée réelle par IPC, borne de fin et niveau après la borne testé dans une copie isolée |
| `node tools/check_architecture.mjs`, côté jeu | Réussi |
| `node tools/test.mjs --suite all`, côté jeu | 142 tests Node et 77 scénarios Godot réussis |
| `node tools/test.mjs --suite package --skip-import`, côté jeu | Export `.pck` et six suites réussis |
| `git diff --check`, deux dépôts | Réussi ; avertissements de conversion LF/CRLF uniquement |

Commande Electron exécutée depuis le Studio :

```powershell
npm run test:e2e:built -- tests/e2e/campaign.spec.ts --grep 'native grouped publisher|la fin actuelle'
```

Les quatre tests ignorés de la suite Node existaient déjà avant le nettoyage. Ils concernent des liens symboliques dont la création n’est pas autorisée sur cet hôte Windows. Le nouveau test de protection contre les jonctions sortantes a bien été exécuté et réussi. Vite conserve son avertissement sur la taille du bundle ; aucun découpage du renderer n’est inclus dans ce lot.

## Synchronisation contrôlée

- Les 30 alias publics exigent 52 modules, contre 73 copiés auparavant. Les 21 copies sans consommateur ont été supprimées.
- Le premier `--check` a renvoyé le code 1 attendu : 21 copies superflues et le manifeste de gestion absent. Les 145 entrées inspectées ont gardé contenu et dates de modification identiques avant/après le contrôle.
- La synchronisation réelle a écrit uniquement `tools/design/sync-manifest.json` et supprimé les 21 copies. Aucun fichier du lecteur ni schéma déjà identique n’a été réécrit.
- Le contrôle final retourne `ok: true`, avec 52 modules, 30 alias, 11 fichiers du lecteur et aucun écart.
- Les neuf nouveaux tests couvrent CLI sans écriture, idempotence, imports transitifs/cycliques/orphelins, sources absentes, fichiers divergents/manquants/obsolètes, protection des chemins et périmètre du manifeste.

## Préservation

Les 74 empreintes des documents JSON d’histoire, contenus publiés et neuf `.uid` du lecteur restent identiques après synchronisation, import et tests. Aucun média d’auteur n’a été déplacé ou modifié. Hors fichiers volontairement touchés par le lot, 148 différences initiales du jeu et 25 du Studio restent strictement identiques à l’état enregistré avant nettoyage. Les changements préexistants dans les fichiers partagés avec ce lot ont également été relus, notamment le correctif d’attachements du combat et les fixtures du Studio.

Les deux guides de campagne et de présentation corrigés dans le Studio sont reproduits à l’identique sous `game/docs/`. Les rapports datés conservent leur contexte historique.

## Preuves

- Journaux Studio, état initial, empreintes et résultats de synchronisation : `C:/Users/kevin/Documents/Codex/2026-10-26/j-2/work/cleanup/`.
- Jeu complet : `C:/dev/Lunaria/game/.godot/test-results/2026-10-26T17-06-08.768Z-13384/report.json`.
- Paquet : `C:/dev/Lunaria/game/.godot/test-results/2026-10-26T17-09-56.903Z-21448/report.json`.
- Livraison lisible : `C:/Users/kevin/Documents/Codex/2026-10-26/j-2/outputs/Nettoyage-prioritaire-Lunaria-2026-10-26.md`.

## Correspondance avec la spécification

| Exigence | Preuve actuelle |
| --- | --- |
| FR-001 / SC-001 / US1-AC1 | Cinq lanceurs, 27 archives, constante sans consommateur et étape CI inexistante retirés ; commandes maintenues testées |
| FR-002 / US1-AC2 | Façade supprimée ; cinq tests de publication retargetés sur `publishCampaign`, garanties de validation/conflit/backup conservées ; Electron réussi |
| FR-003 / SC-002 / US2-AC1 et AC2 | Neuf tests, comparaison réelle des 145 entrées et contrôle final sans écart |
| FR-004 | Synchronisation explicite bornée aux chemins techniques ; campagne et médias hors manifeste |
| FR-005 / US3-AC2 | Guides et message courant décrivent le profil stable, la borne de campagne et la victoire à la cinquième capture |
| FR-006 / SC-004 / US3-AC1 | Empreintes identiques et changements préexistants conservés |
| SC-003 | Tests des deux dépôts, build et Electron réussis avec limites ci-dessous |

## Limites du lot

Aucune republication de la campagne réelle, aucun nouveau build/install Android et aucun essai sur téléphone pour ce nettoyage. Les contrôles CI ont été exécutés localement sur Windows ; le workflow distant Linux n’a pas été déclenché. La refonte des gros composants React, le retrait d’outils de création encore accessibles et la suppression des espèces peu utilisées ne sont pas inclus. Ce lot ne modifie aucun contrat de données joueur ni d’auteur.
