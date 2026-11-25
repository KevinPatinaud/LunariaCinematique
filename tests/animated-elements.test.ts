import assert from 'node:assert/strict';
import test from 'node:test';
import { sampleElement, type ElementClip, type ElementPreset } from '../src/shared/presentation/animatedElements.js';
import { newAnimation } from '../src/shared/presentation/factories.js';

const first = 'library://07_props/base.png', second = 'library://07_props/second.png';
function clip(preset: ElementPreset): ElementClip {
  return { ...newAnimation('idle'), kind: 'combined', scope: 'cinematic', duration: 2,
    frames: [{ asset: first, duration: 1 }, { asset: second, duration: 1 }],
    element: { preset, travel: 2, pivot: { x: 0.5, y: 0.5 } } };
}

test('element animation uses shot time, speed and local repeat mode', () => {
  const settings = { speed: 2, elementPlayback: { start: 1, loop: true } };
  assert.deepEqual(sampleElement(clip('rotate'), 0.9, settings), []);
  assert.equal(sampleElement(clip('rotate'), 1.25, settings)[0].angle, 90);
  assert.equal(sampleElement(clip('rotate'), 2.25, settings)[0].angle, 90);
  assert.equal(sampleElement(clip('rotate'), 1.25, settings, true)[0].angle, 0);
  settings.elementPlayback.loop = false;
  assert.equal(sampleElement(clip('rotate'), 2.25, settings)[0].angle, 0);
  assert.deepEqual(sampleElement(clip('float'), 2.25, settings), []);
});

test('floating layers overlap and a falling image changes at the impact point', () => {
  const plume = sampleElement(clip('float'), 1.5);
  assert.deepEqual(plume.map(item => [item.asset, item.y]), [[first, -1.5], [second, -0.5]]);
  assert.equal(plume[1].opacity, Math.sin(Math.PI * 0.25));
  assert.equal(sampleElement(clip('fall'), 0.72)[0].y, 0.5);
  const impact = sampleElement(clip('fall'), 1.44)[0];
  assert.equal(impact.asset, second);
  assert.equal(impact.opacity, 1);
  assert.equal(impact.y, 2);
  const fallback = clip('fall');
  fallback.frames.pop();
  assert.equal(sampleElement(fallback, 1.44)[0].scaleY, 0.25);
});

test('exhaled smoke starts at its origin, opens into a second wisp and dissipates', () => {
  const smoke = clip('exhale');
  smoke.loop = false;
  assert.equal(sampleElement(smoke, 0)[0].x, 0);
  assert.equal(sampleElement(smoke, 0)[0].opacity, 0);
  assert.equal(sampleElement(smoke, 0.2)[0].x, 0);
  assert.ok(sampleElement(smoke, 0.2)[0].opacity > 0.6);
  const early = sampleElement(smoke, 0.5);
  const late = sampleElement(smoke, 1.5);
  assert.equal(early.length, 2);
  assert.ok(early[0].x > 0.7 && early[0].x < 0.8);
  assert.ok(early[0].angle < 0);
  assert.ok(early[0].y < 0 && late[0].y < early[0].y);
  assert.ok(late[0].scaleY > early[0].scaleY && late[0].opacity < early[0].opacity);
  assert.deepEqual(sampleElement(smoke, 2), []);
});

test('floating images can drift and sway without changing their vertical motion', () => {
  const leaves = clip('float');
  leaves.element.drift = -1.6;
  leaves.element.sway = 20;
  const [lead] = sampleElement(leaves, 0.5);
  assert.equal(lead.x, -0.4);
  assert.equal(lead.y, -0.5);
  assert.equal(lead.angle, 20);
});
