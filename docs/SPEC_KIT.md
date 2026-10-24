# Spec Kit — Lunaria Studio

## Installation retenue

- Specify CLI **1.2.3**, intégration **Codex**, scripts **PowerShell**.
- Skills versionnés sous `.agents/skills/` ; infrastructure sous `.specify/`.
- Constitution : `.specify/memory/constitution.md`.
- Templates Lunaria sous `.specify/templates/overrides/` ; les templates amont
  restent intacts. La résolution officielle donne priorité aux overrides.
- Le CLI est accessible avec `.specify/specify.ps1`. Le lanceur installe au
  premier besoin la version fixée dans un environnement Python isolé sous
  `%LOCALAPPDATA%/Lunaria/SpecKit/1.2.3/venv`, partagé par les deux dépôts.
  Python 3.11+ et le lanceur Windows `py` sont requis pour le recréer.
- Les hooks natifs sont désactivés (`--events false`). Aucune extension de
  gestion Git ou de publication n'est installée par cette adoption.

Depuis la racine `C:/dev/Lunaria cinematic studio` :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .specify/specify.ps1 version
powershell -NoProfile -ExecutionPolicy Bypass -File .specify/specify.ps1 integration status --json
```

Le lanceur fixe le répertoire de travail au dépôt qui le contient. Les packages
ne sont ajoutés ni à l'application ni à ses dépendances de compilation.

## Quand utiliser le processus

Utiliser Spec Kit pour une fonctionnalité, un changement de contrat, une refonte
ou un chantier qui traverse plusieurs composants. Une petite correction locale,
un équilibrage ou une retouche peut rester une modification directe avec le
contrôle adapté. Éviter de multiplier les documents pour remplir des modèles.

Ouvrir un chat Codex ayant ce dépôt comme répertoire de travail pour charger les
skills du projet. Un chat déjà ouvert peut nécessiter une nouvelle ouverture
pour les découvrir. Dans le chat, les commandes sont des skills, pas des
commandes PowerShell :

```text
$speckit-specify Décrire la prochaine fonctionnalité et ses critères de réussite.
$speckit-plan Réutiliser l'architecture existante et examiner les impacts Studio/Godot.
$speckit-tasks
$speckit-implement
$speckit-converge
```

Utiliser `$speckit-clarify`, `$speckit-analyze` ou `$speckit-checklist` quand cela
est utile. La constitution initiale est déjà rédigée ; `$speckit-constitution`
sert à la faire évoluer. Les phases gardent des résultats consultables ; elles
n'ajoutent pas de confirmations répétées lorsque la demande autorise le travail.
Une information indispensable réellement manquante reste à demander.

## Travailler sur les deux dépôts

Lire la [référence commune du contrat Studio → Godot](CONTRAT_STUDIO_GODOT.md).
Le Studio possède les formats ; le jeu possède leur exécution GDScript.
Chaque dépôt conserve sa constitution et ses tâches. Une initiative commune
relie les spécifications, les dépendances et les versions vérifiées.

Décrire au minimum le résultat utilisateur, l'effet sur les données publiées,
la partie à adapter dans chaque dépôt et la preuve de cohérence. Une
synchronisation des modules TypeScript ne valide pas le moteur Godot.
L'installation de Spec Kit ne publie aucune campagne.

## Vérifier un changement

`npm run typecheck`, `npm test`, `npm run build` et les scénarios `npm run test:e2e:built -- tests/e2e/<scenario>.spec.ts` concernés après build. Choisir les suites selon les fichiers et le comportement modifiés. Une vérification web seule ne démontre pas le fonctionnement Electron.

Pour un changement de format, de publication ou de mécanique, ajouter les
contrôles du consommateur et un exemple représentatif dans un projet de test
isolé. Les essais Electron et téléphone sont choisis selon le changement.
Les commandes de génération/synchronisation et leur caractère écrivant sont
détaillés dans la référence commune.

Consigner commandes, résultats et limites dans le dossier de fonctionnalité.
Une suite non exécutée reste signalée comme telle. Ne pas confondre build,
publication, installation sur téléphone et comportement observé sur Android.

## Git et entretien

Les dossiers `.agents/skills/`, `.specify/` et `specs/` font partie des sources
versionnables. Le sélecteur actif `.specify/feature.json` est local et ignoré.
Les branches actuelles sont conservées ; Spec Kit n'est pas chargé de les gérer.
Les dossiers de fonctionnalités terminées restent des traces datées, selon
`specs/README.md`. Les guides courants et schémas sont mis à jour à leur source.

Pour une mise à jour, choisir explicitement la nouvelle version du CLI et du
lanceur, préparer les nouveaux fichiers dans un dossier de travail isolé,
comparer les manifestes et préserver constitution et overrides. Contrôler
ensuite `integration status --json` et le parcours de création de fonctionnalité.
Ne pas relancer une initialisation forcée sur les modifications en cours.

Sources amont : [Spec Kit v1.2.3](https://github.com/github/spec-kit/releases/tag/v1.2.3),
[adoption sur un projet existant](https://github.github.io/spec-kit/guides/existing-projects.html),
[intégration Codex](https://github.com/github/spec-kit/blob/v1.2.3/docs/integrations/codex.md).
