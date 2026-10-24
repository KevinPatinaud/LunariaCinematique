# Comportements et phases

La fiche d’un personnage est l’entrée principale : **Niveaux → Plantes alliées / Ennemis → personnage → Comportement**. Le raccourci « Configurer les priorités et phases » des capacités ouvre cette même fiche, avec le personnage sélectionné.

## Portée des modifications

Les réglages sont personnels par défaut. Si plusieurs personnages utilisent le même modèle, le premier changement crée une copie réservée au personnage ; les changements suivants réutilisent cette copie. Consulter un modèle ou lancer un essai ne crée aucune donnée. « Personnaliser maintenant » permet de détacher le comportement avant de le modifier.

« Appliquer un modèle… » propose une **copie personnelle** par défaut. « Lier au modèle partagé » crée volontairement un lien. Les modèles d’un autre camp et ceux qui exigent des capacités absentes sont refusés. Une capacité ajoutée par une phase fait partie des capacités possibles du modèle.

Pour modifier un groupe, choisir « Modifier le modèle partagé… », lire ses utilisateurs, puis « Modifier pour les N personnages ». Cette portée est indiquée tant que le mode partagé reste actif. Une action partagée reste annulable avec l’historique commun du projet.

La section **Options avancées → Modèles de comportements** est une bibliothèque avancée : recherche par modèle ou utilisateur, filtre de camp, duplication, création et application. Les modèles utilisés sont verrouillés à l’ouverture ; les modèles inutilisés peuvent être supprimés. Les liens vers les utilisateurs ouvrent leur fiche. La création propose trois départs : automatique, trois phases, ou recul à faible santé pour les ennemis.

## Les quatre vues

| Vue | Réglage |
|---|---|
| Déplacement | Mouvement par défaut, arrêt pour attaquer et notes |
| Priorités | Déclenchement automatique ou première règle exécutable, conditions et ordre des règles |
| Phases | Seuils de PV décroissants, vitesse, cadence, capacités héritées ou remplacées, actions d’entrée |
| Tester | Décision du personnage choisi dans un contexte contrôlé |

En mode automatique, toutes les capacités actives, prêtes et disposant d’une cible peuvent se déclencher. En mode priorité, la première règle exécutable gagne. Une capacité indisponible, en recharge ou sans cible laisse essayer la règle suivante. Les soins et soutiens n’arrêtent pas un ennemi au titre du contact avec un adversaire.

La phase initiale commence au début du combat. Les autres phases se franchissent à la baisse des PV. Un gros coup peut franchir plusieurs seuils : les actions d’entrée sont mises en file dans cet ordre, une seule fois. Un soin ne fait pas revenir à une phase antérieure. Les plantes se déplacent seulement dans les objectifs qui le prévoient.

Les règles proposent les capacités du personnage ou de ses phases. Dans un modèle partagé, elles proposent les capacités disponibles pour tous ses utilisateurs. Une phase peut accorder une capacité supplémentaire du catalogue. Les définitions de capacités restent communes : leur personnalisation se fait dans l’onglet Capacités.

## Essai de décision

L’essai appartient au personnage ouvert ; la bibliothèque de modèles demande explicitement un porteur. Il permet de régler PV, temps, vague, ennemis, graines et variables, puis l’activation, la recharge et la présence d’une cible pour chaque capacité de la phase. Le résultat affiche phase, mouvement, capacités et règle gagnante. Le tableau explique les règles écartées. Un personnage à zéro PV n’exécute aucune décision.

L’historique des phases de l’essai persiste après un soin. « Recommencer à 100 % » réinitialise le contexte. Cet essai **ne simule ni dégâts, ni déplacement, ni actions d’entrée** ; ces actions sont présentées dans leur ordre. Les cibles et recharges sont les valeurs choisies dans le formulaire. L’essai ne modifie pas le projet et ne le marque pas comme modifié.

## Organisation du code

- `src/shared/game/behaviorAuthoring.ts` possède copie, attribution, portée personnelle ou partagée, utilisateurs, compatibilité, modèles de départ et opérations de phase. Les mutations de capacités utilisent aussi cette frontière pour ajuster leurs références sans multiplier les copies privées.
- `src/shared/game/logic.ts` conserve le contrat et une seule évaluation de décision, utilisée avec ou sans explications. Les conditions de capacité sans référence testent les capacités actives de la phase, comme Godot.
- `src/shared/game/behaviorPreview.ts` possède la progression locale des phases et le contexte du porteur.
- `src/renderer/game/behaviors/` sépare formulaire, priorités, phases, essai, application de modèles et fiche personnelle. `BehaviorEditor.tsx` compose la bibliothèque.
- Tous les changements passent par la session commune du projet : annuler, rétablir, récupérer, enregistrer et rouvrir incluent les comportements.

Le format de contenu reste le schéma 4. Le moteur Godot avait déjà les règles de progression correctes ; ce chantier ajoute leur vérification native et aligne le calcul du Studio. Il ne modifie pas les statistiques ni les modèles de la campagne d’auteur. Les miroirs JavaScript du jeu sont générés depuis les sources partagées du Studio.

## Vérifier

Dans le Studio :

```powershell
npm test
npm run build
npm run test:e2e:built -- tests/e2e/behaviors.spec.ts tests/e2e/logic.spec.ts tests/e2e/capabilities.spec.ts
node scripts/check-behavior-runtime.mjs --game C:/dev/Lunaria/game
```

La dernière commande s’exécute après `npm test`, avec Godot installé. `--godot` choisit son exécutable, `--out` conserve un rapport. Elle fabrique un document temporaire avec cinq comportements personnels, le charge avec le validateur natif et confronte 160 situations réelles de phase, disponibilité et ciblage à 480 résultats du Studio. Elle ne publie pas ce document.

Dans le jeu : `node tools/test.mjs --suite fast --skip-import` et `node tools/test.mjs --suite node --skip-import`. La suite native `behavior_authoring_smoke` vérifie notamment les phases après soin, les actions d’entrée mises en file une seule fois, l’état sérialisable et l’immutabilité des définitions.
