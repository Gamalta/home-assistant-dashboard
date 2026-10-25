import {expect, test, waitForScene} from './fixtures';

test('gère la liste de courses depuis le menu des scénarios', async ({
  page,
}) => {
  await page.goto('/');
  await waitForScene(page);

  const dial = page.getByRole('button', {name: 'Scénarios'});
  await dial.click();
  await page.getByRole('menuitem', {name: 'Courses'}).click();
  await expect(dial).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('heading', {name: 'Courses'})).toBeVisible();
  await expect(page.getByRole('checkbox', {name: 'Café'})).toBeChecked();

  await page.getByRole('textbox', {name: 'Nouvel article'}).fill('Beurre');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('checkbox', {name: 'Beurre'})).not.toBeChecked();
  await expect(dial).toHaveAttribute('aria-expanded', 'false');

  await page.getByRole('checkbox', {name: 'Lait'}).click();
  await expect(page.getByRole('checkbox', {name: 'Lait'})).toBeChecked();

  await page.getByRole('button', {name: 'Retirer les articles cochés'}).click();
  await expect(page.getByRole('checkbox', {name: 'Lait'})).toBeHidden();
  await expect(page.getByRole('checkbox', {name: 'Café'})).toBeHidden();
  await expect(page.getByRole('checkbox')).toHaveCount(3);
});
