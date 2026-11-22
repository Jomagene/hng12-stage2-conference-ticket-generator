import { PHOTO_PATH, bookWithoutPhoto, expect, test } from './fixtures';

test('lists the demo events with per-event pricing', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('main ul > li');
  await expect(cards).toHaveCount(2);
  await expect(page.getByText('Harmattan Hack Night')).toBeVisible();
  await expect(cards.filter({ hasText: 'Techember' }).getByText('Free – $300')).toBeVisible();
});

test('keeps the ticket selection across reloads and supports the keyboard', async ({ page }) => {
  await page.goto('/events/techember-fest-27');
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await page.getByRole('radio').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio').nth(1)).toBeChecked();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: '3' }).click();

  await page.reload();
  await expect(page.getByRole('radio').nth(1)).toBeChecked();
  await expect(page.getByRole('combobox')).toHaveText('3');
});

test('requires a photo when the event asks for one, then issues the ticket', async ({ page }) => {
  await page.goto('/events/techember-fest-27');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForURL('**/details');

  await page.getByRole('button', { name: 'Get My Free Ticket' }).click();
  await expect(page.getByText('Please upload a profile photo.')).toBeVisible();
  await expect(page.getByText('Please enter your full name.')).toBeVisible();

  await page.locator('input[type=file]').setInputFiles(PHOTO_PATH);
  await expect(page.getByText('Change photo')).toBeAttached();
  await page.getByLabel('Enter your name *').fill('Ada Lovelace');
  await page.getByLabel('Enter your email *').fill('Ada@Example.com');
  await page.getByLabel('Special request? (optional)').fill('Front row');
  await page.reload();
  await expect(page.getByLabel('Enter your name *')).toHaveValue('Ada Lovelace'); // draft survives reload

  await page.getByRole('button', { name: 'Get My Free Ticket' }).click();
  await page.waitForURL(/\/tickets\/TF27-/);
  const ticket = page.locator('article');
  await expect(ticket.getByText('ada@example.com')).toBeVisible();
  await expect(ticket.locator('svg')).toHaveCount(1); // QR code
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
});

test('books a photo-free event with a custom question and downloads the ticket', async ({ page }) => {
  const code = await bookWithoutPhoto(page, '/events/harmattan-hack-night', {
    question: 'What are you hoping to build?',
    answer: 'A farming app',
  });
  expect(code).toMatch(/^HHN27-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
  await expect(page.locator('article').getByText('A farming app')).toBeVisible();
  await expect(page.locator('article').getByText('NB')).toBeVisible(); // initials instead of a photo

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /^Download/ }).click(),
  ]);
  expect(download.suggestedFilename()).toBe(`${code}.png`);

  await page.goto('/my-tickets');
  await expect(page.locator('li article')).toHaveCount(1);
});

test('shows empty states and 404s', async ({ page }) => {
  await page.goto('/my-tickets');
  await expect(page.getByText('You have no tickets yet')).toBeVisible();
  const missing = await page.goto('/events/does-not-exist');
  expect(missing?.status()).toBe(404);
});
