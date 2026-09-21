import { logicFilmIds } from './logic.js';
import type { CampaignSequence, CampaignStep, GameProject } from './types.js';
/** Authoring projects may contain unused levels; publishing never changes that document. */
export function campaignOf(project:GameProject):CampaignSequence {
 return project.campaign ?? {steps:project.levels.map(l=>({id:'step_'+l.id,kind:'level' as const,levelId:l.id})),cinematics:[]};
}
export function ensureCampaign(project:GameProject):CampaignSequence {
 return project.campaign ??= structuredClone(campaignOf(project));
}
export function moveCampaignStep(steps:CampaignStep[],id:string,beforeId:string|null):CampaignStep[] {
 if(id===beforeId)return steps;
 const moving=steps.find(s=>s.id===id);
 if(!moving||beforeId!==null&&!steps.some(s=>s.id===beforeId))return steps;
 const next=steps.filter(s=>s.id!==id),at=beforeId===null?next.length:next.findIndex(s=>s.id===beforeId);
 next.splice(at,0,moving);return next;
}
/** Portable, relative JSON reference. Root selection is a separate desktop permission. */
export function safeMoviePath(file:unknown):file is string {
 return typeof file==='string'&&file.length>0&&file.length<=1024&&/\.json$/i.test(file)&&
 !/[<>:"\\|?*#\x00-\x1f]/.test(file)&&file.split('/').every(x=>x!==''&&x!=='.'&&x!=='..'&&!/[ .]$/.test(x)&&!/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(x));
}
/** Copy only the levels and films reachable from the linear campaign, in playback order. */
export function compileCampaign(project:GameProject):GameProject {
 const result=structuredClone(project),campaign=ensureCampaign(result);
 const levelIds=campaign.steps.filter((s):s is Extract<CampaignStep,{kind:'level'}>=>s.kind==='level').map(s=>s.levelId);
 result.levels=levelIds.map(id=>{const level=result.levels.find(l=>l.id===id);if(!level)throw Error('Niveau absent : '+id);return level;});
 const filmIds=new Set(campaign.steps.filter((s):s is Extract<CampaignStep,{kind:'cinematic'}>=>s.kind==='cinematic').map(s=>s.cinematicId));
 for(const id of logicFilmIds(result))filmIds.add(id);
 campaign.cinematics=campaign.cinematics.filter(f=>filmIds.has(f.id));
 return result;
}
/** Pure progress model mirrored by campaign_sequence.gd. Replay never advances a frontier. */
export function advanceCampaign(steps:CampaignStep[],cursor:number,stepId:string,event:'victory'|'finished'|'skip'|'defeat'|'abort'|'error',preview=false):number {
 const step=steps[cursor];if(preview||!step||step.id!==stepId)return cursor;
 if(step.kind==='level')return event==='victory'?cursor+1:cursor;
 return event==='finished'||event==='skip'&&step.skippable?cursor+1:cursor;
}
