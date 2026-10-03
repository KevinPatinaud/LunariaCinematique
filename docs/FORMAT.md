# Contrat de lecture · cinematic.json v1 à v4

Le contrat exécutable est [cinematic.schema.json](cinematic.schema.json), généré depuis `src/shared/schema.ts`. Ce guide est actualisé au 2 octobre 2026 ; les sections v1/v2/v3 décrivent les extensions encore lisibles, pas un lecteur limité à v3. Exemple complet : `examples/serre.cinematic.json`. Les JSON esquissés pendant la conception ne constituaient pas un ancien format publié : le format implémenté utilise **schemaVersion**, et non `version`.

## Racine et chemin des assets

```json
{
  "schemaVersion": 1,
  "id": "CIN_PROLOGUE",
  "title": "Le réveil",
  "stage": { "width": 1600, "height": 900 },
  "shots": []
}
```

Ce fragment illustre la racine ; un document valide contient au moins un plan. Le canevas logique est fixe en 1600×900. Les boîtes sont enregistrées en coordonnées relatives (`x`, `y`, `width`, `height`) ; la taille de texte est exprimée en pixels logiques. Les écrans d'autres proportions utilisent un cadrage 16:9, pas une déformation indépendante de X/Y.

Une référence est un chemin relatif exact, par exemple :

```text
library://01_europe/lunaria/interieur_serre/greenhouse_aisle_wide_variant_v01.png
```

La racine Windows est uniquement dans les réglages locaux de l'éditeur. Les séparateurs JSON sont `/`, y compris sous Windows. Unicode, espaces et casse sont conservés. Les chemins absolus, `..`, `.` et liens symboliques sortant de la racine sont refusés. Les références sont sensibles à la casse sur les plateformes qui le sont ; éviter deux fichiers ne différant que par la casse.

L'éditeur accepte PNG, JPG/JPEG, WebP pour les images ; WAV, OGG, MP3 pour l'audio. Une entrée animée déplace une image entière. Un GIF n’est pas interprété comme une animation de personnage. Une spritesheet se découpe par régions dans le catalogue d’animations ; l’image fixe d’un acteur n’est pas découpée automatiquement.

## Plan

Un plan contient `id`, `name`, `duration`, `background`, `camera`, `transition`, `actors`, `bubbles`, `dialogueStart` et `audio`. Il peut aussi contenir `exitTransition`.

`duration` est la durée **minimale**, en secondes. La caméra atteint son état final à cet instant. Le plan ne s'achève que lorsque cette durée est atteinte **et** que toutes ses bulles ont été terminées. Sans bulle, il se termine à la durée indiquée.

`dialogueStart` indique le début de la première bulle. Il ne peut dépasser la durée du plan. Les bulles suivantes commencent quand la précédente est avancée. Clic/Espace passe à la suivante, sauf avant le début des dialogues ou pendant une pause. Le mode automatique utilise `advance.seconds`. Un clic peut également avancer une bulle automatique.

Le décor peut être absent dans un brouillon (`asset: null`). `cover` remplit la scène en recadrant, `contain` montre l'image entière sur un fond sombre. Une scène enregistrée sans décor reste valide mais déclenche un avertissement.

Caméra : `fixed`, `zoom_in`, `zoom_out`, `pan_left`, `pan_right`, `pan_up`, `pan_down`. `intensity` va de 0 à 1. Les zooms/panoramiques interpolent avec smoothstep. Les bulles restent en coordonnées écran ; les pointes attachées suivent le personnage transformé par la caméra.

`transition` : `cut` ou `fade`. `fade` est un fondu **depuis le noir au début du plan**. `exitTransition` utilise les mêmes valeurs : `fade` noircit le plan à sa sortie, après la durée minimale et toutes les répliques. Sa durée (au plus 3 s) s'ajoute au temps du plan. Si le passage au plan suivant attend un clic, ce clic déclenche le fondu. Un document sans `exitTransition` conserve une sortie par coupe. Il n'y a pas de chevauchement temporel de deux plans.

Audio : `null` ou `{asset, volume, loop}`. La piste commence à l'entrée du plan, s'arrête à sa sortie et se met en pause avec le lecteur. Le même fichier affecté au plan suivant redémarre, sans continuité garantie.

## Personnage / ennemi / objet

`asset` est une référence à son image. Les coordonnées désignent le coin supérieur gauche de sa boîte ; largeur et hauteur sont normalisées. La sélection et les poignées agissent sur cette boîte, donc une grande marge transparente dans le PNG compte dans le placement.

`flipX` inverse le dessin horizontalement. `opacity` va de 0 à 1. L'ordre de `actors` est l'ordre de dessin : le dernier est devant.

`entry` comporte `preset`, `duration`, `delay`. Les valeurs sont `none`, `fade`, `left`, `right`, `bottom`. L'emplacement enregistré est la position finale. Un délai masque le personnage jusqu'au début de l'entrée.

## Bulle

`kind` : `speech` ou `narration`. `style` : `parchment`, `plain`, `simple`, `ornate`.

`simple` et `ornate` nécessitent `frameAsset` vers l'un des deux cadres reconnus. Les autres styles sont dessinés sans texture. `speakerId` désigne l'ID d'une instance de personnage **dans le même plan**, pas un nom global tel que « rose ».

`tail.mode` : `auto`, `manual`, `none`. Automatique exige un personnage valide. Manuel utilise les coordonnées relatives `tail.x` et `tail.y`. Une narration n'affiche pas de queue. Une pointe située dans la bulle n'est pas dessinée.

`autoHeight` adapte la hauteur à la largeur et au texte. Le redimensionnement direct désactive cette option ; on peut la réactiver dans l'inspecteur. La V1 n'ajuste pas silencieusement la taille de police pour faire rentrer un texte trop long : elle affiche un avertissement.

À l'enregistrement, `lines` contient les lignes calculées et `height` la hauteur effective. Le lecteur Godot V1.2 régénère ces champs dérivés avec le même algorithme déterministe, y compris si un fichier manuel omet les lignes ou en conserve une ancienne version. Le calcul utilise des métriques approximatives déterministes ; il ne remplace pas la vérification de la police et de la lisibilité dans le jeu.

## Validation et sauvegarde

Les propriétés inconnues, versions futures, identifiants répétés, nombres hors limites et liens de personnages incohérents sont refusés. La limite est 5 Mio pour le JSON sérialisé. Les références inexistantes peuvent être conservées dans un brouillon, mais bloquent la prévisualisation. La vérification de présence ne certifie pas le contenu ou la qualité artistique du PNG.

L'enregistrement passe par un fichier temporaire frère, écriture/synchronisation, puis remplacement ; la version précédente est conservée en `.bak`. Une récupération distincte est enregistrée dans les données utilisateur de l'application, après environ 300 ms sans modification. La V1.2 utilise une file d’écriture et des jetons de document ; la fermeture explicite peut demander une récupération immédiate du dernier état. Ce n’est pas un système de versions : conserver aussi les cinématiques dans Git.

Les IDs sont stables au fil des sauvegardes. La duplication d'un plan recrée ses IDs et recâble ses liens de bulles. La suppression d'un personnage détache ses bulles.

Aucun script arbitraire ni commande système n'est exécuté depuis le JSON. Les événements de quête et changements de scène restent à raccorder côté jeu au signal `finished` ; ils ne sont pas définis dans le format v1.


## Précisions V1.2

Le nombre de lignes dérivées autorisé est porté à 1501 pour couvrir le texte maximal de 1500 caractères, y compris les sauts de ligne. La hauteur automatique est bornée à 1800 pixels logiques et un dépassement est signalé ; le texte n’est pas tronqué. Cela autorise l’enregistrement d’un brouillon à corriger, pas une garantie de lisibilité de 1500 lignes.

Les rôles image et audio sont vérifiés séparément. L’ouverture conserve une empreinte du fichier lu ; une modification externe détectée demande Enregistrer sous au lieu d’écraser le fichier. Cette vérification n’est pas un mécanisme de coédition multi-processus.

## Extension v2 : objets et mouvements (éditeur V1.4)

L’extension v2 introduit `schemaVersion: 2` ; le lecteur courant accepte aussi 1, 3 et 4. Les nouveaux champs d’acteur ci-dessous sont optionnels pour la compatibilité des anciennes scènes. Leur présence exige la version 2, même si l’effet est désactivé. Le format 1 n’est pas utilisé pour faire passer silencieusement des paramètres inconnus aux anciens lecteurs.

```json
{
  "role": "prop",
  "rotation": 0,
  "pivot": "top",
  "motion": {
    "preset": "sway", "intensity": 0.35, "period": 3,
    "delay": 0, "loop": true, "reverse": false
  },
  "movement": {
    "enabled": true, "dx": 0.2, "dy": 0,
    "duration": 3, "delay": 0, "easing": "smooth", "repeat": "once"
  }
}
```

Ce fragment complète un acteur existant : il ne remplace pas ses champs `asset`, boîte, opacité, miroir, identifiant et entrée. `role` vaut `character`, `enemy` (depuis V1.4.2) ou `prop`, l’absence équivaut au personnage hérité. `rotation` est en degrés (−180 à 180). `pivot` vaut `center`, `top` ou `bottom`, toujours au centre horizontal. Il utilise les dimensions complètes du PNG, marges transparentes comprises.

`motion.preset` : `none`, `float`, `sway`, `pulse`, `spin`, `shake`, `bounce`. Amplitude 0…1, période 0,2…60 s, délai 0…300 s. Les effets sont déterministes à partir du temps du plan. La rotation continue fait un tour par période et ne dépend pas d’`intensity`. Un cycle non bouclé revient à la pose de repos.

`movement` : décalages normalisés −3…3, durée 0,1…300 s, délai 0…300 s ; `smooth` ou `linear` ; `once` maintient l’arrivée, `pingpong` parcourt des branches de même durée en boucle. Les délais commencent après la fin de l’entrée. Le trajet et l’effet se superposent ; les paramètres de l’acteur ne sont jamais réécrits à chaque frame.

Ordre de transformation : calcul entrée + translation du trajet + décalage de l’effet, puis transformation autour du pivot (angle statique + effet, taille uniforme) et miroir local de la texture. La caméra est appliquée ensuite. Les queues automatiques utilisent le point (0,5 ; 0,22) de l’image après ces mêmes transformations.

Source exécutable de l’éditeur : `src/shared/motion.ts`. Port GDScript : `CinematicMotion.gd`. Exemple complet validé : `examples/objets_mouvements.cinematic.json`.

## Extension V1.4.2 : rôle ennemi

`enemy` est une valeur supplémentaire de `actors[].role` dans le schéma v2 livré avec cette version. Sa présence déclenche la même mise à niveau v1 → v2 que les autres rôles. La structure de l’acteur et les références `library://` restent inchangées. Les vieux lecteurs validant l’ancienne énumération doivent être mis à jour ; le numéro 2 ne suffit pas à leur faire accepter cette nouvelle valeur.

Ce rôle distingue la mise en scène d’un ennemi sans activer de gameplay. Il est indépendant du dossier de l’image : une image de `07_props` peut être utilisée comme ennemi tout en restant à cet emplacement. Les acteurs hérités sans rôle conservent leur sémantique de personnage à l’ouverture.


## Extension V1.5 : animations v3

`schemaVersion: 3` est requis si un acteur comporte `exit`, une entrée `top/pop/zoom`, un effet `nod/recoil/heartbeat/flutter`, ou si une bulle comporte `textAnimation`. Les documents v1/v2 sans ces champs restent valides. Un fichier déjà v3 n’est jamais rétrogradé automatiquement.

Fragment ajouté à une bulle existante :

```json
{
  "textAnimation": {
    "reveal": "typewriter", "effect": "none", "speed": 32,
    "delay": 0, "duration": 0.6, "intensity": 0.35, "loop": false
  }
}
```

`reveal` : instant/typewriter/words/fade ; `effect` : none/shout/wave/shake/bounce. Vitesse 0,5…120 graphèmes ou groupes de lecture par seconde ; délai 0…30 s depuis cette réplique ; durée/cycle 0,1…10 s ; intensité 0…1. Le cri est toujours ponctuel, même si un fichier édité manuellement indique `loop: true`. Un effet bouclé n’empêche pas de continuer. Le champ `text` reste du texte brut, non interprété comme HTML/BBCode.

Durée de révélation : nombre de graphèmes/vitesse pour typewriter, nombre de groupes/vitesse pour words, durée pour fade, zéro pour instant. Temps d’introduction = délai + maximum entre révélation et premier cycle de l’expression. Le temps `advance.seconds` commence ensuite. Compléter par un clic conserve les horloges du plan et des acteurs mais raccourcit l’introduction de cette bulle. La bulle suivante repart à une horloge nulle.

Fragment ajouté à un acteur :

```json
{
  "exit": { "preset": "fade", "start": 4, "duration": 0.8 }
}
```

`preset` : none/fade/left/right/top/bottom/shrink ; début absolu 0…300 s depuis le plan ; durée 0,1…10 s. Le mouvement sous-jacent est figé au début de sortie ; la pose de sortie est évaluée à partir de cet état. Après la durée, l’opacité vaut zéro. Avec `none`, le bloc n’a pas d’effet visuel.

Les nouveaux presets de `motion` gardent exactement les bornes, pivots et délais existants. Le recul respecte le miroir de l’image. Les calculs sont déterministes et n’emploient aucun générateur aléatoire par image. Sources : `textSegments.ts`, `textAnimation.ts`, `motion.ts`, et leurs ports dans l’addon. Exemple complet : `examples/animations_texte.cinematic.json`.

## Effets d’acteur supplémentaires — 2 octobre 2026

Ces valeurs complètent les préréglages précédents pour les personnages, ennemis et objets et exigent `schemaVersion: 3` au minimum. Elles transforment l’image entière, y compris lorsqu’une animation de catalogue fournit l’image courante. Elles n’exigent aucun nouvel asset et conservent les réglages de durée, délai, intensité, sens et répétition existants.

| Champ | Valeur JSON | Libellé dans le Studio | Mouvement |
|---|---|---|---|
| `motion.preset` | `orbit` | Orbite | Trajectoire elliptique depuis la position de repos |
| `motion.preset` | `figure8` | Vol en huit | Trajectoire en huit |
| `motion.preset` | `zigzag` | Zigzag | Allers-retours latéraux |
| `motion.preset` | `tumble` | Roulade | Rotation avec déplacement puis retour au repos |
| `motion.preset` | `surprise` | Sursaut | Saut bref, variation de taille et inclinaison |
| `motion.preset` | `jelly` | Oscillation élastique | Oscillation amortie de taille et de rotation |
| `entry.preset` | `drop` | Chute rebondie | Arrivée par le haut avec rebond |
| `entry.preset` | `spiral` | Tourbillon | Apparition en rotation |
| `entry.preset` | `rise` | Éclosion | Apparition ascendante |
| `exit.preset` | `spiral` | Tourbillon | Disparition en rotation |
| `exit.preset` | `rise` | Envol en fondu | Montée avec disparition progressive |
| `exit.preset` | `fall` | Chute en fondu | Descente avec disparition progressive |

Dans le Studio, **Roulade** et **Sursaut** sont proposés en lecture ponctuelle par défaut ; les quatre autres nouveaux effets de mouvement sont bouclés. L’auteur peut modifier `loop` et `reverse`. Les effets de mouvement commencent après l’entrée, utilisent `intensity` et se superposent à `movement`. Une sortie conserve la pose atteinte à son heure de début, puis anime cette pose jusqu’à l’opacité nulle, comme les sorties précédentes.

Les copies du schéma et du lecteur doivent inclure ces nouvelles valeurs ; une ancienne énumération ne les accepte pas simplement parce que le numéro du schéma est reconnu. Voir le [guide courant](GUIDE_V1_10.md#animer-un-élément-dans-une-cinématique) pour les commandes de l’inspecteur.

## Extensions courantes : bulles, fin de plan, audio et catalogue v4

`bubbles[].bubbleEntry` contient un `preset` parmi none/pop/left/right/burst/shake/bounce et une `duration`, distincts de `textAnimation`. Sa présence relève de l’extension v3. Sans réglage, les anciennes bulles gardent l’entrée douce par défaut du lecteur.

`shot.endAdvance` vaut auto ou click ; absent, le passage reste automatique lorsque durée minimale et dialogues sont terminés. La sortie visuelle `exitTransition` et les fondus sonores sont pris en compte avant de changer de plan.

Le champ historique `shot.audio` redémarre sa piste par plan. Pour une continuité entre plans, utiliser `cinematic.musicTracks[]` avec `startShotId` et `endShotId`. Les événements `shot.sounds[]` utilisent `event`, `targetId`, `delay` et `duration`. Les deux portent les réglages de fichier, volume, boucle et fondus ; voir le [contrat audio complet](SON_CINEMATIQUES.md). Ces champs optionnels ne forcent pas à eux seuls le schéma 4.

`presentationCatalog` référence `projectId` et `file`. `actors[].animation` choisit une animation directe ou une espèce/slot, avec vitesse. Ces références exigent **schemaVersion: 4** ; le projet correspondant et ses ressources doivent être disponibles. Les marqueurs son/VFX sont interprétés, `release` reste sans effet de gameplay. Le [contrat de présentation](ARCHITECTURE_V1_10.md) définit frames, régions, ancrages, poses et héritage.

Dans un projet de jeu, les films complets sont stockés dans `cinematics[]`. Catégories et ordre du navigateur servent au montage ; le parcours jouable dépend de `campaign.steps[]`. Le publieur transforme les liens d’auteur en fichiers immuables de runtime et lie le catalogue à `content/design/game_content.json`. Voir le [contrat de campagne](ARCHITECTURE_CAMPAGNE.md).
