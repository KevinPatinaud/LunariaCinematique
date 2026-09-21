import type { GameProject } from './types.js';
import { BENEFICIAL, INSTANT, PERIODIC, FRACTION } from './combat.js';
import type { GameIssue } from './validation.js';
/** Invoked only after the structural schema. Same checks exist at the Godot boundary. */
export function combatIssues(p:GameProject):GameIssue[]{
 const out:GameIssue[]=[];const error=(path:string,message:string,severity:'error'|'warning'='error')=>out.push({path,message,severity});
 if(!p.combat){if(p.schemaVersion>=2)error('combat','Les catalogues de combat sont requis en format 2.');return out;}
 if(p.schemaVersion<2)error('combat','Les catalogues de combat nécessitent le format 2.');
 const c=p.combat,ids=new Set<string>([p.id,...p.balance.plants.map(x=>x.id),...p.balance.enemies.map(x=>x.id),...p.levels.flatMap(l=>[l.id,...l.waves.flatMap(w=>[w.id,...w.groups.map(g=>g.id)])]),...(p.campaign?.steps.map(s=>s.id)??[]),...(p.campaign?.cinematics.map(f=>f.id)??[])]);
 for(const category of ['abilities','effects','projectiles'] as const)for(const x of c[category]){if(ids.has(x.id))error('combat.'+category+'.'+x.id,'Identifiant répété : '+x.id);ids.add(x.id);}
 const effects=new Map(c.effects.map(e=>[e.id,e])),projectiles=new Set(c.projectiles.map(x=>x.id)),abilities=new Set(c.abilities.map(x=>x.id));
 for(const e of c.effects){const path='combat.effects.'+e.id;
  if(FRACTION.includes(e.kind)&&(e.valueSource!=='fixed'||e.amount>(e.kind==='damage_boost'?3:.95)))error(path,'Un pourcentage est fixe : maximum 95 % (300 % pour le bonus de dégâts).');
  if(['root','stun','armor_break','cleanse'].includes(e.kind)&&(e.valueSource!=='fixed'||e.amount!==0))error(path,'Cet effet utilise uniquement sa durée : valeur fixe égale à 0.');
  if(e.kind==='reward_mark'&&(e.valueSource!=='fixed'||!Number.isInteger(e.amount)||e.amount>400))error(path,'Le bonus de recyclage est un entier fixe entre 0 et 400 graines.');
  if(PERIODIC.includes(e.kind)&&e.tickInterval>e.duration)error(path,'L’intervalle périodique dépasse la durée : aucun déclenchement possible.');
  if(['damage','heal','poison','regeneration'].includes(e.kind)&&e.valueSource==='attack'&&e.amount>10)error(path,'Le multiplicateur d’attaque est limité à 10.');
 }
 for(const a of c.abilities){const path='combat.abilities.'+a.id;
  if(new Set(a.effects).size!==a.effects.length)error(path,'Un effet ne peut pas être répété dans la même capacité.');
  if(a.delivery==='projectile'&&(!projectiles.has(a.projectileId)||a.target!=='opponent'||a.selection!=='one'))error(path,'Un projectile requiert un projectile existant, une cible adverse unique. Utilise son rayon ou sa perforation pour toucher plusieurs cibles.');
  if(a.delivery==='instant'&&a.projectileId!=='')error(path,'Une capacité instantanée ne référence pas de projectile.');
  if(a.target==='self'&&(a.selection!=='one'||a.rowRadius!==0))error(path,'Une capacité sur soi cible uniquement son porteur.');
  if(a.target==='opponent'&&a.priority==='wounded')error(path,'La priorité « allié blessé » ne s’applique pas à un adversaire.');
  for(const id of a.effects){const e=effects.get(id);if(!e){error(path,'Effet absent : '+id);continue;}
   if(BENEFICIAL.includes(e.kind)===(a.target==='opponent'))error(path,`${e.name} : cible incompatible (soin/protection sur allié, dégâts/altérations sur adversaire).`);
  }
 }
 for(const role of ['plants','enemies'] as const)for(const x of p.balance[role]){
  const path='balance.'+role+'.'+x.id;
  if(!Array.isArray(x.ability_ids)){error(path,'La liste des capacités est requise.');continue;}
  if(new Set(x.ability_ids).size!==x.ability_ids.length)error(path,'Capacité attribuée deux fois.');
  for(const id of x.ability_ids)if(!abilities.has(id))error(path,'Capacité inconnue : '+id);
  if(!x.ability_ids.length)error(path,'Aucune capacité : cette espèce ne combat pas (ses PV restent actifs).','warning');
 }
 return out;
}
