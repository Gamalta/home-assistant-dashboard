interface CustomEnv {
  VITE_VERCEL_ENV: string;
  VITE_SENTRY_RELEASE: string;
  VITE_HA_URL: string;
  VITE_MOCK_HOME_ASSISTANT: string;
  VITE_HOUSE_CONFIGS: string[];
  VITE_APP_VERSION: string;
  [key: string]: unknown;
}

// For Vite's import.meta.env
interface ImportMeta {
  env: CustomEnv;
}

declare const __COMMIT_HASH__: string;
