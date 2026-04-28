import { FRAME_DURATION } from './constants';
import { state } from './state';
import { SoundEngine } from './sound-engine';
import { updateActiveLink, updateTabUI } from './navigation';

const BOOT_DURATION_MS = 3500;

export function initPowerSwitch() {
  const switchTrack = document.getElementById('power-switch');
  const consoleBody = document.querySelector('.console');
  const screenDisplay = document.querySelector('.screen-display') as HTMLElement | null;

  if (!switchTrack || !consoleBody) return;

  let bootTimeout: ReturnType<typeof setTimeout> | null = null;
  let bootSequenceId = 0;

  const interactiveButtons = document.querySelectorAll<HTMLButtonElement>(
    '.dpad-btn, .action-buttons button, .meta-controls button, .tab-indicator',
  );

  const setControlsInteractive = (isInteractive: boolean) => {
    const isBusy = !isInteractive && state.isPoweredOn;

    consoleBody.classList.toggle('console-booting', isBusy);
    consoleBody.setAttribute('aria-busy', String(isBusy));

    interactiveButtons.forEach((button) => {
      button.disabled = !isInteractive;
      button.setAttribute('aria-disabled', String(!isInteractive));
    });

    if (screenDisplay) {
      screenDisplay.toggleAttribute('inert', !isInteractive);
      screenDisplay.setAttribute('aria-busy', String(isBusy));
    }
  };

  const clearPendingBoot = () => {
    if (bootTimeout) {
      clearTimeout(bootTimeout);
      bootTimeout = null;
    }
    bootSequenceId += 1;
  };

  const togglePower = () => {
    state.isPoweredOn = !state.isPoweredOn;

    switchTrack.setAttribute('aria-checked', String(state.isPoweredOn));
    const bootScreen = document.getElementById('boot-screen');
    const topHud = document.getElementById('top-hud') as HTMLElement | null;

    clearPendingBoot();

    if (state.isPoweredOn) {
      state.isBooting = true;
      setControlsInteractive(false);
      consoleBody.classList.remove('console-off');
      SoundEngine.playClick();

      if (bootScreen) bootScreen.classList.add('active');
      if (topHud) topHud.style.opacity = '0';

      const currentBootSequenceId = bootSequenceId;
      bootTimeout = setTimeout(() => {
        if (!state.isPoweredOn || currentBootSequenceId !== bootSequenceId) return;

        state.isBooting = false;
        setControlsInteractive(true);
        SoundEngine.playTone(600, 'sine', (FRAME_DURATION * 24) / 1000);
        if (bootScreen) bootScreen.classList.remove('active');
        if (topHud) topHud.style.opacity = '1';
        bootTimeout = null;
      }, BOOT_DURATION_MS);

      if (screenDisplay) {
        screenDisplay.style.animation = 'none';
        screenDisplay.offsetHeight; /* trigger reflow */
        screenDisplay.style.animation = 'turnOn 0.3s ease-out';
      }

      document.title = 'Hey!';
    } else {
      state.isBooting = false;
      setControlsInteractive(false);
      SoundEngine.playClick();
      SoundEngine.playTone(50, 'square', (FRAME_DURATION * 18) / 1000, 0.2);

      consoleBody.classList.add('console-off');
      document.title = 'OFF';

      if (bootScreen) bootScreen.classList.remove('active');
      if (topHud) topHud.style.opacity = '1';

      setTimeout(() => {
        state.currentTab = 0;
        updateTabUI();
        state.currentIndex = 0;
        updateActiveLink(0);
        if (screenDisplay) {
          screenDisplay.scrollTo({ top: 0, behavior: 'auto' });
        }
      }, 100);
    }
  };

  switchTrack.addEventListener('click', togglePower);

  switchTrack.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePower();
    }
  });

  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    const isTypingTarget =
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

    if (isTypingTarget || e.metaKey || e.ctrlKey || e.altKey) return;

    if ((e.key === 'p' || e.key === 'P') && state.currentTab !== 3) {
      e.preventDefault();
      togglePower();
    }
  });
}
