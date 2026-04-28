import { FRAME_DURATION } from './constants';
import { isConsolePoweredOn } from './state';

export const konamiCode = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'x',
  'z',
] as const;

/** Pure function for testing: checks if a key matches the expected konami step. */
export function checkKonamiStep(
  key: string,
  expectedIndex: number,
  code: readonly string[],
): boolean {
  const lowerKey = key.toLowerCase();
  const expected = code[expectedIndex].toLowerCase();

  if (lowerKey === expected) return true;

  if (expectedIndex === 8 && lowerKey === 'b') return true;
  if (expectedIndex === 9 && (lowerKey === 'a' || lowerKey === 'enter')) return true;

  return false;
}

export function activateMatrixMode() {
  const screen = document.getElementById('main-screen');
  if (!screen) return;

  screen.style.filter = 'invert(1) hue-rotate(180deg)';
  setTimeout(() => {
    screen.style.filter = '';
  }, FRAME_DURATION * 300);
}

export function initKonamiCode() {
  let konamiIndex = 0;

  document.addEventListener('keydown', (e) => {
    if (!isConsolePoweredOn()) return;

    if (checkKonamiStep(e.key, konamiIndex, konamiCode)) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        activateMatrixMode();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}
