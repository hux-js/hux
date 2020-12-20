const handler = require('serve-handler');
const http = require('http');
const path = require('path');
const WS_BUILD = path.join(__dirname, '../hydrate');

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: WS_BUILD
  });
});

server.listen(8128)
