# V1.4.1 — Lire depuis le plan sélectionné

## Utilisation

Dans la barre du haut, deux boutons sont maintenant affichés côte à côte :

- **Lire depuis ce plan · 03** : commence au début du plan sélectionné, puis lit les plans suivants jusqu’à la fin. Le petit numéro correspond à la vignette sélectionnée. Son survol donne le nom du plan de départ.
- **Tout lire** : commence au premier plan, quelle que soit la sélection.

Sélectionner une vignette du storyboard, puis cliquer sur **Lire depuis ce plan**. Le lien déjà présent au-dessus du storyboard reste disponible.

**Maj+Espace** démarre également la lecture depuis le plan sélectionné, hors champ de saisie et hors fenêtre modale. Ce raccourci fonctionne immédiatement après avoir cliqué sur une vignette. Pendant la lecture, Espace conserve son rôle de passage à la réplique suivante. Le raccourci existant Espace en édition reste inchangé : lecture complète lorsque le focus n’est pas dans un contrôle ayant son propre comportement clavier.

**Échap** ou **Quitter l’aperçu** revient au plan qui était sélectionné avant la lecture. **Rejouer**, à la fin, repart du même plan de départ que l’aperçu précédent, pas systématiquement du premier plan.

La lecture commence au temps zéro du plan, avec ses transitions, ses mouvements, son audio et sa première réplique. Il ne s’agit pas d’une lecture de ce seul plan en boucle ni d’une reprise à un instant au milieu du plan.

Le point de départ est résolu à partir de l’identifiant du plan : sa réorganisation dans le storyboard met à jour le numéro sans changer le plan choisi. Les ressources des plans antérieurs ne sont pas ajoutées aux ressources requises pour cet aperçu.

## Installation du correctif sur V1.4

1. Fermer complètement l’éditeur et arrêter son terminal avec **Ctrl+C**.
2. Garder une copie du dossier de sources actuel, notamment en cas de modifications personnelles.
3. Décompresser le correctif, puis fusionner le **contenu** du dossier `lunaria-cinematic-studio` avec le projet existant, au niveau de son `package.json`.
4. Accepter les remplacements, sans créer un deuxième dossier `lunaria-cinematic-studio` imbriqué.
5. Conserver `node_modules`, `package-lock.json`, la bibliothèque et les fichiers de cinématiques.
6. Relancer `npm run dev`. Le badge affiche **V1.4.1**.

Aucune dépendance ajoutée ou mise à niveau ; pas de réinstallation nécessaire pour appliquer le correctif à une V1.4 qui fonctionne. La version du package est maintenant 1.4.1 ; `npm install` peut synchroniser la métadonnée de version du lockfile lors de la prochaine installation habituelle.

## Archive complète

L’archive complète est autonome en sources, mais ne contient pas d’exécutable Windows précompilé ni `node_modules`. Pour une installation séparée : extraire dans un nouveau dossier, puis `npm install`, `npm test` et `npm run dev`.

## Compatibilité

Aucun changement du format JSON v1/v2, des références `library://`, des assets, du protocole Electron ou du lecteur Godot. Aucune migration de cinématique, aucune copie d’image et aucune mise à jour de l’addon Godot ne sont requises **par ce correctif V1.4.1**. Les prérequis du lecteur V1.4 pour les cinématiques v2 restent inchangés.

## Validation

Voir `TEST_REPORT_V1_4_1.md` pour les essais effectués et leurs limites.
