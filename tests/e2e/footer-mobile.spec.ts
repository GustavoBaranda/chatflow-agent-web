import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'scratch/visual-audit');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe('Mobile Footer Responsive Refinement Suite', () => {
  const viewports = [
    { name: '320px', width: 320, height: 568 },
    { name: '375px', width: 375, height: 667 },
    { name: '390px', width: 390, height: 844 },
    { name: '430px', width: 430, height: 932 },
  ];

  const locales = ['en', 'es', 'pt-BR'];

  for (const vp of viewports) {
    for (const locale of locales) {
      test(`Footer layout at ${vp.name} in ${locale} (light & dark)`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`/${locale}`);
        await page.waitForLoadState('networkidle');

        const footer = page.locator('footer');
        await expect(footer).toBeVisible();

        // 1. Verify zero horizontal overflow on the page
        const isOverflowing = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(isOverflowing, `Horizontal overflow at ${vp.name} in ${locale}`).toBe(false);

        // 2. Verify branding and tagline
        await expect(footer.locator('text=chatflow-agent').first()).toBeVisible();

        // 3. Verify exactly 1 GitHub Sponsors link in footer
        const sponsorLinks = footer.locator('a[href="https://github.com/sponsors/GustavoBaranda"]');
        await expect(sponsorLinks).toHaveCount(1);
        await expect(sponsorLinks).toBeVisible();

        // 4. Verify creator signature
        const signature = footer.locator('a[href="https://gustavobaranda.com/"]');
        await expect(signature).toBeVisible();
        await expect(signature.locator('img[src="/brand/gustavo-baranda.svg"]')).toBeVisible();

        // 5. Test Light Mode screenshot
        const themeBtn = page.locator('header button[aria-pressed]').first();
        const isDark = await page.evaluate(() => document.documentElement.className.includes('dark'));
        if (isDark) {
          await themeBtn.click();
          await page.waitForTimeout(300);
        }

        // Capture footer screenshot
        await footer.screenshot({
          path: path.join(SCREENSHOT_DIR, `footer-${locale}-${vp.name}-light.png`),
        });

        // 6. Test Dark Mode screenshot
        await themeBtn.click();
        await page.waitForTimeout(300);

        await footer.screenshot({
          path: path.join(SCREENSHOT_DIR, `footer-${locale}-${vp.name}-dark.png`),
        });
      });
    }
  }
});
