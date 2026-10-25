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

// La lumière du séjour porte le nom par défaut du mock, commun à plusieurs
// lumières : on la trouve juste avant sa clim « 22° ».
const salonLight = (page: Page) =>
  page
    .getByRole('button', {name: '22°', exact: true})
    .first()
    .locator('xpath=../preceding-sibling::div[1]//button');

// Un appui long sur le bouton d'une lumière ouvre sa modale.
async function openLight(page: Page, light: Locator) {
  const box = (await light.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
  return modalContent(
    page.getByRole('heading', {name: 'Lumière', exact: true}),
  );
}

// Variateur de l'entrée, éteint et sans lumière dans le modèle 3D : l'allumer
// ne recompile aucun shader, ce qui figerait la page plusieurs secondes.
const dimmer = (page: Page) =>
  page.getByRole('button', {name: 'Variateur de l’entrée'});

// Interrupteur de la première carte, sous le titre « Lumières ».
const firstCardSwitch = (modal: Locator) =>
  modal
    .getByRole('heading', {name: /^Lumières/})
    .locator('..')
    .getByRole('switch')
    .first();

// Les couleurs se lisent dans les styles calculés : en rendu logiciel, une
// capture d'écran prend plusieurs secondes et fait dépasser le délai en CI.
const style = (
  locator: Locator,
  property: 'color' | 'backgroundColor' | 'backgroundImage',
) =>
  locator.evaluate(
    (element, property) => getComputedStyle(element)[property],
    property,
  );

// Composantes de « rgb(r, g, b) » ou « rgba(r, g, b, a) ».
const channels = (css: string) => css.match(/[\d.]+/g)!.map(Number);

const luminance = ([r, g, b]: number[]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

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
    const modal = await openLight(page, dimmer(page));
    await expect(modal.getByText('0 %', {exact: true})).toBeVisible();

    await firstCardSwitch(modal).click();

    await expect(modal.getByText('50 %', {exact: true})).toBeVisible();
  });

  test('les curseurs des autres lumières suivent leur température', async ({
    page,
  }) => {
    const modal = await openLight(page, salonLight(page));
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

  test('une lumière variable sans couleur garde interrupteur et luminosité', async ({
    page,
  }) => {
    const modal = await openLight(page, dimmer(page));

    await expect(modal.getByRole('group')).toBeVisible();
    await expect(modal.getByText('0 %', {exact: true})).toBeVisible();
  });

  test('une lumière tout-ou-rien allumée s’affiche en couleur', async ({
    page,
  }) => {
    const light = page.getByRole('button', {name: 'Interrupteur du débarras'});
    // Allumée, l'icône du bouton prend la couleur de la lumière.
    expect(luminance(channels(await style(light, 'color')))).toBeGreaterThan(
      100,
    );

    const modal = await openLight(page, light);
    const card = modal
      .getByRole('heading', {name: /^Lumières/})
      .locator('xpath=following-sibling::div[1]/div[1]/div[1]');
    expect(
      luminance(channels(await style(card, 'backgroundColor'))),
    ).toBeGreaterThan(100);
  });
});

test.describe('modale de la lumière, en mode clair', () => {
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.goto('/');
    await waitForScene(page);
  });

  test('la jauge de luminosité se voit en mode clair', async ({page}) => {
    const modal = await openLight(page, dimmer(page));
    await firstCardSwitch(modal).click();
    // La jauge est le bouton sous le pourcentage, sa partie pleine son seul div.
    const fill = modal
      .getByText('50 %', {exact: true})
      .locator('..')
      .getByRole('button')
      .locator('div');
    expect((await fill.boundingBox())!.height).toBeGreaterThan(0);

    // Haut du dégradé de la jauge, posé sur le fond de la modale.
    const gradient = await style(fill, 'backgroundImage');
    const [r, g, b, a = 1] = channels(gradient.match(/rgba?\([^)]+\)/)![0]);
    const paper = channels(await style(modal.locator('..'), 'backgroundColor'));
    const top = [r, g, b].map((value, i) => a * value + (1 - a) * paper[i]);
    expect(Math.abs(luminance(top) - luminance(paper))).toBeGreaterThan(40);
  });
});

test.describe('ouverture de la modale de la lumière', () => {
  test.use({viewport: {width: 1280, height: 800}});

  test('elle s’ouvre sans sortir de l’écran ni s’étirer', async ({page}) => {
    // Horloge pilotée : on suit l'ouverture image par image, même en rendu
    // logiciel où le navigateur saute des images.
    await page.clock.install();
    await page.goto('/');
    await waitForScene(page);
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
    const box = (await salonLight(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.clock.runFor(500);
    await page.mouse.up();

    const frames = [];
    for (let i = 0; i < 100; i++) {
      await page.clock.runFor(16);
      frames.push(
        await page.evaluate(() => {
          const title = [...document.querySelectorAll('h5')].find(
            h => h.textContent === 'Lumière',
          )!;
          const container = title.parentElement!.parentElement!;
          const content = container.children[1];
          const ratio = (element: Element) => {
            const {width, height} = element.getBoundingClientRect();
            return width / height;
          };
          return {
            top: container.getBoundingClientRect().top,
            bottom: container.getBoundingClientRect().bottom,
            title: ratio(title),
            content: ratio(content),
            visible: Number(getComputedStyle(content).opacity) > 0.05,
          };
        }),
      );
    }

    const last = frames[frames.length - 1];
    for (const frame of frames) {
      expect(frame.top).toBeGreaterThanOrEqual(0);
      expect(frame.bottom).toBeLessThanOrEqual(800);
      // Rapport largeur / hauteur constant : ni texte ni contenu étiré.
      expect(frame.title / last.title).toBeCloseTo(1, 1);
      if (frame.visible) expect(frame.content / last.content).toBeCloseTo(1, 1);
    }
  });
});
