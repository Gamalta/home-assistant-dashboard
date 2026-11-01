import {expect, openSystemModal, test} from './fixtures';

// Les valeurs viennent du mock : 2 mises à jour, sauvegarde échouée hier,
// tablette à 64 % sur secteur.
test.beforeEach(async ({page}) => {
  await page.goto('/');
  await openSystemModal(page);
});

test('liste les mises à jour disponibles', async ({page}) => {
  await expect(page.getByText('2 disponibles')).toBeVisible();
  await expect(
    page.getByText('Home Assistant Core : 2026.10.1 → 2026.10.2'),
  ).toBeVisible();
  await expect(page.getByText('Pont Zigbee : 2.6.0 → 2.7.0')).toBeVisible();
  await expect(page.getByText(/Operating System/)).toBeHidden();
});

test('indique qu’aucune mise à jour n’est disponible', async ({page}) => {
  await page.evaluate(() => {
    window.__mockSetState?.('update.home_assistant_core_update', 'off');
    window.__mockSetState?.('update.zigbee_bridge_update', 'off');
  });
  await expect(page.getByText('Aucune', {exact: true})).toBeVisible();
  await expect(page.getByText(/Home Assistant Core/)).toBeHidden();
});

test('affiche la dernière et la prochaine sauvegarde', async ({page}) => {
  await expect(page.getByText('il y a 3 jours')).toBeVisible();
  await expect(page.getByText('dans 22 heures')).toBeVisible();
});

test('signale l’échec de la dernière sauvegarde', async ({page}) => {
  await expect(
    page.getByText('Échec de la dernière tentative (hier)'),
  ).toBeVisible();
});

test('affiche la batterie, la charge et le chargeur de la tablette', async ({
  page,
}) => {
  await expect(page.getByText('64 %')).toBeVisible();
  await expect(page.getByText('En charge')).toBeVisible();
  await expect(page.getByText('Secteur')).toBeVisible();
});

test('signale la tablette qui ne charge pas', async ({page}) => {
  await page.evaluate(() =>
    window.__mockSetState?.('sensor.wall_tablet_battery_state', 'discharging'),
  );
  await expect(page.getByText('Ne charge pas')).toBeVisible();
});

test('signale la connexion internet coupée', async ({page}) => {
  await expect(page.getByText('Connecté')).toBeVisible();
  await page.evaluate(() =>
    window.__mockSetState?.('binary_sensor.router_wan_status', 'off'),
  );
  await expect(page.getByText('Coupé')).toBeVisible();
});
