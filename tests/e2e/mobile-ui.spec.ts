import { test, expect, type Locator, type Page } from '@playwright/test';

async function tapCenter(page: Page, locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

test.describe('Mobile UI regressions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    const overlay = page.locator('#start-overlay');
    await expect(overlay).toBeVisible();
    await page.touchscreen.tap(20, 20);
    await expect(overlay).toBeHidden();
  });

  test('mobile-only controls stay visible inside the viewport', async ({ page }) => {
    const powerSwitch = page.locator('.power-switch-container');
    const turnButton = page.locator('.app-turn-control');

    await expect(powerSwitch).toBeVisible();
    await expect(turnButton).toBeVisible();

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();

    const powerBox = await powerSwitch.boundingBox();
    const turnBox = await turnButton.boundingBox();

    expect(powerBox).not.toBeNull();
    expect(turnBox).not.toBeNull();

    expect(powerBox!.x).toBeGreaterThanOrEqual(0);
    expect(powerBox!.y).toBeGreaterThanOrEqual(0);
    expect(powerBox!.x + powerBox!.width).toBeLessThanOrEqual(viewport!.width);
    expect(powerBox!.y + powerBox!.height).toBeLessThanOrEqual(viewport!.height);

    expect(turnBox!.x).toBeGreaterThanOrEqual(0);
    expect(turnBox!.y).toBeGreaterThanOrEqual(0);
    expect(turnBox!.x + turnBox!.width).toBeLessThanOrEqual(viewport!.width);
    expect(turnBox!.y + turnBox!.height).toBeLessThanOrEqual(viewport!.height);
  });

  test('power switch can be toggled by touch', async ({ page }) => {
    const consoleBody = page.locator('.console');
    const powerSwitch = page.locator('#power-switch');

    await tapCenter(page, powerSwitch);
    await expect(consoleBody).toHaveClass(/console-off/);

    await tapCenter(page, powerSwitch);
    await expect(consoleBody).not.toHaveClass(/console-off/);
  });

  test('layout toggle tap switches orientation without bouncing back', async ({ page }) => {
    const consoleBody = page.locator('.console');
    const turnButton = page.locator('#btn-turn');

    await expect(consoleBody).not.toHaveClass(/landscape/);

    await tapCenter(page, turnButton);
    await expect(consoleBody).toHaveClass(/landscape/);
    await expect(turnButton).toBeVisible();
  });
});
