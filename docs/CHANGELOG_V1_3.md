# V1.3 — édition, historique et vérifications

## Modèle et commandes

Ajout de `commands.ts`, refonte compatible de `history.ts` autour de commandes immuables et réversibles. Une action de groupe crée une seule commande ; les commandes asynchrones périmées sont refusées ; l’historique reste limité à 80 étapes. Les séquences de saisie sont regroupées sans fusionner deux gestes distincts.

`studio.ts` centralise les déplacements groupés, bornes, alignements, répartition, duplication et suppression avec conservation des liens, ordre des calques, placement de bulles, modèles et duplication de plan. Ces fonctions sont testables indépendamment de React.

`diagnostics.ts` produit des problèmes structurés associés aux plans/objets et des propositions de correction explicites. `collections.ts` traite les favoris et récents sans dupliquer les assets.

## React

Panneau Calques, boîtes de modèles/duplication/versions, diagnostics, préférences locales et raccourcis. Canvas : sélection rectangle, multi-sélection et glissement groupé, aimants désactivables avec Alt, annulation avec Échap. Les bulles sont placées automatiquement à leur création et sur demande.

Les aides œil/cadenas sont volontairement locales au poste et sans effet pendant la lecture. L’historique de dialogue reste séquentiel. Le format de la cinématique est inchangé.

Les essais d’interface ont notamment permis de corriger un raccordement manquant des collections et une interception trop large du clavier qui empêchait Suppr après une action sur un bouton. Les essais supplémentaires couvrent le véritable glissement avec pointeur et les poignées, pas uniquement les commandes clavier.

## Node / Electron

`VersionStore` conserve jusqu’à 20 instantanés JSON, avec écriture temporaire puis remplacement, files d’exécution, validation, clés de document bornées, rejet des traversées de chemin et des liens symboliques de version. Un fichier d’instantané endommagé n’empêche pas la lecture des autres.

`DocumentFiles` relie les snapshots aux sessions, au brouillon de récupération et au chemin du document. Enregistrer sous conserve les deux historiques ; une version chargée ne modifie pas le JSON original. Le preload expose uniquement les trois méthodes autorisées pour lister, créer et charger les versions. Les contrôles d’origine IPC, l’isolation et le sandbox restent en place.

Un profil temporaire opt-in `LUNARIA_E2E=1` / `LUNARIA_TEST_USER_DATA` permet les tests natifs sans altérer le profil habituel ; ignoré dans une application empaquetée.

## Distribution et limites

Version npm `0.1.3`, badge V1.3. Playwright est ajouté uniquement comme dépendance de développement. Pas de changement des dépendances d’exécution ni du schéma JSON. Le lecteur Godot et les cinq images d’exemple sont conservés.

Pas d’export vidéo, de timeline avancée, d’animation articulée, de gestion cloud ni de collaboration ajoutés dans cette version. L’auto-placement est heuristique et le masquage de calque n’est pas un effet de cinématique.
