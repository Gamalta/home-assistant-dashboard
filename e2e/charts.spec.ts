import {Page} from '@playwright/test';
import {expect, openSystemModal, test, waitForScene} from './fixtures';

async function openClimateHistory(page: Page) {
  await page.goto('/');
  await waitForScene(page);
  // Le séjour est la première pièce de la config démo.
  await page.getByRole('button', {name: '22°', exact: true}).first().click();
  const history = page.getByRole('button', {name: 'Historique'});
  // Un clic pendant l'animation d'ouverture de la modale peut tomber à côté.
  await expect(history).toBeVisible();
  await history.click();
  return page.getByRole('img', {name: 'Température, Humidité'});
}

test('trace l’historique de la température et de l’humidité', async ({
  page,
}) => {
  const chart = await openClimateHistory(page);

  await expect(chart).toBeVisible();
  await expect(chart.locator('.MuiLineChart-line')).toHaveCount(2);
  // La couleur est une variable du thème : elle suit le mode clair ou sombre.
  await expect(
    chart.locator('.MuiLineChart-line[data-series="temperature"]'),
  ).toHaveAttribute('stroke', 'var(--mui-palette-warning-main)');
  await expect(chart.locator('.MuiLineChart-area')).toHaveAttribute(
    'fill',
    /^url\(#/,
  );
  await expect(page.getByText(/^max: \d+(,\d)?°C$/)).toBeVisible();
  await expect(page.getByText(/^min: \d+(,\d)?°C$/)).toBeVisible();
});

test('donne la valeur et l’heure au-dessus du curseur', async ({page}) => {
  const chart = await openClimateHistory(page);
  // Attend la fin de l'animation d'ouverture avant de viser.
  await chart.click({trial: true});
  const box = await chart.boundingBox();
  if (!box) throw new Error('graphique absent');
  const pointer = {x: box.x + box.width / 2, y: box.y + box.height * 0.75};
  await page.mouse.move(pointer.x, pointer.y);

  const tooltip = page.getByRole('table');
  await expect(tooltip).toContainText(/\d{2}:\d{2}/);
  await expect(tooltip).toContainText(/Température\s*\d+(,\d)?°C/);
  await expect(tooltip).toContainText(/Humidité\s*\d+(,\d)?%/);
  const tooltipBox = await tooltip.boundingBox();
  expect(tooltipBox!.y + tooltipBox!.height).toBeLessThan(pointer.y);
});

test('revient au réglage depuis l’historique', async ({page}) => {
  const chart = await openClimateHistory(page);
  await expect(chart).toBeVisible();

  await page.getByRole('button', {name: 'Réglage'}).click();
  await expect(chart).toBeHidden();
  await expect(page.getByRole('button', {name: 'Historique'})).toBeVisible();
});

test.describe('au doigt', () => {
  test.use({hasTouch: true});

  test('affiche la valeur touchée au-dessus du doigt', async ({page}) => {
    const chart = await openClimateHistory(page);
    // Attend la fin de l'animation d'ouverture avant de viser.
    await chart.click({trial: true});
    const box = await chart.boundingBox();
    if (!box) throw new Error('graphique absent');
    const finger = {x: box.x + box.width / 2, y: box.y + box.height / 2};
    // Un doigt posé, ce que `tap()` ne simule pas : il relâche aussitôt.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [finger],
    });

    const tooltip = page.getByRole('table');
    await expect(tooltip).toContainText(/Température\s*\d+(,\d)?°C/);
    const tooltipBox = await tooltip.boundingBox();
    expect(tooltipBox!.y + tooltipBox!.height).toBeLessThan(finger.y);
  });
});

test('trace les graphiques de la modale Système', async ({page}) => {
  await page.goto('/');
  await openSystemModal(page);

  for (const label of ['Mémoire', 'Température', 'Processeur']) {
    const chart = page.getByRole('img', {name: label, exact: true});
    await expect(chart).toBeVisible();
    await expect(chart.locator('.MuiLineChart-line')).toHaveCount(1);
  }
  const memory = page.getByRole('img', {name: 'Mémoire', exact: true});
  await memory.hover();
  await expect(page.getByRole('table')).toContainText(/Mémoire\s*\d+(,\d)?%/);
});
