import type {GameProject} from '../shared/game/types.js';
import {CampaignSources} from './campaignSources.js';
export interface FilmUsages {references:Record<string,string[]>;errors:string[]}
/** Read authorized linked films, including those outside the active campaign sequence.
 * Unreadable references are not treated as absent: callers must block destructive edits. */
export async function presentationFilmUsages(project:GameProject,sources:CampaignSources):Promise<FilmUsages>{
 const references:Record<string,string[]>={},errors:string[]=[];
 for(const film of project.campaign?.cinematics??[]){
  try{const {cinematic}=await sources.resolve(film.file,film.documentId);
   if(cinematic.presentationCatalog?.projectId!==project.id)continue;
   for(const shot of cinematic.shots)for(const actor of shot.actors){const binding=actor.animation;
    if(binding?.mode==='animation'&&binding.animationId)(references[binding.animationId]??=[]).push(`Film lié : ${film.title} / ${shot.name} / ${actor.name}`);
   }
  }catch(e){errors.push(`${film.title} : ${e instanceof Error?e.message:String(e)}`);}
 }
 return {references,errors};
}
