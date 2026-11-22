import { bookWithoutPhoto, createEvent, expect, test } from './fixtures';

test('an organizer creates, sells out, checks in, exports and edits an event', async ({ page, newDevice }) => {
  const { publicPath, slug } = await createEvent(page, { name: 'Douala Design Night', capacity: 2 });
  await page.getByRole('link', { name: 'Open dashboard' }).click();
  await expect(page.getByText('Seats booked')).toBeVisible();

  // An attendee books both Standard seats on their own device.
  const attendee = await newDevice();
  await attendee.goto(publicPath);
  await expect(attendee.locator('fieldset')).toContainText(/FCFA\s5,000/);
  await attendee.getByRole('combobox').click();
  await expect(attendee.getByRole('option')).toHaveCount(2); // capacity 2 < max per order 3
  await attendee.getByRole('option', { name: '2' }).click();
  const code = await bookWithoutPhoto(attendee, publicPath, { question: 'Company?', answer: 'Studio Kmer' });
  expect(code).toMatch(/^DDN27-/);

  // Standard is now sold out for everyone else.
  const visitor = await newDevice();
  await visitor.goto(publicPath);
  await expect(visitor.getByRole('radio').first()).toBeDisabled();
  await expect(visitor.getByRole('radio').nth(1)).toBeChecked();

  // Dashboard numbers and check-in.
  await page.reload();
  const stats = page.locator('dl').first();
  await expect(stats).toContainText('2 / 12');
  await expect(stats).toContainText(/FCFA\s10,000/);
  await expect(page.getByRole('cell', { name: 'Studio Kmer' })).toBeVisible();

  const checkIn = page.getByRole('region', { name: 'Check-in' });
  await checkIn.getByLabel('Ticket code').fill(code.toLowerCase());
  await checkIn.getByRole('button', { name: 'Check in' }).click();
  await expect(checkIn.getByText('Checked in')).toBeVisible();
  // The table updates from the action's revalidation, without a manual refresh.
  await expect(page.getByRole('button', { name: 'Undo check-in for Ngo Biyong' })).toBeVisible();

  await checkIn.getByLabel('Ticket code').fill(code);
  await checkIn.getByRole('button', { name: 'Check in' }).click();
  await expect(checkIn.getByText('Already used')).toBeVisible();
  await checkIn.getByLabel('Ticket code').fill('DDN27-FAKE-0000');
  await checkIn.getByRole('button', { name: 'Check in' }).click();
  await expect(checkIn.getByText('Ticket not found')).toBeVisible();

  const csv = await page.evaluate(async (url) => (await fetch(url)).text(), `/manage/${slug}/attendees.csv`);
  expect(csv).toContain('Ngo Biyong');
  expect(csv).toMatch(/,\d{4}-\d\d-\d\dT[^,]+,Studio Kmer/); // checked-in timestamp + answer

  // Editing protects booked seats.
  await page.getByRole('link', { name: 'Edit event' }).click();
  await page.locator('input[name="tiers.0.capacity"]').fill('1');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText(/already has 2 booked/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove ticket type 1' })).toBeDisabled();

  await page.locator('input[name="tiers.0.capacity"]').fill('3');
  await page.getByLabel('Event name *').fill('Douala Design Night 2027');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.waitForURL(`**/manage/${slug}`);
  await expect(page.getByRole('heading', { name: 'Douala Design Night 2027' })).toBeVisible();

  await visitor.reload();
  await expect(visitor.getByRole('radio').first()).toBeEnabled();
  await expect(visitor.locator('fieldset')).toContainText('1/3');
});

test('the dashboard is private until the manage link is opened', async ({ page, newDevice }) => {
  const { slug, manageUrl } = await createEvent(page, { name: 'Private Workshop' });
  const stranger = await newDevice();

  await stranger.goto(`/manage/${slug}`);
  await expect(stranger.getByText('Open your manage link')).toBeVisible();
  const csvStatus = await stranger.evaluate(
    async (url: string) => (await fetch(url)).status,
    `/manage/${slug}/attendees.csv`,
  );
  expect(csvStatus).toBe(403);

  await stranger.goto(manageUrl.replace(/access\/.+$/, `access/${'x'.repeat(32)}`));
  await expect(stranger).toHaveURL(/\/manage\?error=invalid-link$/);

  await stranger.goto(manageUrl);
  await expect(stranger).toHaveURL(new RegExp(`/manage/${slug}$`)); // token removed from the URL
  await expect(stranger.getByText('Seats booked')).toBeVisible();
  await stranger.goto('/manage');
  await expect(stranger.getByText('Private Workshop')).toBeVisible();
});
