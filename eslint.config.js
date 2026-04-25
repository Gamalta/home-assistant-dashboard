import tsEslint from 'typescript-eslint'
import tsParser from '@typescript-eslint/parser';
import gts from 'gts'
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...tsEslint.configs.recommended,
  ...gts,
  reactHooks.configs.flat.recommended,
  {
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      }
    }
  },
  {
    ignores: ['node_modules/', 'dist/', 'eslint.config.js'],
  },
];