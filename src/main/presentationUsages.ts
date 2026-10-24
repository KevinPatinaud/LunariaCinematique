import type {GameProject} from '../shared/game/types.js';
export interface FilmUsages {references:Record<string,string[]>;errors:string[]}
/** Inspect films embedded in the authoring project, including references outside the active sequence.
 * Unreadable references are not treated as absent: callers must block destructive edits. */
export async function presentationFilmUsages(project:GameProject):Promise<FilmUsages>{
 const references:Record<string,string[]>={},errors:string[]=[];
 for(const film of project.campaign?.cinematics??[]){
  try{const cinematic=project.cinematics?.find(doc=>doc.id===film.documentId);
   if(!cinematic)throw Error('Cinématique absente du projet.');
   if(cinematic.presentationCatalog?.projectId!==project.id)continue;
   for(const shot of cinematic.shots)for(const actor of shot.actors){const binding=actor.animation;
    if(binding?.mode==='animation'&&binding.animationId)(references[binding.animationId]??=[]).push(`Film lié : ${film.title} / ${shot.name} / ${actor.name}`);
   }
  }catch(e){errors.push(`${film.title} : ${e instanceof Error?e.message:String(e)}`);}
 }
 return {references,errors};
}
