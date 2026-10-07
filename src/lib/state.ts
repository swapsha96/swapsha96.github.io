export type AppState = {
  currentIndex: number;
  currentTab: number;
  numTabs: number;
  isPoweredOn: boolean;
  isBooting: boolean;
  /** True while the Snake game is actively running (owns the D-pad). */
  snakePlaying: boolean;
  /** True while the START pause menu is open (it owns all keys). */
  menuOpen: boolean;
  /** Index of the highlighted pause-menu item. */
  menuIndex: number;
};

export const state: AppState = {
  currentIndex: 0,
  currentTab: 0,
  numTabs: 4,
  isPoweredOn: true,
  isBooting: false,
  snakePlaying: false,
  menuOpen: false,
  menuIndex: 0,
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getScrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

export function isConsolePoweredOn(): boolean {
  return state.isPoweredOn;
}

export function isConsoleInteractive(): boolean {
  return state.isPoweredOn && !state.isBooting;
}
