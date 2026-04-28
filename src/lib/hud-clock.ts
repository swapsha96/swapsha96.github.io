import { FRAME_DURATION } from './constants';

let hudClockInterval: ReturnType<typeof setInterval> | undefined;

export function initHudClock() {
  const timeEl = document.getElementById('hud-time');
  const dateEl = document.getElementById('hud-date');
  if (!timeEl || !dateEl) return;

  const updateHudClock = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const dateStr = now
      .toLocaleDateString([], {
        day: '2-digit',
        month: 'short',
      })
      .toUpperCase();

    timeEl.textContent = timeStr;
    dateEl.textContent = dateStr;
  };

  updateHudClock();
  if (hudClockInterval) clearInterval(hudClockInterval);
  hudClockInterval = setInterval(updateHudClock, FRAME_DURATION * 60);
}
