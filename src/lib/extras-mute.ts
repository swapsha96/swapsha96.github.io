import { SoundEngine } from './sound-engine';
import { isConsolePoweredOn } from './state';

export function initMuteShortcut() {
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm' && isConsolePoweredOn()) {
      SoundEngine.toggleMute();
    }
  });
}
