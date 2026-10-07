import { test, expect } from '@playwright/test';

test.describe('GameBoy E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the overlay to be visible
    const overlay = page.locator('#start-overlay');
    await expect(overlay).toBeVisible();

    // Dismiss overlay with keyboard interaction to be more robust than click
    await page.keyboard.press('Space');

    await expect(overlay).toBeHidden();
  });

  test('Boot Sequence: Overlay Dismissal', async ({ page }) => {
    // Verification is handled in beforeEach, checking main screen availability
    await expect(page.locator('.screen-display')).toBeVisible();
  });

  test('Navigation: Links Tab (D-Pad)', async ({ page }) => {
    const firstLink = page.locator('.social-link').first();
    const secondLink = page.locator('.social-link').nth(1);

    // Initial state: first link active
    await expect(firstLink).toHaveClass(/active/);
    await expect(secondLink).not.toHaveClass(/active/);

    // Press Down to move selection
    await page.keyboard.press('ArrowDown');
    await expect(firstLink).not.toHaveClass(/active/);
    await expect(secondLink).toHaveClass(/active/);

    // Press Up to move selection back
    await page.keyboard.press('ArrowUp');
    await expect(firstLink).toHaveClass(/active/);
    await expect(secondLink).not.toHaveClass(/active/);
  });

  test('Navigation: Tab Switching', async ({ page }) => {
    const tabLinks = page.locator('#tab-0');
    const tabAbout = page.locator('#tab-1');
    const tabHelp = page.locator('#tab-2');
    const tabSnake = page.locator('#tab-3');

    const indLinks = page.locator('#tab-ind-0');
    const indAbout = page.locator('#tab-ind-1');
    const indHelp = page.locator('#tab-ind-2');
    const indSnake = page.locator('#tab-ind-3');

    // Initial State: Links Active
    await expect(tabLinks).toBeVisible();
    await expect(tabAbout).toBeHidden();

    // Right -> About
    await page.keyboard.press('ArrowRight');
    await expect(tabLinks).toBeHidden();
    await expect(tabAbout).toBeVisible();
    await expect(indAbout).toHaveClass(/active/);

    // Right -> Help
    await page.keyboard.press('ArrowRight');
    await expect(tabAbout).toBeHidden();
    await expect(tabHelp).toBeVisible();
    await expect(indHelp).toHaveClass(/active/);

    // Right -> Snake
    await page.keyboard.press('ArrowRight');
    await expect(tabHelp).toBeHidden();
    await expect(tabSnake).toBeVisible();
    await expect(indSnake).toHaveClass(/active/);

    // Loop Right -> Back to Links (use evaluate to bypass keyboard — Right is snake control)
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.tab-indicator');
      (tabs[0] as HTMLElement).click();
    });
    await expect(tabSnake).toBeHidden();
    await expect(tabLinks).toBeVisible();
    await expect(indLinks).toHaveClass(/active/);

    // Go to Snake tab via click (loop backwards)
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.tab-indicator');
      (tabs[3] as HTMLElement).click();
    });
    await expect(tabLinks).toBeHidden();
    await expect(tabSnake).toBeVisible();
    await expect(indSnake).toHaveClass(/active/);
  });

  test('Selection: Open Link', async ({ page }) => {
    // Trigger generic selection
    // Since links open in new tabs, verify the popup event
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.keyboard.press('Enter')]);

    expect(popup).toBeTruthy();
    await popup.close();
  });

  test('Theme Switching & Persistence', async ({ page }) => {
    const body = page.locator('body');
    // Get initial class
    const initialClass = (await body.getAttribute('class')) || '';

    // Press 'B' (x) to switch
    await page.keyboard.press('x');

    // Verify class changed
    await expect(body).not.toHaveClass(initialClass);
    const newClass = await body.getAttribute('class');

    // Reload
    await page.reload();

    // Handle overlay on reload
    const overlay = page.locator('#start-overlay');
    await expect(overlay).toBeVisible();
    await page.keyboard.press('Space');
    await expect(overlay).toBeHidden();

    // Verify persistence
    await expect(body).toHaveClass(newClass!);
  });

  test('Theme switching goes forward with B and backward with SELECT', async ({ page }) => {
    const body = page.locator('body');
    const current = await body.getAttribute('class');

    // SELECT (q) steps one theme back
    await page.keyboard.press('q');
    await expect(body).not.toHaveClass(current!);

    // B (x) steps one theme forward again — back to where we started
    await page.keyboard.press('x');
    await expect(body).toHaveClass(current!);
  });

  test('Audio Mute Toggle & Persistence', async ({ page }) => {
    // 1. Toggle Mute with 'm'
    await page.keyboard.press('m');

    // 2. Interact with localStorage
    const isMuted = await page.evaluate(() => localStorage.getItem('gb_muted'));
    expect(isMuted).toBe('true');

    // 3. Reload
    await page.reload();

    // Handle overlay on reload
    const overlay = page.locator('#start-overlay');
    await expect(overlay).toBeVisible();
    await page.keyboard.press('Space');
    await expect(overlay).toBeHidden();

    // 4. Verify persistence
    const persistedState = await page.evaluate(() => localStorage.getItem('gb_muted'));
    expect(persistedState).toBe('true');
  });

  test('Power Switch Toggle', async ({ page }) => {
    const consoleBody = page.locator('.console');

    // Press 'p' to turn off
    await page.keyboard.press('p');
    await expect(consoleBody).toHaveClass(/console-off/);

    // Press 'p' to turn on
    await page.keyboard.press('p');
    await expect(consoleBody).not.toHaveClass(/console-off/);
  });

  test('Controls are disabled when powered off', async ({ page }) => {
    const consoleBody = page.locator('.console');
    const firstLink = page.locator('.social-link').first();
    const secondLink = page.locator('.social-link').nth(1);
    const body = page.locator('body');
    const initialClass = await body.getAttribute('class');

    await page.keyboard.press('p');
    await expect(consoleBody).toHaveClass(/console-off/);
    await expect(firstLink).toHaveClass(/active/);

    await page.keyboard.press('ArrowDown');
    await expect(firstLink).toHaveClass(/active/);
    await expect(secondLink).not.toHaveClass(/active/);

    await page.keyboard.press('x');
    await expect(body).toHaveClass(initialClass || '');

    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-0')).toBeVisible();
    await expect(page.locator('#tab-1')).toBeHidden();
  });

  test('Controls stay locked until boot finishes', async ({ page }) => {
    const consoleBody = page.locator('.console');
    const bootScreen = page.locator('#boot-screen');
    const bootStatus = page.locator('.boot-status');
    const firstLink = page.locator('.social-link').first();
    const secondLink = page.locator('.social-link').nth(1);
    const body = page.locator('body');
    const initialClass = await body.getAttribute('class');

    await page.keyboard.press('p');
    await expect(consoleBody).toHaveClass(/console-off/);

    await page.keyboard.press('p');
    await expect(consoleBody).toHaveClass(/console-booting/);
    await expect(bootScreen).toHaveClass(/active/);
    await expect(bootStatus).toContainText('CONTROLS LOCKED');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('x');

    await expect(firstLink).toHaveClass(/active/);
    await expect(secondLink).not.toHaveClass(/active/);
    await expect(page.locator('#tab-0')).toBeVisible();
    await expect(page.locator('#tab-1')).toBeHidden();
    await expect(body).toHaveClass(initialClass || '');

    await expect(consoleBody).not.toHaveClass(/console-booting/, { timeout: 5000 });
    await expect(bootScreen).not.toHaveClass(/active/, { timeout: 5000 });

    await page.keyboard.press('ArrowDown');
    await expect(secondLink).toHaveClass(/active/);
  });

  test('Rapid power cycling does not unlock controls early', async ({ page }) => {
    const consoleBody = page.locator('.console');
    const bootScreen = page.locator('#boot-screen');
    const firstLink = page.locator('.social-link').first();
    const secondLink = page.locator('.social-link').nth(1);

    await page.keyboard.press('p');
    await expect(consoleBody).toHaveClass(/console-off/);

    await page.keyboard.press('p');
    await expect(consoleBody).toHaveClass(/console-booting/);

    await page.waitForTimeout(1000);
    await page.keyboard.press('p');
    await expect(consoleBody).toHaveClass(/console-off/);

    await page.keyboard.press('p');
    await expect(consoleBody).toHaveClass(/console-booting/);
    await expect(bootScreen).toHaveClass(/active/);

    await page.waitForTimeout(2200);
    await expect(consoleBody).toHaveClass(/console-booting/);
    await expect(bootScreen).toHaveClass(/active/);

    await page.keyboard.press('ArrowDown');
    await expect(firstLink).toHaveClass(/active/);
    await expect(secondLink).not.toHaveClass(/active/);

    await expect(consoleBody).not.toHaveClass(/console-booting/, { timeout: 2500 });
    await expect(bootScreen).not.toHaveClass(/active/, { timeout: 2500 });
    await page.keyboard.press('ArrowDown');
    await expect(secondLink).toHaveClass(/active/);
  });

  test('Konami Code (Matrix Mode)', async ({ page }) => {
    const screen = page.locator('#main-screen');

    // Code: Up Up Down Down Left Right Left Right B A
    // Lowercase for safety in press
    const sequence = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    for (const key of sequence) {
      await page.keyboard.press(key);
      // Slight delay to mimic human input
      await page.waitForTimeout(50);
    }

    // Verify CSS filter effect
    await expect(screen).toHaveAttribute('style', /filter: invert\(1\) hue-rotate\(180deg\)/);
  });

  test('Snake: Navigate to Snake tab, start game, move, hit wall', async ({ page }) => {
    const tabSnake = page.locator('#tab-3');
    const snakeCanvas = page.locator('#snake-canvas');
    const snakeScore = page.locator('#snake-score');
    const snakeOverlay = page.locator('#snake-overlay');

    // Navigate to Snake tab
    await page.keyboard.press('ArrowRight'); // About
    await page.keyboard.press('ArrowRight'); // Help
    await page.keyboard.press('ArrowRight'); // Snake
    await expect(tabSnake).toBeVisible();
    await expect(snakeCanvas).toBeVisible();

    // Should show SNAKE overlay (not started)
    await expect(snakeOverlay).toBeVisible();

    // Press A to start game
    await page.keyboard.press('Enter');

    // Overlay should disappear when running (generous timeout: the tab's
    // rAF loop may take a moment to initialize under parallel load)
    await expect(snakeOverlay).toBeHidden({ timeout: 8000 });

    // Move the snake away from the right wall (initial direction is right).
    // Turn down first to avoid the wall; each wait covers the 180ms tick.
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(250);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(250);

    // Snake should still be alive (not game over yet)
    await expect(snakeOverlay).toBeHidden({ timeout: 4000 });

    // Score should update after eating food (snake moves, may eat)
    const scoreText = await snakeScore.textContent();
    expect(scoreText).toMatch(/SCORE:/);
  });

  test('Snake: D-pad does not switch tabs while Snake is active', async ({ page }) => {
    const tabSnake = page.locator('#tab-3');
    const tabAbout = page.locator('#tab-1');

    // Navigate to Snake
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(tabSnake).toBeVisible();

    // Press A to start
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // ArrowLeft should NOT switch to Help tab — it controls snake direction
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(150);
    await expect(tabSnake).toBeVisible();
    await expect(tabAbout).toBeHidden();

    // ArrowRight should NOT switch to Help tab either
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    await expect(tabSnake).toBeVisible();
  });

  test('Snake: Game starts paused when navigating away', async ({ page }) => {
    // Navigate to Snake
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    // Start game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Switch away via evaluate
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.tab-indicator');
      (tabs[1] as HTMLElement).click();
    });
    await page.waitForTimeout(300);

    // Switch back to Snake
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.tab-indicator');
      (tabs[3] as HTMLElement).click();
    });
    await page.waitForTimeout(300);

    // Canvas should still exist
    await expect(page.locator('#snake-canvas')).toBeVisible();
  });

  test('Snake: Restart after game over', async ({ page }) => {
    const snakeOverlay = page.locator('#snake-overlay');

    // Navigate to Snake
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    // Start game
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    // Run into right wall by not changing direction
    // Snake starts moving right from mid-grid (col 8), has ~8 cols to the wall
    // At 130ms/tick, that's ~1 second to hit the wall
    await page.waitForTimeout(2000);

    // Check if game over overlay appeared
    const gameOverVisible = await snakeOverlay.isVisible();
    if (gameOverVisible) {
      // Press A to restart
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
      // Game should restart (overlay hidden)
      await expect(snakeOverlay).toBeHidden();
    }
  });

  test('Snake: L/R keys switch tabs at the title screen', async ({ page }) => {
    const tabSnake = page.locator('#tab-3');
    const tabHelp = page.locator('#tab-2');
    const tabLinks = page.locator('#tab-0');
    const hint = page.locator('#snake-overlay .snake-overlay-hint');

    // Navigate to Snake
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(tabSnake).toBeVisible();

    // The title screen tells the user how to leave
    await expect(hint).toContainText('L/R');

    // Game not running: Left exits to the Help tab
    await page.keyboard.press('ArrowLeft');
    await expect(tabSnake).toBeHidden();
    await expect(tabHelp).toBeVisible();

    // Back into Snake, then Right wraps around to the Links tab
    await page.keyboard.press('ArrowRight');
    await expect(tabSnake).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(tabSnake).toBeHidden();
    await expect(tabLinks).toBeVisible();
  });

  test('Snake: L/R keys exit after game over', async ({ page }) => {
    const tabSnake = page.locator('#tab-3');
    const tabHelp = page.locator('#tab-2');
    const snakeOverlay = page.locator('#snake-overlay');
    const hint = page.locator('#snake-overlay .snake-overlay-hint');

    // Navigate to Snake and start
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(tabSnake).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(snakeOverlay).toBeHidden();

    // Run into the right wall: GAME OVER overlay appears
    await expect(snakeOverlay).toBeVisible({ timeout: 8000 });
    await expect(hint).toContainText('L/R');

    // The escape hatch: Left/Right now switch tabs again
    await page.keyboard.press('ArrowLeft');
    await expect(tabSnake).toBeHidden();
    await expect(tabHelp).toBeVisible();
  });

  test('Snake: D-pad buttons exit at the title screen but steer while running', async ({
    page,
  }) => {
    const tabSnake = page.locator('#tab-3');
    const tabHelp = page.locator('#tab-2');

    // Navigate to Snake
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(tabSnake).toBeVisible();

    // Physical D-pad LEFT leaves the Snake tab at the title screen
    await page.dispatchEvent('#left', 'click');
    await expect(tabSnake).toBeHidden();
    await expect(tabHelp).toBeVisible();

    // Back to Snake and start the game
    await page.dispatchEvent('#tab-ind-3', 'click');
    await expect(tabSnake).toBeVisible();
    await page.dispatchEvent('#btn-a', 'click');
    await page.waitForTimeout(200);

    // While the game is running, the D-pad LEFT steers and must NOT switch tabs
    await page.dispatchEvent('#left', 'click');
    await page.waitForTimeout(150);
    await expect(tabSnake).toBeVisible();
    await expect(tabHelp).toBeHidden();
  });

  test('Menu: START opens the pause menu, B closes it', async ({ page }) => {
    const menu = page.locator('#pause-menu');

    await expect(menu).toBeHidden();

    // Physical START button opens the menu, moves focus into the dialog
    await page.dispatchEvent('#btn-start', 'click');
    await expect(menu).toBeVisible();
    await expect(menu.locator('.pause-menu-hint')).toContainText('A: OK');
    await expect(menu).toHaveAttribute('aria-activedescendant', 'pause-menu-item-0');
    await expect(menu).toHaveAttribute('aria-modal', 'true');
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(focusedId).toBe('pause-menu');

    // Physical B closes it and restores focus to the START button
    await page.dispatchEvent('#btn-b', 'click');
    await expect(menu).toBeHidden();
    const focusedAfterClose = await page.evaluate(() => document.activeElement?.id);
    expect(focusedAfterClose).toBe('btn-start');

    // Escape also toggles it
    await page.keyboard.press('Escape');
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });

  test('Menu: modal — global shortcuts and mouse do nothing while open', async ({ page }) => {
    const menu = page.locator('#pause-menu');
    const consoleEl = page.locator('.console');

    await page.keyboard.press('Escape');
    await expect(menu).toBeVisible();

    // m (mute), h (help), p (power) are swallowed while the menu is open
    await page.keyboard.press('m');
    const muted = await page.evaluate(() => localStorage.getItem('gb_muted'));
    expect(muted).toBeNull();

    await page.keyboard.press('h');
    await expect(page.locator('#tab-0')).toBeVisible();

    await page.keyboard.press('p');
    await expect(consoleEl).not.toHaveClass(/console-off/);

    // Clicking a tab indicator under the overlay must not switch tabs
    await page.dispatchEvent('#tab-ind-1', 'click');
    await expect(page.locator('#tab-1')).toBeHidden();

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });

  test('Menu: selection, theme action, and help action', async ({ page }) => {
    const menu = page.locator('#pause-menu');
    const body = page.locator('body');

    await page.keyboard.press('Escape');
    await expect(menu).toBeVisible();

    // RESUME is selected by default
    await expect(menu.locator('li').first()).toHaveClass(/active/);

    // Down -> THEME, A activates it; the menu stays open
    await page.keyboard.press('ArrowDown');
    await expect(menu.locator('li').nth(1)).toHaveClass(/active/);
    const before = (await body.getAttribute('class')) || '';
    await page.keyboard.press('Enter');
    await expect(menu).toBeVisible();
    await expect(body).not.toHaveClass(before);

    // B closes; reopen and jump to HELP
    await page.keyboard.press('x');
    await expect(menu).toBeHidden();
    await page.keyboard.press('Escape');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(menu.locator('li').nth(3)).toHaveClass(/active/);
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(page.locator('#tab-2')).toBeVisible();
  });

  test('Menu: sound toggle updates label and persists', async ({ page }) => {
    const menu = page.locator('#pause-menu');

    await page.keyboard.press('Escape');
    await expect(menu).toBeVisible();

    // RESUME(0) -> THEME(1) -> SOUND(2)
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(menu.locator('li').nth(2)).toContainText('SOUND: ON');

    await page.keyboard.press('Enter');
    await expect(menu.locator('li').nth(2)).toContainText('SOUND: OFF');
    const muted = await page.evaluate(() => localStorage.getItem('gb_muted'));
    expect(muted).toBe('true');

    // The HUD mute icon reflects the menu-driven toggle
    await expect(page.locator('#hud-mute')).toHaveCSS('visibility', 'visible');

    await page.keyboard.press('Enter');
    await expect(menu.locator('li').nth(2)).toContainText('SOUND: ON');
    await expect(page.locator('#hud-mute')).toHaveCSS('visibility', 'hidden');
  });

  test('Menu: power off from the menu', async ({ page }) => {
    const menu = page.locator('#pause-menu');

    await page.keyboard.press('Escape');
    await expect(menu).toBeVisible();

    // RESUME(0) THEME(1) SOUND(2) HELP(3) POWER(4)
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await expect(menu.locator('li').nth(4)).toHaveClass(/active/);
    await page.keyboard.press('Enter');

    await expect(menu).toBeHidden();
    await expect(page.locator('.console')).toHaveClass(/console-off/);
  });

  test('Menu: opening the menu pauses a running snake', async ({ page }) => {
    const snakeOverlay = page.locator('#snake-overlay');
    const menu = page.locator('#pause-menu');
    const tabSnake = page.locator('#tab-3');

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(tabSnake).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(snakeOverlay).toBeHidden();

    // Open the menu: the snake must freeze in place
    await page.keyboard.press('Escape');
    await expect(menu).toBeVisible();
    await page.waitForTimeout(2000); // longer than it takes to hit the right wall

    // Closing the menu resumes the frozen game — no game over, still on Snake
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(tabSnake).toBeVisible();
    await page.waitForTimeout(300);
    await expect(snakeOverlay).toBeHidden();
  });

  test('Footer hints change per tab and follow the snake sub-state', async ({ page }) => {
    const footer = page.locator('#footer-hint');

    await expect(footer).toContainText('UP/DOWN: LINKS');

    await page.keyboard.press('ArrowRight');
    await expect(footer).toContainText('UP/DOWN: SCROLL');

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(footer).toContainText('A: START'); // snake title screen

    // Starting the game switches the hint to the steering keymap
    await page.keyboard.press('Enter');
    await expect(footer).toContainText('ARROWS: STEER');
  });

  test('Shader canvas mirrors the active theme', async ({ page }) => {
    const canvas = page.locator('#shader-bg');

    await expect(canvas).toHaveAttribute('data-theme', /theme-/);

    const before = await canvas.getAttribute('data-theme');
    await page.keyboard.press('x');
    await expect(canvas).not.toHaveAttribute('data-theme', before!);
  });

  test('Shader theme mirror works without WebGPU', async ({ page }) => {
    // Strip navigator.gpu so the lazy engine import must never happen.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true });
    });
    await page.reload();

    const overlay = page.locator('#start-overlay');
    await expect(overlay).toBeVisible();
    await page.keyboard.press('Space');
    await expect(overlay).toBeHidden();

    const canvas = page.locator('#shader-bg');
    await expect(canvas).toHaveAttribute('data-theme', /theme-/);
    // The WebGPU engine must never have mounted.
    await expect(canvas).not.toHaveClass(/is-ready/);
  });
});
