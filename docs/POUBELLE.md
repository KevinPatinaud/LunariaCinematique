# Poubelle

L’ennemi `poubelle` reste sur sa case, sans attaque ni renfort. Les plantes peuvent le cibler et le détruire.

Dans **Vagues & ennemis**, choisir Poubelle donne accès au placement sur une case précise ou dans une zone aléatoire, comme pour la Plaque. Le mode **Plateau occupé** utilise également son placement case par case.

Une Poubelle vivante bloque l’avancée des ennemis situés derrière elle sur sa propre allée. Ils forment une file espacée de 0,55 case. Si la file déborde du plateau, les arrivées continuent à attendre à droite, hors écran. La destruction de la Poubelle libère leur déplacement.

Les projectiles ennemis traversent la Poubelle et conservent leurs collisions avec les plantes. Les projectiles alliés peuvent la toucher normalement.

Valeurs initiales modifiables dans le catalogue global : 320 PV, vitesse 0, attaque 0, armure physique 20 %, récompense de 10 graines, aucune résistance supplémentaire.

## Présentation en combat

Le profil `profile_poubelle` utilise 16 poses dessinées dans `library://03_enemies/poubelle/animations/poubelle_combat_sheet_v01.png` : attente et clignement (4), ouverture à l’apparition (4), réaction aux impacts (4), écrasement à la destruction (4). Le corps reste droit, avec un point d’appui mesuré sur son bord inférieur. Les régions ont toutes la même taille pour conserver l’échelle pendant l’écrasement. L’image principale reprend exactement la première pose d’attente.

Le déplacement reprend l’attente. Le contrat impose un slot `attack` ponctuel : il reprend techniquement l’ouverture, sans marqueur de tir. La Poubelle n’a aucune capacité, donc ce slot ne déclenche aucune attaque. Les paramètres du visuel sont 110 × 116, ligne de sol +33.

Les images originales sont conservées pour les cinématiques. Le nouveau portrait se trouve dans `03_enemies/poubelle/combat/poubelle_combat_v01.png`. Les nouvelles images sont copiées à l’identique dans la bibliothèque du jeu ; leurs imports Godot activent les mipmaps pour adoucir leur réduction. Les définitions sont dans `src/shared/presentation/poubelleAnimations.ts`, puis synchronisées avec le contrat Godot.

Vérifications : `tests/game-authoring.test.ts`, `tests/poubelle-animations.test.ts`, `tests/e2e/poubelle.spec.ts`, `tests/e2e/poubelle-animations.spec.ts`, et les suites Godot `poubelle_smoke`, `poubelle_visual`, `poubelle_animation_visual`. Les tests couvrent le placement, l’enregistrement et la réouverture, le blocage par allée, les files denses, les sauvegardes, le passage des tirs ennemis et les atlas. Les captures Godot couvrent 1280×720 et 640×360 ; elles ne constituent pas une validation sur un appareil Android. La séquence de démonstration utilise 48 PV uniquement dans sa fixture pour montrer rapidement la destruction ; les données du jeu restent à 320 PV.
