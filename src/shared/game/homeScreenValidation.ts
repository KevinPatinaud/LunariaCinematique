import {safeMoviePath} from './campaign.js';
import {HOME_KIND_FIELDS} from './homeScreenSchema.js';
import type {GameProject} from './types.js';
import type {GameIssue} from './validation.js';
/** Structural checks run before this function; these are cross-reference and
 * kind-specific invariants, with warnings for accidentally inaccessible menus.
 */
export function homeScreenIssues(project:GameProject):GameIssue[] {
 const screen=project.homeScreen;if(!screen)return [];
 const issues:GameIssue[]=[],ids=new Set<string>(),plants=new Set(project.balance.plants.map(p=>p.id));
 const add=(path:string,message:string,severity:GameIssue['severity']='error')=>issues.push({path:'homeScreen.'+path,message,severity});
 const asset=(ref:string,path:string,required=false)=>{
  if(!ref){if(required)add(path,'Choisis une image dans la bibliothèque.');return;}
  if(!ref.startsWith('library://')||!safeMoviePath(ref.slice(10)+'.json'))add(path,'Chemin d’image relatif et portable de la bibliothèque requis.');
 };
 asset(screen.background.image,'background.image',screen.background.mode==='image');
 for(const [i,element] of screen.elements.entries()){
  const path=`elements[${i}]`;
  if(ids.has(element.id))add(path+'.id','Identifiant d’élément répété : '+element.id);ids.add(element.id);
  for(const key of HOME_KIND_FIELDS[element.kind])if(!Object.hasOwn(element,key))add(path+'.'+key,'Champ requis pour cet élément : '+key);
  if(element.kind==='image')asset(element.image??'',path+'.image',element.visible);
  if(element.kind==='plant'&&!plants.has(element.plantId??''))add(path+'.plantId','Cette plante est absente du catalogue.');
  for(const key of ['showIfPlantUnlocked','hideIfPlantUnlocked'] as const)if(element[key]&&!plants.has(element[key]))add(path+'.'+key,'Cette condition utilise une plante absente du catalogue.');
  if(element.kind!=='line'&&(element.rect.w<=0||element.rect.h<=0))add(path+'.rect','La largeur et la hauteur doivent être positives.');
  if(element.showIfPlantUnlocked&&element.showIfPlantUnlocked===element.hideIfPlantUnlocked)add(path,'Les conditions de visibilité sont contradictoires.');
 }
 for(const action of ['continue','options'])if(!screen.elements.some(e=>e.kind==='button'&&e.action===action&&e.visible&&e.opacity>0))add('elements',`Aucun bouton visible pour ${action==='continue'?'continuer l’aventure':'ouvrir les paramètres'}.`,'warning');
 return issues;
}
