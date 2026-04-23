export type AppState = {
  currentIndex: number;
  currentTab: number;
  numTabs: number;
  isPoweredOn: boolean;
};

export const state: AppState = {
  currentIndex: 0,
  currentTab: 0,
  numTabs: 3,
  isPoweredOn: true,
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
