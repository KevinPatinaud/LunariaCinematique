import type {GameProject} from '../game/types.js';
import type {AnimationDefinition} from './types.js';

/** Existing projects have no owner field. A clip used by exactly one species profile belongs to it. */
export function animationOwnerId(project:GameProject,animation:AnimationDefinition):string|undefined {
 if(animation.ownerSpeciesId!==undefined)return animation.ownerSpeciesId||undefined;
 const catalog=project.presentation;if(!catalog)return;
 const profiles=catalog.profiles.filter(profile=>profile.slots.some(slot=>slot.animationId===animation.id));
 if(!profiles.length||profiles.some(profile=>profile.id===catalog.defaultProfileId))return;
 const owners=[...project.balance.plants,...project.balance.enemies].filter(species=>profiles.some(profile=>profile.id===species.animationProfileId));
 if(owners.length!==1||profiles.some(profile=>profile.id!==owners[0].animationProfileId))return;
 return owners[0].id;
}

/** Editing a link on a shared profile must not silently alter another character. */
export function setSpeciesAnimation(project:GameProject,speciesId:string,slot:string,animationId:string|null):void {
 const catalog=project.presentation!;
 const owner=[...project.balance.plants,...project.balance.enemies].find(species=>species.id===speciesId);
 if(!owner)throw Error('Personnage introuvable : '+speciesId);
 let profile=catalog.profiles.find(value=>value.id===owner.animationProfileId);
 if(!profile)throw Error('Profil d’animation introuvable : '+owner.animationProfileId);
 const shared=profile.id===catalog.defaultProfileId||[...project.balance.plants,...project.balance.enemies].some(species=>species.id!==speciesId&&species.animationProfileId===profile!.id);
 if(shared){
  profile={...structuredClone(profile),id:uniqueProfileId(catalog.profiles.map(value=>value.id),speciesId),name:'Profil de '+owner.name};
  catalog.profiles.push(profile);
  owner.animationProfileId=profile.id;
 }
 profile.slots=profile.slots.filter(value=>value.slot!==slot);
 if(animationId!==null)profile.slots.push({slot,animationId});
}

function uniqueProfileId(existing:string[],speciesId:string):string {
 const base='profile_'+speciesId;
 if(!existing.includes(base))return base;
 let index=2;while(existing.includes(base+'_'+index))index++;
 return base+'_'+index;
}
