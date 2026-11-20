<!--
Bilan de synchronisation
- Version 1.0.0 → 1.1.0.
- Ajout du principe VIII sur la langue du code, des URL et des contenus affichés.
-->
# Constitution — Lunaria Studio

## Core Principles

### I. Expérience de l'auteur et du joueur

Android est la cible du jeu. Décrire des résultats visibles pour le joueur ou
l'auteur avant de choisir les détails techniques. Préserver l'usage tactile,
la lisibilité et les options de réduction des animations quand elles sont
concernées. Une nouvelle fonctionnalité ne justifie pas à elle seule une
nouvelle dépendance ou un service en ligne.

### II. Contenu d'auteur et médias identifiés

Le Studio édite `lunaria.game.json` sous
`C:/dev/Lunaria/HISTOIRE DE LUNARIA/Cinematiques studio/`. La bibliothèque source
est `C:/dev/Lunaria/LunariaArtLibrary`. Les sorties sous `game/content/` et les
copies de contrats sont générées. Un renommage de média inclut les références
des projets et cinématiques. Les essais utilisent des données isolées.

### III. Accord explicite entre Studio et Godot

Le Studio possède les formats partagés. La référence est
`docs/CONTRAT_STUDIO_GODOT.md` dans le dépôt Studio, avec les schémas et validateurs
qu'elle désigne. Tout changement d'interface identifie producteur, consommateur,
erreurs, exemples et vérifications des deux côtés. Relier les spécifications
locales par une initiative commune. Une synchronisation TypeScript ne réalise
pas une nouvelle sémantique GDScript.

### IV. Frontières de l'architecture existante

Le renderer React utilise le preload et ne lit pas directement le disque. Les formats et calculs partagés restent dans `src/shared/`. Les écritures, autorisations de médias et publication appartiennent au processus principal. Les modes Cinématiques et Niveaux éditent un même document avec historique, annulation et enregistrement atomique.
Lire `docs/ARCHITECTURE.md` et les sources du périmètre avant de planifier.
Réutiliser les conventions présentes ; ne pas inventer de structure pour
remplir un modèle de spécification.

### V. Processus proportionné et documents utiles

Un chantier structurant suit spécification, plan, tâches, implémentation et
vérification. Une petite correction locale peut suivre un traitement direct.
Rédiger en français et garder les critères observables. Référencer les guides
existants sans dupliquer leurs contrats. La demande de travail autorise ses
étapes nécessaires ; il n'y a pas de confirmation systématique entre phases.

### VI. Vérifications pertinentes et preuves honnêtes

Prévoir les vérifications selon le risque et les exigences du changement.
`npm run typecheck`, `npm test`, `npm run build` et les scénarios `npm run test:e2e:built -- tests/e2e/<scenario>.spec.ts` concernés après build. Choisir les suites selon les fichiers et le comportement modifiés. Une vérification web seule ne démontre pas le fonctionnement Electron.
Pour un contrat partagé, vérifier aussi le consommateur réel. Un test local
n'établit pas une installation Android ni un essai sur téléphone. Consigner
les résultats, échecs et limites, sans déclarer exécuté un contrôle seulement
prévu. Ne pas créer de tests artificiels pour une retouche réversible.

### VII. Changements et sauvegardes maîtrisés

Préserver les modifications en cours et contrôler les différences générées.
La portabilité des sauvegardes d'anciennes versions n'est pas exigée pour
l'instant ; aucune migration n'est ajoutée sans besoin exprimé. Le format
courant reste validé. Les tests ne remplacent ni le document d'auteur réel ni
les sauvegardes du joueur.

### VIII. Anglais dans le code source et les URL

Le code source de Lunaria, de Lunaria Studio et de Lunaria Web doit être en
anglais, y compris les noms techniques, les commentaires et les diagnostics
internes. Les URL sous le contrôle de Lunaria Web doivent être en anglais.
Cette règle couvre les URL canoniques des pages et articles, leurs fragments,
les chemins d’API et les URL des ressources servies.
Lorsqu’une adresse publiée change, prévoir une redirection pour conserver les
liens existants.

Le jeu, le Studio et le site affichent exclusivement du français dans leurs
interfaces, dialogues, messages destinés aux utilisateurs et contenus éditoriaux.

## Development Workflow

Le guide `docs/SPEC_KIT.md` décrit les commandes et la coordination entre dépôts.
Les templates propres à Lunaria sont sous `.specify/templates/overrides/`.
Les sources de l'application restent la preuve du comportement implémenté ;
si une documentation historique les contredit, résoudre l'écart pour le sujet
traité. Les dossiers de fonctionnalités terminées deviennent des traces datées.

## Governance

Cette constitution applique les instructions du projet ; les instructions
explicites de l'utilisateur et les règles de l'environnement restent
prioritaires. Une adaptation motive les principes modifiés et met à jour les
templates ou guides concernés. Réserver une hausse majeure aux changements de
principes, mineure aux ajouts et corrective aux clarifications. Aucun principe
ne crée une autorisation de publication ou de modification de données externes.

**Version**: 1.1.0 | **Ratified**: 2026-10-24 | **Last Amended**: 2026-11-18
