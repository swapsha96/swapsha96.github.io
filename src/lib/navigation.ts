import { FRAME_DURATION } from './constants';
import { state, getScrollBehavior } from './state';
import { SoundEngine } from './sound-engine';
import { startTypewriter, stopTypewriter } from './typewriter';
import { handleThemeSwitch } from './theme-manager';

/** Pure function for testing: returns the next index with wrapping. */
export function getNextIndex(current: number, length: number, direction: 'up' | 'down'): number {
    if (direction === 'up') {
        return current === 0 ? length - 1 : current - 1;
    }
    return current === length - 1 ? 0 : current + 1;
}

/** Pure function for testing: returns the next tab with wrapping. */
export function getNextTab(current: number, numTabs: number, direction: 'left' | 'right'): number {
    if (direction === 'left') {
        return (current - 1 + numTabs) % numTabs;
    }
    return (current + 1) % numTabs;
}

export function updateTabUI() {
    document.querySelectorAll('.tab-indicator').forEach((indicator, index) => {
        const isActive = index === state.currentTab;
        indicator.classList.toggle('active', isActive);
        indicator.setAttribute('aria-selected', String(isActive));
        (indicator as HTMLElement).tabIndex = isActive ? 0 : -1;
    });

    document.querySelectorAll('.tab-content').forEach((content, index) => {
        const isActive = index === state.currentTab;
        content.classList.toggle('active', isActive);
        (content as HTMLElement).hidden = !isActive;

        if (index === 1) {
            if (isActive) startTypewriter();
            else stopTypewriter();
        }
    });
}

export function updateActiveLink(index: number, isWrap = false, isMouseHover = false) {
    const links = document.querySelectorAll('.social-link');
    links.forEach(link => link.classList.remove('active'));

    if (links[index]) {
        if (!isMouseHover) {
            SoundEngine.playTone(440 + (index * 20), 'sine', 0.1, 0.05);
        }

        links[index].classList.add('active');

        if (state.currentTab === 0) {
            const screen = document.getElementById('main-screen');
            const scrollStyle = isWrap ? 'auto' : getScrollBehavior();

            if (index === 0) {
                if (screen) screen.scrollTo({ top: 0, behavior: scrollStyle });
            } else if (index === links.length - 1) {
                if (screen) screen.scrollTo({ top: screen.scrollHeight, behavior: scrollStyle });
            } else {
                links[index].scrollIntoView({ behavior: scrollStyle, block: 'nearest' });
            }
        }

        state.currentIndex = index;
    }
}

function handleNavigation(direction: 'up' | 'down') {
    if (state.currentTab === 0) {
        const links = document.querySelectorAll('.social-link');
        const isWrap = (direction === 'up' && state.currentIndex === 0) ||
                       (direction === 'down' && state.currentIndex === links.length - 1);
        state.currentIndex = getNextIndex(state.currentIndex, links.length, direction);
        updateActiveLink(state.currentIndex, isWrap);
    } else if (state.currentTab === 1 || state.currentTab === 2) {
        const screen = document.getElementById('main-screen');
        const scrollAmount = 50;
        if (screen) {
            if (direction === 'up') {
                screen.scrollBy({ top: -scrollAmount, behavior: getScrollBehavior() });
            } else if (direction === 'down') {
                screen.scrollBy({ top: scrollAmount, behavior: getScrollBehavior() });
            }
        }
    }
}

function handleSelection() {
    if (state.currentTab !== 0) return;

    const links = document.querySelectorAll('.social-link');
    if (links[state.currentIndex]) {
        (links[state.currentIndex] as HTMLElement).click();

        links[state.currentIndex].classList.add('pressed');
        setTimeout(() => links[state.currentIndex].classList.remove('pressed'), FRAME_DURATION * 8);

        SoundEngine.select();
    }
}

export function switchTab(direction: 'left' | 'right') {
    state.currentTab = getNextTab(state.currentTab, state.numTabs, direction);

    SoundEngine.switch();

    const screen = document.getElementById('main-screen');
    if (screen) {
        screen.scrollTo({ top: 0, behavior: 'auto' });
    }

    updateTabUI();

    if (state.currentTab === 0) {
        setTimeout(() => updateActiveLink(state.currentIndex), FRAME_DURATION * 3);
    }
}

export function switchToTab(index: number) {
    if (index < 0 || index >= state.numTabs || index === state.currentTab) return;

    state.currentTab = index;
    SoundEngine.switch();
    updateTabUI();
}

export function initNavigation() {
    const keyMap: Record<string, string> = {
        'ArrowUp': 'up', 'w': 'up', 'W': 'up',
        'ArrowDown': 'down', 's': 'down', 'S': 'down',
        'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
        'ArrowRight': 'right', 'd': 'right', 'D': 'right',
        'Enter': 'btn-a', ' ': 'btn-a', 'z': 'btn-a', 'Z': 'btn-a',
        'x': 'btn-b', 'X': 'btn-b',
        'q': 'btn-select', 'Q': 'btn-select'
    };

    const toggleButtonState = (key: string, isPressed: boolean) => {
        const btnId = keyMap[key];
        if (btnId) {
            const btn = document.getElementById(btnId);
            if (btn) {
                if (isPressed) btn.classList.add('pressed');
                else btn.classList.remove('pressed');
            }
        }
    };

    const animatePress = (btn: HTMLElement | null, duration = FRAME_DURATION * 5) => {
        if (!btn) return;
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), duration);
    };

    const toggleTurn = () => {
        const btnTurn = document.getElementById('btn-turn');
        const consoleEl = document.querySelector('.console');

        if (btnTurn) animatePress(btnTurn);
        SoundEngine.playTone(880, 'sawtooth', (FRAME_DURATION * 6) / 1000, 0.1);

        const performSwitch = () => {
            if (consoleEl) consoleEl.classList.toggle('landscape');
        };

        if ((document as any).startViewTransition) {
            (document as any).startViewTransition(performSwitch);
        } else {
            performSwitch();
        }

        setTimeout(() => SoundEngine.playTone(440, 'triangle', (FRAME_DURATION * 30) / 1000, 0.1), FRAME_DURATION * 6);
    };

    document.addEventListener('keyup', (e) => {
        toggleButtonState(e.key, false);
    });

    const clearPressedStates = () => {
        document.querySelectorAll('.pressed').forEach(el => el.classList.remove('pressed'));
    };

    window.addEventListener('blur', clearPressedStates);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearPressedStates();
    });

    document.querySelectorAll('.tab-indicator').forEach((tab, index) => {
        tab.addEventListener('click', () => switchToTab(index));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const target = e.target as HTMLElement;
        const isTypingTarget = target && (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        );

        if (isTypingTarget || e.isComposing || e.metaKey) return;

        if (e.key === 'h' || e.key === 'H') {
            if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                switchToTab(2);
                return;
            }
        }

        if (!e.repeat) toggleButtonState(e.key, true);

        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W':
                e.preventDefault();
                handleNavigation('up');
                break;
            case 'ArrowDown': case 's': case 'S':
                e.preventDefault();
                handleNavigation('down');
                break;
            case 'ArrowLeft': case 'a': case 'A':
                e.preventDefault();
                switchTab('left');
                break;
            case 'ArrowRight': case 'd': case 'D':
                e.preventDefault();
                switchTab('right');
                break;
            case 'Enter': case ' ': case 'z': case 'Z':
                e.preventDefault();
                handleSelection();
                break;
            case 'x': case 'X':
                if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    handleThemeSwitch();
                }
                break;
            case 'q': case 'Q':
                if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    handleThemeSwitch();
                }
                break;
            case 'o': case 'O':
                if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    toggleTurn();
                }
                break;
        }
    });

    // Touch/Click navigation
    const btnUp = document.getElementById('up');
    const btnDown = document.getElementById('down');
    const btnLeft = document.getElementById('left');
    const btnRight = document.getElementById('right');
    const btnA = document.getElementById('btn-a');
    const btnB = document.getElementById('btn-b');
    const btnSelect = document.getElementById('btn-select');
    const btnStart = document.getElementById('btn-start');

    if (btnUp) {
        btnUp.addEventListener('click', () => { animatePress(btnUp); handleNavigation('up'); });
        btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); animatePress(btnUp); handleNavigation('up'); });
    }
    if (btnDown) {
        btnDown.addEventListener('click', () => { animatePress(btnDown); handleNavigation('down'); });
        btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); animatePress(btnDown); handleNavigation('down'); });
    }
    if (btnLeft) {
        btnLeft.addEventListener('click', () => { animatePress(btnLeft); switchTab('left'); });
        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); animatePress(btnLeft); switchTab('left'); });
    }
    if (btnRight) {
        btnRight.addEventListener('click', () => { animatePress(btnRight); switchTab('right'); });
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); animatePress(btnRight); switchTab('right'); });
    }
    if (btnA) {
        btnA.addEventListener('click', () => { animatePress(btnA); handleSelection(); });
        btnA.addEventListener('touchstart', (e) => { e.preventDefault(); animatePress(btnA); handleSelection(); });
    }
    if (btnStart) {
        btnStart.addEventListener('click', () => { animatePress(btnStart); switchToTab(2); });
        btnStart.addEventListener('touchstart', (e) => { e.preventDefault(); animatePress(btnStart); switchToTab(2); });
    }
    if (btnB) {
        btnB.addEventListener('click', () => { animatePress(btnB); handleThemeSwitch(); });
        btnB.addEventListener('touchstart', (e) => { e.preventDefault(); animatePress(btnB); handleThemeSwitch(); });
    }
    if (btnSelect) {
        btnSelect.addEventListener('click', () => { animatePress(btnSelect); handleThemeSwitch(); });
        btnSelect.addEventListener('touchstart', (e) => { e.preventDefault(); animatePress(btnSelect); handleThemeSwitch(); });
    }

    const btnTurn = document.getElementById('btn-turn');
    if (btnTurn) {
        btnTurn.addEventListener('click', toggleTurn);
        btnTurn.addEventListener('touchstart', (e) => { e.preventDefault(); toggleTurn(); });
    }

    // Mouse hover
    const linksContainer = document.querySelector('.links');
    if (linksContainer) {
        linksContainer.addEventListener('mouseover', (e) => {
            const link = (e.target as HTMLElement).closest('.social-link');
            if (link) {
                const index = parseInt(link.getAttribute('data-index') || '');
                if (!isNaN(index) && state.currentTab === 0) {
                    updateActiveLink(index, false, true);
                }
            }
        });
    }

    // Mouse wheel
    let accumulatedDelta = 0;
    let wheelTimeout: ReturnType<typeof setTimeout>;
    const LINK_SCROLL_THRESHOLD = 30;

    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return;
        e.preventDefault();

        if (state.currentTab === 1 || state.currentTab === 2) {
            const screen = document.getElementById('main-screen');
            if (screen) {
                screen.scrollBy({ top: e.deltaY, behavior: 'auto' });
            }
        } else {
            accumulatedDelta += e.deltaY;
            if (Math.abs(accumulatedDelta) > LINK_SCROLL_THRESHOLD) {
                if (accumulatedDelta > 0) handleNavigation('down');
                else handleNavigation('up');
                accumulatedDelta = 0;
            }
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => { accumulatedDelta = 0; }, 100);
        }
    }, { passive: false });
}
