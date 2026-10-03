# Cigarette dans Lunaria Studio

Cigarette est disponible dans **Niveaux → Ennemis**, et dans les choix de **Vagues & ennemis**. Sa fiche possède un sprite de combat vers la gauche et six animations personnelles dessinées : attente (4 poses), marche (4), souffle (8), réaction aux coups (4), apparition (4) et disparition (4). **Ennemis → Cigarette → Animations de Cigarette** permet de les lire et modifier. Le repère à 0,28 s correspond à la première pose qui souffle ; la texture peinte de fumée est répétée dans la zone des trois cases. La source des valeurs initiales et des découpes est `src/shared/game/cigarette.ts` ; les projets existants conservent leurs caractéristiques de combat.

Dans **Attaque → Souffle de fumée**, la zone **Cases immédiatement devant** compte trois cases de la même allée. Les cases vides comptent et la première plante ne bloque pas les suivantes. Les occupants sont évalués à l'émission du souffle. Les champs de portée par distance et d'allées adjacentes sont masqués pour ce mode. Le nombre de cases, la cadence, le délai initial, les dégâts et leur présentation restent éditables.

Valeurs initiales : 220 PV, vitesse 0,16 case/s, 18 dégâts toxiques par plante, intervalle 2,4 s, récompense 12 graines. Le préréglage VFX `smoke` présente la fumée dans les aperçus ; Godot utilise la géométrie exacte de la zone pendant le combat.

Cigarette utilise le comportement personnel **Cigarette — avance au contact** : elle continue de marcher pendant le souffle et s'arrête seulement lorsqu'elle touche la première plante de son allée. Elle reprend sa marche après la mort de cette plante. Dans **Comportements**, l'option **S'arrêter quand une cible adverse est à portée** est désactivée pour ce comportement. La collision du moteur empêche de traverser la plante, indépendamment de cette option. En mode Avance, si la plante au contact partage sa case, celle-ci compte comme la première des trois cases du souffle.

Après une modification de contrat, exécuter `npm run schema`, les tests puis `node scripts/sync-game-contract.mjs --game "C:\dev\Lunaria\game"`. Cette synchronisation ne publie pas le projet utilisateur. Utiliser **Publier et exporter → Publier la campagne** pour publier les données et les images.

Les sept PNG sont dans `C:\dev\Lunaria\LunariaArtLibrary\03_enemies\cigarette\combat`, `animations` et `effects`, avec des noms versionnés `v01`. L'illustration initiale et ses usages dans les cinématiques restent disponibles. La publication copie également toutes les planches et la texture de fumée. Les prompts et empreintes des images sont dans `C:\dev\Lunaria\docs\art_provenance\animations\cigarette_2026-10-01.json`.

La taille d'affichage commune aux six animations est de 114 × 114 pixels, réduite d'environ 20 % par rapport au réglage initial. L'ancrage des pieds sur le plateau reste identique.

La réaction aux coups dure 0,4 s : 40 ms de garde, 120 ms de recul, 140 ms de douleur et 100 ms de retour. Le lecteur Godot emploie l'échelle propre à cette réaction lorsqu'elle remplace l'image de marche ou de souffle. L'attaque en préparation conserve sa libération à 0,28 s.

Les tests dédiés sont `tests/cigarette.test.ts` et `tests/e2e/cigarette.spec.ts` ; le second réouvre aussi le véritable projet utilisateur et inspecte ses huit poses de souffle sans l'enregistrer. La description complète du comportement est dans `C:\dev\Lunaria\docs\design\cigarette.md`.
