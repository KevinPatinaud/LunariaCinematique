import test from 'node:test';
import assert from 'node:assert/strict';
import { ImageCache } from '../src/renderer/images.js';

class FakeImage {
  static instances: FakeImage[] = [];
  src = '';
  naturalWidth = 320;
  naturalHeight = 480;
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  constructor() { FakeImage.instances.push(this); }
  success() { this.onload?.(); }
  error() { this.onerror?.(); }
}
function fake(t: { after: (fn: () => void) => void }) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'Image');
  FakeImage.instances = [];
  Object.defineProperty(globalThis, 'Image', { configurable: true, value: FakeImage });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'Image', previous);
    else Reflect.deleteProperty(globalThis, 'Image');
  });
}
test('image cache deduplicates requests for the same file', async t => {
  fake(t); const cache = new ImageCache();
  const one = cache.load('a', 'Rose'), two = cache.load('a', 'Rose');
  assert.equal(one, two); assert.equal(FakeImage.instances.length, 1);
  FakeImage.instances[0].success(); assert.equal(await one, FakeImage.instances[0]);
});
test('broken image can be retried without restarting', async t => {
  fake(t); const cache = new ImageCache(); const bad = cache.load('a', 'Rose');
  const rejected = assert.rejects(bad, /illisible/); FakeImage.instances[0].error(); await rejected;
  const next = cache.load('a', 'Rose'); assert.equal(FakeImage.instances.length, 2);
  FakeImage.instances[1].success(); await next;
});
test('failure of an obsolete request does not evict a new library request', async t => {
  fake(t); const cache = new ImageCache(); const old = cache.load('a', 'Old library');
  const rejected = assert.rejects(old); cache.clear(); const current = cache.load('a', 'New library');
  FakeImage.instances[0].error(); await rejected;
  assert.equal(cache.load('a', 'New library'), current); assert.equal(FakeImage.instances.length, 2);
  FakeImage.instances[1].success(); await current;
});
test('late success after cache reset does not replace a newer request', async t => {
  fake(t); const cache = new ImageCache(); const old = cache.load('a', 'Old'); cache.clear();
  const current = cache.load('a', 'New'); FakeImage.instances[0].success(); await old;
  assert.equal(cache.load('a', 'New'), current); FakeImage.instances[1].success(); await current;
});
test('invalid dimensions reject and release the image', async t => {
  fake(t); const cache = new ImageCache(); const result = cache.load('a', 'Empty');
  const rejected = assert.rejects(result, /Dimensions invalides/);
  FakeImage.instances[0].naturalWidth = 0; FakeImage.instances[0].success(); await rejected;
  assert.equal(FakeImage.instances[0].src, ''); assert.equal(FakeImage.instances[0].onload, null);
});
test('oversized images are rejected before retaining the decoded image', async t => {
  fake(t); const result = new ImageCache().load('a', 'Oversize'); const rejected = assert.rejects(result, /trop grande/);
  FakeImage.instances[0].naturalWidth = 9000; FakeImage.instances[0].naturalHeight = 9000;
  FakeImage.instances[0].success(); await rejected; assert.equal(FakeImage.instances[0].src, '');
});
test('exactly 64 megapixels are accepted', async t => {
  fake(t); const result = new ImageCache().load('a', 'Large');
  FakeImage.instances[0].naturalWidth = 8192; FakeImage.instances[0].naturalHeight = 8192;
  FakeImage.instances[0].success(); await result;
});
test('cache entry count is bounded without breaking pending requests', async t => {
  fake(t); const cache = new ImageCache(1); const a = cache.load('a', 'A'), b = cache.load('b', 'B');
  assert.equal(cache.load('b', 'B'), b); const aAgain = cache.load('a', 'A'); assert.notEqual(a, aAgain);
  for (const image of FakeImage.instances) image.success(); await Promise.all([a, b, aAgain]);
});
