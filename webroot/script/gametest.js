function initGame() {
}


//Namespace for the game, placeholder for now
var TacoGame = {

}

TacoGame.Player = new function () {
	var user = null;
	
	this.id = Math.round(Math.random() * 9000 + 1000) + "-" + Math.round(Math.random() * 9000 + 1000) + "-" + Math.round(Math.random() * 9000 + 1000);
}
var width = 2500;
var gridCache = {};

//May be multiple maps in the future
TacoGame.Map = new function () {
	//Game tile is a 25 * 25 pixel square
	var minTileX = 0;
	var maxTileX = width;
	var minTileY = 0;
	var maxTileY = width;
	var scrollSpeed = 50;
	var entities = [];
	var entitiesMap = {};
	var playerEntities = [];
	var playerEntitiesMap = {};
	var unitSelected = false;
	
	var viewPort = {
		x : 0, 
		y : 0,
		width : 0,
		height : 0,
		maxTileX : maxTileX,
		maxTileY : maxTileY,
		
		getLeftPercent : function () {
			if(viewPort.x === 0) {
				return 0;
			}
			return viewPort.x / viewPort.maxTileX
		},
		getTopPercent : function () {
			if(viewPort.y === 0) {
				return 0;
			}
			return viewPort.y / viewPort.maxTileY;
		},
		getWidthPercent : function () {
			if(viewPort.width === 0) {
				return 0;
			}
			return viewPort.width / viewPort.maxTileX;
		},
		getHeightPercent : function () {
			if(viewPort.height === 0) {
				return 0;
			}
			return viewPort.height / viewPort.maxTileY;
		}
	};
	
	function handleResize() {
		viewPort.width  = window.innerWidth;
		viewPort.height = window.innerHeight;
	}
	
	function loadSprites() {
		var loaded = 0;
		TacoGame.Utils.loadImage(MarineSprite.prototype.imgURLGreen,
		function (image) {
			loaded++;
			MarineSprite.prototype.gImg = image;
			checkDoneLoading();
		});
		TacoGame.Utils.loadImage(MarineSprite.prototype.imgURLRed,
		function (image) {
			loaded++;
			MarineSprite.prototype.rImg = image;
			checkDoneLoading();
		});
		TacoGame.Utils.loadImage(ZealotSprite.prototype.imgURL,
		function (image) {
			loaded++;
			ZealotSprite.prototype.img = image;
			checkDoneLoading();
		});
		TacoGame.Utils.loadImage(ZerglingSprite.prototype.imgURL,
		function (image) {
			loaded++;
			ZerglingSprite.prototype.img = image;
			checkDoneLoading();
		});
		
		function checkDoneLoading() {
			if(loaded < 4) {
				return;
			}
			function randomInt(max, min) {
				return Math.round((Math.random() * (max - min)) + min);
			}
			var marineRadius = 15;
			var centerX = randomInt(200, 400);
			var centerY = randomInt(200, 400);
			for(var i = 0; i < 20; i++) {
				do {
					var x = randomInt(centerX - 100, centerX + 100);
					var y = randomInt(centerY - 100, centerY + 100);
				} while(TacoGame.Map.isOccupied(x, y, marineRadius));
				var id = (new Date()).getTime() + "" + Math.round(Math.random() * 600);
				addEntity({x:x,y:y,r:marineRadius,type:"MarineSprite",playerId:TacoGame.Player.id,id:id});
			}
			sendRequest(request({lib:"commander",func:"getUnits"}));
		}
	}
	
	function killUnit(unit) {
		entitiesMap[unit].kill();
	}
	
	function initMyUnits() {
		for (var i = 0; i < playerEntities.length; i++) {
			sendRequest(request({lib:"commander",func:"addUnit"}, entities[i].toObject()));
		}
	}
	
	function addEntity(params) {
		if(entitiesMap[params.id]) {
			return;
		}
		var newUnit = new TacoGame.Entity(new TacoGame.Circle(params.x, params.y, params.r), params.type, params.id, params.playerId, params.health, params.desiredLocation);
		entities.push(newUnit);
		entitiesMap[newUnit.id] = newUnit;
		if(params.playerId === TacoGame.Player.id) {
			playerEntities.push(newUnit);
			playerEntitiesMap[newUnit.id] = newUnit;
		}
	}
	
	function removeEntity(id) {
		if(!entitiesMap[id]) {
			return;
		}
		for(var i = 0; i < entities.length; i++) {
			if(entities[i].id === id) {
				entities.splice(i, 1);
				return;
			}
		}
		entities.push(newUnit);
		delete entitiesMap[id];
		if(playerEntitiesMap[id]) {
			for(var i = 0; i < playerEntities.length; i++) {
				if(playerEntities[i].id === id) {
					playerEntities.splice(i, 1);
					return;
				}
			}
			delete playerEntitiesMap[newUnit.id] = newUnit;
		}
	}
	
	function checkAttack() {
		//Should only check your units, and fire an event
		for (var i = 0; i < entities.length; i++) {
			if(entities[i].canAttack()) {
				for (var k = 0; k < entities.length; k++) {
					if(entities[i].playerId !== entities[k].playerId) {
						var space = Math.distanceBetween(entities[i].getShape(), entities[k].getShape());
						if(space <= entities[i].range && entities[i].canAttack()) {
							var angle = Math.angleBetweenTwoPoints(entities[k].getShape(), entities[i].getShape());
							entities[i].attack(angle);
							entities[k].attacked(entities[i].damage);
							break;
						}
					}
				}
			}
		}
	}
			
	return {
		init : function () {
			canvas = document.getElementById('gameScreen');
			window.addEventListener("resize", handleResize);
			handleResize();
			loadSprites();
			TacoGame.Utils.addListener('checkAttack', checkAttack);
			TacoGame.Utils.addServerListener('addUnit', addEntity);
			TacoGame.Utils.addServerListener('resendUnits', initMyUnits);
			TacoGame.Utils.addServerListener('removeUnit', killUnit);
			
		},
		
		destroy : function () {
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].playerId === TacoGame.Player.id) {
					sendRequest(request({lib:"commander",func:"removeUnit"}, entities[i].id));
				}
			}
		},
		
		scrollViewPort : function (directions) {
			if (directions.up) {
				viewPort.y = Math.max(viewPort.y - scrollSpeed, 0);
			}
			if (directions.down) {
				viewPort.y = Math.min(viewPort.y + scrollSpeed, maxTileY - viewPort.height);
			}
			if (directions.right) {
				viewPort.x = Math.min(viewPort.x + scrollSpeed, maxTileX - viewPort.width);
			}
			if (directions.left) {
				viewPort.x = Math.max(viewPort.x - scrollSpeed, 0);
			}
		},
		
		moveViewPort : function (newCoords) {
			viewPort.x = newCoords.x;
			viewPort.y = newCoords.y;
		},
		
		getViewPort : function () {
			return viewPort;
		},
		
		getEntities : function () {
			var spriteData = [];
			var viewPortRectangle = new TacoGame.Rectangle(viewPort.x, viewPort.y, viewPort.width, viewPort.height);
			for (var i = entities.length - 1; i >= 0; i--) {
				if(entities[i].gone()) {
					removeEntity(entities[i].id);
					continue;
				}
				if(entities[i].isLoaded() && Math.circleRectangleColliding(entities[i].getShape(), viewPortRectangle)) {
					spriteData.push(entities[i].getSpriteData(viewPort));
				}
			}
			return spriteData;
		},
		
		getAllEntities : function () {
			var spriteData = [];
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].isLoaded()) {
					spriteData.push(entities[i].getDrawData());
				}
			}
			return spriteData;
		},
		
		selectEntities : function (rectangle, keepSelection, click) {
			keepSelection = !!keepSelection;
			if(unitSelected) {
				unitSelected = keepSelection;
			}
			if (click) {
				for (var i = 0; i < entities.length; i++) {
					if(entities[i].selected) {
						entities[i].selected = keepSelection;
					}
					if(Math.circleRectangleColliding(entities[i].getShape(), rectangle)) {
						entities[i].selected = true;
						unitSelected = true;
					}
				}
			} else {
				for (var i = 0; i < playerEntities.length; i++) {
					if(playerEntities[i].selected) {
						playerEntities[i].selected = keepSelection;
					}
					if(Math.circleRectangleColliding(playerEntities[i].getShape(), rectangle)) {
						playerEntities[i].selected = true;
						unitSelected = true;
					}
				}
			}
		},
		
		applyAction : function (unit, action) {
			entities[unit]["handle" + action]();
		},
		
		deselectEntities : function () {
			unitSelected = false;
		},
		
		isOccupied : function (x, y, r, id) {
			var c1 = new TacoGame.Circle(x, y, r);
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].id !== id && Math.circlesColliding(entities[i].getShape(), c1)) {
					return true;
				}
			}
			return false;
		},
		
		setDestination : function (event) {
			for (var i = 0; i < playerEntities.length; i++) {
				if(playerEntities[i].selected) {
					var newEvent = {
						unit : playerEntities[i].id,
						start : playerEntities[i].getShape(),
						end : event,
						type : "MoveUnit",
						startTime : TacoGame.WorldSimulator.getCurrentTime()
					};
					TacoGame.WorldSimulator.queueCommand(TacoGame.createCommand(newEvent));
				}
			}
		},
		
		setUnitDestination : function (unit, end, startTime) {
			entitiesMap[unit].setDestination(end, startTime);
		},
		
		setUnitPath : function (unit, path) {
			entitiesMap[unit].setPath(path);
		},
		
		isUnitSelected : function () {
			return unitSelected;
		},
		
		keyPressed : function (event) {
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].selected) {
					entities[i].handleKeyPress(event);
				}
			}
		}
		
	}
}
window.addEventListener("load", TacoGame.Map.init);
window.addEventListener("unload", TacoGame.Map.destroy);


//One per session
TacoGame.WorldSimulator = new function () {

	var commands = [];
	var time = 0;
	
	function executeCommand(command) {
		commands[command.order] = TacoGame.createCommand(command.event);
		commands[command.order].fix(command);
		commands[command.order].commit();
	}
		
	function checkAttack() {
		TacoGame.Utils.fireEvent("checkAttack", time);
	}
	
	function stepWorld() {
		time++;
		TacoGame.Utils.fireEvent("stepWorld", time);
	}
	
	//This is the api for the simulator, may get rather large
	return {
		queueCommand : function (newCommand) {
			if (newCommand.needsSync()) {
				sendRequest(request({lib:"commander",func:"queueCommand"}, newCommand));
			} else {
				newCommand.commit();
			}
		},
		
		getCurrentTime: function () {
			return time;
		},
		
		init : function () {
			setInterval(stepWorld, 100);
			setInterval(checkAttack, 50);
			TacoGame.Utils.addServerListener('commandQueued', executeCommand);
		}
	}
}
window.addEventListener("load", TacoGame.WorldSimulator.init);

function postMessage (message) {
	workerPool.onMessage(message);
}

TacoGame.WorkerPool = function (script, handler) {
	var me = this;
	var debug = false;
	
	var poolSize = 20;
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

TacoGame.PathFinding = new function () {
	var handlers = {
		pathBuilt : function (unitPath) {
			lastStart = pathFindingQueue[unitPath.id];
			if(lastStart) {
				console.log((new Date()).getTime() - lastStart);
			}
			TacoGame.Map.setUnitPath(unitPath.id, unitPath.path);
			pool.broadcast("updateUnitPath", unitPath);
		},
		redoPath : function (unitToRedo) {
			TacoGame.Map.setUnitDestination(unitToRedo.id, unitToRedo.end);
		}
	};
	var pool = new TacoGame.WorkerPool("script/AStar.js", handlers);
	var pathFindingQueue = {};
		
	function addUnit(unitData) {
		pool.broadcast("addUnit", {id:unitData.id,shape:{x:unitData.x,y:unitData.y,radius:unitData.r}});
	}
	
	function removeUnit(unitData) {
		pool.broadcast("removeUnit", {id:unitData.id});
	}
	
	function stepPaths(step) {
		pool.broadcast("step", step);
	}
	
	this.createPath = function (end, id, unitSpeed, startTime) {
		if(!pathFindingQueue[id]) {
			pathFindingQueue[id] = [];
		}
		pathFindingQueue[id] = new Date().getTime();
		pool.send("createUnitPath", {
			end: end,
			unitSpeed: unitSpeed,
			id: id,
			startTime: startTime
		});
	}
	
	this.init = function () {
		pool.send("setPathChecker", {});
		pool.broadcast("setWidth", width);
		
		TacoGame.Utils.addListener('stepWorld', stepPaths);
		TacoGame.Utils.addServerListener('addUnit', addUnit);
		TacoGame.Utils.addServerListener('removeUnit', removeUnit);
	};
};
window.addEventListener("load", TacoGame.PathFinding.init);