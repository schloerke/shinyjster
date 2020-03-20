// https://github.com/okonet/lint-staged/commit/2753640fab6588a1a6fbd9d84b6480b141df8985#diff-04c6e90faac2675aa89e2176d2eec7d8R149
// Example: Run tsc on changes to TypeScript files, but do not pass any filename arguments
module.exports = {
  "package.json": () => "yarn checks",
  "tsconfig.json": () => "yarn checks",
  "**/*.ts": () => "yarn checks",
};
