/* eslint-disable */
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {execSync} from 'child_process';

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(commitHash),
  },
});
