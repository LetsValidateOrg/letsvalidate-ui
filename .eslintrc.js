/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  exclude: ["node_modules"],
  include: ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  // Using the accepted answer
  settings: {
    "import/resolver": {
      alias: {
        map: [["@", "./src"]],
      },
    },
  },
};