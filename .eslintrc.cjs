/** @type {import("eslint").Linter.Config} */
const eslintConfig = {
  // overrides: [
  //   {
  //     extends: [],
  //     files: ['*.ts', '*.tsx'],
  //     parserOptions: {
  //       project: true
  //     }
  //   }
  // ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true
  },
  plugins: ['@typescript-eslint'],
  extends: ['next/core-web-vitals'],
  rules: {}
}

module.exports = eslintConfig
