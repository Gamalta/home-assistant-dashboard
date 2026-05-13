import { ThreeElements } from '@react-three/fiber'
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
export interface ImportMeta {
  env: CustomEnv;
}
declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
  interface Window {
    _mtm: Record<string, unknown>[];
  }
}

export {};