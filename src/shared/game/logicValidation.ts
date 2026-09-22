import type { GameProject } from './types.js';
import type { GameIssue } from './validation.js';
import { type Condition, type LogicAction, possibleAbilities, logicFilmIds } from './logic.js';
export const ACTION_FIELDS:Record<string,string[]>={message:['text'],cinematic:['cinematicId','skippable'],sound:['sound'],shake:['amount','duration'],spawn:['enemyId','count','lane','interval'],set_variable:['variableId','value'],add_variable:['variableId','value'],use_ability:['target','speciesId','abilityId'],set_ability:['target','speciesId','abilityId','enabled'],apply_effect:['target','speciesId','effectId'],movement:['target','speciesId','speedFactor','attackFactor','duration'],start_wave:[],finish:['outcome']};
export function logicIssues(p:GameProject):GameIssue[]{
 if(p.schemaVersion<3){return p.logic?[{path:'logic',message:'Le catalogue de logique exige le format 3.',severity:'error'}]:[];}
 const issues:GameIssue[]=[];const add=(path:string,message:string,warning=false)=>issues.push({path,message,...(path.startsWith('levels.')?{levelId:path.split('.')[1]}:{}),severity:warning?'warning':'error'});
 if(!p.logic){add('logic','Catalogue de comportements et variables absent.');return issues;}
 if(!p.combat){add('combat','Catalogue d’attaques absent.');return issues;}
 const ids=new Set<string>([...p.balance.plants,...p.balance.enemies,...p.combat.abilities,...p.combat.effects,...p.combat.projectiles,...p.levels,...p.levels.flatMap(l=>l.waves),...p.levels.flatMap(l=>l.waves.flatMap(w=>w.groups)),...(p.campaign?.steps??[]),...(p.campaign?.cinematics??[])].map(x=>x.id)),abilities=new Set(p.combat.abilities.map(a=>a.id)),effects=new Set(p.combat.effects.map(a=>a.id));
 const species=[...p.balance.plants,...p.balance.enemies],plants=new Set(p.balance.plants.map(s=>s.id)),enemies=new Set(p.balance.enemies.map(s=>s.id));
 const variables=new Map(p.logic.variables.map(v=>[v.id,v])),films=new Set(p.campaign?.cinematics.map(f=>f.id)??[]);
 const unique=(id:string,path:string)=>{if(ids.has(id))add(path,'Identifiant de logique répété : '+id);ids.add(id);};
 for(const v of p.logic.variables){const at='logic.variables.'+v.id;unique(v.id,at);if(v.minimum>v.maximum||v.initial<v.minimum||v.initial>v.maximum)add(at,'Valeur initiale hors des bornes.');if(v.type==='boolean'&&(v.minimum!==0||v.maximum!==1||![0,1].includes(v.initial)))add(at,'Un booléen utilise uniquement 0 ou 1.');}
 function conditions(list:Condition[],at:string,actor=false){
  for(const c of list){if(['health','ready','target'].includes(c.kind)&&!actor)add(at,'Cette condition nécessite un porteur : utilise un déclencheur de PV ou une règle de comportement.');
   if(['ready','target'].includes(c.kind)&&c.ref&&!abilities.has(c.ref))add(at,'Attaque de condition introuvable.');
   if(c.kind==='variable'&&!variables.has(c.ref))add(at,'Variable de condition introuvable.');
   if(c.kind==='health'&&(c.value<0||c.value>100))add(at,'Le seuil de PV est un pourcentage de 0 à 100.');
   if(['ready','target'].includes(c.kind)&&![0,1].includes(c.value))add(at,'Une condition oui/non compare 0 ou 1.');
  }
 }
 function actions(list:LogicAction[],at:string,actor=false,team=''){
  let elapsed=0;
  for(const a of list){elapsed+=a.delay;const fields=ACTION_FIELDS[a.type]??[];
   if(fields.some(f=>!Object.hasOwn(a,f))||Object.keys(a).some(f=>!['type','delay',...fields].includes(f)))add(at,'Champs incohérents pour l’action '+a.type+'.');
   if(a.type==='cinematic'&&!films.has(a.cinematicId!))add(at,'Cinématique absente du catalogue de campagne.');
   if(a.type==='spawn'&&!enemies.has(a.enemyId!))add(at,'Ennemi à faire apparaître introuvable.');
   if(['set_variable','add_variable'].includes(a.type)){const v=variables.get(a.variableId!);if(!v)add(at,'Variable introuvable.');else if(v.type==='boolean'&&(a.type==='add_variable'||![0,1].includes(a.value!)))add(at,'Un booléen se définit à vrai ou faux, sans addition.');else if(a.type==='set_variable'&&(a.value!<v.minimum||a.value!>v.maximum))add(at,'La valeur dépasse les bornes de la variable.');}
   if(['use_ability','set_ability'].includes(a.type)&&!abilities.has(a.abilityId!))add(at,'Attaque de l’action introuvable.');
   if(a.type==='apply_effect'&&!effects.has(a.effectId!))add(at,'Résultat de l’action introuvable.');
   if(a.target==='self'&&!actor)add(at,'La cible « porteur » est réservée aux entrées de phase.');
   if(a.speciesId){const set=a.target==='plants'||a.target==='self'&&team==='plants'?plants:enemies;if(!set.has(a.speciesId))add(at,'Espèce cible inconnue ou dans le mauvais camp.');}
   if(['use_ability','set_ability'].includes(a.type)&&a.target!=='self'){
    const matches=(a.target==='plants'?p.balance.plants:p.balance.enemies).filter(s=>!a.speciesId||s.id===a.speciesId);
    if(!matches.some(s=>possibleAbilities(p,s).includes(a.abilityId!)))add(at,'Aucune espèce ciblée ne possède cette attaque.');
   }
   if(a.type==='finish'&&a.outcome==='won')add(at,'Victoire explicite : cette action peut valider le niveau avant la fin des vagues.',true);
  }
  if(elapsed>3600)add(at,'La séquence d’actions dépasse une heure.');
 }
 for(const b of p.logic.behaviors){const at='logic.behaviors.'+b.id;unique(b.id,at);
  if(b.team==='plants'&&(b.fallback!=='hold'||b.rules.some(r=>['advance','retreat'].includes(r.action))))add(at,'Les plantes restent sur leur case.');
  if(b.mode==='priority'&&!b.rules.length)add(at,'Aucune règle : seul le déplacement par défaut sera utilisé.',true);
  let previous=101;
  for(const [i,f] of b.phases.entries()){
   unique(f.id,at);if(i===0&&f.healthBelow!==100||f.healthBelow>=previous)add(at,'La première phase commence à 100 %, puis les seuils doivent être strictement décroissants.');previous=f.healthBelow;
   if(f.abilityIds.some(id=>!abilities.has(id)))add(at,'Attaque de phase introuvable.');if(new Set(f.abilityIds).size!==f.abilityIds.length)add(at,'Attaque répétée dans une phase.');actions(f.onEnter,at,true,b.team);
  }
  const owners=species.filter(s=>s.behaviorId===b.id);
  for(const r of b.rules){unique(r.id,at);conditions(r.conditions,at,true);if(r.action==='ability'&&r.abilityId&&!abilities.has(r.abilityId))add(at,'Attaque de règle inconnue.');if(r.action!=='ability'&&r.abilityId)add(at,'Une règle de déplacement ne lance pas une attaque.');
   if(r.abilityId&&owners.some(s=>!possibleAbilities(p,s).includes(r.abilityId)))add(at,'L’attaque demandée n’est pas attribuée à tous les porteurs du comportement (ni dans ses phases).');
  }
  for(const f of b.phases)for(const a of f.onEnter)if(a.target==='self'&&a.abilityId&&owners.some(s=>!possibleAbilities(p,s).includes(a.abilityId!)))add(at,'Une action de phase demande une attaque non attribuée au porteur.');
 }
 for(const [team,list] of [['plants',p.balance.plants],['enemies',p.balance.enemies]] as const)for(const s of list){const at='balance.'+team+'.'+s.id,b=p.logic.behaviors.find(b=>b.id===s.behaviorId);if(!b||b.team!==team)add(at,'Comportement absent ou prévu pour un autre camp.');if(possibleAbilities(p,s).length>24)add(at,'Maximum 24 attaques, phases comprises.');}
 for(const l of p.levels){const at='levels.'+l.id;if(!Array.isArray(l.events)){add(at,'Liste des événements absente.');continue;}
  for(const ev of l.events){const ep=at+'.events.'+ev.id;unique(ev.id,ep);conditions(ev.conditions,ep);actions(ev.actions,ep);
   const t=ev.trigger;
   if(t.kind!=='variable'&&(t.value<0||t.value>3600))add(ep,'Le seuil doit être compris entre 0 et 3 600.');
   if(['wave_start','wave_end'].includes(t.kind)&&(!Number.isInteger(t.value)||t.value>l.waves.length))add(ep,'Numéro de vague hors du niveau (0 = chaque vague).');
   if(['spawn','death'].includes(t.kind)&&t.ref&&!species.some(s=>s.id===t.ref))add(ep,'Espèce du déclencheur inconnue.');
   if(t.kind==='health'&&(t.value>100||t.ref&&!enemies.has(t.ref)))add(ep,'Le déclencheur de PV cible un ennemi et un seuil de 0 à 100 %.');
   if(t.kind==='interval'&&t.value<.1)add(ep,'Intervalle minimal : 0,1 seconde.');
   if(t.kind==='ability_used'&&!abilities.has(t.ref))add(ep,'Attaque du déclencheur introuvable.');
   if(t.kind==='variable'&&!variables.has(t.ref))add(ep,'Variable du déclencheur introuvable.');
   if(['enemies','wave_start','wave_end'].includes(t.kind)&&!Number.isInteger(t.value))add(ep,'Un entier est requis.');
  }
 }
 return issues;
}
