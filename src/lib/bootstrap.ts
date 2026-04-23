import { initExtras } from './extras';
import { initHudClock } from './hud-clock';
import { initNavigation, updateTabUI } from './navigation';
import { initPageVisibilityFeedback } from './page-visibility';
import { initPowerSwitch } from './power-switch';
import { updateMuteIcon } from './sound-engine';
import { initTheme } from './theme-manager';

export function bootstrapApp() {
  initExtras();
  initPowerSwitch();
  updateMuteIcon();
  initTheme();
  initPageVisibilityFeedback();
  initNavigation();
  updateTabUI();
  initHudClock();
}
