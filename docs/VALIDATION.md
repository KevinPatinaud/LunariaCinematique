# Validation — état au 1 octobre 2026

## Commandes maintenues

```powershell
npm ci
npm test
npm run build
npm run test:e2e:built -- tests/e2e/unified-project.spec.ts
```

Le build inclut le typecheck. Choisir aussi les scénarios Electron concernés par la modification. Les suites utilisent des documents et profils temporaires ; leur campagne de 40 niveaux est une fixture, pas le projet actif de Lunaria. Les tests navigateur ne valident pas le pont Electron.

Pour les contrats, régénérer avec `npm run schema`, synchroniser avec `node scripts/sync-game-contract.mjs --game C:/dev/Lunaria/game`, puis utiliser `node tools/test.mjs --suite all` dans `C:/dev/Lunaria`. La publication utilisateur est une opération distincte, depuis le projet d’auteur.

## Audit local, avant mise à jour documentaire

Le build du Studio a réussi. Les tests Node ont recensé **965 tests : 960 réussis, cinq ignorés**. Journaux locaux : `work/audit-20261001-build.log`, `work/audit-20261001-tests.log`. Le jeu a réussi sa suite complète (Node et 35 scripts Godot) et les six scripts de paquet. Ces résultats sont datés ; ils ne valident pas toute modification concurrente ou ultérieure.

Le scénario Electron de conquête a réussi lors de sa reprise isolée (`work/audit-20261001-advance-retry.log`). La campagne Electron entière n’est **pas** validée : certaines fermetures ont bloqué, et le scénario audio sur média réel a échoué sur un volume attendu de 0,65 contre environ 0,357 (`work/audit-20261001-audio-retry.log`). Le média a joué ; l’origine de l’écart reste à distinguer entre synchronisation du test et comportement audio. Ne pas masquer cet échec avec le succès du build.

Les captures de cadrage cinématique isolées ont réussi ; la première série graphique complète a été interrompue. Aucun test Android physique ni équilibrage de campagne n’a été confirmé par l’audit. Les preuves détaillées et limites du jeu sont dans `C:/dev/Lunaria/docs/ETAT_DU_PROJET.md`.

## Anciens rapports

[TEST_REPORT_V1_10.md](TEST_REPORT_V1_10.md) et les rapports des livraisons précédentes restent des archives. Leurs mentions de registre inaccessible ou de moteur non exécuté décrivent cet environnement ancien. Ils ne remplacent ni les commandes ci-dessus ni un rapport daté d’une exécution actuelle.

## Contrôles de la mise à jour documentaire

Le 1 octobre 2026, après correction de l’aide **Plantes disponibles** :

- `npm run build` : réussi, typecheck inclus (`work/docs-20261001-build.log`).
- Scénario Electron `levels.spec.ts`, « effectif de vague et roster sont enregistrés sans recopier les statistiques » : réussi (`work/docs-20261001-e2e.log`). Le mot roster dans ce nom de test désigne le champ d’auteur `allowedPlants`, sans écran de composition d’équipe dans le jeu.
- Ouverture d’une copie du projet d’auteur réel dans Electron, lecture de l’aide corrigée et capture : réussies. Capture locale : `C:/dev/Lunaria/work/documentation-20261001/studio-plantes-disponibles.png`.
- Contrôle d’architecture du jeu : `ARCHITECTURE_BOUNDARIES PASS`, avec `work/` autorisé comme sortie locale ignorée.
- Suite Node du jeu : 185 tests recensés, 183 réussis, deux ignorés, aucun échec. Rapport : `C:/dev/Lunaria/game/.godot/test-results/2026-10-01T08-17-35.200Z-56448/report.json`.

Les liens locaux des guides courants et des renvois ajoutés aux archives ont été vérifiés ; les copies de contrats sont synchronisées. Les corps des anciennes preuves, prompts, récits et licences restent conservés. Ces contrôles ciblés ne déclarent pas réussie la campagne Electron entière ni un essai Android.
