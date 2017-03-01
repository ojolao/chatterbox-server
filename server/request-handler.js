/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var requests = require('request');
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};
var objectId = 1;

var messages = [];
exports.requestHandler = function(request, response) {
  var method = request.method;
  var url = request.url;
  var statusCode = 200;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  
  if (method === 'POST') {
    statusCode = 201;
    var data = '';
    request.on('data', function (chunk) {
      data += chunk;
    });
    request.on('end', function() {
      message = JSON.parse(data);
      message.messageId = ++objectId;
      messages.push(message);
    });
  } else if (method === 'GET') {
    statusCode = 200;
  } else if (method === 'OPTIONS') {
    statusCode = 200;
    response.writeHead(statusCode, headers);
    response.end();
  }
  if (url.indexOf('/classes/messages') < 0 ) {
    statusCode = 404;
  }
  var responseBody = {
    headers: headers,
    method: method,
    url: url,
    results: messages                                                      
  };  

  response.writeHead(statusCode, headers);

  response.end(JSON.stringify(responseBody));
};

