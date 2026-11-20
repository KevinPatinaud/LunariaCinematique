import type {AnimationDefinition,AnimationProfile,SpeciesVisual} from './types.js';

/** Poses derived from the approved Master; authored timing and release markers are preserved. */
export const IVY_ANIMATIONS:AnimationDefinition[]=[
  {
    "id": "ivy_idle",
    "ownerSpeciesId": "ivy",
    "name": "Lierre — respiration",
    "kind": "combined",
    "frames": [
      {
        "asset": "library://02_characters/lierre/Master.png",
        "region": {
          "x": 287,
          "y": 7,
          "width": 776,
          "height": 1234
        },
        "anchor": {
          "x": 0.605026,
          "y": 1
        },
        "duration": 2.4
      }
    ],
    "duration": 2.4,
    "loop": true,
    "anchor": {
      "x": 0.605026,
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
      "amplitude": 0.3,
      "period": 2.4
    },
    "attachments": [
      {
        "id": "feet",
        "x": 0.605026,
        "y": 1
      },
      {
        "id": "center",
        "x": 0.605026,
        "y": 0.57
      },
      {
        "id": "head",
        "x": 0.605026,
        "y": 0.31
      },
      {
        "id": "launch",
        "x": 0.94,
        "y": 0.68
      }
    ],
    "markers": []
  },
  {
    "id": "ivy_move",
    "ownerSpeciesId": "ivy",
    "name": "Lierre — marche",
    "kind": "combined",
    "frames": [
      {
        "asset": "library://02_characters/lierre/poses/lierre_marche_a_v01.png",
        "region": {
          "x": 260,
          "y": 10,
          "width": 836,
          "height": 1221
        },
        "anchor": {
          "x": 0.625,
          "y": 1
        },
        "duration": 0.3
      },
      {
        "asset": "library://02_characters/lierre/poses/lierre_marche_b_v01.png",
        "region": {
          "x": 286,
          "y": 13,
          "width": 783,
          "height": 1225
        },
        "anchor": {
          "x": 0.572158,
          "y": 1
        },
        "duration": 0.3
      },
      {
        "asset": "library://02_characters/lierre/poses/lierre_marche_a_v01.png",
        "region": {
          "x": 260,
          "y": 10,
          "width": 836,
          "height": 1221
        },
        "anchor": {
          "x": 0.625,
          "y": 1
        },
        "duration": 0.3
      },
      {
        "asset": "library://02_characters/lierre/poses/lierre_marche_b_v01.png",
        "region": {
          "x": 286,
          "y": 13,
          "width": 783,
          "height": 1225
        },
        "anchor": {
          "x": 0.572158,
          "y": 1
        },
        "duration": 0.3
      }
    ],
    "duration": 1.2,
    "loop": true,
    "anchor": {
      "x": 0.625,
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
      "period": 1.2
    },
    "attachments": [
      {
        "id": "feet",
        "x": 0.625,
        "y": 1
      },
      {
        "id": "center",
        "x": 0.625,
        "y": 0.57
      },
      {
        "id": "head",
        "x": 0.625,
        "y": 0.31
      },
      {
        "id": "launch",
        "x": 0.94,
        "y": 0.68
      }
    ],
    "markers": []
  },
  {
    "id": "ivy_attack",
    "ownerSpeciesId": "ivy",
    "name": "Lierre — lancement de liane",
    "kind": "combined",
    "frames": [
      {
        "asset": "library://02_characters/lierre/poses/lierre_garde_v01.png",
        "region": {
          "x": 171,
          "y": 6,
          "width": 956,
          "height": 1225
        },
        "anchor": {
          "x": 0.552824,
          "y": 1
        },
        "duration": 0.1
      },
      {
        "asset": "library://02_characters/lierre/poses/lierre_attaque_v01.png",
        "region": {
          "x": 197,
          "y": 11,
          "width": 1022,
          "height": 1223
        },
        "anchor": {
          "x": 0.481409,
          "y": 1
        },
        "duration": 0.16
      },
      {
        "asset": "library://02_characters/lierre/poses/lierre_garde_v01.png",
        "region": {
          "x": 171,
          "y": 6,
          "width": 956,
          "height": 1225
        },
        "anchor": {
          "x": 0.552824,
          "y": 1
        },
        "duration": 0.09
      }
    ],
    "duration": 0.35,
    "loop": false,
    "anchor": {
      "x": 0.481409,
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
      "amplitude": 0.25,
      "period": 0.35
    },
    "attachments": [
      {
        "id": "feet",
        "x": 0.481409,
        "y": 1
      },
      {
        "id": "center",
        "x": 0.481409,
        "y": 0.57
      },
      {
        "id": "head",
        "x": 0.481409,
        "y": 0.31
      },
      {
        "id": "launch",
        "x": 0.987,
        "y": 0.52
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
    "id": "ivy_hit",
    "ownerSpeciesId": "ivy",
    "name": "Lierre — impact",
    "kind": "combined",
    "frames": [
      {
        "asset": "library://02_characters/lierre/poses/lierre_impact_v01.png",
        "region": {
          "x": 149,
          "y": 12,
          "width": 1002,
          "height": 1217
        },
        "anchor": {
          "x": 0.641717,
          "y": 1
        },
        "duration": 0.25
      }
    ],
    "duration": 0.25,
    "loop": false,
    "anchor": {
      "x": 0.641717,
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
      "amplitude": 0.2,
      "period": 0.25
    },
    "attachments": [
      {
        "id": "feet",
        "x": 0.641717,
        "y": 1
      },
      {
        "id": "center",
        "x": 0.641717,
        "y": 0.57
      },
      {
        "id": "head",
        "x": 0.641717,
        "y": 0.31
      },
      {
        "id": "launch",
        "x": 0.94,
        "y": 0.68
      }
    ],
    "markers": []
  }
];
export const IVY_PROFILE:AnimationProfile={
  "id": "profile_ivy",
  "name": "Lierre — guide et étreinte",
  "slots": [
    {
      "slot": "idle",
      "animationId": "ivy_idle"
    },
    {
      "slot": "move",
      "animationId": "ivy_move"
    },
    {
      "slot": "attack",
      "animationId": "ivy_attack"
    },
    {
      "slot": "hit",
      "animationId": "ivy_hit"
    }
  ],
  "events": []
};
export const IVY_VISUAL:SpeciesVisual={
  "sprite": {
    "asset": "library://02_characters/lierre/Master.png",
    "region": {
      "x": 287,
      "y": 7,
      "width": 776,
      "height": 1234
    },
    "anchor": {
      "x": 0.605026,
      "y": 1
    }
  },
  "width": 96,
  "height": 80,
  "baseline": 32,
  "mirror": false,
  "tint": "#ffffff",
  "note": "Lierre : Master validé conservé au repos ; poses de marche, garde, lancement et impact dérivées directement de ce Master, mains en feuilles et pieds calibrés."
};
