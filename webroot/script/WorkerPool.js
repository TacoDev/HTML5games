
TacoGame.WorkerPool = function (script, handler, poolSize) {
	var me = this;
	var debug = false;
	
	var poolSize = poolSize || 5;
	var next = 0;
	
	if(!debug) {
		for(var i = 0; i < poolSize; i++) {
			me["a" + i] = new Worker(script);
			me["a" + i].onmessage = onMessage;
		}
	}
	
	window["postMessage"] = function (message) {
		onMessage({data:message});
	}
	
	function onMessage (message) {
		var messageData = JSON.parse(message.data);
		if(messageData.c === "debug") {
			console.log(messageData.a.message);
			return;
		}
		handler[messageData.c](messageData.a);
	}
	
	this.broadcast = function (func, args) {
		var message = JSON.stringify({f:func,a:args});
		if(!debug) {
			for(var i = 0; i < poolSize; i++) {
				me["a" + i].postMessage(message);
			}
		} else {
			onmessage({data:message});
		}
	};
	
	this.send = function (func, args) {
		var message = JSON.stringify({f:func,a:args});
		if(!debug) {
			me["a" + next].postMessage(message);
		} else {
			onmessage({data:message});
		}
		next = (next + 1) % poolSize;
	};
}