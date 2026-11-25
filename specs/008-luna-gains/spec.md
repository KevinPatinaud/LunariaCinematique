# Spécification — Gains de Lunas (Studio)

- **Initiative commune** : `luna-gains-economy`
- **Dépôt associé (consommateur Godot)** : `C:/dev/Lunaria/specs/006-luna-gains/`
- **Contrat partagé** : `docs/CONTRAT_STUDIO_GODOT.md`
- **Date** : 2026-11-22

## Intention utilisateur

Permettre à l'auteur de configurer intégralement dans Lunaria Studio le système de gains de la monnaie virtuelle **Luna(s)** pour le jeu solo hors-ligne :

1. **Première victoire d'un niveau** : prime versée une seule fois lors de la première victoire du niveau.
2. **Primes de maîtrise par niveau** : primes versées une seule fois par niveau (y compris lors d'un rejeu), selon trois conditions indépendantes et désactivables (`0`) :
   - *Sans plante perdue* (`lost_plants == 0`),
   - *Sans utiliser la pluie* (`rain_uses == 0`),
   - *Biodiversité* (toutes les plantes autorisées du niveau posées au moins une fois par le joueur durant la partie ; automatiquement inactive si le niveau compte moins de 2 plantes autorisées).
3. **Drops aléatoires sur les pollueurs éliminés** : probabilité configurable par ennemi vaincu (par défaut `10 %`) de lâcher un petit ou un grand gain de Lunas (par défaut `5` Lunas dans `80 %` des cas et `25` Lunas dans `20 %` des cas, soit `largeChance = 0,20`).
4. **Écran d'accueil** : prise en charge du jeton `{lunas}` dans les textes et l'aperçu de l'écran d'accueil.

La dépense / boutique des Lunas (et d'éventuels achats en argent réel) fera l'objet d'un chantier ultérieur ; cette spécification couvre exclusivement les gains, leur configuration dans le Studio, le contrat publié et l'exécution dans le jeu.

## Règles et cas limites

- Les champs `lunas` (au niveau projet) et `lunaRewards` (par niveau) sont **optionnels** dans le schéma JSON afin que tout projet existant reste valide avec les valeurs par défaut (`10 %`, `5` ou `25` Lunas à `80 %` / `20 %`, `firstClear = 1000`, `noPlantLost = 250`, `noRain = 250`, `biodiversity = 250`).
- Le champ racine historique `rewards` reste interdit.
- Validation stricte :
  - `enemyDrop.chance` et `enemyDrop.largeChance` dans `[0, 1]`.
  - `enemyDrop.smallAmount` et `enemyDrop.largeAmount` entiers dans `[1, 10000]` avec `smallAmount <= largeAmount`.
  - Primes entières `>= 0` bornées (`<= 100000`).
  - `biodiversity > 0` sur un niveau comptant moins de 2 plantes autorisées produit un avertissement (et ne compte pas dans le total actif).
- Les onglets existants (`Comparer les graines`, barre principale sans bouton `Récompenses`) restent inchangés pour ne pas casser les flux ni les tests E2E existants.

## Critères de réussite observables

1. Un auteur peut ouvrir l'onglet **Lunas** sur n'importe quelle fiche de niveau et régler la prime de première victoire et les trois primes de maîtrise, avec calcul en direct du total garanti et de l'espérance de drops.
2. Un auteur peut ouvrir **Plus → Économie Luna** pour régler les drops aléatoires (activation, chance %, petit gain, grand gain, part du grand gain %), consulter la synthèse de la campagne et comparer/ouvrir les réglages Luna de chaque niveau.
3. Un auteur peut insérer `{lunas}` dans un texte de l'écran d'accueil et simuler le solde dans l'aperçu.
4. La sauvegarde, la validation, la compilation de campagne, la publication et la synchronisation du contrat vers Godot réussissent sans erreur ni écart.
