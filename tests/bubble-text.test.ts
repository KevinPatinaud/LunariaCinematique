import test from 'node:test';
import assert from 'node:assert/strict';
import {bubbleLayout, charWidth, prepareCinematic, wrapText} from '../src/shared/geometry.js';
import {copy, newBubble, newCinematic, type BubbleStyle} from '../src/shared/model.js';
import {bubbleTextUnits, newTextAnimation} from '../src/shared/textAnimation.js';

for (const style of ['plain', 'parchment', 'simple', 'ornate'] as BubbleStyle[]) {
  test(`fitting ${style} dialogue retains its authored font size`, () => {
    const bubble = newBubble();
    Object.assign(bubble, {style, text:'Bonjour, Lunaria !', fontSize:36, autoHeight:false, width:.6, height:.25});
    const original = copy(bubble), layout = bubbleLayout(bubble);
    assert.equal(layout.fontSize, 36);
    assert.equal(layout.lineHeight, 36 * 1.32);
    assert.equal(layout.overflow, false);
    assert.deepEqual(bubble, original);
  });

  test(`oversized ${style} dialogue fits its complete text in a fixed bubble`, () => {
    const bubble = newBubble();
    Object.assign(bubble, {style, text:'Une réplique beaucoup trop longue pour cette petite bulle. '.repeat(8),
      fontSize:48, autoHeight:false, width:.25, height:.22});
    const layout = bubbleLayout(bubble);
    assert.ok(layout.fontSize < bubble.fontSize);
    assert.equal(layout.overflow, false);
    assert.equal(layout.height, bubble.height * 900);
    assert.equal(layout.lines.join('').replace(/\s/g,''), bubble.text.replace(/\s/g,''));
    assert.ok(layout.lines.length * layout.lineHeight <= layout.height - layout.paddingY * 2 + 1e-7);
    for (const line of layout.lines) {
      assert.ok([...line].reduce((n,c) => n + charWidth(c,layout.fontSize),0) <= layout.width - layout.paddingX * 2 + 1e-7);
    }
  });
}

test('fitting keeps hard and blank lines and chooses the largest size that fits', () => {
  const bubble = newBubble();
  Object.assign(bubble, {text:'Bonjour\n\nUne seconde phrase\nTroisième phrase', fontSize:48,
    autoHeight:false, width:.6, height:100 / 900});
  const layout = bubbleLayout(bubble);
  assert.deepEqual(layout.lines, ['Bonjour','','Une seconde phrase','Troisième phrase']);
  assert.equal(layout.fontSize, 10);
  assert.ok(layout.lines.length * (layout.fontSize + 1) * 1.32 > 100 - 44);
  bubble.height = .4;
  assert.equal(bubbleLayout(bubble).fontSize, 48);
});

test('automatic height expands at authored size before any reduction', () => {
  const bubble = newBubble();
  Object.assign(bubble, {text:'La serre bruissait doucement. '.repeat(8), fontSize:36, width:.25});
  const layout = bubbleLayout(bubble);
  assert.equal(layout.fontSize, bubble.fontSize);
  assert.ok(layout.height > bubble.height * 900);
  assert.equal(layout.overflow, false);
});

test('capped automatic height reduces long text without changing exported font size', () => {
  const document = newCinematic(), bubble = newBubble();
  Object.assign(bubble, {text:'Lunaria '.repeat(180), fontSize:72, width:.16});
  document.shots[0].bubbles = [bubble];
  const layout = bubbleLayout(bubble), saved = prepareCinematic(document).shots[0].bubbles[0];
  assert.equal(layout.height, 1800);
  assert.ok(layout.fontSize < 72);
  assert.equal(layout.overflow, false);
  assert.equal(saved.fontSize, 72);
  assert.equal(saved.text, bubble.text);
  assert.deepEqual(saved.lines, layout.lines);
  assert.equal(bubble.lines, undefined);
});

test('resizing invalidates complete fitted animation line positions', () => {
  const bubble = newBubble();
  Object.assign(bubble, {text:'abcdefghij'.repeat(20), fontSize:48, autoHeight:false, width:.2, height:.5,
    textAnimation:newTextAnimation('typewriter')});
  const before = bubbleTextUnits(bubble);
  bubble.height = .1;
  const smaller = bubbleTextUnits(bubble);
  assert.notEqual(smaller, before);
  assert.ok(smaller.at(-1)!.line < before.at(-1)!.line);
  assert.equal(smaller.map(u => u.text).join('').replace(/\n/g,''), bubble.text);
  bubble.autoHeight = true;
  assert.notEqual(bubbleTextUnits(bubble), smaller);
  assert.equal(bubbleLayout(bubble).fontSize, bubble.fontSize);
});

test('a bubble without useful text area reports overflow without dropping text', () => {
  const bubble = newBubble();
  Object.assign(bubble, {text:'Même très petite', autoHeight:false, height:.03});
  const layout = bubbleLayout(bubble);
  assert.equal(layout.fontSize, 1);
  assert.equal(layout.overflow, true);
  assert.equal(layout.lines.join(''), bubble.text);
});

test('real font wrapping measures each candidate and preserves complete graphemes and blank lines', () => {
  const sizes: number[] = [];
  const measure = (text: string, size: number) => { sizes.push(size); return Array.from(text).length * size; };
  assert.deepEqual(wrapText('Une serre\n\n\ud83d\udc69\ud83c\udffd\u200d\ud83c\udf3e', 90, 10, {measure}), ['Une serre', '', '\ud83d\udc69\ud83c\udffd\u200d\ud83c\udf3e']);
  assert.deepEqual(wrapText('Une serre', 90, 18, {measure}), ['Une', 'serre']);
  assert.ok(sizes.includes(10));
  assert.ok(sizes.includes(18));
});

test('outer blank lines do not shrink or displace dialogue, even with measured wrapping', () => {
  const text = 'Malheureusement mes racines ont étaient contaminées, \nJe crains que mes minutes ne soient comptées,';
  const measure = (value: string, size: number) => Array.from(value).length * size * .5;
  for (const padding of ['', '\n', '\r\n \t\n', '\n'.repeat(20)]) {
    const decorated = padding + text + padding;
    assert.deepEqual(wrapText(decorated, 620, 28), wrapText(text, 620, 28));
    assert.deepEqual(wrapText(decorated, 620, 28, {measure}), wrapText(text, 620, 28, {measure}));
    for (const autoHeight of [false, true]) for (const fontSize of [28, 48]) {
      const b = newBubble();
      Object.assign(b, {style:'simple', width:.46015670112984397, height:.20132755012325945, fontSize, autoHeight, text});
      const expected = bubbleLayout(b);
      b.text = decorated;
      assert.deepEqual(bubbleLayout(b), expected);
      const document = newCinematic(); document.shots[0].bubbles = [b];
      const saved = prepareCinematic(document).shots[0].bubbles[0];
      assert.equal(saved.text, decorated);
      assert.equal(saved.fontSize, fontSize);
    }
  }
  assert.deepEqual(wrapText('\nPremier\n \nSecond\n', 620, 28), ['Premier', '', 'Second']);
  assert.deepEqual(wrapText('\r\n \t\n', 620, 28), ['']);
});
