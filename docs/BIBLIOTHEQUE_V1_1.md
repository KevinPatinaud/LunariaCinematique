# Bibliothèque V1.1 — guide de mise à jour et d’utilisation

Cette mise à jour améliore le panneau gauche du projet V1 fourni. Elle ne modifie ni les images, ni les cinématiques existantes, ni le contrat d’intégration Godot.

## Installer le correctif sur le projet existant

1. Enregistrer son travail, fermer le studio et arrêter `npm run dev` avec `Ctrl+C` dans le terminal. Faire une copie du dossier de sources avant remplacement.
2. Décompresser `Lunaria_Studio_V1_1_correctif_bibliotheque.zip` dans un dossier temporaire.
3. Copier **le contenu** de son dossier `lunaria-cinematic-studio` dans le dossier actuel du projet, là où se trouve `package.json`. Fusionner les dossiers et accepter le remplacement des fichiers concernés. Ne pas créer un deuxième dossier `lunaria-cinematic-studio` à l'intérieur du premier.
4. Conserver `node_modules`, le `package-lock.json` existant, sa vraie bibliothèque et les fichiers `cinematic.json`. Le correctif ne contient aucune image et aucune dépendance supplémentaire.
5. Relancer `npm run dev`. Le badge en haut de l’application indique désormais **V1.1**.

Si les fichiers de l’éditeur ont été modifiés depuis la V1 fournie, comparer les différences avant de les remplacer. Une archive complète des sources V1.1 est aussi fournie pour une installation séparée ; elle contient la même petite bibliothèque d’exemple que la V1.

L’usage d’un `.exe` déjà compilé nécessite une nouvelle compilation après mise à jour des sources. Ce correctif ne remplace pas automatiquement un exécutable installé.

## La colonne gauche

La colonne fait par défaut 368 pixels de large. Attraper son bord droit pour l’agrandir ou la réduire. Sa largeur est bornée pour laisser de la place à la scène ; un double-clic sur le séparateur rétablit la largeur par défaut. Le séparateur est également accessible au clavier : flèches gauche/droite, Maj pour un pas plus grand, Début/Fin pour les limites.

Les boutons **S, M, L** règlent la taille des vignettes : petites, moyennes, grandes. La grille ajuste son nombre de colonnes à la place disponible. Dans le réglage par défaut, elle affiche quatre colonnes. Le bouton voisin permet de passer à une liste compacte montrant également le chemin du dossier.

La largeur, le mode grille/liste et la taille des vignettes sont conservés dans les préférences locales du renderer (`lunaria-library-layout-v2`). Ils ne sont pas écrits dans le `cinematic.json`. Si le stockage local est indisponible, l’éditeur fonctionne avec les réglages par défaut.

## Parcourir les dossiers sans perdre la galerie

Le bouton avec une icône de dossier, sous la recherche, ouvre l’arborescence **au-dessus** de la galerie. Elle ne prend plus une zone fixe de la colonne.

Sélectionner un continent, un personnage ou un lieu ferme ce menu et filtre les ressources, sous-dossiers compris. Le chemin juste en dessous est cliquable : revenir à Europe, Lunaria ou à la catégorie entière se fait directement. Le dossier courant est retenu séparément pour Décors, Personnages, Bulles et Audio tant que la bibliothèque reste connectée. Changer de catégorie efface la recherche pour éviter de masquer involontairement les ressources du nouvel onglet.

Le menu possède sa propre recherche de dossiers, utile pour retrouver un lieu ou un personnage dans une longue arborescence. Les compteurs représentent les ressources de chaque dossier, sous-dossiers inclus.

La recherche principale accepte plusieurs mots, sans exiger les accents, et consulte le nom, le chemin et les libellés français des dossiers. Elle reste limitée au dossier choisi. Le message de recherche vide propose de tout afficher ou de chercher dans toute la catégorie.

## Parcourir toutes les images

Il n’est plus nécessaire de cliquer successivement sur « Afficher 24 autres assets ». La galerie affiche un premier lot puis charge les suivants automatiquement à l’approche du bas. Les miniatures utilisent le chargement différé du navigateur. Un lien de secours « Charger la suite » reste disponible.

Ce mécanisme est un **chargement progressif**, pas une virtualisation complète : les cartes déjà chargées restent montées jusqu’au changement de sélection. Le comportement a été vérifié avec plusieurs centaines de ressources ; de très grandes bibliothèques de plusieurs dizaines de milliers de fichiers demanderaient une optimisation supplémentaire.

Un clic sélectionne une ressource. Un double-clic, la touche Entrée ou le bouton **+** l’utilise dans le plan. Le glisser-déposer vers la scène est conservé. Le résumé de sélection en bas reste compact.

## Vue agrandie

Cliquer **Agrandir** en haut à droite de la bibliothèque. La fenêtre comporte l’arborescence à gauche, une grande grille centrale et l’aperçu de la sélection à droite. Les filtres, le dossier et la sélection sont partagés avec la colonne de l’éditeur.

Un clic montre l’aperçu. Un double-clic ou le bouton d’ajout utilise la ressource puis revient à la scène. Échap ou **Retour à la scène** ferme la fenêtre sans modifier le plan. Le défilement de la colonne latérale est conservé pendant l’ouverture de cette vue. Le glisser-déposer vers la scène se fait depuis la colonne latérale, pas à travers la fenêtre modale agrandie.

Pour un décor, l’aperçu agrandi conserve l’action secondaire **Ajouter comme personnage / objet**.

## Ce qui ne change pas

Le backend Electron/Node, ses permissions de fichiers, le scanner, le preload, le rendu des personnages et bulles, le lecteur Godot et le schéma JSON restent ceux de la V1. Les ressources restent des références `library://` et ne sont jamais intégrées au JSON. Aucune technologie ni dépendance n’a été ajoutée.

Les nouveaux modules concernent seulement les calculs de navigation (`src/shared/libraryBrowser.ts`), les préférences locales (`src/renderer/hooks/useLibraryLayout.ts`) et le séparateur (`LibraryResizeHandle.tsx`). Les tests de navigation sont dans `tests/libraryBrowser.test.ts`.
