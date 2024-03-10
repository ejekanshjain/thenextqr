/** @type {import("eslint").Linter.Config} */
const eslintConfig = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true
  },
  plugins: ['@typescript-eslint'],
  extends: ['next/core-web-vitals'],
  rules: {}
}

module.exports = eslintConfig
