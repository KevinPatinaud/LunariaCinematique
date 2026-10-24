# Niveau 10 — Faire reculer l’acier

La campagne place ce combat après « Le marché oublié » et avant « La nurserie ». Les plantes doivent dégager le boulevard. Le Compresseur repart intact pour refroidir.

## Endurance et escorte

Chaque poussée est annoncée dans une allée. Les attaques et entraves font monter sa résistance sans retirer de PV. Les trois seuils sont maintenant 1 200, 1 380 et 1 560, contre 320, 368 et 416 dans le premier réglage. L’endurance effective est donc multipliée par 3,75. La réserve initiale de 1 700 graines permet de répartir les défenseurs tout en préparant les changements d’allée ; les récompenses globales des Canettes restent inchangées.

L’escorte attaque les quatre autres allées. Chaque début de poussée envoie deux, puis trois, puis quatre Canettes par autre allée. Les unités sont espacées dans le temps : aucune pile d’apparition instantanée. Des renforts continuent d’arriver sur ces quatre allées toutes les 9, 7,2 puis 6 secondes. Ils continuent pendant la marche arrière. Attendre ne fait pas chauffer le moteur ; un pollueur au refuge provoque la défaite.

Une interruption annule l’attaque en cours, chauffe le moteur et provoque un recul. La dernière provoque la vapeur et le départ. Les Canettes survivantes repartent sans recyclage, mort, combo ni récompense de destruction. La réussite attend que le passage soit libre et verse la prime de vague de 150 graines.

## Dégâts selon la poussée

L’attaque de base reste 52. La première poussée utilise 75 % de cette base, la deuxième 100 % et la troisième 125 %, soit **39 → 52 → 65 dégâts bruts**. Les protections, bonus et affaiblissements s’appliquent ensuite normalement. Cette progression ajoute 25 points de pourcentage de l’attaque de base à chaque interruption ; elle ne multiplie pas le coup précédent par 1,25.

Le palier suit les interruptions du Compresseur. Le Studio affiche les dégâts de toutes les poussées dans ses règles du plateau et recalcule ces valeurs si l’attaque de base change. Les autres ennemis conservent leur puissance.

La puissance est fixée au début de l’attaque et conservée dans sa sauvegarde. Une interruption annule le coup préparé avant de passer au palier suivant. Les limites de validation des attaques et projectiles sauvegardés tiennent compte du multiplicateur maximal de ce boss, y compris en présence d’un bonus de dégâts.

Le test compactor_strength_smoke mesure les pertes de PV sur un vrai Noisetier aux trois paliers et vérifie la reprise d’une sauvegarde au milieu de chaque préparation. Les tests Studio vérifient les valeurs avec une attaque de base modifiée et plusieurs nombres de poussées.

## Prime de graines par poussée interrompue

Chaque interruption du Compresseur accorde immédiatement **150 graines par défaut**, y compris la troisième qui déclenche son départ. Cette prime s’ajoute à la récompense de fin de vague. Le boss reste intact et ne compte pas comme un recyclage.

Le montant se règle dans **Ennemis → Le Compresseur → Règles du plateau → Poussées et surchauffe → Graines par poussée interrompue**. Il accepte un entier de 0 à 10 000 ; 0 désactive la prime. La duplication de l’ennemi, la sauvegarde du projet et la publication conservent ce réglage (rules.pushing.seedReward). Si le champ est absent, aucune prime n’est accordée.

Le paiement appartient au passage de la poussée active vers le recul ou la surchauffe. La phase et le nombre d’interruptions déjà présents dans la sauvegarde empêchent un second versement à la reprise. Les avertissements, la marche arrière, la surchauffe et la sortie finale ne répètent pas la prime. Le gain apparaît près du compteur de graines, avec ou sans mouvements réduits.

Les tests compactor_reward_smoke vérifient les trois versements, 73 et 150 graines, le montant nul ou absent, les sauvegardes avant/après paiement et le cumul avec la prime finale de vague. compactor_reward_visual capture le crédit réel et son affichage en 1280 × 720 et 640 × 360. Le test Electron modifie le montant puis vérifie son enregistrement et sa réouverture.

## Mouvement

La carrosserie reste rigide, y compris pendant les impacts. Le roulement projette la texture de la roue dans son disque en perspective, à partir de l’image d’origine inchangée. La rotation suit la distance réellement parcourue : elle s’arrête lorsque le Compresseur est bloqué, s’inverse en marche arrière et ne dérive pas à la reprise d’une sauvegarde. Le mode de mouvements réduits conserve une roue immobile.

Le démarrage et le recul accélèrent progressivement. Pour changer d’allée, le Compresseur sort entièrement à droite, puis revient dans la nouvelle allée. Il ne glisse plus verticalement à travers les défenseurs. La cinématique suivante utilise un seul acteur qui recule horizontalement : le doublon en miroir et son fondu ont été retirés.

## Roulement du cylindre avant

Le rouleau avant possède maintenant sa propre surface cylindrique animée (visual.rollingDrums). La texture de l’image originale défile sur une surface courbe, tandis que les supports, l’axe, les bords et la carrosserie restent fixes. Son rayon apparent détermine sa vitesse de rotation ; il utilise la même distance parcourue que les roues, y compris le déplacement local d’une attaque. Le recul inverse la rotation et l’arrêt fige sa phase. Le mode de mouvements réduits la fige aussi.

La géométrie est décrite par deux bords : haut, point de courbure et bas, en fractions de l’image. Dans le Studio : Profils, actions spéciales et image de repos → Image de repos et dimensions → Rouleaux cylindriques. Les points doivent descendre et les bords rester dans leur ordre gauche-droite. La duplication et la publication conservent ces réglages.

Godot conserve un cache borné de géométries, avec des pas de rotation inférieurs au pixel à la taille du personnage. Les régions d’atlas sont respectées. Le test rolling_art_visual mesure séparément les pixels de roue et de rouleau et vérifie l’absence de changements hors de leurs surfaces.

## Attaque du rouleau

Le coup dure 0,9 seconde : léger recul de préparation, poussée rapide vers la cible, maintien du contact puis retour progressif. La carrosserie reste rigide, sans rotation ni changement d’échelle. La roue tourne aussi pendant ce déplacement local, même lorsque le Compresseur tient sa position de combat.

Le repère de départ est à 0,405 seconde (45 % du geste), au maximum de l’avancée de 18 pixels. Il déclenche les dégâts ; un repère VFX au même instant soulève la terre sous l’avant du rouleau. Le son d’impact existant suit les dégâts. Le mode de mouvements réduits supprime le déplacement et le roulement.

Le geste utilise le préréglage **Poussée mécanique**, commun au Studio et à Godot. Dans **Ennemis → Le Compresseur → Animations et sons → Attaque → Modifier ici**, la durée, l’intensité et les repères sont modifiables. Le repère de départ doit rester à 45 % de la durée pour garder le contact au sommet du geste.

Les coordonnées logiques du Compresseur ne changent pas pendant le geste. Une interruption annule le coup en préparation. Une sauvegarde en cours de préparation reprend au même instant sans doubler les dégâts. Les tests dédiés sont compactor-attack.test.ts, compactor_attack_smoke et compactor_attack_visual.

## Réglages du Studio

- **Niveaux → 10 - Faire reculer l’acier → Paramètres** : objectif, consigne, terrain et réserve de graines.
- **Ennemis → Le Compresseur → Règles du plateau → Poussées et surchauffe** : résistance, interruptions, avertissement, vitesse de recul, espèce, effectif initial par autre allée et intervalle des renforts.
- **Animations et sons** : mouvement **Roulement mécanique**. Les slots de marche, attente, attaque et impact conservent une carrosserie rigide.
- **Profils, actions spéciales et image de repos → Image de repos et dimensions → Roues et roulement** : centre et rayons de la roue en coordonnées normalisées. Les disques doivent rester entièrement dans l’image. La projection conserve la perspective de la roue, ainsi que les régions d’atlas.

Le contrat utilise rules.pushing.escortCount, escortInterval et visual.rollingParts. Les réglages suivent la duplication de l’ennemi et la publication. Les arrivées générées, leur ordre et le chronomètre de renforts font partie des sauvegardes déterministes du combat.

## Vérification

Les essais utilisent les achats autorisés et les attaques normales. Avant l’ajout de la prime par poussée, trois simulations avec des graines aléatoires différentes ont gagné en 153,9 à 163,7 secondes, en éliminant 100 à 112 Canettes. La défense simple laissée sans intervention perd après une seule interruption ; un placement initial plus complet constitue une autre stratégie possible. Ces mesures vérifient une différence nette avec le premier réglage, sans remplacer l’appréciation du ressenti par un joueur.

Dans le Studio : npm test, npm run build et npx playwright test tests/e2e/compactor.spec.ts. Le test Electron modifie l’effectif, l’intervalle et la roue sur une copie, puis vérifie l’enregistrement et la réouverture.

Dans Lunaria : node tools/test.mjs --suite compactor_smoke, --suite compactor_visual et --suite rolling_art_visual. Le contrôle de pixels montre une rotation limitée au disque de la roue, avec zéro pixel de carrosserie changé. --suite balance compare les stratégies ; --suite compactor_motion_visual produit un extrait de mouvement à 30 images par seconde.

Le terrain actuellement rédigé dans le projet est préservé. Aucun export APK ni essai sur téléphone n’est inclus.
