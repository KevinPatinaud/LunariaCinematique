# Générer les deux états du terrain

Dans **Niveaux → Paramètres → Terrain du niveau**, cliquer sur **Générer les terrains pollué et nettoyé (IA)**.

1. Le Studio suit l’ordre de la **Campagne** pour retrouver la cinématique précédente et présélectionne son dernier plan contenant une image de décor. Il ne se base ni sur le rangement des films dans le catalogue, ni sur leur titre. Les films archivés hors du parcours n’interviennent pas.
2. **Cinématique précédente** permet de choisir un autre décor de ce film. **Autre image → Choisir ou importer une référence** ouvre la bibliothèque habituelle, avec l’import d’une image PNG, JPG ou WebP depuis l’ordinateur. Sans film précédent ou sans décor disponible, choisir une référence manuelle.
3. Ajouter éventuellement des précisions et choisir un **Modèle Codex** dans la liste détectée. Ce choix est mémorisé ; **Automatique** laisse Codex choisir son modèle. Le moteur natif d’image reste géré par Codex.
4. **Générer les deux états** crée d’abord un terrain pollué 16:9, puis utilise cette image comme cible d’une retouche pour produire son état nettoyé. La caméra, le cadrage, l’architecture, la lumière et les chemins doivent rester identiques pour le balayage progressif du jeu. Les deux images ont les mêmes dimensions, sont opaques et laissent le centre dégagé pour cinq allées et huit colonnes. Aucun personnage, texte, interface ou quadrillage n’est intégré ; les traces de pollution font partie du décor.
5. Comparer les trois aperçus : référence, **Terrain pollué**, **Terrain nettoyé**. Une grille indicative 5 × 8 peut être affichée sur les deux propositions pour apprécier la lisibilité ; elle n’est pas intégrée aux fichiers. Vérifier notamment que les éléments du paysage restent alignés. **Générer une autre proposition** recrée une paire ; **Changer la référence** permet de repartir d’une autre image.
6. **Utiliser les deux terrains pour le niveau** crée deux PNG séparés sous `studio_generated/terrains/` : `terrain-<id>-pollue.png` et `terrain-<id>-nettoye.png`. Les champs `terrainImage` et `restoredTerrainImage` du niveau sont affectés ensemble. Enregistrer ensuite le projet. Ctrl+Z et Ctrl+Maj+Z annulent/rétablissent les deux affectations en une seule action. Les anciens terrains et la référence restent disponibles.

**Réduire** ou fermer la fenêtre laisse la génération continuer. **Tâches et résultats** retrouve les deux aperçus, y compris après redémarrage. Quitter l’application interrompt les travaux en cours ; leur relance est manuelle. **Annuler la génération** abandonne explicitement le travail sans modifier le niveau. Une paire incomplète ou deux images identiques ne peuvent pas être validées. Une erreur de connexion, de quota, de transparence ou de format ne remplace aucun état du terrain. La génération peut durer plusieurs minutes, avec un délai maximal de quinze minutes par étape. Voir le [guide du suivi commun](TACHES_IMAGES.md).

La fonction nécessite l’application de bureau, une bibliothèque de production et Codex CLI connecté au compte ChatGPT avec un quota disponible. Elle utilise la même connexion que l’adaptation des décors en 20:9, sans clé API supplémentaire. Redémarrer le Studio après une mise à jour du pont natif.

La sauvegarde de campagne et la publication conservent les deux références `library://…`. Le jeu utilise `terrainImage` au départ, puis révèle progressivement `restoredTerrainImage`. La création d’une paire ne publie pas automatiquement la campagne.

## Vérification technique

Les tests `terrain-generation.test.ts` couvrent la référence par ordre de campagne, les films sans décor, la génération isolée, le modèle transmis, les contrôles de résultat, l’annulation et l’import sans écrasement. `tests/e2e/terrain-generation.spec.ts` exerce Electron avec des images déterministes : choix de référence, import, aperçu, affectation, annulation/rétablissement, sauvegarde et réouverture. Ces fixtures valident le parcours technique, pas la qualité artistique du service IA.

Le 22 octobre 2026, un essai réel depuis l’interface a produit les deux états d’un terrain de gare, en deux fichiers opaques de 1672 × 941 pixels. La paire a été inspectée visuellement, affectée et enregistrée dans un projet isolé ; le préflight de publication retrouve les deux ressources. Les tests unitaires et les scénarios Electron restent complémentaires de cet essai artistique réel.
