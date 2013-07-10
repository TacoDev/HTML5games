

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
	
	TacoGame.Utils.addListener('stepWorld', step);
	
	function setDestination (start, end, startTime) {
		//TODO look into application cache to share this
		TacoGame.PathFinding.createPath(
			start,
			end,
			id,
			spriteData.unitSpeed,
			startTime);
	}
	
	function step(time) {
		spriteData.step();
		if(desiredLocation && !spriteData.isDead()) {
			if(time > desiredLocation.steps.lastStepTime) {
				shape.x = desiredLocation.steps.end.x;
				shape.y = desiredLocation.steps.end.y;
				desiredLocation = null;
				spriteData.setAction(0);
				return;
			} else if (desiredLocation.steps[time]) {
				var nextStep = desiredLocation.steps[time];
				spriteData.setDegrees(Math.angleBetweenTwoPoints(nextStep, shape));
				shape.x = nextStep.x;
				shape.y = nextStep.y;
				if(TacoGame.Map.isOccupied(nextStep.x, nextStep.y, shape.radius, id)) {
					console.log('Error!!');
				}
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
				units:[{unit:unitId,start:shape}],
				end:shape,
				start:shape
			};
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
	
	this.setPath = function (newPath) {
		//TODO make sure it is only to the latest request
		desiredLocation = {
			x: newPath.end.x,
			y: newPath.end.y,
			steps: newPath
		};
		spriteData.setAction(1);
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
	
	this.unitSpeed = 10;
	
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