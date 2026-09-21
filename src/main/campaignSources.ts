import { promises as fs } from 'node:fs';
import path from 'node:path';
import { atomicJson, readJson, readJsonSource, isWithin } from './files.js';
import { safeMoviePath } from '../shared/game/campaign.js';
import { parseCinematic } from '../shared/schema.js';
import { newId, type CampaignFilm } from '../shared/game/types.js';
/** The renderer can request only relative JSON files under a directory explicitly selected by the author. */
export class CampaignSources {
 constructor(private readonly profile:string){}
 async folder():Promise<string>{
  try{const data=await readJson(path.join(this.profile,'campaign-folder.json'));return data&&typeof data==='object'&&'folder' in data&&typeof data.folder==='string'?data.folder:'';}
  catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return '';throw e;}
 }
 async select(folder:string):Promise<string>{const real=await fs.realpath(folder);if(!(await fs.stat(real)).isDirectory())throw Error('Choisis un dossier de cinématiques.');await atomicJson(path.join(this.profile,'campaign-folder.json'),{folder:real});return real;}
 async resolve(file:unknown,documentId?:unknown){
  if(!safeMoviePath(file))throw Error('Chemin de cinématique interdit.');
  const folder=await this.folder();if(!folder)throw Error('Choisis d’abord le dossier des cinématiques.');
  const base=await fs.realpath(folder),real=await fs.realpath(path.join(base,...file.split('/')));
  if(!isWithin(base,real))throw Error('Le fichier sort du dossier de cinématiques autorisé.');
  const {value,source}=await readJsonSource(real),cinematic=parseCinematic(value);
  if(documentId!==undefined&&cinematic.id!==documentId)throw Error(`Le fichier ${file} ne correspond plus à la cinématique attendue. Retire puis ajoute à nouveau sa référence.`);
  return {path:real,source,cinematic};
 }
 async add(chosenFile:string):Promise<CampaignFilm>{
  const base=await fs.realpath(await this.folder()),real=await fs.realpath(chosenFile);
  if(!isWithin(base,real))throw Error('Ce fichier est hors du dossier des cinématiques. Choisis un dossier parent commun à tous tes films.');
  const relative=path.relative(base,real).split(path.sep).join('/'),{cinematic}=await this.resolve(relative);
  return {id:newId('film'),title:cinematic.title,file:relative,documentId:cinematic.id};
 }
}
