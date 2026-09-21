# Lunaria Cinematic Studio V1.4.3 — retrouver ses projets

## Accès immédiat

**Projets récents**, à côté d’**Ouvrir**, affiche les dernières cinématiques enregistrées ou ouvertes. **Ctrl+Maj+O** ouvre le même panneau. **Ctrl+O** conserve son rôle d’ouverture d’un fichier. Le clavier et les raccourcis sont bloqués derrière une fenêtre modale, pendant une opération ou pendant la récupération d’un brouillon.

L’accueil vide propose aussi trois liens directs dans **Reprendre un projet**. **Tout afficher** ouvre la liste complète. Rien ne s’ouvre automatiquement à la place du travail courant.

## Première utilisation et signification de « projet »

Dans cette version, un projet récent est un **fichier de cinématique JSON enregistré sur disque**. Ce n’est ni la bibliothèque graphique, ni le dossier Godot, ni une copie de sauvegarde.

**Ouvrir ou enregistrer une ancienne cinématique une fois dans V1.4.3 suffit pour l’inscrire dans la liste.** Les versions antérieures ne conservaient pas ce registre. V1.4.3 ne reconstitue donc pas rétroactivement les anciennes ouvertures et ne parcourt pas ton disque à la recherche de fichiers.

Un nouveau brouillon non enregistré n’apparaît pas dans les récents ; il reste couvert par les mécanismes existants de récupération et de versions locales. Les exemples apparaissent dans les récents seulement après un véritable enregistrement.

## Contenu de la liste

Chaque entrée affiche le titre, le chemin du fichier, le nombre de plans, la date du dernier enregistrement ou de la dernière ouverture et le nom de sa bibliothèque associée. Le chemin complet distingue deux fichiers portant le même titre. La date est celle de l’action effectuée dans l’éditeur, pas celle d’une modification externe.

Le registre conserve **20 entrées non épinglées** par ordre d’activité et **jusqu’à 10 entrées épinglées** au-dessus. Ouvrir ou enregistrer un fichier déjà connu met à jour son entrée au lieu de le dupliquer. **Enregistrer sous** conserve l’ancien et le nouveau fichier comme deux entrées distinctes.

La recherche ignore les accents et interroge le titre, l’identifiant de la cinématique, le chemin du JSON et celui de sa bibliothèque. Effacer la recherche rétablit la liste complète.

## Reprendre, épingler, ouvrir le dossier

Cliquer sur une ligne **Reprendre** ouvre cette cinématique. **Revenir** désigne le fichier déjà actif : ce bouton ferme seulement le panneau et **ne recharge pas le fichier**, pour conserver les modifications en cours.

La punaise épingle ou détache l’entrée. L’icône de dossier demande au système d’afficher le fichier dans son dossier. La croix retire une entrée de l’historique ; elle ne supprime pas le fichier. **Effacer la liste non épinglée** demande confirmation et conserve les épingles et tous les JSON.

**Échap** ou **Fermer** revient au studio. Le focus clavier revient au bouton Projets récents. Les commandes de lecture et les mouvements de la V1.4.2 restent inchangés.

## Protection du travail courant

Si le document actif comporte des modifications, ouvrir un autre projet propose les choix existants : **Enregistrer**, **Continuer sans enregistrer**, **Annuler**. Annuler cette confirmation ou la boîte d’enregistrement laisse le document courant en place.

Un fichier illisible ou invalide n’est pas installé comme document actif. L’erreur reste visible dans le panneau, sans effacer le brouillon courant. Une écriture de l’historique qui échoue ne transforme pas une sauvegarde JSON réussie en faux échec : l’application signale séparément le problème d’historique.

## Fichier déplacé ou bibliothèque déconnectée

Une entrée dont le fichier manque reste visible avec **Fichier déplacé ou supprimé**. **Retrouver le fichier** ouvre le sélecteur de JSON : sélectionner le nouvel emplacement pour reconnecter l’entrée. Le fichier choisi est validé comme cinématique ; ce n’est pas une recherche automatique du fichier sur le disque. Annuler ne modifie pas l’entrée. Le bouton d’actualisation vérifie de nouveau les emplacements.

Un disque réseau lent peut être indiqué comme temporairement inaccessible. La vérification d’existence possède un délai pour ne pas immobiliser toute la liste. Cela ne garantit pas un délai maximal pour la lecture d’un fichier ou le scan d’une bibliothèque.

La bibliothèque associée est mémorisée lors de l’ouverture/enregistrement puis reconnectée au prochain chargement lorsqu’elle est disponible. Si elle manque, le JSON peut être ouvert, mais un avertissement demande de la reconnecter. Une bibliothèque différente n’est pas conservée silencieusement avec les mêmes références relatives. Utiliser **Choisir ma bibliothèque**, puis enregistrer le projet pour mémoriser son nouvel emplacement.

## Stockage et confidentialité

Le registre local se trouve dans `app.getPath('userData')/recent-projects.json`. Il contient uniquement les chemins locaux, titres, dates, nombre de plans, identifiants et épingles. L’écriture est séquentielle, avec remplacement par fichier temporaire et copie `.bak`. Un registre endommagé peut être récupéré depuis sa copie ; un format futur inconnu n’est pas écrasé.

Aucune image, piste audio ou cinématique complète n’est copiée dans ce registre. Aucun compte cloud, télémétrie ou synchronisation n’a été ajouté. Les chemins absolus ne sont pas ajoutés au `cinematic.json`, qui reste portable avec ses références `library://`.

La liste appartient au profil local de cette application, pas au dossier extrait des sources. Garder le même nom d’application et le même profil utilisateur conserve la liste lors d’une mise à jour. Changer d’ordinateur/profil ou effacer ces données ne transfère pas les récents automatiquement. Retirer une entrée n’est pas un effacement sécurisé de toutes les copies de sauvegarde du registre.

Le mode navigateur de développement affiche un message explicite : cette fonction d’accès persistant aux fichiers est destinée à **Electron**. Dans un navigateur seul, utiliser **Ouvrir** pour sélectionner de nouveau le JSON.

## Installation complète

Fermer l’éditeur et arrêter le terminal avec **Ctrl+C**. Conserver le dossier précédent. Extraire l’archive complète dans un nouveau dossier puis, depuis celui qui contient `package.json` :

```powershell
npm install
npm test
npm run dev
```

Le prérequis déclaré reste Node.js 22.12 minimum. L’installation npm initiale nécessite Internet. Le badge affiche **V1.4.3**. Reconnecter la bibliothèque existante et ouvrir les projets habituels, sans les recopier.

Pour utiliser le petit correctif sur V1.4.2, fusionner son dossier `lunaria-cinematic-studio` au niveau du `package.json` existant, en acceptant les remplacements. Conserver `node_modules`, `package-lock.json`, les bibliothèques et les cinématiques. Puis redémarrer entièrement `npm run dev` : Node et le preload ont changé. Aucune dépendance n’a été ajoutée.

## Compatibilité et validation

Cette évolution est propre à l’éditeur : **aucune migration du cinematic.json, aucun nouveau rôle et aucun changement de l’addon Godot V1.4.2**. Le lecteur V1.4.2 est toujours nécessaire pour les ennemis introduits précédemment.

L’archive est un projet en sources, pas un EXE précompilé. Les résultats et limites des essais figurent dans [le rapport V1.4.3](TEST_REPORT_V1_4_3.md). Les rapports antérieurs restent historiques.
