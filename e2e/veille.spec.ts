import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

test('se met en veille, puis se réveille sans actionner ce qui est dessous', async ({
  page,
}) => {
  // 0,05 min : 3 s, pour ne pas attendre une vraie minute.
  await page.addInitScript(() =>
    localStorage.setItem(
      'graphics-options',
      JSON.stringify({screensaverMinutes: 0.05}),
    ),
  );
  await page.goto('/');
  await waitForScene(page);
  const roomButton = page
    .getByRole('button', {name: '22°', exact: true})
    .first();
  const box = await roomButton.boundingBox();

  const screensaver = page.getByRole('button', {name: "Réveiller l'écran"});
  await expect(screensaver).toBeVisible();
  await expect(screensaver).toContainText(/\d{2}:\d{2}/);

  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(screensaver).toBeHidden();
  await expect(page.getByRole('heading', {name: 'Climatisation'})).toBeHidden();
});

async function openSystemModal(page: Page) {
  await waitForScene(page);
  await page.mouse.move(150, 700);
  const button = page.getByRole('button', {name: 'Système'});
  // Un clic pendant l'animation d'entrée du dock peut tomber à côté.
  await expect(button.locator('..')).toHaveCSS('opacity', '1');
  await button.click();
}

test('règle le délai de veille depuis la modale Système', async ({page}) => {
  await page.goto('/');
  await openSystemModal(page);
  const delay = page.getByRole('combobox', {name: 'Veille'});
  await expect(delay).toHaveText('Jamais');
  await delay.click();
  await page.getByRole('option', {name: 'Après 5 min'}).click();

  await page.reload();
  await openSystemModal(page);
  await expect(page.getByRole('combobox', {name: 'Veille'})).toHaveText(
    'Après 5 min',
  );
});
