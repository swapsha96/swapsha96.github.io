import { FRAME_DURATION } from './constants';
import { SoundEngine } from './sound-engine';

let typeWriterInterval: ReturnType<typeof setInterval> | undefined;
let typeWriterIdx = 0;
let isTyping = false;

export function startTypewriter() {
  const container = document.getElementById('about-text-content') as HTMLElement | null;
  if (!container || container.dataset.typed === 'true') return;

  const aboutTextVal = container.getAttribute('data-text') || '';

  container.innerHTML = '';
  typeWriterIdx = 0;

  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.textContent = '|';
  container.appendChild(cursor);

  if (isTyping) clearInterval(typeWriterInterval);
  isTyping = true;

  typeWriterInterval = setInterval(() => {
    if (typeWriterIdx < aboutTextVal.length) {
      const char = aboutTextVal.charAt(typeWriterIdx);

      if (char === '\\n' || char.match(/[\r\n]/)) {
        container.insertBefore(document.createElement('br'), cursor);
      } else {
        const textNode = document.createTextNode(char);
        container.insertBefore(textNode, cursor);
      }

      if (typeWriterIdx % 3 === 0) SoundEngine.playTone(1200, 'sine', 0.03, 0.02);

      typeWriterIdx++;
    } else {
      clearInterval(typeWriterInterval);
      isTyping = false;
      container.dataset.typed = 'true';
    }
  }, FRAME_DURATION);
}

export function stopTypewriter() {
  if (isTyping) {
    clearInterval(typeWriterInterval);
    isTyping = false;
  }
}
