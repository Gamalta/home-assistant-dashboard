import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

async function openMortgage(page: Page) {
  await page.goto('/');
  await waitForScene(page);
  const card = page.getByRole('button', {name: /^Crédit/});
  await expect(card).toContainText(
    /^Crédit[\d\s]+\s€Capital restant dû\d+ % remboursé$/,
  );
  await card.click();
  await expect(page.getByRole('heading', {name: 'Crédit'})).toBeVisible();
}

test('illustre l’avancement du crédit depuis sa carte', async ({page}) => {
  await openMortgage(page);

  await expect(
    page.getByRole('img', {name: /^\d+ % remboursé$/}),
  ).toBeVisible();
  await expect(page.getByText(/empruntés$/).locator('..')).toHaveText(
    /^Capital restant dû[\d\s]+\s€sur 250\s000\s€ empruntés$/,
  );
  await expect(page.getByText(/^994\s€$/)).toBeVisible();
  await expect(page.getByText(/^\+ 28\s€ d'assurance$/)).toBeVisible();
  await expect(page.getByText(/^\d+ \/ 300 échéances$/)).toBeVisible();
  for (const label of ['Fin du prêt', 'Intérêts payés', 'Intérêts restants']) {
    await expect(page.getByText(label)).toBeVisible();
  }
});

test('trace le capital restant dû dans l’historique', async ({page}) => {
  await openMortgage(page);

  await page.getByRole('button', {name: 'Historique'}).click();
  const chart = page.getByRole('img', {name: 'Capital restant dû, Projection'});
  await expect(chart).toBeVisible();
  await expect(chart.locator('.MuiLineChart-line')).toHaveCount(2);
  await chart.hover();
  await expect(page.getByRole('table')).toContainText(
    /20\d\d.*Projection\s*[\d\s]+\s€/,
  );

  await page.getByRole('button', {name: 'Avancement'}).click();
  await expect(chart).toBeHidden();
  await expect(page.getByRole('img', {name: /% remboursé$/})).toBeVisible();
});
