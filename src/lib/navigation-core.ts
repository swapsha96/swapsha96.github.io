export type NavigationDirection = 'up' | 'down';
export type TabDirection = 'left' | 'right';

/** Pure function for testing: returns the next index with wrapping. */
export function getNextIndex(
  current: number,
  length: number,
  direction: NavigationDirection,
): number {
  if (direction === 'up') {
    return current === 0 ? length - 1 : current - 1;
  }
  return current === length - 1 ? 0 : current + 1;
}

/** Pure function for testing: returns the next tab with wrapping. */
export function getNextTab(current: number, numTabs: number, direction: TabDirection): number {
  if (direction === 'left') {
    return (current - 1 + numTabs) % numTabs;
  }
  return (current + 1) % numTabs;
}

/** Pure helper for keyboard handling. */
export function isTypingTarget(target: HTMLElement | null | undefined): boolean {
  return (
    !!target &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  );
}
