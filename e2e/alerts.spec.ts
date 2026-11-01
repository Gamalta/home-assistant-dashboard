import {expect, test, waitForScene} from './fixtures';

// Le mock produit 2 alertes : une pile faible et un capteur indisponible.
test.beforeEach(async ({page}) => {
  await page.goto('/');
});

test('affiche le nombre d’alertes dans la pastille', async ({page}) => {
  await expect(page.getByRole('button', {name: '2 alertes'})).toHaveText('2');
});

test('liste les alertes avec leur libellé', async ({page}) => {
  await waitForScene(page);
  await page.getByRole('button', {name: '2 alertes'}).click();

  await expect(page.getByRole('heading', {name: 'Alertes'})).toBeVisible();
  await expect(page.getByRole('alert')).toHaveText([
    'Pile faible : Bouton de la cuisine (12 %)',
    'Indisponible : Capteur de la cave',
  ]);
});

test('place l’alerte fumée en tête, en style critique', async ({page}) => {
  await waitForScene(page);
  await page.evaluate(() =>
    window.__mockSetState?.('binary_sensor.hallway_smoke_detector_smoke', 'on'),
  );
  await page.getByRole('button', {name: '3 alertes'}).click();

  const first = page.getByRole('alert').first();
  await expect(first).toHaveText('Fumée détectée : Détecteur du couloir');
  // Variante pleine et rouge de l'Alert MUI, réservée aux alertes critiques.
  await expect(first).toHaveClass(/MuiAlert-filled/);
  await expect(first).toHaveClass(/MuiAlert-colorError/);
});

test('masque la pastille quand tout va bien', async ({page}) => {
  await expect(page.getByRole('button', {name: '2 alertes'})).toBeVisible();
  await page.evaluate(() => {
    window.__mockSetState?.('sensor.kitchen_button_battery', '80');
    window.__mockSetState?.('sensor.cellar_sensor_battery', '50');
  });

  await expect(page.getByRole('button', {name: /alerte/})).toBeHidden();
});
