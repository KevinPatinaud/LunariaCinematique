# Niveaux et campagne

La **campagne** définit l’ordre de lecture du jeu : niveaux et cinématiques. La **bibliothèque de niveaux** contient aussi des essais et des copies hors parcours. L’ordre physique des fiches dans le fichier ne définit pas leur ordre de jeu.

## Voir et modifier le parcours

Dans **Niveaux**, les fiches sont affichées dans l’ordre du parcours, puis les niveaux hors parcours. Les filtres permettent de ne montrer que l’un de ces groupes. Le numéro du niveau compte les niveaux jouables ; le numéro d’étape compte également les cinématiques.

Chaque fiche indique **Niveau N · étape M**, l’étape précédente et la suivante. **Voir dans la campagne** ouvre précisément son étape. Les anciennes flèches de rangement des fiches ont été retirées : elles ne déplaçaient pas le niveau dans le parcours du joueur.

**Changer sa place…** choisit un emplacement avant une étape, en fin de parcours ou hors parcours. Déplacer un niveau conserve l’identité de son étape et l’ordre relatif des autres étapes. Le retirer du parcours conserve sa fiche, ses vagues et ses ressources. Il n’est plus inclus dans la campagne publiée.

La vue **Campagne** garde son glisser-déposer, ses positions d’insertion et ses flèches d’étapes. Elle propose aussi **Voir les niveaux hors parcours**. La sélection d’étape est conservée dans le contexte d’historique du projet.

## Fin actuelle de la partie jouable

Dans **Campagne → Insérer ici**, **Insérer la fin actuelle ici** place une carte de fin après un niveau ou une cinématique, ou au début du parcours. Une seule borne est autorisée. Elle se déplace par glisser-déposer, avec **Monter / Descendre**, ou depuis un autre emplacement via **Déplacer la fin actuelle ici**.

Le jeu s’arrête à cette carte et affiche le message de fin de la version actuelle avec le retour à l’accueil. Les étapes suivantes apparaissent comme **Suite en préparation** : elles restent enregistrées, modifiables et testables dans le Studio, mais leur parcours et leurs niveaux ne sont pas publiés. L’aperçu de l’accueil utilise la même limite. Les cinématiques nécessaires aux événements de combat restent publiées lorsqu’elles sont référencées par le contenu jouable.

Déplacer la borne plus loin prolonge la partie jouable. **Retirer du parcours** retire uniquement la borne et rend tout le parcours à nouveau publiable. Ces actions sont annulables et persistées avec le projet. Sans borne, le comportement habituel reste l’arrêt après la dernière étape.

Le contrat utilise une étape `{ "id": "…", "kind": "end" }`. La publication conserve la borne et coupe les étapes suivantes sur une copie. Godot applique aussi cette limite à la lecture de la séquence et conserve le curseur sur la borne après une victoire ou une cinématique terminée.

Après compilation des tests et synchronisation du contrat, `node scripts/check-campaign-boundary-runtime.mjs` vérifie dans Godot les bornes après un niveau, après un film, au début du parcours, déplacées plus loin et chargées depuis un document d’auteur non compilé. Le contrôle vérifie également le scénario habituel de l’écran de fin avec ces bornes. `--out dossier` ajoute une capture du véritable écran de fin et le rapport des vérifications. Les scénarios Electron couvrent l’insertion, le déplacement, Annuler/Rétablir, la réouverture, la publication et le test isolé d’un niveau après la borne.

## Créer et dupliquer

- **Créer un niveau ici**, dans un emplacement d’insertion de la campagne, crée le niveau et son étape en une seule commande, exactement à cet endroit, puis ouvre ses paramètres.
- **+ Créer un niveau**, dans la bibliothèque, place le nouveau niveau après la sélection courante si elle est dans le parcours, sinon en fin de parcours.
- **Dupliquer** permet de nommer la copie et de choisir sa place. Le choix initial est immédiatement après le niveau d’origine, ou hors parcours si l’origine n’est pas placée.
- La copie conserve objectifs, textes, images, plantes, événements, vagues et primes. Le niveau, ses vagues, ses groupes et ses événements reçoivent de nouvelles identités ; les médias sont référencés sans recopier leurs fichiers.

La création respecte le premier ennemi actif du catalogue, y compris son placement obligatoire s’il s’agit d’un ennemi fixe. Les limites de 200 niveaux et de 1 000 étapes sont vérifiées avant insertion. Une destination disparue ne crée pas de fiche partielle.

Ces opérations passent par la session du projet : **Annuler** retire ensemble une création et son insertion, **Rétablir** les restaure. L’enregistrement, la récupération et la réouverture utilisent le même document.

## Changer l’objectif

Le changement passe par une opération de domaine unique. Elle ajuste la cible numérique, les réglages d’escorte, de foyers ou de case protégée, et les placements des vagues si nécessaire.

Une conversion qui retire des réglages existants ou transforme les arrivées des ennemis ouvre **Changer l’objectif du niveau**. Le récapitulatif montre ce qui sera transformé, le nombre de vagues, groupes et ennemis concernés, et le traitement de la consigne. **Garder l’objectif actuel** ne modifie rien. **Appliquer le nouvel objectif** produit une seule commande annulable.

Passer au plateau occupé fixe les groupes sur des cases et met délais/intervalles à zéro. En sortir rétablit des arrivées de vagues ; les ennemis mobiles perdent leur placement et l’intervalle est d’au moins 0,1 seconde. Les anciennes valeurs de timing ne sont pas inventées : pour retrouver exactement l’état précédent, utiliser Annuler.

Les effectifs et identités des groupes, l’image du terrain, les textes rédigés et les primes sont conservés. Les réglages propres à un objectif retiré sont supprimés explicitement après le récapitulatif. Une cible protégée nouvellement créée demande toujours une image avant publication.

## Consigne automatique ou rédigée

Le champ optionnel `objectiveTextMode` vaut `automatic` ou `custom`. Son absence signifie **texte rédigé**. Le Studio ne compare plus le contenu d’une phrase avec d’anciennes valeurs par défaut pour décider de la remplacer.

Les nouveaux niveaux utilisent une consigne automatique liée à l’objectif. La modifier dans le champ texte la transforme en consigne rédigée. La case **Consigne automatique** permet de revenir explicitement à la formulation proposée. Le changement reste annulable.

Les projets existants conservent leurs phrases, même si elles sont identiques à une ancienne consigne automatique. Aucun reclassement ni remplacement n’est fait à l’ouverture. Lors de la publication, une consigne automatique est matérialisée dans `objectiveText` pour le jeu ; le document source reste inchangé.

## Régler les graines

Le montant d’une prime de vague se règle uniquement dans **Niveaux → Vagues & ennemis → Graines pour la vague éliminée**. Les graines de capture d’allée restent avec les paramètres de l’objectif. Les récompenses par ennemi restent sur sa fiche.

**Niveaux → Comparer les graines** présente les graines de départ, les montants par vague, le total prévu et la prime par allée. Les boutons ouvrent directement la fiche du niveau à régler. Zéro désactive une prime ; une prime de vague absente conserve la valeur par défaut de 50 graines. Les graines au recyclage des ennemis ne sont pas incluses dans ces totaux. Il n’existe plus de bonus de graines pour les combos.

## Code et vérification

- `shared/game/levelManagement.ts` : placement, création, duplication, suppression, ordre d’affichage et lecture des primes.
- `shared/game/levelObjectives.ts` : consignes et préparation pure des changements d’objectif.
- `LevelPlacement.tsx` et `LevelObjectiveEditor.tsx` : interfaces propres à ces opérations ; les longs gestionnaires correspondants quittent `GameEditor`.
- `compileCampaign` : conserve le parcours choisi, exclut les niveaux hors parcours et résout les consignes automatiques sans réécrire les textes rédigés.
- Le schéma et les validateurs JavaScript partagés sont synchronisés dans le jeu ; aucun format de sauvegarde joueur n’est changé.

Après `npm test`, `node scripts/check-level-runtime.mjs` charge dans Godot un instantané temporaire validé : les huit objectifs, une copie placée, une copie hors parcours et des cinématiques intercalées. Le contrôle compare ordre, consignes, primes et progression réelle. Les scénarios Electron sont dans `tests/e2e/levels-campaign.spec.ts`.

## Combat de repli

L’objectif **Contraindre un boss au repli** et les règles **Poussées et surchauffe** sont décrits dans [Niveau 10 — Le Compresseur](COMPRESSEUR.md).
