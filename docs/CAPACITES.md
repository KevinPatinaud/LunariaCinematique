# Capacités de combat

L’édition courante se fait dans **Niveaux → Plantes alliées / Ennemis → personnage → Capacités**.

- Chaque capacité rassemble sa cadence, sa cible, sa portée, ses effets et ses mécaniques particulières. Les dégâts et soins sont affichés en PV calculés pour le personnage sélectionné.
- La liane affiche directement le ralentissement, la fenêtre de libération, les pulsations, la rupture et le rayon de l’explosion. Le ricochet, la propagation, les pièges et les ripostes ont leurs propres champs.
- **À ce personnage uniquement** est le mode par défaut. Si des données sont partagées, la première modification crée une copie de la capacité, de ses effets, de son projectile et de ses effets de réaction. Les références de phases et de règles propres au personnage sont adaptées.
- **Au modèle commun** est un choix explicite. Il affecte ses utilisateurs, ainsi que les autres capacités partageant ses effets ou son projectile. La bibliothèque permet de retrouver, créer et dupliquer ces modèles ; « Dupliquer entièrement » produit une copie indépendante.
- « Ajouter une capacité » propose cinq points de départ ou une copie d’une capacité existante. Le partage reste facultatif. Retirer une capacité la détache aussi des règles et phases du personnage, sans supprimer le modèle de la bibliothèque.
- Le ciblage avancé, les sons, l’aspect du projectile et les calculs détaillés sont repliés. Les comportements servent aux priorités et phases ; les réglages ordinaires restent sur la fiche du personnage.

## Essai dans Godot

**Tester cette capacité** ouvre un atelier Godot avec un instantané du projet en mémoire. Les modifications n’ont pas besoin d’être publiées. La cible se choisit dans « Cible d’essai et calcul des résultats ».

L’atelier utilise les vrais modules de ciblage, de cadence, de projectiles, d’effets, d’animation et de son du jeu. Il propose pause, pas de 0,1 s, ralenti, recommencer, allié supplémentaire, cible voisine, pluie, mouvement et attaques adverses. Un soin démarre avec une cible blessée. Les unités sont disposées pour observer la capacité ; ce plateau ne simule pas une mission ou la progression de campagne.

Un projectile ennemi touche la première plante vivante rencontrée sur sa trajectoire, y compris une plante posée après le départ du tir. La cible choisie au lancement détermine la direction du tir ; une nouvelle plante peut donc protéger celle qui était visée. Un projectile ordinaire disparaît à l’impact. Un projectile perforant conserve le nombre de contacts défini dans sa fiche.

Le Studio demande le dossier `game` et l’exécutable Godot s’ils ne sont pas encore configurés. L’instantané est écrit dans `capability-workshops` sous le dossier de données du Studio. Il ne remplace ni le projet source, ni `game_content.json`, ni la progression du joueur.

## Contrat et architecture

Les identifiants désignent des données ; ils ne sélectionnent plus les algorithmes spéciaux. `combatMechanics.ts` décrit les mécaniques, `combatMechanicsSchema.ts` leurs limites, et `combatAuthoring.ts` les opérations de copie et d’affectation. Les composants de `renderer/game/capabilities` séparent fiche, effets, mécaniques et organisation des personnages.

Les capacités portent un objet `mechanics`. Une liane porte `effect.binding`, un poison de riposte `effect.counterStacking`, et le projectile son `visualStyle`. L’import des anciens identifiants est centralisé dans `importCombatMechanics`, à l’ouverture côté Studio ; le moteur Godot consomme uniquement les paramètres explicites. Le schéma généré et la validation sémantique sont présents des deux côtés.

Les fichiers de campagne existants ont reçu ces paramètres explicites sans changer leurs valeurs d’équilibrage. Les nouveaux modèles peuvent conserver des valeurs fixes ou des multiplicateurs. Modifier la référence d’un personnage reste possible dans « Organisation du combat et valeurs de référence ».

## Vérification ciblée

Studio : `npm test`, `npm run build`, puis `npx playwright test tests/e2e/capabilities.spec.ts tests/e2e/combat.spec.ts tests/e2e/ivy-attack.spec.ts tests/e2e/ivy-replacement.spec.ts tests/e2e/cigarette.spec.ts tests/e2e/plastic-bag.spec.ts`.

Jeu : `node tools/test.mjs --suite fast`, notamment `capability_runtime_smoke` qui vérifie des copies aux identifiants arbitraires, les dépendances de riposte, les dégâts édités du combo et les copies utilisées par des ennemis.
