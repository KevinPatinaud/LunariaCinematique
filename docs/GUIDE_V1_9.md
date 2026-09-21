# Lunaria Studio V1.9 — comportements, phases et événements

## Livraison et installation

Cette livraison contient deux projets de sources complets : Studio React/TypeScript/Node/Electron et jeu Godot. Ce ne sont pas des exécutables compilés. Extraire chacun dans un **nouveau dossier** plutôt que de fusionner : le système de boss codé en dur est supprimé du jeu. Conserver ses bibliothèques, cinématiques et versions précédentes.

Dans le Studio, au niveau de `package.json` :

```powershell
npm install
npm test
npm run dev
```

Node.js 22.12 minimum est déclaré par le projet. La première installation demande Internet. Le badge indique V1.9. Aucune dépendance supplémentaire n'a été ajoutée par cette version. Pour construire Windows localement : `npm run dist:win` (sortie `release/`). Ce build n'a pas été exécuté lors de la livraison.

Ouvrir `game/project.godot` dans son installation Godot, laisser importer les ressources et lancer F5. Le projet conserve l'indication de version du projet source. Les scripts natifs n'ont pas pu être compilés ni exécutés dans l'environnement de livraison : consulter TEST_REPORT_V1_9.md avant diffusion.

## Ce qui reste identique

Deux modes : Cinématiques et Niveaux. Les cinématiques et leurs animations restent dans leur éditeur. Les niveaux, le parcours linéaire, les 28 plantes, 13 ennemis, capacités, effets et projectiles restent présents. Une difficulté, un seul stade par plante, des compétences fixes et 5 × 8 cases ordinaires. Les phases décrivent une tactique **temporaire de combat**, jamais une évolution achetable ou une statistique permanente. Les plantes restent immobiles.

Le calibrage est commun à toute la campagne. Une fiche d'espèce référence un comportement par identifiant ; un niveau ne recopie ni ses dégâts ni son IA.

## Comportements réutilisables

Dans Niveaux → Comportements, créer, dupliquer et attribuer une définition depuis la fiche Plantes alliées ou Ennemis. Le bloc « Utilisé par » indique les espèces concernées. Un comportement référencé ne peut pas être supprimé. Un comportement de plante ne peut pas être attribué à un ennemi, et inversement.

**Automatique** : toutes les capacités disponibles avec une cible valable peuvent s'exécuter, chacune selon sa recharge. **Règles prioritaires** : la première règle exécutable gagne ; les règles se réordonnent avec les flèches. Une règle sans cible ou dont la capacité n'est pas prête laisse examiner les suivantes.

Les conditions sont une conjonction (toutes vraies) : PV du porteur, capacité prête, cible à portée, temps du combat, vague, ennemis vivants, graines, variable. Les actions d'une règle sont : utiliser une capacité active précise ou la première disponible, avancer, rester immobile, reculer. Le repli s'applique si aucune règle n'aboutit. Le recul ne quitte pas le plateau. « S'arrêter quand une cible adverse est à portée » ne fait pas s'arrêter pour un soin allié.

Exemple : priorité 1, PV ≤ 30 %, reculer ; priorité 2, utiliser une capacité disponible ; sinon, avancer. Un ennemi à distance utilise une capacité à portée plus grande et s'arrête lorsqu'une cible entre à portée. Le système ne déplace pas une entité entre les allées et n'implémente pas de recherche de chemin complexe.

« Essayer une décision » est un aperçu algébrique isolé, pas une simulation Godot. Les PV et la disponibilité sont réglables ; temps 20 s, vague 1, trois ennemis et valeurs initiales des variables sont indiqués à l'écran. Cet aperçu ne mesure pas la difficulté d'un niveau.

## Phases de boss

Une définition peut contenir jusqu'à huit phases. La première est la base à 100 % ; les seuils suivants doivent décroître. Les transitions sont évaluées pendant le combat, à l'activation de l'entité sur le plateau. L'ennemi termine son arrivée hors cadre avant d'activer ses capacités.

Chaque phase définit un multiplicateur de vitesse et de cadence, conserve ou remplace les capacités de base, et ajoute des capacités globales. Les PV maximum et dégâts de référence restent ceux du catalogue. Pour augmenter un impact, configurer une capacité/effet global ou un effet temporaire, pas des statistiques locales de niveau.

Les actions d'entrée jouent une seule fois. Un coup franchissant deux seuils entre dans les phases traversées dans l'ordre. Un soin ne ramène pas à une ancienne phase. Le même principe et les mêmes réglages s'appliquent dans tous les niveaux utilisant ce comportement.

La base contient neuf comportements, dont les six boss. Leurs attaques spéciales sont maintenant des capacités/effets globaux (46 capacités, 25 effets et trois projectiles au total). **Ce ne sont pas des reproductions identiques de l'ancien système de télégraphie/interruption des boss** : rejouer la campagne est nécessaire pour valider l'équilibrage. Les sons et poses existants du jeu restent réutilisés ; il n'y a pas encore d'éditeur de phases d'animation graphique ou de musique personnalisée.

## Événements d'un niveau

Sélectionner un niveau puis l'onglet Événements. Ajouter, nommer, activer/désactiver ou dupliquer une règle. Les événements sont propres au niveau ; les paramètres des entités restent globaux.

Déclencheurs disponibles : début du combat, après un délai, intervalle régulier, début/fin de vague (une vague ou toutes), apparition/mort d'une espèce ou de toute entité, PV d'un ennemi sous un seuil, utilisation d'une capacité, variable ≥ seuil, nombre d'ennemis vivants ≤ seuil. Pour un déclenchement à la dernière vague, sélectionner son numéro. Il n'y a pas de victoire automatique simplement parce qu'aucun ennemi n'est encore apparu.

Les conditions supplémentaires utilisent les mêmes comparateurs, sans choisir implicitement un « porteur » pour un événement de niveau. Un seuil déclenche sur son franchissement ; si une condition supplémentaire n'est pas satisfaite à ce moment, elle ne relance pas seule l'événement plus tard. Utiliser un intervalle pour réévaluer régulièrement une condition. Les apparitions/morts simultanées d'un même pas de simulation sont regroupées en une occurrence de l'événement ; ce n'est pas un script exécuté une fois par ennemi d'un lot.

Par défaut une seule exécution par partie. Les répétitions ont un délai minimum et un budget maximum. Un intervalle en retard est regroupé, sans rafale de rattrapage. Le temps événementiel commence avec la première vague, continue pendant les intermissions et s'arrête pendant une vraie pause ou une cinématique.

Actions : message non bloquant, film, son prédéfini, secousse caméra, renforts, définir/incrémenter une variable, demander une capacité, activer/désactiver une capacité, appliquer un effet global, multiplicateur temporaire vitesse/cadence, lancer la prochaine vague, terminer explicitement le niveau. Les multiplicateurs d'entité se décomptent pendant son activité de combat ; ils restent suspendus hors plateau ou entre vagues, comme les capacités.

Le délai de chaque action s'ajoute au précédent. Plusieurs événements peuvent coexister ; une action de renfort différée à la prochaine vague n'autorise pas les actions suivantes de la même chaîne à la dépasser. Les renforts s'ajoutent au budget de la vague, avec allée déterminée ou aléatoire et intervalle. Maximum 64 par action et 4 096 arrivées par vague. Aucun renfort de boss n'est ajouté en dehors d'une action explicitement définie.

Une demande de capacité ne contourne jamais sa recharge, son attribution, sa disponibilité dans la phase ni ses cibles. Elle est évaluée à la prochaine décision puis consommée ; ce n'est pas une demande en attente permanente. Désactiver/réactiver une capacité est un état de cette partie, sans modification du catalogue.

« Terminer le niveau » force le résultat, même s'il reste des ennemis, et annule les actions suivantes. Une alerte le rappelle. Ne pas l'utiliser comme simple message de victoire. La disparition naturelle de la dernière vague attend la résolution des actions programmées.

## Films pendant le combat

« + Lier une cinématique » ajoute une référence au catalogue sans ajouter d'étape au parcours. Choisir ensuite ce film dans une action. Pour une phase de boss, il doit également être présent dans ce catalogue (le lier depuis le niveau ou le parcours).

Le film suspend le combat, son audio, ses commandes et ses horloges. Après fin ou passage autorisé, le même combat reprend et la chaîne d'actions continue. Il **ne valide jamais une étape de campagne ni une victoire**. La sélection de plans en avance et le bouton Passer sont protégés pour les films non passables. Quitter vers l'accueil ou une erreur conserve le film en attente : Continuer relance sa lecture depuis le début, sans réappliquer les actions précédentes. Les parties enregistrent la file par référence aux définitions, pas des scripts exécutables.

Pour un dialogue bloquant avec bulles, utiliser une courte cinématique. L'action Message est une notification non bloquante. Les sons sont les dix préréglages du jeu ; l'audio/VFX personnalisé et l'éditeur nodal sont hors de cette version. Les secousses respectent l'option de réduction des mouvements.

## Variables

Créer un nombre borné ou un booléen (stocké comme 0/1). Les nombres sont plafonnés aux bornes choisies ; on n'incrémente pas un booléen. Les références sont vérifiées avant publication.

Une variable de niveau repart à sa valeur initiale lors d'une nouvelle tentative. Une variable de campagne est copiée dans la partie, peut y évoluer et n'est validée dans le profil qu'après victoire sur le niveau courant du parcours. Une défaite ou une rediffusion d'un ancien niveau ne modifie pas sa valeur persistante. Une reprise de la même partie garde son état provisoire. La campagne demeure linéaire : pas de branchement de parcours dans V1.9.

## Atelier et publication

Ouvrir `examples/atelier_comportements.game.json`. Il contient un niveau à deux vagues, un Ramasseur à deux phases, une alerte à 12 secondes, un film, des renforts et un compteur de boss vaincus. Choisir `examples/` comme dossier des cinématiques et `example-library/` comme bibliothèque graphique. Le film utilise les images d'exemple existantes.

Enregistrer avant « Publier la campagne », sélectionner le **nouveau** dossier contenant `project.godot`, fermer puis relancer Godot après publication/import. Le publieur inclut les films du parcours, ceux des événements des niveaux retenus et ceux référencés par les phases du catalogue global. Il réécrit leurs références lors de la déduplication, vérifie les ressources, refuse les conflits et active le contenu en dernier. Une image partagée reste un seul fichier dans la bibliothèque du jeu ; aucun nouveau pack d'images n'est requis.

Le document de conception est maintenant `schemaVersion: 3`. Les anciens **documents du Studio** sont complétés à l'ouverture avec les comportements de base puis peuvent être réenregistrés. Ce n'est pas une migration des anciennes parties. Le format des `cinematic.json` ne change pas.

Les sauvegardes de jeu sont au format v15, isolées par l'empreinte du contenu publié. Aucune ancienne sauvegarde n'est cherchée ou convertie. Une modification du contenu crée un autre profil de développement ; republier les mêmes données retrouve son profil. Les polices ne sont pas incluses ; conserver ses fichiers locaux si nécessaire, le jeu possède une police de repli.
