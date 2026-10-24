import test from 'node:test';
import assert from 'node:assert/strict';
import {seedProject} from '../src/shared/game/seed.js';
import {DEFAULT_COMBAT} from '../src/shared/game/combatDefaults.js';
import {combatIssues} from '../src/shared/game/combatValidation.js';
import {previewAbility} from '../src/shared/game/combatPreview.js';

test('Fougère starter attack and import preset expose the same frond payload',()=>{
 const p=seedProject(),a=p.combat!.abilities.find(x=>x.id==='ab_fern')!;
 assert.equal(a.name,'Crosse de rosée');
 assert.equal(a.projectileId,'proj_fern_frond');
 assert.deepEqual(a.effects,['fx_fern_impact','fx_fern_bind']);
 for(const id of a.effects)assert.deepEqual(p.combat!.effects.find(x=>x.id===id),DEFAULT_COMBAT.effects.find(x=>x.id===id));
 assert.equal(combatIssues(p).filter(x=>x.path.includes('fern')).length,0);
});

test('Fougère preview states its random window and distinguishes squeeze from allied explosion',()=>{
 const p=seedProject(),a=p.combat!.abilities.find(x=>x.id==='ab_fern')!;
 const probe=previewAbility(p,a,'fern',p.balance.enemies[0].id);
 assert.ok(probe.notes.some(x=>x.includes('entre 3 et 6 s')));
 assert.ok(probe.notes.some(x=>x.includes('déplacements et attaques ralentis de 80 %')&&x.includes('préparation, animation et recharge')));
 assert.ok(probe.notes.some(x=>x.includes('autre plante')&&x.includes('1,25 case')));
 assert.ok(probe.rows.some(x=>x.at===1&&x.label==='Étreinte de la fronde'&&x.raw===6));
 assert.ok(Math.abs(probe.rows[0].raw-4.8)<1e-8);
 const binding=p.combat!.effects.find(x=>x.id==='fx_fern_bind')!;
 binding.duration=4;binding.tickInterval=.5;binding.amount=.3;
 const changed=previewAbility(p,a,'fern',p.balance.enemies[0].id);
 assert.ok(changed.notes.some(x=>x.includes('30 %')&&x.includes('entre 2 et 4 s')));
 assert.ok(changed.rows.some(x=>x.at===.5&&x.raw===6));
});

test('Fougère authoring rejects a frond that could escape before its first tick',()=>{
 const p=seedProject(),e=p.combat!.effects.find(x=>x.id==='fx_fern_bind')!;
 e.tickInterval=4;
 assert.ok(combatIssues(p).some(x=>x.path.endsWith('fx_fern_bind')&&x.severity==='error'));
 e.tickInterval=1;e.kind='poison';
 assert.ok(combatIssues(p).some(x=>x.path.endsWith('fx_fern_bind')&&x.severity==='error'));
});
