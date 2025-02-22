/**
 * @type {import("prettier").Config}
 */
export default {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 80,
  useTabs: false,
  endOfLine: "auto",
  bracketSpacing: true,
  importOrder: ["^[react]", "^@(?!/)", "^@/", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: ["@trivago/prettier-plugin-sort-imports"],
};
