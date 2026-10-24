import {expect, test, waitForScene} from './fixtures';

test('suit le crédit immobilier depuis sa carte', async ({page}) => {
  await page.goto('/');
  await waitForScene(page);

  const card = page.getByRole('button', {name: /^Crédit/});
  await expect(card).toContainText(
    /^Crédit[\d\s]+\s€Capital restant dû\d+ % remboursé$/,
  );

  await card.click();
  await expect(page.getByRole('heading', {name: 'Crédit'})).toBeVisible();
  await expect(
    page.getByText('Capital restant dû sur 250 000 €'),
  ).toBeVisible();
  await expect(page.getByText('Mensualité')).toBeVisible();
  await expect(page.getByText(/994\s€ \+ 28\s€ d'assurance/)).toBeVisible();
  await expect(page.getByText(/\d+ \/ 300/)).toBeVisible();
  await expect(page.locator('svg path').first()).toBeVisible();
});
