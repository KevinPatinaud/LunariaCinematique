import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { atomicJson, readJsonSource } from './files.js';
import { parseGameProject, parseGameDraft } from '../shared/game/validation.js';
import type { GameProject, GameFile, GameRecent, GameBootstrap } from '../shared/game/types.js';
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
/** File ownership stays in Node. Renderer tokens are not filesystem paths. */
export class GameDocuments {
 private active:{path:string;token:string;hash:string}|null=null;
 private queue:Promise<unknown>=Promise.resolve();
 constructor(private readonly profile:string){}
 private serial<T>(fn:()=>Promise<T>):Promise<T>{const job=this.queue.then(fn,fn);this.queue=job.catch(()=>undefined);return job;}
 async flush(){await this.queue;}
 private async recents():Promise<GameRecent[]>{
  try {const v=(await readJsonSource(path.join(this.profile,'game-recents.json'))).value;
   return Array.isArray(v)?v.filter((x):x is GameRecent=>!!x&&typeof x==='object'&&typeof x.path==='string'&&path.isAbsolute(x.path)&&typeof x.title==='string'&&typeof x.updatedAt==='string').slice(0,20):[];
  }catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return [];throw e;}
 }
 private async remember(file:string,project:GameProject){const list=await this.recents();const norm=(x:string)=>process.platform==='win32'?x.toLowerCase():x;
  await atomicJson(path.join(this.profile,'game-recents.json'),[{path:file,title:project.title,updatedAt:new Date().toISOString()},...list.filter(x=>norm(x.path)!==norm(file))].slice(0,20));}
 async bootstrap():Promise<GameBootstrap>{let recovery:GameProject|null=null;
  try {const value=(await readJsonSource(path.join(this.profile,'game-recovery.json'))).value;recovery=parseGameDraft(value);}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')console.warn('Game recovery unavailable',e);}
  return {recovery,recent:await this.recents()};
 }
 open(file:string):Promise<GameFile>{return this.serial(async()=>{const real=await fs.realpath(file);const {value,source}=await readJsonSource(real);const project=parseGameProject(value);
  await this.remember(real,project);this.active={path:real,token:randomUUID(),hash:digest(source)};return {project,path:real,token:this.active.token};});}
 async openRecent(file:unknown):Promise<GameFile>{if(typeof file!=='string'||!(await this.recents()).some(x=>x.path===file))throw new Error('Projet récent inconnu. Utilise Ouvrir.');return this.open(file);}
 currentPath(token:unknown):string|undefined{return typeof token==='string'&&this.active?.token===token?this.active.path:undefined;}
 save(value:unknown,token:unknown,chosenPath?:string):Promise<GameFile>{return this.serial(async()=>{
  const project=parseGameProject(value);const owned=this.active?.token===token?this.active:null;
  if(!chosenPath&&!owned)throw new Error('Document remplacé. Utilise Enregistrer sous.');
  const target=chosenPath?path.resolve(chosenPath):owned!.path;
  if(owned&&target===owned.path){let source:string;try{source=(await readJsonSource(target)).source;}catch{throw new Error('Le fichier a disparu ou est devenu illisible. Utilise Enregistrer sous.');}
   if(digest(source)!==owned.hash)throw new Error('Le fichier a été modifié hors du Studio. Utilise Enregistrer sous pour conserver les deux versions.');}
  await atomicJson(target,project,true);const source=(await readJsonSource(target)).source;
  this.active={path:target,token:owned&&target===owned.path?owned.token:randomUUID(),hash:digest(source)};
  // The document is safely written even if the optional MRU cannot be updated.
  await this.remember(target,project).catch(e=>console.warn('Recent game project',e));
  return {project,path:target,token:this.active.token};
 });}
 recover(value:unknown):Promise<void>{return this.serial(async()=>{parseGameDraft(value);await atomicJson(path.join(this.profile,'game-recovery.json'),value);});}
 clearRecovery():Promise<void>{return this.serial(async()=>{await fs.unlink(path.join(this.profile,'game-recovery.json')).catch(e=>{if(e.code!=='ENOENT')throw e;});});}
}
/** Compatibility API for level-only publication. The same transitive preflight is mandatory.
 * Resources must already exist in the selected game's shared library. For external
 * movies/libraries the Electron UI uses publishCampaign with explicitly authorized roots. */
export async function publishGameProject(value:unknown,gameRoot:string):Promise<string>{
 const project=parseGameProject(value);
 const {publishCampaign}=await import('./campaignPublisher.js');
 const result=await publishCampaign(project,gameRoot,'',path.join(gameRoot,'LunariaArtLibrary'));
 return result.path;
}
