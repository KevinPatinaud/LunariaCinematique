# Plan — Gains de Lunas (Studio)

- **Initiative commune** : `luna-gains-economy`
- **Spécification** : `specs/008-luna-gains/spec.md`
- **Côté jeu** : `C:/dev/Lunaria/specs/006-luna-gains/plan.md`

## Architecture et fichiers touchés

1. **Modèle & contrat partagé (`src/shared/game/`)** — code en anglais, messages en français :
   - `lunas.ts` : types `LunaEnemyDropConfig`, `LunaEconomyConfig`, `LevelMasteryRewards`, `LevelLunaRewards`, valeurs par défaut, résolveurs (`lunaEconomyOf`, `levelLunaRewardsOf`), calculs d'espérance et résumés par niveau et par campagne.
   - `lunasSchema.ts` : schémas JSON Schema `LUNA_ECONOMY_SCHEMA` et `LEVEL_LUNA_REWARDS_SCHEMA`.
   - `lunasValidation.ts` : validation métier (`smallAmount <= largeAmount`, avertissement `biodiversity` si `< 2` plantes autorisées).
   - `types.ts` : ajout optionnel de `lunas?: LunaEconomyConfig` sur `GameProject` et `lunaRewards?: LevelLunaRewards` sur `LevelDefinition`.
   - `schema.ts` : attachement de `LUNA_ECONOMY_SCHEMA` et `LEVEL_LUNA_REWARDS_SCHEMA` sur `GAME_SCHEMA`.
   - `validation.ts` : appel de `lunaIssues(p)` dans `gameIssues`.
   - `levelManagement.ts` : prise en charge du nettoyage propre de `lunaRewards` dans `patchProjectLevel`.
2. **Interface Studio (`src/renderer/`)** :
   - `components/StudioNavigation.tsx` : ajout de la section `"lunas"` dans le menu **Plus** (icône `☾`, libellé « Économie Luna »).
   - `game/LevelLunaEditor.tsx` : onglet **Lunas** d'une fiche de niveau (première victoire, primes de maîtrise, résumé en direct, lien vers la vue globale).
   - `game/LunaEconomyEditor.tsx` : vue globale **Économie Luna** (drops aléatoires sur pollueurs, KPIs de campagne, tableau comparatif éditable de tous les niveaux).
   - `game/LevelsWorkspace.tsx` & `game/GameEditor.tsx` : intégration de l'onglet `lunas` sur la fiche de niveau et de la section `lunas`.
   - `game/HomeScreenEditor.tsx` & `game/HomeScreenPreview.tsx` : prise en charge du jeton `{lunas}` et du compteur simulé dans l'aperçu.
   - `game/game.css` : styles cohérents avec la direction visuelle existante du Studio.
3. **Schémas, synchronisation & tests** :
   - `tests/lunas.test.ts` : tests unitaires complets du modèle, de la validation, de la publication isolée et de `{lunas}`.
   - Génération `npm run schema`, synchronisation `node scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game`, puis `npm run typecheck`, `npm test` et `npm run build`.
