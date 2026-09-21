# Lunaria Studio V1.6 — Cinématiques, niveaux et équilibrage global

## Livrables et installation

Deux projets complets sont livrés : `lunaria-cinematic-studio/` pour l’outil React/Node/Electron et `game/` pour le jeu Godot qui interprète ses données. Ce sont les sources, pas des exécutables Windows ni des APK.

Conserver les anciennes versions. Extraire dans **deux nouveaux dossiers**, sans superposer les fichiers : les anciens catalogues `.tres` ont été retirés des ressources actives. Ne pas recopier `node_modules`, `.godot` ni les caches de tests.

Dans le dossier du Studio contenant `package.json` :

```powershell
npm install
npm test
npm run dev
```

Node.js 22.12 minimum, accès Internet nécessaire à la première installation. Dépendances déclarées conservées de V1.5 ; aucune dépendance ajoutée. Le nom du produit devient **Lunaria Studio**, mais l’identité de l’application reste inchangée pour ne pas déplacer ses préférences existantes. Le dossier de sources garde son ancien nom pour faciliter le remplacement de ton environnement de développement.

Importer ensuite `game/project.godot` dans Godot, laisser les ressources s’importer puis lancer F5. Le projet conserve la déclaration Godot 4.7 de l’archive d’origine. L’exécution native et les exports restent à valider sur ton installation.

## Les deux modes

La barre supérieure propose **Cinématiques** et **Niveaux**. Le mode Cinématiques reste ouvert par défaut et conserve les plans, objets, ennemis, bulles, animations, bibliothèque, récents et lecteur V1.5. Aucun changement du format de ses `cinematic.json`.

Changer de mode conserve les deux documents en mémoire. Une lecture cinématique en cours est arrêtée lors du passage aux niveaux. Chaque mode possède son historique, son fichier, sa récupération et ses projets récents. Fermer l’application demande de traiter les modifications non enregistrées dans les deux modes.

Le mode Niveaux comporte trois sections : **Niveaux**, **Plantes alliées — Équilibrage global**, **Ennemis — Équilibrage global**. Les deux dernières ne sont pas des modes supplémentaires : elles constituent le catalogue commun du projet de jeu.

## Créer ou modifier un niveau

La campagne fournie contient les 40 missions existantes. Les dialogues, objectifs, noms, lieux et plantes précédemment proposées sont importés comme base de travail. Les apparitions sont désormais des données explicites : 147 vagues, 1 511 ennemis planifiés au total. Ce total ne comprend pas de renforts implicites ; les anciens renforts de boss ont été retirés.

La liste de gauche offre recherche et filtre de continent. **Créer un niveau**, **Dupliquer**, **Supprimer**, les flèches monter/descendre permettent d’organiser la campagne. Un identifiant stable est créé à l’ajout ; dupliquer renouvelle aussi les identifiants des vagues et des groupes. Renommer ou réordonner ne change pas l’identité du niveau.

**Paramètres** : titre, continent, lieu, graines initiales, objectif, consigne et conseil. Le plateau reste cinq allées sur huit cases ordinaires. Aucun terrain spécial, évolution ou choix de difficulté n’est réintroduit. Le continent choisit la famille visuelle déjà disponible dans le jeu ; ce panneau n’est pas un peintre de tuiles ou un importeur de nouveaux décors de combat.

**Plantes disponibles** : cocher les espèces utilisables. Le jeu impose précisément cette liste, sans retirer une espèce à cause d’une ancienne règle de déblocage. L’équipe comprend cinq espèces si la liste en contient au moins cinq, toutes les espèces sinon. Les statistiques sont affichées en lecture seule ici : une modification passe par le catalogue global.

**Vagues & ennemis** : chaque groupe définit espèce, nombre, allée (1 à 5 ou aléatoire), début relatif au démarrage de la vague et intervalle entre apparitions. Ajouter, dupliquer ou retirer une vague, ajouter ou retirer un groupe. Un ennemi unique a un intervalle sans effet. Les valeurs temporelles acceptent la virgule française.

Exemple : huit ennemis, début 2 s, intervalle 1,5 s produisent des arrivées à 2 / 3,5 / 5 / 6,5 / 8 / 9,5 / 11 / 12,5 secondes. Les groupes s’exécutent en parallèle dans la vague. Le jeu conserve ses règles de lancement et de fin de vague.

**Aperçu des arrivées** : lecture, pause et curseur sur les cinq allées. Il montre le planning, pas le déplacement des ennemis ni une simulation de combat. Les allées aléatoires sont marquées « ? » ; les positions de ces marqueurs servent à les rendre visibles, pas à prédire le tirage du jeu.

**Récit & objectifs bonus** : répliques d’introduction, pendant la mission et après la victoire. Le déclenchement intermédiaire est choisi par numéro de vague. L’insertion/suppression d’une vague antérieure conserve le lien à la vague d’origine ; supprimer cette dernière désactive le déclencheur et oblige à choisir une nouvelle vague si le récit existe. Les anciens objectifs bonus sont conservés et présentés en lecture seule dans cette première version. Un nouveau niveau n’en reçoit pas automatiquement.

Le sauvetage nécessite au moins trois ennemis `thorn_knot` explicitement placés dans la dernière vague. Les autres opérations restent suivies hors plateau. Le validateur décrit les conditions manquantes au lieu de créer des ennemis cachés.

## Calibrage partagé

Les 28 plantes et 13 ennemis du jeu possèdent **une seule définition par espèce** dans `balance`. Aucun niveau ni groupe d’apparition ne peut contenir une surcharge de PV, dégâts, cadence, armure ou multiplicateur. Un réglage global est immédiatement visible dans les fiches de tous les niveaux du Studio et s’applique au jeu après publication et redémarrage.

Plantes : PV, dégâts par attaque, intervalle entre attaques, portée, coût en graines, recharge de plantation, comportement parmi les comportements du moteur, intensité/rayon des effets, armure et résistances, libellés et description.

Ennemis : PV, vitesse, attaque de contact en PV/seconde, portée, dégâts au jardin en cas de fuite, récompense en graines, armure et résistances ; dégâts de l’attaque spéciale pour les boss concernés.

Types de dégâts :

| Type | Calcul |
|---|---|
| Physique | dégâts × (1 − résistance physique) × (1 − armure), sauf armure déjà brisée |
| Perforant | dégâts × (1 − résistance perforante), ignore l’armure |
| Toxique | dégâts × (1 − résistance toxique), ignore l’armure |
| Pur | dégâts, ignore armure et résistances |

L’interface utilise des pourcentages de protection, le JSON des fractions entre 0 et 0,95. La force d’une attaque de plante est distincte de l’attaque de contact d’un ennemi, exprimée par seconde. Un intervalle plus faible fait attaquer la plante plus souvent.

Les types s’appliquent réellement au combat, y compris au poison et aux attaques spéciales. Les particularités des espèces, formes de projectile, réactions et durées de certaines capacités restent des règles globales du moteur. Modifier « Capacité (libellé) » ne crée pas une nouvelle IA ni une nouvelle animation. Le Studio calibre le catalogue existant ; l’ajout d’une espèce entièrement nouvelle demande encore de développer son comportement et ses ressources dans le jeu.

Les multiplicateurs de PV par mission et par vague ont été retirés. Les boss ne génèrent plus de renforts non décrits : ajouter les renforts souhaités en groupes explicites. Les auras de soutien et autres effets temporaires du combat sont conservés ; ce sont des règles communes dépendant de la situation, pas des statistiques de base variables par niveau ni des améliorations permanentes.

**La campagne doit être rééquilibrée par des parties réelles.** Retirer les multiplicateurs et les renforts modifie la puissance et la composition des combats. Les 40 missions constituent un point de départ éditable, pas une campagne déclarée équilibrée par des tests de code.

## Fichier et publication dans le jeu

**Enregistrer** produit un fichier tel que `lunaria.game.json`, contenant le catalogue global et la liste ordonnée des niveaux. Ce fichier reste indépendant des `cinematic.json` et ne copie aucune image. **Ouvrir** accepte également le fichier actif du jeu `content/design/game_content.json`. Ne pas ouvrir une cinématique dans ce panneau.

**Publier dans le jeu** : fermer la partie en cours, enregistrer le projet de Studio, cliquer le bouton puis choisir le dossier `game` contenant `project.godot`. Après confirmation, le Studio valide le document et remplace seulement :

```text
game/content/design/game_content.json
```

Une sauvegarde `.bak` conserve la version précédente. Le jeu destinataire doit être la version livrée avec ce Studio : l’ancien jeu ne connaissait pas ce contrat. Les ressources graphiques, les cinématiques et leurs associations ne sont pas copiées ou réécrites. Relancer le jeu pour prendre en compte la publication ; il n’y a pas de rechargement à chaud d’un combat.

Depuis le jeu :

```powershell
node tools/game-content.mjs
node tools/test-game.mjs --static-only
node tools/test-game.mjs --godot "C:/Godot/Godot.exe"
```

La publication peut servir à un futur export Android ou Windows puisque le JSON est inclus par les profils d’export. Il faut ensuite réaliser cet export dans Godot ; le Studio ne produit pas directement d’APK.

## Sauvegardes et sécurité

La sauvegarde de développement du jeu est liée à l’empreinte du document publié :

```text
user://lunaria_profile_v12_<empreinte_du_contenu>.json
```

**Une modification du contenu (même un titre ou un texte) crée un autre profil de jeu au prochain lancement.** Cela évite de reprendre un combat ou une progression avec un catalogue différent. Publier le même contenu, ou changer uniquement la mise en forme du JSON, conserve l’empreinte. Les anciens profils restent sur disque, sans lecture ni conversion. Il n’existe aucun module de migration.

Dans le Studio, les opérations sur fichiers sont sérialisées. Les sauvegardes écrivent via un temporaire ; la dernière version est conservée en `.bak`. Un document modifié à l’extérieur est signalé au lieu d’être écrasé silencieusement. Le bouton Récents garde jusqu’à 20 projets de niveaux. Une copie locale de récupération protège le brouillon, même s’il comporte une erreur sémantique telle qu’aucune plante autorisée.

La publication et l’enregistrement final refusent les références absentes, IDs dupliqués, champs inconnus et valeurs hors bornes. Limites : 1–200 niveaux, 1–50 vagues par niveau, au plus 256 ennemis par vague ; calendrier d’une vague limité à une heure. Les avertissements de composition ne remplacent pas une évaluation d’équilibrage.

## Cinématiques et ordre de campagne

Le lecteur générique et les formats cinématiques v1/v2/v3 restent présents. Les associations utilisent maintenant les identifiants des niveaux (`intro:mission_01`, par exemple), pas leur rang, afin qu’un réordonnancement ne montre pas le mauvais film.

La galerie du jeu permet les associations locales. Le publieur `tools/cinematics.mjs --bind intro:0` accepte encore un indice comme commodité de commande, le résout immédiatement et enregistre l’identifiant stable. Supprimer un niveau laisse éventuellement une association devenue inutilisée ; elle n’est pas réaffectée arbitrairement à un autre niveau. Un renommage de son titre ne change pas l’association.

## Limites vérifiées

612 tests Node du Studio, 67 tests de données/architecture du jeu et 49 tests du publieur de cinématiques ont réussi. 37 scénarios d’interface ont été exécutés dans Chromium avec React 18.2 et un pont vers les véritables services Node de fichiers.

Le React 19.3 et l’Electron déclarés dans `package.json` n’étaient pas installables ici. Le typecheck complet s’arrête sur la dépendance manquante `vite/client`. Le build, les fenêtres Electron natives, Godot et les exports n’ont pas été exécutés. Les scénarios natifs sont fournis pour votre environnement. Voir le rapport séparé avant une utilisation en production.

Aucune police binaire n’est distribuée. Les fichiers de licence et les mécanismes de repli sont conservés ; utiliser vos polices locales aux chemins prévus pour retrouver exactement le rendu d’origine.
