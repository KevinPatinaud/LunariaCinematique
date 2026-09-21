import type { GameProject } from '../game/types.js';
import type { GameIssue } from '../game/validation.js';
import type { Cinematic } from '../model.js';
import type { Cue } from './types.js';
import { duration, resolveAnimation, species, resolveActor, presentationAssets } from './runtime.js';
const safeRef=(v:string)=>v.startsWith('library://')&&!/[\\\u0000-\u001f:?#]/.test(v.slice(10))&&v.slice(10).split('/').every(x=>!!x&&x!=='.'&&x!=='..');
const image=(s:string)=>/\.(png|jpe?g|webp)$/i.test(s);
export function presentationIssues(p:GameProject):GameIssue[]{
 const out:GameIssue[]=[],c=p.presentation,add=(path:string,message:string,severity:'error'|'warning'='error')=>out.push({path,message,severity});
 if(!c){if(p.schemaVersion===4)add('presentation','Catalogue de présentation requis en version 4.');return out;}
 const anims=new Set(c.animations.map(x=>x.id)),profiles=new Set(c.profiles.map(x=>x.id)),sounds=new Set(c.audio.map(x=>x.id)),vfx=new Set(c.vfx.map(x=>x.id));
 const seen=new Set<string>();for(const list of [c.animations,c.profiles,c.audio,c.vfx])for(const x of list){if(seen.has(x.id))add('presentation',`Identifiant répété : ${x.id}`);seen.add(x.id);}
 if(!profiles.has(c.defaultProfileId))add('presentation.defaultProfileId','Profil par défaut introuvable.');
 const cue=(x:Cue,path:string)=>{if(x.soundId&&!sounds.has(x.soundId))add(path,'Son introuvable : '+x.soundId);if(x.vfxId&&!vfx.has(x.vfxId))add(path,'VFX introuvable : '+x.vfxId);};
 for(const pr of c.profiles){const path='presentation.profiles.'+pr.id,slots=new Set<string>();for(const s of pr.slots){if(slots.has(s.slot))add(path,'Slot répété : '+s.slot);slots.add(s.slot);if(s.animationId&&!anims.has(s.animationId))add(path,'Animation introuvable : '+s.animationId);if(!s.animationId&&['idle','move','attack','hit','death','spawn'].includes(s.slot))add(path,'Un slot de base ne peut être désactivé ; retire sa surcharge pour hériter.');}
  const events=new Set<string>();for(const e of pr.events){cue(e,path);if(events.has(e.event))add(path,'Événement répété : '+e.event);events.add(e.event);}
 }
 for(const a of c.animations){const path='presentation.animations.'+a.id,d=duration(a);if(a.kind!=='procedural'&&!a.frames.length)add(path,'Une séquence doit contenir au moins une frame.');if(a.kind==='procedural'&&a.frames.length)add(path,'Utilise le mode Combinée pour associer images et transformation.');if(!(d>0&&d<=120))add(path,'Durée totale attendue entre 0 et 120 secondes.');
  const mids=new Set<string>();let release=0;for(const m of a.markers){if(mids.has(m.id))add(path,'Identifiant de marqueur répété.');mids.add(m.id);if(m.at>d)add(path,'Marqueur après la fin de l’animation.');if(m.type==='release'){release++;if(m.ref)add(path,'Un marqueur release ne référence pas de code ni de ressource.');}if(m.type==='sound'&&!sounds.has(m.ref))add(path,'Marqueur sonore sans son valide.');if(m.type==='vfx'&&!vfx.has(m.ref))add(path,'Marqueur visuel sans VFX valide.');}if(release>1)add(path,'Une seule libération sémantique par animation.');
  if(new Set(a.attachments.map(x=>x.id)).size!==a.attachments.length)add(path,'Point d’attache répété.');for(const f of a.frames)if(!image(f.asset))add(path,'Une frame doit référencer une image.');
 }
 for(const role of ['plants','enemies'] as const)for(const s of p.balance[role]){const path='balance.'+role+'.'+s.id;if(!s.visual||!s.animationProfileId){add(path,'Image de repos et profil d’animation requis.');continue;}if(!image(s.visual.sprite.asset))add(path,'L’image de repos doit être une image.');if(!profiles.has(s.animationProfileId))add(path,'Profil d’animation introuvable.');for(const slot of ['idle','move','attack','hit','death','spawn']){const a=resolveAnimation(p,s,slot);if(!a)add(path,'Slot de base non résolu : '+slot);else if(['attack','hit','death','spawn'].includes(slot)&&a.loop)add(path,'Le slot '+slot+' doit être ponctuel.');}}
 for(const s of c.audio)if(!/\.(wav|ogg|mp3)$/i.test(s.asset))add('presentation.audio.'+s.id,'Fichier audio attendu.');
 for(const v of c.vfx)if(v.asset&&!image(v.asset))add('presentation.vfx.'+v.id,'Ressource VFX non graphique.');
 for(const a of p.combat?.abilities??[]){if(!a.presentation){if(p.schemaVersion===4)add('combat.abilities.'+a.id,'Présentation de capacité absente.');continue;}const pr=a.presentation,path='combat.abilities.'+a.id;cue(pr.start,path);cue(pr.releaseCue,path);cue(pr.impact,path);
  const owners=[...p.balance.plants,...p.balance.enemies].filter(s=>(s.ability_ids??[]).includes(a.id)||p.logic?.behaviors.find(b=>b.id===s.behaviorId)?.phases.some(ph=>ph.abilityIds.includes(a.id)));
  for(const s of owners){const clip=resolveAnimation(p,s,pr.slot);if(!clip)add(path,`${s.name} : slot ${pr.slot} non résolu.`);else if(clip.loop)add(path,`${s.name} : une capacité doit utiliser un slot ponctuel.`);else if(pr.release==='marker'&&!clip.markers.some(m=>m.type==='release'))add(path,`${s.name} : aucun marqueur release ; délai de repli ${pr.delay} s.`,'warning');}
 }
 for(const q of p.combat?.projectiles??[]){const pr=q.presentation;if(!pr){if(p.schemaVersion===4)add('combat.projectiles.'+q.id,'Présentation de projectile absente.');continue;}const path='combat.projectiles.'+q.id;if(pr.asset&&!image(pr.asset))add(path,'Image de projectile attendue.');if(pr.animationId&&!anims.has(pr.animationId))add(path,'Animation du projectile introuvable.');if(pr.animationId&&c.animations.find(a=>a.id===pr.animationId)?.kind==='procedural'&&!pr.asset)add(path,'Un projectile procédural requiert une image ou aucune animation.');if(pr.trailVfxId&&!vfx.has(pr.trailVfxId))add(path,'Traînée introuvable.');cue(pr.impact,path);}
 for(const ref of presentationAssets(p))if(!safeRef(ref))add('presentation','Chemin de bibliothèque interdit : '+ref);
 return out;
}
export function cinematicPresentationIssues(doc:Cinematic,p:GameProject):string[]{
 const actors=doc.shots.flatMap(s=>s.actors).filter(a=>a.animation);if(!actors.length)return [];
 if(doc.presentationCatalog?.projectId!==p.id)return ['Le catalogue de cette cinématique ne correspond pas au projet de jeu ouvert.'];
 const errors:string[]=[];for(const actor of actors){const b=actor.animation!,r=resolveActor(p,b);if(!r.animation)errors.push(actor.name+' : animation ou slot introuvable.');if(b.mode==='species'&&!species(p,b.speciesId))errors.push(actor.name+' : espèce introuvable.');}return errors;
}
