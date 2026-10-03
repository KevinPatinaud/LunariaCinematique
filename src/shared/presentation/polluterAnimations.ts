import type {AnimationDefinition,AnimationProfile,ProjectilePresentation,SpeciesVisual} from './types.js';
/** Original generated PNGs are kept intact. Regions and individual anchors normalize
 * scale/ground contact without multiplying calibration transforms during hit reactions. */
const FRAME_DATA={
 "canette_idle": [
  {
   "asset": "library://03_enemies/canette/animations/canette_locomotion_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 64,
    "width": 384,
    "height": 368
   },
   "anchor": {
    "x": 0.502604,
    "y": 0.972826
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_locomotion_sheet_v01.png",
   "region": {
    "x": 384,
    "y": 64,
    "width": 384,
    "height": 368
   },
   "anchor": {
    "x": 0.507812,
    "y": 0.972826
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_locomotion_sheet_v01.png",
   "region": {
    "x": 768,
    "y": 65,
    "width": 384,
    "height": 368
   },
   "anchor": {
    "x": 0.476562,
    "y": 0.972826
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_locomotion_sheet_v01.png",
   "region": {
    "x": 1152,
    "y": 65,
    "width": 384,
    "height": 368
   },
   "anchor": {
    "x": 0.450521,
    "y": 0.972826
   }
  }
 ],
 "canette_move": [
  {
   "asset": "library://03_enemies/canette/animations/canette_locomotion_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 543,
    "width": 384,
    "height": 368
   },
   "anchor": {
    "x": 0.520833,
    "y": 0.972826
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_locomotion_sheet_v01.png",
   "region": {
    "x": 384,
    "y": 542,
    "width": 384,
    "height": 368
   },
   "anchor": {
    "x": 0.528646,
    "y": 0.972826
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_locomotion_sheet_v01.png",
   "region": {
    "x": 768,
    "y": 545,
    "width": 384,
    "height": 368
   },
   "anchor": {
    "x": 0.513021,
    "y": 0.972826
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_locomotion_sheet_v01.png",
   "region": {
    "x": 1152,
    "y": 547,
    "width": 384,
    "height": 368
   },
   "anchor": {
    "x": 0.494792,
    "y": 0.972826
   }
  }
 ],
 "canette_attack": [
  {
   "asset": "library://03_enemies/canette/animations/canette_attack_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 92,
    "width": 384,
    "height": 346
   },
   "anchor": {
    "x": 0.510417,
    "y": 0.971098
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_attack_sheet_v01.png",
   "region": {
    "x": 384,
    "y": 96,
    "width": 384,
    "height": 346
   },
   "anchor": {
    "x": 0.466146,
    "y": 0.971098
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_attack_sheet_v01.png",
   "region": {
    "x": 768,
    "y": 95,
    "width": 384,
    "height": 346
   },
   "anchor": {
    "x": 0.458333,
    "y": 0.971098
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_attack_sheet_v01.png",
   "region": {
    "x": 1152,
    "y": 94,
    "width": 384,
    "height": 346
   },
   "anchor": {
    "x": 0.528646,
    "y": 0.971098
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_attack_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 552,
    "width": 384,
    "height": 346
   },
   "anchor": {
    "x": 0.510417,
    "y": 0.971098
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_attack_sheet_v01.png",
   "region": {
    "x": 384,
    "y": 553,
    "width": 384,
    "height": 346
   },
   "anchor": {
    "x": 0.505208,
    "y": 0.971098
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_attack_sheet_v01.png",
   "region": {
    "x": 768,
    "y": 553,
    "width": 384,
    "height": 346
   },
   "anchor": {
    "x": 0.497396,
    "y": 0.971098
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_attack_sheet_v01.png",
   "region": {
    "x": 1152,
    "y": 553,
    "width": 384,
    "height": 346
   },
   "anchor": {
    "x": 0.533854,
    "y": 0.971098
   }
  }
 ],
 "plaque_idle": [
  {
   "asset": "library://03_enemies/plaque/animations/plaque_idle_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 0,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.5311,
    "y": 0.92185
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_idle_sheet_v01.png",
   "region": {
    "x": 627,
    "y": 0,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.523126,
    "y": 0.923445
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_idle_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 627,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.5311,
    "y": 0.832536
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_idle_sheet_v01.png",
   "region": {
    "x": 627,
    "y": 627,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.515949,
    "y": 0.834131
   }
  }
 ],
 "plaque_attack": [
  {
   "asset": "library://03_enemies/plaque/animations/plaque_attack_sheet_v01.png",
   "region": {
    "x": 6,
    "y": 124,
    "width": 378,
    "height": 378
   },
   "anchor": {
    "x": 0.51455,
    "y": 0.973545
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_attack_sheet_v01.png",
   "region": {
    "x": 390,
    "y": 124,
    "width": 378,
    "height": 378
   },
   "anchor": {
    "x": 0.515873,
    "y": 0.973545
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_attack_sheet_v01.png",
   "region": {
    "x": 774,
    "y": 124,
    "width": 378,
    "height": 378
   },
   "anchor": {
    "x": 0.51455,
    "y": 0.973545
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_attack_sheet_v01.png",
   "region": {
    "x": 1158,
    "y": 124,
    "width": 378,
    "height": 378
   },
   "anchor": {
    "x": 0.525132,
    "y": 0.973545
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_attack_sheet_v01.png",
   "region": {
    "x": 6,
    "y": 603,
    "width": 378,
    "height": 378
   },
   "anchor": {
    "x": 0.539683,
    "y": 0.973545
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_attack_sheet_v01.png",
   "region": {
    "x": 389,
    "y": 604,
    "width": 378,
    "height": 378
   },
   "anchor": {
    "x": 0.531746,
    "y": 0.973545
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_attack_sheet_v01.png",
   "region": {
    "x": 774,
    "y": 603,
    "width": 378,
    "height": 378
   },
   "anchor": {
    "x": 0.51455,
    "y": 0.973545
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_attack_sheet_v01.png",
   "region": {
    "x": 1158,
    "y": 603,
    "width": 378,
    "height": 378
   },
   "anchor": {
    "x": 0.517196,
    "y": 0.973545
   }
  }
 ],
 "plaque_hit": [
  {
   "asset": "library://03_enemies/plaque/animations/plaque_hit_sheet_v01.png",
   "region": {
    "x": 102,
    "y": 56,
    "width": 495,
    "height": 495
   },
   "anchor": {
    "x": 0.5,
    "y": 0.979798
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_hit_sheet_v01.png",
   "region": {
    "x": 660,
    "y": 58,
    "width": 495,
    "height": 495
   },
   "anchor": {
    "x": 0.5,
    "y": 0.979798
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_hit_sheet_v01.png",
   "region": {
    "x": 100,
    "y": 627,
    "width": 495,
    "height": 495
   },
   "anchor": {
    "x": 0.5,
    "y": 0.943434
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_hit_sheet_v01.png",
   "region": {
    "x": 665,
    "y": 627,
    "width": 495,
    "height": 495
   },
   "anchor": {
    "x": 0.49899,
    "y": 0.949495
   }
  }
 ],
 "plaque_spawn": [
  {
   "asset": "library://03_enemies/plaque/animations/plaque_spawn_sheet_v01.png",
   "region": {
    "x": 12,
    "y": 0,
    "width": 615,
    "height": 615
   },
   "anchor": {
    "x": 0.509756,
    "y": 0.900813
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_spawn_sheet_v01.png",
   "region": {
    "x": 639,
    "y": 0,
    "width": 615,
    "height": 615
   },
   "anchor": {
    "x": 0.510569,
    "y": 0.902439
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_spawn_sheet_v01.png",
   "region": {
    "x": 12,
    "y": 627,
    "width": 615,
    "height": 615
   },
   "anchor": {
    "x": 0.513008,
    "y": 0.861789
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_spawn_sheet_v01.png",
   "region": {
    "x": 639,
    "y": 627,
    "width": 615,
    "height": 615
   },
   "anchor": {
    "x": 0.508943,
    "y": 0.861789
   }
  }
 ],
 "plaque_death": [
  {
   "asset": "library://03_enemies/plaque/animations/plaque_death_sheet_v01.png",
   "region": {
    "x": 44,
    "y": 17,
    "width": 583,
    "height": 583
   },
   "anchor": {
    "x": 0.516295,
    "y": 0.982847
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_death_sheet_v01.png",
   "region": {
    "x": 645,
    "y": 18,
    "width": 583,
    "height": 583
   },
   "anchor": {
    "x": 0.505146,
    "y": 0.982847
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_death_sheet_v01.png",
   "region": {
    "x": 44,
    "y": 627,
    "width": 583,
    "height": 583
   },
   "anchor": {
    "x": 0.520583,
    "y": 0.90223
   }
  },
  {
   "asset": "library://03_enemies/plaque/animations/plaque_death_sheet_v01.png",
   "region": {
    "x": 646,
    "y": 627,
    "width": 583,
    "height": 583
   },
   "anchor": {
    "x": 0.504288,
    "y": 0.903945
   }
  }
 ],
 "canette_hit": [
  {
   "asset": "library://03_enemies/canette/animations/canette_hit_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 0,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.516746,
    "y": 0.952153
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_hit_sheet_v01.png",
   "region": {
    "x": 627,
    "y": 0,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.602871,
    "y": 0.974482
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_hit_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 627,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.484848,
    "y": 0.897927
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_hit_sheet_v01.png",
   "region": {
    "x": 627,
    "y": 627,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.486443,
    "y": 0.910686
   }
  }
 ],
 "canette_spawn": [
  {
   "asset": "library://03_enemies/canette/animations/canette_spawn_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 0,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.483254,
    "y": 0.886762
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_spawn_sheet_v01.png",
   "region": {
    "x": 627,
    "y": 0,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.444976,
    "y": 0.910686
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_spawn_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 627,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.480064,
    "y": 0.862839
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_spawn_sheet_v01.png",
   "region": {
    "x": 627,
    "y": 627,
    "width": 627,
    "height": 627
   },
   "anchor": {
    "x": 0.452951,
    "y": 0.874003
   }
  }
 ],
 "canette_death": [
  {
   "asset": "library://03_enemies/canette/animations/canette_death_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 55,
    "width": 627,
    "height": 501
   },
   "anchor": {
    "x": 0.513557,
    "y": 0.98004
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_death_sheet_v01.png",
   "region": {
    "x": 627,
    "y": 50,
    "width": 627,
    "height": 501
   },
   "anchor": {
    "x": 0.478469,
    "y": 0.98004
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_death_sheet_v01.png",
   "region": {
    "x": 0,
    "y": 627,
    "width": 627,
    "height": 501
   },
   "anchor": {
    "x": 0.524721,
    "y": 0.97006
   }
  },
  {
   "asset": "library://03_enemies/canette/animations/canette_death_sheet_v01.png",
   "region": {
    "x": 627,
    "y": 627,
    "width": 627,
    "height": 501
   },
   "anchor": {
    "x": 0.486443,
    "y": 0.978044
   }
  }
 ]
} as const;
const frameAnimation=(key:keyof typeof FRAME_DATA,id:string,name:string,durations:number[],loop=false,fade=false):AnimationDefinition=>{
 const ownerSpeciesId=key.startsWith('plaque_')?'plaque':'runner',duration=durations.reduce((sum,n)=>sum+n,0);
 return {id,name,ownerSpeciesId,kind:fade?'combined':'frames',frames:FRAME_DATA[key].map((frame,index)=>({...structuredClone(frame),duration:durations[index]})),duration,loop,
 anchor:{x:.5,y:1},transform:{x:0,y:0,rotation:0,scaleX:1,scaleY:1,opacity:1},motion:{preset:fade?'fade_out':'none',amplitude:fade?1:0,period:duration},
 attachments:[{id:'feet',x:.5,y:.97},{id:'center',x:.5,y:.55},{id:'head',x:.5,y:.25},{id:'launch',x:ownerSpeciesId==='plaque'?.275:.22,y:ownerSpeciesId==='plaque'?.68:.5}],
 markers:key.endsWith('_attack')?[{id:id+'_release',at:ownerSpeciesId==='plaque'?.18:.1,type:'release',ref:'',attach:'launch'}]:[]};
};
export const POLLUTER_ANIMATIONS:AnimationDefinition[]=[
 frameAnimation('canette_idle','runner_idle','Canette pressée — attente',[.6,.6,.6,.6],true),
 frameAnimation('canette_move','move_runner','Canette pressée — déplacement',[.157,.157,.157,.157],true),
 frameAnimation('canette_attack','runner_attack','Canette pressée — coup de pince',[.05,.05,.04,.045,.045,.045,.04,.035]),
 frameAnimation('canette_hit','runner_hit','Canette pressée — touchée',[.025,.065,.065,.025]),
 frameAnimation('canette_spawn','runner_spawn','Canette pressée — activation',[.075,.075,.075,.075]),
 frameAnimation('canette_death','runner_death','Canette pressée — recyclée',[.15,.15,.15,.15],false,true),
 frameAnimation('plaque_idle','plaque_idle','Plaque — attente',[.2,.2,.2,.2],true),
 frameAnimation('plaque_attack','plaque_attack','Plaque — crachat',[.09,.09,.08,.07,.07,.06,.06,.05]),
 frameAnimation('plaque_hit','plaque_hit','Plaque — touchée',[.025,.065,.065,.025]),
 frameAnimation('plaque_spawn','plaque_spawn','Plaque — ouverture',[.125,.125,.125,.125]),
 frameAnimation('plaque_death','plaque_death','Plaque — fermeture',[.15,.15,.15,.15],false,true),
];
export const PLAQUE_SLIME_ANIMATION:AnimationDefinition={id:'plaque_slime_projectile',name:'Plaque — goutte de slime',ownerSpeciesId:'plaque',kind:'frames',frames:[{asset:'library://03_enemies/plaque/effects/plaque_slime_glob_v01.png',region:{"x":98,"y":420,"width":1014,"height":454},anchor:{x:.5,y:.5},duration:.1}],duration:.1,loop:true,anchor:{x:.5,y:.5},transform:{x:0,y:0,rotation:0,scaleX:1,scaleY:1,opacity:1},motion:{preset:'none',amplitude:0,period:1},attachments:[{id:'center',x:.5,y:.5}],markers:[]};
POLLUTER_ANIMATIONS.push(PLAQUE_SLIME_ANIMATION);
export const POLLUTER_PROFILES:AnimationProfile[]=[
 {id:'profile_runner',name:'Canette pressée',slots:[{slot:'idle',animationId:'runner_idle'},{slot:'move',animationId:'move_runner'},{slot:'attack',animationId:'runner_attack'},{slot:'hit',animationId:'runner_hit'},{slot:'spawn',animationId:'runner_spawn'},{slot:'death',animationId:'runner_death'}],events:[]},
 {id:'profile_plaque',name:'Plaque fixe',slots:[{slot:'idle',animationId:'plaque_idle'},{slot:'move',animationId:'plaque_idle'},{slot:'attack',animationId:'plaque_attack'},{slot:'hit',animationId:'plaque_hit'},{slot:'spawn',animationId:'plaque_spawn'},{slot:'death',animationId:'plaque_death'}],events:[]}
];
export const POLLUTER_VISUALS:Record<string,SpeciesVisual>={
 "runner": {
  "sprite": {
   "asset": "library://03_enemies/canette/combat/canette_combat_v01.png",
   "anchor": {
    "x": 0.490431,
    "y": 0.904306
   }
  },
  "width": 130,
  "height": 100,
  "baseline": 34,
  "mirror": false,
  "tint": "#ffffff",
  "note": "Canette bleue rouillée ; six animations personnelles dessinées image par image."
 },
 "plaque": {
  "sprite": {
   "asset": "library://03_enemies/plaque/combat/plaque_combat_v01.png",
   "anchor": {
    "x": 0.505981,
    "y": 0.855662
   }
  },
  "width": 112,
  "height": 118,
  "baseline": 29,
  "mirror": false,
  "tint": "#ffffff",
  "note": "Plaque fixe ; grille animée, crachat violet et réactions dessinées. Le déplacement reprend son attente immobile."
 }
};
export const PLAQUE_SLIME_PRESENTATION:ProjectilePresentation={asset:'library://03_enemies/plaque/effects/plaque_slime_glob_v01.png',animationId:PLAQUE_SLIME_ANIMATION.id,trailVfxId:'',impact:{soundId:'',vfxId:'',attach:'center'}};
