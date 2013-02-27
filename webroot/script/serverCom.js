/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
TacoGame.Comm = { };

TacoGame.Comm.Request = function (request, params, callback) {
	// the following properties will be sent to the server
	return {
		request : request, // required value
		params : params || null, // to stop clientRequest from throwing error

		callback : callback || function (){} // function
	};
	//	this.response = null; // object (data) returned by the server
}

TacoGame.Comm.ServerConnection = function (response) {

	var me = this;
	var connection = new SocketConnection(response);
	if(!connection.isValid()) {
		connection = new AjaxConnection(response);
	} else {
		connection.onclose(reinit);
	}

	/**
	 * Used to send a messag to the server
	 */
	this.send = connection.send;

	function reinit() {
		connection = new AjaxConnection(response);
		me.send = connection.send;
	}
	
	/**
	 * Class for ajax calls
	 */
	function AjaxConnection(onResponse) {

		var impl = XMLHttpRequest;
		var args = null;
		var aVersions = [ "MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHTTP"];

		initAjax();

		function response(requester) {
			onResponse(requester.responseText);
		}

		function initAjax() {
			var requester = false;
			try {
				requester = new impl(args);
			} catch (e) {}

			if (!requester) {
				if (window.ActiveXObject) { //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
					impl = ActiveXObject;
					for(var i = 0; i< aVersions.length; i++) {
						try {
							args = aVersions[i];
							requester = new impl(args);
							break;
						}
						catch (e) {}
					}
				}
			}

		}

		/**
		 * Used to send a messag to the server
		 */
		this.send = function(message) {
			try {
				var ajaxReq = createXMLHTTPRequest();
			} catch (e) {
				console.log(e);
				return false;
			}

			//open the requester, true for asyncronous
			ajaxReq.open('POST', '/', true);
			//set the requester header.
			ajaxReq.setRequestHeader('Content-type','application/x-www-form-urlencoded');
			//send the requester.
			ajaxReq.send('ps=' + encodeURIComponent(message));
			return true;

		}

		/**
		 * produce and return a XMLHttpRequest object
		 *
		 * @return XMLHttpRequest
		 */
		function createXMLHTTPRequest() {
			var requester = false;
			try {
				requester = new impl(args);
			} catch (e) {}

			requester.onreadystatechange = function () {
				if (this.readyState != 4) return;
				if (this.status > 399) {
					var errObj = {'responseText':"error:" + this.status + ' ' + this.statusText};
					if(console) {
						console.log(errObj);
					}
				} else {
					response(this);
				}
			};
			return requester;
		}
	}

	/**
	 * Class for web socket calls
	 */
	function SocketConnection(onResponse) {

		var socket;
		var valid = true;
		var closeListener = function(){};
		var queue = [];
		var timer;

		// attempt to connect using a web socket
		var host = 'ws://' + document.location.hostname;
		if(document.location.port) {
			host = host + ':' + document.location.port
		}

		try{
			socket = new WebSocket(host, 'visaevus-client');
			socket.onmessage = response;
			socket.onclose = closed;
			socket.onerror = logError;
		}
		catch(ex) {
			valid = false;
		}

		function logError() {
			if(console) {
				console.log(arguments);
			}
		}
		
		function closed() {
			valid = false;
			closeListener();
		}
		
		function response(message) {
			onResponse(message.data);
		}
		
		function checkOpen() {
			if(socket.readyState === WebSocket.OPEN) {
				me.send = send;
				while(queue.length) {
					send(queue.shift());
				}
			} else {
				clearTimeout(timer);
				timer = setTimeout(checkOpen, 50);
			}
		}
		
		function opening(message) {
			queue.push(message);
			checkOpen();
			
			if(socket.readyState > WebSocket.OPEN) {
				throw "failed to init";
			}
			clearTimeout(timer);
			timer = setTimeout(checkOpen, 50);
		}
		
		function send(message) {
			socket.send(message);
		}

		this.onclose = function(newListener) {
			clearTimeout(timer);
			closeListener = newListener;
		}
		
		/**
		 * Used to send a messag to the server
		 */
		this.send = opening;

		this.isValid = function() {
			return valid;
		}
	}

}


/**
 * class that provides communication between client and server
 *
 */
TacoGame.Comm.RequestProccessor = new function () {
	var connection = new TacoGame.Comm.ServerConnection(response);
	var waiting = {};
	var lastID = 0;
	var minResponseTime = 0;
	var maxResponseTime = 0;
	var averageResponseTime = 0;

	function nextID() {
		return ++lastID;
	}

	function response(message) {
		message = JSON.parse(message.trim());
		// an id means client initiated
		if(message.id && waiting[message.id]) {
			waiting[message.id].callback(waiting[message.id]);
			delete waiting[message.id];
		} else if(message.name && message.data) {
			TacoGame.Utils.fireEvent(message.name, message.data);
		} else {
			console.log(message);
		}
	}

	function sendRequest(request) {
		var id = nextID();
		var packet = {'id':id,'r':request.request,'p':request.params};
		if(request.callback) {
			waiting[id] = request;
		}
		connection.send(JSON.stringify(packet));
	}
	
	return {
		sendRequest: sendRequest
	};
};

sendRequest = TacoGame.Comm.RequestProccessor.sendRequest;
request = TacoGame.Comm.Request;

/** test code
 *	eventHandler.addListener('test', function(data){console.log(data);});
*  var request = new Request({'lib':'events','func':'addListener'}, {'name':'test'}, function(res){console.log(res)});
*  sendRequest(request);
*  request = new Request({'lib':'events','func':'testFire'}, {'name':'test'});
*  sendRequest(request);
 */