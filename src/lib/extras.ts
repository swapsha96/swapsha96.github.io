import { FRAME_DURATION } from './constants';
import { SoundEngine } from './sound-engine';

const konamiCode = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'x', 'z'
];

/** Pure function for testing: checks if a key matches the expected konami step. */
export function checkKonamiStep(key: string, expectedIndex: number, code: string[]): boolean {
    const lowerKey = key.toLowerCase();
    const expected = code[expectedIndex].toLowerCase();

    if (lowerKey === expected) return true;

    // Handle explicit B/A regardless of mapping
    if (expectedIndex === 8 && lowerKey === 'b') return true;
    if (expectedIndex === 9 && (lowerKey === 'a' || lowerKey === 'enter')) return true;

    return false;
}

function activateMatrixMode() {
    const screen = document.getElementById('main-screen');
    if (screen) {
        screen.style.filter = "invert(1) hue-rotate(180deg)";
        setTimeout(() => {
            screen.style.filter = "";
        }, FRAME_DURATION * 300);
    }
}

export function initExtras() {
    // 1. Start Screen Overlay
    const overlay = document.getElementById('start-overlay');

    const unlockAudio = () => {
        SoundEngine.init();
    };

    if (overlay) {
        let dismissed = false;
        const dismissOverlay = (e: Event) => {
            if (dismissed) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            dismissed = true;
            overlay.style.display = 'none';
            unlockAudio();
            document.removeEventListener('keydown', dismissOverlay);
            document.removeEventListener('click', dismissOverlay);
            document.removeEventListener('touchstart', dismissOverlay);
        };

        document.addEventListener('keydown', dismissOverlay);
        document.addEventListener('click', dismissOverlay);
        document.addEventListener('touchstart', dismissOverlay);
    }

    // 2. Konami Code
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        if (checkKonamiStep(e.key, konamiIndex, konamiCode)) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateMatrixMode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }

        // Mute Toggle
        if (key === 'm') {
            SoundEngine.toggleMute();
        }
    });

    // 3. Battery Indicator
    const level = document.getElementById('battery-level') as HTMLElement | null;
    if (level && 'getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
            const updateBattery = () => {
                level.style.width = `${battery.level * 100}%`;
                if (battery.charging) {
                    level.classList.add('charging');
                    level.style.backgroundColor = 'var(--screen-text)';
                } else {
                    level.classList.remove('charging');
                    if (battery.level < 0.2) level.style.backgroundColor = '#ff0055';
                    else if (battery.level < 0.5) level.style.backgroundColor = '#ffff00';
                    else level.style.backgroundColor = 'var(--screen-text)';
                }
            };
            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);
        }).catch(() => {
            level.style.width = '85%';
            level.style.backgroundColor = 'var(--screen-text)';
        });
    } else if (level) {
        level.style.width = '85%';
        level.style.backgroundColor = 'var(--screen-text)';
    }
}
