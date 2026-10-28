import {Locator, Page} from '@playwright/test';
import {expect, swipeLeft, test, waitForScene} from './fixtures';

declare global {
  interface Window {
    __linkedPrograms: number;
  }
}

// Un test par scénario de docs/specs/version-mobile.md.

// Téléphone en portrait, écran tactile. Avec isMobile, comme sur un vrai
// téléphone, un élément qui déborde élargit toute la page.
test.use({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});

test.beforeEach(async ({page}) => {
  await page.addInitScript(() => {
    window.__linkedPrograms = 0;
    const proto = WebGL2RenderingContext.prototype;
    const {linkProgram} = proto;
    proto.linkProgram = function (program) {
      window.__linkedPrograms++;
      linkProgram.call(this, program);
    };
  });
  await page.goto('/');
  await waitForScene(page);
});

const chip = (page: Page, name: string) =>
  page
    .getByRole('group', {name: 'Choix de la pièce'})
    .getByRole('button', {name, exact: true});

// drei pose les étiquettes dans le conteneur d'événements de R3F, au-dessus
// de celui du canvas.
const sceneLabels = (page: Page) =>
  page.locator('canvas').locator('xpath=../..').getByRole('button');

// Cadre visible de la scène : sous l'en-tête, au-dessus des puces.
async function visibleScene(page: Page) {
  const header = (await page.getByRole('banner').boundingBox())!;
  const chips = (await chip(page, 'Séjour').boundingBox())!;
  return {top: header.y + header.height, bottom: chips.y};
}

async function labelsInside(labels: Locator, top: number, bottom: number) {
  return labels.evaluateAll(
    (buttons, [top, bottom]) =>
      buttons.every(button => {
        const box = button.getBoundingClientRect();
        return (
          box.top >= top &&
          box.bottom <= bottom &&
          box.left >= 0 &&
          box.right <= innerWidth
        );
      }),
    [top, bottom],
  );
}

// Un appui long ouvre la modale d'une lumière.
async function longPress(page: Page, target: Locator) {
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
}

async function openFoyer(page: Page) {
  await page.getByRole('button', {name: 'Foyer'}).tap();
  // Le contenu d'une modale n'apparaît qu'après son animation d'ouverture.
  await expect(page.getByRole('list', {name: 'Réglages'})).toBeVisible();
}

test('le sélecteur de vue remplace la barre latérale sous 600 px', async ({
  page,
}) => {
  const header = page.getByRole('banner');
  const views = header.getByRole('group', {name: 'Affichage'});
  await expect(views.getByRole('button', {name: '3D'})).toBeVisible();
  await expect(views.getByRole('button', {name: 'Pièces'})).toBeVisible();
  await expect(header.getByRole('button', {name: 'Foyer'})).toBeVisible();
  expect((await header.boundingBox())!.y).toBeLessThan(20);
  await expect(page.getByRole('separator')).toHaveCount(0);
  await expect(page.getByRole('navigation')).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Météo'})).toHaveCount(0);
});

test("l'en-tête et le carrousel évitent l'encoche et la barre d'accueil", async ({
  page,
}) => {
  // Zones sûres d'un iPhone à Dynamic Island, en portrait.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', {
    insets: {top: 59, bottom: 34},
  });
  const header = page.getByRole('banner');
  const views = (await header
    .getByRole('group', {name: 'Affichage'})
    .boundingBox())!;
  const foyer = (await header
    .getByRole('button', {name: 'Foyer'})
    .boundingBox())!;
  const cards = (await page.getByLabel('Pièces', {exact: true}).boundingBox())!;

  expect(views.y).toBeGreaterThanOrEqual(59);
  expect(foyer.y).toBeGreaterThanOrEqual(59);
  expect(cards.y + cards.height).toBeLessThanOrEqual(844 - 34);
  // Entre les deux îlots, le doigt atteint la scène 3D.
  const between = await page.evaluate(
    y => !!document.elementFromPoint(innerWidth / 2, y)?.closest('header'),
    views.y + views.height / 2,
  );
  expect(between).toBe(false);
});

test.describe('tablette', () => {
  test.use({viewport: {width: 1280, height: 800}});

  test('la tablette garde sa disposition à partir de 600 px', async ({
    page,
  }) => {
    await expect(page.getByRole('separator')).toBeVisible();
    await expect(page.getByRole('group', {name: 'Affichage'})).toHaveCount(0);
  });
});

test("la vue 3D s'ouvre sur la première pièce", async ({page}) => {
  await expect(chip(page, 'Séjour')).toHaveAttribute('aria-pressed', 'true');
  const card = page.getByRole('region', {name: 'Séjour'});
  await expect(
    card.getByRole('button', {name: /Plafonnier du séjour/}),
  ).toBeVisible();

  // Autant d'étiquettes dans la scène que de tuiles sur la carte.
  const tiles = await card.getByRole('button').count();
  await expect(sceneLabels(page)).toHaveCount(tiles);
});

test('choisir une pièce y amène la caméra', async ({page}) => {
  test.slow();
  const programs = await page.evaluate(() => window.__linkedPrograms);
  const {top, bottom} = await visibleScene(page);

  await chip(page, 'Cuisine').tap();

  await expect(chip(page, 'Cuisine')).toHaveAttribute('aria-pressed', 'true');
  const card = page.getByRole('region', {name: 'Cuisine'});
  await expect(card).toBeInViewport({ratio: 0.9});
  const tiles = await card.getByRole('button').count();
  const labels = sceneLabels(page);
  await expect(labels).toHaveCount(tiles);
  // À l'arrivée, toutes les étiquettes de la cuisine sont dans le cadre.
  await expect.poll(() => labelsInside(labels, top, bottom)).toBe(true);
  expect(await page.evaluate(() => window.__linkedPrograms)).toBe(programs);
});

test('glisser le carrousel change de pièce', async ({page}) => {
  const card = (await page
    .getByRole('region', {name: 'Séjour'})
    .getByRole('heading')
    .boundingBox())!;

  await swipeLeft(page, card.x + 200, card.y + card.height / 2);

  await expect(chip(page, 'Cuisine')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('region', {name: 'Cuisine'})).toBeInViewport({
    ratio: 0.9,
  });
});

test('les cartes du carrousel ont toutes la même taille', async ({page}) => {
  const cards = page.getByRole('region');
  // Les quatorze pièces de la démo, d'un à cinq équipements.
  await expect(cards).toHaveCount(14);
  const heights = await cards.evaluateAll(sections =>
    sections.map(section => section.getBoundingClientRect().height),
  );
  expect(new Set(heights).size).toBe(1);

  const tiles = await cards.getByRole('button').evaluateAll(buttons =>
    buttons.map(button => {
      const {width, height} = button.getBoundingClientRect();
      return `${Math.round(width)}×${Math.round(height)}`;
    }),
  );
  expect(new Set(tiles).size).toBe(1);

  // Les cinq équipements du séjour défilent dans leur carte.
  const grid = page
    .getByRole('region', {name: 'Séjour'})
    .getByRole('button')
    .first()
    .locator('xpath=../..');
  expect(
    await grid.evaluate(element => element.scrollHeight > element.clientHeight),
  ).toBe(true);
});

test('un appui court sur une tuile bascule la lumière', async ({page}) => {
  const tile = page
    .getByRole('region', {name: 'Séjour'})
    .getByRole('button', {name: /Plafonnier du séjour/});
  await expect(tile).toHaveAttribute('aria-pressed', 'false');

  await tile.tap();

  await expect(tile).toHaveAttribute('aria-pressed', 'true');
  await expect(tile).not.toContainText('Éteinte');
});

test("un appui long sur une tuile ouvre sa modale au centre de l'écran", async ({
  page,
}) => {
  const tile = page
    .getByRole('region', {name: 'Séjour'})
    .getByRole('button', {name: /Plafonnier du séjour/});

  await longPress(page, tile);

  const title = page.getByRole('heading', {name: 'Lumière', exact: true});
  await expect(title).toBeVisible();
  const card = title.locator('xpath=../..');
  // Le ressort de l'animation finit par centrer la carte, à 12 px des bords.
  await expect
    .poll(async () => {
      const box = (await card.boundingBox())!;
      return [box.x, box.width, Math.round(2 * box.y + box.height)];
    })
    .toEqual([12, 366, 844]);
});

test("chaque modale tient dans l'écran du téléphone", async ({page}) => {
  const room = (name: string) => page.getByRole('region', {name, exact: true});
  const quickMenu = async (name: string) => {
    await page.getByRole('button', {name: 'Menu rapide'}).tap();
    await page.getByRole('menuitem', {name}).tap();
  };
  const modals: [string, () => Promise<unknown>][] = [
    [
      'Lumière',
      () =>
        longPress(
          page,
          room('Séjour').getByRole('button', {name: /Plafonnier/}),
        ),
    ],
    [
      'Volet roulant',
      () => room('Séjour').getByRole('button', {name: /Volet/}).tap(),
    ],
    [
      'Prise TV',
      () =>
        longPress(page, room('Séjour').getByRole('button', {name: /Prise TV/})),
    ],
    [
      'Climatisation',
      () =>
        room('Séjour')
          .getByRole('button', {name: /Climat/})
          .tap(),
    ],
    [
      'Imprimante 3D',
      () =>
        room('Chambre 2')
          .getByRole('button', {name: /Imprimante 3D/})
          .tap(),
    ],
    ['Crédit', () => quickMenu('Crédit')],
    ['Courses', () => quickMenu('Courses')],
    ['Foyer', () => page.getByRole('button', {name: 'Foyer'}).tap()],
  ];

  for (const [name, open] of modals) {
    // Les tuiles de toutes les pièces sont dans la vue Pièces, le menu rapide
    // sur la vue 3D.
    const view = ['Crédit', 'Courses'].includes(name) ? '3D' : 'Pièces';
    await page.getByRole('button', {name: view, exact: true}).tap();
    await open();
    const title = page.getByRole('heading', {name, exact: true});
    await expect(title).toBeVisible();
    const card = title.locator('xpath=../..');
    await expect
      .poll(
        async () => {
          const box = (await card.boundingBox())!;
          const fits = await card.evaluate(
            element => element.scrollWidth <= element.clientWidth,
          );
          const width = await page.evaluate(() => innerWidth);
          return {
            x: box.x,
            width: box.width,
            inside: box.y >= 12 && box.y + box.height <= 832,
            fits,
            page: width,
          };
        },
        {message: name},
      )
      .toEqual({x: 12, width: 366, inside: true, fits: true, page: 390});

    await page.locator('#backdrop').click({position: {x: 195, y: 4}});
    await expect(title).toBeHidden();
  }
});

test.describe('Safari sur iPhone', () => {
  // Hauteur visible d'un iPhone 15 Pro sous les barres de Safari.
  test.use({viewport: {width: 393, height: 659}});

  test('la modale lumière tient dans la hauteur visible de Safari', async ({
    page,
  }) => {
    await longPress(
      page,
      page
        .getByRole('region', {name: 'Séjour'})
        .getByRole('button', {name: /Plafonnier du séjour/}),
    );

    const title = page.getByRole('heading', {name: 'Lumière', exact: true});
    await expect(title).toBeVisible();
    const card = title.locator('xpath=../..');
    await expect(card.getByText('Hue Play du séjour')).toBeVisible();
    await expect
      .poll(() =>
        card.evaluate(element => element.scrollHeight <= element.clientHeight),
      )
      .toBe(true);
  });
});

test('toucher le fond ferme la modale', async ({page}) => {
  await longPress(
    page,
    page
      .getByRole('region', {name: 'Séjour'})
      .getByRole('button', {name: /Plafonnier du séjour/}),
  );
  const title = page.getByRole('heading', {name: 'Lumière', exact: true});
  await expect(title).toBeVisible();

  await page.locator('#backdrop').click({position: {x: 195, y: 20}});

  await expect(title).toBeHidden();
});

test('la vue Pièces liste toutes les pièces', async ({page}) => {
  await page.getByRole('button', {name: 'Pièces', exact: true}).tap();

  await expect(page.getByRole('heading', {name: 'Pièces'})).toBeVisible();
  // Les quatorze pièces de la maison démo, dans l'ordre de la config.
  const rooms = page.getByRole('region');
  await expect(rooms).toHaveCount(14);
  await expect(rooms.first()).toHaveAccessibleName('Séjour');
  await expect(page.locator('canvas')).toBeHidden();
});

test('le filtre Volets ne garde que les volets', async ({page}) => {
  await page.getByRole('button', {name: 'Pièces', exact: true}).tap();

  await page.getByRole('button', {name: 'Volets', exact: true}).tap();

  // Séjour, cuisine et trois chambres ont des volets.
  const rooms = page.getByRole('region');
  await expect(rooms).toHaveCount(5);
  await expect(rooms.getByRole('button', {name: /Plafonnier/})).toHaveCount(0);
  await expect(
    rooms.getByRole('button', {name: /Volet du séjour/}),
  ).toBeVisible();
});

test('les avatars ouvrent le Foyer', async ({page}) => {
  await openFoyer(page);

  for (const name of ['Juliette', 'Roméo', 'Tom', 'Jerry'])
    await expect(page.getByText(name, {exact: true})).toBeVisible();
  await expect(page.getByRole('region', {name: 'Raccourcis'})).toBeVisible();
  const settings = page.getByRole('list', {name: 'Réglages'});
  await expect(settings.getByRole('button', {name: /Thème/})).toBeVisible();
  await expect(settings.getByRole('button', {name: /Système/})).toBeVisible();
});

test('changer le thème depuis le Foyer', async ({page}) => {
  await openFoyer(page);

  await page.getByRole('button', {name: /Thème/}).tap();
  await page.getByRole('menuitem', {name: 'Clair'}).tap();

  await expect(page.locator('html')).toHaveClass(/light/);
});

test('ouvrir la modale Système depuis le Foyer', async ({page}) => {
  await openFoyer(page);

  await page.getByRole('button', {name: /Système/}).tap();

  await expect(page.getByRole('heading', {name: 'Système'})).toBeVisible();
});

test('le menu rapide reste sur la vue 3D', async ({page}) => {
  const dial = page.getByRole('button', {name: 'Menu rapide'});
  const header = (await page.getByRole('banner').boundingBox())!;
  const box = (await dial.boundingBox())!;
  expect(box.y).toBeGreaterThan(header.y + header.height);
  expect(box.x).toBeLessThan(195);

  await dial.tap();

  await expect(dial).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.getByRole('menuitemcheckbox', {name: 'Température'}),
  ).toBeVisible();
  for (const name of ['Départ', 'Crédit', 'Courses'])
    await expect(page.getByRole('menuitem', {name})).toBeVisible();
});

test('le crédit tient dans la largeur du téléphone', async ({page}) => {
  await page.getByRole('button', {name: 'Menu rapide'}).tap();
  await page.getByRole('menuitem', {name: 'Crédit'}).tap();

  const title = page.getByRole('heading', {name: 'Crédit', exact: true});
  await expect(title).toBeVisible();
  const sheet = title.locator('xpath=../..');
  const fits = () =>
    sheet.evaluate(element => element.scrollWidth <= element.clientWidth);
  await expect(page.getByRole('img', {name: /remboursé/})).toBeVisible();
  expect(await fits()).toBe(true);

  await page.getByRole('button', {name: 'Historique'}).tap();
  await expect(
    page.getByRole('img', {name: 'Capital, Intérêts, Assurance'}),
  ).toBeVisible();
  expect(await fits()).toBe(true);
});
