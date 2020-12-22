const handler = require("serve-handler");
const http = require("http");
const path = require("path");
const WS_BUILD = path.join(__dirname, "../");

const { users, userCount, meta } = require("../__mocks__/users");

const server = http.createServer((request, response) => {
  if (request.url == "/api/hydrate") {
    response.end(JSON.stringify({ users, userCount, meta }));
  } else if (request.url == "/api/hydrate-users-array") {
    response.end(JSON.stringify(users));
  } else {
    return handler(request, response, {
      public: WS_BUILD,
    });
  }
});

server.listen(8128);
