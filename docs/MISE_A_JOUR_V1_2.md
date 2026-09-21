# Installer la V1.2 sur la V1.1

**Le correctif modifie aussi Node, le preload Electron et les modules partagés. Il faut arrêter complètement l’application, pas seulement attendre le rechargement React.**

1. Enregistrer ton travail, fermer le studio et arrêter son terminal avec `Ctrl+C`. Garder une copie du dossier de sources actuel et de tes cinématiques.
2. Extraire le ZIP du correctif. Fusionner le **contenu** de `lunaria-cinematic-studio/` avec ton projet existant, au niveau de son `package.json`. Accepter le remplacement des fichiers. Ne pas créer un projet imbriqué dans un second dossier du même nom.
3. Conserver `node_modules`, ton `package-lock.json`, ta bibliothèque commune et tes JSON. Aucune dépendance n’a été ajoutée ou mise à niveau. Le champ version du projet devient `0.1.2`.
4. Dans un terminal au niveau de `package.json`, exécuter :

```powershell
npm test
npm run dev
```

Le badge de l’interface doit afficher **V1.2**. La compilation du backend/preload est exécutée par `npm run dev` ; il ne faut pas garder une ancienne fenêtre ouverte. Une erreur de compilation doit être conservée telle quelle pour le diagnostic, pas contournée en supprimant les validations.

## Projet complet dans un dossier neuf

```powershell
npm install
npm test
npm run dev
```

La première installation demande une connexion réseau. Le projet demande Node.js 22.12 minimum. L’archive ne contient ni `node_modules` ni un faux fichier de verrouillage des dépendances. Les choix React/Node/Electron de ton projet sont conservés.

## Lecteur dans le jeu

Si le lecteur a déjà été copié dans Godot, remplacer **tout le dossier** `addons/lunaria_cinematics/` par celui du projet V1.2, y compris le **nouveau `CinematicLayout.gd`** et le schéma JSON. Une mise à jour partielle de `CinematicPlayer.gd` échouerait sur le nouveau preload. Faire ce remplacement dans une branche du jeu : le lecteur n’a pas été exécuté dans Godot pendant cette livraison.

Les données restent `schemaVersion: 1`. Aucune conversion ou duplication des images n’est nécessaire. Voir `docs/INTEGRATION_GODOT.md`.

## Recette rapide après redémarrage

Créer deux plans, ajouter un personnage tout en modifiant le nom du plan, puis redimensionner uniquement verticalement. Ajouter une bulle longue, l’enregistrer et la rouvrir. Essayer Annuler lors d’un Nouveau/Ouvrir et lors de la fermeture ; essayer aussi Enregistrer sous. Vérifier enfin un déplacement, sa paire Annuler/Rétablir et une lecture avec pause. Les 35 cas du rapport peuvent servir de recette élargie.

Enregistrer plusieurs cinématiques reste conseillé : la récupération locale protège une session, elle ne remplace pas une sauvegarde du projet ou Git.
