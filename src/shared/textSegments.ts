/** A grapheme is what the reader sees as one character (accent/emoji included). */
const segmenter = new Intl.Segmenter('fr', { granularity: 'grapheme' });
export function graphemes(text: string): string[] {
  return Array.from(segmenter.segment(text), part => part.segment);
}
export interface TextUnit { text: string; line: number; column: number; index: number; word: number }
/** Explicit line breaks are kept as one unit so playback and drawing use one clock.
 * "Words" = whitespace-separated reading groups, including punctuation.
 */
export function unitsForLines(lines: readonly string[]): TextUnit[] {
  let word = -1, inWord = false;
  const result: TextUnit[] = [];
  lines.forEach((line, row) => {
    const parts = graphemes(line);
    parts.forEach((text, column) => {
      const space = /^\s+$/u.test(text);
      if (!space && !inWord) word++;
      inWord = !space;
      result.push({ text, line: row, column, index: result.length, word: Math.max(0, word) });
    });
    if (row < lines.length - 1) {
      result.push({ text: '\n', line: row, column: parts.length, index: result.length, word: Math.max(0, word) });
      inWord = false;
    }
  });
  return result;
}
