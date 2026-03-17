import {sentryVitePlugin} from '@sentry/vite-plugin';
/* eslint-disable */
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {execSync} from 'child_process';

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
const sentryRelease = `${process.env.PROJECT_NAME}@${commitHash}`

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': commitHash,
    'import.meta.env.VITE_SENTRY_RELEASE': sentryRelease,
    'import.meta.env.VITE_VERCEL_ENV': process.env.VERCEL_ENV,
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'gamalta',
      project: 'home-assistant-dashboard',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: { name: sentryRelease, },
      sourcemaps: {
        // On évite d'exposer les sourcemaps en production
        // https://blog.sentry.security/abusing-exposed-sourcemaps
        filesToDeleteAfterUpload: ['./**/*.map'],
      },
    }),
  ],
  build: {
    sourcemap: true,
  },
});
