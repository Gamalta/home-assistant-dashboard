import {Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Détecteur fictif du couloir de la démo, au repos, pile à 90 %.
const detector = (page: Page) =>
  page.getByRole('button', {name: 'Détecteur de fumée'});
const title = (page: Page) =>
  page.getByRole('heading', {name: 'Détecteur de fumée'});
const setState = (page: Page, key: string, state: string) =>
  page.evaluate(
    ([entityId, value]) => window.__mockSetState?.(entityId, value),
    [`binary_sensor.hallway_smoke_detector_${key}`, state],
  );

async function openSmokeModal(page: Page) {
  await detector(page).click();
  await expect(title(page)).toBeVisible();
}

test.beforeEach(async ({page}) => {
  await page.goto('/');
  await waitForScene(page);
});

// Un test par scénario de docs/specs/appareils-sur-pile.md.
test('affiche le détecteur de fumée dans la scène', async ({page}) => {
  await expect(detector(page)).toHaveText('90%');
  // Le voyant est le seul cercle de l'icône du détecteur.
  await expect(detector(page).locator('circle')).toHaveAttribute(
    'fill',
    '#34C759',
  );
});

test('ouvre la modale du détecteur au repos', async ({page}) => {
  await openSmokeModal(page);
  // L'en-tête et le contenu de la modale partagent le même parent.
  const modal = title(page).locator('../..');

  await expect(
    modal.getByRole('img', {name: 'Détecteur de fumée, voyant vert'}),
  ).toBeVisible();
  await expect(modal.getByText('Aucune fumée')).toBeVisible();
  await expect(modal.getByText('90%')).toBeVisible();
  await expect(modal.getByText('Normale')).toBeVisible();
  await expect(modal.getByText('OK', {exact: true})).toBeVisible();
  await expect(modal.getByText(/^il y a /)).toBeVisible();
  await expect(modal.getByRole('button', {name: 'Tester'})).toBeVisible();
});

test('passe en alerte quand le détecteur voit de la fumée', async ({page}) => {
  await openSmokeModal(page);
  await expect(page.getByText('Aucune fumée')).toBeVisible();

  await setState(page, 'smoke', 'on');
  await expect(page.getByText('Fumée détectée !')).toBeVisible();
  await expect(
    page.getByRole('img', {name: 'Détecteur de fumée, voyant rouge'}),
  ).toBeVisible();

  // Le bouton de fermeture n'a pas de nom : c'est le dernier de l'en-tête.
  await title(page).locator('..').getByRole('button').last().click();
  await expect(title(page)).toBeHidden();
  await expect(detector(page)).toHaveText('Fumée');
});

test('avertit pour la pile ou l’autoprotection du détecteur', async ({
  page,
}) => {
  await setState(page, 'tamper', 'on');
  await expect(detector(page).locator('circle')).toHaveAttribute(
    'fill',
    '#FF9500',
  );

  await openSmokeModal(page);
  await expect(
    page.getByRole('img', {name: 'Détecteur de fumée, voyant orange'}),
  ).toBeVisible();
  await expect(page.getByText('Aucune fumée')).toBeVisible();
  await expect(page.getByText('Déclenchée')).toBeVisible();
});
