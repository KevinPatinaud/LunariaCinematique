# Règles du plateau des ennemis

Accès : **Niveaux → Ennemis → personnage → Règles du plateau**. Les propriétés de jeu appartiennent maintenant à la définition de l’ennemi ; elles ne dépendent plus de son identifiant dans le moteur.

## Réglages

| Propriété | Effet |
|---|---|
| Apparition | Arrivée à une position définie, ou case/zone choisie dans chaque vague |
| Blocage d’allée | Les ennemis de la même allée font la queue derrière cet obstacle ; les projectiles le traversent |
| Blocage de plantation | Interdit de planter sur la case occupée tant que cet ennemi vit |
| Contact solide | Arrête l’ennemi au contact des plantes dans tous les objectifs, indépendamment de ses attaques à distance |
| Renforts | Espèce produite et période, dans la même allée ; première arrivée après une période complète de combat |
| Boss | Active la présentation de boss, avec le nom défini dans sa fiche |

Le déplacement et les attaques restent dans **Comportement** et **Capacités**. Un obstacle peut être mobile ; il ne se bloque pas lui-même. L’espacement au contact tient compte de la portée de ses capacités actives marquées comme attaques de contact, y compris après personnalisation d’une capacité.

La position d’arrivée se mesure en cases : le plateau va de 0 à 8, et 8,45 place un ennemi derrière le bord droit. Une vitesse nulle est possible si l’ennemi apparaît sur le plateau. Une arrivée hors plateau avec une vitesse nulle est refusée. Un placement par défaut doit être au centre d’une case.

Changer le mode d’apparition adapte les groupes existants de cet ennemi dans les objectifs ordinaires. L’annulation restaure les positions précédentes. Les niveaux **Plateau occupé** conservent leurs propres cases. Les vagues proposent automatiquement le sélecteur de case ou de zone pour toute espèce qui déclare ce mode, même une copie avec un identifiant nouveau.

Dans une zone couvrant plusieurs allées, les apparitions aléatoires privilégient les allées qui comptent le moins d’ennemis de la même espèce. Les égalités sont départagées au hasard, puis la colonne est tirée dans la zone choisie. Le calcul porte sur l’ensemble des groupes de la vague, dans l’ordre d’apparition, et tient compte des individus encore vivants et des groupes imposés sur une allée. Ainsi, cinq Plaques sur cinq allées libres donnent une Plaque par allée ; huit donnent une ou deux par allée. Les cases précises et les plateaux occupés restent ceux de l’auteur. Les positions calculées sont conservées dans la sauvegarde du combat.

## Copier un ennemi

Dans **Caractéristiques**, « Dupliquer l’ennemi » crée une espèce active, même depuis les archives. La copie conserve statistiques, règles et images ; elle reçoit un comportement personnel et une copie de ses animations propres et de leur profil. Les définitions de capacités restent réutilisables ; leur personnalisation s’effectue dans l’onglet Capacités. Les fichiers d’images source ne sont pas dupliqués ou renommés.

Le catalogue accepte jusqu’à 128 ennemis. Les limites des comportements et animations sont aussi contrôlées avant duplication. Enregistrer, annuler, rétablir et récupérer utilisent la même session que les autres écrans.

## Foyers et renforts

Dans les paramètres d’un niveau **Foyers invasifs**, « Espèce des foyers » permet de choisir toute espèce immobile dont l’apparition se règle par case. Le niveau possède la position des foyers, l’espèce envoyée et la période des renforts. **Ce cycle remplace celui de la fiche du foyer. Il ne s’y ajoute pas.**

Un générateur ordinaire possède un compteur indépendant par individu. La préparation, la pause et les batailles terminées ne consomment pas ce temps. Sa destruction arrête la production. Les renforts utilisent leur définition normale, n’augmentent pas les compteurs d’arrivées rédigées dans la vague et doivent être éliminés avant la fin de celle-ci. La limite de 256 ennemis est conservée. Les périodes manquées sont regroupées, sans rafale différée quand la place se libère.

## Contrat et organisation du code

`EnemyDefinition.rules` contient :

```json
{
  "spawn": { "mode": "placement", "x": 6.5 },
  "blocksEnemies": false,
  "blocksPlanting": true,
  "contact": "normal",
  "boss": false,
  "reinforcements": { "enemyId": "runner", "interval": 30 }
}
```

`reinforcements` est absent lorsque la production est désactivée. Le niveau déclare aussi `invasiveFoci.focusEnemyId`. Le schéma de projet reste en version 4.

- `shared/game/enemyRules.ts` possède les propriétés, la duplication, les adaptations de groupes, les dépendances de production et les résumés de la fiche.
- `enemyRulesSchema.ts` et les validateurs Studio/Godot contrôlent références, bornes et compatibilité des objectifs.
- `EnemyRulesEditor.tsx` compose la fiche. Les éditeurs de vagues, plateau occupé et foyers consomment les propriétés déclarées.
- Godot : `domain/battle/enemy_rules.gd` fournit les propriétés immuables ; `systems/reinforcement_system.gd` exécute la production dans une passe séparée. Déplacement, contact, plantation, objectifs, apparitions, présentation des boss et validation des instantanés les utilisent.
- Les sauvegardes valident les espèces produites à partir des références du catalogue, y compris les chaînes de production. Le parcours des dépendances est borné et supporte les cycles sans récursion infinie.

Les anciens documents d’auteur sont enrichis à l’import par `ensureEnemyRules`. **Cette conversion est le seul endroit qui reconnaît les identifiants historiques pour attribuer les anciennes règles.** Le moteur consomme uniquement les propriétés explicites. La campagne courante, sa publication et les exemples ont été enrichis avec ces propriétés ; statistiques, niveaux, cinématiques et références artistiques sont conservés.

## Vérifications

Dans le Studio :

```powershell
npm test
npm run build
npm run test:e2e:built -- tests/e2e/enemy-rules.spec.ts
node scripts/check-enemy-runtime.mjs --game C:/dev/Lunaria/game
```

La dernière commande se lance après `npm test`, avec Godot installé. Elle duplique des ennemis dans un document temporaire validé puis teste le moteur réel avec leurs nouveaux identifiants : apparition, queue, contact personnalisé, génération, restauration, boss et foyers. `--godot` choisit l’exécutable ; `--out` conserve les preuves. Ajouter `--visual` produit des captures de l’obstacle copié, de son impact, de sa destruction et du passage libéré. Dans cet essai visuel, les PV de l’obstacle sont abaissés uniquement pour raccourcir la séquence.

Dans le dépôt du jeu : `node tools/test.mjs --suite fast --skip-import` inclut `enemy_rules_smoke`. Les suites existantes de Plaque, Poubelle, Cigarette, renforts, objectifs, combat et persistance restent actives. `node tools/test.mjs --suite node --skip-import` vérifie aussi le contrat partagé et le contenu publié.
