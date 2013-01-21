function initGame() {
}


//Namespace for the game, placeholder for now
var TacoGame = {

}

//May be multiple maps in the future
TacoGame.Map = new function () {
	//Game tile is a 25 * 25 pixel square
	var pixelsPerTile = 25;
	var minTileX = 0;
	var maxTileX = 300;
	var minTileY = 0;
	var maxTileY = 300;
	var scrollSpeed = 7;
	var entities = [];
	
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
		/*TacoGame.Utils.loadImage(zealotSprite.imgURL,
		function (event) {
			zealotSprite.img = event.src;
		});*/
		TacoGame.Utils.loadImage(MarineSprite.prototype.imgURL,
		function (event) {
			MarineSprite.prototype.img = event.srcElement;
		});
		entities.push(new TacoGame.Entity(new TacoGame.Circle(300, 500, 3), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(500, 300, 3), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(2500, 3000, 3), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(4000, 700, 3), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(6000, 100, 3), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(3500, 7400, 3), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(6000, 6400, 3), new MarineSprite()));
	}
	
	return {
		init : function () {
			canvas = document.getElementById('gameScreen');
			window.addEventListener("resize", handleResize);
			handleResize();
			loadSprites();
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
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].isLoaded() && entities[i].inShape(viewPort)) {
					spriteData.push(entities[i].getSpriteData(viewPort));
				}
			}
			return spriteData;
		},
		
		getAllEntities : function () {
			var spriteData = [];
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].isLoaded() && entities[i].inShape(viewPort)) {
					spriteData.push(entities[i].getDrawData());
				}
			}
			return spriteData;
		}
		
	}
}
window.addEventListener("load", TacoGame.Map.init);


TacoGame.Entity = function (_shape, spriteData) {
	
	//Valid shapes are CIRCLE and POYLGON, both are 2d
	var shape = _shape || {
		type:"undefined"
	}
	var miniMapColor = "#E30000";
	
	
	//public interface
	return {
		
		getShape: function () {
			return shape;
		},
		
		getDrawData: function () {
			return {
				shape : "CIRCLE",
				color : miniMapColor,
				x: shape.x,
				y: shape.y
			
			};
		},
		
		isLoaded: function () {
			return !!(spriteData.__proto__.img);
		},
		
		inShape: function () {
			return true;
		},
		
		getSpriteData: function (viewPort) {
			spriteData.updateOffsets();
			return {
				img : spriteData.__proto__.img,
				offsetX : spriteData.offsetX,
				offsetY: spriteData.offsetY,
				width: spriteData.width,
				height: spriteData.height,
				x: shape.x - viewPort.x - 32,
				y: shape.y - viewPort.y - 32,
				scaleNegative: spriteData.scaleNegative
			}
		}
	}
}

//One per session
TacoGame.WorldSimulator = new function () {

	var commands = [];

	function circlesColliding(circle1, circle2) {
		//compare the distance to combined radii
		var dx = circle2.x - circle1.x;
		var dy = circle2.y - circle1.y;
		var radii = circle1.radius + circle2.radius;
		if ( ( dx * dx )  + ( dy * dy ) < radii * radii ) {
			return true;
		} else {
			return false;
		}
	}

	function gameObject() {

	}
	
	//This is the api for the simulator, may get rather large
	return {
		queueCommand : function (newCommand) {
			if(!newCommand.needsSync()) {
				newCommand.commit();
			}
			commands.push(newCommand);
		}
	}
}

var zealotSprite = new function () {
	var internal = this;
	
	this.imgURL = "http://imageshack.us/a/img708/1269/zealotx.png";
	this.startX = 25;
	this.startY = 25;
	this.width = 80;
	this.height = 80;
	this.spaceHeight = 128;
	this.spaceWidth = 128;

	internal.actions = [
		{min : 5, max : 6},
		{min : 5, max : 13},
		{min : 0, max : 5}
	];
	this.getMinMax = function(action) {
		return internal.actions[action] || false;
	}
	this.drawDeath = function () {
		for(var i = 0; i < 7; i++) {
			var offsetY = internal.startY + (internal.spaceHeight * 13);
			var offsetX = internal.startX + (internal.spaceWidth * i);
			drawCurrentOnTimeout(offsetX, offsetY, false, time * i);
		}
	}
}

var MarineSprite = function () {
	var internal = this;
	
	this.img; //Set by loader
	this.offsetX = 0;
	this.offsetY = 0;
	this.width = 64;
	this.height = 64;
	this.scaleNegative = false;
	
	var startX = 0;
	var startY = 0;
	var spaceHeight = 64;
	var spaceWidth = 64;
	
	var actions = [
		{offset : 5, size : 1},
		{offset : 5, size : 7},
		{offset : 0, size : 5},
		{offset : 0, size : 7}
	];
	
	var action = 0;
	var step = 0;
	var died = false;
	var degrees = 0;
	
	this.died = function () {
		died = true;
	};
	
	this.setAction = function (action) {
		step = -1;
		action = newAction;
	};
	
	this.updateStep = function () {
		step++;
		if(died && (step > actions[action].size)) {
			return false;
		}
		step = step % actions[action].size + actions[action].offset;
		if(action === 0) {
			degrees = Math.round(Math.random() * 360);
		}
		return true;
	};
	
	this.updateOffsets = function () {
		internal.scaleNegative = false;
		if(died) {
			internal.offsetY = startY + (spaceHeight * 13);
			internal.offsetX = startX + (spaceWidth * step);
			return;
		}
		var column = Math.floor(degrees / 11.25);
		
		if(column > 16) {
			internal.scaleNegative = true;
			column = 16 - (column % 16);
		}
		internal.offsetY = startY + (spaceHeight * step);
		internal.offsetX = startX + (spaceWidth * column);
	};
	
	this.drawDeath = function () {
		for(var i = 0; i < 7; i++) {
			var offsetY = internal.startY + (internal.spaceHeight * 13);
			var offsetX = internal.startX + (internal.spaceWidth * i);
			drawCurrentOnTimeout(offsetX, offsetY, false, time * i);
		}
	};
	
	setInterval(internal.updateStep, 1000 + (Math.random() * 500));
}
MarineSprite.prototype.imgURL = "http://img3.imageshack.us/img3/6937/marinez.png";

var zerglingSprite = new function () {
	var internal = this;
	this.imgURL = "http://img28.imageshack.us/img28/5176/zergling.png";
	this.startX = 25;
	this.startY = 25;
	this.width = 80;
	this.height = 80;
	this.spaceHeight = 128;
	this.spaceWidth = 128;
	this.actions = [
		{min : 5, max : 6},
		{min : 5, max : 12},
		{min : 0, max : 5},
		{min : 12, max : 17},
	];
	this.getMinMax = function(action) {
		return this.actions[action] || false;
	}
	
	this.drawDeath = function () {
		for(var i = 0; i < 7; i++) {
			var offsetY = internal.startY + (internal.spaceHeight * 17);
			var offsetX = internal.startX + (internal.spaceWidth * i);
			drawCurrentOnTimeout(offsetX, offsetY, false, time * i);
		}
	}
}