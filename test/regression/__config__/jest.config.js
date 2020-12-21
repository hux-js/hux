module.exports = {
  rootDir: "../",
  testTimeout: 10000,
  testMatch: ["<rootDir>/**/*.spec.js"],
  globalSetup: "<rootDir>/__config__/globalSetup.js",
  globalTeardown: "<rootDir>/__config__/globalTeardown.js",
};
