# Lunaria Studio V1.8 — Capacités, effets et projectiles

## Livraison et périmètre

Cette livraison contient deux projets complets : le Studio Electron/React/Node et le jeu Godot actualisé. Ce sont des sources, sans EXE ni APK précompilés. Il faut utiliser les deux projets : le jeu V1.7 n’interprète pas les nouveaux catalogues. Le travail interrompu n’ayant pas été retrouvé, cette version a été reconstruite depuis les deux archives V1.7 fournies dans la conversation.

Le Studio conserve ses deux modes, Cinématiques et Niveaux. Le second possède désormais les sections Campagne, Niveaux, Plantes alliées, Ennemis, Capacités, Effets et Projectiles. La composition de la campagne et les cinématiques sont conservées.

La base fournie comporte 40 niveaux, 28 plantes, 13 ennemis, **40 capacités, 16 définitions d’effet et 3 projectiles**. Les 16 définitions exploitent 13 types d’effet : plusieurs effets peuvent utiliser le même type avec des valeurs différentes.

## Installation

Extraire les deux archives dans de nouveaux dossiers, sans les superposer à des versions antérieures. Garder les anciennes sources. Dans le dossier du Studio contenant `package.json` :

```powershell
npm install
npm test
npm run dev
```

Le projet déclare Node.js >= 22.12.0. La première installation télécharge les dépendances. Aucune dépendance de production supplémentaire n’est introduite par la V1.8 ; les déclarations de React, Electron, TypeScript et Vite de la V1.7 ont été conservées. Le badge affiche V1.8.

Dans Godot, ouvrir `game/project.godot` de la nouvelle archive et laisser les ressources s’importer. Le projet conserve l’indication Godot 4.7 du projet fourni. Le moteur n’était pas disponible dans l’environnement de livraison : compilation, jeu graphique et export restent à vérifier. Aucune police binaire n’est incluse ; conserver localement ses polices si nécessaire aux emplacements habituels du jeu.

## Le principe des trois catalogues

**Une capacité** définit quand agir, sur qui agir et dans quel ordre appliquer ses effets. **Un projectile** définit le déplacement, les contacts et la zone d’impact, mais pas les dégâts. **Un effet** définit le résultat : dégâts, soin, poison, ralentissement, etc.

Une plante ou un ennemi possède une liste d’identifiants de capacités. Une capacité référence des identifiants d’effets et, si nécessaire, un projectile. Chaque définition est enregistrée une seule fois dans le catalogue global. Les niveaux ne peuvent pas redéfinir ces statistiques.

Modifier une définition partagée modifie donc toutes les espèces qui l’utilisent. Le bloc « Utilisé par » indique ses références ; une définition encore utilisée ne peut pas être supprimée. Pour une variante indépendante, dupliquer la définition, la renommer et remplacer l’association concernée. Retirer une association ne supprime pas la définition.

## Premier essai : les épines toxiques

Ouvrir `examples/atelier_capacites.game.json` depuis le mode Niveaux. Il s’agit d’un atelier séparé, pas d’un remplacement automatique de la campagne. Il comporte un niveau, une vague de six ennemis sur l’allée 3, 1 000 graines initiales et trois plantes autorisées.

Radis y référence uniquement la capacité **Épines toxiques**. Elle lance la **Graine traversante**, avec trois contacts maximum, et applique les dégâts de base puis **Poison de l’atelier** : 6 dégâts toxiques à 1, 2, 3 et 4 secondes après un contact, tant que la cible vit. Les résistances peuvent réduire ces dégâts.

Pour construire la même chose soi-même :

1. Dans Effets, créer un poison, lui donner une valeur fixe de 6, une durée de 4 s, un intervalle de 1 s et le type toxique.
2. Dans Projectiles, créer une graine de vitesse 6 cases/s, durée maximale 3 s et 3 contacts. Le rayon de zone reste à zéro pour une simple perforation.
3. Dans Capacités, créer une capacité ciblant un adversaire dans la même allée. Choisir le projectile et ajouter les dégâts de l’espèce, puis le poison.
4. Dans Plantes alliées → Radis, retirer l’ancienne capacité et attribuer la nouvelle. **Ajouter sans retirer l’ancienne ferait exécuter les deux.**
5. Enregistrer le projet, puis publier dans le nouveau projet Godot et relancer le jeu.

La même capacité peut être attribuée à un ennemi. Un projectile ennemi se dirige vers la gauche ; les effets visant les adversaires touchent alors les plantes. Il n’est pas nécessaire de copier la capacité ni d’ajouter un script particulier à l’ennemi. L’atelier conserve par défaut l’attaque de contact des ennemis pour rester simple à examiner.

## Capacités : réglages disponibles

Chaque capacité se déclenche automatiquement pendant une vague, lorsque son délai est écoulé et qu’une cible valide existe. Aucune utilisation n’est consommée sans cible. Les délais sont suspendus entre les vagues et avec la pause du combat. Le délai initial commence lorsque l’élément peut agir en combat, pas au chargement de la scène.

La cadence peut venir de l’espèce ou être propre à la capacité. Pour une plante, la cadence d’espèce est son intervalle d’attaque. Pour un ennemi, elle vaut une seconde par défaut ; choisir une cadence fixe pour la changer. L’attaque ennemie correspond désormais à une valeur par utilisation avec un multiplicateur 1 : les coups standards sont discrets, pas un débit continu de dégâts.

Le ciblage peut viser un adversaire, un allié — porteur inclus — ou uniquement le porteur. Il peut sélectionner une cible ou toutes les cibles dans la zone, avec priorité à la plus proche, au plus grand maximum de PV, ou au plus faible ratio de PV pour un soin. Les attaques adverses regardent vers l’avant ; le soutien peut agir des deux côtés. La portée vient de l’espèce ou d’une distance fixe en cases. Zéro allée adjacente signifie la même allée.

L’application est immédiate ou par projectile. Un projectile vise une cible adverse ; la perforation et la zone du projectile peuvent ensuite atteindre plusieurs entités. Il n’y a pas de projectile de soin dans cette version. Une capacité peut contenir au maximum huit effets distincts, appliqués dans l’ordre affiché. Une espèce peut avoir au maximum huit capacités.

L’ordre compte : briser l’armure avant les dégâts, ou placer une marque de recyclage avant un coup potentiellement fatal. Une fois la cible morte, les effets suivants ne s’appliquent pas. Il n’existe pas de résurrection implicite.

## Effets et statuts temporaires

Types fournis : dégâts instantanés, soin, poison périodique, régénération, ralentissement, immobilisation, étourdissement, affaiblissement, brise-armure, bonus temporaire de dégâts, protection temporaire, purification et bonus de recyclage.

Les valeurs de dégâts et de soin peuvent être fixes, proportionnelles à l’attaque du porteur, ou proportionnelles à sa puissance d’effet. La puissance d’effet d’un ennemi vaut 1 dans cette version ; le champ éditable appartient aux plantes. Les pourcentages restent des valeurs fixes. Les effets sans magnitude, comme l’étourdissement, utilisent leur durée.

Pour les dégâts, choisir le type du porteur ou un type explicite. Le physique subit armure et résistance physique ; le perforant et le toxique ignorent l’armure mais respectent leur résistance ; le pur ignore armure et résistances. Les bonus ou protections temporaires du combat restent des modificateurs distincts. Les soins sont plafonnés aux PV maximum et n’augmentent jamais les caractéristiques de base.

Un effet périodique commence **après son premier intervalle**. Une nouvelle application du même identifiant renouvelle sa durée et remplace sa puissance, sans repousser le prochain déclenchement. Cela évite qu’une aura régulièrement rafraîchie empêche la régénération de se produire. Le même identifiant ne s’empile pas. Des poisons d’identifiants différents peuvent coexister ; pour les pourcentages de même nature, le moteur retient le plus fort, sans les multiplier indéfiniment.

Une purification retire les altérations négatives, sans retirer les bonus alliés. Les statuts ne deviennent jamais des compétences permanentes. Leur durée ne s’écoule pas pendant l’intermission. Le runtime borne le nombre de statuts actifs à 64 par entité ; un nouvel effet au-delà de cette limite n’est pas ajouté.

## Projectiles

Trajectoire droite, dans le sens du camp du lanceur. Vitesse, durée de vie, rayon de contact, nombre de contacts, zone d’impact, allées adjacentes de la zone, couleur et taille sont réglables. La zone n’agit que si son rayon est supérieur à zéro.

Les contacts sont testés sur le segment parcouru, pas uniquement sur la position finale. Un projectile ne touche pas deux fois la même entité. Une perforation peut parcourir plusieurs cibles et une zone atteindre leurs voisines ; les doublons sont évités. Le nombre de contacts va de 1 à 16. Les projectiles expirent ou disparaissent après leur budget de contacts ; le nombre actif est borné à 2 048.

Le rendu fourni est un projectile procédural simple avec couleur et taille. L’association d’images, de particules personnalisées, de sons par capacité et les trajectoires courbes ne sont pas implémentées par ce module.

## Aperçu chiffré

Dans une capacité, ouvrir « Aperçu chiffré d’une utilisation ». Choisir un porteur et une cible pour examiner les dégâts, les soins, les déclenchements périodiques, l’armure et les résistances.

Cet outil est **un calcul d’une utilisation isolée**, pas un second moteur de jeu. La cible part à ses PV maximum. L’aperçu ne simule pas le trajet, les vagues, l’intelligence artificielle, la biodiversité, les autres auras ou les autres utilisations de capacités. Il ne prédit pas la difficulté ou la victoire. Il n’exécute pas Godot en arrière-plan.

## Validation, fichiers et publication

Les noms vides, références absentes, combinaisons de cible incompatibles, délais hors bornes, périodes plus longues que le statut et identifiants dupliqués bloquent l’enregistrement final ou la publication. Le brouillon peut conserver un nom ou une liste d’effets temporairement vide pour permettre de reprendre une édition inachevée. Il n’est jamais publié tel quel.

Le projet de jeu utilise désormais `schemaVersion: 2`. Cette version de schéma est indépendante de celles des fichiers cinématiques. Un document de travail V1.7 est importé avec les catalogues initiaux et ses nouvelles associations lors de son ouverture. L’original n’est pas modifié avant un enregistrement. Vérifier les associations et leurs valeurs après cet import, particulièrement lorsque les anciens comportements avaient été personnalisés.

Le format des cinématiques n’est pas modifié. « Publier la campagne » conserve la publication groupée du parcours, des films et des ressources partagées et ajoute les trois catalogues au même `content/design/game_content.json`. Le nouveau moteur vérifie les mêmes structures et références à son démarrage. Une ancienne cible Godot est refusée si le module de capacités est absent.

Fermer le jeu avant publication. Enregistrer les films en cours. Choisir le dossier contenant `project.godot`, confirmer et laisser terminer. Relancer/importer le jeu après publication : aucun rechargement à chaud n’est introduit. La copie `.bak` et la publication transactionnelle V1.7 sont conservées ; les images ne sont pas embarquées dans le JSON et les nouvelles règles n’exigent aucune copie d’art.

## Ce qui reste dans le moteur

La V1.8 rend configurables les attaques ordinaires, le ciblage de ces capacités, leurs projectiles, les soins et les statuts. Elle n’implémente pas toute la feuille de route : phases et attaques spéciales des boss, capacité de pluie du joueur, bonus de biodiversité, interface, scripts d’événements et logique générale de déplacement restent natifs. Les 28 plantes et 13 ennemis sont les espèces existantes ; créer une espèce dotée de nouveaux visuels ou d’une nouvelle IA n’est pas couvert.

Pour composer un comportement à partir des primitives présentes, pas de nouveau GDScript. Pour ajouter une primitive inconnue du moteur — téléportation, graphe conditionnel, bouclier absorbant un nombre de coups — il faut encore développer cette primitive. Il n’y a pas de graphe visuel dans cette livraison, seulement des formulaires.

Les valeurs de base des espèces sont conservées. La conversion des comportements n’est pas une garantie d’équilibrage identique : auras explicites, coups ennemis discrets et anciennes réactions particulières remplacées par des capacités demandent des essais. Le cactus utilise notamment une capacité de contact périodique, pas un nouvel événement configurable « quand je suis frappé ». Les phases spéciales des boss restent hors de ce catalogue. Tester les missions avant toute distribution.

## Sauvegardes

Profil courant v14, associé à l’empreinte du contenu publié. Les instances sauvegardent leurs délais de capacité, statuts actifs et projectiles en cours, validés avant restauration. Les définitions globales restent immuables.

Aucune conversion d’ancienne partie : une nouvelle empreinte ou un ancien format n’est pas repris. Les anciens fichiers ne sont ni supprimés ni modifiés. Republier le même contenu conserve le profil correspondant. Il ne s’agit pas d’une évolution de compétences : une partie ne modifie jamais les définitions du catalogue.

## Vérifications à effectuer sur le poste de développement

```powershell
# Studio
npm run typecheck
npm run build
npm run test:e2e
# Jeu, depuis le dossier contenant project.godot
node tools/test-game.mjs --static-only
node tools/test-game.mjs --godot "C:/Godot/Godot.exe"
```

Les tests natifs peuvent importer puis lancer les scénarios en mode headless. Le fichier `tests/combat_runtime_smoke.gd` couvre notamment ciblage, dégâts, délais, poison, purification, limites des soins et reprise d’état. Il a été écrit, mais n’a pas été exécuté dans l’environnement de livraison. Voir le rapport pour la distinction entre contrôles effectivement exécutés et tests fournis.
