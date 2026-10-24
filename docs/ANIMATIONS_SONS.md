# Animations et sons par action

Sur la fiche d’une plante ou d’un ennemi, **Animations et sons** ouvre les **Actions du personnage**. Chaque action montre son animation, son origine, sa durée et son aperçu. **Ses animations** conserve l’éditeur des images, planches, mouvements et repères personnels.

## Choisir un geste

- **Hériter du profil par défaut** utilise le réglage courant du projet. La sélection indique le nom de l’animation héritée.
- Choisir une animation crée un réglage propre au personnage. Un profil partagé est copié à la première modification.
- **Désactiver cette action** est proposé pour les actions facultatives. Attente, déplacement, attaque, touché, mort et apparition doivent conserver une animation.
- **Créer une version pour…** copie images, ancrages, mouvements et repères ; les identités de l’animation et des repères deviennent indépendantes.
- Les capacités utilisées seulement dans une phase exposent également leur action. La liste reprend les capacités possibles du moteur.

Les profils restent accessibles dans les réglages avancés. Changer de profil réutilise ses réglages. L’éditeur avancé modifie le profil pour tous ses utilisateurs ; les modifications effectuées sur les cartes du personnage sont isolées automatiquement.

## Comprendre le départ et l’impact

Le **repère de départ de l’attaque** déclenche le tir ou le coup direct. Il ne désigne pas l’arrivée d’un projectile sur sa cible. Une capacité peut utiliser ce repère, un délai explicite ou un départ immédiat. Sans repère, le délai de repli reste visible.

La carte indique la capacité, le délai effectif, la vitesse de lecture et la cadence de base. Les plantes utilisent leur cadence, les ennemis une seconde quand la capacité hérite de l’espèce. Une cadence fixe appartient à la capacité. L’accélération du clip réduit aussi le délai de départ. Ces valeurs sont affichées sans bonus, ralentissement ni multiplicateur de phase ; **Régler dans Capacités** rejoint les paramètres de jeu.

Une capacité de soutien personnel instantané qui hérite du geste d’attaque générique conserve l’attente ou la marche dans le jeu. La carte explique cette exception et prévisualise l’attente ; les signaux restent écoutables séparément. Choisir un geste personnel active son animation.

## Comprendre les sons et effets

Ouvrir **Sons et effets** agrandit l’action. Pour chaque événement, la carte montre le son, l’effet visuel et leur source effective. Les canaux sont résolus indépendamment : profil du personnage, capacité, projectile pour l’impact, puis profil par défaut. Un personnage directement lié au profil par défaut utilise ses événements à la première étape également, conformément au moteur.

Un champ vide signifie **hériter**. Si aucun niveau ne fournit de son, le résultat est **Silence**. Pour imposer un silence sur un événement, utiliser un son du catalogue à volume nul ; retirer une référence ne masque pas les autres sources. La position des deux canaux vient du premier signal non vide et est affichée séparément.

Les réglages du personnage s’appliquent à toutes ses capacités pour cet événement. **Rétablir l’héritage des sons et effets** retire cette surcharge. Les repères sonores et visuels de l’animation s’ajoutent aux signaux de la capacité : ils sont listés à part pour rendre un éventuel doublon visible.

L’action **Touché** décrit la réaction du personnage blessé. Le signal d’impact appartient à l’attaquant ; il ne doit pas être configuré comme une réception de coup sur le défenseur.

## Écouter et prévisualiser

L’aperçu d’une action joue son animation, ses repères et les signaux de préparation et de départ. Sa vitesse suit l’ajustement à la cadence. Les signaux d’une attaque directe peuvent être joués au départ ; l’impact d’un projectile dépend de son trajet et s’écoute séparément. Il ne s’agit pas d’un simulateur de bataille.

Un repère placé exactement à la fin est joué une fois. Un délai dépassant le clip reste prévisualisable. Déplacer le curseur reste silencieux. Quitter la vue, remplacer un son ou fermer le panneau des sons arrête ses écoutes. Les boucles de l’aperçu s’arrêtent à la fin du geste. Le catalogue des sons partage le même lecteur d’écoute que les cartes.

Les modifications passent par la session commune : annulation, rétablissement, enregistrement et réouverture conservent leur portée sur le projet entier. Aucun contenu existant n’est réinitialisé à l’ouverture.

## Code et vérification

- `shared/presentation/artisticDefaults.ts` : données artistiques initiales.
- `defaults.ts` : initialisation des anciens documents d’auteur uniquement, sans réécriture d’un catalogue présent.
- `factories.ts` : création explicite d’un geste neutre, indépendante de l’ordre du catalogue artistique.
- `ownership.ts` : copie personnelle et mutations des gestes/signaux, avec limites et refus atomiques.
- `runtime.ts` : résolution commune et provenance des canaux ; `actions.ts` : lecture par action.
- `preview.ts` : franchissement pur des signaux de l’aperçu.
- `SpeciesAction`, `SpeciesAnimations`, `SoundPreview` : cartes, édition personnelle et écoute.
- Godot `animation_registry.gd` : la lecture diagnostique et le jeu utilisent le même résolveur.

Après `npm test`, lancer `node scripts/check-presentation-runtime.mjs`. Le script compare 512 combinaisons de sources et 72 plans de départ avec Godot dans un projet temporaire validé. Il ne publie rien et ne modifie ni le document d’auteur ni le profil du joueur. Les scénarios Electron sont dans `animation-sound-actions.spec.ts` ; les essais natifs supplémentaires dans `presentation_authoring_smoke.gd` et `presentation_audio_smoke.gd`.
