// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/**',
      'dist-check/**',
      'dist-check-2/**',
      'android/**',
      'node_modules_stale/**',
    ],
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]);
