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
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-param-reassign': 0,
    'no-console': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0,
    camelcase: 0,
    '@typescript-eslint/no-var-requires': 0,
    'import/extensions': [0, 'never'],
    'import/no-named-as-default': 0,
    'import/prefer-default-export': 0,
    'lines-between-class-members': 0,
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
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

};
