import { describe, expect, it } from 'vitest';
import { toCsv } from '../csv';

describe('toCsv', () => {
  it('quotes cells with commas, quotes and newlines', () => {
    expect(toCsv(['a', 'b'], [['x,y', 'say "hi"\nnow']])).toBe('a,b\r\n"x,y","say ""hi""\nnow"');
  });

  it('neutralises spreadsheet formulas in attendee input', () => {
    expect(toCsv(['name'], [['=HYPERLINK("http://evil")'], ['+1'], ['@SUM(A1)'], ['-2']])).toBe(
      `name\r\n"'=HYPERLINK(""http://evil"")"\r\n'+1\r\n'@SUM(A1)\r\n'-2`,
    );
  });

  it('renders empty values as empty cells', () => {
    expect(toCsv(['a', 'b', 'c'], [[null, undefined, 0]])).toBe('a,b,c\r\n,,0');
  });
});
