import {expect, test, waitForScene} from './fixtures';

// Les horaires du mock suivent l'heure courante : on vérifie leur forme.
test('la carte affiche les trois prochains départs', async ({page}) => {
  await page.goto('/');

  await expect(
    page.getByRole('button', {name: /^Vers le travail/}),
  ).toContainText(
    /^Vers le travail\d{2}:\d{2}à l'heureVoie B\d{2}:\d{2}\+5 min\d{2}:\d{2}supprimé$/,
  );
});

test('la modale liste les départs, avec le retard et le supprimé', async ({
  page,
}) => {
  await page.goto('/');
  await waitForScene(page);

  await page.getByRole('button', {name: /^Vers le travail/}).click();
  await expect(
    page.getByRole('heading', {name: 'Vers le travail'}),
  ).toBeVisible();

  const departures = page.getByRole('listitem');
  await expect(departures).toHaveCount(4);
  await expect(departures.nth(0)).toContainText('Voie B');
  await expect(departures.nth(1)).toContainText(
    /^(\d{2}:\d{2}){2}\+5 min.*arrivée \d{2}:\d{2}$/,
  );
  await expect(departures.nth(2)).toContainText(/^\d{2}:\d{2}supprimé/);
});
