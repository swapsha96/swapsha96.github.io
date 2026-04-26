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

        const indLinks = page.locator('#tab-ind-0');
        const indAbout = page.locator('#tab-ind-1');
        const indHelp = page.locator('#tab-ind-2');

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

        // Loop Right -> Back to Links
        await page.keyboard.press('ArrowRight');
        await expect(tabHelp).toBeHidden();
        await expect(tabLinks).toBeVisible();
        await expect(indLinks).toHaveClass(/active/);
        
        // Left -> Help (Loop Backwards)
        await page.keyboard.press('ArrowLeft');
        await expect(tabLinks).toBeHidden();
        await expect(tabHelp).toBeVisible();
        await expect(indHelp).toHaveClass(/active/);
    });

    test('Selection: Open Link', async ({ page }) => {
        // Trigger generic selection
        // Since links open in new tabs, verify the popup event
        const [popup] = await Promise.all([
            page.waitForEvent('popup'),
            page.keyboard.press('Enter')
        ]);
        
        expect(popup).toBeTruthy();
        await popup.close();
    });

    test('Theme Switching & Persistence', async ({ page }) => {
        const body = page.locator('body');
        // Get initial class
        const initialClass = await body.getAttribute('class') || '';

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
        await expect(bootStatus).toBeVisible();
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

        await page.waitForTimeout(2600);
        await page.keyboard.press('ArrowDown');
        await expect(firstLink).toHaveClass(/active/);
        await expect(secondLink).not.toHaveClass(/active/);

        await expect(consoleBody).not.toHaveClass(/console-booting/, { timeout: 2000 });
        await page.keyboard.press('ArrowDown');
        await expect(secondLink).toHaveClass(/active/);
    });

    test('Konami Code (Matrix Mode)', async ({ page }) => {
        const screen = page.locator('#main-screen');
        
        // Code: Up Up Down Down Left Right Left Right B A
        // Lowercase for safety in press
        const sequence = [
            'ArrowUp', 'ArrowUp', 
            'ArrowDown', 'ArrowDown', 
            'ArrowLeft', 'ArrowRight', 
            'ArrowLeft', 'ArrowRight', 
            'b', 'a'
        ];

        for (const key of sequence) {
            await page.keyboard.press(key);
            // Slight delay to mimic human input
            await page.waitForTimeout(50);
        }

        // Verify CSS filter effect
        await expect(screen).toHaveAttribute('style', /filter: invert\(1\) hue-rotate\(180deg\)/);
    });
});
