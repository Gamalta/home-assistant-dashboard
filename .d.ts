interface CustomEnv {
  VITE_HA_URL: string;
  VITE_HOUSE_CONFIGS: string[];
  [key: string]: unknown;
}

// For Vite's import.meta.env
interface ImportMeta {
  env: CustomEnv;
}