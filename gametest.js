function initGame() {
	handleResize();
}

function handleResize() {
	resizeCanvas();
}
function resizeCanvas(){
	console.log("changed size");
	canvas = document.getElementById('gameScreen');
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
}
window.onresize=handleResize;
function GameEngine() {

	map = new function() {
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
	
	function mapElement(_coordinates, _size) {
		var coordinates = _coordinates || {
			x:0, //float
			y:0, //float
			z:0 //int, 0=lowest no negative
		}
		var size = _size || {
			width:0,
			depth:0
			//height does not matter because it is 2d
		}
		var displayImage = "";
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
			},
			
			intersectsElement(element) {
			
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