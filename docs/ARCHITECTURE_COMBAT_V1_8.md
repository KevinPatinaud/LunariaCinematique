# V1.8 — Contrat et architecture du combat

## Flux de données

React → historique du document → validation TypeScript → IPC restreint → services Node de fichiers/publication → game_content.json → validation Godot → registres immuables → instances de combat.

Aucun script arbitraire n’est enregistré dans les capacités. Le schéma interdit les champs inconnus. Le Studio conserve un document de travail complet ; la publication ne crée pas des copies de statistiques par niveau.

## Studio

- `src/shared/game/combat.ts` : types, constructeurs, références, suppression protégée, résolution de valeurs.
- `combatDefaults.ts` : contenu initial et import des documents V1.7. Jamais un fallback du runtime.
- `combatValidation.ts` : références, cohérence des cibles, magnitudes et limites sémantiques.
- `schema.ts` : contrat structurel ; JSON Schema exporté dans `schema/` et fourni au jeu.
- `combatPreview.ts` : calcul d’une utilisation isolée ; volontairement sans simulation de combat.
- `CombatEditor.tsx` : formulaires de catalogue ; `CombatProbe.tsx` : aperçu ; `BalanceEditor.tsx` : associations aux espèces.
- `GameDocuments` : propriété des fichiers, tokens, écritures atomiques, brouillon et récents.
- `campaignPublisher` : prévalidation globale, staging des films/ressources, commit du contenu en dernier. Le module de runtime V1.8 doit exister dans la cible.

## Godot : domain/combat

| Module | Responsabilité |
|---|---|
| `combat_registry.gd` | Indexation des définitions partagées et des espèces ; aucun accès disque par frame. |
| `targeting.gd` | Filtrage géométrique des candidats et choix déterministe avec départage par identifiant. |
| `ability_runtime.gd` | Délais, sélection des cibles, exécution immédiate ou création d’un projectile. |
| `effect_runtime.gd` | Dégâts/soins centralisés, statuts bornés, ticks et purification. |
| `projectile_runtime.gd` | Contacts balayés, perforation, zone et expiration, pour les deux camps. |
| `combat_state.gd` | Validation stricte des états temporaires et des références lors d’une reprise. |

Les systèmes de plantes et d’ennemis orchestrent le cycle de vie et délèguent les attaques ordinaires. Le système de résolution conserve les décès, récompenses et notifications de mission. Le rendu utilise uniquement les valeurs visuelles du projectile et ne décide pas des dégâts.

Le catalogue conserve provisoirement les anciens champs de métadonnées `behavior` et `effect_radius` pour les documents de conception. Ils ne sélectionnent plus les actions dans les systèmes de combat et ne sont plus édités comme règles concurrentes dans l’interface. `effect_strength` est une vraie valeur référencée par les effets qui la demandent.

## Propriété des données

Une définition n’appartient pas à une entité et ne doit jamais être modifiée par un combat. Seuls les délais, PV, projectiles et statuts des instances sont mutables. Les changements permanents d’expérience, stade ou compétences restent absents. Le plateau conserve 40 cellules ordinaires et la difficulté unique.

Un statut porte son `effect_id`, sa durée restante, son prochain tick, sa puissance résolue et son type de dégâts. Un projectile porte ses références de capacité/définition/source, son camp, sa direction, ses cibles déjà touchées, son âge et ses contacts restants. La restauration valide tout avant de modifier une bataille existante. Les dégâts de source sont résolus d’après le catalogue ; le multiplicateur temporaire sortant du lancement est porté par le projectile.

Le temps logique du jeu reste découpé en pas bornés. Les listes, effets et contacts sont bornés par le schéma et par le runtime ; aucun graphe récursif d’actions n’est interprété.

## Frontières de cette itération

Les boss, la pluie du joueur et certains modificateurs de situation gardent leurs mécanismes natifs. La livraison ne prétend pas avoir supprimé toute logique spécifique à Lunaria. Les nouvelles capacités exploitent des primitives connues. Une future IA par états ou de nouveaux déclencheurs devront passer par un contrat explicite plutôt que des champs ad hoc dans les niveaux.

## Vérification des contrats

TypeScript et Godot appliquent le même JSON Schema, puis des validations sémantiques parallèles. Cela doit être accompagné des tests natifs, pas seulement des tests de sources. Les tests Node fournis vérifient le contrat réellement publié et les opérations sur disque. Le test Godot fourni doit être exécuté sur une installation du moteur avant livraison commerciale.
