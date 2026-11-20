# Validation — Lierre unique

Date : 25 octobre 2026. Initiative : lunaria-lierre-20261025.



| Contrôle | Résultat |
| --- | --- |
| Studio : types et build | Réussis |
| Tests du Studio | 1 194 réussis, 4 ignorés par la suite existante |
| Scénarios Electron | 2 réussis, dont l’ouverture des quatre films du projet réel sur une copie isolée |
| Tests Node du jeu | 142 réussis |
| Scénarios Godot rapides | 45 réussis, contrôlés avec leurs corrections ciblées |
| Campagne / cinématiques | 7 / 8 scénarios réussis |
| Paquet exécuté hors des sources | 6 scénarios réussis |
| Captures des personnages | 24 relues, 49 contrôles réussis |
| Rendus de combat | 3 scénarios réussis |
| Ressources réelles de l’APK | 300 références vérifiées ; 41 contrôles natifs réussis, dont le décodage des 9 références de frames de Lierre |

Les catalogues de l’APK et du projet publié sont identiques. Les ressources extraites de l’APK ont été vérifiées avec Godot sur PC ; cela ne remplace pas une exécution de l’application sur Android.

Quelques anciens tests supposaient encore l’absence de borne de fin et des primes de Compresseur à 150 graines. Ils ont été adaptés au contrat et aux valeurs d’auteur existantes : 300 graines par poussée et 0 à la dernière vague, inchangées par ce chantier.


## Preuves et limites

Les nombres et l'empreinte de l'APK sont consignés dans validation-results.json. Les journaux et captures de travail sont conservés sous C:/Users/kevin/Documents/Codex/2026-10-25/d/work/lierre. Les sources d'auteur ont été copiées avant écriture et comparées : ennemis, autres plantes, niveaux, étapes et autres acteurs préservés ; erreur verticale maximale des pieds dans les films : 0.

Commandes : npm test ; npm run schema ; node scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game ; npm run build ; npm run test:e2e:built -- tests/e2e/ivy-attack.spec.ts tests/e2e/ivy-replacement.spec.ts --workers=1 ; node tools/check_architecture.mjs ; node tools/test.mjs --suite node ; suites fast (reprises ciblées après correction), campaign, cinematics, package ; captures ivy_binding_visual, ivy_attack_rate_visual, attack_patterns_visual ; tools/build/build.ps1 -Target Android ; adb devices -l.

Le catalogue présent dans l'APK est égal au catalogue publié courant. Contrôle natif de ses assets extraits exécuté sans accès au projet source : 41/41, neuf références de frames décodées. APK signé en mode test, pas de livraison Google Play. Aucun appareil connecté : aucun essai réel Android. Les travaux initiaux de Lavande restent hors de ce chantier et sont préservés. Aucune migration de sauvegarde ajoutée.

## Retouche anatomique des mains

Après signalement utilisateur : 19 poses inspectées, trois corrigées par image_gen d’après le modèle maître, six acteurs mis à jour. Anatomie fixée à une feuille continue à trois lobes principaux par main. Pieds et hauteur visible préservés ; autres données d’auteur et de combat inchangées. Vérifications après retouche : Electron 1 scénario, paquet 6 scénarios, captures Godot 49 contrôles et 24 images ; APK reconstruit, 300 médias vérifiés et 45 contrôles natifs réussis, dont les deux textures corrigées de la partie jouable et leur alpha. Pas de téléphone connecté. Journaux sous C:/Users/kevin/Documents/Codex/2026-10-25/d/work/lierre-hands ; prompts et empreintes sous docs/art_provenance/lierre-mains-20261025.json dans le dépôt du jeu.
