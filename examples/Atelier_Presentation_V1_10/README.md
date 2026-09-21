# Atelier V1.10 — une capacité, deux animations

Ouvrir `atelier.game.json` dans le mode Niveaux. Relier la bibliothèque `game/LunariaArtLibrary` de l’archive du jeu. Choisir ce dossier `Atelier_Presentation_V1_10` comme dossier des cinématiques liées.

Le projet est indépendant de la campagne principale. Il contient une introduction de trois plans et un niveau. Radis et Ronce utilisent tous deux `ab_radish`, dont le slot demandé est `attack`. Radis résout son atlas original à quatre frames ; Ronce résout son animation procédurale propre. La libération du tir vient du marqueur de la définition résolue.

Le son `sound_shoot` et le VFX `vfx_impact` sont placés dans les clips pour être réutilisables dans le film. Le son global de libération est volontairement retiré de cet atelier pour éviter un doublon. Le film ignore les marqueurs `release` : aucun projectile de combat, dégât, récompense ou avancement de campagne n’en découle.

Dans le film, le premier plan utilise deux profils d’espèce, le deuxième déplace un ennemi avec son slot move et une bulle attachée, le troisième associe une référence directe à `radish_throw` et une respiration par défaut. L’ennemi utilise son atlas réel et les slots attack/hit/death/spawn configurables dans sa fiche.

Publier sur une nouvelle extraction du jeu, puis relancer le moteur. Dans le niveau, placer Radis et Ronce dans la voie centrale. Pour observer l’attaque ennemie, laisser au moins un Jeteur approcher d’une plante. Les paramètres de portée/dégâts de Ronce et de PV/vitesse du Jeteur sont spécifiques à l’atelier ; ils n’ont pas été appliqués à la campagne principale.

Vérification manuelle attendue : changer la durée d’une frame de Radis, enregistrer, prévisualiser, publier, retrouver le geste modifié en combat puis dans le film, sans toucher à un script Godot. Vérifier ensuite hit sans double libération, mort pendant préparation, pause/reprise, sons, points d’attache et disparition des effets.

Publication Node avec les vrais fichiers : exécutée deux fois, 34 ressources uniques, une cinématique et un niveau. Lecture native et essai visuel : non exécutés dans l’environnement de réalisation. Voir `docs/TEST_REPORT_V1_10.md`.
