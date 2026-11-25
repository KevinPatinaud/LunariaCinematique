# Trajectoire incurvée dans les cinématiques

Initiative commune `cinematic-curved-movement`, reliée à `Lunaria/specs/008-curved-movement/`.

- L’auteur sélectionne un élément avec un déplacement A → B et tire la poignée au milieu du trajet pour incurver le tracé dans les deux sens. Les deux extrémités restent en place.
- L’inspecteur permet de régler la courbure au clavier et de rétablir la ligne droite. L’annulation et la sauvegarde s’appliquent comme aux autres réglages du plan.
- L’aperçu et Godot suivent le même tracé à l’aller comme au retour. La durée et la progression choisies s’appliquent à la distance parcourue le long de la courbe. Les pas synchronisés tiennent compte de cette distance.
- Les trajets existants restent droits. Si A et B coïncident, l’élément reste en place.
