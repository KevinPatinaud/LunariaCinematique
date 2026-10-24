# Instructions — Lunaria Studio


## Cadre commun Lunaria

- Le jeu Android est dans `C:/dev/Lunaria` ; le projet Godot est `game/project.godot`.
- Le Studio est dans `C:/dev/Lunaria cinematic studio`.
- L'histoire et le projet d'auteur sont sous `C:/dev/Lunaria/HISTOIRE DE LUNARIA/`,
  notamment `Cinematiques studio/lunaria.game.json`.
- La bibliothèque source est `C:/dev/Lunaria/LunariaArtLibrary`. Tout déplacement
  ou renommage de média doit être répercuté dans les projets et cinématiques.
- La compatibilité des sauvegardes d'anciennes versions n'est pas exigée pour
  l'instant. Ne pas ajouter de migration sans besoin exprimé ; préserver le
  fonctionnement et la validation du format courant.
- Git assure le suivi. Conserver les modifications en cours et examiner l'état
  du dépôt avant toute opération qui pourrait les remplacer.

## Utilisation de Spec Kit

Lire `docs/SPEC_KIT.md` et `.specify/memory/constitution.md` pour un chantier
structurant : nouvelle fonctionnalité, changement de contrat, refonte ou travail
qui traverse plusieurs composants. Utiliser les skills du projet dans
`.agents/skills/` : `$speckit-specify`, `$speckit-plan`, `$speckit-tasks`,
`$speckit-implement`, puis `$speckit-converge`. Clarifier ou analyser seulement
lorsque cela aide à lever une incertitude ou vérifier la cohérence.

Une petite correction locale, un réglage ou une retouche peut être traité
directement avec une validation proportionnée. La demande autorise ses étapes
nécessaires ; ces instructions n'ajoutent pas de demandes systématiques de
confirmation entre phases. Rédiger les documents de travail en français.

Pour un changement Studio/Godot, lire `docs/CONTRAT_STUDIO_GODOT.md` dans le dépôt
Studio, identifier les deux côtés et relier leurs spécifications par une
initiative commune. Conserver une seule définition de chaque contrat, à sa
source. Une réussite TypeScript ne valide pas le comportement GDScript.

Les schémas, validateurs et lecteurs actuels sont les preuves du comportement
implémenté. Si un guide les contredit, constater l'écart et résoudre la question
pour le périmètre concerné ; ne pas transformer une phrase historique en exigence.
Les tests emploient des données et profils isolés. Une synchronisation de contrat
ou une publication est une écriture distincte, jamais un simple contrôle en
lecture seule. Consigner les vérifications réalisées et leurs limites.

Les instructions explicites de l'utilisateur et les règles de l'environnement
priment sur les modèles et les exemples fournis par Spec Kit.


## Repères de ce dépôt

- Racine : `C:/dev/Lunaria cinematic studio`.
- Stack : Electron, React et TypeScript ; Node >= 22.12.0.
- Architecture : `docs/ARCHITECTURE.md`.
- Le renderer React utilise le preload et ne lit pas directement le disque. Les formats et calculs partagés restent dans `src/shared/`. Les écritures, autorisations de médias et publication appartiennent au processus principal. Les modes Cinématiques et Niveaux éditent un même document avec historique, annulation et enregistrement atomique.
- Vérifications de référence : `npm run typecheck`, `npm test`, `npm run build` et les scénarios `npm run test:e2e:built -- tests/e2e/<scenario>.spec.ts` concernés après build. Choisir les suites selon les fichiers et le comportement modifiés. Une vérification web seule ne démontre pas le fonctionnement Electron.
