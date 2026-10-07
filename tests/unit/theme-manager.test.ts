import { describe, it, expect } from 'vitest';
import { getNextThemeIndex, getPrevThemeIndex, themes } from '../../src/lib/theme-manager';

describe('getNextThemeIndex', () => {
  it('advances to the next theme', () => {
    expect(getNextThemeIndex(0, themes)).toBe(1);
    expect(getNextThemeIndex(3, themes)).toBe(4);
  });

  it('wraps from the last theme back to the first', () => {
    expect(getNextThemeIndex(themes.length - 1, themes)).toBe(0);
  });

  it('works with a custom theme list', () => {
    const custom = ['a', 'b', 'c'];
    expect(getNextThemeIndex(0, custom)).toBe(1);
    expect(getNextThemeIndex(2, custom)).toBe(0);
  });
});

describe('getPrevThemeIndex', () => {
  it('steps back to the previous theme', () => {
    expect(getPrevThemeIndex(1, themes)).toBe(0);
    expect(getPrevThemeIndex(4, themes)).toBe(3);
  });

  it('wraps from the first theme back to the last', () => {
    expect(getPrevThemeIndex(0, themes)).toBe(themes.length - 1);
  });

  it('works with a custom theme list', () => {
    const custom = ['a', 'b', 'c'];
    expect(getPrevThemeIndex(0, custom)).toBe(2);
    expect(getPrevThemeIndex(2, custom)).toBe(1);
  });
});

describe('themes list', () => {
  it('has at least two themes', () => {
    expect(themes.length).toBeGreaterThanOrEqual(2);
  });

  it('contains only non-empty strings', () => {
    for (const theme of themes) {
      expect(typeof theme).toBe('string');
      expect(theme.length).toBeGreaterThan(0);
    }
  });

  it('has no duplicates', () => {
    const unique = new Set(themes);
    expect(unique.size).toBe(themes.length);
  });
});
