import { describe, it, expect } from 'vitest';
import { checkKonamiStep } from '../../src/lib/extras';

const konamiCode = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'x', 'z'
];

describe('checkKonamiStep', () => {
    it('matches arrow keys at correct positions', () => {
        expect(checkKonamiStep('ArrowUp', 0, konamiCode)).toBe(true);
        expect(checkKonamiStep('ArrowUp', 1, konamiCode)).toBe(true);
        expect(checkKonamiStep('ArrowDown', 2, konamiCode)).toBe(true);
        expect(checkKonamiStep('ArrowLeft', 4, konamiCode)).toBe(true);
        expect(checkKonamiStep('ArrowRight', 5, konamiCode)).toBe(true);
    });

    it('rejects wrong keys', () => {
        expect(checkKonamiStep('ArrowDown', 0, konamiCode)).toBe(false);
        expect(checkKonamiStep('ArrowUp', 2, konamiCode)).toBe(false);
        expect(checkKonamiStep('a', 0, konamiCode)).toBe(false);
    });

    it('accepts B as alternative at position 8', () => {
        expect(checkKonamiStep('b', 8, konamiCode)).toBe(true);
        expect(checkKonamiStep('B', 8, konamiCode)).toBe(true);
    });

    it('accepts A or Enter as alternatives at position 9', () => {
        expect(checkKonamiStep('a', 9, konamiCode)).toBe(true);
        expect(checkKonamiStep('A', 9, konamiCode)).toBe(true);
        expect(checkKonamiStep('Enter', 9, konamiCode)).toBe(true);
    });

    it('accepts the mapped keys (x at 8, z at 9)', () => {
        expect(checkKonamiStep('x', 8, konamiCode)).toBe(true);
        expect(checkKonamiStep('z', 9, konamiCode)).toBe(true);
    });

    it('is case-insensitive for letter keys', () => {
        expect(checkKonamiStep('X', 8, konamiCode)).toBe(true);
        expect(checkKonamiStep('Z', 9, konamiCode)).toBe(true);
    });
});
