# Lunaria Cinematic Studio V1.5 — Animations et texte vivant

## Installation

Cette archive contient le **projet complet en sources**, pas un exécutable Windows précompilé. Conserver la version précédente et extraire dans un nouveau dossier. Dans le dossier contenant `package.json` :

```powershell
npm install
npm test
npm run dev
```

Node.js 22.12 minimum et Internet pour la première installation des dépendances. Aucune nouvelle dépendance n’a été ajoutée à V1.4.3. Le badge attendu est **V1.5**. Reconnecter la bibliothèque existante, sans la recopier. Les projets récents restent dans le profil local de l’application : ne pas effacer ce profil.

## 1. Faire écrire le texte progressivement

Sélectionner une bulle dans la scène ou les calques. Dans le panneau de droite, descendre jusqu’à **Animation du texte**, puis cliquer **Écriture**. Le réglage **Caractères par seconde** contrôle la vitesse ; **Délai de départ** ajoute une attente après l’apparition de cette réplique.

Cliquer **Tester ce texte** pour voir le résultat. Le curseur sous la scène permet de revenir à un instant précis. Il met l’aperçu en pause pendant le réglage ; le bouton à gauche reprend la lecture. **Retour au placement** ferme l’aperçu sans changer le projet, la sauvegarde ni l’historique d’annulation. La caméra reste fixe et l’audio n’est pas lancé dans cet aperçu local.

La bulle garde sa taille et ses retours à la ligne pendant toute l’animation. Les caractères invisibles conservent leur place. Les accents composés et les emoji joints sont traités comme des unités visuelles complètes plutôt que coupés en octets ou en fragments Unicode.

**Pendant la vraie lecture :** un premier clic, Espace ou une action tactile termine l’écriture en cours ; le clic suivant passe à la réplique suivante. Cela ne fait pas avancer artificiellement l’horloge des mouvements de personnages. Après une apparition déjà terminée, un seul clic passe à la suite.

## 2. Faire jaillir les lettres pour un cri

Sélectionner la bulle et cliquer **Cri !**. Le texte apparaît d’un coup : les lettres grossissent, s’écartent et tournent légèrement, puis retrouvent leur place. La bulle et le décor ne sont pas secoués. **Intensité** règle l’amplitude, **Durée du cri** règle le temps avant le retour à une lecture stable. La valeur par défaut est 0,65 seconde.

Cet effet est **toujours ponctuel**, pas un clignotement permanent. Il ne supprime pas le texte et ne détruit pas la bulle. Les transformations sont limitées aux bords de la zone de texte pour éviter de couper les premières et dernières lettres. Un texte déjà trop long pour sa bulle reste signalé par les diagnostics : l’effet ne réduit pas automatiquement sa police pour le faire tenir.

Une réplique comme « ATTENTION ! » fonctionne bien avec **Tout le texte immédiatement + Cri**. L’éditeur ne détecte pas automatiquement les cris depuis les majuscules : c’est un choix de mise en scène.

## 3. Combiner apparition et expression

| Apparition | Résultat |
|---|---|
| Tout le texte immédiatement | Texte présent dès le délai écoulé. |
| Écriture progressive | Révélation caractère visuel par caractère visuel. |
| Mot par mot | Révélation par groupes séparés par des espaces ou retours à la ligne. |
| Fondu du texte | Opacité croissante de toute la réplique. |

| Expression | Résultat |
|---|---|
| Aucun | Pas de déplacement des lettres. |
| Cri · explosion des lettres | Jaillissement puis retour au repos, une seule fois. |
| Vague | Oscillation verticale décalée entre lettres. |
| Tremblement | Petits mouvements et rotations déterministes. |
| Lettres bondissantes | Bonds successifs décalés. |

Une apparition peut se combiner à une expression : écriture progressive + tremblement, par exemple. **Répéter l’expression en boucle** concerne vague, tremblement et bonds, pas le cri. Une boucle n’empêche pas de continuer la réplique. **Sans animation** rétablit une apparition instantanée sans effet ni délai.

Les réglages portent sur **toute la bulle**, narration comprise. Cette version ne permet pas encore de sélectionner un seul mot pour lui appliquer une autre animation, ni d’animer des styles riches de façon indépendante. Une réplique distincte permet de mettre un cri en valeur sans toucher à la précédente.

## 4. Lecture automatique

Décocher **Attendre le clic du joueur** pour une réplique automatique. Le **Temps de lecture après l’animation** est ajouté au temps nécessaire à l’écriture et au premier cycle de l’effet.

Exemple : texte révélé en 2 secondes et temps de lecture réglé à 3 secondes = au moins 5 secondes d’affichage. Un clic à 0,5 seconde pour révéler le texte lance alors ces 3 secondes de lecture depuis ce clic. Un deuxième clic passe directement à la suite.

Le délai du texte se mesure depuis le début de **sa propre réplique**, non depuis le début du plan. Les bulles continuent d’apparaître successivement. Une durée de plan reste un minimum ; les dialogues peuvent la prolonger. Une apparition de plus de 30 secondes fait l’objet d’un avertissement, sans perte du texte.

## 5. Animer personnages, ennemis et objets

Les trois catégories utilisent les mêmes réglages. Sélectionner un élément, puis régler son apparition, ses mouvements et sa disparition dans le panneau de droite.

**Nouvelles apparitions :** depuis le haut, rebond d’apparition, zoom d’apparition. Les entrées existantes (fondu, gauche, droite, bas) restent disponibles.

**Nouveaux effets :**

- **Acquiescement** : petite inclinaison accompagnée d’un mouvement vertical du PNG entier.
- **Recul · impact** : recul puis retour en place, en une fois par défaut ; le miroir horizontal change le sens du recul.
- **Battement** : deux pulsations de taille par cycle.
- **Virevolte** : oscillation verticale avec plusieurs inclinaisons dans le cycle.

Ils s’ajoutent au flottement, balancement, respiration, rotation continue, tremblement et petit bond déjà présents. Un effet peut se combiner au trajet A → B et à l’apparition de l’élément. Un seul effet continu et un seul trajet sont actifs par élément ; il ne s’agit pas d’un empilement libre de pistes.

Le délai du mouvement ou de l’effet commence **après la fin de l’entrée**, comme avant. Le point d’appui peut rester au centre, en haut ou en bas selon l’effet. Utiliser **Tester les animations de l’élément** ou **Aperçu des animations** pour inspecter le résultat.

**Ces effets transforment l’image entière.** Ils n’articulent pas les membres, ne lisent pas les cases d’une spritesheet et n’extraient pas un accessoire déjà peint dans le décor. Pour animer un objet séparément, il faut son propre fichier image, idéalement transparent.

## 6. Faire sortir un élément

Dans **Disparition**, choisir un fondu, une sortie vers l’un des quatre côtés ou un rétrécissement. Régler **Début dans le plan** et **Durée**.

Le début de sortie est une date absolue en secondes depuis le début du plan. À cet instant, l’élément quitte sa position animée courante ; son trajet et son effet cessent d’avancer pendant la sortie. Une fois sorti, il reste invisible, même si le dialogue prolonge le plan. Choisir **Reste dans la scène** pour désactiver la sortie.

Les diagnostics préviennent lorsque la sortie dépasse la durée minimale du plan ou interrompt une entrée. Une queue de bulle liée suit la transformation de son locuteur ; si l’élément disparaît, le texte n’est pas automatiquement supprimé. Organiser les répliques en conséquence.

**Continuer ce plan** ne ressuscite pas un élément dont la sortie est déjà terminée au temps minimal estimé de fin du plan. Le temps de révélation des dialogues automatiques entre dans cette estimation. L’attente réelle d’un joueur reste inconnue pendant l’édition : vérifier la continuité d’un plan interactif manuellement. Les éléments conservés ne rejouent pas la sortie du plan source.

## 7. Exemple fourni

Le fichier `examples/animations_texte.cinematic.json` comprend cinq plans : écriture progressive, cri, mot par mot avec vague, hésitation tremblante, puis animations communes aux trois rôles.

Pour l’ouvrir : sélectionner **Bibliothèque exemple**, puis **Ouvrir** et choisir ce fichier. Les cadres du dernier plan servent de supports de test pour les rôles personnage/ennemi/objet : ce ne sont pas de nouveaux personnages. Aucun visuel canonique de héros ou d’ennemi n’est inventé. Remplacer ces images par les ressources de sa bibliothèque pour une vraie scène.

## 8. Compatibilité et Godot

Les anciens fichiers **v1 et v2 restent ouvrables** et gardent leur format tant qu’aucune fonction réservée à V1.5 n’est utilisée. Enregistrer une nouvelle animation de texte, une nouvelle entrée, un nouvel effet ou une sortie nécessite **`schemaVersion: 3`**. Un fichier déjà v3 n’est pas redescendu silencieusement à v2. Les références restent `library://` ; aucune image n’est copiée ou embarquée dans le JSON.

**Remplacer tout le dossier `addons/lunaria_cinematics/` dans Godot**, y compris `CinematicText.gd`, `CinematicMotion.gd`, `CinematicLayout.gd`, `CinematicPlayer.gd`, le validateur et `cinematic.schema.json`. L’ancien lecteur V1.4.x refuse le format v3.

Des contrats de test sont fournis pour la comparaison des calculs TypeScript/GDScript :

```powershell
godot --headless --path godot --script res://tests/motion_parity.gd
godot --headless --path godot --script res://tests/animations_parity.gd
```

La lecture native Godot et le build Electron Windows **n’ont pas été exécutés dans l’environnement de livraison**. Les différences de métriques de police entre Georgia/serif dans l’éditeur et la police choisie dans Godot peuvent modifier légèrement les glyphes. Aucun fichier de police n’est distribué. Tester le rendu et les performances sur le téléphone cible.
