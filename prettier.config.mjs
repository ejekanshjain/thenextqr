/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ['prettier-plugin-tailwindcss', 'prettier-plugin-organize-imports'],
  arrowParens: 'avoid',
  trailingComma: 'none',
  semi: false,
  singleQuote: true,
  tabWidth: 2
}

export default config
