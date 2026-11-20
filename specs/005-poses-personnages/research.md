# Recherche

- Réutiliser runCodexImage, l’authentification CLI existante et la file/lifecycle communs ; aucune API directe ni clé supplémentaire.
- Le chemin identifie personnage/stade ; le nom libre de l’acteur ne suffit pas. Priorité au Master à la racine du stade ; choix explicite sinon.
- Transmettre le Master et, si différente, l’image courante comme contexte complémentaire.
- Une animation masque actor.asset dans Electron et Godot : supprimer réellement animation lors de l’affectation fixe ; conserver id et ancrage sous rotation.
- La publication collecte déjà actor.asset : aucun nouveau comportement GDScript.
- Recherche d’intégration déléguée en lecture seule conformément à speckit-plan et vérifiée dans les sources.
