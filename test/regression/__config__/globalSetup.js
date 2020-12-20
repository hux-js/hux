const { setup: setupDevServer } = require('jest-dev-server')

module.exports = async function globalSetup() {
  await setupDevServer({
    command: 'node ./test/regression/__config__/server.js',
    launchTimeout: 10000,
  })

  console.log("global setup complete");
}
