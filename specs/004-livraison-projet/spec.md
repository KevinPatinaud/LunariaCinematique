# Spécification : livraison cohérente du projet

**Date** : 2026-10-27
**Statut** : Réalisé et vérifié
**Demande** : « Continue le nettoyage »
**Initiative** : lunaria-delivery-20261027-03

## User Scenarios & Testing

### US1 — Livrer le projet effectivement enregistré (P1)

L’auteur teste un niveau, publie, exporte ou déploie depuis un même parcours cohérent.

1. Un champ actif est validé avant enregistrement ; seule la version enregistrée est transmise à la livraison.
2. Une annulation, un conflit ou une modification arrivée pendant l’enregistrement empêche la livraison et laisse le brouillon disponible.

### US2 — Suivre la bonne opération Android (P1)

1. Les étapes affichées appartiennent à la requête en cours ; un ancien événement ne modifie ni le message ni le suivi d’une nouvelle requête.
2. Une fin, une erreur, une annulation ou l’ouverture d’un projet nettoie les abonnements et le suivi associé au précédent projet.

### US3 — Conserver édition et sauvegardes (P1)

1. Un double clic n’ouvre pas deux opérations concurrentes ; les commandes restent utilisables après erreur.
2. Un résultat d’inspection de conflit arrivé après changement de projet ne contamine pas le nouveau projet.

## Exigences

- **FR-001** : Centraliser validation du champ, verrou, enregistrement et livraison dans un seul parcours.
- **FR-002** : Refuser la livraison d’un projet modifié, remplacé ou en conflit depuis l’enregistrement ; garder l’identifiant du niveau demandé et le revalider.
- **FR-003** : Corréler chaque progression Android avec sa requête, sans message tardif après sa fin.
- **FR-004** : Conserver succès, erreurs, annulations et suivi visible des quatre actions de livraison.
- **FR-005** : Protéger le projet courant contre un échec ou résultat de conflit d’une ancienne opération.
- **FR-006** : Préserver contenus, médias, formats publiés, historique et changements existants.

## Périmètre Lunaria

Studio uniquement : orchestration du renderer, session et transport IPC interne. Le contrat publié Studio → Godot ne change pas ; aucun fichier du jeu n’a à être synchronisé. Aucun déplacement de média, migration, publication réelle ni installation sur téléphone. Le transport interne reçoit une identité de requête, distincte des données d’auteur.

## Cas limites

Champ encore actif, sauvegarde annulée/échouée, modifications pendant l’attente, niveau disparu, double clic, progression périmée pendant une nouvelle opération, nouveau projet ouvert, conflit détecté après changement d’époque, erreur puis nouvelle tentative.

## Critères de réussite

- **SC-001** : Les quatre actions utilisent le même protocole et le raccord onBeforePublish redondant est retiré.
- **SC-002** : Les régressions déterministes refusent les états non enregistrés et ignorent les anciens événements/conflits.
- **SC-003** : Les scénarios Electron de déploiement, publication, test de niveau et sauvegarde concernés passent.
- **SC-004** : Types/build/tests passent et les contenus réels ainsi que les changements antérieurs sont conservés.

## Hypothèses

Réutiliser la session et le verrou actuels ; aucune nouvelle couche globale ni dépendance. Les tests matériels du Studio utilisent leur simulation native existante et ne prouvent pas un déploiement sur téléphone réel.
