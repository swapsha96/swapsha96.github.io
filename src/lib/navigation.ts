import { FRAME_DURATION } from './constants';
import { isConsolePoweredOn, state } from './state';
import { SoundEngine } from './sound-engine';
import { handleThemeSwitch } from './theme-manager';
import { getNextIndex, getNextTab, isTypingTarget, type NavigationDirection, type TabDirection } from './navigation-core';
import {
  activateSelectedLink,
  bindPressAction,
  bindTouchAction,
  clearPressedStates,
  getHoveredLinkIndex,
  getLinks,
  getMainScreen,
  resetScreenScroll,
  scrollCurrentPanel,
  toggleButtonState,
  toggleTurnLayout,
  updateActiveLink,
  updateTabUI,
} from './navigation-ui';

export { getNextIndex, getNextTab, updateActiveLink, updateTabUI };

function handleNavigation(direction: NavigationDirection) {
  if (!isConsolePoweredOn()) return;

  if (state.currentTab === 0) {
    const links = getLinks();
    const isWrap = (direction === 'up' && state.currentIndex === 0) ||
      (direction === 'down' && state.currentIndex === links.length - 1);

    state.currentIndex = getNextIndex(state.currentIndex, links.length, direction);
    updateActiveLink(state.currentIndex, isWrap);
    return;
  }

  if (state.currentTab === 1 || state.currentTab === 2) {
    scrollCurrentPanel(direction);
  }
}

function handleSelection() {
  if (!isConsolePoweredOn()) return;
  activateSelectedLink();
}

export function switchTab(direction: TabDirection) {
  if (!isConsolePoweredOn()) return;

  state.currentTab = getNextTab(state.currentTab, state.numTabs, direction);

  SoundEngine.switch();
  resetScreenScroll();
  updateTabUI();

  if (state.currentTab === 0) {
    setTimeout(() => updateActiveLink(state.currentIndex), FRAME_DURATION * 3);
  }
}

export function switchToTab(index: number) {
  if (!isConsolePoweredOn()) return;
  if (index < 0 || index >= state.numTabs || index === state.currentTab) return;

  state.currentTab = index;
  SoundEngine.switch();
  updateTabUI();
}

export function initNavigation() {
  document.addEventListener('keyup', (e) => {
    toggleButtonState(e.key, false);
  });

  window.addEventListener('blur', clearPressedStates);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearPressedStates();
  });

  document.querySelectorAll('.tab-indicator').forEach((tab, index) => {
    tab.addEventListener('click', () => switchToTab(index));
  });

  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (isTypingTarget(target) || e.isComposing || e.metaKey) return;

    if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (!isConsolePoweredOn()) return;
      e.preventDefault();
      switchToTab(2);
      return;
    }

    if (!e.repeat && isConsolePoweredOn()) toggleButtonState(e.key, true);

    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W':
        e.preventDefault();
        handleNavigation('up');
        break;
      case 'ArrowDown': case 's': case 'S':
        e.preventDefault();
        handleNavigation('down');
        break;
      case 'ArrowLeft': case 'a': case 'A':
        e.preventDefault();
        switchTab('left');
        break;
      case 'ArrowRight': case 'd': case 'D':
        e.preventDefault();
        switchTab('right');
        break;
      case 'Enter': case ' ': case 'z': case 'Z':
        e.preventDefault();
        handleSelection();
        break;
      case 'x': case 'X':
      case 'q': case 'Q':
        if (!e.ctrlKey && !e.altKey && !e.metaKey && isConsolePoweredOn()) {
          e.preventDefault();
          handleThemeSwitch();
        }
        break;
      case 'o': case 'O':
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          toggleTurnLayout();
        }
        break;
    }
  });

  bindPressAction(document.getElementById('up'), () => handleNavigation('up'));
  bindPressAction(document.getElementById('down'), () => handleNavigation('down'));
  bindPressAction(document.getElementById('left'), () => switchTab('left'));
  bindPressAction(document.getElementById('right'), () => switchTab('right'));
  bindPressAction(document.getElementById('btn-a'), handleSelection);
  bindPressAction(document.getElementById('btn-b'), handleThemeSwitch);
  bindPressAction(document.getElementById('btn-select'), handleThemeSwitch);
  bindPressAction(document.getElementById('btn-start'), () => switchToTab(2));
  bindTouchAction(document.getElementById('btn-turn'), toggleTurnLayout);

  const linksContainer = document.querySelector('.links');
  if (linksContainer) {
    linksContainer.addEventListener('mouseover', (e) => {
      const index = getHoveredLinkIndex(e.target);
      if (index !== null && state.currentTab === 0 && isConsolePoweredOn()) {
        updateActiveLink(index, false, true);
      }
    });
  }

  let accumulatedDelta = 0;
  let wheelTimeout: ReturnType<typeof setTimeout>;
  const LINK_SCROLL_THRESHOLD = 30;

  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey || !isConsolePoweredOn()) return;
    e.preventDefault();

    if (state.currentTab === 1 || state.currentTab === 2) {
      const screen = getMainScreen();
      if (screen) {
        screen.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
      return;
    }

    accumulatedDelta += e.deltaY;
    if (Math.abs(accumulatedDelta) > LINK_SCROLL_THRESHOLD) {
      handleNavigation(accumulatedDelta > 0 ? 'down' : 'up');
      accumulatedDelta = 0;
    }

    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      accumulatedDelta = 0;
    }, 100);
  }, { passive: false });
}
