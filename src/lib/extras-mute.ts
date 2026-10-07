import { SoundEngine } from './sound-engine';
import { isConsolePoweredOn, state } from './state';

export function initMuteShortcut() {
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm' && isConsolePoweredOn() && !state.menuOpen) {
      SoundEngine.toggleMute();
    }
  });
}
