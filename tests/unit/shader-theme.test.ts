import { describe, expect, it } from 'vitest';
import { buildShaderTheme, mixHex, parseColor } from '../../src/lib/shader-theme';

describe('parseColor', () => {
  it('parses #rrggbb', () => {
    expect(parseColor('#0f0c29')).toEqual([15, 12, 41]);
    expect(parseColor('#ff0055')).toEqual([255, 0, 85]);
  });

  it('parses #rgb shorthand', () => {
    expect(parseColor('#abc')).toEqual([170, 187, 204]);
  });

  it('parses rgb()/rgba() and clamps channels', () => {
    expect(parseColor('rgb(255, 0, 10)')).toEqual([255, 0, 10]);
    expect(parseColor('rgba(255, 0, 10, 0.5)')).toEqual([255, 0, 10]);
    expect(parseColor('rgb(300, -5, 12.6)')).toEqual([255, 0, 13]);
  });

  it('throws on unsupported formats', () => {
    expect(() => parseColor('transparent')).toThrow(/Unsupported color format/);
    expect(() => parseColor('#12345')).toThrow(/Unsupported color format/);
  });
});

describe('mixHex', () => {
  it('returns the endpoints at t=0 and t=1', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mixHex('#000000', '#ffffff', 1)).toBe('#ffffff');
  });

  it('mixes midpoints', () => {
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixHex('#000000', '#ff0000', 0.5)).toBe('#800000');
  });
});

describe('buildShaderTheme', () => {
  const tokens = {
    bgBase: '#000000',
    bgGradient: '#ffffff',
    accent: '#ff0000',
    accent2: '#00ff00',
  };

  it('builds five ordered nebula stops anchored on the theme colors', () => {
    const theme = buildShaderTheme(tokens);
    expect(theme.nebulaStops).toHaveLength(5);
    expect(theme.nebulaStops.map((s) => s.position)).toEqual([0, 0.3, 0.55, 0.8, 1]);
    expect(theme.nebulaStops[0].color).toBe('#000000');
    expect(theme.nebulaStops[2].color).toBe('#ffffff');
  });

  it('passes the accent colors through to the cursor trail', () => {
    const theme = buildShaderTheme(tokens);
    expect(theme.trailColorA).toBe('#ff0000');
    expect(theme.trailColorB).toBe('#00ff00');
  });

  it('darkens the vignette relative to the base', () => {
    const theme = buildShaderTheme(tokens);
    expect(theme.vignetteColor).toBe('#000000');
  });

  it('produces only #rrggbb colors', () => {
    const theme = buildShaderTheme({
      bgBase: '#0f0c29',
      bgGradient: '#302b63',
      accent: '#0affc2',
      accent2: '#ff0055',
    });
    const allColors = [
      ...theme.nebulaStops.map((s) => s.color),
      theme.hazeColor,
      theme.starsColor,
      theme.vignetteColor,
      theme.trailColorA,
      theme.trailColorB,
    ];
    for (const color of allColors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
