# Spécifications de fonctionnalités

Créer un dossier avec `$speckit-specify` pour le prochain chantier structurant.
L'installation de Spec Kit ne recrée pas une spécification de tout l'existant.
Le guide est `docs/SPEC_KIT.md` et les principes sont dans
`.specify/memory/constitution.md`.

Un dossier contient `spec.md`, `plan.md`, `tasks.md` et les preuves pertinentes,
dont `validation.md`. Les autres documents ne sont produits que s'ils servent
le changement. L'état local `.specify/feature.json` sélectionne le dossier actif
et reste ignoré par Git ; changer de branche ne sélectionne pas une fonctionnalité.

Pendant le chantier, maintenir l'intention, le plan et les tâches en cohérence
avec les décisions prises. Après livraison, conserver le dossier comme trace
datée et ouvrir un autre dossier pour une nouvelle évolution. Les contrats
courants continuent d'être maintenus à leur source, sans recopier leurs champs
dans tous les dossiers de fonctionnalités.

Pour un chantier commun, employer le même identifiant d'initiative dans les deux
dépôts, lier les dossiers et préciser les dépendances ainsi que les résultats
vérifiés de chaque côté. Les numéros de dossiers peuvent être différents.
