import {sentryVitePlugin} from '@sentry/vite-plugin';
/* eslint-disable */
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {execSync} from 'child_process';

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(commitHash),
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'gamalta',
      project: 'home-assistant-dashboard',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: { name: commitHash, },
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
