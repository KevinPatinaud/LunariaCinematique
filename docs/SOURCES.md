# Documentation officielle consultée

Consultation : 18 septembre 2026. Ces sources documentent les API et les précautions techniques ; elles ne constituent pas une preuve d'exécution des builds de cette livraison.

- Electron, sécurité : https://www.electronjs.org/docs/latest/tutorial/security
- Electron, protocoles locaux : https://www.electronjs.org/docs/latest/api/protocol
- Electron, contextBridge : https://www.electronjs.org/docs/latest/api/context-bridge
- Electron, webContents : https://www.electronjs.org/docs/latest/api/web-contents
- Versions stables Electron : https://releases.electronjs.org/releases/stable
- Versions React : https://react.dev/versions
- Vite, guide et prérequis Node : https://vite.dev/guide/
- Godot Control : https://docs.godotengine.org/en/stable/classes/class_control.html
- Godot CanvasItem : https://docs.godotengine.org/en/stable/classes/class_canvasitem.html
- Godot InputEvent / DEVICE_ID_EMULATION : https://docs.godotengine.org/en/stable/classes/class_inputevent.html
- Godot AudioStreamWAV : https://docs.godotengine.org/en/stable/classes/class_audiostreamwav.html
- Godot, export des ressources et fichiers : https://docs.godotengine.org/en/stable/tutorials/export/exporting_projects.html

Les dépendances déclarées dans package.json doivent être installées puis verrouillées par npm sur la machine de développement. Les versions du banc de test local et ce qui n'a pas été vérifié sont explicités dans TEST_REPORT.md.

## API consultées pour la bibliothèque V1.1

- React, portails : https://react.dev/reference/react-dom/createPortal
- React, nettoyage des effets : https://react.dev/reference/react/useEffect
- MDN, fenêtre modale native : https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal
- MDN, chargement progressif par observation de visibilité : https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
- MDN, capture du pointeur pendant le redimensionnement : https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture

## API relues pour les correctifs V1.2

- React, état capturé par un rendu : https://react.dev/learn/state-as-a-snapshot
- Node.js, opérations de fichiers : https://nodejs.org/api/fs.html
- Godot AudioStreamPlayer / volume linéaire : https://docs.godotengine.org/en/stable/classes/class_audiostreamplayer.html
- Godot CanvasItem / conservation des ressources utilisées par le dessin différé : https://docs.godotengine.org/en/stable/classes/class_canvasitem.html

Ces pages expliquent les comportements d’API. Elles ne prouvent pas le fonctionnement de ce projet ; la preuve locale et ses limites sont dans `TEST_REPORT_V1_2.md`.


## Compléments consultés pour V1.3

- Electron — Security : https://www.electronjs.org/docs/latest/tutorial/security
- Playwright — Electron API : https://playwright.dev/docs/api/class-electron
- Playwright — Test CLI : https://playwright.dev/docs/test-cli
- Node.js — File system : https://nodejs.org/api/fs.html

Ces références documentaires ne constituent pas une exécution des dépendances ou des tests natifs.

## Versions déclarées — vérification documentaire

- React 19.3 : https://react.dev/versions
- Electron 44.4.2 : https://github.com/electron/electron/releases/tag/v44.4.2

Consultation du 18 septembre 2026. Ces versions sont conservées du projet V1.2 ; leur publication a été vérifiée sur les pages officielles. Le téléchargement npm et le build complet n’ont pas pu être exécutés dans cet environnement.

## API relues pour V1.4

- Transformations SVG (MDN) : https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/transform
- React, effets et nettoyage : https://react.dev/reference/react/useEffect
- Godot CanvasItem / draw_set_transform_matrix : https://docs.godotengine.org/en/stable/classes/class_canvasitem.html
- Godot Transform2D : https://docs.godotengine.org/en/stable/classes/class_transform2d.html

Les vérifications documentaires ne constituent pas une exécution du moteur. Voir TEST_REPORT_V1_4.md pour les essais réellement réalisés.


## Animations et caractères composites — V1.5

- MDN, Intl.Segmenter (graphèmes) : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
- Godot TextServer, string_get_character_breaks : https://docs.godotengine.org/en/stable/classes/class_textserver.html
- Godot Font, mesure des chaînes : https://docs.godotengine.org/en/stable/classes/class_font.html

Ces références documentent les primitives de segmentation et de mesure. Les formules d’animation sont du code propre au projet ; aucune validation native Godot n’est déduite de la consultation de ces pages.
