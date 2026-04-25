import tsEslint from 'typescript-eslint'
import gts from 'gts'
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...tsEslint.configs.recommended,
  ...gts,
  reactHooks.configs.flat.recommended,
  {
    ignores: ['node_modules/', 'dist/', 'eslint.config.js'],
  },
];