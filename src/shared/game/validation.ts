import { presentationIssues } from '../presentation/validation.js';
import { ensurePresentation } from '../presentation/defaults.js';
import { logicIssues } from './logicValidation.js';
import { ensureLogic } from './logicDefaults.js';
import { logicFilmIds } from './logic.js';
import { combatIssues } from './combatValidation.js';
import { ensureCombat } from './combatDefaults.js';
import { safeMoviePath } from './campaign.js';
import { GAME_SCHEMA, type Rule } from './schema.js';
import { totalEnemies, type GameProject } from './types.js';
export interface GameIssue {path:string;message:string;levelId?:string;severity:'error'|'warning'}
export function walkRule(rule:Rule,value:unknown,path:string,issues:GameIssue[]):void {
 if(issues.length>=100)return;
 const fail=(message:string)=>issues.push({path,message,severity:'error'});
 if(Object.hasOwn(rule,'const')&&value!==rule.const){fail('Valeur incompatible avec ce format.');return;}
 const kind=Array.isArray(value)?'array':value===null?'null':typeof value;
 if(rule.type&&kind!==rule.type){fail(`Type ${rule.type} attendu.`);return;}
 if(rule.enum&&!rule.enum.includes(value)){fail('Valeur non reconnue par le jeu.');return;}
 if(typeof value==='number'){
  if(!Number.isFinite(value)||value<(rule.minimum??-Infinity)||value>(rule.maximum??Infinity))fail(`Valeur attendue entre ${rule.minimum} et ${rule.maximum}.`);
  if(rule.multipleOf===1&&!Number.isInteger(value))fail('Un entier est requis.');
 } else if(typeof value==='string'){
  if([...value].length<(rule.minLength??0)||[...value].length>(rule.maxLength??Infinity))fail('Longueur de texte invalide.');
  if(rule.pattern&&!new RegExp(rule.pattern).test(value))fail('Format invalide.');
 }else if(Array.isArray(value)){
  if(value.length<(rule.minItems??0)||value.length>(rule.maxItems??Infinity))fail(`Entre ${rule.minItems??0} et ${rule.maxItems} éléments attendus.`);
  if(rule.items)value.forEach((v,i)=>walkRule(rule.items!,v,`${path}[${i}]`,issues));
 }else if(value&&typeof value==='object'&&rule.properties){
  const o=value as Record<string,unknown>;
  for(const key of rule.required??[])if(!Object.hasOwn(o,key))fail(`Champ requis : ${key}.`);
  for(const [key,v] of Object.entries(o)){if(rule.properties[key])walkRule(rule.properties[key],v,`${path}.${key}`,issues);else if(rule.additionalProperties===false)fail(`Champ interdit : ${key}. Les statistiques ne se définissent pas dans un niveau.`);}
 }
}
export function gameIssues(input:unknown):GameIssue[]{
 const issues:GameIssue[]=[];walkRule(GAME_SCHEMA,input,'projet',issues);if(issues.length)return issues;
 const p=input as GameProject; const seen=new Set<string>();
 const unique=(id:string,path:string)=>{if(seen.has(id))issues.push({path,message:`Identifiant répété : ${id}`,severity:'error'});seen.add(id);};
 for(const x of p.balance.plants)unique(x.id,'balance.plants');for(const x of p.balance.enemies)unique(x.id,'balance.enemies');
 const plants=new Set(p.balance.plants.map(x=>x.id)),enemies=new Set(p.balance.enemies.map(x=>x.id));
 for(const enemy of p.balance.enemies)if(enemy.id!=='thorn_knot'&&enemy.speed<=0)issues.push({path:'balance.enemies.'+enemy.id,message:'La vitesse doit être positive pour entrer sur le plateau.',severity:'error'});
 for(const [i,l] of p.levels.entries()){ 
  const path=`levels[${i}]`;unique(l.id,path);const add=(message:string,severity:'error'|'warning'='error')=>issues.push({path,levelId:l.id,message,severity});
  if(new Set(l.allowedPlants).size!==l.allowedPlants.length)add('Une plante autorisée apparaît deux fois.');
  if(l.allowedPlants.some(id=>!plants.has(id)))add('Une plante autorisée est absente du catalogue global.');
  if(l.midWave>l.waves.length)add('Le dialogue intermédiaire dépasse le nombre de vagues.');
  if(l.midDialogue.length&&l.midWave===0)add('Choisis une vague pour le dialogue intermédiaire.');
  if(l.objective.type==='defend'&&l.objective.target!==0)add('Une défense utilise le nombre de vagues : sa cible doit être 0.');
  if(l.objective.type==='rescue'&&l.objective.target!==3)add('Un sauvetage exige une cible de 3 excroissances.');
  if(!['defend','rescue'].includes(l.objective.type)&&l.objective.target<1)add('L’objectif de travail exige une cible positive.');
  if(l.objective.type==='rescue'){
   const n=l.waves.at(-1)!.groups.filter(g=>g.enemyId==='thorn_knot').reduce((n,g)=>n+g.count,0);
   if(n<3)add('Un sauvetage exige au moins 3 excroissances thorn_knot dans la dernière vague.');
  }
  for(const [j,w] of l.waves.entries()){
   unique(w.id,`${path}.waves[${j}]`);
   if(w.groups.reduce((n,g)=>n+g.count,0)>256)add(`Vague ${j+1} : maximum 256 ennemis.`);
   for(const g of w.groups){unique(g.id,`${path}.waves[${j}]`);if(!enemies.has(g.enemyId))add(`Vague ${j+1} : ennemi inconnu ${g.enemyId}.`);if(g.start+(g.count-1)*g.interval>3600)add(`Vague ${j+1} : la dernière arrivée dépasse 60 minutes.`);}
  }
  const attackers=l.allowedPlants.map(id=>p.balance.plants.find(x=>x.id===id)).filter(x=>x&&(p.combat ? (x.ability_ids??[]).some(id=>{const a=p.combat!.abilities.find(a=>a.id===id);return a?.target==='opponent'&&a.effects.some(id=>{const f=p.combat!.effects.find(f=>f.id===id);return f&&['damage','poison'].includes(f.kind)&&f.amount>0&&(f.valueSource!=='attack'||x.damage>0);});}) : x.damage>0));
  if(!attackers.length)add('Aucune plante autorisée ne possède une attaque directe : vérifie que le niveau est jouable.','warning');
  if(l.allowedPlants.every(id=>(p.balance.plants.find(x=>x.id===id)?.cost??0)>l.startingEnergy))add('Les graines initiales ne permettent de planter aucune espèce.','warning');
  if(totalEnemies(l)>1000)add('Plus de 1 000 ennemis au total : une partie pourrait être très longue.','warning');
 }
 if(p.campaign){
  const {steps,cinematics}=p.campaign,levels=new Set(p.levels.map(l=>l.id)),films=new Set(cinematics.map(f=>f.id));
  const used=new Set<string>(),usedFilms=new Set<string>(),paths=new Set<string>();
  const add=(path:string,message:string,severity:'error'|'warning'='error')=>issues.push({path,message,severity});
  for(const film of cinematics){
   unique(film.id,'campaign.cinematics');
   if(!safeMoviePath(film.file))add('campaign.cinematics','Chemin JSON relatif et portable requis : '+film.file);
   const normalized=film.file.normalize('NFC').toLowerCase();if(paths.has(normalized))add('campaign.cinematics','Fichier référencé deux fois : '+film.file);paths.add(normalized);
  }
  for(const [i,step] of steps.entries()){
   const path=`campaign.steps[${i}]`;unique(step.id,path);
   if(step.kind==='level'){
    if(!levels.has(step.levelId))add(path,'Niveau absent de la bibliothèque.');
    if(used.has(step.levelId))add(path,'Un niveau ne peut apparaître qu’une fois dans la campagne. Pour le rejouer comme une nouvelle étape, duplique le niveau.');used.add(step.levelId);
    if(Object.keys(step).some(k=>!['id','kind','levelId'].includes(k)))add(path,'Une étape Niveau ne possède pas de réglage cinématique.');
   }else{
    if(!films.has(step.cinematicId))add(path,'Cinématique absente du catalogue de campagne.');usedFilms.add(step.cinematicId);
    if(typeof step.skippable!=='boolean')add(path,'Indique si cette cinématique peut être passée.');
    if(Object.keys(step).some(k=>!['id','kind','cinematicId','skippable'].includes(k)))add(path,'Une étape Cinématique ne possède pas de niveau.');
   }
  }
  if(!used.size)add('campaign.steps','Ajoute au moins un niveau à la campagne.');
  const unused=p.levels.length-used.size;if(unused>0)add('campaign.steps',`${unused} niveau(x) conservé(s) dans le Studio mais non publié(s), car absent(s) du parcours.`,'warning');
  for(const id of logicFilmIds(p))usedFilms.add(id);
  const unusedFilms=cinematics.filter(f=>!usedFilms.has(f.id)).length;if(unusedFilms)add('campaign.cinematics',`${unusedFilms} film(s) du catalogue ne sont pas utilisés et ne seront pas publiés.`,'warning');
 }
 issues.push(...combatIssues(p),...logicIssues(p),...presentationIssues(p));
 return issues;
}
export function parseGameProject(value:unknown):GameProject{
 const errors=gameIssues(value).filter(x=>x.severity==='error');if(errors.length)throw new Error(errors.slice(0,12).map(x=>`${x.path} : ${x.message}`).join('\n'));
 const copy=structuredClone(value) as GameProject;ensureCombat(copy);ensureLogic(copy);ensurePresentation(copy);const upgraded=gameIssues(copy).filter(x=>x.severity==='error');if(upgraded.length)throw Error(upgraded.map(x=>x.message).join('\n'));return copy;
}

/** Recovery is allowed to hold an in-progress title or temporarily empty roster.
 * Keep structural integrity, bounded arrays, known fields and numeric limits.
 * This contract is never used for saving the final document or publishing.
 */
const DRAFT_SCHEMA:Rule=structuredClone(GAME_SCHEMA);
function relaxDraftText(rule:Rule):void {
 if(rule.type==='string'&&!rule.pattern&&!rule.enum)rule.minLength=0;
 if(rule.items)relaxDraftText(rule.items);
 for(const [key,child] of Object.entries(rule.properties??{})){
  if(key==='allowedPlants'||key==='effects'&&child.type==='array')child.minItems=0;
  relaxDraftText(child);
 }
}
relaxDraftText(DRAFT_SCHEMA);
export function parseGameDraft(value:unknown):GameProject {
 const issues:GameIssue[]=[];walkRule(DRAFT_SCHEMA,value,'projet',issues);
 if(issues.length)throw new Error('Le brouillon présente une structure invalide. '+issues[0].message);
 const draft=structuredClone(value) as GameProject;
 if(draft.schemaVersion>=2&&(!draft.combat||[...draft.balance.plants,...draft.balance.enemies].some(x=>!Array.isArray(x.ability_ids))))throw Error('Catalogues ou associations absents du brouillon V1.8.');
 if(draft.schemaVersion>=3&&(!draft.logic||[...draft.balance.plants,...draft.balance.enemies].some(x=>!x.behaviorId)||draft.levels.some(l=>!Array.isArray(l.events))))throw Error('Données de logique absentes du brouillon V1.9.');
 if(draft.schemaVersion===4&&(!draft.presentation||[...draft.balance.plants,...draft.balance.enemies].some(s=>!s.visual||!s.animationProfileId)||draft.combat!.abilities.some(a=>!a.presentation)||draft.combat!.projectiles.some(q=>!q.presentation)))throw Error('Données de présentation absentes du brouillon V1.10.');
 ensureCombat(draft);ensureLogic(draft);ensurePresentation(draft);return draft;
}
