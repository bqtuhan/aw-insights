module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  settings: {
    react: {
      version: '19.2',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json'],
      },
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react/prop-types': 'off',
    'import/no-unresolved': 'off',
    'import/order': 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    'no-irregular-whitespace': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    'no-unused-disable-directives': 'off',
  },
  overrides: [
    {
      files: ['*.cjs', '*.js'],
      env: {
        node: true,
      },
    },
  ],
};
