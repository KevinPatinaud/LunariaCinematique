# Données

Les modèles GameProject, Cinematic, le contenu publié et le profil restent définis à leurs sources actuelles. Le contrôle de copies compare des fichiers techniques; aucun champ de données joueur ou auteur n’est ajouté.

Le manifeste technique `game/tools/design/sync-manifest.json` contient `{ version: 1, files: string[] }`. Les chemins relatifs autorisés désignent seulement les modules JavaScript du contrat, les deux schémas/defaults connus et les fichiers `.gd`, `.tscn` ou `.json` du lecteur. Il permet de retirer une copie précédemment gérée dont la source a disparu. Il ne contient ni données de campagne, ni médias, ni `.uid`, ni état joueur.
