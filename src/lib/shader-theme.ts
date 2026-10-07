/**
 * Maps the console's theme tokens (CSS variables on `body.theme-*`) to the
 * colors used by the WebGPU background composition. Pure functions live here
 * so the palette math is unit-testable without a browser.
 */

export interface ThemeTokens {
  /** --device-bg-base */
  bgBase: string;
  /** --device-bg-gradient */
  bgGradient: string;
  /** --device-screen-text */
  accent: string;
  /** --device-button-primary */
  accent2: string;
}

export interface ShaderThemeProps {
  nebulaStops: { color: string; position: number }[];
  hazeColor: string;
  starsColor: string;
  vignetteColor: string;
  trailColorA: string;
  trailColorB: string;
}

const clampByte = (n: number): number => Math.min(255, Math.max(0, Math.round(n)));

/** Parses `#rgb`, `#rrggbb` or `rgb()/rgba()` into `[r, g, b]` (0-255). */
export function parseColor(value: string): [number, number, number] {
  const v = value.trim();

  if (v.startsWith('#')) {
    const hex = v.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
    throw new Error(`Unsupported color format: ${value}`);
  }

  const match = /^rgba?\(\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/.exec(
    v,
  );
  if (match) {
    return [clampByte(Number(match[1])), clampByte(Number(match[2])), clampByte(Number(match[3]))];
  }

  throw new Error(`Unsupported color format: ${value}`);
}

function toHex([r, g, b]: [number, number, number]): string {
  const hex = (n: number) => clampByte(n).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/** Linear mix of two colors; returns a `#rrggbb` string. */
export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseColor(a);
  const [br, bg, bb] = parseColor(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

/**
 * Builds the shader palette for a theme. The accent colors bleed into the
 * nebula so the background harmonizes with the console's shell and screen.
 */
export function buildShaderTheme(tokens: ThemeTokens): ShaderThemeProps {
  const { bgBase, bgGradient, accent, accent2 } = tokens;

  return {
    nebulaStops: [
      { color: bgBase, position: 0 },
      { color: mixHex(bgBase, bgGradient, 0.55), position: 0.3 },
      { color: bgGradient, position: 0.55 },
      { color: mixHex(bgGradient, accent, 0.25), position: 0.8 },
      { color: mixHex(bgGradient, accent, 0.45), position: 1 },
    ],
    hazeColor: mixHex(bgGradient, accent, 0.5),
    starsColor: mixHex(accent, '#ffffff', 0.55),
    vignetteColor: mixHex(bgBase, '#000000', 0.45),
    trailColorA: accent,
    trailColorB: accent2,
  };
}

/** Fallback tokens (atomic theme) when CSS variables are missing/unparsable. */
export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  bgBase: '#0f0c29',
  bgGradient: '#302b63',
  accent: '#0affc2',
  accent2: '#ff0055',
};

/** Reads the current theme tokens from the page's CSS variables. */
export function readThemeTokens(): ThemeTokens {
  const read = (name: string): string =>
    getComputedStyle(document.body).getPropertyValue(name).trim();

  const tokens = {
    bgBase: read('--device-bg-base'),
    bgGradient: read('--device-bg-gradient'),
    accent: read('--device-screen-text'),
    accent2: read('--device-button-primary'),
  };

  // A theme that can't be parsed must never break the page: fall back
  // per-token to the atomic palette.
  for (const key of Object.keys(tokens) as (keyof ThemeTokens)[]) {
    try {
      parseColor(tokens[key]);
    } catch {
      tokens[key] = DEFAULT_THEME_TOKENS[key];
    }
  }

  return tokens;
}
