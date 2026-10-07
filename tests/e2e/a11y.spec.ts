import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility audits (axe-core)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const overlay = page.locator('#start-overlay');
    await expect(overlay).toBeVisible();
    await page.keyboard.press('Space');
    await expect(overlay).toBeHidden();
  });

  async function expectNoViolations(page: import('@playwright/test').Page, state: string) {
    const results = await new AxeBuilder({ page })
      .exclude('.astro-dev-toolbar') // dev-only overlay, absent in the preview build
      .analyze();
    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
    }));
    expect(violations, `axe violations in state: ${state}`).toEqual([]);
  }

  test('links tab', async ({ page }) => {
    await expectNoViolations(page, 'links tab');
  });

  test('about tab', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-1')).toBeVisible();
    await expectNoViolations(page, 'about tab');
  });

  test('help tab', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-2')).toBeVisible();
    await expectNoViolations(page, 'help tab');
  });

  test('snake tab', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-3')).toBeVisible();
    await expectNoViolations(page, 'snake tab');
  });

  test('pause menu open', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.locator('#pause-menu')).toBeVisible();
    await expectNoViolations(page, 'pause menu');
  });

  test('powered off', async ({ page }) => {
    await page.keyboard.press('p');
    await expect(page.locator('.console')).toHaveClass(/console-off/);
    await expectNoViolations(page, 'powered off');
  });
});
