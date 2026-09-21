# V1.4.2 — Ajouter des ennemis aux cinématiques

## Projet livré

Cette archive contient **le projet complet en sources** : React/TypeScript, Node.js/Electron, lecteur Godot, exemples, tests et documentation. Ce n’est pas un exécutable Windows précompilé. Les dépendances de V1.4.1 sont conservées, sans ajout de paquet.

Les images de ta bibliothèque personnelle ne sont pas réembarquées dans l’application. Les cinq images déjà présentes dans `example-library/` restent les exemples historiques ; aucun faux dessin d’ennemi ne leur a été ajouté.

## Installer cette version

Fermer complètement l’éditeur et arrêter le terminal avec `Ctrl+C`. Garder le dossier précédent et les cinématiques enregistrées. Extraire cette version dans un nouveau dossier, puis ouvrir un terminal au niveau du `package.json` :

```powershell
npm install
npm test
npm run dev
```

Le projet demande Node.js 22.12 minimum. La première installation npm nécessite une connexion. Le badge affiche **V1.4.2**. Reconnecter la bibliothèque existante, sans la recopier. Pour produire les exécutables Windows localement, la commande du projet reste `npm run dist:win` ; elle n’a pas été exécutée pendant cette livraison.

## Retrouver les ennemis

Sélectionner **la racine `LunariaArtLibrary`**, celle qui contient `02_characters`, `03_enemies`, `07_props`, etc. Ne pas sélectionner uniquement un sous-dossier `Stage 01` : les chemins sont relatifs à la racine choisie.

```text
LunariaArtLibrary/
├── 02_characters/
├── 03_enemies/
│   ├── Canette/
│   │   ├── Stage 01/
│   │   ├── Stage 02/
│   │   ├── poses/
│   │   └── expressions/
│   └── Pollution/
├── 05_environments/
├── 07_props/
└── 08_ui/
```

Cliquer sur **Actualiser la bibliothèque**, puis sur **Ennemis**. Le bouton **Ennemi**, au-dessus de la scène, ouvre également cet onglet.

La détection reconnaît les dossiers `03_enemies`, `enemies`, `enemy`, `ennemis` et `ennemi`, avec ou sans préfixe numérique, y compris lorsqu’ils sont imbriqués dans un lieu. Les sous-dossiers `Stage 01`, `portraits`, `poses` ou `expressions` restent dans la catégorie Ennemis. Les fichiers audio restent dans Audio. Le nom d’un fichier tel que `enemy_camp.png` ne suffit pas à reclasser un décor.

Les catégories affichées sont **Décors / Personnages / Ennemis / Objets / Bulles / Audio**. Dans une colonne étroite, les six boutons sont répartis sur deux lignes pour conserver des libellés lisibles. La grande bibliothèque comporte aussi Ennemis.

## Ajouter et mettre en scène

Un double-clic sur une image l’ajoute au plan courant. Le glisser-déposer la place à l’endroit du pointeur. Un simple clic sélectionne la ressource, puis le bouton `+` permet également de l’insérer.

L’ennemi apparaît dans les **Calques** avec une icône dédiée ; le panneau de droite indique **ENNEMI** et **Type d’élément : Ennemi**. Il utilise les mêmes outils que les personnages : position, taille, miroir, profondeur, angle, opacité, apparition, déplacement A → B et effets de mouvement.

Pour lui donner une réplique, sélectionner l’ennemi puis cliquer sur **Bulle**. La queue automatique suit cette instance d’ennemi pendant ses déplacements. Il figure aussi dans la liste **Qui parle ?**, avec la mention `(ennemi)`.

Dupliquer un ennemi ou un plan conserve son rôle et ses mouvements. Les copies obtiennent de nouveaux identifiants et leurs bulles sont reliées aux bonnes copies. **Continuer ce plan** conserve les ennemis, comme les autres éléments. Les boutons **Lire depuis ce plan**, **Tout lire** et le raccourci **Maj+Espace** restent présents.

Les mouvements transforment le PNG entier : cette version ne découpe pas une planche de sprites et ne crée pas une animation articulée de combat.

## Une image se trouve ailleurs dans la bibliothèque

Dans la bibliothèque agrandie, sélectionner une image puis cliquer sur **Ajouter comme ennemi**. Le fichier reste à son emplacement d’origine. Cette commande n’est pas proposée pour un fichier audio.

Pour un élément déjà posé, modifier **Type d’élément → Ennemi** dans le panneau de droite. La conversion ne change ni l’image source, ni sa position, ni ses réglages, ni les liens de ses bulles. Elle peut être annulée.

Le **rôle de l’instance dans le plan** et la **catégorie du fichier dans la bibliothèque** sont distincts. Un accessoire de `07_props` ajouté comme ennemi conserve son chemin et reste classé dans Objets lorsqu’on parcourt les fichiers. Il n’est pas copié dans `03_enemies`.

## JSON et compatibilité

La structure existante est conservée : les éléments restent dans `shots[].actors[]`. Le nouveau rôle est `"enemy"`, en complément de `"character"` et `"prop"`. Il n’est pas nécessaire d’ajouter un champ `type` ou de remplacer les boîtes par un objet `position`.

Extrait illustratif d’un acteur, avec un chemin à adapter à une image réelle :

```json
{
  "id": "enemy_instance_01",
  "role": "enemy",
  "name": "Canette",
  "asset": "library://03_enemies/Canette/Stage 01/master.png",
  "x": 0.65,
  "y": 0.5,
  "width": 0.16,
  "height": 0.4,
  "flipX": false,
  "opacity": 1,
  "entry": { "preset": "right", "duration": 0.8, "delay": 0 }
}
```

Les cinématiques existantes **v1 et v2 sont toujours acceptées**. Ouvrir un ancien acteur sans `role` ne le convertit pas silencieusement en ennemi, même si son image se trouve dans `03_enemies` : son comportement hérité reste celui d’un personnage jusqu’à une conversion explicite.

Ajouter ou convertir un ennemi active `schemaVersion: 2`, comme les autres rôles introduits en V1.4. Cette livraison **étend la liste des rôles acceptés par le schéma v2**. Un ancien lecteur V1.4/V1.4.1 ne connaît pas `enemy` et peut refuser ce document ; il faut mettre à jour son schéma. La compatibilité est donc assurée avec les anciens documents, pas avec les anciens lecteurs pour les nouveaux rôles.

## Dans Godot

Remplacer le dossier complet :

```text
godot/addons/lunaria_cinematics/
```

dans le projet du jeu, notamment **`cinematic.schema.json`**. Le schéma du lecteur et celui de l’éditeur sont générés depuis la même définition TypeScript et contrôlés par un test de concordance.

Le lecteur dessine les ennemis via le même système `actors` : images partagées, transformations, mouvements et bulles. Le rôle est conservé dans les données. **Cela ne crée ni ennemi de gameplay, ni intelligence artificielle, ni collisions, ni dégâts.** Ces comportements restent sous le contrôle du jeu.

La racine de bibliothèque Godot et les filtres d’export ne changent pas ; les chemins internes, dont `03_enemies`, doivent être les mêmes que dans l’éditeur. Voir `INTEGRATION_GODOT.md`.

## Vérifications

Les résultats et limites de la livraison sont dans `TEST_REPORT_V1_4_2.md`. Les scénarios d’interface ont utilisé le renderer réel avec un pont Electron simulé. Le build complet Windows et l’exécution dans Godot n’ont pas été validés ici.
