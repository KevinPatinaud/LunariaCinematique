# Recherche

- Le chargement de startPlayback dans App capture le film puis attend sans contrôle de documentEpoch. Le sélecteur de film peut changer de document pendant cette attente. Résultat : ancien index appliqué au nouveau film.
- L’état et l’audio de lecture sont distribués entre trois états, plusieurs refs, callbacks JSX, chargements et effets. Décision : en faire un cycle de vie unique ; ne pas extraire simplement les mêmes variables dans un composant géant.
- animationUsages parcourt déjà tout le projet ; App recompte le film actif et l’ancien IPC rescane les films embarqués sans lire le disque. Décision : une analyse pure unique et une vérification immédiate de suppression.
- Conserver les erreurs de films absents et les usages hors parcours. L’analyse ne dépend pas de la sélection courante.
- Alternatives écartées : nouveau contrôleur global reproduisant ProjectSession, retrait de fonctions disponibles sans preuve d’inutilité, simple renommage/déplacement de JSX.
- Lors du retrait du service, les sorties TypeScript conservaient son ancien JavaScript : TypeScript ne purge pas les sources supprimées. Les commandes test/schema/build nettoient maintenant leurs seuls dossiers de compilation connus avant génération ; les sources et les dossiers liés restent protégés.
