# Architecture V1.9

## Frontière de responsabilité

Le Studio décrit les règles ; Godot exécute des primitives bornées. Les définitions sont globales et en lecture seule. Aucun `eval`, script embarqué, graphe récursif ou accès réseau n'est interprété depuis le contenu. Le moteur garde le rendu, les entrées, la pluie du joueur, les modificateurs de situation, les collisions, l'audio et les sauvegardes. Les objectifs abstraits et certains effets de soutien restent natifs : ce n'est pas encore l'externalisation de tout le jeu.

## Studio

`shared/game/logic.ts` définit conditions, règles, phases, événements, actions, variables et aperçu pur. `logicSchema.ts` complète le schéma JSON ; `logicValidation.ts` vérifie références, camps, seuils, budgets et données croisées. `logicDefaults.ts` fournit les comportements de départ et complète les anciens documents d'édition, sans conversion de profils joueurs.

`BehaviorEditor.tsx`, `VariableEditor.tsx`, `EventEditor.tsx` et `LogicFields.tsx` sont composés dans le mode Niveaux. Les changements passent par l'historique existant ; récupération et sauvegarde restent dans les services Node. Une définition référencée ne se supprime pas silencieusement. Les nombres et messages ne deviennent pas des expressions exécutables.

Le compilateur de campagne conserve les films utilisés par les événements/phases. Le publieur remappe aussi ces références lorsque deux entrées désignent le même document. Le contrôle du dossier cible exige le nouveau runtime. Les sources sont vérifiées avant d'activer le fichier publié ; le mécanisme de retour arrière de publication est conservé.

## Runtime Godot

- `logic_registry.gd` : index immuables et références d'actions.
- `condition_runtime.gd` : conjonctions typées et sélection de prédicats.
- `behavior_runtime.gd` : phases monotones, priorité, capacités actives, déplacements et multiplicateurs temporaires.
- `event_runtime.gd` : déclencheurs, compteurs, seuils et file d'actions différées.
- `action_runtime.gd` : dispatch fini des treize actions.
- `logic_state.gd` : validation exacte des instantanés de règles.
- `logic_presentation_controller.gd` : transforme une demande de film en affichage bloquant, sans coupler le domaine aux scènes.

`AbilityRuntime` demande une décision au comportement puis applique les capacités/effets existants. Le déplacement ennemi suit `advance`, `hold` ou `retreat`. Le module de boss spécifique est retiré : les attaques des six boss sont des définitions de capacités globales. Les effets de couleur/poses historiques restent du rendu moteur, pas un système d'animations éditables supplémentaire.

## Exécution déterministe et limites

Les files contiennent `{due, order, origin, index, source, team}`. Les actions sont recherchées dans le catalogue immutable via leur origine événement/phase. Ordre stable aux échéances égales. Un blocage temporaire préserve l'ordre de la même chaîne, sans bloquer les autres événements. Les sources disparues ne ressuscitent pas : les actions sur « soi » deviennent sans cible, les messages restent possibles.

Budget de 2 048 actions en attente, 64 actions exécutées par pas, 128 événements par niveau, 32 actions par événement/entrée de phase. Déclenchement limité en nombre et en fréquence, signalements de saturation, pas de rafale de rattrapage. La file est sauvegardée par références et vérifiée contre le contenu courant. Le RNG du combat reste la source des allées aléatoires.

Un film stocke sa référence, son origine et sa permission de passage. Il gèle le modèle. L'affichage possède un signal `event_completed` distinct de `campaign_completed` : sa fin libère seulement le combat. Erreur ou abandon conservent l'attente. Les défaites naturelles sont évaluées avant de laisser un événement de la même frame masquer un jardin déjà perdu.

## Sauvegardes

Version courante v15 seulement. Les acteurs conservent phase, décision, capacités désactivées/demandées et multiplicateurs. Le combat conserve horloge, déclenchements, seuils, file et film en attente. Les valeurs provisoires de variables de campagne sont intégrées uniquement à une victoire valide de l'étape courante. Pas de migration des profils précédents.

Les tests historiques antérieurs au Studio sont archivés dans `tests/legacy_before_studio` avec extension `.txt` ; ils ne sont pas des suites natives valides du contrat actuel. Les suites actuelles sont déclarées dans `tools/test-cinematics.mjs` et `tools/test-game.mjs`.
