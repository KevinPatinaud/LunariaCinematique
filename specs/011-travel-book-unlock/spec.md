# Spécification — Déblocage configurable de L'herbier et du Carnet de voyage (Studio)

- **Initiative commune** : `travel-book-unlock`
- **Dépôt consommateur (Jeu Godot)** : `C:/dev/Lunaria/specs/009-travel-book-unlock/`
- **Contrat partagé** : `C:/dev/Lunaria cinematic studio/docs/CONTRAT_STUDIO_GODOT.md`
- **Date** : 2026-11-24

## Intention utilisateur

Permettre à l'auteur de configurer dans l'onglet **Campagne** de Lunaria Studio le moment exact où **L'herbier** et le **Carnet de voyage** se débloquent pour le joueur, à l'aide de cartes déplaçables placées dans le parcours (sur le modèle de la borne « Fin actuelle de la partie jouable »).

Dans la campagne courante de Lunaria (`lunaria.game.json`) :
- **Déblocage de L'herbier** (`unlock_herbarium`) est placé juste après **« 04 - Protéger Noisetier »** (avant **« 05 - Une noisette pour tous »**).
- **Déblocage du Carnet de voyage** (`unlock_travel_book`) est placé juste après **« 10 - Faire reculer l'acier »** (combat contre le Compresseur / rouleau compresseur), avant la borne `end`.

## Contrat Studio → Godot

- **Types de pas de campagne** : `CampaignStep` inclut les variantes `{ id: string; kind: 'unlock_herbarium' }` et `{ id: string; kind: 'unlock_travel_book' }` dans `src/shared/game/types.ts` et `src/shared/game/schema.ts`.
- **Unicité et champs** : au plus un jalon de chaque type par campagne ; seuls `id` et `kind` sont autorisés (validé dans `src/shared/game/validation.ts` et `game/content/design/game_content_validator.gd`).
- **Sémantique** :
  - Jalon absent ou placé en première position (avant toute étape jouable) : fonctionnalité accessible dès le début du jeu.
  - Jalon placé après `N` étapes jouables (`level` ou `cinematic` avant `end`, sans compter les jalons passifs) : fonctionnalité masquée tant que `campaign_cursor < N`, puis débloquée automatiquement dès `campaign_cursor >= N`, sans bloquer l'enchaînement des cinématiques et niveaux.
  - Jalon placé après la borne `end` : avertissement de validation / préflight ; `compileCampaign` conserve uniquement les marqueurs passifs après `end` (sans aucune étape future ni média futur) afin de maintenir le verrouillage dans la version publiée.

## Interface Campagne du Studio

- Menu « Insérer ici » : actions dédiées pour **Déblocage de L’herbier** (`🌿`) et **Déblocage du Carnet de voyage** (`📖`), avec déplacement automatique si le jalon existe déjà.
- Bandeaux d'état en haut de Campagne, cartes déplaçables par glisser-déposer ou ↑ Monter / ↓ Descendre, inspecteurs dédiés et annulation/rétablissement (`Ctrl+Z` / `Ctrl+Y`).

## Critères de réussite observables

1. Chaque jalon (`unlock_herbarium` et `unlock_travel_book`) peut être inséré, déplacé, glissé-déposé, annulé/rétabli, enregistré, rechargé, publié et retiré dans l'onglet Campagne (Electron E2E).
2. La validation refuse doublons et champs interdits des deux côtés (TypeScript et GDScript) ; les seuils de curseur restent indépendants quand les deux jalons coexistent.
3. `npm run schema`, `sync-game-contract.mjs --check`, `npm run typecheck`, `npm test`, `npm run build` et `npm run test:e2e:built -- tests/e2e/campaign.spec.ts` passent.
