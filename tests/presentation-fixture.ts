import type { GameProject } from '../src/shared/game/types.js';
import type { AssetRef } from '../src/shared/model.js';
/** A real 1x1 PNG replaces heavyweight production art in isolated filesystem tests only. */
export const PIXEL_PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');
export function fixturePresentation(p:GameProject, asset:AssetRef):GameProject {
 for(const s of [...p.balance.plants,...p.balance.enemies])s.visual!.sprite={asset};
 const c=p.presentation!;c.audio=[];
 for(const a of c.animations){a.frames=a.frames.map(f=>({asset,duration:f.duration}));a.markers=a.markers.filter(m=>m.type==='release');}
 for(const pr of c.profiles)for(const e of pr.events)e.soundId='';
 for(const v of c.vfx)v.asset='';
 for(const a of p.combat!.abilities)for(const cue of [a.presentation!.start,a.presentation!.releaseCue,a.presentation!.impact])cue.soundId='';
 for(const q of p.combat!.projectiles){q.presentation!.asset='';q.presentation!.impact.soundId='';}
 return p;
}
