//One per session
TacoGame.CanvasApi = new function () {
	var canvas;
	var ctx;
	//These point to img tags
	var grassTile, waterTile;
	//These point to pattern objects that ctx understands
	var grassPattern, waterPattern;
	//Pointer to the main paint loop interval
	var colorInterval;
	
	var userActions = {
		drawDrag : function (gameEvent) {
			ctx.fillStyle = gameEvent.color;
			ctx.strokeStyle = gameEvent.color;
			
			ctx.beginPath();
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
			ctx.closePath();
			ctx.stroke();
			
			ctx.beginPath();
			ctx.globalAlpha = gameEvent.timeLeft / 1000;
			ctx.arc(gameEvent.x, gameEvent.y,gameEvent.timeLeft / 20,0,2*Math.PI);
			ctx.closePath();
			ctx.fill();
		}
	}
	
	function resizeCanvas(){
		canvas.width  = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	
	function handleResize() {
		resizeCanvas();
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
		ctx.fillStyle = grassPattern;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
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
			ctx.globalAlpha = 1;
		}
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
			colorInterval = setInterval(drawUI, 1/30 * 1000);
		},
		draw: drawUI
	}
}

window.addEventListener("load", TacoGame.CanvasApi.init);