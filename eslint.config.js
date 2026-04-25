import tsEslint from 'typescript-eslint'
import tsParser from '@typescript-eslint/parser';
import gts from 'gts'
import reactHooks from 'eslint-plugin-react-hooks';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default [
  ...tsEslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  eslintPluginPrettier,
  {
    languageOptions: {
        parser: tsParser,
    },
  },
  {
    rules: {
      "prettier/prettier": "error",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off"
    }
  },
  {
    ignores: ['node_modules/', 'dist/', 'eslint.config.js'],
  },
];