import {expect, test, waitForScene} from './fixtures';

test('gère la liste de courses depuis le menu rapide', async ({page}) => {
  await page.goto('/');
  await waitForScene(page);

  const dial = page.getByRole('button', {name: 'Menu rapide'});
  await dial.click();
  await page.getByRole('menuitem', {name: 'Courses'}).click();
  await expect(dial).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('heading', {name: 'Courses'})).toBeVisible();
  await expect(page.getByRole('checkbox', {name: 'Café'})).toBeChecked();
  await expect(page.getByRole('checkbox', {name: 'Café'})).toContainText('☕');

  // clientHeight ignore l'échelle de l'animation d'ouverture.
  const list = page.getByRole('region', {name: 'Articles'});
  const height = await list.evaluate(el => el.clientHeight);
  await expect(page.getByRole('button', {name: 'Ajouter'})).toBeDisabled();
  const long = 'Papier cuisson pour le four';
  for (const summary of ['Beurre', 'Œufs', long, 'Thé', 'Piles']) {
    await page.getByRole('textbox', {name: 'Nouvel article'}).fill(summary);
    await page.keyboard.press('Enter');
  }
  await expect(page.getByRole('checkbox', {name: 'Beurre'})).not.toBeChecked();
  await expect(page.getByRole('checkbox', {name: 'Piles'})).toContainText('🛒');
  const width = (name: string) =>
    page.getByRole('checkbox', {name}).evaluate(el => el.clientWidth);
  expect(await width(long)).toBe(await width('Beurre'));
  expect(await list.evaluate(el => el.clientHeight)).toBe(height);
  await expect
    .poll(() => list.evaluate(el => el.scrollHeight > el.clientHeight))
    .toBe(true);
  await expect(dial).toHaveAttribute('aria-expanded', 'false');

  await page.getByRole('checkbox', {name: 'Lait'}).click();
  await expect(page.getByRole('checkbox', {name: 'Lait'})).toBeChecked();

  await page.getByRole('button', {name: 'Retirer les articles cochés'}).click();
  await expect(page.getByRole('checkbox', {name: 'Lait'})).toBeHidden();
  await expect(page.getByRole('checkbox', {name: 'Café'})).toBeHidden();
  await expect(page.getByRole('checkbox')).toHaveCount(7);
});
