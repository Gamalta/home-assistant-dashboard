import {Locator, Page} from '@playwright/test';
import {expect, test, waitForScene} from './fixtures';

// Le bouton du volet n'a pas de nom : on le reconnaît à son icône de fenêtre.
const shutterButton = (page: Page) =>
  page.locator('button:has(path[transform="rotate(90 480 -480)"])').first();

// Contenu de la modale, sous l'en-tête qui porte le titre. Il apparaît en
// fondu : on attend la fin de l'animation avant d'y cliquer. Sous forte
// charge, framer-motion s'arrête parfois à 0,99 au lieu de 1.
async function modalContent(title: Locator) {
  const content = title.locator('xpath=../following-sibling::div[1]');
  await expect
    .poll(() => content.evaluate(e => Number(getComputedStyle(e).opacity)))
    .toBeGreaterThan(0.95);
  return content;
}

// Appui long sur la lumière du séjour, juste avant sa clim « 22° » : le bouton
// de la lumière n'a pas de nom.
async function openSalonLight(page: Page) {
  const climate = page.getByRole('button', {name: '22°', exact: true}).first();
  const box = (await climate
    .locator('xpath=../preceding-sibling::div[1]//button')
    .boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
  return modalContent(
    page.getByRole('heading', {name: 'Lumière', exact: true}),
  );
}

// Interrupteur du plafonnier du séjour, éteint : la première carte sous le
// titre « Lumières ».
const salonLightSwitch = (modal: Locator) =>
  modal
    .getByRole('heading', {name: /^Lumières/})
    .locator('..')
    .getByRole('switch')
    .first();

// Luminance moyenne de l'élément, lue sur une capture.
async function luminance(page: Page, locator: Locator) {
  const png = await locator.screenshot();
  return page.evaluate(async base64 => {
    const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d')!;
    context.drawImage(bitmap, 0, 0);
    const {data} = context.getImageData(0, 0, bitmap.width, bitmap.height);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return sum / (data.length / 4);
  }, png.toString('base64'));
}

test.describe('modale du volet', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
    await waitForScene(page);
    await shutterButton(page).click();
  });

  test('fermer la modale pendant l’animation du volet', async ({page}) => {
    const title = page.getByRole('heading', {name: 'Volet roulant'});
    // Monter, arrêter, descendre : la descente est le dernier bouton.
    await (await modalContent(title)).getByRole('button').last().click();

    // Pendant toute la sortie, la modale rétrécit vers son bouton sans revenir.
    const reappeared = page.evaluate(
      () =>
        new Promise<boolean>(resolve => {
          const heading = [...document.querySelectorAll('h5')].find(
            h => h.textContent === 'Volet roulant',
          )!;
          const container = heading.parentElement!.parentElement!;
          const width = container.getBoundingClientRect().width;
          let shrunk = false;
          const check = () => {
            if (!container.isConnected) return resolve(false);
            const current = container.getBoundingClientRect().width;
            const opacity = Number(getComputedStyle(container).opacity);
            if (current < width * 0.8) shrunk = true;
            else if (shrunk && current > width * 0.95 && opacity > 0.5)
              return resolve(true);
            requestAnimationFrame(check);
          };
          check();
        }),
    );
    // Le bouton de fermeture n'a pas de nom : c'est le dernier de l'en-tête.
    await title.locator('..').getByRole('button').last().click();

    expect(await reappeared).toBe(false);
    await expect(title).toBeHidden();
  });

  test('rouvrir la modale juste après sa fermeture', async ({page}) => {
    const title = page.getByRole('heading', {name: 'Volet roulant'});
    await modalContent(title);
    const container = title.locator('../..');
    await title.locator('..').getByRole('button').last().click();
    // La modale se replie sur son bouton et le doigt retape aussitôt dessus,
    // sans attendre la fin de la sortie.
    await expect
      .poll(async () => (await container.boundingBox())?.width ?? 0, {
        intervals: [50],
      })
      .toBeLessThan(80);
    await shutterButton(page).click({force: true});

    // La sortie dure 1 s : passé ce délai, la modale doit être rouverte.
    await page.waitForTimeout(1500);
    await expect(title).toBeVisible();
    await modalContent(title);
  });
});

test.describe('modale de la lumière', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
    await waitForScene(page);
  });

  test('allumer la lumière met à jour sa luminosité', async ({page}) => {
    const modal = await openSalonLight(page);
    await expect(modal.getByText('0 %', {exact: true})).toBeVisible();

    await salonLightSwitch(modal).click();

    await expect(modal.getByText('100 %', {exact: true})).toBeVisible();
  });

  test('la jauge de luminosité se voit en mode clair', async ({page}) => {
    await page.evaluate(() => localStorage.setItem('theme', 'light'));
    await page.reload();
    await waitForScene(page);
    const modal = await openSalonLight(page);
    // La jauge est le bouton sous le pourcentage affiché.
    const gauge = modal
      .getByText(/^\d+ %$/)
      .locator('..')
      .getByRole('button');
    const off = await luminance(page, gauge);

    await salonLightSwitch(modal).click();
    await expect(modal.getByText('100 %', {exact: true})).toBeVisible();

    expect(Math.abs((await luminance(page, gauge)) - off)).toBeGreaterThan(40);
  });

  test('les curseurs des autres lumières suivent leur température', async ({
    page,
  }) => {
    const modal = await openSalonLight(page);
    // Les onglets n'ont qu'une icône : on passe par leur valeur.
    await modal.locator('button[value="color_temp"]').click();

    // Curseur du Hue Play sur la roue des températures (la 2ᵉ roue) : allumé
    // à 3993 K sur une plage de 2702 à 6535 K, il est vers le tiers du haut.
    const wheel = modal.locator('canvas').nth(1);
    const picker = wheel.locator('xpath=following-sibling::div[1]');
    const height = async () => {
      const w = (await wheel.boundingBox())!;
      const p = (await picker.boundingBox())!;
      return (p.y + p.height / 2 - w.y) / w.height;
    };
    await expect.poll(height).toBeGreaterThan(0.25);
    expect(await height()).toBeLessThan(0.45);
  });
});
