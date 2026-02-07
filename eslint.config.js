import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // Игнорируемые файлы
  {
    ignores: ['node_modules/**', 'dist/**', '*.config.js', '*.config.ts'],
  },

  // Базовая конфигурация для всех файлов
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
  },

  // TypeScript конфигурация
  ...tseslint.configs.recommended,

  // Кастомные правила
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // Строгая типизация
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Качество кода
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      // Стиль кода
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],

      // Отключаем некоторые правила для удобства разработки
      '@typescript-eslint/no-non-null-assertion': 'off', // Используем ! для DOM элементов
    },
  },

  // Отключаем форматирование (используем Prettier или EditorConfig)
  eslintConfigPrettier
);
