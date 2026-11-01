import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Interrupteurs fictifs de la démo : séjour à 54 %, cuisine à 12 %, chambre à 85 %.
const switchButton = (page: Page, name: string) =>
  page.getByRole('button', {name: `Interrupteur ${name}`});

// error.main du thème clair.
const RED = 'rgb(211, 47, 47)';

test.beforeEach(async ({page}) => {
  // Le thème suit l'heure par défaut : on fixe le clair pour la couleur d'alerte.
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('/');
  await waitForScene(page);
});

// Un test par scénario de docs/specs/appareils-sur-pile.md.
test('affiche le niveau de pile dans la scène', async ({page}) => {
  const kitchen = switchButton(page, 'de la cuisine');
  const bedroom = switchButton(page, 'de la chambre');

  await expect(switchButton(page, 'du séjour')).toHaveText('54%');
  await expect(kitchen).toHaveText('12%');
  await expect(kitchen.getByText('12%')).toHaveCSS('color', RED);
  await expect(bedroom).toHaveText('85%');
  await expect(bedroom.getByText('85%')).not.toHaveCSS('color', RED);

  await page.evaluate(() =>
    window.__mockSetState?.('sensor.bedroom_button_battery', '8'),
  );
  await expect(bedroom).toHaveText('8%');
  await expect(bedroom.getByText('8%')).toHaveCSS('color', RED);
});

test('ouvre la modale d’un interrupteur', async ({page}) => {
  await switchButton(page, 'de la cuisine').click();
  const title = page.getByRole('heading', {name: 'Interrupteur de la cuisine'});
  await expect(title).toBeVisible();
  await expect(
    page.getByRole('img', {name: 'Interrupteur sans fil, voyant rouge'}),
  ).toBeVisible();
  await expect(page.getByText('Pile faible, à remplacer')).toHaveCSS(
    'color',
    RED,
  );
  await expect(
    page.getByRole('progressbar', {name: 'Niveau de pile'}),
  ).toHaveAttribute('aria-valuenow', '12');
  await expect(page.getByText(/^Mis à jour /)).toBeVisible();

  // Le bouton de fermeture n'a pas de nom : c'est le dernier de l'en-tête.
  await title.locator('..').getByRole('button').last().click();
  await expect(title).toBeHidden();

  await switchButton(page, 'de la chambre').click();
  await expect(
    page.getByRole('img', {name: 'Interrupteur sans fil, voyant vert'}),
  ).toBeVisible();
  await expect(page.getByText('Pile en bon état')).toBeVisible();
  await expect(
    page.getByRole('progressbar', {name: 'Niveau de pile'}),
  ).toHaveAttribute('aria-valuenow', '85');
});
