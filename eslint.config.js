import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    ignores: ['dist', 'node_modules', '.git', '*.config.js', 'public/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['**/workers/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        WebSocket: 'readonly',
        Worker: 'readonly',
        performance: 'readonly',
        Image: 'readonly',
        Audio: 'readonly',
        Promise: 'readonly',
        Set: 'readonly',
        Map: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        Proxy: 'readonly',
        Reflect: 'readonly',
        Symbol: 'readonly',
        BigInt: 'readonly',
        Intl: 'readonly',
        ArrayBuffer: 'readonly',
        DataView: 'readonly',
        Int8Array: 'readonly',
        Uint8Array: 'readonly',
        Uint8ClampedArray: 'readonly',
        Int16Array: 'readonly',
        Uint16Array: 'readonly',
        Int32Array: 'readonly',
        Uint32Array: 'readonly',
        Float32Array: 'readonly',
        Float64Array: 'readonly',
        BigInt64Array: 'readonly',
        BigUint64Array: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off',

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
      'no-debugger': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      semi: ['warn', 'never'],
      quotes: ['warn', 'single', { avoidEscape: true }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/workers/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        self: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        importScripts: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
]
