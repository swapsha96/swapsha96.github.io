import { describe, it, expect } from 'vitest';
import { getNextThemeIndex, themes } from '../../src/lib/theme-manager';

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
