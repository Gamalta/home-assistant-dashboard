import {Page} from '@playwright/test';
import {expect, openSystemModal, test, waitForScene} from './fixtures';

function sleepAfter(page: Page, minutes: number) {
  return page.addInitScript(
    minutes =>
      localStorage.setItem(
        'graphics-options',
        JSON.stringify({screensaverMinutes: minutes}),
      ),
    minutes,
  );
}

test('se met en veille, puis se réveille sans actionner ce qui est dessous', async ({
  page,
}) => {
  // 0,2 min : 12 s. Le réveil relance ce délai : plus court, une page
  // ralentie se rendort avant que le test ne la voie réveillée.
  await sleepAfter(page, 0.2);
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

test('affiche la météo, les prochains trains et les alertes', async ({
  page,
}) => {
  await sleepAfter(page, 0.05);
  await page.goto('/');

  const screensaver = page.getByRole('button', {name: "Réveiller l'écran"});
  await expect(screensaver).toContainText('Météo20.1°17.4° / 21.7°');
  await expect(screensaver).toContainText(
    /Vers le travail\d{2}:\d{2}à l'heureVoie B\d{2}:\d{2}\+5 min\d{2}:\d{2}supprimé/,
  );
  await expect(screensaver).toContainText(
    '2 alertesPile faible : Bouton de la cuisine (12 %)Indisponible : Capteur de la cave',
  );
});

// Sans sun.sun dans le mock, le jour suit l'heure.
for (const [time, opacity] of [
  ['12:30', '1'],
  ['02:00', '0.6'],
]) {
  test(`atténue l'écran la nuit (${time})`, async ({page}) => {
    await page.clock.setFixedTime(new Date(`2026-10-25T${time}:00`));
    await sleepAfter(page, 0.05);
    await page.goto('/');

    const clock = page
      .getByRole('button', {name: "Réveiller l'écran"})
      .getByText(time);
    await expect(clock.locator('../..')).toHaveCSS('opacity', opacity);
  });
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
