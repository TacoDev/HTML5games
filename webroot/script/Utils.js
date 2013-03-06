TacoGame.Utils = new function (){
	/**
	* Loads an image and returns the pointer
	*/
	function loadImage(path, callback){
		if(!path){
			throw new Error("Path Is not set");
		}
			
		var img = new Image();
		img.src = path;
			
		if( callback ){
			img.onload = function (event) {
                callback(event.currentTarget);
            };
		}
		return img;
	}
	
	/*
	 * Event handler for the game engine
	 */
	var eventHandler = new function() {
		var me = this;
		var listeners = {};
		//used to make sure we only listen to the server event once
		var serverListeners = {};

		this.addListener = function(name, fncPtr) {
			if(!listeners[name]) {
				listeners[name] = new Array();
			}
			listeners[name].push(fncPtr);
		}
		
		this.addServerListener = function(name, fncPtr) {
			me.addListener(name, fncPtr);
			if(!serverListeners[name]) {
				serverListeners[name] = 0;
				sendRequest(request({lib:"events",func:"addListener"},{name:name}));
			}
			serverListeners[name]++;
		}

		this.removeListener = function(name, fncPtr) {
			if(listeners[name]) {
				var length = listeners[name].length;
				for(var i = 0; i < length; i++) {
					if(fncPtr === listeners[name][i]) {
						listeners[name].splice(i, 1);
						return;
					}
				}
			}
		}
		
		this.removeServerListener = function(name, fncPtr) {
			me.removeListener(name, fncPtr);
			serverListeners[name]--;
			if(!serverListeners[name]) {
				sendRequest(request({lib:"events",func:"removeListener"},{name:name}));
				delete serverListeners[name];
			}
		}

		this.fireEvent = function(name, data) {
			function timeOutCall(func, args) {
				setTimeout(function () {
					func(args);
				}, 0);
			}
		
			if(listeners[name]) {
				var length = listeners[name].length;
				for(var i = 0; i < length; i++) {
					timeOutCall(listeners[name][i], data);
				}
			}
		}
	};
	
	//Interface for local storage, used to access and save objects
	var appData = new function() {
		var me = this;
		/**
		 * Gets an object from the local storage
		 */
		this.get = function(key) {
			if(me.has(key)) {
				return JSON.parse(localStorage[key]);
			}
			return null;
		};

		/**
		 * Puts an object into local storage
		 */
		this.set = function(key, value) {
			value = JSON.stringify(value);
			localStorage[key] = value;
		};

		/**
		 * Checks if an object exists in local storage
		 */
		this.has = function(key) {
			return Object.prototype.hasOwnProperty.call(localStorage, key);
		};
	};
	
	return {
		"loadImage": loadImage,
		//Events
		"addListener": eventHandler.addListener,
		"addServerListener": eventHandler.addServerListener,
		"removeListener": eventHandler.removeListener,
		"removeServerListener": eventHandler.removeServerListener,
		"fireEvent": eventHandler.fireEvent,
		//local storage
		"get": appData.get,
		"set": appData.set,
		"has": appData.has
	};
}
