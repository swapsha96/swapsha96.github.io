import { FRAME_DURATION } from './constants';
import { isConsoleInteractive, state } from './state';
import { SoundEngine } from './sound-engine';
import { handleThemeSwitch, handleThemeSwitchBack } from './theme-manager';
import {
  getNextIndex,
  getNextTab,
  isTypingTarget,
  type NavigationDirection,
  type TabDirection,
} from './navigation-core';
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
  updatePauseMenu,
  updateTabUI,
  PAUSE_MENU_ACTIONS,
  type PauseMenuAction,
} from './navigation-ui';

export { getNextIndex, getNextTab, updateActiveLink, updateTabUI };

// --------------- Pause menu (START) ---------------

function openMenu() {
  state.menuOpen = true;
  state.menuIndex = 0;
  SoundEngine.playTone(520, 'square', 0.06, 0.08);
  updatePauseMenu();
}

function closeMenu() {
  state.menuOpen = false;
  SoundEngine.playTone(320, 'square', 0.05, 0.06);
  updatePauseMenu();
}

function toggleMenu() {
  if (state.menuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

function moveMenuSelection(direction: NavigationDirection) {
  state.menuIndex = getNextIndex(state.menuIndex, PAUSE_MENU_ACTIONS.length, direction);
  SoundEngine.playTone(320 + state.menuIndex * 40, 'sine', 0.06, 0.05);
  updatePauseMenu();
}

function activateMenuSelection() {
  const action: PauseMenuAction = PAUSE_MENU_ACTIONS[state.menuIndex] ?? 'resume';
  SoundEngine.select();

  switch (action) {
    case 'resume':
      closeMenu();
      break;
    case 'theme':
      handleThemeSwitch();
      break;
    case 'sound':
      SoundEngine.toggleMute();
      updatePauseMenu();
      break;
    case 'help':
      closeMenu();
      switchToTab(2);
      break;
    case 'power':
      closeMenu();
      document.getElementById('power-switch')?.click();
      break;
  }
}

/** Routes a keypress while the pause menu owns input. Returns true if handled. */
function handleMenuKey(key: string): boolean {
  switch (key) {
    case 'Escape':
    case 'x':
    case 'X':
    case 'q':
    case 'Q':
      closeMenu();
      return true;
    case 'ArrowUp':
    case 'w':
    case 'W':
      moveMenuSelection('up');
      return true;
    case 'ArrowDown':
    case 's':
    case 'S':
      moveMenuSelection('down');
      return true;
    case 'Enter':
    case ' ':
    case 'z':
    case 'Z':
      activateMenuSelection();
      return true;
    default:
      // The menu is modal: every other key is swallowed.
      return true;
  }
}

function handleNavigation(direction: NavigationDirection) {
  if (!isConsoleInteractive()) return;

  if (state.currentTab === 0) {
    const links = getLinks();
    const isWrap =
      (direction === 'up' && state.currentIndex === 0) ||
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
  if (!isConsoleInteractive()) return;
  activateSelectedLink();
}

export function switchTab(direction: TabDirection) {
  if (!isConsoleInteractive()) return;

  state.currentTab = getNextTab(state.currentTab, state.numTabs, direction);

  SoundEngine.switch();
  resetScreenScroll();
  updateTabUI();

  if (state.currentTab === 0) {
    setTimeout(() => updateActiveLink(state.currentIndex), FRAME_DURATION * 3);
  }
}

export function switchToTab(index: number) {
  if (!isConsoleInteractive()) return;
  if (index < 0 || index >= state.numTabs || index === state.currentTab) return;

  state.currentTab = index;
  SoundEngine.switch();
  resetScreenScroll();
  updateTabUI();

  if (state.currentTab === 0) {
    setTimeout(() => updateActiveLink(state.currentIndex), FRAME_DURATION * 3);
  }
}

export function initNavigation() {
  const whenInteractive = (action: () => void) => () => {
    if (!isConsoleInteractive()) return;
    action();
  };

  document.addEventListener('keyup', (e) => {
    toggleButtonState(e.key, false);
  });

  window.addEventListener('blur', clearPressedStates);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearPressedStates();
  });

  document.querySelectorAll('.tab-indicator').forEach((tab, index) => {
    tab.addEventListener(
      'click',
      whenInteractive(() => switchToTab(index)),
    );
  });

  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (isTypingTarget(target) || e.isComposing || e.metaKey) return;

    // The pause menu is modal: it owns every key while open.
    if (state.menuOpen) {
      e.preventDefault();
      handleMenuKey(e.key);
      return;
    }

    if (e.key === 'Escape') {
      if (!isConsoleInteractive()) return;
      e.preventDefault();
      toggleMenu();
      return;
    }

    if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (!isConsoleInteractive()) return;
      e.preventDefault();
      switchToTab(2);
      return;
    }

    if (!e.repeat && isConsoleInteractive()) toggleButtonState(e.key, true);

    // Delegate D-pad / A-button to Snake when the game owns them.
    // While the snake is NOT actively running, L/R fall through to the
    // normal tab switching below so players can always leave the Snake tab.
    if (state.currentTab === 3) {
      const dirKeys = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'w',
        'W',
        'a',
        'A',
        's',
        'S',
        'd',
        'D',
      ];
      if (dirKeys.includes(e.key)) {
        if (state.snakePlaying) {
          e.preventDefault();
          document.dispatchEvent(new CustomEvent('snake-direction', { detail: { key: e.key } }));
          return;
        }
      } else if (['Enter', ' ', 'z', 'Z'].includes(e.key)) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('snake-action'));
        return;
      }
    }

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        handleNavigation('up');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        handleNavigation('down');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        switchTab('left');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        switchTab('right');
        break;
      case 'Enter':
      case ' ':
      case 'z':
      case 'Z':
        e.preventDefault();
        handleSelection();
        break;
      case 'x':
      case 'X':
        if (!e.ctrlKey && !e.altKey && !e.metaKey && isConsoleInteractive()) {
          e.preventDefault();
          handleThemeSwitch();
        }
        break;
      case 'q':
      case 'Q':
        if (!e.ctrlKey && !e.altKey && !e.metaKey && isConsoleInteractive()) {
          e.preventDefault();
          handleThemeSwitchBack();
        }
        break;
      case 'o':
      case 'O':
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          toggleTurnLayout();
        }
        break;
    }
  });

  bindPressAction(
    document.getElementById('up'),
    whenInteractive(() => {
      if (state.menuOpen) {
        moveMenuSelection('up');
        return;
      }
      if (state.currentTab === 3 && state.snakePlaying) {
        document.dispatchEvent(new CustomEvent('snake-direction', { detail: { key: 'ArrowUp' } }));
        return;
      }
      handleNavigation('up');
    }),
  );
  bindPressAction(
    document.getElementById('down'),
    whenInteractive(() => {
      if (state.menuOpen) {
        moveMenuSelection('down');
        return;
      }
      if (state.currentTab === 3 && state.snakePlaying) {
        document.dispatchEvent(
          new CustomEvent('snake-direction', { detail: { key: 'ArrowDown' } }),
        );
        return;
      }
      handleNavigation('down');
    }),
  );
  bindPressAction(
    document.getElementById('left'),
    whenInteractive(() => {
      if (state.menuOpen) return; // modal: swallowed
      if (state.currentTab === 3 && state.snakePlaying) {
        document.dispatchEvent(
          new CustomEvent('snake-direction', { detail: { key: 'ArrowLeft' } }),
        );
        return;
      }
      switchTab('left');
    }),
  );
  bindPressAction(
    document.getElementById('right'),
    whenInteractive(() => {
      if (state.menuOpen) return; // modal: swallowed
      if (state.currentTab === 3 && state.snakePlaying) {
        document.dispatchEvent(
          new CustomEvent('snake-direction', { detail: { key: 'ArrowRight' } }),
        );
        return;
      }
      switchTab('right');
    }),
  );
  bindPressAction(
    document.getElementById('btn-a'),
    whenInteractive(() => {
      if (state.menuOpen) {
        activateMenuSelection();
        return;
      }
      if (state.currentTab === 3) {
        document.dispatchEvent(new CustomEvent('snake-action'));
        return;
      }
      handleSelection();
    }),
  );
  bindPressAction(
    document.getElementById('btn-b'),
    whenInteractive(() => {
      if (state.menuOpen) {
        closeMenu();
        return;
      }
      handleThemeSwitch();
    }),
  );
  bindPressAction(
    document.getElementById('btn-select'),
    whenInteractive(() => {
      if (state.menuOpen) {
        closeMenu();
        return;
      }
      handleThemeSwitchBack();
    }),
  );
  bindPressAction(document.getElementById('btn-start'), whenInteractive(toggleMenu));
  bindTouchAction(document.getElementById('btn-turn'), toggleTurnLayout);

  const linksContainer = document.querySelector('.links');
  if (linksContainer) {
    linksContainer.addEventListener('mouseover', (e) => {
      const index = getHoveredLinkIndex(e.target);
      if (index !== null && state.currentTab === 0 && isConsoleInteractive()) {
        updateActiveLink(index, false, true);
      }
    });
  }

  let accumulatedDelta = 0;
  let wheelTimeout: ReturnType<typeof setTimeout>;
  const LINK_SCROLL_THRESHOLD = 30;

  document.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey || !isConsoleInteractive() || state.menuOpen) return;

      if (state.currentTab === 3) return;

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
    },
    { passive: false },
  );
}
