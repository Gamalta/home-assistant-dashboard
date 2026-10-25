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
      // MUI 9 n'accepte plus les chemins de palette dans `color` : ils sont
      // passés tels quels en CSS, donc ignorés.
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='color'] Literal[value=/^text\\./]",
          message: "Utiliser color=\"textSecondary\" (clé MUI 9) ou sx={{color: 'text.secondary'}}.",
        },
      ],
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off"
    }
  },
  {
    // Les fixtures Playwright appellent `use`, qui n'est pas le hook React.
    files: ['e2e/**'],
    rules: {"react-hooks/rules-of-hooks": "off"},
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'playwright-report/',
      'test-results/',
      'eslint.config.js',
    ],
  },
];