// .eslintrc.js
// eslint.config.js
import js from "@eslint/js";

module.exports = {
  // Specifies the ESLint parser for TypeScript.
  // @typescript-eslint/parser allows ESLint to lint TypeScript code.
  parser: '@typescript-eslint/parser',

  // Parser options define the parsing behavior for ESLint.
  parserOptions: {
    // Specify the ECMAScript version to parse. Latest is generally recommended.
    ecmaVersion: 2022,
    // Specify the source type as 'module' for ES modules (import/export syntax).
    sourceType: 'module',
    // ecmaFeatures allow you to specify supported ECMAScript features.
    ecmaFeatures: {
      jsx: true, // Enable JSX parsing for React.
    },
    // IMPORTANT: This setting is required for rules that need type information.
    // It tells @typescript-eslint to load your TypeScript project's configuration.
    // Adjust the path if your tsconfig.json is not at the root (e.g., './tsconfig.json').
    project: './client/tsconfig.json',
  },

  // Specifies the environments in which your code runs.
  // Each environment provides predefined global variables.
  env: {
    browser: true, // Browser global variables (e.g., window, document).
    node: true,    // Node.js global variables and Node.js scoping.
    es2022: true,  // Adds all ECMAScript 2022 globals and automatically sets parserOptions.ecmaVersion to 2022.
  },

  // Plugins provide sets of rules, environments, and processors for ESLint.
  plugins: [
    '@typescript-eslint', // Provides rules for TypeScript.
    'react',              // Provides rules for React.
    'react-hooks',        // Provides rules for React Hooks.
  ],

  // 'extends' specifies an array of configurations to inherit.
  // Order matters: later configurations override earlier ones.
  extends: [
    // Recommended ESLint rules (basic JavaScript best practices).
    'eslint:recommended',
    // Recommended rules from @typescript-eslint plugin.
    // These rules are specifically for TypeScript code.
    'plugin:@typescript-eslint/recommended',
    // Type-aware recommended rules from @typescript-eslint plugin.
    // These rules require parserOptions.project to be set.
    'plugin:@typescript-eslint/recommended-type-checked',
    // Recommended stylistic rules from @typescript-eslint plugin, also type-aware.
    'plugin:@typescript-eslint/stylistic-type-checked',
    // Recommended React rules.
    'plugin:react/recommended',
    // Recommended rules for the new JSX transform (React 17+).
    // This allows you to omit `import React from 'react';` in JSX files.
    'plugin:react/jsx-runtime',
    // Rules for React Hooks to ensure correct usage.
    'plugin:react-hooks/recommended',
  ],

  // Specific rules can be configured here to override or add to the 'extends' settings.
  // Level can be "off", "warn", or "error" (0, 1, or 2).
  rules: {
    // --- General ESLint Rules ---
    'no-console': 'warn', // Warn about console.log statements (good for production builds).
    'no-debugger': 'error', // Error about debugger statements.
    'indent': ['error', 2, { SwitchCase: 1 }], // Enforce 2-space indentation.
    'linebreak-style': ['error', 'unix'], // Enforce Unix-style line endings.
    'quotes': ['error', 'single'], // Enforce single quotes.
    'semi': ['error', 'always'], // Enforce semicolons.

    // --- TypeScript ESLint Rules Overrides/Additions ---
    // Disable ESLint's default no-unused-vars and use the TypeScript version.
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // Disable ESLint's default no-shadow and use the TypeScript version.
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    // Enable/configure rules that require type information for better checks.
    '@typescript-eslint/consistent-type-imports': 'error', // Enforce consistent use of type imports.
    '@typescript-eslint/prefer-nullish-coalescing': 'warn', // Suggest using ?? instead of || for nullish values.
    '@typescript-eslint/no-floating-promises': 'error', // Prevent promises from being ignored.

    // --- React Rules Overrides/Additions ---
    // Suppress 'react/react-in-jsx-scope' as it's not needed with React 17+ new JSX transform.
    'react/react-in-jsx-scope': 'off',
    // Configure prop-types checking for React components.
    // If you're using TypeScript, prop-types are often redundant, so you might turn this off.
    'react/prop-types': 'off',
    // Enforce consistent naming for components.
    'react/function-component-definition': [
      'warn',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    // Ensure all custom components have their prop-types defined (if prop-types is enabled).
    // If you keep 'react/prop-types': 'off', this rule might also be 'off'.
    'react/forbid-prop-types': 'off',

    // --- React Hooks Rules ---
    'react-hooks/rules-of-hooks': 'error',   // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
  },

  // Settings for plugins that need extra configuration.
  settings: {
    // Tells eslint-plugin-react to automatically detect the React version.
    react: {
      version: 'detect',
    },
    // Define the file extensions that ESLint should process for imports.
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },

  // Specifies files or directories that ESLint should ignore.
  // These are relative to the current working directory where ESLint is run.
  ignorePatterns: [
    'node_modules/', // Ignore the node_modules directory.
    'dist/',         // Ignore common build output directories.
    'build/',        // Another common build output directory.
    '.eslintrc.js',  // Don't lint the ESLint config file itself.
    'coverage/',     // Ignore test coverage reports.
    '*.test.js',     // Optionally ignore test files from linting (or configure separately).
    '*.test.jsx',
    '*.test.ts',
    '*.test.tsx',
  ],
};
