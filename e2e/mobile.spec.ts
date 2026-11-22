import { expect, test } from './fixtures';

test.use({ viewport: { width: 375, height: 800 } });

for (const path of [
  '/',
  '/events/techember-fest-27',
  '/events/harmattan-hack-night/details',
  '/manage/new',
  '/my-tickets',
]) {
  test(`no horizontal scroll at 375px on ${path}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
