import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

const LOANS = ['Prêt principal', 'PTZ', 'Action Logement', 'Prêt travaux'];

async function openMortgage(page: Page) {
  await page.goto('/');
  await waitForScene(page);
  const dial = page.getByRole('button', {name: 'Menu rapide'});
  await dial.click();
  // Une seule entrée pour les 4 prêts de la démo.
  await expect(page.getByRole('menuitem', {name: 'Crédit'})).toHaveCount(1);
  await page.getByRole('menuitem', {name: 'Crédit'}).click();
  await expect(dial).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('heading', {name: 'Crédit'})).toBeVisible();
}

test('résume tous les prêts depuis le menu rapide', async ({page}) => {
  await openMortgage(page);

  await expect(
    page.getByRole('img', {name: /^\d+ % remboursé$/}),
  ).toBeVisible();
  await expect(page.getByText(/empruntés$/).locator('..')).toHaveText(
    /^Capital restant dû[\d\s]+\s€sur 335\s000\s€ empruntés$/,
  );
  await expect(page.getByText(/^\+ \d+\s€ d'assurance$/)).toBeVisible();
  await expect(page.getByText(/^encore \d+ ans?$/)).toBeVisible();
  for (const label of [
    'Mensualité',
    'Dernière échéance',
    'Intérêts payés',
    'Intérêts restants',
  ]) {
    await expect(page.getByText(label)).toBeVisible();
  }
});

test('montre l’avancement de chaque prêt et le coût du crédit', async ({
  page,
}) => {
  await openMortgage(page);

  await page.getByRole('button', {name: 'Historique'}).click();
  await expect(page.getByRole('img', {name: LOANS.join(', ')})).toBeVisible();
  for (const label of LOANS) {
    await expect(
      page.getByText(new RegExp(`^${label} · \\d+ %$`)),
    ).toBeVisible();
  }

  const costs = page.getByRole('img', {name: 'Capital, Intérêts, Assurance'});
  await expect(costs).toBeVisible();
  await expect(
    page.getByText(
      /^Coût du crédit : [\d\s]+\s€ d'intérêts et [\d\s]+\s€ d'assurance$/,
    ),
  ).toBeVisible();
  await costs.hover();
  await expect(page.getByRole('table')).toContainText(
    /20\d\d.*Capital.*Intérêts.*Assurance/,
  );

  await page.getByRole('button', {name: 'Avancement'}).click();
  await expect(costs).toBeHidden();
  await expect(page.getByRole('img', {name: /% remboursé$/})).toBeVisible();
});
