# Implementation Plan: [FEATURE]

**Date**: [DATE] | **Spec**: [spec.md](spec.md)
**Initiative commune**: [identifiant partagé si plusieurs dépôts sont concernés]

## Summary

[Besoin utilisateur, résultat attendu et approche minimale.]

## Technical Context

- **Stack existante**: Electron, React et TypeScript ; Node >= 22.12.0.
- **Racine**: `C:/dev/Lunaria cinematic studio`.
- **Sources consultées**: [fichiers réels, état local et révisions utiles].
- **Contraintes de la demande**: [critères et limites applicables].
- **Testing**: [commandes proportionnées au changement].

## Constitution Check

- [ ] L'expérience Android et/ou le parcours d'auteur concerné est décrit.
- [ ] Les sources d'auteur et les sorties générées sont distinguées.
- [ ] Le contrat Studio/Godot concerné est référencé, ou l'absence d'impact est motivée.
- [ ] Les frontières de `docs/ARCHITECTURE.md` sont respectées.
- [ ] Les tests et essais prévus correspondent au risque ; les données sont isolées.
- [ ] Les modifications en cours et le format de sauvegarde courant sont pris en compte.
- [ ] Le code source ajouté ou modifié est en anglais, y compris les noms techniques,
  les commentaires et les diagnostics internes.
- [ ] Les URL de Lunaria Web concernées sont en anglais et les anciennes adresses
  publiées disposent d’une redirection si elles sont remplacées.
- [ ] Les textes affichés aux utilisateurs sont en français.

## Project Structure

[Chemins exacts des modules modifiés. Conserver la structure actuelle du dépôt.]

## Impact Studio → publication → Godot

| Étape | Source / responsable | Changement nécessaire | Vérification |
| --- | --- | --- | --- |
| Édition / enregistrement | Studio | [action ou sans objet motivé] | [preuve] |
| Types / schéma / validation | Studio, source du contrat | [action] | [preuve] |
| Publication / médias | Studio | [action] | [preuve] |
| Lecture et comportement | Jeu Godot | [action] | [preuve] |
| Sauvegarde / reprise | Jeu Godot | [effet sur format courant ou aucun] | [preuve] |

Référence : `docs/CONTRAT_STUDIO_GODOT.md` dans le Studio. Chaque côté garde ses
tâches locales et référence les dépendances de l'autre dépôt. Ne pas lancer une
publication ou une synchronisation de contrat comme simple diagnostic.

## Validation

Références de ce dépôt : `npm run typecheck`, `npm test`, `npm run build` et les scénarios `npm run test:e2e:built -- tests/e2e/<scenario>.spec.ts` concernés après build. Choisir les suites selon les fichiers et le comportement modifiés. Une vérification web seule ne démontre pas le fonctionnement Electron.

[Choisir les commandes nécessaires, l'exemple exporté et les scénarios d'erreur.
Préciser quand un essai Electron ou Android est requis et comment il sera fait.
Les résultats seront consignés dans `validation.md`, avec les limites restantes.]

## Complexity Tracking

[Ne conserver que les écarts réels à la constitution, avec leur justification.
Supprimer les rubriques sans objet et les questions déjà résolues.]
