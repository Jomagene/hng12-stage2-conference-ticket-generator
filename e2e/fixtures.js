import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test as base, expect } from '@playwright/test';

export const PHOTO_PATH = path.resolve('app/icon.png'); // Playwright runs from the project root
const PHOTO = readFileSync(PHOTO_PATH);
export const UPLOADED_URL = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'demo'}/image/upload/v1/e2e.jpg`;

// No real uploads: Cloudinary and the image optimizer are stubbed in the browser.
async function stubNetwork(page) {
  await page.route('https://api.cloudinary.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ secure_url: UPLOADED_URL }) }),
  );
  await page.route('**/_next/image**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PHOTO }),
  );
}

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('console', (message) => {
      // 404 pages are tested on purpose; the browser logs those itself.
      if (message.type() === 'error' && !message.text().includes('status of 404')) errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await stubNetwork(page);
    await use(page);
    expect(errors, 'browser console errors').toEqual([]);
  },

  // A second, independent browser (another device with its own cookies and storage).
  newDevice: async ({ browser }, use) => {
    const contexts = [];
    await use(async (options) => {
      const context = await browser.newContext(options);
      contexts.push(context);
      const page = await context.newPage();
      await stubNetwork(page);
      return page;
    });
    await Promise.all(contexts.map((context) => context.close()));
  },
});

export { expect };

// Fills and submits the "Create an event" form; returns the public and manage links.
export async function createEvent(page, { name, capacity = 2 }) {
  await page.goto('/manage/new');
  await page.getByLabel('Event name *').fill(name);
  await page.getByLabel('Short description *').fill('Portfolio reviews and talks for designers.');
  await page.getByLabel('Venue *').fill('Akwa, Douala');
  await page.getByLabel('Starts *').fill('2027-05-20T18:00');
  await page.getByLabel('Time zone *').selectOption('Africa/Douala');
  await page.getByLabel('Currency').selectOption('XAF');
  await page.getByLabel('Max tickets per booking').fill('3');
  await page.locator('input[name="tiers.0.name"]').fill('Standard');
  await page.locator('input[name="tiers.0.price"]').fill('5000');
  await page.locator('input[name="tiers.0.capacity"]').fill(String(capacity));
  await page.getByRole('button', { name: 'Add ticket type' }).click();
  await page.locator('input[name="tiers.1.name"]').fill('Pro');
  await page.locator('input[name="tiers.1.price"]').fill('15000');
  await page.locator('input[name="tiers.1.capacity"]').fill('10');
  await page.getByLabel('Require a profile photo').uncheck();
  await page.getByLabel('Custom question (optional)').fill('Company?');
  await page.getByRole('button', { name: 'Coral' }).click();
  await page.getByRole('button', { name: 'Create event' }).click();
  await expect(page.getByText('Your event is live')).toBeVisible();

  const publicUrl = await page.getByLabel('Public booking link', { exact: true }).inputValue();
  const manageUrl = await page.getByLabel('Private manage link', { exact: true }).inputValue();
  return { publicPath: new URL(publicUrl).pathname, manageUrl, slug: publicUrl.split('/').pop() };
}

export async function bookWithoutPhoto(page, eventPath, { name = 'Ngo Biyong', question, answer } = {}) {
  await page.goto(eventPath);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForURL('**/details');
  await page.getByLabel('Enter your name *').fill(name);
  await page.getByLabel('Enter your email *').fill('ngo@example.cm');
  if (question) await page.getByLabel(`${question} (optional)`).fill(answer);
  await page.getByRole('button', { name: /^Get My/ }).click();
  await page.waitForURL(/\/tickets\/[A-Z0-9-]+\?new=1$/);
  return (await page.locator('article .font-mono').textContent()).trim();
}
