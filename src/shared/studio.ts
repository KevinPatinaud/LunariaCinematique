import { copy, duplicateShot, newBubble, newShot, removeActor, uid, STAGE, type Actor, type Box, type Bubble, type Shot } from './model.js';
import { autoDialogueDuration } from './textAnimation.js';
import { travelOffset } from './motion.js';
import { bubbleLayout, clamp } from './geometry.js';
export type ObjectKind = 'actor' | 'bubble';
export interface ObjectChange { kind: ObjectKind; id: string; patch: Partial<Actor> | Partial<Bubble> }
export type Alignment = 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom' | 'distribute-x' | 'distribute-y';
export function objectBox(object: Actor | Bubble): Box {
  return { x: object.x, y: object.y, width: object.width, height: 'text' in object ? bubbleLayout(object).height / STAGE.height : object.height };
}
export function objectsIn(shot: Shot, ids: readonly string[]) {
  const chosen = new Set(ids);
  return [...shot.actors.map(object => ({ kind: 'actor' as const, object })), ...shot.bubbles.map(object => ({ kind: 'bubble' as const, object }))].filter(o => chosen.has(o.object.id));
}
export function selectionBounds(shot: Shot, ids: readonly string[]): Box | null {
  const boxes = objectsIn(shot, ids).map(({object}) => objectBox(object)); if (!boxes.length) return null;
  const x = Math.min(...boxes.map(b => b.x)), y = Math.min(...boxes.map(b => b.y));
  return { x, y, width: Math.max(...boxes.map(b => b.x + b.width)) - x, height: Math.max(...boxes.map(b => b.y + b.height)) - y };
}
export function applyObjectChanges(shot: Shot, changes: readonly ObjectChange[]) {
  for (const change of changes) {
    const object = change.kind === 'actor' ? shot.actors.find(a => a.id === change.id) : shot.bubbles.find(b => b.id === change.id);
    if (object) Object.assign(object, change.patch);
  }
}
export function moveObjects(shot: Shot, ids: readonly string[], dx: number, dy: number): ObjectChange[] {
  if (![dx, dy].every(Number.isFinite)) return [];
  const objects = objectsIn(shot, ids); if (!objects.length) return [];
  dx = clamp(dx, Math.max(...objects.map(o => -1 - o.object.x)), Math.min(...objects.map(o => 2 - o.object.x)));
  dy = clamp(dy, Math.max(...objects.map(o => -1 - o.object.y)), Math.min(...objects.map(o => 2 - o.object.y)));
  return objects.map(({kind, object}) => ({kind, id: object.id, patch: { x: object.x + dx, y: object.y + dy }}));
}
export function alignObjects(shot: Shot, ids: readonly string[], alignment: Alignment): ObjectChange[] {
  const objects = objectsIn(shot, ids).map(o => ({...o, box: objectBox(o.object)}));
  const bounds = selectionBounds(shot, ids); if (!bounds || objects.length < 2) return [];
  if (alignment.startsWith('distribute')) {
    if (objects.length < 3) return [];
    const axis = alignment === 'distribute-x' ? 'x' : 'y', size = axis === 'x' ? 'width' : 'height';
    const sorted = objects.sort((a,b) => a.box[axis] - b.box[axis]);
    const start = sorted[0].box[axis], last = sorted.at(-1)!;
    const gap = (last.box[axis] + last.box[size] - start - sorted.reduce((n,o) => n + o.box[size], 0)) / (sorted.length - 1);
    let at = start;
    return sorted.map(({kind, object, box}) => { const patch = {[axis]: clamp(at, -1, 2)}; at += box[size] + gap; return {kind, id: object.id, patch}; });
  }
  return objects.map(({kind, object, box}) => {
    const patch = alignment === 'left' ? {x: bounds.x} : alignment === 'right' ? {x: bounds.x + bounds.width - box.width}
      : alignment === 'center-x' ? {x: bounds.x + (bounds.width - box.width)/2} : alignment === 'top' ? {y: bounds.y}
      : alignment === 'bottom' ? {y: bounds.y + bounds.height - box.height} : {y: bounds.y + (bounds.height - box.height)/2};
    if ('x' in patch) patch.x = clamp(patch.x!, -1, 2); if ('y' in patch) patch.y = clamp(patch.y!, -1, 2);
    return {kind, id: object.id, patch};
  });
}
export function duplicateObjects(shot: Shot, ids: readonly string[]): string[] {
  const selected = objectsIn(shot, ids), actors = selected.filter(o => o.kind === 'actor'), bubbles = selected.filter(o => o.kind === 'bubble');
  if (shot.actors.length + actors.length > 50 || shot.bubbles.length + bubbles.length > 100) throw new Error('La duplication dépasserait la limite de 50 objets ou 100 bulles par plan.');
  const remap = new Map<string,string>(); selected.forEach(o => remap.set(o.object.id, uid()));
  for (const {kind, object} of selected) {
    const cloned = copy(object); cloned.id = remap.get(object.id)!; cloned.x = clamp(cloned.x + .025, -1, 2); cloned.y = clamp(cloned.y + .025, -1, 2);
    if (kind === 'actor') { const actor = cloned as Actor; actor.name = (actor.name + ' — copie').slice(0,180); shot.actors.push(actor); }
    else { const b = cloned as Bubble; if (b.speakerId && remap.has(b.speakerId)) b.speakerId = remap.get(b.speakerId)!; shot.bubbles.push(b); }
  }
  return [...remap.values()];
}
export function deleteObjects(shot: Shot, ids: readonly string[]) {
  const chosen = new Set(ids); shot.bubbles = shot.bubbles.filter(b => !chosen.has(b.id));
  for (const actor of [...shot.actors]) if (chosen.has(actor.id)) removeActor(shot, actor.id);
}
export function reorderObjects(shot: Shot, kind: ObjectKind, source: string, target: string) {
  const list = kind === 'actor' ? shot.actors : shot.bubbles;
  const from = list.findIndex(o => o.id === source), to = list.findIndex(o => o.id === target);
  if (from < 0 || to < 0 || from === to) return;
  // Both lists are homogeneous; splice only moves existing objects within that list.
  const [moving] = list.splice(from,1); (list as (Actor|Bubble)[]).splice(to,0,moving);
}
export const intersectionArea = (a: Box, b: Box) => Math.max(0, Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)) * Math.max(0, Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
export function snapMove(box: Box, dx: number, dy: number, others: Box[], threshold = .006) {
  const xTargets = [0.04, 1/3, .5, 2/3, .96], yTargets = [0.04, 1/3, .5, 2/3, .96];
  for (const o of others) { xTargets.push(o.x,o.x+o.width/2,o.x+o.width); yTargets.push(o.y,o.y+o.height/2,o.y+o.height); }
  function snap(start: number, size: number, delta: number, targets: number[], tolerance: number) {
    let best = tolerance, offset = 0, line: number | null = null;
    for (const anchor of [start+delta,start+delta+size/2,start+delta+size]) for (const target of targets) {
      const distance = Math.abs(target-anchor); if (distance < best) { best=distance; offset=target-anchor; line=target; }
    }
    return {delta:delta+offset,line};
  }
  const x=snap(box.x,box.width,dx,xTargets,threshold), y=snap(box.y,box.height,dy,yTargets,threshold*STAGE.width/STAGE.height);
  return { dx:x.delta, dy:y.delta, xLine:x.line, yLine:y.line };
}
/** A suggestion, not a solver guarantee: fits text without reducing font size or truncating. */
export function placeBubble(shot: Shot, input: Bubble, avoidOtherBubbles = true): Bubble {
  const bubble = copy(input); bubble.width = clamp(bubble.width,.16,.92); bubble.autoHeight = true;
  while (bubbleLayout(bubble).height > .92*STAGE.height && bubble.width < .919) bubble.width = Math.min(.92,bubble.width+.06);
  const height = bubbleLayout(bubble).height/STAGE.height, maxY = Math.max(.04,.96-height), maxX = Math.max(.04,.96-bubble.width);
  const speaker = shot.actors.find(a => a.id === bubble.speakerId), sx = speaker ? speaker.x+speaker.width/2 : .5;
  const candidates: Box[] = [];
  for (const y of [.04,.15,.30,.45,.60,maxY, speaker ? speaker.y-height-.05 : .08]) {
    for (const x of [sx-bubble.width/2, .04, maxX, .5-bubble.width/2, sx-bubble.width-.04, sx+.04]) candidates.push({ x:clamp(x,.04,maxX), y:clamp(y,.04,maxY), width:bubble.width, height });
  }
  const score = (box: Box) => {
    let penalty = Math.abs(box.x + box.width/2 - sx)*.12 + box.y*.025;
    for (const actor of shot.actors) {
      const head = {x:actor.x+actor.width*.15, y:actor.y, width:actor.width*.7, height:actor.height*.45};
      penalty += intersectionArea(box,head)*35 + intersectionArea(box,actor)*2;
    }
    if (avoidOtherBubbles) for (const other of shot.bubbles) if (other.id !== bubble.id) penalty += intersectionArea(box,objectBox(other))*6;
    return penalty;
  };
  const best = candidates.sort((a,b)=>score(a)-score(b))[0]; bubble.x=best.x; bubble.y=best.y; bubble.height=height;
  return bubble;
}
export type ShotTemplate = 'blank' | 'continue' | 'dialogue' | 'establishing' | 'entrance' | 'narration';
export interface DuplicateOptions { dialogues: boolean; entrances: boolean; audio: boolean }
export function smartDuplicate(source: Shot, options: DuplicateOptions): Shot {
  const shot = duplicateShot(source);
  if (!options.dialogues) shot.bubbles = [];
  if (!options.entrances) shot.actors.forEach(a => a.entry = {...a.entry,preset:'none',delay:0});
  if (!options.audio) shot.audio = null;
  return shot;
}
export function createTemplate(source: Shot, template: ShotTemplate, speakerIds: string[] = []): Shot {
  if (template === 'blank') return newShot(source.background.asset);
  if (template === 'establishing') { const s=newShot(source.background.asset); s.name='Vue d’ensemble'; s.camera={preset:'zoom_in',intensity:.3}; return s; }
  const shot = smartDuplicate(source,{dialogues:false,entrances:false,audio:true});
  shot.endAdvance='auto';
  shot.transition={type:'cut',duration:0}; shot.dialogueStart=.4;
  const sourceIndices = speakerIds.map(id=>source.actors.findIndex(a=>a.id===id)).filter(i=>i>=0);
  const speakers = sourceIndices.length ? sourceIndices.map(i=>shot.actors[i]) : shot.actors.filter(a=>a.role!=='prop').slice(0,2);
  if (template === 'continue') {
    shot.name=(source.name+' — suite').slice(0,180);
    const end = Math.max(source.duration, source.bubbles.length ? source.dialogueStart + source.bubbles.reduce((sum,b)=>sum+(b.advance.mode==='auto'?autoDialogueDuration(b):0),0) : 0);
    shot.actors = shot.actors.filter((actor,index)=>{
      const previous=source.actors[index];
      // Continuing must not resurrect an actor that already left the scene.
      if (previous.exit && previous.exit.preset !== 'none' && previous.exit.start + previous.exit.duration <= end) return false;
      delete actor.exit; // The next shot does not replay an exit scheduled in the source shot.
      if (previous.movement?.enabled && previous.movement.repeat==='once') {
        const offset=travelOffset(previous,end);
        actor.x=clamp(previous.x+offset.x/STAGE.width,-1,2); actor.y=clamp(previous.y+offset.y/STAGE.height,-1,2);
        actor.movement={...previous.movement,enabled:false};
      }
      return true;
    });
  }
  if (template === 'dialogue') {
    if (new Set(speakers.map(a=>a.id)).size < 2) throw new Error('Place deux personnages différents dans le plan pour créer un dialogue à deux.');
    shot.name='Dialogue à deux'; shot.camera={preset:'fixed',intensity:.35};
    for (const speaker of speakers.slice(0,2)) shot.bubbles.push(placeBubble(shot,newBubble(speaker.id)));
  }
  if (template === 'entrance') {
    if (!speakers.length) throw new Error('Place un personnage dans le plan pour préparer son entrée.');
    shot.name=('Entrée — '+speakers[0].name).slice(0,180); speakers[0].entry={preset:'left',duration:1.2,delay:.2};
  }
  if (template === 'narration') { shot.name='Narration'; shot.bubbles=[placeBubble(shot,newBubble(null,'narration'))]; }
  return shot;
}
