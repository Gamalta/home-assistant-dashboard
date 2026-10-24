import {expect, test, waitForScene} from './fixtures';

test.beforeEach(async ({page}) => {
  await page.goto('/');
});

test('affiche les personnes et la météo dans la barre latérale', async ({
  page,
}) => {
  await expect(page).toHaveTitle('Elihome Dashboard');
  await expect(page.getByRole('heading', {name: 'Juliette'})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Roméo'})).toBeVisible();
  await expect(page.getByRole('heading', {name: '20.1°C'})).toBeVisible();
});

test('ouvre et ferme la modale de climatisation du séjour', async ({page}) => {
  await waitForScene(page);
  // Le séjour est la première pièce de la config démo.
  await page.getByRole('button', {name: '22°', exact: true}).first().click();
  const title = page.getByRole('heading', {name: 'Climatisation'});
  await expect(title).toBeVisible();

  // Le bouton de fermeture n'a pas de nom : c'est le dernier de l'en-tête.
  await title.locator('..').getByRole('button').last().click();
  await expect(title).toBeHidden();
});
