import {Page} from '@playwright/test';
import {expect, openSystemModal, test, waitForScene} from './fixtures';

// drei ajoute chaque étiquette à côté du canvas.
const LABELS = 'div:has(> canvas) ~ div';

// drei donne aux étiquettes un z-index d'autant plus grand qu'elles sont
// proches de la caméra. Aux points où des étiquettes se chevauchent, compte
// celles qui passent devant une étiquette plus proche.
async function labelStacking(page: Page) {
  return page.evaluate(selector => {
    const labels = [...document.querySelectorAll<HTMLElement>(selector)].map(
      element => ({
        element,
        rect: element.firstElementChild!.getBoundingClientRect(),
        zIndex: parseInt(element.style.zIndex),
      }),
    );
    let overlaps = 0;
    let wrong = 0;
    for (const [i, a] of labels.entries()) {
      for (const b of labels.slice(i + 1)) {
        const left = Math.max(a.rect.left, b.rect.left);
        const right = Math.min(a.rect.right, b.rect.right);
        const top = Math.max(a.rect.top, b.rect.top);
        const bottom = Math.min(a.rect.bottom, b.rect.bottom);
        if (left >= right || top >= bottom) continue;
        const x = (left + right) / 2;
        const y = (top + bottom) / 2;
        const hit = document.elementFromPoint(x, y);
        const shown = labels.find(label => label.element.contains(hit));
        if (!shown) continue;
        const nearest = labels
          .filter(
            ({rect}) =>
              rect.left <= x &&
              x <= rect.right &&
              rect.top <= y &&
              y <= rect.bottom,
          )
          .reduce((c, d) => (d.zIndex > c.zIndex ? d : c));
        overlaps++;
        if (shown !== nearest) wrong++;
      }
    }
    return {
      withoutZIndex: labels.filter(label => Number.isNaN(label.zIndex)).length,
      wrong,
      overlapping: overlaps > 0,
    };
  }, LABELS);
}

test('affiche l’étiquette la plus proche de la caméra devant les autres', async ({
  page,
}) => {
  await page.goto('/');
  await waitForScene(page);
  // En reculant la caméra, les étiquettes se resserrent et se chevauchent.
  await page.mouse.move(900, 400);
  await page.mouse.wheel(0, 1500);

  await expect
    .poll(() => labelStacking(page))
    .toEqual({withoutZIndex: 0, wrong: 0, overlapping: true});
});

test('garde les étiquettes sous les modales', async ({page}) => {
  await page.goto('/');
  await openSystemModal(page);

  const visible = await page.evaluate(
    selector =>
      [...document.querySelectorAll<HTMLElement>(selector)].filter(label => {
        const rect = label.firstElementChild!.getBoundingClientRect();
        const hit = document.elementFromPoint(
          rect.x + rect.width / 2,
          rect.y + rect.height / 2,
        );
        return label.contains(hit);
      }).length,
    LABELS,
  );
  expect(visible).toBe(0);
});
