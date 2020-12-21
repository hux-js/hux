const handler = require('serve-handler');
const http = require('http');
const path = require('path');
const WS_BUILD = path.join(__dirname, '../');

const server = http.createServer((request, response) => {
  if (request.url == '/api/hydrate') {
    response.end(JSON.stringify({ testProp: 'mock' }))
  }

  return handler(request, response, {
    public: WS_BUILD
  });
});

server.listen(8128)
