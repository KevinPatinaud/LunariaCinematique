# Validation — Gains de Lunas (Studio)

- **Initiative commune** : `luna-gains-economy`
- **Date** : 2026-11-22
- **Dépôt consommateur vérifié** : `C:/dev/Lunaria/specs/006-luna-gains/validation.md`

## Commandes exécutées et résultats

| Commande | Résultat |
|---|---|
| `npm run typecheck` | **PASS** (0 erreur TypeScript renderer + main) |
| `npm run schema` | **PASS** (`schema/game-project.schema.json`, `docs/game-project.schema.json`, `docs/cinematic.schema.json`) |
| `npm test` | **PASS** — **1 297 / 1 301** réussis, **0 échec**, 4 ignorés (symlinks Windows), incluant `tests/lunas.test.ts` |
| `npm run build` | **PASS** (main + bundle Vite renderer en 6,67 s) |
| `node scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game` puis `--check` | **PASS** — `ok: true`, `written: 4`, `missing: []`, `different: []`, `extra: []` |
| `npx playwright test tests/e2e/lunas.spec.ts tests/e2e/rewards.spec.ts` | **PASS** — **3 / 3** réussis (8,1 s) |

## Vérifications visuelles Electron

- `work/luna-gains/level-lunas.png` : onglet **Lunas** sur la fiche de niveau inspecté (défauts `1 000` / `250 × 3`, objectif **Biodiversité** avec compteur dynamique de plantes autorisées, KPI en direct).
- `work/luna-gains/economy-overview.png` : vue globale **Économie Luna** inspectée (drops aléatoires `10 %` pour `5` Lunas à `80 %` / `25` Lunas à `20 %`, moyenne `9 Lunas / drop` · `0,9 Luna / ennemi`, tableau comparatif avec colonne éditable `Biodiversité`).

## Limites connues

- Le document d'auteur `HISTOIRE DE LUNARIA/Cinematiques studio/lunaria.game.json` et la publication `game/content/design/game_content.json` n'ont pas été réécrits ; ils fonctionnent directement avec les valeurs par défaut (`10 %` de drop `5` Lunas à `80 %` / `25` Lunas à `20 %`, `1 000` première victoire, `250` sans perte, `250` sans pluie, `250` biodiversité) et sont prêts à être personnalisés puis publiés depuis le Studio.
- La boutique de dépense (et d'éventuels achats en argent réel Google Play Billing) est hors périmètre de cette livraison.
