# Validation — livraison du projet

27 octobre 2026, initiative `lunaria-delivery-20261027-03`. Studio sous Windows, Node 22.18.0. Le jeu et les formats publiés sont inchangés.

## Résultats exécutés

| Vérification | Résultat |
| --- | --- |
| Tests ciblés de livraison/session | 36 réussites |
| `npm test` final | 1 237 réussites, 4 ignorés, 0 échec ; 18 nouvelles régressions unitaires |
| `npm run build` final | Types, main/preload et renderer réussis |
| Electron : Android, campagne, session, aperçu et usages | 18 scénarios distincts réussis |
| Android après le dernier ajustement des messages d’annulation | 4 scénarios réussis, inclus dans les 18 ci-dessus |
| `sync-game-contract.mjs --game C:/dev/Lunaria/game --check` | Aucun écart ; aucune synchronisation écrite |
| Contrôle des différences | Réussi ; avertissements LF/CRLF seulement |

Les quatre tests ignorés sont les cas existants de liens symboliques non autorisés sur cet hôte Windows. Le build conserve l’avertissement Vite sur la taille du bundle. Les suites Electron exécutées sont une sélection du périmètre, pas la totalité du dossier e2e.

## Reproduction et protections

Le nouveau scénario Electron d’événement Android tardif échouait avant raccord : un événement reçu après la fin remplaçait le message global par « Ancien événement à ignorer ». Il passe après retrait de l’abonnement permanent et corrélation par `requestId`. Le même scénario vérifie que l’ouverture d’un projet retire le suivi terminé du précédent projet. Le scénario de succès vérifie que les événements natifs portent tous la même identité de requête.

Treize tests du propriétaire de livraison couvrent les quatre actions, les deux cibles d’export, sauvegarde annulée/échouée, changement pendant IO, niveau absent, double appel, ancien progrès pendant une nouvelle requête, fin/erreur/annulation et nouvelle tentative. La version livrée est celle passée à l’enregistrement ; une modification concurrente reste dans le brouillon et bloque l’appel natif.

Cinq tests supplémentaires de session utilisent des promesses différées et de vraies ouvertures via l’API publique : échec de sauvegarde périmé, inspection de conflit périmée, conflit courant conservé, changement légitime de jeton en enregistrant sous et nettoyage d’un ancien enregistrement terminé après ouverture du projet suivant. Les gardes d’époque empêchent les messages et conflits périmés.

## Préservation

La référence comprend 440 fichiers source/test/documentation existants du Studio. Dix fichiers ont les changements attendus, les 430 autres sont identiques. Hors fichiers volontairement touchés, 39 différences locales préexistantes sont conservées à l’identique. Les changements des passes précédentes dans App/GameEditor et le transport ont été préservés et leurs scénarios relancés.

Les 5 503 fichiers du jeu ont été comparés à la référence conservée de la passe précédente : 5 502 sont identiques ; la seule différence est la copie `game/tools/design/shared/presentation/runtime.js` déjà modifiée par cette passe précédente. Aucun nouveau changement côté jeu. Documents d’auteur, médias et identifiants `.uid` restent identiques.

## Conformité au périmètre

- FR-001 / SC-001 / US1 : un seul protocole `ProjectDelivery → ProjectSession.run → saveCurrent → API`, sans le raccord `onBeforePublish` redondant.
- FR-002 / SC-002 : version capturée, contrôles de dirty/conflit/identité/époque et niveau demandé, tests différés et double appel.
- FR-003 / FR-004 / US2 : identité de transport et abonnement limité à la requête ; statuts et messages d’annulation cohérents ; quatre scénarios Android natifs simulés.
- FR-005 / US3 : jeton initial et gardes d’époque autour des attentes ; conflits valides et Enregistrer sous préservés.
- FR-006 / SC-003 / SC-004 : empreintes, types/build/tests et régressions de campagne/session/aperçu/usages réussis.

## Preuves et limites

Journaux et empreintes : `C:/Users/kevin/Documents/Codex/2026-10-26/j-2/work/delivery/`. Rapport utilisateur : `outputs/Nettoyage-livraison-Lunaria-2026-10-27.md` dans le même chat ; capture inspectée `outputs/livraison-2026-10-27.png`.

Les appels de test restent dans la simulation native Electron et des dossiers temporaires. Aucun téléphone réel touché, aucun export Android de production, aucune campagne réelle publiée. Le contrôle de contrat est en lecture seule ; aucun port GDScript ou changement de format joueur/auteur n’est requis. Les modifications sont locales, sans commit ni push demandé.
