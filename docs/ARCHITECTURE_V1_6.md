# Architecture V1.6 — séparation contenu, édition et exécution

## Flux unique

```text
Studio React : Cinématiques          Studio React : Niveaux
      |                                  | niveaux + catalogue commun
cinematic.json                     lunaria.game.json
      |                                  | publication Node
lecteur Godot                      content/design/game_content.json
                                         | validation à l’initialisation
                      PlantCatalog / EnemyCatalog / CampaignCatalog
                                         |
                        simulation / progression / vues du jeu
```

Les niveaux référencent des IDs du catalogue ; ils ne possèdent pas de copie des statistiques. Le schéma interdit les champs supplémentaires. Une seule source d’équilibrage sert à la génération des acteurs, aux dégâts, aux fiches et à la validation d’une sauvegarde.

## Studio

`src/shared/game/types.ts` : contrat TypeScript, clonage à nouveaux IDs, planificateur d’apparitions, règle pure des dégâts et conservation des déclencheurs de vague.

`schema.ts`, `schema/game-project.schema.json`, `validation.ts` : forme stricte, limites et cohérence inter-références. `seed.ts` : copies indépendantes de la campagne de départ, jamais l’état du document édité.

`src/main/gameDocuments.ts` : propriété des fichiers par jeton, séquence d’écriture, conflits externes, récents, récupération et publication bornée au dossier autorisé. Pas de chemin arbitraire accepté depuis un composant de rendu. L’IPC vérifie l’origine et n’expose qu’une API `window.lunariaGame` via le preload isolé.

`src/renderer/game/GameEditor.tsx` : orchestration du document et historique. `BalanceEditor.tsx` : catalogue global. `WaveEditor.tsx` : composition et aperçu temporel. `bridge.ts` : contrat desktop et repli navigateur ; la publication native n’est pas simulée dans ce dernier.

La cinématique et le projet de jeu ont des états indépendants. Le changement de mode n’est pas un changement de document. La fermeture demande la résolution des deux brouillons.

## Godot

`content/design/game_content.gd` lit une fois au démarrage, valide puis fige récursivement les dictionnaires et tableaux. Il ne mélange pas de contenu ancien en cas d’erreur. Le diagnostic de démarrage remplace l’écran jouable si le document est invalide.

`game_content_validator.gd` interprète le sous-ensemble utilisé du JSON Schema et vérifie les liens. Le lecteur ne charge ni script ni scène désigné par le JSON d’auteur.

Les adaptateurs `domain/campaign/*_catalog.gd` exposent les API attendues par le domaine. `Campaign.COUNT` et les pages sont dynamiques ; le continent provient de `level.act`, pas du numéro de page. La disponibilité des plantes vient exclusivement du niveau. Les galeries restent sur les espèces connues, dont les IDs sont validés.

`enemy_stats.gd` ignore mission et numéro de vague pour les statistiques. `wave_system.gd` ne réalise que le calendrier explicite et le choix des allées aléatoires avec le générateur de la partie. `boss_system.gd` n’ajoute plus d’ennemis. `damage_rules.gd` centralise armure et résistances pour les deux camps. Les bonus temporaires de soutien restent dans la simulation, pas dans les définitions de base.

La validation des snapshots utilise les mêmes catalogues et la campagne publiée. L’empreinte du contenu isole les profils de développement sans migration. Les associations cinématiques sont stockées par ID stable ; l’outil de publication résout les anciennes syntaxes numériques de commande contre le catalogue courant.

## Maintenance

Pour faire évoluer le contrat : modifier les types et le schéma de Studio, valider les exemples, adapter le validateur natif si une règle nouvelle est utilisée, puis exécuter les deux suites. Les validateurs JS du jeu sont générés depuis le code compilé partagé, pas maintenus manuellement :

```powershell
npm test
node scripts/sync-game-contract.mjs --game "C:/dev/Lunaria/game"
```

Cette commande copie le contrat, pas la campagne en cours. Elle ne remplace pas les tests natifs. Publier le document depuis l’interface pour changer le contenu actif.

Les anciens `.tres` sont conservés uniquement comme fixtures textuelles sous `tests/fixtures/authoring_before_studio/`. Les anciens contrats qui imposaient leurs chemins sont archivés en `.mjs.txt` sous `tests/legacy_before_studio/`, non exécutés et exclus des exports. La suite actuelle est `node tools/test-game.mjs --static-only`, complétée sur la machine de développement par Godot.

Le présent document complète l’architecture du plateau libre : la séparation plateau/objectif/combat/vue reste en place. Il ne prétend pas que toutes les particularités des anciennes espèces sont devenues déclaratives : les comportements existants restent programmés, avec leurs paramètres communs éditables.
