import type {GameProject} from '../../src/shared/game/types.js';
import {seedProject} from '../../src/shared/game/seed.js';
/** Test-only adaptation: keep the historical 40-level fixture above intact. */
export function useCurrentPlants(p:GameProject):void{
 const current=seedProject(),ivy=structuredClone(current.balance.plants.find(x=>x.id==='ivy')!);
 p.balance.plants=p.balance.plants.filter(x=>x.id!=='ivy').map(x=>x.id==='fern'?ivy:x);
 const ids:Record<string,string>={fern:'ivy',ab_fern:'ab_ivy_binding',fx_fern_impact:'fx_ivy_impact',fx_fern_bind:'fx_ivy_bind',proj_fern_frond:'proj_ivy_vine',profile_fern:'profile_ivy'};
 function adapt(o:unknown):unknown{if(typeof o==='string')return ids[o]??o;if(Array.isArray(o))return o.map(adapt);if(o&&typeof o==='object')return Object.fromEntries(Object.entries(o).map(([k,v])=>[k,adapt(v)]));return o;}
 Object.assign(p,adapt(p));
 for(const l of p.levels)l.allowedPlants=[...new Set(l.allowedPlants)];
 p.combat!.abilities=p.combat!.abilities.filter(a=>!['ab_ivy_binding','ab_ivy_trap'].includes(a.id));
 p.combat!.effects=p.combat!.effects.filter(e=>!['fx_ivy_impact','fx_ivy_bind'].includes(e.id));
 p.combat!.projectiles=p.combat!.projectiles.filter(q=>q.id!=='proj_ivy_vine');
 p.combat!.abilities.push(structuredClone(current.combat!.abilities.find(a=>a.id==='ab_ivy_binding')!));
 p.combat!.effects.push(...structuredClone(current.combat!.effects.filter(e=>['fx_ivy_impact','fx_ivy_bind'].includes(e.id))));
 p.combat!.projectiles.push(structuredClone(current.combat!.projectiles.find(q=>q.id==='proj_ivy_vine')!));
}
