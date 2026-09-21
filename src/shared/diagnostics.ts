import { STAGE, type Asset, type AssetRef, type Cinematic } from './model.js';
import { bubbleLayout } from './geometry.js';
import { actorVisualBox, entryEnd } from './motion.js';
import { textIntroDuration } from './textAnimation.js';
import { validationIssues } from './schema.js';
import { intersectionArea, objectBox, type ObjectKind } from './studio.js';
export interface Diagnostic {
  id: string; severity: 'error'|'warning'|'info'; message: string; detail?: string;
  shotId?: string; shotIndex?: number; objectId?: string; kind?: ObjectKind; asset?: AssetRef;
  fix?: 'center'|'fit-bubble'|'place-bubble';
}
export function diagnose(doc: Cinematic, assets: readonly Asset[], libraryConnected: boolean): Diagnostic[] {
  const result: Diagnostic[] = validationIssues(doc).map((message,i)=>({id:`schema:${i}`,severity:'error',message}));
  if (result.length) return result;
  const refs=new Set(assets.map(a=>a.ref));
  if (!libraryConnected) result.push({id:'library',severity:'warning',message:'Aucune bibliothèque connectée.',detail:'Les ressources ne peuvent pas être vérifiées avant de choisir le dossier commun.'});
  for (const [shotIndex,shot] of doc.shots.entries()) {
    let serial=0;
    const add=(item: Omit<Diagnostic,'id'|'shotId'|'shotIndex'>)=>result.push({...item,id:`${shot.id}:${serial++}`,shotId:shot.id,shotIndex});
    const checkRef=(ref:AssetRef|null,kind?:ObjectKind,objectId?:string)=>{
      if (ref && !refs.has(ref)) add({severity:libraryConnected?'error':'warning',message:'Ressource introuvable',detail:ref,asset:ref,kind,objectId});
    };
    checkRef(shot.background.asset); if (shot.audio) checkRef(shot.audio.asset);
    if (!shot.background.asset) add({severity:'warning',message:'Ce plan n’a pas de décor.',detail:'C’est autorisé pour un fond noir volontaire.'});
    for (const actor of shot.actors) {
      const meta={objectId:actor.id,kind:'actor' as const}; checkRef(actor.asset,'actor',actor.id);
      const visual = actorVisualBox(actor);
      if (visual.x+visual.width<=0 || visual.y+visual.height<=0 || visual.x>=1 || visual.y>=1) add({...meta,severity:'warning',message:`${actor.name} est hors champ.`,fix:'center'});
      const movement = actor.movement;
      if (movement?.enabled) {
        if (entryEnd(actor)+movement.delay+movement.duration>shot.duration) add({...meta,severity:'warning',message:`Le trajet de ${actor.name} dépasse la durée minimale.`,detail:'Il peut être interrompu à la fin du plan. Une réplique en attente du joueur peut prolonger cette durée.'});
        const end = {x:visual.x+movement.dx, y:visual.y+movement.dy};
        if (end.x+visual.width<=0 || end.y+visual.height<=0 || end.x>=1 || end.y>=1) add({...meta,severity:'info',message:`La destination de ${actor.name} est hors champ.`,detail:'Autorisé pour une sortie volontaire. Vérifie le mouvement avec le bouton Lire.'});
        if (movement.dx===0 && movement.dy===0) add({...meta,severity:'info',message:`Le trajet de ${actor.name} reste sur place.`,detail:'Déplace la poignée B ou désactive le trajet.'});
      }
      if (actor.motion && actor.motion.preset!=='none' && entryEnd(actor)+actor.motion.delay>=shot.duration) add({...meta,severity:'warning',message:`L’effet de ${actor.name} commence après la durée minimale.`,detail:'Réduis son délai ou allonge le plan. Il ne sera visible que si les répliques prolongent la lecture.'});
      if (actor.exit && actor.exit.preset !== 'none') {
        if (actor.exit.start + actor.exit.duration > shot.duration) add({...meta,severity:'warning',message:`La sortie de ${actor.name} dépasse la durée minimale.`,detail:'Allonge le plan pour la voir entièrement sans attente de dialogue.'});
        if (actor.exit.start < entryEnd(actor)) add({...meta,severity:'warning',message:`La sortie de ${actor.name} commence avant la fin de son entrée.`,detail:'Les deux réglages sont autorisés, mais la sortie interrompt l’entrée.'});
      }
      if (actor.opacity===0) add({...meta,severity:'info',message:`${actor.name} est entièrement transparent.`});
      if (actor.entry.preset!=='none' && actor.entry.delay+actor.entry.duration>shot.duration) add({...meta,severity:'warning',message:`L’entrée de ${actor.name} dépasse la durée minimale.`,detail:'Allonge le plan ou raccourcis l’entrée.'});
    }
    for (const [index,bubble] of shot.bubbles.entries()) {
      const meta={objectId:bubble.id,kind:'bubble' as const}, layout=bubbleLayout(bubble), box=objectBox(bubble);
      checkRef(bubble.frameAsset,'bubble',bubble.id);
      if (bubble.textAnimation && textIntroDuration(bubble) > 30) add({...meta,severity:'warning',message:`L’apparition du texte de la réplique ${index+1} dépasse 30 secondes.`,detail:'Augmente la vitesse d’écriture, réduis le délai ou découpe le texte. Le joueur peut toujours terminer l’apparition par un clic.'});
      if (!bubble.text.trim()) add({...meta,severity:'warning',message:`La réplique ${index+1} est vide.`});
      if (layout.overflow) add({...meta,severity:'warning',message:`Le texte de la réplique ${index+1} déborde.`,detail:'Le texte est conservé intégralement ; agrandis la bulle ou répartis la réplique.',fix:'fit-bubble'});
      if (box.x<0 || box.y<0 || box.x+box.width>1.000001 || box.y+box.height>1.000001) add({...meta,severity:'warning',message:`La bulle ${index+1} dépasse de l’image.`,fix:'place-bubble'});
      if (bubble.kind==='speech' && !bubble.speakerId) add({...meta,severity:'info',message:`La réplique ${index+1} n’est pas liée à un personnage.`,detail:'Autorisé pour une voix hors champ. Choisir un personnage rend la queue automatique.'});
      for (const actor of shot.actors.filter(a=>a.role!=='prop')) {
        const head={x:actor.x+actor.width*.25,y:actor.y,width:actor.width*.5,height:actor.height*.4};
        if (intersectionArea(box,head) > head.width*head.height*.2) {
          add({...meta,severity:'warning',message:`La bulle ${index+1} recouvre le haut de ${actor.name}.`,detail:'Estimation géométrique, à vérifier visuellement.',fix:'place-bubble'}); break;
        }
      }
      for (const previous of shot.bubbles.slice(0,index)) if (intersectionArea(box,objectBox(previous))>.008) {
        add({...meta,severity:'info',message:`La bulle ${index+1} chevauche une autre bulle dans l’éditeur.`,detail:'Ce n’est pas une erreur de lecture : les répliques sont affichées successivement.',fix:'place-bubble'}); break;
      }
      if (layout.height>STAGE.height*.92) add({...meta,severity:'warning',message:`La réplique ${index+1} est trop longue pour une seule bulle à cette taille.`,detail:'Répartis le texte entre plusieurs répliques. Aucun texte ne sera supprimé automatiquement.'});
    }
  }
  return result;
}
