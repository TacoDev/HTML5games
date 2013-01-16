// includes  
var http = require("http");
var url = require("url");
var fs = require("fs");
var querystring = require('querystring');
var requestHandler = require('./requestHandler');

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
var httpServer = http.createServer(httpConnection);
httpServer.listen(process.env.port || 8080);


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
		return './webroot' + file;
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


function handleRequest(response, data, socket) {
	try {
		var answer = requestHandler.handle(JSON.parse(data));
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
