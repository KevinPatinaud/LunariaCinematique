import type { GameProject } from '../game/types.js';
import { DEFAULT_ABILITY_PRESENTATION,type PresentationCatalog,type SpeciesVisual,type AnimationDefinition } from './types.js';
import { newId } from '../game/types.js';
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
        }
      ],
      "events": []
    },
    {
      "id": "profile_rose",
      "name": "Profil rose",
      "slots": [],
      "events": []
    },
    {
      "id": "profile_hazel",
      "name": "Profil hazel",
      "slots": [],
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
export const INITIAL_VISUALS:Record<string,SpeciesVisual>={
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
    "note": "Quatre poses et ancrages de pieds repris de radish_art.gd. La libération est désormais au marqueur release."
  },
  "rose": {
    "sprite": {
      "asset": "library://02_characters/Rose/stage_01/animations/rose_stage_01_combat_idle_v01.png",
      "region": {
        "x": 0,
        "y": 0,
        "width": 1024,
        "height": 1536
      },
      "anchor": {
        "x": 0.5,
        "y": 1
      }
    },
    "width": 104,
    "height": 112,
    "baseline": 32,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Design officiel de Rose détouré sur transparence pour l’accueil, les cartes et le combat."
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
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
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
    "note": "Image de repos existante ; attaque procédurale par défaut. Aucun PNG d’attaque spécifique fourni."
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
    "height": 143.0,
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
    "height": 143.0,
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
    "height": 143.0,
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
    "height": 143.0,
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
    "height": 143.0,
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
    "height": 143.0,
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
    "height": 143.0,
    "baseline": 50.7,
    "mirror": false,
    "tint": "#ffffff",
    "note": "Atlas existant et dimensions visuelles conservés. Pas de séquence de sprites dédiée fournie ; mouvements procéduraux."
  }
};
/** Authoring upgrade only. This function is never part of player save loading. */
export function ensurePresentation(p:GameProject):void {
 if(!p.presentation){
  p.presentation=structuredClone(DEFAULT_PRESENTATION);
  for(const s of [...p.balance.plants,...p.balance.enemies]){s.animationProfileId='profile_'+s.id;s.visual=structuredClone(INITIAL_VISUALS[s.id]);}
  for(const a of p.combat?.abilities??[])a.presentation=structuredClone(DEFAULT_ABILITY_PRESENTATION);
  for(const q of p.combat?.projectiles??[])q.presentation={asset:'',animationId:'',trailVfxId:'',impact:{soundId:'',vfxId:'',attach:'center'}};
 }
 p.schemaVersion=4;
}
export function newAnimation():AnimationDefinition {const a=structuredClone(DEFAULT_PRESENTATION.animations[2]);a.id=newId('anim');a.name='Nouvelle animation';return a;}
