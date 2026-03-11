import { test, expect } from '@playwright/test';

test.describe('GameBoy Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Dismiss the boot sequence/overlay first thing for all tests
    // Logic: The overlay is dismissed on ANY key press or click.
    // It's safer to wait for it to be visible first.
    const overlay = page.locator('#start-overlay');
    await expect(overlay).toBeVisible();
    
    // Click the overlay directly to dismiss it.
    // Use force: true to bypass actionability checks (stability) because of the CRT turn-on animation
    // or the blinking text which might be causing Playwright to think the element is moving.
    await overlay.click({ force: true });
    
    await expect(overlay).toBeHidden();
  });

  test('should display initial state correctly', async ({ page }) => {
    // Check main screen visibility
    await expect(page.locator('#main-screen')).toBeVisible();
    
    // Check D-Pad presence
    await expect(page.locator('.dpad')).toBeVisible();
    
    // Check active tab is Links
    const linksTab = page.locator('#tab-ind-0');
    await expect(linksTab).toHaveClass(/active/);
    await expect(page.locator('#tab-0')).toBeVisible();
  });

  test('D-Pad navigation should change active link', async ({ page }) => {
    // Check first link is active by default
    const firstLink = page.locator('.social-link').nth(0);
    const secondLink = page.locator('.social-link').nth(1);

    await expect(firstLink).toHaveClass(/active/);
    await expect(secondLink).not.toHaveClass(/active/);

    // Press Down (navigate to next link)
    await page.keyboard.press('ArrowDown');
    
    // Check second link is active
    await expect(secondLink).toHaveClass(/active/);
    await expect(firstLink).not.toHaveClass(/active/);
    
    // Press Up (navigate back)
    await page.keyboard.press('ArrowUp');
    await expect(firstLink).toHaveClass(/active/);
  });

  test('Tab switching works with Left/Right arrows', async ({ page }) => {
    const linksTab = page.locator('#tab-0');
    const aboutTab = page.locator('#tab-1');
    const helpTab = page.locator('#tab-2');

    // Initial: Links tab
    await expect(linksTab).toBeVisible();
    await expect(aboutTab).toBeHidden();

    // Switch Right (Links -> About)
    await page.keyboard.press('ArrowRight'); 
    
    await expect(linksTab).toBeHidden();
    await expect(aboutTab).toBeVisible();
    
    // Switch Right (About -> Help)
    await page.keyboard.press('ArrowRight');
    await expect(helpTab).toBeVisible();
    
    // Switch Left (Help -> About)
    await page.keyboard.press('ArrowLeft');
    await expect(aboutTab).toBeVisible();
  });

  test('Theme switching persists', async ({ page }) => {
    const body = page.locator('body');
    // Get initial class (might be empty or have a default)
    const initialClass = await body.getAttribute('class') || '';
    
    // Press 'B' (mapped to 'x' key or 'b' is not mapped? wait)
    // Code says: case 'x': case 'X': handleThemeSwitch()
    // Code instructions say: "B / X - SWITCH THEME"
    // So usually 'x' key.
    await page.keyboard.press('x');
    
    // Expect class to change
    const newClass = await body.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
    
    // Verify persistence on reload
    await page.reload();
    
    // Note: Reload resets the application state (overlay returns)
    // But theme is applied from localStorage immediately.
    const reloadedClass = await body.getAttribute('class');
    expect(reloadedClass).toBe(newClass);
  });
});
