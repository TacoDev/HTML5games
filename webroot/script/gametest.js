function initGame() {
}


//Namespace for the game, placeholder for now
var TacoGame = {

}

TacoGame.Player = new function () {
	var user = null;
	
	this.id = Math.round(Math.random() * 9000 + 1000) + "-" + Math.round(Math.random() * 9000 + 1000) + "-" + Math.round(Math.random() * 9000 + 1000);
}
var width = 250;
var pixelsPerTile = 10;
var gridCache = {};

//May be multiple maps in the future
TacoGame.Map = new function () {
	//Game tile is a 25 * 25 pixel square
	var minTileX = 0;
	var maxTileX = width;
	var minTileY = 0;
	var maxTileY = width;
	var scrollSpeed = 5;
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
				var num = (Math.random() * (max - min)) + min;
				num -= num % 10 + 5;
				return num
			}
			var marineRadius = 20;
			var centerX = randomInt(200, 2300);
			var centerY = randomInt(200, 2300);
			for(var i = 0; i < 10; i++) {
				do {
					var x = randomInt(centerX - 100, centerX + 100);
					var y = randomInt(centerX - 100, centerX + 100);
				} while(TacoGame.Map.isOccupied(x, y, marineRadius, marineRadius));
				var id = (new Date()).getTime() + "" + Math.round(Math.random() * 600);
				addEntity({x:x,y:y,r:marineRadius,type:"MarineSprite",playerId:TacoGame.Player.id,id:id});
			}
			sendRequest(request({lib:"commander",func:"getUnits"}));
		}
	}
	
	function killUnit(unit) {
		entitiesMap[newUnit.id].kill();
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
	
	function setGridValue(x, y, closed) {
		if(closed) {
			gridCache[x][y] = {closed:true};
			return;
		}
		delete gridCache[x][y];
	}
	
	function fillGridPaths(shape, closed) {
		var distance = Math.floor(shape.radius / pixelsPerTile);
		var smallX = Math.floor(shape.x / pixelsPerTile);
		var smallY = Math.floor(shape.y / pixelsPerTile);
		if(!gridCache[smallX]) {
			gridCache[smallX] = [];
		}
		if(!gridCache[smallX - 1]) {
			gridCache[smallX - 1] = [];
		}
		if(!gridCache[smallX + 1]) {
			gridCache[smallX + 1] = [];
		}
		
		if(distance >= 1) {
			setGridValue(smallX, smallY, closed);
		}
		if(distance >= 2) {
			setGridValue(smallX - 1, smallY, closed);
			setGridValue(smallX, smallY - 1, closed);
			setGridValue(smallX - 1, smallY - 1, closed);
		}
		if(distance >= 3) {
			setGridValue(smallX, smallY + 1, closed);
			setGridValue(smallX + 1, smallY, closed);
			setGridValue(smallX + 1, smallY - 1, closed);
			setGridValue(smallX + 1, smallY + 1, closed);
			setGridValue(smallX - 1, smallY + 1, closed);
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
		
		addClosedPaths : function (shape) {
			fillGridPaths(shape, true);
		},
		
		removeClosedPaths : function (shape) {
			fillGridPaths(shape, false);
		},
		
		isOccupied : function (x, y, r, id) {
			var hit = false;
			function checkSquare(x, y) {
				hit = hit || gridCache[x][y];
			}
			var distance = Math.floor(r / pixelsPerTile);
			var smallX = Math.floor(x / pixelsPerTile);
			var smallY = Math.floor(y / pixelsPerTile);
			if(!gridCache[smallX]) {
				gridCache[smallX] = [];
			}
			if(!gridCache[smallX - 1]) {
				gridCache[smallX - 1] = [];
			}
			if(!gridCache[smallX + 1]) {
				gridCache[smallX + 1] = [];
			}
			
			if(distance >= 1) {
				checkSquare(smallX, smallY);
			}
			if(distance >= 2) {
				checkSquare(smallX - 1, smallY);
				checkSquare(smallX, smallY - 1);
				checkSquare(smallX - 1, smallY - 1);
			}
			if(distance >= 3) {
				checkSquare(smallX, smallY + 1);
				checkSquare(smallX + 1, smallY);
				checkSquare(smallX + 1, smallY - 1);
				checkSquare(smallX + 1, smallY + 1);
				checkSquare(smallX - 1, smallY + 1);
			}
			return hit;
		},
		
		setDestination : function (event) {
			for (var i = 0; i < playerEntities.length; i++) {
				if(playerEntities[i].selected) {
					var newEvent = {
						unit : playerEntities[i].id,
						start : playerEntities[i].getShape(),
						end : event,
						type : "MoveUnit"
					}
					TacoGame.WorldSimulator.queueCommand(TacoGame.createCommand(newEvent));
				}
			}
		},
		
		setUnitDestination : function (unit, end) {
			entitiesMap[unit].setDestination(end);
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
	var step = 0;
	
	function executeCommand(command) {
		commands[command.order] = TacoGame.createCommand(command.event);
		commands[command.order].fix(command);
		commands[command.order].commit();
	}
	
	function gameObject() {

	}
	
	function checkAttack() {
		TacoGame.Utils.fireEvent("checkAttack", {step:step});
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
			//setInterval(checkAttack, 50);
			TacoGame.Utils.addServerListener('commandQueued', executeCommand);
		}
	}
}
window.addEventListener("load", TacoGame.WorldSimulator.init);


TacoGame.Entity = function (_shape, type, unitId, playerId, initHealth, initDesiredLocation) {
	var me = this;
	var spriteData = new window[type](me);
	//Valid shapes are CIRCLE and POYLGON, both are 2d
	var shape = _shape || {
		type:"undefined"
	}
	
	var desiredLocation = initDesiredLocation || null;
	var miniMapColor = "#E30000";
	spriteData.img = spriteData.rImg || spriteData.img;
	if(playerId === TacoGame.Player.id) {
		miniMapColor = "#00FF40";
		spriteData.img = spriteData.gImg || spriteData.img;
	}
	var id = unitId;
	var missedSteps = 0;
	var health = initHealth || spriteData.maxHealth;
	var tries = 0;
	
	setTimeout(step, 100 / spriteData.unitSpeed);
	TacoGame.Map.addClosedPaths(shape);
	
	function setDestination (end) {
		var grid = [];
		var tmp = {};
		if(shape.x === end.x &&
			shape.y === end.y) {
			return;
		}
		tmp.x = end.x;
		tmp.y = end.y;
		setTimeout(function () {
			TacoGame.startAStar(
				grid,
				{x:Math.round(shape.x / pixelsPerTile), y:Math.round(shape.y / pixelsPerTile)},
				{x:Math.round(end.x / pixelsPerTile), y:Math.round(end.y / pixelsPerTile)},
				shape,
				id,
				spriteData.unitSpeed,
				function (response) {
					tmp.steps = response;
					desiredLocation = tmp;
					spriteData.setAction(1);
				});
		}, 1);
	}
	
	function step() {
		setTimeout(step, 100 / spriteData.unitSpeed);
		spriteData.step();
		if(desiredLocation && !spriteData.isDead()) {
			if(desiredLocation.x === shape.x &&
				desiredLocation.y === shape.y ||
				desiredLocation.steps.length === 0) {
				desiredLocation = null;
				spriteData.setAction(0);
				return;
			} else {
				var nextStep = desiredLocation.steps.shift();
				spriteData.setDegrees(Math.angleBetweenTwoPoints(nextStep, shape));
				TacoGame.Map.removeClosedPaths(shape);
				if(!TacoGame.Map.isOccupied(nextStep.x, nextStep.y, shape.radius, id)) {
					shape.x = nextStep.x;
					shape.y = nextStep.y;
					if(missedSteps) {
						spriteData.setAction(1);
					}
					missedSteps = 0;
					tries = 0;
				} else {
					console.log('Some one is here!');
					spriteData.setAction(0);
					missedSteps++;
					if(missedSteps > 3 && tries < 3) {
						missedSteps = 0;
						setDestination(desiredLocation);
						tries++;
						return;
					}
					desiredLocation.steps.unshift(nextStep);
				}
				TacoGame.Map.addClosedPaths(shape);
			}
		}
	}
	
	//public interface
	this.selected = false;
	this.id = id;
	this.playerId = playerId;
	
	
	this.handleKeyPress = function (keyPressed) {
		if(keyPressed.char === 's') {
			var event = {
				type:"MoveUnit",
				unit:unitId,
				end:shape,
				start:shape
			};
			if(desiredLocation) {
				event.end = desiredLocation.steps.shift();
			}
			TacoGame.WorldSimulator.queueCommand(TacoGame.createCommand(event));
		}
		spriteData.handleKeyPress(keyPressed);
	};
	
	this.attacked = function (damage) {
		health -= damage;
		if(health <= 0) {
			health = 0;
			me.kill();
			me.selected = false;
		}
	}
	
	this.getHealth = function () {
		return health;
	}
	
	this.canAttack = function () {
		return (spriteData.getAction() === 0);
	};
	
	this.attack = function (degrees) {
		spriteData.setAction(2);
		setTimeout(function () {spriteData.setAction(0)}, spriteData.coolDown * 1000);
		spriteData.setDegrees(degrees);
	};
	
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
			selected : me.selected,
			health: health,
			maxHealth: spriteData.maxHealth,
			healthWidth: spriteData.healthWidth,
			healthX: shape.x - viewPort.x - spriteData.healthX,
			healthY: shape.y - viewPort.y - spriteData.healthY,
			range: spriteData.range,
			sight: spriteData.sight,
			dead: spriteData.isDead()
		}
	};
		
	
	
	this.toObject = function() {
		return {
			x: shape.x,
			y: shape.y,
			r: shape.radius,
			id: id,
			playerId: playerId,
			type: type,
			health: health,
			desiredLocation:desiredLocation
		};
	}
		
	this.setDestination = setDestination;
	this.recalculatePath = function () {
		setDestination({x:desiredLocation.x,y:desiredLocation.y});
	}
}

TacoGame.Sprite = function (internal, parent) {
	var me = this;
	this.img; //Set by loader
	this.rImg; //Set by loader
	this.gImg; //Set by loader
	this.offsetX = 0;
	this.offsetY = 0;
	this.width = 80;
	this.height = 80;
	this.fixX = 40;
	this.fixY = 50;
	this.scaleNegative = false;
	this.maxHealth;
	this.healthWidth;
	this.healthX;
	this.healthY;
	this.unitSpeed = 1;
	this.damage = 5;
	this.range = 5;
	this.sight = 7;
	this.coolDown = 1;
	
	this.setDegrees = function (newDegrees) {
		internal.degrees = newDegrees;
	};
	
	this.gone = function () {
		return internal.gone;
	}
	
	this.died = function () {
		internal.action = 3;
		internal.died = true;
		me.setAction = function () {};
	};
	
	this.isDead = function () {
		return internal.died;
	};
	
	this.setAction = function (newAction) {
		internal.step = 0;
		internal.action = newAction;
	};
	
	this.getAction = function () {
		return internal.action;
	};
	
	this.handleKeyPress = function (keyPressed) {
		
	};
};

var MarineSprite = function (parent) {
	var me = {
		action : 0,
		step : 0,
		died : false,
		degrees : 0,
		gone: false
	};
	
	TacoGame.Sprite.call(this, me, parent);
	var sprite = this;

	this.width = 64;
	this.height = 64;
	this.fixX = 32;
	this.fixY = 42;
	
	this.unitSpeed = 1;
	
	this.maxHealth = 50;
	this.healthX = 9;
	this.healthWidth = 18;
	this.healthY = 27;
	
	this.damage = 5;
	this.range = 100;
	this.sight = 140;
	this.coolDown = 1;
	
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

	this.handleStim = function () {
		var multiplier = 1.1;
		var attackMultiplier = 1.3;
		parent.attacked(5);
		sprite.unitSpeed *= multiplier;
		sprite.damage *= attackMultiplier;
		sprite.coolDown /= attackMultiplier;
		setTimeout(function () {
			sprite.unitSpeed /= multiplier;
			sprite.damage /= attackMultiplier;
			sprite.coolDown *= attackMultiplier;
		}, 5 * 1000);
		parent.recalculatePath();
	};
	
	this.handleKeyPress = function (keyPressed) {
		var multiplier = 1.1;
		if(keyPressed.char === 't') {
			if(parent.getHealth() > 10) {
				var event = {
					type: "EntityAction",
					action: "Stim",
					unit: parent.id
				};
				TacoGame.WorldSimulator.queueCommand(TacoGame.createCommand(event));
			}
		}
	};
	
	parent.kill = sprite.died;
	parent.gone = sprite.gone;
	parent.damage = sprite.damage;
	parent.range = sprite.range;
	parent.sight = sprite.sight;
	parent.handleStim = sprite.handleStim;
}
MarineSprite.prototype.imgURLGreen = "sprites/marinezGreen.png";
MarineSprite.prototype.imgURLRed = "sprites/marinezRed.png";


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
	next : 0,
	onmessage : function (message) {
		var messageData = JSON.parse(message.data);
		console.log((new Date()).getTime() - pathFindingQueue[messageData.messageId + "time"]);
		pathFindingQueue[messageData.messageId](messageData.path);
		delete pathFindingQueue[messageData.messageId];
		delete pathFindingQueue[messageData.messageId + "time"];
	}
}

var pathFindingQueue = {};
var poolSize = 20;
for(var i = 0; i < poolSize; i++) {
	workerPool["a" + i] = new Worker("script/AStar.js");
	workerPool["a" + i].onmessage = workerPool.onmessage;
}

TacoGame.startAStar = function (grid, start, end, shape, id, moveSpeed, callback) {
	var messageId = id + "" + new Date().getTime();
	TacoGame.Map.removeClosedPaths(shape);
	var message = JSON.stringify({grid:gridCache,start:start,end:end,moveSpeed:moveSpeed,messageId:messageId});
	TacoGame.Map.addClosedPaths(shape);
	workerPool["a" + workerPool.next].postMessage(message);
	workerPool.next = (workerPool.next + 1) % poolSize;
	pathFindingQueue[messageId] = callback;
	pathFindingQueue[messageId + "time"] = (new Date()).getTime();
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