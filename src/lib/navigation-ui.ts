import { FRAME_DURATION } from './constants';
import { state, getScrollBehavior } from './state';
import { SoundEngine } from './sound-engine';
import { startTypewriter, stopTypewriter } from './typewriter';

export const keyMap: Record<string, string> = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  Enter: 'btn-a', ' ': 'btn-a', z: 'btn-a', Z: 'btn-a',
  x: 'btn-b', X: 'btn-b',
  q: 'btn-select', Q: 'btn-select'
};

export function getLinks() {
  return document.querySelectorAll('.social-link');
}

export function getMainScreen() {
  return document.getElementById('main-screen');
}

export function updateTabUI() {
  document.querySelectorAll('.tab-indicator').forEach((indicator, index) => {
    const isActive = index === state.currentTab;
    indicator.classList.toggle('active', isActive);
    indicator.setAttribute('aria-selected', String(isActive));
    (indicator as HTMLElement).tabIndex = isActive ? 0 : -1;
  });

  document.querySelectorAll('.tab-content').forEach((content, index) => {
    const isActive = index === state.currentTab;
    content.classList.toggle('active', isActive);
    (content as HTMLElement).hidden = !isActive;

    if (index === 1) {
      if (isActive) startTypewriter();
      else stopTypewriter();
    }
  });
}

export function updateActiveLink(index: number, isWrap = false, isMouseHover = false) {
  const links = getLinks();
  links.forEach(link => link.classList.remove('active'));

  if (links[index]) {
    if (!isMouseHover) {
      SoundEngine.playTone(440 + (index * 20), 'sine', 0.1, 0.05);
    }

    links[index].classList.add('active');

    if (state.currentTab === 0) {
      const screen = getMainScreen();
      const scrollStyle = isWrap ? 'auto' : getScrollBehavior();

      if (index === 0) {
        if (screen) screen.scrollTo({ top: 0, behavior: scrollStyle });
      } else if (index === links.length - 1) {
        if (screen) screen.scrollTo({ top: screen.scrollHeight, behavior: scrollStyle });
      } else {
        links[index].scrollIntoView({ behavior: scrollStyle, block: 'nearest' });
      }
    }

    state.currentIndex = index;
  }
}

export function scrollCurrentPanel(direction: 'up' | 'down', amount = 50) {
  const screen = getMainScreen();
  if (!screen) return;

  screen.scrollBy({
    top: direction === 'up' ? -amount : amount,
    behavior: getScrollBehavior()
  });
}

export function activateSelectedLink() {
  if (state.currentTab !== 0) return;

  const links = getLinks();
  if (!links[state.currentIndex]) return;

  (links[state.currentIndex] as HTMLElement).click();
  links[state.currentIndex].classList.add('pressed');
  setTimeout(() => links[state.currentIndex].classList.remove('pressed'), FRAME_DURATION * 8);
  SoundEngine.select();
}

export function toggleButtonState(key: string, isPressed: boolean) {
  const btnId = keyMap[key];
  if (!btnId) return;

  const btn = document.getElementById(btnId);
  if (!btn) return;

  if (isPressed) btn.classList.add('pressed');
  else btn.classList.remove('pressed');
}

export function animatePress(btn: HTMLElement | null, duration = FRAME_DURATION * 5) {
  if (!btn) return;
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), duration);
}

export function clearPressedStates() {
  document.querySelectorAll('.pressed').forEach(el => el.classList.remove('pressed'));
}

export function toggleTurnLayout() {
  const btnTurn = document.getElementById('btn-turn');
  const consoleEl = document.querySelector('.console');

  if (btnTurn) animatePress(btnTurn as HTMLElement);
  SoundEngine.playTone(880, 'sawtooth', (FRAME_DURATION * 6) / 1000, 0.1);

  const performSwitch = () => {
    if (consoleEl) consoleEl.classList.toggle('landscape');
  };

  if ((document as any).startViewTransition) {
    (document as any).startViewTransition(performSwitch);
  } else {
    performSwitch();
  }

  setTimeout(() => SoundEngine.playTone(440, 'triangle', (FRAME_DURATION * 30) / 1000, 0.1), FRAME_DURATION * 6);
}

const TOUCH_CLICK_SUPPRESSION_MS = 450;
let lastTouchStartAt = 0;

function markTouchInteraction() {
  lastTouchStartAt = Date.now();
}

function isSyntheticClickAfterTouch() {
  return Date.now() - lastTouchStartAt < TOUCH_CLICK_SUPPRESSION_MS;
}

export function bindPressAction(btn: HTMLElement | null, action: () => void) {
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (isSyntheticClickAfterTouch()) return;
    animatePress(btn);
    action();
  });

  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    markTouchInteraction();
    animatePress(btn);
    action();
  }, { passive: false });
}

export function bindTouchAction(btn: HTMLElement | null, action: () => void) {
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (isSyntheticClickAfterTouch()) return;
    action();
  });

  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    markTouchInteraction();
    action();
  }, { passive: false });
}

export function getHoveredLinkIndex(target: EventTarget | null): number | null {
  const link = (target as HTMLElement | null)?.closest('.social-link');
  if (!link) return null;

  const index = parseInt(link.getAttribute('data-index') || '', 10);
  return Number.isNaN(index) ? null : index;
}

export function resetScreenScroll() {
  const screen = getMainScreen();
  if (screen) {
    screen.scrollTo({ top: 0, behavior: 'auto' });
  }
}
