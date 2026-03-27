import { FRAME_DURATION } from './constants';
import { SoundEngine } from './sound-engine';

export const themes = [
    'theme-atomic', 'theme-berry', 'theme-ice', 'theme-jungle',
    'theme-classic', 'theme-sunblaze', 'theme-cyberpunk', 'theme-midnight'
];

let currentThemeIndex = (() => {
    try {
        const saved = localStorage.getItem('gb_theme');
        if (saved && themes.includes(saved)) return themes.indexOf(saved);
    } catch (e) {}
    return Math.floor(Math.random() * themes.length);
})();

/** Pure function for testing: returns the next theme index with wrapping. */
export function getNextThemeIndex(current: number, themeList: string[]): number {
    return (current + 1) % themeList.length;
}

export function initTheme() {
    document.body.classList.add(themes[currentThemeIndex]);
}

export function handleThemeSwitch() {
    SoundEngine.playTone(200, 'triangle', (FRAME_DURATION * 12) / 1000, 0.05);

    currentThemeIndex = getNextThemeIndex(currentThemeIndex, themes);

    try {
        localStorage.setItem('gb_theme', themes[currentThemeIndex]);
    } catch (e) {}

    document.body.classList.remove(...themes);
    document.body.classList.add(themes[currentThemeIndex]);

    const screen = document.getElementById('main-screen');
    if (screen) {
        screen.style.opacity = '0.8';
        setTimeout(() => screen.style.opacity = '1', FRAME_DURATION * 6);
    }
}
