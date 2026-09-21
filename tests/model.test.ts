import test from 'node:test';
import assert from 'node:assert/strict';
import { demoCinematic } from '../src/shared/demo.js';
import { copy, duplicateShot, newBubble, newCinematic, newActor, referencedAssets, removeActor, type Asset } from '../src/shared/model.js';
import { isSafeAssetRef, parseCinematic, validationIssues, contentWarnings } from '../src/shared/schema.js';
import { actorPose, bubbleLayout, bubbleTarget, cameraTransform, framePatches, prepareCinematic, tailPoints, wrapText } from '../src/shared/geometry.js';
import { advanceDialogue, beginPlayback, tickPlayback } from '../src/shared/playback.js';
import { createHistory, historyReducer } from '../src/shared/history.js';
const asset: Asset = { ref: 'library://05_characters/rose/stage_01/rose.png', path: '05_characters/rose/stage_01/rose.png', name: 'Rose', folder: '05_characters/rose/stage_01', kind: 'character', bytes: 20, modified: 0, url: '', thumbnail: '' };
test('empty project follows the shared schema', () => assert.equal(parseCinematic(newCinematic()).schemaVersion, 1));
test('example with textured bubble is valid', () => assert.deepEqual(validationIssues(prepareCinematic(demoCinematic())), []));
test('assets are unique references, not embedded image data', () => { const refs = referencedAssets(demoCinematic()); assert.equal(refs.length, 3); assert.ok(refs.every(r => r.startsWith('library://'))); });
for (const bad of ['library:///etc/passwd', 'library://../private.png', 'library://a/../../private.png', 'library://a/./image.png', 'library://a//b.png', 'file:///a.png', 'https://a.png', 'library://C:/a.png', 'library://a\\b.png', 'library://a\0b.png', 'library://a.png?x=1', 'library://a.png#x']) {
  test(`reject unsafe reference ${JSON.stringify(bad)}`, () => assert.equal(isSafeAssetRef(bad), false));
}
test('references preserve Unicode, spaces and case', () => assert.ok(isSafeAssetRef('library://01_europe/Forêt/Fougère (1).png')));
test('literal percent signs are allowed, URL encoding is handled separately', () => assert.ok(isSafeAssetRef('library://50%/a%2Fb.png')));
test('future schema versions are refused', () => { const doc = newCinematic() as unknown as { schemaVersion: number }; doc.schemaVersion = 5; assert.throws(() => parseCinematic(doc)); });
test('unknown keys cannot silently disappear', () => { const doc = { ...newCinematic(), eval: 'do_not_run()' }; assert.throws(() => parseCinematic(doc)); });
test('NaN cannot enter a saved project', () => { const doc = newCinematic(); doc.shots[0].duration = NaN; assert.throws(() => parseCinematic(doc)); });
test('duplicate IDs are rejected', () => { const doc = newCinematic(); doc.shots.push(copy(doc.shots[0])); assert.throws(() => parseCinematic(doc)); });
test('null texture on a textured style is rejected', () => { const doc = newCinematic(); const b = newBubble(); b.style = 'simple'; doc.shots[0].bubbles.push(b); assert.throws(() => parseCinematic(doc)); });
test('duplicate a shot remaps actors and their bubbles consistently', () => {
  const doc = newCinematic(), shot = doc.shots[0], actor = newActor(asset, 0.8);
  shot.actors.push(actor); shot.bubbles.push(newBubble(actor.id));
  const duplicate = duplicateShot(shot); doc.shots.push(duplicate);
  assert.notEqual(duplicate.id, shot.id); assert.notEqual(duplicate.actors[0].id, actor.id);
  assert.equal(duplicate.bubbles[0].speakerId, duplicate.actors[0].id); assert.deepEqual(validationIssues(doc), []);
});
test('deleting a speaker converts its tail to a free point', () => { const shot = newCinematic().shots[0], actor = newActor(asset, 1); shot.actors.push(actor); shot.bubbles.push(newBubble(actor.id)); removeActor(shot, actor.id); assert.equal(shot.bubbles[0].speakerId, null); assert.equal(shot.bubbles[0].tail.mode, 'manual'); });
test('manual width resize can be accompanied by automatic text height', () => { const b = newBubble(); b.text = 'Les feuilles bruissaient dans la serre. '.repeat(8); const large = bubbleLayout(b); b.width = 0.2; assert.ok(bubbleLayout(b).height > large.height); });
test('word wrapping handles hard line breaks and unbroken words', () => { const lines = wrapText('Une ligne\nSupercalifragilisticexpialidocious', 130, 28); assert.ok(lines.length > 3); assert.equal(lines[0], 'Une ligne'); assert.equal(lines.slice(1).join(''), 'Supercalifragilisticexpialidocious'); });
test('export generates explicit line breaks without modifying live state', () => { const doc = demoCinematic(); const saved = prepareCinematic(doc); assert.equal(doc.shots[0].bubbles[0].lines, undefined); assert.ok(saved.shots[0].bubbles[0].lines!.length); assert.deepEqual(validationIssues(saved), []); });
test('text overflow is reported without corrupting the JSON', () => { const doc = newCinematic(), b = newBubble(); b.autoHeight = false; b.height = 0.04; b.text = 'Un texte très long. '.repeat(12); doc.shots[0].bubbles.push(b); assert.ok(contentWarnings(doc).some(w => w.includes('trop petite'))); });
test('camera presets keep cover backgrounds inside the frame', () => { const shot = newCinematic().shots[0]; for (const preset of ['fixed','zoom_in','zoom_out','pan_left','pan_right','pan_up','pan_down'] as const) { shot.camera.preset = preset; shot.camera.intensity = 1; for (const time of [0, 1, 3, 6, 20]) { const c = cameraTransform(shot, time); assert.ok(c.x <= 0.00001); assert.ok(c.y <= 0.00001); assert.ok(c.x + 1600*c.zoom >= 1599.9999); assert.ok(c.y + 900*c.zoom >= 899.9999); } } });
test('actor entrance begins off-screen and ends at its authored position', () => { const actor = newActor(asset, 0.8); actor.entry.preset = 'left'; assert.equal(actorPose(actor, 0).x, -actor.width * 1600); assert.ok(Math.abs(actorPose(actor, 8).x - actor.x * 1600) < 0.001); });
test('tail follows speaker camera transform', () => { const shot = newCinematic().shots[0], actor = newActor(asset, 1); shot.actors.push(actor); shot.camera.preset = 'zoom_in'; const b = newBubble(actor.id), c = cameraTransform(shot, 6), target = bubbleTarget(b, shot, 6, true); assert.ok(Math.abs(target.x - ((actor.x + actor.width/2)*1600*c.zoom+c.x)) < 0.0001); });
test('tail is hidden when the point is inside the bubble', () => assert.equal(tailPoints({x:0,y:0,width:300,height:100},{x:150,y:50}), null));
test('tail produces three vertices outside the box', () => assert.equal(tailPoints({x:0,y:0,width:300,height:100},{x:400,y:90})!.length, 6));
test('original frames use nine bounded source patches', () => { for(const style of ['simple','ornate'] as const) { const patches = framePatches(style, 600, 200); assert.equal(patches.length,9); assert.ok(patches.every(p=>p.width>0 && p.height>0 && p.sx>=0 && p.sy>=0 && p.sx+p.sw<=1536 && p.sy+p.sh<=1024)); } });
test('click does not skip a dialogue before its start', () => { const doc = demoCinematic(), state = beginPlayback(); assert.deepEqual(advanceDialogue(doc, state), state); });
test('click-gated bubble keeps the shot alive beyond its nominal duration', () => { const doc = demoCinematic(); let state = beginPlayback(); for(let i=0;i<100;i++) state = tickPlayback(doc,state,.1); assert.equal(state.shotIndex,0); assert.equal(state.dialogueIndex,0); state = advanceDialogue(doc,state); assert.equal(state.shotIndex,1); assert.equal(state.elapsed,0); });
test('auto bubble advances without interaction', () => { const doc = newCinematic(); const b = newBubble(); b.advance = {mode:'auto',seconds:0.5}; doc.shots[0].duration=1; doc.shots[0].dialogueStart=0; doc.shots[0].bubbles=[b]; let state=beginPlayback(); for(let i=0;i<15;i++) state=tickPlayback(doc,state,.1); assert.equal(state.finished,true); });
test('ending dialogue early still respects shot minimum duration', () => { const doc = demoCinematic(); let state={...beginPlayback(),elapsed:1}; state=advanceDialogue(doc,state); assert.equal(state.shotIndex,0); assert.equal(state.dialogueIndex,1); });
test('pause freezes both camera clock and dialogue clock', () => { const doc=demoCinematic(), state={...beginPlayback(),paused:true}; assert.deepEqual(tickPlayback(doc,state,.1),state); assert.deepEqual(advanceDialogue(doc,state),state); });
test('slow frames keep elapsed time instead of slowing the film', () => { const state = tickPlayback(newCinematic(), beginPlayback(), 1.25); assert.equal(state.elapsed, 1.25); });
test('undo/redo restores a previous state without mutating it', () => { let state=createHistory({x:1}); state=historyReducer(state,{type:'commit',value:{x:2}}); state=historyReducer(state,{type:'undo'}); assert.equal(state.present.x,1); state=historyReducer(state,{type:'redo'}); assert.equal(state.present.x,2); });
test('typing coalesces into one undo step', () => { let state=createHistory(''); state=historyReducer(state,{type:'commit',value:'R',key:'text',now:100}); state=historyReducer(state,{type:'commit',value:'Rose',key:'text',now:200}); assert.equal(state.past.length,1); assert.equal(historyReducer(state,{type:'undo'}).present,''); });
test('a new edit clears redo history', () => { let state=createHistory(1); state=historyReducer(state,{type:'commit',value:2}); state=historyReducer(state,{type:'undo'}); state=historyReducer(state,{type:'commit',value:3}); assert.equal(state.future.length,0); });

for (const key of ['__proto__', 'constructor', 'toString']) {
  test(`prototype property ${key} is rejected as an unknown JSON field`, () => {
    const doc = JSON.parse(JSON.stringify(newCinematic()));
    Object.defineProperty(doc, key, { value: {}, enumerable: true });
    assert.throws(() => parseCinematic(doc));
  });
}
