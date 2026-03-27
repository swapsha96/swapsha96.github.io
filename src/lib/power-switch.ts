import { FRAME_DURATION } from './constants';
import { state } from './state';
import { SoundEngine } from './sound-engine';
import { switchToTab, updateActiveLink } from './navigation';

export function initPowerSwitch() {
    const switchTrack = document.getElementById('power-switch');
    const consoleBody = document.querySelector('.console');
    const screenDisplay = document.querySelector('.screen-display') as HTMLElement | null;

    let isPoweredOn = true;

    if (!switchTrack || !consoleBody) return;

    const togglePower = () => {
        isPoweredOn = !isPoweredOn;

        switchTrack.setAttribute('aria-checked', String(isPoweredOn));
        const bootScreen = document.getElementById('boot-screen');
        const topHud = document.getElementById('top-hud') as HTMLElement | null;

        if (isPoweredOn) {
            consoleBody.classList.remove('console-off');
            SoundEngine.playClick();

            if (bootScreen) bootScreen.classList.add('active');
            if (topHud) topHud.style.opacity = '0';

            setTimeout(() => {
                if (!isPoweredOn) return;
                SoundEngine.playTone(600, 'sine', (FRAME_DURATION * 24) / 1000);
                if (bootScreen) bootScreen.classList.remove('active');
                if (topHud) topHud.style.opacity = '1';
            }, 3500);

            if (screenDisplay) {
                screenDisplay.style.animation = 'none';
                screenDisplay.offsetHeight; /* trigger reflow */
                screenDisplay.style.animation = 'turnOn 0.3s ease-out';
            }

            document.title = "Hey!";
        } else {
            SoundEngine.playClick();
            SoundEngine.playTone(50, 'square', (FRAME_DURATION * 18) / 1000, 0.2);

            consoleBody.classList.add('console-off');
            document.title = "OFF";

            if (bootScreen) bootScreen.classList.remove('active');
            if (topHud) topHud.style.opacity = '1';

            setTimeout(() => {
                if (state.currentTab !== 0) {
                    switchToTab(0);
                }
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
        const isTypingTarget = target && (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        );

        if (isTypingTarget || e.metaKey || e.ctrlKey || e.altKey) return;

        if (e.key === 'p' || e.key === 'P') {
            e.preventDefault();
            togglePower();
        }
    });
}
