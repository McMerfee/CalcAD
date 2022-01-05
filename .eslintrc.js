module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb',
    'plugin:testcafe/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'testcafe',
  ],
  rules: {
    'max-len': [
      'error',
      {
        code: 120,
        ignoreUrls: true,
        ignoreComments: true,
        ignoreTrailingComments: true,
      }],
    'template-curly-spacing': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'no-use-before-define': 'off',
    indent: ['error', 2, {
      SwitchCase: 1,
      VariableDeclarator: 1,
      outerIIFEBody: 1,
      FunctionDeclaration: {
        parameters: 1,
        body: 1,
      },
      FunctionExpression: {
        parameters: 1,
        body: 1,
      },
      CallExpression: {
        arguments: 1,
      },
      ArrayExpression: 1,
      ObjectExpression: 1,
      ImportDeclaration: 1,
      flatTernaryExpressions: false,
      ignoreComments: false,
    }],
    'no-multiple-empty-lines': ['error', { 'max': 3, 'maxBOF': 1}],
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/jsx-props-no-spreading': [1, { exceptions: ['Component', 'input'] }],
    'jsx-a11y/anchor-is-valid': [1, {
      components: ['Link'],
      specialLink: ['hrefLeft', 'hrefRight'],
      aspects: ['invalidHref', 'preferButton'],
    }],
    'no-underscore-dangle': 0,
    'no-nested-ternary': 0,
    'no-else-return': 0,
    'object-curly-newline': 0,
    'no-param-reassign': 0,
    'consistent-return': 0,
    'no-restricted-globals': 0,
    'react/jsx-props-no-spreading': 0,
    camelcase: ['error', {
      properties: 'never',
      ignoreDestructuring: true,
      allow: ['X2_standby'],
    }],
    'import/no-cycle': 0,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
      webpack: {
        config: 'alias.config.js',
      },
    },
  },
};