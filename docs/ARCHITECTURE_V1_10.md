# Lunaria V1.10 — architecture et contrats de présentation

## Responsabilités

`src/shared/presentation` contient les contrats TypeScript, données initiales, schéma, validation, résolution des profils, calculs de poses et collecte des marqueurs cinématiques. Le Studio est l’auteur des choix par espèce. Le runtime ne choisit plus le geste de Radis par un branchement d’affichage.

`src/renderer/presentation` contient les formulaires, listes de frames, import de grilles, aperçus, édition des profils, sons/VFX et composants de sprites cinématiques. `GameEditor` conserve son historique, sa récupération, ses projets récents et sa publication. Les modifications passent par les commandes d’état existantes.

`src/main/presentationAssets.ts` lit les dimensions réelles PNG/JPEG/WebP avant publication. `presentationUsages.ts` lit les cinématiques liées avec l’autorisation de leur dossier. `campaignPublisher.ts` résout la fermeture des références, prépare les ressources et écrit le contenu actif en dernier. Le petit ancien point d’entrée `publishGameProject` délègue à ce même chemin.

Côté Godot, `domain/presentation` est composé du registre, des calculs purs, de l’horloge d’animation et de la validation de l’état sauvegardé. `domain/combat/ability_runtime.gd` planifie les capacités sans texture ni callback graphique. `presentation/animation` dessine les images et effets ; `presentation/audio/catalog_audio.gd` gère les sons. Le pont cinématique réutilise ces lecteurs, sans dépendre d’une instance de combat.

## Espèce → profil → animation

```text
balance.plants / balance.enemies
  animationProfileId  → presentation.profiles[].id
  visual              → sprite de repos + calibrage

profil.slots[{slot, animationId}]
  attack              → radish_throw, bramble_attack, …

combat.abilities[].presentation.slot
  attack              → résolution sur le porteur à l’activation
```

Les profils et animations ont des identifiants stables. Une espèce choisit son profil ; une capacité choisit un slot. Les références partagées ne sont pas recopiées pour chaque niveau. Le document de jeu contient un unique catalogue `presentation` (version interne 1), avec animations, profils, audio, VFX et `defaultProfileId`.

Un slot explicitement présent est prioritaire, même si son animation est vide. S’il est absent, le profil par défaut est consulté. Les slots obligatoires sont idle, move, attack, hit, death et spawn. Les slots ponctuels d’action ne peuvent pas boucler. victory et les slots supplémentaires peuvent être optionnels. Un slot custom demandé par une capacité doit se résoudre chez chaque espèce susceptible de la porter, y compris les capacités de phases.

Le seed comprend 41 profils d’espèces et un profil global, 22 définitions d’animation, trois sons existants et deux VFX. Ce sont des **données d’auteur initiales**, pas un comportement de secours par identifiant dans le rendu Godot. Les nouveaux documents les copient ; modifier un document existant ne réinitialise pas ses choix.

## Images, temps et espace

Une animation contient `kind` (frames/procedural/combined), frames, durées, boucle, ancrage, transformation locale, préréglage, points d’attache et marqueurs. Pour frames/combined, la durée totale est la somme des durées des frames ; `duration` est la durée d’une animation purement procédurale. Le temps est exprimé en secondes, la rotation en degrés, l’opacité de 0 à 1.

Chaque frame référence `library://…` et éventuellement une région entière `{x,y,width,height}` en pixels. Son ancrage normalisé peut remplacer celui de l’animation. Il n’y a pas de PNG découpé produit en plus de la source. Godot met en cache les textures et `AtlasTexture`.

`visual.width/height` définissent la boîte visuelle nominale en pixels ; le ratio de l’image est conservé. `visual.baseline` est un décalage de rendu de combat, jamais une modification de case. Les poses locales ajoutent déplacement, rotation, échelle et opacité à cette présentation. Les collisions et le ciblage restent dans l’espace du combat.

Les points center/feet/head/launch sont normalisés dans le sprite. Ils suivent région, ancrage de frame, miroir, échelle et rotation. La cinématique ajoute son propre placement, déplacement et transformation. Les bulles suivent le point affiché, pas l’ancienne boîte statique de l’image.

La séquence réelle `radish_throw` conserve ses quatre régions et pieds mesurés. Durées : 0,035 / 0,147 / 0,084 / 0,084 s, soit 0,35 s, avec `release` à 0,182 s. Les autres séquences absentes ne sont pas inventées : les fiches décrivent leur repli procédural et utilisent leurs véritables illustrations/atlas existants.

## Libération autoritaire d’une capacité

Le moteur possède un temps de simulation. Pour chaque capacité disponible : sélection des cibles, calcul du plan de présentation, création d’une activation identifiée, lancement du geste et déclenchement du cooldown. Une activation mémorise neuf champs : id, token, remaining, elapsed, speed, slot, power, target_ids et target_team.

Le mode `marker` lit le marqueur sémantique `release` dans les données. Sans marqueur, il utilise le délai explicite `delay` et la validation avertit l’auteur. Le mode `delay` utilise ce délai ; `immediate` libère sans attente. Avec `fitCadence`, un geste plus long que l’intervalle disponible est accéléré : durée visuelle et délai sont divisés par le même facteur. Le cooldown initial existant est distinct du temps de préparation ; l’ancien premier tir instantané à la fin du cooldown reçoit maintenant ce temps de préparation.

Le scheduler traverse les événements de délai/cooldown à l’intérieur d’un pas. Les activations échues sont retirées **avant** leur exécution. Changer de frame, boucler une animation ou restaurer le visuel ne peut pas relancer une capacité. Le projectile mémorise `step_delay`, afin de ne pas parcourir l’intégralité d’un pas durant lequel il n’a été libéré qu’à la fin. Le snapshot contient aussi sa pose locale de libération, uniquement pour son origine affichée.

Une cible morte ou qui n’est plus admissible à la libération n’est pas remplacée implicitement. L’attaque échoue pour les cibles perdues ; son cooldown n’est pas réinitialisé pour autant. Une mort ou un étourdissement annule les préparations. Une phase ou désactivation retire uniquement les activations dont la capacité n’est plus autorisée. Les capacités toujours autorisées continuent leur calendrier, même pendant une transition visuelle.

Les activations simultanées sont indépendantes ; elles partagent un lecteur visuel de corps, pas une timeline multicouche imposée. La première action prioritaire conserve le corps pendant les préparations concomitantes. Limites : 32 préparations par acteur, 512 traversées d’événements par appel, 2 048 projectiles. Les pas usuels du Battle sont bornés ; un appel externe gigantesque n’est pas une promesse de rattrapage illimité.

## États et priorités

La mort est terminale et vide les préparations. L’entité cesse immédiatement d’être une cible active ; le contrôleur de présentation peut conserver une copie visuelle jusqu’à la fin du clip. Le hit est un overlay visuel : transformation et éventuelles frames de hit ne détruisent pas l’attaque en cours. Une transition de phase peut prendre la priorité visuelle sans créer une seconde libération.

Une action ponctuelle revient au slot de base, idle ou move. Seul le système de déplacement change cette base ; les plantes restent idle. En fin de bataille les préparations restantes sont annulées, avec une animation victory lorsqu’elle est disponible. Les cadavres et VFX ne figurent pas dans la simulation active.

L’état d’animation sauvegardé a sept champs : slot, elapsed, speed, base, serial, pending et hit_elapsed. Les formes et références sont strictement validées ; les préparations doivent référencer les timers de capacités autorisés du porteur. Sauvegarde courante v16 seulement, sans conversion d’anciennes sauvegardes joueur.

## Sons et VFX

Les indices d’événement sont spawn/start/release/impact/death/phase_transition. Pour chaque canal son et VFX, la priorité est : profil d’espèce → capacité → projectile → profil global. Un champ vide hérite. Un même événement ne cumule pas automatiquement tous les sons de la chaîne. Lorsque son et VFX proviennent de niveaux différents, l’attache commune retenue est celle du premier indice non vide de la chaîne.

Les marqueurs intégrés au clip sont des événements supplémentaires, explicitement authored. Les mettre au même instant qu’un indice de libération peut produire deux sons : l’atelier retire le son de libération global et place le son dans le clip pour montrer sa réutilisation en film. Les sons ont une catégorie sfx/music/ambience ; ambience utilise le volume des effets. Variation de hauteur au maximum ±20 %, indépendante du générateur aléatoire de gameplay. Volume zéro est silencieux.

Les pools plafonnent les voix à 32 globalement et selon chaque définition, les VFX à 96 globalement et selon leur définition, les cadavres à 64. Pause/reprise, volumes, fin d’entité et sortie de scène nettoient les lectures correspondantes. Les traînées de projectile sont dessinées comme des traces attachées, plafonnées séparément par frame et définition ; elles disparaissent avec le projectile. Elles utilisent quantité, durée de constitution, taille, couleur, intensité et image optionnelle. Ce rendu de trace ne simule pas le préréglage d’explosion d’un effet ponctuel.

Les VFX n’importent pas les services de dégâts. Les marqueurs sont limités à release/sound/vfx, pas à une chaîne de code interprétable. Aucun JavaScript ni GDScript stocké dans un document n’est exécuté.

## Cinématiques et publication

`presentationCatalog` contient `projectId` et `file`. `actor.animation` choisit animation directe ou espèce/slot, avec vitesse. L’image fixe reste valide. La version 4 du format est requise seulement lorsque le nouveau contrat est utilisé. Les séquences de texte progressif/cri et les entrées/sorties existantes sont conservées.

Le film ne lance jamais AbilityRuntime. La collecte des marqueurs ignore release ; avancer le curseur manuellement est également sans effet de gameplay. Les sprites de film réutilisent le lecteur commun, tandis que les transformations d’acteur restent celles du moteur cinématique.

La fermeture publiée comprend le catalogue global unique (y compris les entrées d’auteur conservées), ses frames/sons/VFX, les visuels d’espèces, les projectiles et les films accessibles par campagne ou événements. Une ressource partagée n’est copiée qu’une fois par chemin library://. Deux chemins distincts restent deux identités ; le système ne renomme pas arbitrairement les références parce que les octets sont identiques.

Le préflight contrôle schémas, références, durées, slots, régions dans les dimensions réelles, chemins autorisés, liens symboliques et conflits. Les blobs de films sont adressés par contenu, les ressources identiques déjà présentes sont réutilisées et le document actif est écrit en dernier. Un conflit de fichier existant est refusé, pas écrasé silencieusement. Le CLI cinématique autonome vérifie la liaison au catalogue déjà actif, mais ne remplace pas le préflight graphique complet du Studio pour publier un projet de jeu modifié.

## Validation restante

Les suites Node et tests réels de publication sont consignés dans le rapport. Les fichiers Godot de test, dont le scheduler headless et 50 poses de référence calculées par TypeScript, sont fournis mais **non exécutés ici**. La présence de ces tests ne constitue ni un résultat natif ni une preuve de rendu identique. Les aperçus SVG, le pont Electron et les contrôles Godot doivent être essayés sur la machine de développement.
