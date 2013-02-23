/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var eventHandler = new function() {

	var listeners = {};
	var me = this;

	function checkParams(obj, lib) {
		if(obj.name && lib.socket) {
			return true;
		}
		return false;
	}

	this.addListener = function(request, lib) {
		if(checkParams(request, lib)) {
			var name = request.name;
			var socket = lib.socket;
		}
		if(socket == false)
			return;
		if(!listeners[name]) {
			listeners[name] = new Array();
		}
		socket.addListener("close", function() {
			me.removeListener(name, socket);
		});
		listeners[name].push(socket);
	}

	this.removeListener = function(request, lib) {
		if(checkParams(request, lib)) {
			var name = request.name;
			var socket = lib.socket;
		}
		if(listeners[name]) {
			var length = listeners[name].length;
			for(var i = 0; i < length; i++) {
				if(socket === listeners[name][i]) {
					listeners[name].splice(i, 1);
					return;
				}
			}
		}
	}

	this.fireEvent = function(name, data) {
		if(listeners[name]) {
			var length = listeners[name].length;
			for(var i = 0; i < length; i++) {
				//I think this is what will happen if an event is handled while a cleanup is pending
				if(listeners[name][i] == null) {
					console.log('skipped');
					continue;
				}
				listeners[name][i].write(JSON.stringify({'name':name,'data':data}));
			}
		}
	}
}
exports.addListener = eventHandler.addListener;
exports.removeListener = eventHandler.removeListener;
exports.fireEvent = eventHandler.fireEvent;