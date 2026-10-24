import {expect, test, waitForScene} from './fixtures';

// En dev seulement : le démontage simulé du Canvas par StrictMode démonte les
// étiquettes <Html> de drei, qui démontent leur racine React pendant le rendu.
// Avertissement de React sans effet visible, absent du build.
test.use({consoleErrorsAllowed: [/synchronously unmount a root/]});

test('garde la vue 3D après le double montage de StrictMode', async ({
  page,
}) => {
  await page.goto('/');
  await waitForScene(page);
  // R3F 9.6.1 perdait le contexte WebGL 500 ms après le démontage factice.
  await page.waitForTimeout(2000);
  const contextLost = await page.evaluate(() =>
    document.querySelector('canvas')!.getContext('webgl2')!.isContextLost(),
  );
  expect(contextLost).toBe(false);
});
