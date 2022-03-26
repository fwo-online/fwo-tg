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
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.ts', '**/*.spec.ts', '**/test-utils.ts'] }],
    'no-shadow': 0,
    'no-use-before-define': ['error', { functions: false }],
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
    'no-console': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0,
    camelcase: 0,
    '@typescript-eslint/no-var-requires': 0,
    'import/extensions': [0, 'never'],
    'import/no-named-as-default': 0,
    'import/prefer-default-export': 0,
    'lines-between-class-members': 0,
    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': true,
      'ts-nocheck': true,
      'ts-check': false,
      minimumDescriptionLength: 3,
    }],
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
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
};
