import { describe, it, expect } from 'vitest';
import { getNextIndex, getNextTab } from '../../src/lib/navigation';

describe('getNextIndex', () => {
  it('moves down normally', () => {
    expect(getNextIndex(0, 5, 'down')).toBe(1);
    expect(getNextIndex(2, 5, 'down')).toBe(3);
  });

  it('moves up normally', () => {
    expect(getNextIndex(3, 5, 'up')).toBe(2);
    expect(getNextIndex(1, 5, 'up')).toBe(0);
  });

  it('wraps down from last to first', () => {
    expect(getNextIndex(4, 5, 'down')).toBe(0);
  });

  it('wraps up from first to last', () => {
    expect(getNextIndex(0, 5, 'up')).toBe(4);
  });

  it('handles single-element list', () => {
    expect(getNextIndex(0, 1, 'up')).toBe(0);
    expect(getNextIndex(0, 1, 'down')).toBe(0);
  });
});

describe('getNextTab', () => {
  it('cycles right', () => {
    expect(getNextTab(0, 3, 'right')).toBe(1);
    expect(getNextTab(1, 3, 'right')).toBe(2);
  });

  it('cycles left', () => {
    expect(getNextTab(2, 3, 'left')).toBe(1);
    expect(getNextTab(1, 3, 'left')).toBe(0);
  });

  it('wraps right from last to first', () => {
    expect(getNextTab(2, 3, 'right')).toBe(0);
  });

  it('wraps left from first to last', () => {
    expect(getNextTab(0, 3, 'left')).toBe(2);
  });

  it('handles two tabs', () => {
    expect(getNextTab(0, 2, 'right')).toBe(1);
    expect(getNextTab(1, 2, 'right')).toBe(0);
    expect(getNextTab(0, 2, 'left')).toBe(1);
    expect(getNextTab(1, 2, 'left')).toBe(0);
  });
});
