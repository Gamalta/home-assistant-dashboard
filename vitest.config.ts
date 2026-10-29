import {defineConfig, mergeConfig} from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // Un seul jsdom par worker au lieu d'un par fichier : deux fois plus rapide.
      pool: 'vmThreads',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts'],
      restoreMocks: true,
      // @hakit/core (ESM) importe lodash (CommonJS) par exports nommés.
      server: {deps: {inline: ['@hakit/core']}},
    },
  }),
);
