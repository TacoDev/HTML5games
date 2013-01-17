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
	
	var viewPort = {
		x : 0, 
		y : 0,
		width : 0,
		height : 0,
		getLeftPercent : function () {
			if(viewPort.x === 0) {
				return 0;
			}
			return viewPort.x / (maxTileX * pixelsPerTile);
		},
		getTopPercent : function () {
			if(viewPort.y === 0) {
				return 0;
			}
			return viewPort.y / (maxTileY * pixelsPerTile);
		},
		getWidthPercent : function () {
			if(viewPort.width === 0) {
				return 0;
			}
			return viewPort.width / (maxTileX * pixelsPerTile);
		},
		getHeightPercent : function () {
			if(viewPort.height === 0) {
				return 0;
			}
			return viewPort.height / (maxTileY * pixelsPerTile);
		}
	};
	
	var tiles = [];
	
	function handleResize() {
		viewPort.width  = window.innerWidth;
		viewPort.height = window.innerHeight;
	}
	
	return {
		init : function () {
			canvas = document.getElementById('gameScreen');
			window.addEventListener("resize", handleResize);
			handleResize();
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
		}
		
	}
}
window.addEventListener("load", TacoGame.Map.init);

TacoGame.MiniMap = new function () {
	
}

TacoGame.Entity = function (_coordinates, _shape) {
	var coordinates = _coordinates || {
		x:0, //float
		y:0, //float
		z:0 //int, 0=lowest no negative
	}
	//Valid shapes are CIRCLE and POYLGON, both are 2d
	var shape = _shape || {
		type:"undefined"
	}
	var miniMapColor = "grey";
	
	
	//public interface
	return {
		getCoordinates: function () {
			return coordinates;
		},
		
		getSize: function () {
			return size;
		},
		
		getImage: function () {
			return displayImage;
		},
		
		getMiniMapColor: function () {
			return miniMapColor;
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