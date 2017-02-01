module.exports = {
  extends: 'airbnb',
  env: { browser: true },
  rules: {
    // ESLint ----------------------------------
    'block-spacing': 0,
    'global-require': 0,
    'max-len': [1, 160, 4, {"ignoreUrls": true}],
    'no-console': 0,
    'no-mixed-operators': 0,
    'no-multi-spaces': [2, { exceptions: { "ImportDeclaration": true } }],
    'no-nested-ternary': 0,
    'no-param-reassign': [2, { props: false }],
    'no-plusplus': ["error", { "allowForLoopAfterthoughts": true }],
    'no-prototype-builtins': 0,
    'no-underscore-dangle': 0,
    'no-unused-vars': [2, { args: 'none' }],
    'no-var': 0,
    'one-var': 0,
    // imports ----------------------------------
    'import/imports-first': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-named-as-default-member': 0,
    'import/no-unresolved': 0,
    'import/prefer-default-export': 0,
    // react ----------------------------------
    'react/forbid-prop-types': 0,
    'react/jsx-closing-bracket-location': 0,
    'react/jsx-curly-spacing': 0,
    'react/jsx-filename-extension': 0,
    'react/jsx-first-prop-new-line': 0,
    'react/jsx-indent': 0,
    'react/no-is-mounted': 1,
    'react/prefer-es6-class': 0,
    'react/prefer-stateless-function': 0,
    // jsx-a11y ----------------------------------
    'jsx-a11y/img-has-alt': 0,
    'jsx-a11y/label-has-for': 0,
    'jsx-a11y/no-static-element-interactions': 0,
  }
};
