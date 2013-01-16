function initGame() {
}


//Namespace for the game, placeholder for now
var TacoGame = {

}

//May be multiple maps in the future
TacoGame.Map = function () {

}

TacoGame.Command = function () {

}

TacoGame.MiniMap = new function () {

}

TacoGame.Circle = function (x, y, radius) {
	this.type = "CIRCLE";
	this.x = x;
	this.y = y;
	this.radius = radius;
}

TacoGame.Rectangle = function (x, y, width, height) {
	this.type = "RECTANGLE";
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

TacoGame.Poylgon = function (points) {
	this.type = "POLYGON";
	this.points = points;
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

	map = new function () {
		var minX = 0;
		var maxX = 100;
		var minY = 0;
		var maxY = 100;
	
		// x is outside, y is inside
		var elements = [[]];
		
		function placeElement(element) {
			
			function binaryInsert(elements, element, min, max) {
				if(max > min) {
				
				}
			}
			
		}
		
	}
	

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

}