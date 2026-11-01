import '@testing-library/jest-dom/vitest';
import {cleanup, configure, getConfig} from '@testing-library/react';
import {afterEach} from 'vitest';

const {asyncWrapper} = getConfig();
configure({
  // Le contenu d'une modale n'apparaît qu'après son animation (556 ms), plus
  // l'appui long (300 ms) : trop près de l'attente par défaut des findBy (1 s).
  asyncUtilTimeout: 3000,
  // Un findBy rend la main dès que le DOM change. Sous charge, c'est avant les
  // effets du rendu, que React lance par setImmediate : un composant tout juste
  // monté n'est pas encore abonné au store et ignore le clic suivant.
  asyncWrapper: cb =>
    asyncWrapper(async () => {
      const result = await cb();
      await new Promise(resolve => setImmediate(resolve));
      return result;
    }),
});

afterEach(cleanup);
