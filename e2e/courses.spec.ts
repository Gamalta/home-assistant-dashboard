import {expect, test, waitForScene} from './fixtures';

test('gère la liste de courses depuis sa carte', async ({page}) => {
  await page.goto('/');
  await waitForScene(page);

  const card = page.getByRole('button', {name: /^Courses/});
  await expect(card).toContainText('3 articlesLaitPainPommes');
  await card.click();
  await expect(page.getByRole('heading', {name: 'Courses'})).toBeVisible();
  await expect(page.getByRole('checkbox', {name: 'Café'})).toBeChecked();

  await page.getByRole('textbox', {name: 'Nouvel article'}).fill('Beurre');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('checkbox', {name: 'Beurre'})).not.toBeChecked();

  await page.getByRole('checkbox', {name: 'Lait'}).click();
  await expect(page.getByRole('checkbox', {name: 'Lait'})).toBeChecked();

  await page.getByRole('button', {name: 'Retirer les articles cochés'}).click();
  await expect(page.getByRole('checkbox', {name: 'Lait'})).toBeHidden();
  await expect(page.getByRole('checkbox', {name: 'Café'})).toBeHidden();
  await expect(page.getByRole('checkbox')).toHaveCount(3);
  await expect(card).toContainText('3 articlesPainPommesBeurre');
});
