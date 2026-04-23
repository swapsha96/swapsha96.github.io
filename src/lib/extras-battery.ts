function applyFallbackBattery(level: HTMLElement) {
  level.style.width = '85%';
  level.style.backgroundColor = 'var(--screen-text)';
}

function updateBatteryDisplay(level: HTMLElement, battery: any) {
  level.style.width = `${battery.level * 100}%`;

  if (battery.charging) {
    level.classList.add('charging');
    level.style.backgroundColor = 'var(--screen-text)';
    return;
  }

  level.classList.remove('charging');
  if (battery.level < 0.2) level.style.backgroundColor = '#ff0055';
  else if (battery.level < 0.5) level.style.backgroundColor = '#ffff00';
  else level.style.backgroundColor = 'var(--screen-text)';
}

export function initBatteryIndicator() {
  const level = document.getElementById('battery-level') as HTMLElement | null;
  if (!level) return;

  if (!('getBattery' in navigator)) {
    applyFallbackBattery(level);
    return;
  }

  (navigator as any).getBattery().then((battery: any) => {
    const syncBattery = () => updateBatteryDisplay(level, battery);
    syncBattery();
    battery.addEventListener('levelchange', syncBattery);
    battery.addEventListener('chargingchange', syncBattery);
  }).catch(() => {
    applyFallbackBattery(level);
  });
}
