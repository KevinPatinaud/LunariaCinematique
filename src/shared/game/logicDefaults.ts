import type { GameProject } from './types.js';
import type { BehaviorDefinition, BehaviorPhase } from './logic.js';
/** Only authoring documents are initialized. Old player profiles are never migrated. */
export function ensureLogic(p:GameProject):void{
 if(p.schemaVersion>=3)return;
 const phase=(id:string,name:string,healthBelow:number):BehaviorPhase=>({id,name,healthBelow,speedFactor:1,attackFactor:1,inheritAbilities:true,abilityIds:[],onEnter:[]});
 const base=(id:string,name:string,team:'plants'|'enemies'):BehaviorDefinition=>({id,name,description:'',team,mode:'automatic',fallback:team==='plants'?'hold':'advance',stopToAttack:true,rules:[],phases:[phase(id+'_normal','Normal',100)]});
 const defender=base('ai_defender','Défenseur immobile','plants'),ground=base('ai_ground','Ennemi terrestre','enemies'),fixed=base('ai_fixed','Ennemi immobile','enemies');fixed.fallback='hold';
 const behaviors=[defender,ground,fixed];
 // Replace former per-species native boss branches with explicit global data.
 for(const enemy of p.balance.enemies.filter(e=>['collector','pump','factory','devourer','corrupted_bramble','furnace'].includes(e.id))){
  const id='ai_'+enemy.id,behavior=base(id,enemy.name+' — phases','enemies');behavior.description='Ancienne attaque spéciale représentée par des capacités globales. Les PV et dégâts de base ne changent pas entre niveaux.';
  const fx='fx_'+enemy.id+'_special',ab='ab_'+enemy.id+'_special';
  p.combat!.effects.push({id:fx,name:enemy.name+' — impact',description:'',kind:'damage',valueSource:'fixed',amount:enemy.special_damage,damageType:enemy.damage_type,duration:1,tickInterval:1});
  const effects=[fx];
  if(['collector','pump','corrupted_bramble'].includes(enemy.id)){
   const stun=fx+'_stun';p.combat!.effects.push({id:stun,name:enemy.name+' — étourdissement',description:'',kind:'stun',valueSource:'fixed',amount:0,damageType:'inherit',duration:enemy.id==='pump'?3:2,tickInterval:1});effects.push(stun);
  }
  p.combat!.abilities.push({id:ab,name:enemy.name+' — onde spéciale',description:'Attaque configurée dans le Studio, sans code propre à ce boss.',delivery:'instant',projectileId:'',target:'opponent',selection:enemy.id==='collector'?'one':'all',priority:'nearest',rangeSource:'fixed',range:12,rowRadius:enemy.id==='corrupted_bramble'?1:0,cooldownSource:'fixed',cooldown:12,initialDelay:6,effects});
  behavior.phases=[phase(id+'_p1','Approche',100),phase(id+'_p2','Colère',66),phase(id+'_p3','Dernière offensive',33)];
  behavior.phases.forEach((f,i)=>{f.abilityIds=[ab];f.attackFactor=1+i*.1;if(i)f.onEnter=[{type:'message',delay:0,text:enemy.name+' change de tactique !'},{type:'shake',delay:0,amount:4,duration:.35}];});
  behaviors.push(behavior);
 }
 p.logic={behaviors,variables:[]};for(const s of p.balance.plants)s.behaviorId=defender.id;
 for(const s of p.balance.enemies)s.behaviorId=behaviors.some(b=>b.id==='ai_'+s.id)?'ai_'+s.id:s.id==='thorn_knot'?fixed.id:ground.id;
 for(const level of p.levels)level.events??=[];
 p.schemaVersion=3;
}
