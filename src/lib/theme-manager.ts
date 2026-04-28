import { FRAME_DURATION } from './constants';
import { SoundEngine } from './sound-engine';
import { getStoredString, setStoredValue } from './storage';

const THEME_STORAGE_KEY = 'gb_theme';

export const themes = [
  'theme-atomic',
  'theme-berry',
  'theme-ice',
  'theme-jungle',
  'theme-classic',
  'theme-sunblaze',
  'theme-cyberpunk',
  'theme-midnight',
];

/** Pure function for testing: returns the next theme index with wrapping. */
export function getNextThemeIndex(current: number, themeList: string[]): number {
  return (current + 1) % themeList.length;
}

function getSavedTheme(): string | null {
  const savedTheme = getStoredString(THEME_STORAGE_KEY);
  return savedTheme && themes.includes(savedTheme) ? savedTheme : null;
}

function getInitialThemeIndex(): number {
  const savedTheme = getSavedTheme();
  if (savedTheme) return themes.indexOf(savedTheme);
  return Math.floor(Math.random() * themes.length);
}

function applyTheme(themeName: string) {
  document.body.classList.remove(...themes);
  document.body.classList.add(themeName);
}

function flashThemeTransition() {
  const screen = document.getElementById('main-screen');
  if (!screen) return;

  screen.style.opacity = '0.8';
  setTimeout(() => {
    screen.style.opacity = '1';
  }, FRAME_DURATION * 6);
}

let currentThemeIndex = getInitialThemeIndex();

export function initTheme() {
  applyTheme(themes[currentThemeIndex]);
}

export function handleThemeSwitch() {
  SoundEngine.playTone(200, 'triangle', (FRAME_DURATION * 12) / 1000, 0.05);

  currentThemeIndex = getNextThemeIndex(currentThemeIndex, themes);
  const nextTheme = themes[currentThemeIndex];

  setStoredValue(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
  flashThemeTransition();
}
