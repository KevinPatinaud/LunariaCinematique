# Tâches Studio

- [x] T001 [US1] Étendre le type et le schéma dans `src/shared/model.ts` et `src/shared/schema.ts`.
- [x] T002 [US1] Ajouter la commande dans `src/renderer/cinematics/CinematicWorkspace.tsx` et le choix dans `src/renderer/components/Inspector.tsx`.
- [x] T003 [US1] Dessiner la traînée dans `src/renderer/components/Scene.tsx` et dans `godot/addons/lunaria_cinematics/CinematicPlayer.gd`.
- [x] T004 Générer les schémas, synchroniser le lecteur et vérifier le projet de test dans Electron.

## Vérifications locales

- La compilation de production et les tests Node du Studio passent. Le scénario de publication vérifie la présence de la pensée et de sa cible dans le fichier exporté vers un projet isolé.
- Le scénario Electron dédié passe et couvre l’ajout, la conversion, le réglage des pastilles, la sauvegarde, la réouverture et l’enchaînement dans l’aperçu. Les scénarios de copie d’une bulle de dialogue et d’export JPEG ont aussi réussi.
- Le contrôle de synchronisation ne détecte aucun écart. Les résultats du lecteur natif et la validation du cadrage figurent dans le dossier de l’initiative côté jeu.
- La refonte du contour en nuage et de ses pastilles est vérifiée dans l’aperçu Electron. Les tests du texte et du modèle passent, ainsi que le scénario d’export JPEG.
- Le style par défaut passe au [papier illustré](artwork.md) et le texte des pensées est centré. Les scénarios Electron vérifient le changement de type d’un dialogue, la réouverture, la lecture et la présence du nouveau style dans l’export JPEG. La capture permet de contrôler visuellement les raccords du papier.
