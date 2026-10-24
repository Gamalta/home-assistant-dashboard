import {defineConfig, devices} from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4317);
const DEV_PORT = PORT + 1;

const env = {
  VITE_MOCK_HOME_ASSISTANT: 'true',
  VITE_HOUSE_CONFIGS: '["demo"]',
  SENTRY_AUTH_TOKEN: '',
};

const chromium = {
  ...devices['Desktop Chrome'],
  // WebGL logiciel : même rendu en local et en CI, sans GPU.
  launchOptions: {
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  },
};

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: [[process.env.CI ? 'github' : 'list'], ['html', {open: 'never'}]],
  // Le rendu logiciel (SwiftShader) est lent, surtout sur les runners CI.
  timeout: 60_000,
  expect: {timeout: 15_000},
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {name: 'chromium', testIgnore: 'dev.spec.ts', use: chromium},
    {
      // Le double montage de StrictMode n'a lieu qu'avec le serveur de dev.
      name: 'dev',
      testMatch: 'dev.spec.ts',
      use: {...chromium, baseURL: `http://localhost:${DEV_PORT}`},
    },
  ],
  webServer: [
    {
      command: `pnpm exec vite build && pnpm exec vite preview --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env,
    },
    {
      command: `pnpm exec vite --port ${DEV_PORT} --strictPort`,
      url: `http://localhost:${DEV_PORT}`,
      reuseExistingServer: !process.env.CI,
      env,
    },
  ],
});
