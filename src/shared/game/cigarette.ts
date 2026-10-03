import type {GameProject,EnemyDefinition} from './types.js';
import type {AbilityDefinition,EffectDefinition} from './combat.js';
import type {BehaviorDefinition} from './logic.js';
import type {AnimationDefinition,AnimationProfile,VfxDefinition} from '../presentation/types.js';

/** One authored definition, reused by new projects and the explicit catalog installer. */
export const CIGARETTE:EnemyDefinition={
 id:'cigarette',name:'Cigarette',hp:220,speed:.16,attack:18,reward:12,reach:3,
 damage_type:'toxic',armor:0,resistances:{physical:0,piercing:0,toxic:0},special_damage:0,
 ability_ids:['ab_cigarette_smoke'],behaviorId:'ai_cigarette_contact',animationProfileId:'profile_cigarette',
 visual:{sprite:{asset:'library://03_enemies/cigarette/combat/cigarette_combat_v01.png',anchor:{x:.55,y:.953}},
  width:114,height:114,baseline:34,mirror:false,tint:'#ffffff',
  note:'Souffle toxique sur les trois cases devant elle, sur sa propre allée. Sprite de combat tourné vers la gauche ; six animations personnelles dessinées image par image.'}
};
export const CIGARETTE_BEHAVIOR:BehaviorDefinition={
 id:'ai_cigarette_contact',name:'Cigarette — avance au contact',team:'enemies',mode:'automatic',fallback:'advance',stopToAttack:false,
 description:'Avance jusqu’au contact de la première plante de son allée, même pendant le souffle. La collision bloque son déplacement ; la portée de fumée ne la fait pas s’arrêter.',rules:[],
 phases:[{id:'ai_cigarette_contact_normal',name:'Normal',healthBelow:100,speedFactor:1,attackFactor:1,inheritAbilities:true,abilityIds:[],onEnter:[]}]
};
export const CIGARETTE_EFFECT:EffectDefinition={id:'fx_cigarette_smoke',name:'Fumée — dégâts toxiques',
 description:'Dégâts immédiats sur chaque plante occupant une case du souffle.',kind:'damage',valueSource:'attack',
 amount:1,damageType:'toxic',duration:1,tickInterval:1};
export const CIGARETTE_ABILITY:AbilityDefinition={id:'ab_cigarette_smoke',name:'Souffle de fumée',
 description:'Touche les trois cases immédiatement devant le porteur, sur sa propre allée. Les cases vides comptent dans la portée ; la première plante ne bloque pas le souffle.',
 delivery:'instant',projectileId:'',target:'opponent',selection:'all',priority:'nearest',forwardCells:3,
 rangeSource:'fixed',range:3,rowRadius:0,cooldownSource:'fixed',cooldown:2.4,initialDelay:.6,effects:['fx_cigarette_smoke'],
 presentation:{slot:'attack',release:'marker',delay:.28,fitCadence:false,
  start:{soundId:'',vfxId:'',attach:'launch'},releaseCue:{soundId:'',vfxId:'vfx_cigarette_smoke',attach:'launch'},
  impact:{soundId:'',vfxId:'',attach:'center'}}
};
/** Generated art remains in its original PNGs. Atlas rectangles and individual foot
 * pivots isolate the poses without baking a grid, resizing or changing their pixels. */
const CIGARETTE_FRAME_DATA={
 "idle": {
  "scale": 1.006223,
  "frames": [
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_locomotion_sheet_v01.png",
    "region": {
     "x": 0,
     "y": 0,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.604167,
     "y": 0.935547
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_locomotion_sheet_v01.png",
    "region": {
     "x": 384,
     "y": 0,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.583333,
     "y": 0.9375
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_locomotion_sheet_v01.png",
    "region": {
     "x": 768,
     "y": 0,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.558594,
     "y": 0.933594
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_locomotion_sheet_v01.png",
    "region": {
     "x": 1152,
     "y": 0,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.561198,
     "y": 0.933594
    }
   }
  ]
 },
 "move": {
  "scale": 1.05274,
  "frames": [
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_locomotion_sheet_v01.png",
    "region": {
     "x": 0,
     "y": 512,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.557292,
     "y": 0.875
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_locomotion_sheet_v01.png",
    "region": {
     "x": 384,
     "y": 512,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.539062,
     "y": 0.884766
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_locomotion_sheet_v01.png",
    "region": {
     "x": 768,
     "y": 512,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.536458,
     "y": 0.876953
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_locomotion_sheet_v01.png",
    "region": {
     "x": 1152,
     "y": 512,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.49349,
     "y": 0.886719
    }
   }
  ]
 },
 "attack": {
  "scale": 1.261446,
  "frames": [
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_attack_sheet_v01.png",
    "region": {
     "x": 0,
     "y": 0,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.582031,
     "y": 0.857422
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_attack_sheet_v01.png",
    "region": {
     "x": 384,
     "y": 0,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.588542,
     "y": 0.859375
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_attack_sheet_v01.png",
    "region": {
     "x": 768,
     "y": 0,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.617188,
     "y": 0.857422
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_attack_sheet_v01.png",
    "region": {
     "x": 1152,
     "y": 0,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.610677,
     "y": 0.859375
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_attack_sheet_v01.png",
    "region": {
     "x": 0,
     "y": 512,
     "width": 424,
     "height": 512
    },
    "anchor": {
     "x": 0.566038,
     "y": 0.800781
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_attack_sheet_v01.png",
    "region": {
     "x": 424,
     "y": 512,
     "width": 344,
     "height": 512
    },
    "anchor": {
     "x": 0.556686,
     "y": 0.798828
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_attack_sheet_v01.png",
    "region": {
     "x": 768,
     "y": 512,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.597656,
     "y": 0.800781
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_attack_sheet_v01.png",
    "region": {
     "x": 1152,
     "y": 512,
     "width": 384,
     "height": 512
    },
    "anchor": {
     "x": 0.579427,
     "y": 0.800781
    }
   }
  ]
 },
 "hit": {
  "scale": 0.965135,
  "frames": [
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_hit_sheet_v01.png",
    "region": {
     "x": 0,
     "y": 0,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.598884,
     "y": 0.966507
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_hit_sheet_v01.png",
    "region": {
     "x": 627,
     "y": 0,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.629984,
     "y": 0.979266
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_hit_sheet_v01.png",
    "region": {
     "x": 0,
     "y": 627,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.602073,
     "y": 0.897927
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_hit_sheet_v01.png",
    "region": {
     "x": 627,
     "y": 627,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.520734,
     "y": 0.92504
    }
   }
  ]
 },
 "spawn": {
  "scale": 1.026859,
  "frames": [
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_spawn_sheet_v01.png",
    "region": {
     "x": 0,
     "y": 0,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.583732,
     "y": 0.958533
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_spawn_sheet_v01.png",
    "region": {
     "x": 627,
     "y": 0,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.500797,
     "y": 0.947368
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_spawn_sheet_v01.png",
    "region": {
     "x": 0,
     "y": 627,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.606858,
     "y": 0.867624
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_spawn_sheet_v01.png",
    "region": {
     "x": 627,
     "y": 627,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.542265,
     "y": 0.869219
    }
   }
  ]
 },
 "death": {
  "scale": 0.946177,
  "frames": [
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_death_sheet_v01.png",
    "region": {
     "x": 0,
     "y": 0,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.65949,
     "y": 0.985646
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_death_sheet_v01.png",
    "region": {
     "x": 627,
     "y": 0,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.549442,
     "y": 0.987241
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_death_sheet_v01.png",
    "region": {
     "x": 0,
     "y": 627,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.522329,
     "y": 0.789474
    }
   },
   {
    "asset": "library://03_enemies/cigarette/animations/cigarette_death_sheet_v01.png",
    "region": {
     "x": 627,
     "y": 627,
     "width": 627,
     "height": 627
    },
    "anchor": {
     "x": 0.472887,
     "y": 0.824561
    }
   }
  ]
 }
} as const;
const frameAnimation=(slot:keyof typeof CIGARETTE_FRAME_DATA,name:string,durations:number[],loop=false,motion:AnimationDefinition['motion']['preset']='none'):AnimationDefinition=>{
 const data=CIGARETTE_FRAME_DATA[slot],duration=durations.reduce((sum,value)=>sum+value,0);
 return {id:'cigarette_'+slot,name:'Cigarette — '+name,ownerSpeciesId:'cigarette',kind:motion==='none'?'frames':'combined',
 frames:data.frames.map((frame,index)=>({...structuredClone(frame),duration:durations[index]})),duration,loop,anchor:{x:.5,y:.95},
 transform:{x:0,y:0,rotation:0,scaleX:data.scale,scaleY:data.scale,opacity:1},motion:{preset:motion,amplitude:1,period:duration},
 attachments:[{id:'feet',x:.5,y:.95},{id:'center',x:.55,y:.58},{id:'head',x:.5,y:.3},{id:'launch',x:.38,y:.5}],
 markers:slot==='attack'?[{id:'cigarette_release',at:.28,type:'release',ref:'',attach:'launch'}]:[]};
};
export const CIGARETTE_ANIMATIONS:AnimationDefinition[]=[
 frameAnimation('idle','attente',[.6,.6,.6,.6],true),
 frameAnimation('move','déplacement',[.175,.175,.175,.175],true),
 frameAnimation('attack','souffle',[.14,.14,.10,.10,.10,.08,.05,.04]),
 frameAnimation('hit','touchée',[.04,.12,.14,.10]),
 frameAnimation('death','recyclée',[.15,.15,.15,.15],false,'fade_out'),
 frameAnimation('spawn','arrivée',[.075,.075,.075,.075],false,'fade_in')
];
export const CIGARETTE_PROFILE:AnimationProfile={id:'profile_cigarette',name:'Profil Cigarette',
 slots:['idle','move','attack','hit','death','spawn'].map(slot=>({slot,animationId:'cigarette_'+slot})),events:[]};
export const CIGARETTE_VFX:VfxDefinition={id:'vfx_cigarette_smoke',name:'Cigarette — nuage du souffle',
 preset:'smoke',duration:.9,size:260,color:'#ffffff',intensity:.75,quantity:10,asset:'library://03_enemies/cigarette/effects/cigarette_smoke_puff_v01.png',attach:'launch',maxInstances:12};

/** Explicit install without changing existing species, levels, films or custom settings. */
export function installCigarette(p:GameProject):void{
 if(!p.balance.enemies.some(e=>e.id===CIGARETTE.id))p.balance.enemies.push(structuredClone(CIGARETTE));
 if(p.logic&&!p.logic.behaviors.some(b=>b.id===CIGARETTE_BEHAVIOR.id))p.logic.behaviors.push(structuredClone(CIGARETTE_BEHAVIOR));
 if(p.combat){
  if(!p.combat.abilities.some(a=>a.id===CIGARETTE_ABILITY.id))p.combat.abilities.push(structuredClone(CIGARETTE_ABILITY));
  if(!p.combat.effects.some(e=>e.id===CIGARETTE_EFFECT.id))p.combat.effects.push(structuredClone(CIGARETTE_EFFECT));
 }
 if(p.presentation){
  for(const a of CIGARETTE_ANIMATIONS)if(!p.presentation.animations.some(x=>x.id===a.id))p.presentation.animations.push(structuredClone(a));
  if(!p.presentation.profiles.some(x=>x.id===CIGARETTE_PROFILE.id))p.presentation.profiles.push(structuredClone(CIGARETTE_PROFILE));
  if(!p.presentation.vfx.some(x=>x.id===CIGARETTE_VFX.id))p.presentation.vfx.push(structuredClone(CIGARETTE_VFX));
 }
}
