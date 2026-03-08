// --- Audio Engine ---
const SoundEngine = {
    ctx: null, // For SFX
    muted: false,
    
    init: function() {
        // Init SFX Context
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } else if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    
    toggleMute: function() {
        this.muted = !this.muted;
        return this.muted;
    },

    playTone: function(freq, type, duration, vol = 0.1) {
        if (!this.ctx || this.muted) return;
        
        // Ensure context is running (sometimes browsers suspend it)
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) { console.error('Audio error', e); }
    },
    
    hover: function() {
        // High-pitched blip
        this.playTone(440, 'sine', 0.1, 0.05);
    },
    
    select: function() {
        // Chime-like ding (Square wave)
        this.playTone(660, 'square', 0.1, 0.05);
        setTimeout(() => this.playTone(880, 'square', 0.2, 0.05), 100);
    },
    
    back: function() {
        // Low-pitched buzz
        this.playTone(150, 'sawtooth', 0.15, 0.05);
    },
    
    switch: function() {
        // Tab switch sound
        this.playTone(300, 'triangle', 0.1, 0.05);
    }
};


// Social media SVG icons
const icons = {
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    goodreads: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.43 23.995c-3.608-.208-6.274-2.077-6.448-5.078.695.007 1.375-.013 2.07-.006.224 1.342 1.065 2.43 2.683 3.026 1.558.496 3.085.393 4.571-.322 1.298-.768 1.914-1.795 2.15-3.219H16.4c-.023.278-.074.958-.106 1.09-1.284 2.088-3.587 3.226-6.117 3.226-.013 0-.026-.003-.04-.003-.353 0-.704-.016-1.053-.035l.346-18.68h2.07l-.03 5.59c.672-.804 1.604-1.378 2.768-1.572 1.463-.242 2.851.04 4.063.88 1.227.85 2.02 2.023 2.398 3.453.4 1.514.357 3.013-.173 4.47-.574 1.57-1.634 2.717-3.189 3.396-1.098.479-2.253.62-3.443.505-1.118-.108-2.109-.515-2.971-1.22-.013.01-.02.018-.028.028-.51.698-1.19 1.203-2.024 1.47-.83.26-1.68.28-2.526.082-1.234-.286-2.21-.936-2.86-2.028-.63-1.063-.804-2.211-.514-3.4.28-1.144.91-2.072 1.89-2.732.964-.65 2.033-.877 3.18-.688 1.13.186 2.07.707 2.772 1.58l.017-.025.03-5.595-2.07.018-.031 7.59c-.014.71-.245 1.262-.736 1.682-.49.42-1.086.612-1.783.574-.697-.038-1.273-.306-1.714-.791-.442-.486-.632-1.065-.58-1.775.06-.817.386-1.47.987-1.96.568-.463 1.227-.672 1.976-.623.6.039 1.105.232 1.534.597-.004-.043-.006-.082-.007-.123-.01-.173-.02-.345-.03-.517-.03-.535-.06-1.07-.09-1.605-.03-.535-.06-1.07-.089-1.603-.018-.313-.035-.627-.053-.94l-2.07.006.034 1.787c-.672-.91-1.578-1.466-2.768-1.628-1.24-.17-2.392.08-3.456.73-1.3.798-2.114 1.955-2.43 3.457-.346 1.647-.02 3.166.93 4.483.933 1.293 2.206 2.047 3.81 2.217z"/></svg>`,
    email: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>`,
    playstation: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.985 2.596v17.548l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.76.814.76 1.505v5.876c2.441 1.193 4.362-.002 4.362-3.153 0-3.237-1.126-4.675-4.438-5.827-1.307-.448-3.728-1.186-5.393-1.502zm5.728 15.029-9.732-3.326c-1.085-.353-1.231-.787-.326-1.001.83-.197 2.334-.149 3.433.197l4.556 1.621v-2.539l-.259-.091c-1.449-.494-2.983-.724-4.572-.624-2.072.16-4.036.781-4.036.781-2.129.738-2.386 1.787-1.129 2.604 1.109.712 3.018 1.248 5.328 1.536v2.842l1.607-.561s-3.236-1.164-4.418-1.6c-.96-.358-1.101-.788-.31-1.004.731-.199 2.074-.196 3.396.161l4.462 1.593v2.411z"/></svg>`
};

// Social links data
const socialLinks = [
    { name: 'Instagram', url: 'https://www.instagram.com/swapsha96', icon: 'instagram' },
    { name: 'Twitter', url: 'https://x.com/swapsha96', icon: 'twitter' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/swapsha96', icon: 'linkedin' },
    { name: 'Goodreads', url: 'https://www.goodreads.com/user/show/86722040-swapnil-sharma', icon: 'goodreads' },
    { name: 'PSN Profile', url: 'https://psnprofiles.com/swapsha96', icon: 'playstation' },
    { name: 'Email Me', url: 'mailto:swap.sha96@gmail.com', icon: 'email' }
];

// Color Themes
const themes = ['theme-atomic', 'theme-berry', 'theme-ice', 'theme-jungle', 'theme-classic'];
// Randomize start index
let currentThemeIndex = Math.floor(Math.random() * themes.length);

let currentIndex = 0;
let currentTab = 0; // 0 = Links, 1 = About
const numTabs = 3;
let hudClockInterval;

function initHudClock() {
    const timeEl = document.getElementById('hud-time');
    const dateEl = document.getElementById('hud-date');
    if (!timeEl || !dateEl) return;

    const updateHudClock = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const dateStr = now.toLocaleDateString([], {
            day: '2-digit',
            month: 'short'
        }).toUpperCase();

        timeEl.textContent = timeStr;
        dateEl.textContent = dateStr;
    };

    updateHudClock();
    if (hudClockInterval) clearInterval(hudClockInterval);
    hudClockInterval = setInterval(updateHudClock, 1000);
}

function switchTab(direction) {
    // Only switch if we have multiple tabs
    if (direction === 'left') {
        currentTab = (currentTab - 1 + numTabs) % numTabs;
    } else {
        currentTab = (currentTab + 1) % numTabs;
    }

    // Play sound
    SoundEngine.switch();

    // Reset scroll position of the main screen
    const screen = document.getElementById('main-screen');
    if (screen) {
        screen.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Update Tab Indicators
    document.querySelectorAll('.tab-indicator').forEach((indicator, index) => {
        if (index === currentTab) indicator.classList.add('active');
        else indicator.classList.remove('active');
    });

    // Update Tab Content
    document.querySelectorAll('.tab-content').forEach((content, index) => {
        if (index === currentTab) {
            content.classList.add('active');
            if (index === 1) startTypewriter();
        } else {
            content.classList.remove('active');
            if (index === 1) stopTypewriter();
        }
    });

    // If switching back to Links tab, ensure active link is visible
    if (currentTab === 0) {
        // Short delay to allow tab content to become visible
        setTimeout(() => updateActiveLink(currentIndex), 50);
    }
}

function switchToTab(index) {
    if (index < 0 || index >= numTabs || index === currentTab) return;

    const delta = index - currentTab;
    const direction = delta > 0 ? 'right' : 'left';
    for (let i = 0; i < Math.abs(delta); i++) switchTab(direction);
}

// Typewriter Effect Variables
let typeWriterInterval;
const aboutTextVal = "I love playing guitar, lifting weights, long drives, and video games. I like to believe I'm Batman, but I'm just an engineer who loves a good laugh. :-)";
let typeWriterIdx = 0;
let isTyping = false;

function startTypewriter() {
    const container = document.getElementById('about-text-content');
    if (!container || container.dataset.typed === 'true') return;
    
    // Clear initial content
    container.innerHTML = '';
    typeWriterIdx = 0;
    
    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '|'; // Visually explicit cursor
    container.appendChild(cursor);

    if (isTyping) clearInterval(typeWriterInterval);
    isTyping = true;

    typeWriterInterval = setInterval(() => {
        if (typeWriterIdx < aboutTextVal.length) {
            const char = aboutTextVal.charAt(typeWriterIdx);
            
            // Insert text before cursor
            const textNode = document.createTextNode(char);
            container.insertBefore(textNode, cursor);
            
            // Random tiny sound for typing (mechanical keyboard feel)
            if (typeWriterIdx % 3 === 0) SoundEngine.playTone(1200, 'sine', 0.03, 0.02);
            
            typeWriterIdx++;
        } else {
            clearInterval(typeWriterInterval);
            isTyping = false;
            container.dataset.typed = 'true'; // Mark as done so we don't re-type on every tab switch
            
            // Keep cursor blinking at end
        }
    }, 50); // Speed: 50ms per char
}



function stopTypewriter() {
    if (isTyping) {
        clearInterval(typeWriterInterval);
        isTyping = false;
    }
}

// Render social links
function renderSocialLinks() {
    const linksContainer = document.querySelector('.links');
    if (!linksContainer) return;
    
    // Ensure we're targeting the correct container inside the tab
    linksContainer.innerHTML = socialLinks.map((link, index) => `
        <a href="${link.url}" 
           target="${link.url.startsWith('mailto') ? '_self' : '_blank'}" 
           rel="noopener noreferrer" 
           class="social-link ${link.icon} ${index === 0 ? 'active' : ''}"
           data-index="${index}">
            ${icons[link.icon]}
            <span class="link-text">${link.name}</span>
        </a>
    `).join('');
}

function updateActiveLink(index) {
    const links = document.querySelectorAll('.social-link');
    links.forEach(link => link.classList.remove('active'));
    
    if (links[index]) {
        // Sound blip
        SoundEngine.playTone(440 + (index * 20), 'sine', 0.1, 0.05); // Increasing pitch for selection

        links[index].classList.add('active');
        
        // Ensure element is visible
        if (currentTab === 0) {
            const screen = document.getElementById('main-screen');
            if (index === 0) {
                // Scroll to top to show header
                if (screen) screen.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (index === links.length - 1) {
                // Scroll to bottom to show footer ("Made with <3")
                if (screen) screen.scrollTo({ top: screen.scrollHeight, behavior: 'smooth' });
            } else {
                // Normal scroll into view
                links[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        currentIndex = index;
    }
}

function handleNavigation(direction) {
    // Tab 0: Links navigation
    if (currentTab === 0) {
        const links = document.querySelectorAll('.social-link');
        if (direction === 'up' && currentIndex > 0) {
            currentIndex--;
            updateActiveLink(currentIndex);
        } else if (direction === 'down' && currentIndex < links.length - 1) {
            currentIndex++;
            updateActiveLink(currentIndex);
        }
    }
    // Tab 1 and 2: About / Help scroll
    else if (currentTab === 1 || currentTab === 2) {
        const screen = document.getElementById('main-screen');
        const scrollAmount = 50;
        
        if (screen) {
            if (direction === 'up') {
                screen.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
            } else if (direction === 'down') {
                screen.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            }
        }
    }
}

function handleSelection() {
    if (currentTab !== 0) return; // Only select links on tab 0

    const links = document.querySelectorAll('.social-link');
    if (links[currentIndex]) {
        // Trigger click event on the link
        links[currentIndex].click();
        
        // Add a visual 'pressed' effect
        links[currentIndex].classList.add('pressed');
        setTimeout(() => links[currentIndex].classList.remove('pressed'), 200);

        // Sound effect
        SoundEngine.select();
    }
}

function handleThemeSwitch() {
    // Sound effect
    SoundEngine.playTone(200, 'triangle', 0.2, 0.05);

    // Cycle to next theme
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    
    // Remove all theme classes
    document.body.classList.remove(...themes);
    
    // Add new theme class
    document.body.classList.add(themes[currentThemeIndex]);
    
    // Visual feedback (flash the screen slightly)
    const screen = document.getElementById('main-screen');
    if (screen) {
        screen.style.opacity = '0.8';
        setTimeout(() => screen.style.opacity = '1', 100);
    }
}

function initNavigation() {
    const keyMap = {
        'ArrowUp': 'up', 'w': 'up', 'W': 'up',
        'ArrowDown': 'down', 's': 'down', 'S': 'down',
        'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
        'ArrowRight': 'right', 'd': 'right', 'D': 'right',
        'Enter': 'btn-a', ' ': 'btn-a', 'z': 'btn-a', 'Z': 'btn-a',
        'x': 'btn-b', 'X': 'btn-b',
        'q': 'btn-select', 'Q': 'btn-select'
    };

    const toggleButtonState = (key, isPressed) => {
        const btnId = keyMap[key];
        if (btnId) {
            const btn = document.getElementById(btnId);
            if (btn) {
                if (isPressed) btn.classList.add('pressed');
                else btn.classList.remove('pressed');
            }
        }
    };

    const animatePress = (btn, duration = 120) => {
        if (!btn) return;
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), duration);
    };

    document.addEventListener('keyup', (e) => {
        toggleButtonState(e.key, false);
    });

    document.querySelectorAll('.tab-indicator').forEach((tab, index) => {
        tab.addEventListener('click', () => switchToTab(index));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'h' || e.key === 'H') {
            if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                switchToTab(2);
                return;
            }
        }

        if (!e.repeat) toggleButtonState(e.key, true);

        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                handleNavigation('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                handleNavigation('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                switchTab('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                switchTab('right');
                break;
            case 'Enter':
            case ' ': // Space - Select / A
            case 'z': // A button often mapped to Z
            case 'Z':
                e.preventDefault();
                handleSelection();
                break;
            case 'x': // B button often mapped to X
            case 'X':
                if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    handleThemeSwitch();
                }
                break;
            case 'q': // Select button mapped to Q
            case 'Q':
                if (!e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    handleThemeSwitch();
                }
                break;
        }
    });

    // Touch/Click navigation via console buttons
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

    // A Button: Open Page
    if (btnA) {
        btnA.addEventListener('click', () => { animatePress(btnA); handleSelection(); });
        btnA.addEventListener('touchstart', (e) => { e.preventDefault(); animatePress(btnA); handleSelection(); });
    }
    
    // Start Button: Open Help Tab
    if (btnStart) {
        btnStart.addEventListener('click', () => { animatePress(btnStart); switchToTab(2); });
        btnStart.addEventListener('touchstart', (e) => {
            e.preventDefault();
            animatePress(btnStart);
            switchToTab(2);
        });
    }

    // B Button: Switch Color
    if (btnB) {
        btnB.addEventListener('click', () => {
             animatePress(btnB);
             handleThemeSwitch();
        });
        btnB.addEventListener('touchstart', (e) => { 
            e.preventDefault(); 
            animatePress(btnB);
            handleThemeSwitch(); 
        });
    }

    // Select Button: Switch Color
    if (btnSelect) {
        btnSelect.addEventListener('click', () => { animatePress(btnSelect); handleThemeSwitch(); });
        btnSelect.addEventListener('touchstart', (e) => { e.preventDefault(); animatePress(btnSelect); handleThemeSwitch(); });
    }

    // Allow mouse hover to set active state too
    const linksContainer = document.querySelector('.links');
    if (linksContainer) {
        linksContainer.addEventListener('mouseover', (e) => {
            const link = e.target.closest('.social-link');
            if (link) {
                const index = parseInt(link.getAttribute('data-index'));
                if (!isNaN(index)) {
                    // Only update active link if using mouse on Links tab
                    if (currentTab === 0) {
                        updateActiveLink(index);
                    }
                }
            }
        });
    }
}

function initExtras() {
    // 1. Start Screen Overlay
    const overlay = document.getElementById('start-overlay');
    
    // Helper to request audio context (if added later)
    const unlockAudio = () => {
        SoundEngine.init();
    };

    if (overlay) {
        let dismissed = false;
        const dismissOverlay = (e) => {
             if (dismissed) return;
             
             // Prevent input from triggering game actions just this once
             e.preventDefault();
             e.stopImmediatePropagation();
             
             dismissed = true;
             overlay.style.transition = 'opacity 0.5s';
             overlay.style.opacity = '0';
             setTimeout(() => {
                 overlay.style.display = 'none';
                 // If we had a specific "Start Game" sound, play it here
             }, 500);
             
             unlockAudio();
             
             document.removeEventListener('keydown', dismissOverlay);
             document.removeEventListener('click', dismissOverlay);
             document.removeEventListener('touchstart', dismissOverlay);
        };
        
        document.addEventListener('keydown', dismissOverlay);
        document.addEventListener('click', dismissOverlay);
        document.addEventListener('touchstart', dismissOverlay);
    }

    // 2. Konami Code (Up, Up, Down, Down, Left, Right, Left, Right, B, A)
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 
        'ArrowDown', 'ArrowDown', 
        'ArrowLeft', 'ArrowRight', 
        'ArrowLeft', 'ArrowRight', 
        'x', 'z' // Assuming B=x and A=z/enter. The button mapping is x->btn-b, z->btn-a.
    ];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        // Check key - allow 'b'/'a' explicitly or mapped keys
        const key = e.key.toLowerCase();
        const expected = konamiCode[konamiIndex].toLowerCase();
        
        let match = false;
        if (key === expected) match = true;
        
        // Handle explicit B/A regardless of mapping
        if (konamiIndex === 8) { // Expecting B
             if (key === 'b') match = true;
        }
        if (konamiIndex === 9) { // Expecting A
             if (key === 'a' || key === 'enter') match = true;
        }

        if (match) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                // Activate Easter Egg
                activateMatrixMode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0; 
        }

        // Mute Toggle (M key)
        if (key === 'm') {
            const isMuted = SoundEngine.toggleMute();
            // Optional: Show a mute indicator popup
            /* 
            const indicator = document.createElement('div');
            indicator.textContent = isMuted ? 'MUTED' : 'UNMUTED';
            indicator.className = 'mute-indicator';
            document.body.appendChild(indicator); 
            */
        }
    });

    // 3. Battery Indicator (Keep this)
    const level = document.getElementById('battery-level');
    if (level && 'getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            const updateBattery = () => {
                level.style.width = `${battery.level * 100}%`;
                if (battery.charging) {
                    level.classList.add('charging');
                    level.style.backgroundColor = '#0affc2'; 
                } else {
                    level.classList.remove('charging');
                    if (battery.level < 0.2) level.style.backgroundColor = '#ff0055'; // Red
                    else if (battery.level < 0.5) level.style.backgroundColor = '#ffff00'; // Yellow
                    else level.style.backgroundColor = 'var(--screen-text)'; // Theme Default
                }
            };
            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);
        });
    } else if (level) {
        level.style.width = '85%';
        level.style.backgroundColor = 'var(--screen-text)';
    }

}

function activateMatrixMode() {
    alert("KONAMI CODE ACTIVATED!");
    document.body.style.filter = "invert(1) hue-rotate(180deg)";
    setTimeout(() => {
        document.body.style.filter = "";
    }, 5000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // 1. Init Extras (Overlay, Battery, Konami)
    initExtras();

    // Apply initial random theme
    document.body.classList.add(themes[currentThemeIndex]);
    
    // Title & Favicon change on visibility change
    const originalTitle = document.title;
    const setFavicon = (emoji) => {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/svg+xml';
        link.rel = 'icon';
        link.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${emoji}</text></svg>`;
        document.getElementsByTagName('head')[0].appendChild(link);
    };

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.title = "Where'd you go?";
            setFavicon('🤔');
        } else {
            document.title = originalTitle;
            setFavicon('👋');
        }
    });

    renderSocialLinks();
    initNavigation();
    initHudClock();
});
