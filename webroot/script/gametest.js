function initGame() {
}


//Namespace for the game, placeholder for now
var TacoGame = {

}

TacoGame.Player = new function () {
	var user = null;
	
	this.id = Math.round(Math.random() * 9000 + 1000) + "-" + Math.round(Math.random() * 9000 + 1000) + "-" + Math.round(Math.random() * 9000 + 1000);
}
var width = 400;
var pixelsPerTile = 10;

//May be multiple maps in the future
TacoGame.Map = new function () {
	//Game tile is a 25 * 25 pixel square
	var pixelsPerTile = 10;
	var minTileX = 0;
	var maxTileX = width;
	var minTileY = 0;
	var maxTileY = width;
	var scrollSpeed = 5;
	var entities = [];
	var unitSelected = false;
	
	var viewPort = {
		x : 0, 
		y : 0,
		width : 0,
		height : 0,
		maxTileX : maxTileX,
		maxTileY : maxTileY,
		
		getWidthConversion : function () {
			return (maxTileX * pixelsPerTile);
		},
		getHeightConversion : function () {
			return (maxTileY * pixelsPerTile);
		},
		getLeftPercent : function () {
			if(viewPort.x === 0) {
				return 0;
			}
			return viewPort.x / viewPort.getWidthConversion();
		},
		getTopPercent : function () {
			if(viewPort.y === 0) {
				return 0;
			}
			return viewPort.y / viewPort.getHeightConversion();
		},
		getWidthPercent : function () {
			if(viewPort.width === 0) {
				return 0;
			}
			return viewPort.width / viewPort.getWidthConversion();
		},
		getHeightPercent : function () {
			if(viewPort.height === 0) {
				return 0;
			}
			return viewPort.height / viewPort.getHeightConversion();
		}
	};
	
	var tiles = [];
	
	function handleResize() {
		viewPort.width  = window.innerWidth;
		viewPort.height = window.innerHeight;
	}
	
	function loadSprites() {
		TacoGame.Utils.loadImage(ZealotSprite.prototype.imgURL,
		function (image) {
			ZealotSprite.prototype.img = image;
		});
		TacoGame.Utils.loadImage(MarineSprite.prototype.imgURL,
		function (image) {
			MarineSprite.prototype.img = image;
		});
		TacoGame.Utils.loadImage(ZerglingSprite.prototype.imgURL,
		function (image) {
			ZerglingSprite.prototype.img = image;
		});
		
	}
	
	function killUnit(unit) {
		for (var i = 0; i < entities.length; i++) {
			if(entities[i].id === unit) {
				entities[i].kill();
			}
		}
	}
	
	function initMyUnits() {
		for (var i = 0; i < entities.length; i++) {
			if(entities[i].playerId === TacoGame.Player.id) {
				sendRequest(request({lib:"commander",func:"addUnit"}, entities[i].toObject()));
			}
		}
	}
	
	function addEntity(params) {
		for (var i = 0; i < entities.length; i++) {
			if(entities[i].id === params.id) {
				return;
			}
		}
		entities.push(new TacoGame.Entity(new TacoGame.Circle(params.x, params.y, params.r), params.type, params.id, params.playerId));
	}
	
	function stepEntities() {
		for (var i = 0; i < entities.length; i++) {
			entities[i].step();
		}
	}
	
	return {
		init : function () {
			canvas = document.getElementById('gameScreen');
			window.addEventListener("resize", handleResize);
			handleResize();
			loadSprites();
			TacoGame.Utils.addListener('stepWorld', stepEntities);
			TacoGame.Utils.addServerListener('addUnit', addEntity);
			TacoGame.Utils.addServerListener('resendUnits', initMyUnits);
			TacoGame.Utils.addServerListener('removeUnit', killUnit);
			
			function randomInt(max, min) {
				var num = (Math.random() * (max - min)) + min;
				num -= num % 10;
				return num
			}
			var marineRadius = 9;
			for(var i = 0; i < 2; i++) {
				do {
					var x = randomInt(0, 1000);
					var y = randomInt(0, 1000);
				} while(TacoGame.Map.isOccupied(x, y, marineRadius, 10));
				var id = (new Date()).getTime() + "" + Math.round(Math.random() * 600);
				addEntity({x:x,y:y,r:marineRadius,type:"MarineSprite",playerId:TacoGame.Player.id,id:id});
			}
			sendRequest(request({lib:"commander",func:"getUnits"}));
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
				viewPort.y = Math.max(viewPort.y - scrollSpeed * pixelsPerTile, 0);
			}
			if (directions.down) {
				viewPort.y = Math.min(viewPort.y + scrollSpeed * pixelsPerTile, maxTileY * pixelsPerTile - viewPort.height);
			}
			if (directions.right) {
				viewPort.x = Math.min(viewPort.x + scrollSpeed * pixelsPerTile, maxTileX * pixelsPerTile - viewPort.width);
			}
			if (directions.left) {
				viewPort.x = Math.max(viewPort.x - scrollSpeed * pixelsPerTile, 0);
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
					entities.splice(i, 1);
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
				for (var i = 0; i < entities.length; i++) {
					if(entities[i].playerId === TacoGame.Player.id) {
						if(entities[i].selected) {
							entities[i].selected = keepSelection;
						}
						if(Math.circleRectangleColliding(entities[i].getShape(), rectangle)) {
							entities[i].selected = true;
							unitSelected = true;
						}
					}
				}
			}
		},
		
		deselectEntities : function () {
			unitSelected = false;
		},
		
		fillClosedPaths : function (grid, radius, id) {
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].id === id) {
					continue;
				}
				var shape = entities[i].getShape();
				var distance = shape.radius + (radius / 2);
				var distanceSquared = distance * distance;
				distance = Math.floor(distance / pixelsPerTile);
				distanceSquared = Math.floor(distanceSquared / pixelsPerTile);
				var smallX = shape.x / pixelsPerTile;
				var smallY = shape.y / pixelsPerTile;
				if(!grid[smallX + distance]) {
					grid[smallX + distance] = [];
				}
				if(!grid[smallX - distance]) {
					grid[smallX - distance] = [];
				}
				if(!grid[smallX]) {
					grid[smallX - distance] = [];
				}
				var smallX = shape.x / pixelsPerTile;
				var smallY = shape.y / pixelsPerTile;
				if(!grid[smallX]) {
					grid[smallX] = [];
				}
				grid[smallX][smallY] = {closed:true};
				while(distance > 0) {
					for(var k = -distance; k <= distance; k++) {
						var distanceTest = Math.distanceBetweenSquared({x:smallX,y:smallY}, {x:smallX + distance, y:smallY + k});
						grid[smallX + distance][smallY + k] = {closed:distanceTest < distanceSquared};
						distanceTest = Math.distanceBetweenSquared({x:smallX,y:smallY}, {x:smallX - distance, y:smallY + k});
						grid[smallX - distance][smallY + k] = {closed:distanceTest < distanceSquared};
						if(!grid[smallX + k]) {
							grid[smallX + k] = [];
						}
						distanceTest = Math.distanceBetweenSquared({x:smallX,y:smallY}, {x:smallX + k, y:smallY + distance});
						grid[smallX + k][smallY + distance] = {closed:distanceTest < distanceSquared};
						distanceTest = Math.distanceBetweenSquared({x:smallX,y:smallY}, {x:smallX + k, y:smallY - distance});
						grid[smallX + k][smallY - distance] = {closed:distanceTest < distanceSquared};
					}
					distance--;
				}
			}
			return false;
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
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].selected && entities[i].playerId === TacoGame.Player.id) {
					var newEvent = {
						unit : entities[i].id,
						start : entities[i].getShape(),
						end : event,
						type : "MoveUnit"
					}
					TacoGame.WorldSimulator.queueCommand(new TacoGame.UserInput["UserCommand" + newEvent.type](newEvent));
				}
			}
		},
		
		setUnitDestination : function (unit, end) {
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].id === unit) {
					entities[i].setDestination(end);
					return;
				}
			}
		},
		
		isUnitSelected : function () {
			return unitSelected;
		}
		
	}
}
window.addEventListener("load", TacoGame.Map.init);
window.addEventListener("unload", TacoGame.Map.destroy);


TacoGame.Entity = function (_shape, type, unitId, playerId) {
	
	var spriteData = new window[type]();
	//Valid shapes are CIRCLE and POYLGON, both are 2d
	var shape = _shape || {
		type:"undefined"
	}
	
	var desiredLoction = null;
	var miniMapColor = "#E30000";
	if(playerId === TacoGame.Player.id) {
		miniMapColor = "#00FF40";
	}
	var id = unitId;
	var missedSteps = 0;
	
	function setDestination (end) {
		var grid = [];
		var tmp = {};
		tmp.x = end.x;
		tmp.y = end.y;
		setTimeout(function () {
			TacoGame.startAStar(
				grid,
				{x:Math.round(shape.x / pixelsPerTile), y:Math.round(shape.y / pixelsPerTile)},
				{x:Math.round(end.x / pixelsPerTile), y:Math.round(end.y / pixelsPerTile)},
				true, 
				shape.radius,
				null,
				id,
				function (response) {
					tmp.steps = response;
					desiredLoction = tmp;
					spriteData.setAction(1);
				});
		}, 1);
	}
	
	//public interface
	this.selected = false;
	this.id = id;
	this.playerId = playerId;
	this.kill = spriteData.died;
	this.gone = spriteData.gone;
	
	this.getShape = function () {
		return shape;
	};
		
	this.getDrawData = function () {
		return {
			shape : "CIRCLE",
			color : miniMapColor,
			x: shape.x,
			y: shape.y
		
		};
	};
		
	this.isLoaded = function () {
		return !!(spriteData.img);
	};
		
	this.getSpriteData = function (viewPort) {
		spriteData.updateOffsets();
		return {
			img : spriteData.img,
			offsetX : spriteData.offsetX,
			offsetY: spriteData.offsetY,
			width: spriteData.width,
			height: spriteData.height,
			x: shape.x - viewPort.x - spriteData.fixX,
			y: shape.y - viewPort.y - spriteData.fixY,
			tX: shape.x,
			tY: shape.y,
			radius: shape.radius,
			scaleNegative: spriteData.scaleNegative,
			selected : this.selected
		}
	};
		
	this.step = function () {
		spriteData.step();
		if(desiredLoction) {
			if(desiredLoction.x === shape.x &&
				desiredLoction.y === shape.y ||
				desiredLoction.steps.length === 0) {
				desiredLoction = null;
				spriteData.setAction(0);
				return;
			} else {
				var step = desiredLoction.steps.shift();
				step.x *= pixelsPerTile;
				step.y *= pixelsPerTile;
				spriteData.setDegrees(Math.angleBetweenTwoPoints(step, shape));
				if(!TacoGame.Map.isOccupied(step.x, step.y, shape.radius, id)) {
					shape.x = step.x;
					shape.y = step.y;
					missedSteps = 0;
				} else {
					missedSteps++;
					if(missedSteps > 5) {
						missedSteps = 0;
						setDestination(desiredLoction);
						return;
					}
					step.x /= pixelsPerTile;
					step.y /= pixelsPerTile;
					desiredLoction.steps.unshift(step);
				}
			}
		}
	};
	
	this.toObject = function() {
		return {
			x: shape.x,
			y: shape.y,
			r: shape.radius,
			id: id,
			playerId: playerId,
			type: type
		};
	}
		
	this.setDestination = setDestination;
}

//One per session
TacoGame.WorldSimulator = new function () {

	var commands = [];
	var step = 0;
	
	function executeCommand(command) {
		commands[command.order] = new TacoGame.UserInput["UserCommand" + command.event.type](command.event);
		commands[command.order].fix(command);
		commands[command.order].commit();
	}
	
	function gameObject() {

	}
	
	function stepWorld() {
		step++;
		TacoGame.Utils.fireEvent("stepWorld", {step:step});
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
		
		init : function () {
			setInterval(stepWorld, 100);
			TacoGame.Utils.addServerListener('commandQueued', executeCommand);
		}
	}
}
window.addEventListener("load", TacoGame.WorldSimulator.init);

TacoGame.Sprite = function (internal) {

	this.img; //Set by loader
	this.offsetX = 0;
	this.offsetY = 0;
	this.width = 80;
	this.height = 80;
	this.fixX = 40;
	this.fixY = 50;
	this.scaleNegative = false;
	
	this.setDegrees = function (newDegrees) {
		internal.degrees = newDegrees;
	};
	
	this.gone = function () {
		return internal.gone;
	}
	
	this.died = function () {
		internal.action = 3;
		internal.died = true;
	};
	
	this.setAction = function (newAction) {
		internal.step = 0;
		internal.action = newAction;
	};
};

var MarineSprite = function () {
	var me = {
		action : 0,
		step : 0,
		died : false,
		degrees : 0,
		gone: false
	};
	
	TacoGame.Sprite.call(this, me);
	var sprite = this;

	this.width = 64;
	this.height = 64;
	this.fixX = 32;
	this.fixY = 42;
	
	var startX = 0;
	var startY = 0;
	var spaceHeight = 64;
	var spaceWidth = 64;
	
	var actions = [
		{offset : 5, size : 1},//standing
		{offset : 5, size : 7},//walking
		{offset : 0, size : 5},//atacking
		{offset : 0, size : 14}//dying
	];
	
	
	this.step = function () {
		me.step++;
		if(me.died && (me.step === (actions[me.action].size - 1))) {
			console.log(me.action);
			console.log(me.step);
			me.gone = true;
			return false;
		}
		me.step = me.step % actions[me.action].size + actions[me.action].offset;
		if(me.action === 0 && Math.round(Math.random() * 30) == 15) {
			me.degrees = Math.round(Math.random() * 360);
		}
		return true;
	};
	
	this.updateOffsets = function () {
		sprite.scaleNegative = false;
		if(me.died) {
			sprite.offsetY = startY + (spaceHeight * 13);
			sprite.offsetX = startX + (spaceWidth * Math.floor(me.step / 2));
			return;
		}
		var column = Math.floor(me.degrees / 11.25);
		
		if(column > 16) {
			sprite.scaleNegative = true;
			column = 16 - (column % 16);
		}
		sprite.offsetY = startY + (spaceHeight * me.step);
		sprite.offsetX = startX + (spaceWidth * column);
	};

}
MarineSprite.prototype.imgURL = "sprites/marinez.png";


var ZerglingSprite = function () {
	var me = {
		action : 0,
		step : 0,
		died : false,
		degrees : 0,
		gone: false
	};
	
	TacoGame.Sprite.call(this, me);
	var sprite = this;
		
	var startX = 25;
	var startY = 25;
	var spaceHeight = 128;
	var spaceWidth = 128;
	
	var actions = [
		{offset : 5, size : 1},//standing
		{offset : 5, size : 7},//walking
		{offset : 0, size : 5},//atacking
		{offset : 0, size : 7}//dying
	];
	
	
	this.step = function () {
		me.step++;
		if(me.died && (me.step > actions[me.action].size)) {
			return false;
		}
		me.step = me.step % actions[me.action].size + actions[me.action].offset;
		if(me.action === 0 && Math.round(Math.random() * 30) == 15) {
			me.degrees = Math.round(Math.random() * 360);
		}
		return true;
	};
	
	this.updateOffsets = function () {
		sprite.scaleNegative = false;
		if(me.died) {
			sprite.offsetY = startY + (spaceHeight * 17);
			sprite.offsetX = startX + (spaceWidth * me.step);
			return;
		}
		var column = Math.floor(me.degrees / 11.25);
		
		if(column > 16) {
			sprite.scaleNegative = true;
			column = 16 - (column % 16);
		}
		sprite.offsetY = startY + (spaceHeight * me.step);
		sprite.offsetX = startX + (spaceWidth * column);
	};

}
ZerglingSprite.prototype.imgURL = "http://img28.imageshack.us/img28/5176/zergling.png";



var ZealotSprite = function () {
	var me = {
		action : 0,
		step : 0,
		died : false,
		degrees : 0,
		gone: false
	};
	
	TacoGame.Sprite.call(this, me);
	var sprite = this;
	
	var startX = 25;
	var startY = 25;
	var spaceHeight = 128;
	var spaceWidth = 128;
	
	var actions = [
		{offset : 5, size : 1},//standing
		{offset : 5, size : 8},//walking
		{offset : 0, size : 5},//atacking
		{offset : 0, size : 7}//dying
	];
	
	
	this.step = function () {
		me.step++;
		if(me.died && (me.step > actions[me.action].size)) {
			me.gone = true;
			return false;
		}
		me.step = me.step % actions[me.action].size + actions[me.action].offset;
		if(me.action === 0 && Math.round(Math.random() * 30) == 15) {
			me.degrees = Math.round(Math.random() * 360);
		}
		return true;
	};
	
	this.updateOffsets = function () {
		sprite.scaleNegative = false;
		if(me.died) {
			sprite.offsetY = startY + (spaceHeight * 13);
			sprite.offsetX = startX + (spaceWidth * me.step);
			return;
		}
		var column = Math.floor(me.degrees / 11.25);
		
		if(column > 16) {
			sprite.scaleNegative = true;
			column = 16 - (column % 16);
		}
		sprite.offsetY = startY + (spaceHeight * me.step);
		sprite.offsetX = startX + (spaceWidth * column);
	};

}
ZealotSprite.prototype.imgURL = "sprites/zealotx.png";

var workerPool = {
	a0 : new Worker("script/AStar.js"),
	a1 : new Worker("script/AStar.js"),
	a2 : new Worker("script/AStar.js"),
	a3 : new Worker("script/AStar.js"),
	next : 1,
	onmessage : function (message) {
		var messageData = JSON.parse(message.data);
		//console.log((new Date()).getTime() - pathFindingQueue[messageData.id + "time"]);
		pathFindingQueue[messageData.id](messageData.path);
		delete pathFindingQueue[messageData.id];
		delete pathFindingQueue[messageData.id + "time"];
	}
}

var pathFindingQueue = {};

workerPool["a0"].onmessage = workerPool.onmessage;
workerPool["a1"].onmessage = workerPool.onmessage;
workerPool["a2"].onmessage = workerPool.onmessage;
workerPool["a3"].onmessage = workerPool.onmessage;

TacoGame.startAStar = function (grid, start, end, diagonal, radius, heuristic, id, callback) {
	TacoGame.Map.fillClosedPaths(grid, radius, id);
	var message = JSON.stringify({grid:grid,start:start,end:end,diagonal:diagonal,radius:radius,heuristic:heuristic,id:id});
	workerPool["a" + workerPool.next].postMessage(message);
	workerPool.next = (workerPool.next + 1) % 4;
	pathFindingQueue[id] = callback;
	pathFindingQueue[id + "time"] = (new Date()).getTime();
}


//For debugging
/*
postMessage = function (message) {
	var messageData = JSON.parse(message.data);
	console.log((new Date()).getTime() - pathFindingQueue[messageData.id + "time"]);
	pathFindingQueue[messageData.id](messageData.path);
	delete pathFindingQueue[messageData.id];
	delete pathFindingQueue[messageData.id + "time"];
}

TacoGame.startAStar = function (grid, start, end, diagonal, radius, heuristic, id, callback) {
	TacoGame.Map.fillClosedPaths(grid, radius, id);
	var message = {data:JSON.stringify({grid:grid,start:start,end:end,diagonal:diagonal,radius:radius,heuristic:heuristic,id:id})};
	workerPool.next = (workerPool.next + 1) % 4;
	setTimeout(function () {onmessage(message)}, 1);
	pathFindingQueue[id] = callback;
	pathFindingQueue[id + "time"] = (new Date()).getTime();
}*/

//Without workers
/*
postMessage = function (message) {
	var messageData = message.data;
	console.log((new Date()).getTime() - pathFindingQueue[messageData.id + "time"]);
	pathFindingQueue[messageData.id](messageData.path);
	delete pathFindingQueue[messageData.id];
	delete pathFindingQueue[messageData.id + "time"];
}

TacoGame.startAStar = function (grid, start, end, diagonal, radius, heuristic, id, callback) {
	TacoGame.Map.fillClosedPaths(grid, radius, id);
	var message = {data:{grid:grid,start:start,end:end,diagonal:diagonal,radius:radius,heuristic:heuristic,id:id}};
	workerPool.next = (workerPool.next + 1) % 4;
	setTimeout(function () {onmessage(message)}, 1);
	pathFindingQueue[id] = callback;
	pathFindingQueue[id + "time"] = (new Date()).getTime();
}*/