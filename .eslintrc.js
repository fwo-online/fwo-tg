module.exports = {
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: ['./tsconfig.json']
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'class-methods-use-this': 'off',
    'no-plusplus': 'off',
    'no-useless-constructor': 'off',
    'no-restricted-syntax': 0,
    'no-shadow': 0,
    'no-use-before-define': ['error', { functions: false }],
    'no-console': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0,
    camelcase: 0,
    'lines-between-class-members': ["error", "always", {exceptAfterSingleLine: true}],
    'no-void': ['error', { allowAsStatement: true }],
    '@typescript-eslint/no-useless-constructor': 'warn',
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: "^_"}],
    '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': true,
      'ts-nocheck': true,
      'ts-check': false,
      minimumDescriptionLength: 3,
    }],
    'import/extensions': ["error", 'never'],
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.ts', '**/*.spec.ts', '**/testUtils.ts', '**/cli/*.ts'] }],
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
      ],
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
    }],
    'import/namespace': ['error', { allowComputed: true }],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.js'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
  overrides: [
    {
      "files": ["**/*.test.ts"],
      "plugins": ["jest"],
      "extends": ["plugin:jest/recommended", "plugin:jest/style"],
    }
  ],
  ignorePatterns: ['.eslintrc.js']
};
