//These are more of a way to define objects for now so that it is the same every where
TacoGame.Shape = function () {
	this.type = "SHAPE";
	this.strokeColor = "";
	this.fillColor = "";
	this.strokeAlpha = 1;
	this.fillAlpha = 1;
	this.translate = {x:0, y:0};
	this.degrees = 0;
}

TacoGame.Circle = function (x, y, radius) {
	this.type = "CIRCLE";
	this.x = x;
	this.y = y;
	this.radius = radius;
}


TacoGame.Rectangle = function (x, y, width, height) {
	var internal = this;
	this.type = "RECTANGLE";
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.getPoints = function () {
		return [
			{x:internal.x,y:internal.y},
			{x:internal.x + internal.width,y:internal.y},
			{x:internal.x + internal.width,y:internal.y + internal.height},
			{x:internal.x,y:internal.y + internal.height}
		]
	}
}

TacoGame.Poylgon = function (points) {
	this.type = "POLYGON";
	this.points = points;
}

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
		drawSelect : function (gameEvent) {
			ctx.save();
			ctx.fillStyle = gameEvent.color;
			ctx.strokeStyle = gameEvent.color;
			
			ctx.beginPath();
			ctx.rect(gameEvent.x, gameEvent.y, gameEvent.width, gameEvent.height);
			ctx.stroke();
			ctx.globalAlpha = gameEvent.timeLeft / 1000;
			ctx.fillRect(gameEvent.x, gameEvent.y, gameEvent.width, gameEvent.height);
			ctx.restore();
		},
		drawClick : function (gameEvent) {
			ctx.save();
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
			
			ctx.restore();
		},
		drawScroll : function (gameEvent) {
			var arrowPolygon = {
				points : [
					{x:0, y:0},
					{x:0, y:24},
					{x:8, y:18},
					{x:20, y:29},
					{x:29, y:20},
					{x:18, y:8},
					{x:24, y:0}
				],
				strokeColor: gameEvent.color,
				fillColor: gameEvent.color,
				translate: {x:gameEvent.x, y:gameEvent.y}
			}
			
			if(gameEvent.directions == 2) {
				if(gameEvent.right && gameEvent.up) {
					arrowPolygon.degrees = 90;
				}
				if(gameEvent.right && gameEvent.down) {
					arrowPolygon.degrees = 180;
				}
				if(gameEvent.left && gameEvent.down) {
					arrowPolygon.degrees = 270;
				}
			
			} else {
				if(gameEvent.up) {
					arrowPolygon.degrees = 45;
				}
				if(gameEvent.down) {
					arrowPolygon.degrees = 225;
				}
				if(gameEvent.right) {
					arrowPolygon.degrees = 135;
				}
				if(gameEvent.left) {
					arrowPolygon.degrees = 315;
				}
			}
			drawPoylgon(arrowPolygon);
		}
	}
	
	function drawPoylgon(polygon) {
		var points = polygon.points;
		var length = points.length;
		//Need 3 points at least
		if(length < 2) {
			return;
		}
		ctx.save();
		if(polygon.translate) {
			ctx.translate(polygon.translate.x, polygon.translate.y);
		}
		if(polygon.degrees) {
			ctx.rotate(polygon.degrees * Math.PI/180);
		}
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for(var i = 1; i < length; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.closePath();
		ctx.strokeStyle = polygon.strokeColor || ctx.strokeStyle;
		ctx.fillStyle = polygon.fillColor || ctx.fillStyle;
		ctx.globalAlpha = polygon.strokeAlpha || ctx.globalAlpha;
		ctx.stroke();
		ctx.globalAlpha = polygon.fillAlpha || ctx.globalAlpha;
		ctx.fill();
		
		ctx.restore();
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
		var entities = TacoGame.Map.getEntities();
		var viewport = TacoGame.Map.getViewPort();
		for(var i = 0; i < entities.length; i++) {
			ctx.save();
			
			if(entities[i].radius && entities[i].selected) {
				ctx.beginPath();
				ctx.fillStyle = "#00E32A";
				ctx.strokeStyle = "#00E32A";
				ctx.setTransform(1.3,0,0,.7, -viewport.x, -viewport.y);
				ctx.beginPath();
				ctx.arc(entities[i].tX / 1.3 , entities[i].tY / .7, entities[i].radius, 0, 2*Math.PI);
				ctx.stroke();
				ctx.globalAlpha = .2;
				ctx.fill();
			}
			ctx.restore();
			ctx.save();
			if(entities[i].scaleNegative) {
				ctx.scale(-1, 1);
				ctx.drawImage(entities[i].img, entities[i].offsetX, entities[i].offsetY, entities[i].width, entities[i].height, -entities[i].x-entities[i].width, entities[i].y, entities[i].width, entities[i].height);
			} else {
				ctx.drawImage(entities[i].img, entities[i].offsetX, entities[i].offsetY, entities[i].width, entities[i].height, entities[i].x, entities[i].y, entities[i].width, entities[i].height);
			}
			ctx.restore();
			if(entities[i].dead) {
				continue;
			}
			ctx.save();
			var helthPercent = entities[i].health / entities[i].maxHealth;
			ctx.globalAlpha=0.7;
			ctx.fillStyle = "#FF0000";
			ctx.fillRect (entities[i].healthX, entities[i].healthY, entities[i].healthWidth, 4);
			ctx.fillStyle = "#00FF00";
			ctx.fillRect (entities[i].healthX, entities[i].healthY, helthPercent * entities[i].healthWidth, 4);
			ctx.restore();
			ctx.save();
			if(entities[i].radius && entities[i].selected) {
				ctx.beginPath();
				ctx.fillStyle = "#FF0000";
				ctx.strokeStyle = "#FF000";
				ctx.setTransform(1.3,0,0,.7, -viewport.x, -viewport.y);
				ctx.beginPath();
				ctx.arc(entities[i].tX / 1.3 , entities[i].tY / .7, entities[i].range, 0, 2*Math.PI);
				ctx.stroke();
				ctx.globalAlpha = .2;
				ctx.fill();
			}
			ctx.restore();
		}
	}
	
	//Do nothing for now
	function drawEffects() {
	
	}
	
	function drawOverlay() {
		ctx.save();
		var viewport = TacoGame.Map.getViewPort();
		var sideLength = 300;
		var padding = 10;
		var top = canvas.height - sideLength - padding;
		ctx.clearRect(padding, top, sideLength, sideLength);
		ctx.beginPath();
		ctx.rect(padding, top, sideLength, sideLength);
		ctx.strokeStyle = "#7D4404";
		ctx.fillStyle = "#008521";
		ctx.lineWidth = "3";
		ctx.stroke();
		ctx.fill();
		
		//Outline of the screen
		ctx.beginPath();
		ctx.rect(viewport.getLeftPercent() * sideLength + padding,
				top + viewport.getTopPercent() * sideLength,
				viewport.getWidthPercent() * sideLength, 
				viewport.getHeightPercent() * sideLength);
		ctx.strokeStyle = "#E0E0E0";
		ctx.lineWidth = "2";
		ctx.stroke();
		
		var entities = TacoGame.Map.getAllEntities();
		for(var i = 0; i < entities.length; i++) {
			ctx.save();
			ctx.fillStyle = entities[i].color;
			
			ctx.beginPath();
			ctx.arc(entities[i].x / viewport.getWidthConversion() * sideLength + padding, entities[i].y / viewport.getHeightConversion() * sideLength + top, 1, 0, 2*Math.PI);
			ctx.closePath();
			ctx.fill();
			
			ctx.restore();
		}
		
		ctx.restore();
	}
	
	function drawUserInteractions() {
		var interactions = TacoGame.UserInput.getInteractions();
		var i = 0;
		for(i = 0; i < interactions.length; i++) {
			userActions["draw" + interactions[i].type](interactions[i]);
		}
		for(i in interactions.staticEvents) {
			userActions["draw" + interactions.staticEvents[i].type](interactions.staticEvents[i]);
		}
	}
	
	function drawUI() {
		drawMap();
		drawEntities();
		drawEffects();
		drawUserInteractions();
		drawOverlay();
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