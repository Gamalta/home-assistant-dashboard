import {expect, test, waitForScene} from './fixtures';

// Taille de la tablette murale en pixels CSS.
test.use({viewport: {width: 1280, height: 800}});

test('aucune étiquette de la scène n’en recouvre une autre', async ({page}) => {
  await page.goto('/');
  await waitForScene(page);

  // Les étiquettes se placent pendant les premières images : on attend qu'aucun
  // recouvrement ne subsiste plutôt que de mesurer une seule fois.
  const overlaps = () =>
    page.evaluate(() => {
      const labels = [
        ...document.querySelectorAll(
          'div:has(> canvas) ~ div :is(button, .MuiButtonGroup-root)',
        ),
      ];
      const name = (label: Element) =>
        label.getAttribute('aria-label') ?? label.textContent;
      const found: string[] = [];
      labels.forEach((a, i) =>
        labels.slice(i + 1).forEach(b => {
          if (a.contains(b) || b.contains(a)) return;
          const r = a.getBoundingClientRect();
          const s = b.getBoundingClientRect();
          if (
            r.x < s.right &&
            s.x < r.right &&
            r.y < s.bottom &&
            s.y < r.bottom
          ) {
            found.push(`${name(a)} / ${name(b)}`);
          }
        }),
      );
      return found;
    });
  await expect.poll(overlaps, {timeout: 15_000}).toEqual([]);
});
