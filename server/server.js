// includes  
var http = require("http");
var url = require("url");
var fs = require("fs");
var db = require('./database').database;
//https://github.com/Worlize/WebSocket-Node
var ws = require('websocket').server;
var querystring = require('querystring');
var requestHandler = require('./requestHandler');
var events = require('./API/EventHandler');

var extTypes = {
	"css" : "text/css",
	"html" : "text/html",
	"ico" : "image/x-icon",
	"jpeg" : "image/jpeg",
	"jpg" : "image/jpeg",
	"js" : "application/javascript",
	"png" : "image/png",
	"svg" : "image/svg+xml",
	"svgz" : "image/svg+xml",
	"text" : "text/plain",
	"tif" : "image/tiff",
	"tiff" : "image/tiff",
	"txt" : "text/plain",
	"xml" : "application/xml"
};

// Create the servers
//http
var httpServer = http.createServer();
httpServer.addListener("request", httpConnection);
httpServer.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

//websocket
var socketHTTPServer = http.createServer();
socketHTTPServer.listen(8090, function() {
    console.log((new Date()) + ' Server is listening on port 8090');
});

var socketServer = new ws({
	httpServer: socketHTTPServer,
	fragmentOutgoingMessages: false
});

function getFileType(fileName) {
	// list from https://gist.github.com/976610
	var i = fileName.lastIndexOf('.');
	var ext = (i < 0) ? '' : fileName.substr(i + 1).toLowerCase();
	if(extTypes[ext])
		return extTypes[ext];
	return 'text/plain';
}

// server object
function httpConnection(request, response) {
	var content = "";

	request.addListener("data", function(chunk) {
		content += decodeURIComponent(chunk.toString('utf8'));
	});

	request.addListener("end", handleHTTPRequest);

	function writeError(code, message) {
		response.writeHead(code, {
			'Content-Type' : 'text/plain'
		});
		response.write(message);
		response.end();
	}

	function setHeader(contentType, size) {
		if(size == null)
			size = 0;
		response.writeHead(200, {
			"Content-Type" : contentType
			,"Date" : new Date().toUTCString()
			,"Content-Length" : size
			,"Connection" : "close"
		});
		
	}
	
	function writeFile(err, file, type) {
		if (err) {
			writeError(404, 'File not found');
			return;
		}
		setHeader(getFileType(resolveGetRequest()), file.length);
		response.write(file, 'binary');
		response.end();
	}

	function resolveGetRequest() {
		var urlData = url.parse(request.url);
		var file = urlData.href.replace(urlData.search, '');
		if (file == '/') {
			file += 'index.html';
		}
		return '../webroot' + file;
	}

	function handleHTTPRequest() {
		// initial request or refresh either way send back a html page
		if (request.method == 'GET') {
			var fileName = resolveGetRequest();
			fs.readFile(fileName, function(a, b) {
				writeFile(a, b, getFileType(fileName));
			});
		} else if (request.method == 'POST') {
			var query = querystring.parse(content);
			try {
				handleRequest(response, query.ps);
			} catch(e) {
				writeError(500, e);
			}
			response.end();
		}
	}
}


socketServer.on('request', function(request) {
    var connection = request.accept('visaevus-client', request.origin);
	console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' connecting.');
	connection.write = connection.sendUTF;
    connection.on('message', function(message) {
		try {
			if (message.type === 'utf8') {
				handleRequest(connection, message.utf8Data, connection);
			} else {
				connection.close();
				throw "only type utf8 is accepted";
			}
		} catch(e) {
			console.log(e);
			connection.write(JSON.stringify(e));
		}
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});


function handleRequest(response, data, socket) {
	try {
		var lib = {'socket':socket,'db':db,'events':events};
		//var lib = {'socket':socket,'events':events};
		var answer = requestHandler.handle(JSON.parse(data), lib);
		if(answer == null) {
			answer = '';
		}
		response.write(JSON.stringify(answer), 'binary');
		return;
	} catch(e) {
		console.log(e);
	}
	throw "Server Error";
}
