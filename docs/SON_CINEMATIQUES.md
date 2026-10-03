# Musiques et sons des cinématiques

Guide courant, actualisé le **1 octobre 2026**. Les réglages ci-dessous se conservent dans le document unique du projet ; les [preuves datées](VALIDATION.md) distinguent tests du lecteur, échecs Electron et essais sur appareil.

Ouvre une cinématique puis clique sur **Son**, en haut, ou **Configurer le son** dans l’inspecteur. Tu peux aussi choisir un fichier dans l’onglet Audio de la bibliothèque et cliquer sur **Configurer ce son**. Les fichiers OGG, WAV et MP3 restent dans la bibliothèque commune.

## Une musique sur plusieurs slides

Dans **Musiques du film**, cherche un fichier et clique sur **Ajouter une musique**. Choisis **Commence au plan** et **S’arrête après le plan**. La plage inclut ses deux extrémités : du plan 2 au plan 5, la même lecture continue entre ces quatre plans. **Tout le film** sélectionne les plans actuellement présents.

Chaque piste a son volume, sa boucle et deux durées : **Montée progressive** et **Diminution progressive**. Zéro désactive le fondu. Tu peux superposer plusieurs musiques ou ambiances avec des volumes différents.

La fin dépend du déroulement réel : la musique continue pendant l’attente d’une réplique ou d’un clic. Après le dernier dialogue et la durée minimale, le plan reste visible pendant le fondu sonore de sortie. Avec une transition vers le noir, les deux fondus commencent ensemble ; le passage attend le plus long des deux. Une piste sans boucle peut naturellement finir avant son dernier plan.

## Un bruitage lié à un événement

Dans **Sons de ce plan**, ajoute un son et choisis son déclencheur :

- début du plan ;
- ouverture d’une bulle précise ;
- début de l’entrée, du déplacement, de l’effet animé ou de la disparition d’un personnage, ennemi ou objet ;
- début de son animation du catalogue.

Le déclenchement a lieu une seule fois par passage dans le plan. Une animation en boucle ne redéclenche pas automatiquement le bruitage. Le délai se mesure à partir de l’événement réel : un son lié à la deuxième bulle attend son ouverture, même si le joueur reste longtemps sur la première. Les déplacements et effets commencent après l’entrée de l’acteur, conformément aux réglages de mouvement.

**Durée maximale** coupe le son après le nombre de secondes choisi. Zéro le laisse jouer jusqu’à la fin du fichier ou du plan. Les fondus s’appliquent aussi aux sons ; une boucle reste limitée au plan. Un avertissement signale un déclencheur dont l’animation est désactivée.

## Écoute et montage

Le petit lecteur permet d’écouter le fichier au volume réglé. **Écouter depuis ce plan** teste les événements et les fondus dans la cinématique. **Tout lire** teste le film entier. Pause et reprise conservent la position musicale ; quitter l’aperçu arrête tous les sons.

En commençant directement sur un plan intermédiaire, les musiques qui couvrent ce plan repartent du début du fichier : on ne peut pas déduire le temps passé à lire les dialogues précédents. Pour entendre leur progression complète, utilise **Tout lire**.

Les plages suivent les identifiants des plans lors d’un changement d’ordre. Si leurs extrémités sont inversées, la plage est remise dans l’ordre du montage. Supprimer une extrémité réduit la plage aux plans restants ; supprimer toute la plage retire la piste. Supprimer une bulle ou un acteur retire ses sons liés. Ces opérations sont annulables avec Ctrl+Z. Dupliquer un film recrée ses liens internes ; dupliquer un plan conserve ses sons si l’option audio est cochée.

L’ancien audio d’un plan peut être transformé avec **Convertir en plage musicale**. Les réglages sont enregistrés dans le projet et inclus dans la publication des cinématiques pour Godot, avec leurs fichiers sonores.

## Contrat technique

Champs optionnels : `cinematic.musicTracks[]` et `shot.sounds[]`. Les plages utilisent `startShotId` et `endShotId` ; les sons utilisent `event`, `targetId`, `delay` et `duration`. Tous possèdent `id`, `asset`, `volume`, `loop`, `fadeIn` et `fadeOut`. Les durées sont en secondes, le volume entre 0 et 1. Le champ historique `shot.audio` reste lisible.

Le lecteur Godot doit inclure **CinematicAudio.gd**, **CinematicPlayer.gd**, **CinematicValidator.gd** et le schéma actualisé. Tests : `npm test`, `npx playwright test tests/e2e/audio-workflow.spec.ts` après compilation, et `godot --headless --path godot --script res://tests/audio_smoke.gd`.
