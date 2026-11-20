# Tâches

## Préparation et publication du jeu

- [x] T001 [US1] Sélectionner et valider le premier niveau dans `src/main/webPublication.ts`.
- [x] T002 [US1] Relier le menu, la sauvegarde, le preload et l’IPC dans `src/renderer/game/` et `src/main/index.ts`.
- [x] T003 [US1] Construire et vérifier le paquet dans `LunariaWebsite/tools/build-godot-demo.mjs`.
- [x] T004 [US2] Installer le paquet local ou activer le jeu seul avec `LunariaWebsite/tools/publish-godot-demo.mjs`.
- [x] T005 [US2] Vérifier le pont Electron et le chargement du nouveau paquet avec le moteur.

## Vérifications

- `npm test` Studio : 1 253 réussites et 4 tests ignorés. `npm run check` site : 66 réussites.
- `npm run build` Studio et site : réussis. Le test `tests/e2e/web-publication.spec.ts` passe dans Electron avec export simulé. Il vérifie le choix par l’ordre du parcours, l’annulation et l’installation locale après confirmation.
- Export réel Godot 4.7.2 depuis une copie du projet auteur avec 875 graines. Vérification du paquet, installation dans un clone de test du site puis démarrage du vrai niveau dans Chrome. Graines et trois vagues confirmées à la fois dans la page et par le moteur. Le catalogue Android comparé avant et après est identique.
- Vérification de syntaxe Bash du script de publication et contrôle public en lecture seule. Le lecteur public répond 404. L’activation publique reste à vérifier une fois le lecteur et le vhost installés.

Le contrat de campagne Studio → Godot est réutilisé à l’identique. La seule sortie supplémentaire est le paquet Web documenté dans `LunariaWebsite/docs/DEMO_GODOT_WEB.md`.
