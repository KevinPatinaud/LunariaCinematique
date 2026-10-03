import type {GameProject,EnemyDefinition} from './types.js';
import type {AbilityDefinition,EffectDefinition} from './combat.js';
import type {BehaviorDefinition} from './logic.js';
import {IDENTITY,type AnimationDefinition,type AnimationProfile} from '../presentation/types.js';
import {PLASTIC_BAG_FRAMES} from './plasticBagFrames.js';
export const PLASTIC_BAG:EnemyDefinition={
 id:'plastic_bag',name:'Sac Plastique',hp:600,speed:.9,attack:4,reward:16,reach:.05,
 damage_type:'pure',armor:0,resistances:{physical:0,piercing:0,toxic:0},special_damage:0,
 ability_ids:['ab_plastic_bag_suffocate'],behaviorId:'ai_plastic_bag',animationProfileId:'profile_plastic_bag',
 visual:{sprite:{asset:'library://03_enemies/sac plastique/combat/plastic_bag_combat_v01.png',anchor:{x:.5,y:.94}},width:142,height:142,baseline:34,mirror:false,tint:'#ffffff',
 note:'Sac rapide et résistant. Enveloppe la première plante vivante à sa gauche, sur sa propre allée ; lui retire lentement des PV et bloque ses attaques jusqu’à la destruction du sac. Huit animations dessinées, dont la pose et le resserrement.'}
};
export const PLASTIC_BAG_BEHAVIOR:BehaviorDefinition={
 id:'ai_plastic_bag',name:'Sac Plastique — vol et étouffement',description:'Vole jusqu’à la première plante à gauche sur sa propre allée, se pose dessus puis reste accroché. Repart quand la plante meurt.',team:'enemies',mode:'automatic',fallback:'advance',stopToAttack:false,rules:[],
 phases:[{id:'ai_plastic_bag_normal',name:'Normal',healthBelow:100,speedFactor:1,attackFactor:1,inheritAbilities:true,abilityIds:[],onEnter:[]}]
};
export const PLASTIC_BAG_EFFECT:EffectDefinition={id:'fx_plastic_bag_suffocate',name:'Étouffement — perte de PV',description:'Faibles dégâts répétés uniquement sur la plante enveloppée. L’étouffement cesse immédiatement quand le sac est détruit.',kind:'damage',valueSource:'attack',amount:1,damageType:'pure',duration:1,tickInterval:1};
export const PLASTIC_BAG_ABILITY:AbilityDefinition={
 id:'ab_plastic_bag_suffocate',name:'Étouffement du Sac Plastique',description:'Se pose sur la première plante vivante à gauche sur sa propre allée. Reste sur elle, bloque ses attaques et retire lentement des PV. Si la plante meurt, repart vers la suivante. Le sac peut toujours être attaqué.',
 delivery:'instant',projectileId:'',target:'opponent',selection:'one',priority:'nearest',attachToTarget:true,blocksTargetAttack:true,
 rangeSource:'fixed',range:.05,rowRadius:0,cooldownSource:'fixed',cooldown:1,initialDelay:.75,effects:['fx_plastic_bag_suffocate'],
 presentation:{slot:'suffocate',release:'marker',delay:.25,fitCadence:false,start:{soundId:'',vfxId:'',attach:'launch'},releaseCue:{soundId:'',vfxId:'',attach:'launch'},impact:{soundId:'',vfxId:'',attach:'center'}}
};
function animation(slot:keyof typeof PLASTIC_BAG_FRAMES,label:string,times:number[],loop=false):AnimationDefinition{
 const d=times.reduce((a,b)=>a+b,0);
 return {id:'plastic_bag_'+slot,name:'Sac Plastique — '+label,ownerSpeciesId:'plastic_bag',kind:'frames',
 frames:PLASTIC_BAG_FRAMES[slot].map((f,i)=>({...structuredClone(f),duration:times[i]})),duration:d,loop,anchor:{x:.5,y:1},transform:{...IDENTITY},motion:{preset:'none',amplitude:0,period:1},
 attachments:[{id:'center',x:0,y:.5},{id:'feet',x:0,y:1},{id:'head',x:0,y:.15},{id:'launch',x:.35,y:.5}],
 markers:slot==='suffocate'?[{id:'plastic_bag_suffocate_release',at:.25,type:'release',ref:'',attach:'center'}]:[]};
}
export const PLASTIC_BAG_ANIMATIONS:AnimationDefinition[]=[
 animation('idle','flottement',[.3,.3,.3,.3],true),animation('move','vol rapide',[.09,.09,.09,.09],true),
 animation('attack','se pose sur la plante',Array(8).fill(.07)),animation('attached','plante enveloppée',[.25,.25,.25,.25],true),
 animation('suffocate','resserrement',[.1,.15,.15,.1]),animation('hit','touché',[.04,.08,.09,.09]),
 animation('spawn','apparition',[.08,.08,.08,.08]),animation('death','sac détruit',[.15,.15,.2,.3])
];
export const PLASTIC_BAG_PROFILE:AnimationProfile={id:'profile_plastic_bag',name:'Profil Sac Plastique',slots:PLASTIC_BAG_ANIMATIONS.map(a=>({slot:a.id.slice('plastic_bag_'.length),animationId:a.id})),events:[]};
/** Explicit catalog installation: existing species, films and waves keep their settings. */
export function installPlasticBag(p:GameProject):void{
 if(!p.balance.enemies.some(e=>e.id===PLASTIC_BAG.id))p.balance.enemies.push(structuredClone(PLASTIC_BAG));
 if(p.combat){if(!p.combat.abilities.some(a=>a.id===PLASTIC_BAG_ABILITY.id))p.combat.abilities.push(structuredClone(PLASTIC_BAG_ABILITY));if(!p.combat.effects.some(e=>e.id===PLASTIC_BAG_EFFECT.id))p.combat.effects.push(structuredClone(PLASTIC_BAG_EFFECT));}
 if(p.logic&&!p.logic.behaviors.some(b=>b.id===PLASTIC_BAG_BEHAVIOR.id))p.logic.behaviors.push(structuredClone(PLASTIC_BAG_BEHAVIOR));
 if(p.presentation){for(const a of PLASTIC_BAG_ANIMATIONS)if(!p.presentation.animations.some(x=>x.id===a.id))p.presentation.animations.push(structuredClone(a));if(!p.presentation.profiles.some(x=>x.id===PLASTIC_BAG_PROFILE.id))p.presentation.profiles.push(structuredClone(PLASTIC_BAG_PROFILE));}
}
