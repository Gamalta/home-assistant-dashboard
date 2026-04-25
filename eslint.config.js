import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import gts from 'gts'
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...gts,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
    ignores: ['node_modules/', 'dist/', 'eslint.config.js'],
  },
];