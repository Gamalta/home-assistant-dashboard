import {expect, test, waitForScene} from './fixtures';

test('éteint toutes les lumières allumées depuis la tuile « Tout éteindre »', async ({
  page,
}) => {
  await page.goto('/');
  await waitForScene(page);

  const tile = page.getByRole('button', {name: /^Tout éteindre/});
  await expect(tile).toContainText(/\d+ allumées?/);
  const count = Number((await tile.textContent())?.match(/(\d+) allumée/)?.[1]);

  await tile.click();
  const title = page.getByRole('heading', {name: 'Tout éteindre'});
  await expect(title).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(count);

  await page.getByRole('button', {name: 'Éteindre', exact: true}).click();
  await expect(title).toBeHidden();
  await expect(tile).toContainText('Tout est éteint');
});
