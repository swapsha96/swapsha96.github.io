import { SoundEngine } from './sound-engine';

export function initStartOverlay() {
  const overlay = document.getElementById('start-overlay');
  if (!overlay) return;

  let dismissed = false;

  const dismissOverlay = (e: Event) => {
    if (dismissed) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    dismissed = true;
    overlay.style.display = 'none';
    SoundEngine.init();

    document.removeEventListener('keydown', dismissOverlay);
    document.removeEventListener('click', dismissOverlay);
    document.removeEventListener('touchstart', dismissOverlay);
  };

  document.addEventListener('keydown', dismissOverlay);
  document.addEventListener('click', dismissOverlay);
  document.addEventListener('touchstart', dismissOverlay);
}
