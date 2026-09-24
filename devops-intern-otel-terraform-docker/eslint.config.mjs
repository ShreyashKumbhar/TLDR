import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
  files: ['**/*.mjs'], languageOptions: { globals: { Buffer: 'readonly', process: 'readonly', fetch: 'readonly', console: 'readonly', setTimeout: 'readonly', URL: 'readonly' } }
}, {
  rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] }
});
