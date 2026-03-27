import { updateMuteIcon } from './sound-engine';
import { initTheme } from './theme-manager';
import { initHudClock } from './hud-clock';
import { initNavigation, updateTabUI } from './navigation';
import { initExtras } from './extras';
import { initPowerSwitch } from './power-switch';

document.addEventListener('DOMContentLoaded', () => {
    initExtras();
    initPowerSwitch();
    updateMuteIcon();

    initTheme();

    const originalTitle = document.title;
    const setFavicon = (emoji: string) => {
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
        link.type = 'image/svg+xml';
        link.rel = 'icon';
        link.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`;
        document.getElementsByTagName('head')[0].appendChild(link);
    };

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.title = "Where'd you go?";
            setFavicon('🤔');
        } else {
            document.title = originalTitle;
            setFavicon('👋');
        }
    });

    initNavigation();
    updateTabUI();
    initHudClock();
});
