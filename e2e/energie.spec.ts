import {expect, test, waitForScene} from './fixtures';

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
});

test('la tuile « Énergie » affiche la puissance et la période tarifaire', async ({
  page,
}) => {
  await expect(page.getByRole('button', {name: /^Énergie/})).toContainText(
    /\d+(,\d)? k?VA · H[PC]/,
  );
});

test('la modale « Énergie » affiche la consommation du jour, son coût et l’historique', async ({
  page,
}) => {
  await page.getByRole('button', {name: /^Énergie/}).click();
  await expect(page.getByRole('heading', {name: 'Énergie'})).toBeVisible();

  const today = page.getByRole('region', {name: 'Aujourd’hui'});
  await expect(today).toContainText(/\d+,\d{2}\s€/);
  await expect(today).toContainText(/Heures pleines : \d+(,\d)? kWh/);
  await expect(today).toContainText(/Heures creuses : \d+(,\d)? kWh/);
  await expect(page.getByRole('region', {name: 'Hier'})).toContainText(
    /\d+,\d{2}\s€/,
  );
  await expect(
    page.getByText(/^Charge : .+ sur 6 kVA souscrits$/),
  ).toBeVisible();

  // Un segment heures pleines et un segment heures creuses par jour.
  const bars = page.locator('.MuiBarChart-element');
  await expect(bars).toHaveCount(2 * 7);
  await page.getByRole('button', {name: '30 jours'}).click();
  await expect(bars).toHaveCount(2 * 30);
});
