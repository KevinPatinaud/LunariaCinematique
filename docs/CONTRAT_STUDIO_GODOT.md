# Référence commune du contrat Studio → Godot

**Responsable des formats publiés : Lunaria Studio.** Ce document indique leurs
sources et la procédure de changement ; il ne redéfinit pas les schémas ni les
valeurs de gameplay. Il est maintenu dans le dépôt Studio et référencé par le jeu.

## Sources faisant référence

| Sujet | Producteur / référence dans le Studio | Consommateur dans le jeu |
| --- | --- | --- |
| Projet d'auteur et campagne | `src/shared/game/types.ts`, `schema.ts`, `validation.ts`, `campaign.ts` ; guide `docs/ARCHITECTURE_CAMPAGNE.md` | `game/content/design/`, `game/domain/campaign/`, lecteurs du parcours |
| Combat et comportements | `src/shared/game/`, validateurs et tests associés | `game/domain/battle/`, `game/domain/combat/`, validateurs de contenu |
| Présentation et animations | `src/shared/presentation/` ; `docs/ARCHITECTURE_V1_10.md` | `game/domain/presentation/`, `game/presentation/` et lecteurs du catalogue |
| Films, mouvement et audio | `src/shared/model.ts`, `schema.ts`, `motion.ts`, `cinematicAudio.ts` ; `docs/FORMAT.md` | `game/addons/lunaria_cinematics/` et intégration narrative |
| Publication et médias | `src/main/campaignPublisher.ts` ; `docs/INTEGRATION_GODOT.md` | `game/content/design/game_content.json`, `game/content/cinematics/`, `game/LunariaArtLibrary/` |

Les chemins côté jeu sont relatifs à `C:/dev/Lunaria`. Le mini-projet `godot/`
du Studio sert aux essais du lecteur et ne remplace pas le jeu Android.
Consulter les types, schémas et lecteurs réels avant de modifier une interface.

Le lecteur GDScript a pour source `godot/addons/lunaria_cinematics/` dans le
Studio. `scripts/sync-game-contract.mjs` maintient sa copie dans le jeu, les
schémas techniques et les modules JavaScript requis par les points d’entrée
`tools/design/*.js`. Leur fermeture d’imports remplace la copie de tous les
modules d’édition. Les identifiants `.uid` propres au jeu sont conservés.

`game/tools/design/sync-manifest.json` recense uniquement les chemins techniques
gérés, afin de retirer leurs anciennes copies lors d’une synchronisation. Les
fichiers inconnus restent en place ; le catalogue publié, les médias et les
documents d’auteur ne sont pas gérés par ce manifeste.

## Invariants du pipeline

1. Le document d'auteur est
   `C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json`.
   Le catalogue publié est une sortie, pas un deuxième document d'auteur.
2. Les références `library://` conservent leurs chemins internes. Le runtime
   embarque sa fermeture de médias ; il ne dépend pas du disque externe du Studio.
3. Le préflight de publication vérifie sans écrire. La publication prépare les
   ressources puis remplace atomiquement le catalogue en dernier.
4. Une copie TypeScript ou un schéma synchronisé ne réalise pas le port des
   règles en GDScript. Vérifier séparément données et comportement.
5. Les répertoires `.specify/`, `.agents/` et `specs/` restent à la racine des
   dépôts, hors du projet `game/` et des artefacts Electron livrés.

## Changer le contrat

- Décrire l'intention utilisateur et les cas limites. Identifier producteur,
  consommateur, champs modifiés, erreurs et effet sur le format courant.
- Relier les spécifications locales par un même identifiant d'initiative.
  Noter les chemins de référence et les commits concernés ; si le dépôt est
  modifié, noter aussi les modifications locales qui portent le contrat.
- Modifier la définition à sa source dans le Studio. Référencer cette définition
  depuis le jeu ; les copies générées ne deviennent pas des sources éditables.
- Adapter validation, publication, lecteur Godot et tests pertinents. Pour les
  cinématiques, examiner aussi le lecteur maintenu dans `Studio/godot/`.
- Si une génération et synchronisation sont nécessaires, les exécuter dans cet
  ordre depuis le Studio, en contrôlant leurs différences :

  ```powershell
  npm run schema
  node scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game --check
  node scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game
  node scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game --check
  ```

  `--check` compare sans écrire et retourne un échec si une copie gérée manque,
  diffère ou doit être retirée. Examiner ces écarts avant la synchronisation
  explicite, qui écrit les copies nécessaires et retire les anciennes copies
  gérées. La génération et la synchronisation ne publient pas la campagne et ne
  réalisent pas le port d’une nouvelle règle GDScript. Elles ne sont pas
  nécessaires pour installer Spec Kit.
- Valider un exemple représentatif et les erreurs pertinentes des deux côtés,
  puis le parcours exporté dans un projet de test isolé. Une modification
  d'interface doit aussi être essayée dans Electron ; le rendu et le tactile
  Android sont vérifiés sur téléphone quand le changement le demande.
- Consigner les commandes, résultats, versions effectivement vérifiées et les
  essais restants. Une implémentation locale, une publication et une installation
  Android sont trois états distincts.

## Vie des documents

Les dossiers `specs/` terminés conservent l'intention et les preuves du chantier.
Les contrats courants restent dans les sources et guides ci-dessus. Un chantier
ultérieur crée son propre dossier et met à jour ces références à la source ; il
ne propage pas des copies de spécifications entre dépôts.
