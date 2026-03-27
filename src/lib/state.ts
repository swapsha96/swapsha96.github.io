export const state = {
    currentIndex: 0,
    currentTab: 0,
    numTabs: 3,
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function getScrollBehavior(): ScrollBehavior {
    return prefersReducedMotion.matches ? 'auto' : 'smooth';
}
