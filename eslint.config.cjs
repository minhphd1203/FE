module.exports = [
  // ignore node_modules
  {
    ignores: ['node_modules/**'],
  },
  // minimal config for JS/TS/JSX/TSX files so ESLint v9 has a config to load
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      // Use the TypeScript parser so ESLint can parse 'interface' and type annotations
      parser: require('@typescript-eslint/parser'),
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        // Keep parserOptions minimal to avoid requiring full type-checking during pre-commit
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // keep empty to avoid introducing lint failures during commit
    },
  },
];
