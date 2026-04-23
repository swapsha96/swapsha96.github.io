import { initBatteryIndicator } from './extras-battery';
import { checkKonamiStep, initKonamiCode } from './extras-konami';
import { initMuteShortcut } from './extras-mute';
import { initStartOverlay } from './extras-overlay';

export { checkKonamiStep };

export function initExtras() {
  initStartOverlay();
  initKonamiCode();
  initMuteShortcut();
  initBatteryIndicator();
}
