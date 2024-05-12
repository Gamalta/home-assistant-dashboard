interface CustomEnv {
  VITE_HA_URL: string;
  [key: string]: unknown;
}

// For Vite's import.meta.env
interface ImportMeta {
  env: CustomEnv;
}