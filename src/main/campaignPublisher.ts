import { presentationAssets } from '../shared/presentation/runtime.js';
import { cinematicPresentationIssues } from '../shared/presentation/validation.js';
import {validatePresentationRegions} from './presentationAssets.js';
import { allActions } from '../shared/game/logic.js';
import { promises as fs, createReadStream } from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { atomicJson, isWithin, resolveAsset } from './files.js';
import { parseGameProject, walkRule, type GameIssue } from '../shared/game/validation.js';
import type { Rule } from '../shared/game/schema.js';
import { compileCampaign, isProgressionMilestone, safeMoviePath } from '../shared/game/campaign.js';
import { defaultHomeScreen } from '../shared/game/homeScreen.js';
import { parseCinematic } from '../shared/schema.js';
import { referencedAssets } from '../shared/model.js';
import type { CampaignCheck, GameProject } from '../shared/game/types.js';
const MAX_ASSET=100*1024*1024;
async function hash(file:string):Promise<string>{const h=createHash('sha256');for await(const chunk of createReadStream(file))h.update(chunk);return h.digest('hex');}
const json=(v:unknown)=>JSON.stringify(v,null,2)+'\n';
const sha=(v:string)=>createHash('sha256').update(v).digest('hex');
interface PlannedFile {relative:string;hash:string;source?:string;text?:string}
interface Plan {project:GameProject;files:PlannedFile[];check:CampaignCheck}
/** Rewrite media fields only: a title or dialogue can also contain a library URL. */
function remapAssets(value:unknown,refs:Map<string,string>):void{
 if(!value||typeof value!=='object')return;
 for(const [key,item] of Object.entries(value)){
  if(typeof item==='string'&&['asset','frameAsset','image','sourceAssetRef','terrainImage','restoredTerrainImage'].includes(key)&&refs.has(item))
   (value as Record<string,unknown>)[key]=refs.get(item)!;
  else if(item&&typeof item==='object')remapAssets(item,refs);
 }
}
/** Preflight performs no writes. A missing/invalid film or asset aborts the entire publication. */
export async function planCampaign(value:unknown,libraryRoot:string,gameRoot?:string):Promise<Plan>{
 const original=parseGameProject(value),project=compileCampaign(original),files:PlannedFile[]=[],assets=new Map<string,string>();
 // The living greenhouse uses the labels. Keep the existing schema with a media-free layout.
 if(project.homeScreen){
  project.homeScreen={
   background:defaultHomeScreen().background,
   continueLabels:project.homeScreen.continueLabels,
   elements:[],
  };
 }
 const movies=project.campaign!.cinematics;
 const embedded=new Map((original.cinematics??[]).map(doc=>[doc.id,doc]));
 const folded=new Map<string,string>(), canonicalMovies=new Map<string,string>();
 async function collect(ref:string):Promise<void>{
   const relative=ref.slice(10);if(!safeMoviePath(relative+'.json'))throw Error('Nom de ressource non portable : '+ref);
   const normalized=relative.normalize('NFC').toLowerCase(),prior=folded.get(normalized);
   if(prior&&prior!==relative)throw Error('Deux ressources ne diffèrent que par leur casse/normalisation : '+prior+' / '+relative);
   folded.set(normalized,relative);if(assets.has(ref))return;
   if(!libraryRoot)throw Error('Choisis la bibliothèque commune dans le mode Cinématiques avant de publier.');
   const source=await resolveAsset(libraryRoot,ref).catch(()=>{throw Error('Ressource introuvable ou hors bibliothèque : '+ref);});
   const stat=await fs.stat(source);if(stat.size===0||stat.size>MAX_ASSET)throw Error('Ressource vide ou supérieure à 100 Mo : '+ref);
   if(!/\.(png|jpe?g|webp|wav|ogg|mp3)$/i.test(source))throw Error('Format de ressource refusé : '+ref);
   const digest=await hash(source);let published=relative;
   if(gameRoot){
    const dest=await target(gameRoot,'LunariaArtLibrary/'+relative);
    const existing=await hash(dest).catch((e:NodeJS.ErrnoException)=>{if(e.code==='ENOENT')return null;throw e;});
    // Keep earlier campaigns playable; a changed source gets an immutable, reusable copy.
    if(existing!==null&&existing!==digest)published=`studio_versions/${digest}${path.posix.extname(relative).toLowerCase()}`;
   }
   assets.set(ref,'library://'+published);
   const destination='LunariaArtLibrary/'+published;
   const planned=files.find(file=>file.relative===destination);
   if(planned&&planned.hash!==digest)throw Error('Deux ressources ciblent des contenus différents : '+destination);
   if(!planned)files.push({relative:destination,source,hash:digest});
 }
 for(const ref of presentationAssets(project))await collect(ref);
 if(project.presentation)await validatePresentationRegions(project,libraryRoot);
 const aliases=new Map<string,string>();
 for(const film of movies){
  const authored=embedded.get(film.documentId);
  if(!authored)throw Error('Cinématique absente du projet : '+film.title);
  const doc=parseCinematic(authored);
  if(doc.id!==film.documentId)throw Error('Le fichier ne correspond plus à la cinématique liée : '+film.file);
  const presentationErrors=cinematicPresentationIssues(doc,project);if(presentationErrors.length)throw Error(presentationErrors.join('\n'));
  delete doc.category; // Studio organization must not change the playable film or its content hash.
  if(doc.presentationCatalog)doc.presentationCatalog.file='content/design/game_content.json';
  for(const ref of referencedAssets(doc))await collect(ref);
  remapAssets(doc,assets);
  const text=json(doc),digest=sha(text),relative=`content/cinematics/studio/${digest}.cinematic.json`;
  if(!files.some(f=>f.relative===relative))files.push({relative,hash:digest,text});
  const canonicalId=canonicalMovies.get(digest);
  if(canonicalId)aliases.set(film.id,canonicalId);else canonicalMovies.set(digest,film.id);
  film.file=relative;film.title=doc.title;
 }
 delete project.cinematics;
 // Two source files may contain an identical film. Reuse one immutable blob/catalog entry.
 if(aliases.size){
  project.campaign!.cinematics=movies.filter(f=>!aliases.has(f.id));
  for(const step of project.campaign!.steps)if(step.kind==='cinematic')step.cinematicId=aliases.get(step.cinematicId)??step.cinematicId;
  for(const a of allActions(project))if(a.type==='cinematic')a.cinematicId=aliases.get(a.cinematicId!)??a.cinematicId;
 }
 remapAssets(project,assets);
 parseGameProject(project);
 if(gameRoot){
  const schemaPath=await target(gameRoot,'content/design/game-project.schema.json');
  const rawSchema=await fs.readFile(schemaPath,'utf8').catch((e:NodeJS.ErrnoException)=>{if(e.code==='ENOENT')return null;throw e;});
  if(rawSchema!==null){
   let targetSchema:Rule;
   try{targetSchema=JSON.parse(rawSchema) as Rule;}catch{throw Error('Le schéma du jeu cible est invalide : content/design/game-project.schema.json.');}
   const targetIssues:GameIssue[]=[];
   walkRule(targetSchema,project,'projet',targetIssues);
   if(targetIssues.length)throw Error(`Le jeu cible utilise un contrat obsolète (${targetIssues[0].path} : ${targetIssues[0].message}). Synchronise le contrat Studio → Godot avant de publier.`);
  }
 }
 const skipped=original.levels.length-project.levels.length;
 const originalEnd=original.campaign?.steps.findIndex(s=>s.kind==='end')??-1;
 const afterEnd=originalEnd<0?[]:original.campaign!.steps.slice(originalEnd+1);
 const deferred=afterEnd.filter(s=>!isProgressionMilestone(s)).length;
 const unlockAfterEnd=afterEnd.some(s=>s.kind==='unlock_travel_book');
 const herbariumAfterEnd=afterEnd.some(s=>s.kind==='unlock_herbarium');
 const warnings=skipped?[`${skipped} niveau(x) hors de la partie jouable conservé(s) dans le projet du Studio, non publié(s).`]:[];
 if(deferred>0)warnings.push(`${deferred} étape(s) après la fin actuelle conservée(s) dans le Studio, non publiée(s).`);
 if(unlockAfterEnd)warnings.push('Le déblocage du carnet de voyage est placé après la fin actuelle : il restera verrouillé dans la version publiée.');
 if(herbariumAfterEnd)warnings.push('Le déblocage de L’herbier est placé après la fin actuelle : il restera verrouillé dans la version publiée.');
 return {project,files,check:{films:project.campaign!.cinematics.length,assets:assets.size,steps:project.campaign!.steps.length,levels:project.levels.length,warnings}};
}
/** Refuse symlinked destinations (including internal ones) and non-regular files. */
async function target(root:string,relative:string,create=false):Promise<string>{
 let current=root;const parts=relative.split('/');
 if(parts.some(p=>p==='..'||p==='.'||!p))throw Error('Destination invalide.');
 for(let i=0;i<parts.length;i++){
  current=path.join(current,parts[i]);
  let stat=await fs.lstat(current).catch((e:NodeJS.ErrnoException)=>{if(e.code==='ENOENT')return null;throw e;});
  if(!stat&&create&&i<parts.length-1){await fs.mkdir(current).catch((e:NodeJS.ErrnoException)=>{if(e.code!=='EEXIST')throw e;});stat=await fs.lstat(current);}
  if(stat&&(stat.isSymbolicLink()||(i<parts.length-1?!stat.isDirectory():!stat.isFile())))throw Error('Destination non régulière : '+relative);
 }
 return current;
}
/** The content file is the commit point. Immutable film blobs + shared images are prepared first.
 * On a handled failure, remove only files created by this job whose hash is still ours.
 * A process crash can leave unused blobs, but cannot point the previous campaign at half-written films.
 */
export async function publishCampaign(value:unknown,gameRoot:string,libraryRoot:string):Promise<CampaignCheck&{path:string}>{
 const root=await fs.realpath(gameRoot);
 for(const marker of ['project.godot','app/controllers/campaign_flow.gd','domain/logic/event_runtime.gd','domain/presentation/animation_registry.gd']){const real=await fs.realpath(path.join(root,marker)).catch(()=>{throw Error('Choisis le projet Godot fourni avec Lunaria Studio V1.10.');});if(!isWithin(root,real))throw Error('Projet de destination invalide.');}
 const lock=path.join(root,'.lunaria-campaign-publish.lock');
 const handle=await fs.open(lock,'wx').catch(()=>{throw Error('Une publication est déjà en cours (ou un verrou subsiste après un arrêt forcé).');});
 const created:PlannedFile[]=[],temporary:string[]=[];let committed=false;
 try{
  const plan=await planCampaign(value,libraryRoot,root);
  const content=await target(root,'content/design/game_content.json');
  const pending:PlannedFile[]=[];
  // Changed media were versioned during planning. Reject corrupted immutable destinations.
  for(const file of plan.files){const dest=await target(root,file.relative);const present=await fs.stat(dest).catch((e:NodeJS.ErrnoException)=>{if(e.code==='ENOENT')return null;throw e;});
   if(present){if(await hash(dest)!==file.hash)throw Error('Conflit de ressource publiée : '+file.relative+'. La copie du jeu diffère de la version attendue.');}
   else pending.push(file);
  }
  for(const file of pending){
   const dest=await target(root,file.relative,true),tmp=dest+'.'+randomUUID()+'.tmp';temporary.push(tmp);
   if(file.source)await fs.copyFile(file.source,tmp,fs.constants.COPYFILE_EXCL);else await fs.writeFile(tmp,file.text!,{flag:'wx'});
   if(await hash(tmp)!==file.hash)throw Error('Une ressource a changé pendant la publication : '+file.relative);
   // link is an atomic no-clobber install on a single filesystem (Windows NTFS supported).
   try{await fs.link(tmp,dest);created.push(file);}catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;if(await hash(dest)!==file.hash)throw Error('Une destination a changé pendant la publication : '+file.relative);}
   await fs.unlink(tmp);
  }
  await target(root,'content/design/game_content.json');
  await atomicJson(content,plan.project,true);committed=true;
  return {...plan.check,path:content};
 }finally{
  for(const tmp of temporary)await fs.unlink(tmp).catch(()=>undefined);
  if(!committed)for(const file of created.reverse()){
   const dest=path.join(root,file.relative);try{if(await hash(dest)===file.hash)await fs.unlink(dest);}catch{/* preserve independently modified files */}
  }
  await handle.close();await fs.unlink(lock).catch(()=>undefined);
 }
}
