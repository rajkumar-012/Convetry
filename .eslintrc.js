module.exports = {
  root: true,
  extends: ['universe', 'universe/native', 'universe/shared/typescript-analysis'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};

