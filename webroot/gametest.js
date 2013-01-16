function initGame() {
	TacoGame.CanvasApi.init();
	TacoGame.UserInput.init();
}


//Namespace for the game, placeholder for now
var TacoGame = {

}

//May be multiple maps in the future
TacoGame.Map = function () {

}

//One per session
TacoGame.CanvasApi = new function () {
	var canvas;
	var ctx;
	var grassTile, waterTile;
	var grassPattern, waterPattern;
	var colorInterval;
	
	var userActions = {
		drawDrag : function (gameEvent) {
			ctx.fillStyle = gameEvent.color;
			ctx.strokeStyle = gameEvent.color;
			
			ctx.rect(gameEvent.x, gameEvent.y, gameEvent.width, gameEvent.height);
			ctx.stroke();
			ctx.globalAlpha = gameEvent.timeLeft / 1000;
			ctx.fillRect(gameEvent.x, gameEvent.y, gameEvent.width, gameEvent.height);
		},
		drawClick : function (gameEvent) {
			ctx.fillStyle = gameEvent.color;
			ctx.strokeStyle = gameEvent.color;
			
			ctx.beginPath();
			ctx.arc(gameEvent.x, gameEvent.y,gameEvent.timeLeft / 20,0,2*Math.PI);
			ctx.stroke();
			ctx.beginPath();
			ctx.globalAlpha = gameEvent.timeLeft / 1000;
			ctx.arc(gameEvent.x, gameEvent.y,gameEvent.timeLeft / 20,0,2*Math.PI);
			ctx.fill();
		}
	}
	
	function resizeCanvas(){
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	
	function handleResize() {
		resizeCanvas();
		drawMap();
	}
	
	function loadImages() {
		grassTile = document.getElementById("grassTile");
		waterTile = document.getElementById("waterTile");
		grassPattern = ctx.createPattern(grassTile,"repeat");
		waterPattern = ctx.createPattern(waterTile,"repeat");
	}
	
	//Need a way to store what type of floor to display in the map so that we can draw it fast
	function drawMap() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = grassPattern;
		ctx.fill();
		
	}
	
	//Do nothing for now
	function drawEntities() {
	
	}
	
	//Do nothing for now
	function drawEffects() {
	
	}
	
	function drawUserInteractions() {
		var interactions = TacoGame.UserInput.getInteractions();
		var i = 0;
		for(i = 0; i < interactions.length; i++) {
			userActions["draw" + interactions[i].type](interactions[i]);
			ctx.globalAlpha = 1;
		}
		if(interactions.current) {
			userActions["draw" + interactions.current.type](interactions.current);
		}
		ctx.globalAlpha = 1;
	}
	
	function drawUI() {
		drawMap();
		drawEntities();
		drawEffects();
		drawUserInteractions();
	}
	
	return {
		init : function() {
			canvas = document.getElementById('gameScreen');
			ctx = canvas.getContext("2d");
			loadImages();
			window.addEventListener("resize", handleResize);
			handleResize();
			colorInterval = setInterval(drawUI, 1/20);
		},
		draw: drawUI
	}
}

TacoGame.Command = function () {

}

TacoGame.MiniMap = new function () {

}


TacoGame.UserInput = new function () {
	
	var wiggleRoom = 8;
	var animationLengthMs = 200;
	var animationSteps = 10;
	var clickPosition = null;
	var dragRectangle = null;
	var canvas;
	var animations = [];
	var selectColor = "#00FF00";
	var attackColor = "#FF0000";
	//an object that gives us all the currently pressed keys
	var keysDown = {};
	
	//Used to make the drag fade animation
	function fadeAnimations() {
		var i;
		for(i = 0; i < animations.length; i++) {
			animations[i].timeLeft -= animationSteps;
		}
		while(animations.length && animations[0].timeLeft <= 0) {
			animations.shift();
		}
		if(animations.length >= 1) {
			setTimeout(fadeAnimations, animationSteps);
		}
	}
	
	//Used to make click and select animations appear
	function handleFade(event) {
		delete animations.current;
		animations.push(event);
		if(animations.length === 1) {
			fadeAnimations();
		}
	}
	
	function handleDrag(event) {
		//Setup click data, this is a mouse down
		//TODO These need to be translated into world coords!!
		clickPosition = {
			x: event.clientX, 
			y: event.clientY,
			timeLeft: animationLengthMs,
			color: selectColor,
			type: "Click"
		};
		//Setup Drag data
		dragRectangle = new TacoGame.Rectangle(clickPosition.x, clickPosition.y, 0, 0);
		dragRectangle.timeLeft = animationLengthMs;
		dragRectangle.color = selectColor;
		dragRectangle.type = "Drag";
		
		if(event.button === 2) {
			dragRectangle = null;
			return false;
		}
		window.addEventListener("mousemove", updateDrag);
		return false;
	}
	
	function updateDrag(event) {
		if(dragRectangle === null) {
			window.removeEventListener("mousemove", updateDrag);
		} else {
			animations.current = dragRectangle;
			//canvas draws negative width wrong so need to make sure it is always positive
			dragRectangle.width = Math.abs(event.clientX - clickPosition.x);
			dragRectangle.height = Math.abs(event.clientY - clickPosition.y);
			dragRectangle.x = Math.min(event.clientX, clickPosition.x);
			dragRectangle.y = Math.min(event.clientY, clickPosition.y);
		}
	}
	
	function endDrag(event) {
		window.removeEventListener("mousemove", updateDrag);
		if(dragRectangle === null) {
			return;
		}
		if(Math.abs(dragRectangle.width + dragRectangle.height) <= wiggleRoom) {
			dragRectangle = null;
			//Click will now deal with it
		} else {
			event.preventDefault();
			//Pass selection onto game
			handleEvent(dragRectangle);
		}
	}
	
	
	//used for single unit selection or deselection
	function handleLeftClick(event) {
		//Don't fire click if this was a drag
		if ((Math.abs(event.clientX - clickPosition.x) + 
			Math.abs(event.clientY - clickPosition.y)) <= wiggleRoom) {
			handleEvent(clickPosition);
		}
	}
	
	//Used for giving a move command or an a move command
	function handleRightClick(event) {
		event.preventDefault();
		if (keysDown[65]) {
			clickPosition.color = attackColor;
		}
		//TODO should ignore if nothing is selected
		handleEvent(clickPosition);
	}
	
	function handleKeyDown(event) {
		keysDown[event.keyCode] = event;
	}
	
	function handleKeyUp(event) {
		delete keysDown[event.keyCode];
	}
	
	//Creates a Command for the gameEngine, passes on the animation if one exists
	function handleEvent(event) {
		//Commands are select, move attack, or hotkey
		if(event.color) {
			handleFade(event);
		}
	}
	
	return {
		getInteractions : function() {
			return animations;
		},
		init: function() {
			canvas = document.getElementById('gameScreen');
			window.addEventListener("mousedown", handleDrag);
			window.addEventListener("mouseup", endDrag);
			window.addEventListener("click", handleLeftClick);
			window.addEventListener("contextmenu", handleRightClick);
			window.addEventListener("keydown", handleKeyDown);
			window.addEventListener("keyup", handleKeyUp);
			//TODO key press for hot keys
		}
	}
	
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