import type {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
});

async function openEnergyModal(page: Page) {
  await page.getByRole('button', {name: /^Énergie/}).click();
  await expect(page.getByRole('heading', {name: 'Énergie'})).toBeVisible();
  return page.getByRole('img', {name: /^Heures creuses, Heures pleines, /});
}

// Libellé de la période en cours, tel que le mock et la tablette le calculent.
const month = (date: Date) =>
  date.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'});

test('la carte « Énergie » affiche la puissance, la période et le coût du jour', async ({
  page,
}) => {
  await expect(page.getByRole('button', {name: /^Énergie/})).toContainText(
    /^Énergie\d+(,\d)? k?VAHeures (pleines|creuses)Aujourd’hui : \d+,\d{2}\s€$/,
  );
});

test('la carte « Énergie » ouvre le mois en cours, comparé au mois précédent', async ({
  page,
}) => {
  const chart = await openEnergyModal(page);

  await expect(chart).toHaveAccessibleName(
    'Heures creuses, Heures pleines, Mois précédent',
  );
  await expect(page.getByText(month(new Date()), {exact: true})).toBeVisible();
  await expect(page.getByText(/^\d[\d\s]*(,\d)? kWh$/).first()).toBeVisible();
  await expect(
    page.getByText(/^[−+]?\d+\s% par rapport à .+ \d{4}, à date égale$/),
  ).toBeVisible();
  await expect(page.getByText(/^.+ sur 6 kVA$/)).toBeVisible();
  // Un segment heures pleines et un segment heures creuses par jour écoulé.
  await expect(chart.locator('.MuiBarChart-element')).toHaveCount(
    2 * new Date().getDate(),
  );
});

test('le menu rapide ouvre la même modale, avec le prix du kWh de chaque période', async ({
  page,
}) => {
  await page.getByRole('button', {name: 'Menu rapide'}).click();
  await page.getByRole('menuitem', {name: 'Énergie'}).click();

  await expect(page.getByRole('heading', {name: 'Énergie'})).toBeVisible();
  const totals = page.getByRole('region', {name: 'Totaux'});
  await expect(totals).toContainText(/Heures pleines0,27\s€\/kWh/);
  await expect(totals).toContainText(/Heures creuses0,21\s€\/kWh/);
});

test('le total et l’écart restent hors du tracé, sous le survol', async ({
  page,
}) => {
  const chart = await openEnergyModal(page);
  const total = page.getByText(/^\d[\d\s]*(,\d)? kWh$/).first();
  await expect(total).toBeVisible();

  const totalBox = (await total.boundingBox())!;
  const chartBox = (await chart.boundingBox())!;
  expect(totalBox.y + totalBox.height).toBeLessThanOrEqual(chartBox.y);
});

test('change d’échelle : semaine jour par jour, année mois par mois', async ({
  page,
}) => {
  const chart = await openEnergyModal(page);
  const bars = chart.locator('.MuiBarChart-element');
  const now = new Date();

  await page.getByRole('button', {name: 'Semaine', exact: true}).click();
  await expect(page.getByText(/^semaine du /)).toBeVisible();
  await expect(bars).toHaveCount(2 * (((now.getDay() + 6) % 7) + 1));
  await expect(chart).toHaveAccessibleName(
    'Heures creuses, Heures pleines, Semaine précédente',
  );

  await page.getByRole('button', {name: 'Année', exact: true}).click();
  await expect(
    page.getByText(String(now.getFullYear()), {exact: true}),
  ).toBeVisible();
  await expect(bars).toHaveCount(2 * (now.getMonth() + 1));
  await expect(page.getByRole('button', {name: 'Un an avant'})).toBeDisabled();
});

test('compare au même mois un an avant : la série et l’écart changent', async ({
  page,
}) => {
  const chart = await openEnergyModal(page);
  const lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1, lastYear.getMonth(), 1);

  await page.getByRole('button', {name: 'Un an avant'}).click();

  await expect(chart).toHaveAccessibleName(
    'Heures creuses, Heures pleines, Un an avant',
  );
  await expect(
    chart.locator('.MuiLineChart-line[data-series="reference"]'),
  ).toBeVisible();
  await expect(
    page.getByText(
      new RegExp(
        `^[−+]?\\d+\\s% par rapport à ${month(lastYear)}, à date égale$`,
      ),
    ),
  ).toBeVisible();
  await expect(page.getByRole('region', {name: 'Totaux'})).toContainText(
    /Un an avant\d[\d\s]* kWh\d[\d\s]*,\d{2}\s€/,
  );
});

test('recule d’un mois puis revient, sans dépasser le mois en cours', async ({
  page,
}) => {
  await openEnergyModal(page);
  const next = page.getByRole('button', {name: 'Période suivante'});
  const now = new Date();
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  await expect(next).toBeDisabled();

  await page.getByRole('button', {name: 'Période précédente'}).click();
  await expect(page.getByText(month(previous), {exact: true})).toBeVisible();
  // Un mois écoulé se compare en entier, sans « à date égale ».
  await expect(
    page.getByText(/^[−+]?\d+\s% par rapport à .+ \d{4}$/),
  ).toBeVisible();
  await expect(next).toBeEnabled();

  await next.click();
  await expect(page.getByText(month(now), {exact: true})).toBeVisible();
  await expect(next).toBeDisabled();
});
