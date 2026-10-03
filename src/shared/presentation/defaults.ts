import type { GameProject } from '../game/types.js';
import { DEFAULT_ABILITY_PRESENTATION,type PresentationCatalog,type SpeciesVisual,type AnimationDefinition } from './types.js';
import { newId } from '../game/types.js';
import { CIGARETTE, CIGARETTE_ANIMATIONS, CIGARETTE_PROFILE, CIGARETTE_VFX } from '../game/cigarette.js';
import {PLASTIC_BAG,PLASTIC_BAG_ANIMATIONS,PLASTIC_BAG_PROFILE} from '../game/plasticBag.js';
import {POLLUTER_ANIMATIONS,POLLUTER_PROFILES,POLLUTER_VISUALS,PLAQUE_SLIME_PRESENTATION} from './polluterAnimations.js';
export const DEFAULT_PRESENTATION:PresentationCatalog={
  "version": 1,
  "defaultProfileId": "default_profile",
  "animations": [
    {
      "id": "default_idle",
      "name": "Respiration légère",
      "kind": "procedural",
      "frames": [],
      "duration": 2.4,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "breath",
        "amplitude": 1,
        "period": 2.4
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "default_move",
      "name": "Balancement de déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 1,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 1
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "default_attack",
      "name": "Attaque simple",
      "kind": "procedural",
      "frames": [],
      "duration": 0.35,
      "loop": false,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "recoil",
        "amplitude": 1,
        "period": 0.35
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": [
        {
          "id": "release",
          "type": "release",
          "at": 0.1,
          "ref": "",
          "attach": "launch"
        }
      ]
    },
    {
      "id": "default_hit",
      "name": "Réaction à un impact",
      "kind": "procedural",
      "frames": [],
      "duration": 0.18,
      "loop": false,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "shake",
        "amplitude": 1,
        "period": 0.18
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "default_death",
      "name": "Disparition",
      "kind": "procedural",
      "frames": [],
      "duration": 0.6,
      "loop": false,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "fade_out",
        "amplitude": 1,
        "period": 0.6
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "default_spawn",
      "name": "Apparition",
      "kind": "procedural",
      "frames": [],
      "duration": 0.3,
      "loop": false,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "fade_in",
        "amplitude": 1,
        "period": 0.3
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "default_victory",
      "name": "Victoire",
      "kind": "procedural",
      "frames": [],
      "duration": 0.6,
      "loop": false,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "bounce",
        "amplitude": 1,
        "period": 0.6
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "default_phase",
      "name": "Transition de phase",
      "kind": "procedural",
      "frames": [],
      "duration": 0.5,
      "loop": false,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "pulse",
        "amplitude": 1,
        "period": 0.5
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "rose_punch_combo",
      "ownerSpeciesId": "rose",
      "name": "Rose — esquive et riposte",
      "kind": "combined",
      "frames": [
        {
          "asset": "library://02_characters/Rose/stage_01/animations/rose_combat_sheet_v02.png",
          "duration": 0.07,
          "region": {
            "x": 170,
            "y": 20,
            "width": 470,
            "height": 470
          },
          "anchor": {
            "x": 0.5106382978723404,
            "y": 0.9468085106382979
          }
        },
        {
          "asset": "library://02_characters/Rose/stage_01/animations/rose_combat_sheet_v02.png",
          "duration": 0.11,
          "region": {
            "x": 935,
            "y": 20,
            "width": 470,
            "height": 470
          },
          "anchor": {
            "x": 0.48936170212765956,
            "y": 0.9340425531914893
          }
        },
        {
          "asset": "library://02_characters/Rose/stage_01/animations/rose_combat_sheet_v02.png",
          "duration": 0.07,
          "region": {
            "x": 170,
            "y": 20,
            "width": 470,
            "height": 470
          },
          "anchor": {
            "x": 0.5106382978723404,
            "y": 0.9468085106382979
          }
        },
        {
          "asset": "library://02_characters/Rose/stage_01/animations/rose_combat_sheet_v02.png",
          "duration": 0.14,
          "region": {
            "x": 170,
            "y": 505,
            "width": 470,
            "height": 470
          },
          "anchor": {
            "x": 0.5106382978723404,
            "y": 0.9638297872340426
          }
        },
        {
          "asset": "library://02_characters/Rose/stage_01/animations/rose_combat_sheet_v02.png",
          "duration": 0.06,
          "region": {
            "x": 935,
            "y": 505,
            "width": 470,
            "height": 470
          },
          "anchor": {
            "x": 0.44680851063829785,
            "y": 0.9617021276595744
          }
        }
      ],
      "duration": 0.45,
      "loop": false,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "recoil",
        "amplitude": 0.7,
        "period": 0.45
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": [
        {
          "id": "release",
          "type": "release",
          "at": 0.32,
          "ref": "",
          "attach": "launch"
        }
      ]
    },
    {
      "id": "radish_throw",
      "ownerSpeciesId": "radish",
      "name": "Radis — jet de caillou (4 poses conservées)",
      "kind": "combined",
      "frames": [
        {
          "asset": "library://combat/animation/animation_radish.png",
          "region": {
            "x": 9,
            "y": 11,
            "width": 629,
            "height": 558
          },
          "anchor": {
            "x": 0.5286168521462639,
            "y": 0.992831541218638
          },
          "duration": 0.035
        },
        {
          "asset": "library://combat/animation/animation_radish.png",
          "region": {
            "x": 659,
            "y": 19,
            "width": 641,
            "height": 551
          },
          "anchor": {
            "x": 0.48517940717628705,
            "y": 0.9927404718693285
          },
          "duration": 0.147
        },
        {
          "asset": "library://combat/animation/animation_radish.png",
          "region": {
            "x": 10,
            "y": 596,
            "width": 651,
            "height": 566
          },
          "anchor": {
            "x": 0.4915514592933948,
            "y": 0.9929328621908127
          },
          "duration": 0.084
        },
        {
          "asset": "library://combat/animation/animation_radish.png",
          "region": {
            "x": 671,
            "y": 600,
            "width": 632,
            "height": 560
          },
          "anchor": {
            "x": 0.5039556962025317,
            "y": 0.9928571428571429
          },
          "duration": 0.084
        }
      ],
      "duration": 0.35,
      "loop": false,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "none",
        "amplitude": 1,
        "period": 0.35
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": [
        {
          "id": "release",
          "type": "release",
          "at": 0.182,
          "ref": "",
          "attach": "launch"
        }
      ]
    },
    {
      "id": "move_litterer",
      "ownerSpeciesId": "litterer",
      "name": "Jeteur de déchets — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_runner",
      "ownerSpeciesId": "runner",
      "name": "Canette pressée — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.628,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 0.628
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_sprayer",
      "ownerSpeciesId": "sprayer",
      "name": "Pulvérisateur — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": -8,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "bounce",
        "amplitude": 0.4,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_truck",
      "ownerSpeciesId": "truck",
      "name": "Camion pollueur — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_jammer",
      "ownerSpeciesId": "jammer",
      "name": "Drone brouilleur — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": -8,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "bounce",
        "amplitude": 0.4,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_tanker",
      "ownerSpeciesId": "tanker",
      "name": "Citerne blindée — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_collector",
      "ownerSpeciesId": "collector",
      "name": "Le Ramasseur — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_pump",
      "ownerSpeciesId": "pump",
      "name": "L’Assoiffeur — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_factory",
      "ownerSpeciesId": "factory",
      "name": "Mille-Gueules — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_devourer",
      "ownerSpeciesId": "devourer",
      "name": "L’Avaleur — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_corrupted_rose",
      "ownerSpeciesId": "corrupted_rose",
      "name": "Rose contaminée — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_furnace",
      "ownerSpeciesId": "furnace",
      "name": "La Fournaise — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "move_thorn_knot",
      "ownerSpeciesId": "thorn_knot",
      "name": "Excroissance contaminée — déplacement",
      "kind": "procedural",
      "frames": [],
      "duration": 0.982,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "sway",
        "amplitude": 1,
        "period": 0.982
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": []
    },
    {
      "id": "plaque_idle",
      "name": "Plaque — veille",
      "kind": "frames",
      "frames": [
        {
          "asset": "library://03_enemies/plaque/Image ChatGPT 28 sept. 2026, 13_55_48(1).png",
          "anchor": {
            "x": 0.5,
            "y": 1
          },
          "duration": 0.8
        }
      ],
      "duration": 0.8,
      "loop": true,
      "ownerSpeciesId": "plaque",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "none",
        "amplitude": 0,
        "period": 1
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.22
        },
        {
          "id": "launch",
          "x": 0.17,
          "y": 0.68
        }
      ],
      "markers": []
    },
    {
      "id": "plaque_spawn",
      "name": "Plaque — surgit",
      "kind": "frames",
      "frames": [
        {
          "asset": "library://03_enemies/plaque/Grille de drainage rouillée en métal.png",
          "anchor": {
            "x": 0.5,
            "y": 1
          },
          "duration": 0.22
        },
        {
          "asset": "library://03_enemies/plaque/Image ChatGPT 28 sept. 2026, 13_55_48(1).png",
          "anchor": {
            "x": 0.5,
            "y": 1
          },
          "duration": 0.28
        }
      ],
      "duration": 0.5,
      "loop": false,
      "ownerSpeciesId": "plaque",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "none",
        "amplitude": 0,
        "period": 1
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.22
        },
        {
          "id": "launch",
          "x": 0.17,
          "y": 0.68
        }
      ],
      "markers": []
    },
    {
      "id": "plaque_attack",
      "name": "Plaque — crache",
      "kind": "frames",
      "frames": [
        {
          "asset": "library://03_enemies/plaque/Image ChatGPT 28 sept. 2026, 13_55_48(1).png",
          "anchor": {
            "x": 0.5,
            "y": 1
          },
          "duration": 0.12
        },
        {
          "asset": "library://03_enemies/plaque/Monstre égoutier au slime violet.png",
          "anchor": {
            "x": 0.5,
            "y": 1
          },
          "duration": 0.25
        },
        {
          "asset": "library://03_enemies/plaque/Image ChatGPT 28 sept. 2026, 13_55_48(1).png",
          "anchor": {
            "x": 0.5,
            "y": 1
          },
          "duration": 0.2
        }
      ],
      "duration": 0.5700000000000001,
      "loop": false,
      "ownerSpeciesId": "plaque",
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "none",
        "amplitude": 0,
        "period": 1
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.22
        },
        {
          "id": "launch",
          "x": 0.17,
          "y": 0.68
        }
      ],
      "markers": [
        {
          "id": "plaque_release",
          "at": 0.18,
          "type": "release",
          "ref": "",
          "attach": "launch"
        }
      ]
    },
    {
      "id": "rose_walk",
      "name": "Rose — marche",
      "kind": "frames",
      "frames": [
        {
          "asset": "library://02_characters/Rose/stage_01/animations/rose_walk_sheet_v02.png",
          "duration": 0.14,
          "region": {
            "x": 97,
            "y": 55,
            "width": 330,
            "height": 425
          },
          "anchor": {
            "x": 0.5870778439220088,
            "y": 0.9835294117647059
          }
        },
        {
          "asset": "library://02_characters/Rose/stage_01/animations/rose_walk_sheet_v02.png",
          "duration": 0.14,
          "region": {
            "x": 609,
            "y": 55,
            "width": 330,
            "height": 425
          },
          "anchor": {
            "x": 0.5001457076447688,
            "y": 0.9929411764705882
          }
        },
        {
          "asset": "library://02_characters/Rose/stage_01/animations/rose_walk_sheet_v02.png",
          "duration": 0.14,
          "region": {
            "x": 1121,
            "y": 55,
            "width": 330,
            "height": 425
          },
          "anchor": {
            "x": 0.4019710168991514,
            "y": 0.9952941176470588
          }
        },
        {
          "asset": "library://02_characters/Rose/stage_01/animations/rose_walk_sheet_v02.png",
          "duration": 0.14,
          "region": {
            "x": 97,
            "y": 567,
            "width": 330,
            "height": 425
          },
          "anchor": {
            "x": 0.5895645492278778,
            "y": 0.9341176470588235
          }
        },
        {
          "asset": "library://02_characters/Rose/stage_01/animations/rose_walk_sheet_v02.png",
          "duration": 0.14,
          "region": {
            "x": 609,
            "y": 567,
            "width": 330,
            "height": 425
          },
          "anchor": {
            "x": 0.4945987483405378,
            "y": 0.9388235294117647
          }
        },
        {
          "asset": "library://02_characters/Rose/stage_01/animations/rose_walk_sheet_v02.png",
          "duration": 0.14,
          "region": {
            "x": 1121,
            "y": 567,
            "width": 330,
            "height": 425
          },
          "anchor": {
            "x": 0.41493599003269244,
            "y": 0.9317647058823529
          }
        }
      ],
      "duration": 0.84,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "none",
        "amplitude": 0,
        "period": 0.84
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": [],
      "ownerSpeciesId": "rose"
    },
    {
      "id": "radish_walk",
      "name": "Radis — marche",
      "kind": "frames",
      "frames": [
        {
          "asset": "library://02_characters/radis/stage_01/animations/radish_walk_sheet_v01.png",
          "duration": 0.14,
          "region": {
            "x": 53,
            "y": 46,
            "width": 441,
            "height": 421
          },
          "anchor": {
            "x": 0.4003421643902129,
            "y": 0.995249406175772
          }
        },
        {
          "asset": "library://02_characters/radis/stage_01/animations/radish_walk_sheet_v01.png",
          "duration": 0.14,
          "region": {
            "x": 565,
            "y": 46,
            "width": 441,
            "height": 421
          },
          "anchor": {
            "x": 0.3927053004494999,
            "y": 0.995249406175772
          }
        },
        {
          "asset": "library://02_characters/radis/stage_01/animations/radish_walk_sheet_v01.png",
          "duration": 0.14,
          "region": {
            "x": 1077,
            "y": 46,
            "width": 441,
            "height": 421
          },
          "anchor": {
            "x": 0.3944029645645295,
            "y": 0.995249406175772
          }
        },
        {
          "asset": "library://02_characters/radis/stage_01/animations/radish_walk_sheet_v01.png",
          "duration": 0.14,
          "region": {
            "x": 53,
            "y": 558,
            "width": 441,
            "height": 421
          },
          "anchor": {
            "x": 0.40553451863029816,
            "y": 0.9904988123515439
          }
        },
        {
          "asset": "library://02_characters/radis/stage_01/animations/radish_walk_sheet_v01.png",
          "duration": 0.14,
          "region": {
            "x": 565,
            "y": 558,
            "width": 441,
            "height": 421
          },
          "anchor": {
            "x": 0.3993290186817083,
            "y": 0.9881235154394299
          }
        },
        {
          "asset": "library://02_characters/radis/stage_01/animations/radish_walk_sheet_v01.png",
          "duration": 0.14,
          "region": {
            "x": 1077,
            "y": 558,
            "width": 441,
            "height": 421
          },
          "anchor": {
            "x": 0.42376222647012113,
            "y": 0.9881235154394299
          }
        }
      ],
      "duration": 0.84,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "none",
        "amplitude": 0,
        "period": 0.84
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": [],
      "ownerSpeciesId": "radish"
    },
    {
      "id": "hazel_walk",
      "name": "Noisetier — marche",
      "kind": "frames",
      "frames": [
        {
          "asset": "library://02_characters/noisetier/stage_01/animations/hazel_walk_sheet_v01.png",
          "duration": 0.18,
          "region": {
            "x": 74,
            "y": 39,
            "width": 378,
            "height": 442
          },
          "anchor": {
            "x": 0.5369829984516792,
            "y": 0.9773755656108597
          }
        },
        {
          "asset": "library://02_characters/noisetier/stage_01/animations/hazel_walk_sheet_v01.png",
          "duration": 0.18,
          "region": {
            "x": 586,
            "y": 39,
            "width": 378,
            "height": 442
          },
          "anchor": {
            "x": 0.4670682475254536,
            "y": 0.9705882352941176
          }
        },
        {
          "asset": "library://02_characters/noisetier/stage_01/animations/hazel_walk_sheet_v01.png",
          "duration": 0.18,
          "region": {
            "x": 1098,
            "y": 39,
            "width": 378,
            "height": 442
          },
          "anchor": {
            "x": 0.4491239345259382,
            "y": 0.9751131221719457
          }
        },
        {
          "asset": "library://02_characters/noisetier/stage_01/animations/hazel_walk_sheet_v01.png",
          "duration": 0.18,
          "region": {
            "x": 74,
            "y": 551,
            "width": 378,
            "height": 442
          },
          "anchor": {
            "x": 0.5353648115757781,
            "y": 0.995475113122172
          }
        },
        {
          "asset": "library://02_characters/noisetier/stage_01/animations/hazel_walk_sheet_v01.png",
          "duration": 0.18,
          "region": {
            "x": 586,
            "y": 551,
            "width": 378,
            "height": 442
          },
          "anchor": {
            "x": 0.4721542027103802,
            "y": 0.995475113122172
          }
        },
        {
          "asset": "library://02_characters/noisetier/stage_01/animations/hazel_walk_sheet_v01.png",
          "duration": 0.18,
          "region": {
            "x": 1098,
            "y": 551,
            "width": 378,
            "height": 442
          },
          "anchor": {
            "x": 0.4526352590033613,
            "y": 0.9932126696832579
          }
        }
      ],
      "duration": 1.08,
      "loop": true,
      "anchor": {
        "x": 0.5,
        "y": 1
      },
      "transform": {
        "x": 0,
        "y": 0,
        "rotation": 0,
        "scaleX": 1,
        "scaleY": 1,
        "opacity": 1
      },
      "motion": {
        "preset": "none",
        "amplitude": 0,
        "period": 1.08
      },
      "attachments": [
        {
          "id": "center",
          "x": 0.5,
          "y": 0.5
        },
        {
          "id": "feet",
          "x": 0.5,
          "y": 1
        },
        {
          "id": "head",
          "x": 0.5,
          "y": 0.15
        },
        {
          "id": "launch",
          "x": 0.82,
          "y": 0.4
        }
      ],
      "markers": [],
      "ownerSpeciesId": "hazel"
    }
  ],
  "profiles": [
    {
      "id": "default_profile",
      "name": "Valeurs par défaut explicites",
      "slots": [
        {
          "slot": "idle",
          "animationId": "default_idle"
        },
        {
          "slot": "move",
          "animationId": "default_move"
        },
        {
          "slot": "attack",
          "animationId": "default_attack"
        },
        {
          "slot": "hit",
          "animationId": "default_hit"
        },
        {
          "slot": "death",
          "animationId": "default_death"
        },
        {
          "slot": "spawn",
          "animationId": "default_spawn"
        },
        {
          "slot": "victory",
          "animationId": "default_victory"
        },
        {
          "slot": "phase_transition",
          "animationId": "default_phase"
        }
      ],
      "events": [
        {
          "event": "release",
          "soundId": "sound_shoot",
          "vfxId": "",
          "attach": "launch"
        },
        {
          "event": "impact",
          "soundId": "sound_impact",
          "vfxId": "vfx_impact",
          "attach": "center"
        },
        {
          "event": "spawn",
          "soundId": "sound_plant",
          "vfxId": "",
          "attach": "feet"
        }
      ]
    },
    {
      "id": "profile_radish",
      "name": "Profil radish",
      "slots": [
        {
          "slot": "attack",
          "animationId": "radish_throw"
        },
        {
          "slot": "move",
          "animationId": "radish_walk"
        }
      ],
      "events": []
    },
    {
      "id": "profile_rose",
      "name": "Profil rose",
      "slots": [
        {
          "slot": "attack",
          "animationId": "rose_punch_combo"
        },
        {
          "slot": "move",
          "animationId": "rose_walk"
        }
      ],
      "events": []
    },
    {
      "id": "profile_hazel",
      "name": "Profil hazel",
      "slots": [
        {
          "slot": "move",
          "animationId": "hazel_walk"
        }
      ],
      "events": []
    },
    {
      "id": "profile_fern",
      "name": "Profil fern",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_dandelion",
      "name": "Profil dandelion",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_ivy",
      "name": "Profil ivy",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_scindapsus",
      "name": "Profil Scindapsus",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_nettle",
      "name": "Profil nettle",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_acacia",
      "name": "Profil acacia",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_baobab",
      "name": "Profil baobab",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_aloe",
      "name": "Profil aloe",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_papyrus",
      "name": "Profil papyrus",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_hibiscus",
      "name": "Profil hibiscus",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_lavender",
      "name": "Profil lavender",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_bamboo",
      "name": "Profil bamboo",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_lotus",
      "name": "Profil lotus",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_ginger",
      "name": "Profil ginger",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_chrysanthemum",
      "name": "Profil chrysanthemum",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_mangrove",
      "name": "Profil mangrove",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_coconut",
      "name": "Profil coconut",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_pandanus",
      "name": "Profil pandanus",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_eucalyptus",
      "name": "Profil eucalyptus",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_banksia",
      "name": "Profil banksia",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_mushroom",
      "name": "Profil mushroom",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_sequoia",
      "name": "Profil sequoia",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_cactus",
      "name": "Profil cactus",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_agave",
      "name": "Profil agave",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_dahlia",
      "name": "Profil dahlia",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_passionflower",
      "name": "Profil passionflower",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_litterer",
      "name": "Profil Jeteur de déchets",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_litterer"
        }
      ],
      "events": []
    },
    {
      "id": "profile_runner",
      "name": "Profil Canette pressée",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_runner"
        }
      ],
      "events": []
    },
    {
      "id": "profile_sprayer",
      "name": "Profil Pulvérisateur",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_sprayer"
        }
      ],
      "events": []
    },
    {
      "id": "profile_truck",
      "name": "Profil Camion pollueur",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_truck"
        }
      ],
      "events": []
    },
    {
      "id": "profile_jammer",
      "name": "Profil Drone brouilleur",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_jammer"
        }
      ],
      "events": []
    },
    {
      "id": "profile_tanker",
      "name": "Profil Citerne blindée",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_tanker"
        }
      ],
      "events": []
    },
    {
      "id": "profile_collector",
      "name": "Profil Le Ramasseur",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_collector"
        }
      ],
      "events": []
    },
    {
      "id": "profile_pump",
      "name": "Profil L’Assoiffeur",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_pump"
        }
      ],
      "events": []
    },
    {
      "id": "profile_factory",
      "name": "Profil Mille-Gueules",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_factory"
        }
      ],
      "events": []
    },
    {
      "id": "profile_devourer",
      "name": "Profil L’Avaleur",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_devourer"
        }
      ],
      "events": []
    },
    {
      "id": "profile_corrupted_rose",
      "name": "Profil Rose contaminée",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_corrupted_rose"
        }
      ],
      "events": []
    },
    {
      "id": "profile_furnace",
      "name": "Profil La Fournaise",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_furnace"
        }
      ],
      "events": []
    },
    {
      "id": "profile_thorn_knot",
      "name": "Profil Excroissance contaminée",
      "slots": [
        {
          "slot": "move",
          "animationId": "move_thorn_knot"
        }
      ],
      "events": []
    },
    {
      "id": "profile_plaque",
      "name": "Profil Plaque",
      "slots": [
        {
          "slot": "idle",
          "animationId": "plaque_idle"
        },
        {
          "slot": "spawn",
          "animationId": "plaque_spawn"
        },
        {
          "slot": "attack",
          "animationId": "plaque_attack"
        }
      ],
      "events": []
    }
  ],
  "audio": [
    {
      "id": "sound_shoot",
      "name": "Lancement existant",
      "asset": "library://combat/audio/shoot_0.wav",
      "bus": "sfx",
      "volume": 0.14,
      "loop": false,
      "pitchVariation": 0.03,
      "maxInstances": 4
    },
    {
      "id": "sound_impact",
      "name": "Impact existant",
      "asset": "library://combat/audio/impact_0.wav",
      "bus": "sfx",
      "volume": 0.2,
      "loop": false,
      "pitchVariation": 0.03,
      "maxInstances": 4
    },
    {
      "id": "sound_plant",
      "name": "Plantation existante",
      "asset": "library://combat/audio/plant_0.wav",
      "bus": "sfx",
      "volume": 0.32,
      "loop": false,
      "pitchVariation": 0.03,
      "maxInstances": 4
    }
  ],
  "vfx": [
    {
      "id": "vfx_impact",
      "name": "Éclat végétal",
      "preset": "leaves",
      "duration": 0.35,
      "size": 26,
      "color": "#9ee8bd",
      "intensity": 0.8,
      "quantity": 7,
      "asset": "",
      "attach": "center",
      "maxInstances": 24
    },
    {
      "id": "vfx_trail",
      "name": "Traînée douce",
      "preset": "trail",
      "duration": 0.3,
      "size": 12,
      "color": "#d4b88a",
      "intensity": 0.4,
      "quantity": 5,
      "asset": "",
      "attach": "center",
      "maxInstances": 32
    }
  ]
};
DEFAULT_PRESENTATION.animations.push(...structuredClone(PLASTIC_BAG_ANIMATIONS));
DEFAULT_PRESENTATION.profiles.push(structuredClone(PLASTIC_BAG_PROFILE));
DEFAULT_PRESENTATION.animations.push(...structuredClone(CIGARETTE_ANIMATIONS));
DEFAULT_PRESENTATION.profiles.push(structuredClone(CIGARETTE_PROFILE));
DEFAULT_PRESENTATION.vfx.push(structuredClone(CIGARETTE_VFX));
for(const animation of POLLUTER_ANIMATIONS){
 const index=DEFAULT_PRESENTATION.animations.findIndex(a=>a.id===animation.id);
 if(index<0)DEFAULT_PRESENTATION.animations.push(structuredClone(animation));else DEFAULT_PRESENTATION.animations[index]=structuredClone(animation);
}
for(const profile of POLLUTER_PROFILES){
 const index=DEFAULT_PRESENTATION.profiles.findIndex(p=>p.id===profile.id);
 if(index<0)DEFAULT_PRESENTATION.profiles.push(structuredClone(profile));else DEFAULT_PRESENTATION.profiles[index]=structuredClone(profile);
}
export const INITIAL_VISUALS:Record<string,SpeciesVisual>={
  cigarette:structuredClone(CIGARETTE.visual!),
  plastic_bag:structuredClone(PLASTIC_BAG.visual!),
  "radish": {
    "sprite": {
      "asset": "library://combat/animation/animation_radish.png",
      "region": {
        "x": 9,
        "y": 11,
        "width": 629,
        "height": 558
      },
      "anchor": {
        "x": 0.5286168521462639,
        "y": 0.992831541218638
      }
    },
    "width": 96,
    "height": 82,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Radis : repos et tir d’origine conservés, déplacement en six poses."
  },
  "rose": {
    "sprite": {
      "asset": "library://02_characters/Rose/stage_01/animations/rose_combat_sheet_v02.png",
      "region": {
        "x": 170,
        "y": 20,
        "width": 470,
        "height": 470
      },
      "anchor": {
        "x": 0.5106382978723404,
        "y": 0.9468085106382979
      }
    },
    "width": 104,
    "height": 96,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Rose : repos et riposte peints, contours doux et verts naturels harmonisés avec Radis et Noisetier ; marche en six poses."
  },
  "hazel": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/hazel.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 191,
        "height": 246
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Noisetier : défense et régénération personnelle ; déplacement en six poses avec bouclier."
  },
  "fern": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/fern.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 195,
        "height": 268
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "dandelion": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/dandelion.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 195,
        "height": 207
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "ivy": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/ivy.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 209,
        "height": 224
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "scindapsus": {
    "sprite": {
      "asset": "library://02_characters/scindapsus/stage_01/scindapsus_stage_01_master_v01.png",
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 118,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Illustration du stade 1 (1086 × 1448 px). Les deux images du stade 2 restent disponibles dans la bibliothèque ; animations procédurales en attendant des poses dédiées."
  },
  "nettle": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/nettle.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 184,
        "height": 243
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "acacia": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/acacia.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 217,
        "height": 222
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "baobab": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/baobab.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 180,
        "height": 234
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "aloe": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/aloe.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 173,
        "height": 222
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "papyrus": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/papyrus.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 165,
        "height": 270
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "hibiscus": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/hibiscus.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 168,
        "height": 254
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "lavender": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/lavender.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 138,
        "height": 252
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "bamboo": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/bamboo.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 193,
        "height": 274
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "lotus": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/lotus.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 190,
        "height": 245
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "ginger": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/ginger.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 171,
        "height": 292
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; éclat de gingembre et halo du bonus dessinés en combat."
  },
  "chrysanthemum": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/chrysanthemum.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 166,
        "height": 236
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "mangrove": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/mangrove.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 92,
        "height": 159
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "coconut": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/coconut.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 132,
        "height": 191
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "pandanus": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/pandanus.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 110,
        "height": 184
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "eucalyptus": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/eucalyptus.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 118,
        "height": 195
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "banksia": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/banksia.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 108,
        "height": 175
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "mushroom": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/mushroom.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 99,
        "height": 137
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "sequoia": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/sequoia.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 128,
        "height": 245
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "cactus": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/cactus.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 161,
        "height": 178
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "agave": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/agave.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 174,
        "height": 217
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "dahlia": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/dahlia.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 147,
        "height": 199
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "passionflower": {
    "sprite": {
      "asset": "library://combat/illustrations/plants/passionflower.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 176,
        "height": 213
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 88,
    "height": 80,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
  },
  "litterer": {
    "sprite": {
      "asset": "library://combat/enemies/polluters_atlas.png",
      "region": {
        "x": 59,
        "y": 128,
        "width": 442,
        "height": 439
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 64,
    "height": 78,
    "baseline": 34,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "runner": {
    "sprite": {
      "asset": "library://combat/enemies/polluters_atlas.png",
      "region": {
        "x": 59,
        "y": 128,
        "width": 442,
        "height": 439
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 57,
    "height": 69,
    "baseline": 34,
    "mirror": false,
    "tint": "#ffd68f",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "sprayer": {
    "sprite": {
      "asset": "library://combat/enemies/polluters_atlas.png",
      "region": {
        "x": 678,
        "y": 103,
        "width": 538,
        "height": 398
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 76,
    "height": 68,
    "baseline": 34,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "truck": {
    "sprite": {
      "asset": "library://combat/enemies/polluters_atlas.png",
      "region": {
        "x": 22,
        "y": 642,
        "width": 594,
        "height": 538
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 82,
    "height": 74,
    "baseline": 34,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "jammer": {
    "sprite": {
      "asset": "library://combat/enemies/polluters_atlas.png",
      "region": {
        "x": 678,
        "y": 103,
        "width": 538,
        "height": 398
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 76,
    "height": 68,
    "baseline": 34,
    "mirror": false,
    "tint": "#e7bdff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "tanker": {
    "sprite": {
      "asset": "library://combat/enemies/polluters_atlas.png",
      "region": {
        "x": 22,
        "y": 642,
        "width": 594,
        "height": 538
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 94,
    "height": 84,
    "baseline": 34,
    "mirror": false,
    "tint": "#b0ffed",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "collector": {
    "sprite": {
      "asset": "library://combat/illustrations/bosses_final.png",
      "region": {
        "x": 41,
        "y": 60,
        "width": 442,
        "height": 392
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 153.4,
    "height": 143,
    "baseline": 50.7,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "pump": {
    "sprite": {
      "asset": "library://combat/illustrations/bosses_final.png",
      "region": {
        "x": 543,
        "y": 42,
        "width": 457,
        "height": 419
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 153.4,
    "height": 143,
    "baseline": 50.7,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "factory": {
    "sprite": {
      "asset": "library://combat/illustrations/bosses_final.png",
      "region": {
        "x": 1051,
        "y": 37,
        "width": 464,
        "height": 427
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 153.4,
    "height": 143,
    "baseline": 50.7,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "devourer": {
    "sprite": {
      "asset": "library://combat/illustrations/bosses_final.png",
      "region": {
        "x": 33,
        "y": 582,
        "width": 464,
        "height": 380
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 153.4,
    "height": 143,
    "baseline": 50.7,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "corrupted_rose": {
    "sprite": {
      "asset": "library://combat/illustrations/bosses_final.png",
      "region": {
        "x": 551,
        "y": 537,
        "width": 447,
        "height": 451
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 153.4,
    "height": 143,
    "baseline": 50.7,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "furnace": {
    "sprite": {
      "asset": "library://combat/illustrations/bosses_final.png",
      "region": {
        "x": 1055,
        "y": 524,
        "width": 460,
        "height": 459
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 153.4,
    "height": 143,
    "baseline": 50.7,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "thorn_knot": {
    "sprite": {
      "asset": "library://combat/illustrations/bosses_final.png",
      "region": {
        "x": 551,
        "y": 537,
        "width": 447,
        "height": 451
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 153.4,
    "height": 143,
    "baseline": 50.7,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  },
  "plaque": {
    "sprite": {
      "asset": "library://03_enemies/plaque/Image ChatGPT 28 sept. 2026, 13_55_48(1).png",
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 118,
    "height": 92,
    "baseline": 29,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Plaque fixe. La grille s’ouvre lors de l’apparition et crache du slime pendant le tir."
  }
};
Object.assign(INITIAL_VISUALS,structuredClone(POLLUTER_VISUALS));
/** Authoring upgrade only. This function is never part of player save loading. */
export function ensurePresentation(p:GameProject):void {
 if(!p.presentation){
  p.presentation=structuredClone(DEFAULT_PRESENTATION);
  for(const id of ['plaque','runner','cigarette','plastic_bag'])if(!p.balance.enemies.some(enemy=>enemy.id===id)){
   p.presentation.animations=p.presentation.animations.filter(animation=>animation.ownerSpeciesId!==id);
   p.presentation.profiles=p.presentation.profiles.filter(profile=>profile.id!=='profile_'+id);
  }
  for(const s of [...p.balance.plants,...p.balance.enemies]){s.animationProfileId='profile_'+s.id;s.visual=structuredClone(INITIAL_VISUALS[s.id]);}
  for(const a of p.combat?.abilities??[])a.presentation??=structuredClone(DEFAULT_ABILITY_PRESENTATION);
  for(const q of p.combat?.projectiles??[])q.presentation=q.id==='proj_plaque_slime'&&p.balance.enemies.some(e=>e.id==='plaque')?structuredClone(PLAQUE_SLIME_PRESENTATION):{asset:'',animationId:'',trailVfxId:'',impact:{soundId:'',vfxId:'',attach:'center'}};
 }
 p.schemaVersion=4;
}
export function newAnimation():AnimationDefinition {const a=structuredClone(DEFAULT_PRESENTATION.animations[2]);a.id=newId('anim');a.name='Nouvelle animation';return a;}
