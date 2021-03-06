
TacoGame.UserInput = new function () {
	
	var wiggleRoom = 8;
	var scrollWiggleRoom = 2;
	var animationLengthMs = 300;
	var animationSteps = 10;
	var clickPosition = null;
	var dragRectangle = null;
	var scrollEvent = {
			up:false,
			down:false,
			right:false,
			left:false,
			x:0,
			y:0,
			mouseDirections:0, //Max is 2
			keyDirections:0, //Max is 2
			directions:0, //Max is 2
			color:scrollColor,
			type: "Scroll"
		};
	var canvas;
	var animations = [];
	animations.staticEvents = {};
	var selectColor = "#00FF00";
	var attackColor = "#FF0000";
	var scrollColor = "#00FF00";
	//an object that gives us all the currently pressed keys
	var keysDown = {};
	var mouse = {
			color:"#0000FF",
			type: "Click",
			timeLeft : 100,
			x:0,
			y:0,
			rX:0,
			rY:0,
			locked: false
	};
	var browserDependants = {
		std : {
			movementX : "movementX",
			movementY : "movementY",
			pointerlockchange: "pointerlockchange",
			pointerlockerror: "webkitpointerlockerror",
			pointerLockElement: "pointerLockElement",
			requestPointerLock: "requestPointerLock"
		},
		moz : {
			movementX : "mozMovementX",
			movementY : "mozMovementY",
			pointerlockerror: "mozpointerlockerror",
			pointerlockchange: "mozpointerlockchange",
			pointerLockElement: "mozPointerLockElement",
			requestPointerLock: "mozRequestPointerLock"
		},
		webkit : {
			movementX : "webkitMovementX",
			movementY : "webkitMovementY",
			pointerlockerror: "webkitpointerlockerror",
			pointerlockchange: "webkitpointerlockchange",
			pointerLockElement: "webkitPointerLockElement",
			requestPointerLock: "webkitRequestPointerLock"
		}
	};
	
	var events = [
		{name:"mousemove",handler:moveMouse},
		{name:"mousemove",handler:checkForScroll},
		{name:"mousedown",handler:handleDrag},
		{name:"mouseup",handler:endDrag},
		{name:"click",handler:handleLeftClick},
		{name:"keydown",handler:handleKeyDown},
		{name:"keyup",handler:handleKeyUp},
		{name:"keypress",handler:handleKeyPress}
	];
	
	var helper = browserDependants.std;
			
	animations.staticEvents.mouse = mouse;
	
	this.keysDown = keysDown;
	
	//Used to make the drag fade animation
	function fadeAnimations() {
		for(var i = 0; i < animations.length; i++) {
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
		animations.push(event);
		if(animations.length === 1) {
			fadeAnimations();
		}
	}
	
	function handleDrag(event) {
		//Setup click data, this is a mouse down
		//TODO These need to be translated into world coords!!
		clickPosition = {
			x: mouse.x,
			y: mouse.y,
			rX: mouse.rX,
			rY: mouse.rY,
			timeLeft: animationLengthMs,
			color: selectColor,
			type: "Click",
			right : false,
			shift : keysDown[16] ? true : false
		};
		//Setup Select data
		dragRectangle = new TacoGame.Rectangle(clickPosition.x, clickPosition.y, 0, 0);
		dragRectangle.timeLeft = animationLengthMs / 2;
		dragRectangle.color = selectColor;
		dragRectangle.type = "Select";
		dragRectangle.shift = keysDown[16] ? true : false
		
		if(event.button === 2) {
			dragRectangle = null;
			clickPosition.right = true;
		} else {
			window.addEventListener("mousemove", updateDrag);
		}
	}
	
	function updateDrag(event) {
		if(dragRectangle === null) {
			window.removeEventListener("mousemove", updateDrag);
		} else {
			animations.staticEvents.drag = dragRectangle;
			//canvas draws negative width wrong so need to make sure it is always positive
			dragRectangle.width = Math.abs(mouse.x - clickPosition.x);
			dragRectangle.height = Math.abs(mouse.y - clickPosition.y);
			dragRectangle.x = Math.min(mouse.x, clickPosition.x);
			dragRectangle.y = Math.min(mouse.y, clickPosition.y);
		}
	}
	
	function endDrag(event) {
		window.removeEventListener("mousemove", updateDrag);
		delete animations.staticEvents.drag;
		if(dragRectangle === null) {
			return;
		}
		dragRectangle.width = Math.abs(mouse.x - clickPosition.x);
		dragRectangle.height = Math.abs(mouse.y - clickPosition.y);
		dragRectangle.x = Math.min(mouse.x, clickPosition.x);
		dragRectangle.y = Math.min(mouse.y, clickPosition.y);
		
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
		if (clickPosition.right) {
			clickPosition.x = mouse.x;
			clickPosition.y = mouse.y;
			handleEvent(clickPosition);
		} else if ((Math.abs(mouse.x - clickPosition.x) + 
			Math.abs(mouse.y - clickPosition.y) <= wiggleRoom)) {
			handleEvent(clickPosition);
		}
	}
		
	function handleScroll() {
		if(!scrollEvent.mouseDirections) {
			scrollEvent.left = false;
			scrollEvent.up = false;
			scrollEvent.right = false;
			scrollEvent.down = false;
			scrollEvent.keyDirections = 0;
			if(keysDown[37]) {
				scrollEvent.keyDirections++;
				scrollEvent.left = true;
			}
			if(keysDown[38]) {
				scrollEvent.keyDirections++;
				scrollEvent.up = true;
			}
			if(keysDown[39]) {
				scrollEvent.keyDirections++;
				scrollEvent.right = true;
				if(scrollEvent.left) {
					scrollEvent.keyDirections--;
					if(keysDown[37].timeStamp > keysDown[39].timeStamp) {
						scrollEvent.right = false;
					} else {
						scrollEvent.left = false;
					}
				}
			}
			if(keysDown[40]) {
				scrollEvent.keyDirections++;
				scrollEvent.down = true;
				if(scrollEvent.up) {
					scrollEvent.keyDirections--;
					if(keysDown[38].timeStamp > keysDown[40].timeStamp) {
						scrollEvent.down = false;
					} else {
						scrollEvent.up = false;
					}
				}
			}
		}
		scrollEvent.directions = Math.max(scrollEvent.mouseDirections, scrollEvent.keyDirections);
		if(scrollEvent.directions) {
			var color = scrollEvent.color;
			delete scrollEvent.color;
			handleEvent(scrollEvent);
			scrollEvent.color = color;
		}
	}
	
	function moveMouse(e) {
		if(!mouse.locked) {
			return;
		}
		var viewPort = TacoGame.Map.getViewPort();
		mouse.rX += e[helper.movementX] || 0;
		mouse.rY += e[helper.movementY] || 0;
		mouse.rX = Math.max(Math.min(mouse.rX, viewPort.width), 0);
		mouse.rY = Math.max(Math.min(mouse.rY, viewPort.height), 0);
		mouse.x = mouse.rX + viewPort.x;
		mouse.y = mouse.rY + viewPort.y;
	}
	
	function checkForScroll(event) {
		scrollEvent = {
			up:false,
			down:false,
			right:false,
			left:false,
			x:mouse.rX,
			y:mouse.rY,
			mouseDirections:0, //Max is 2
			keyDirections:0, //Max is 2
			directions:0, //Max is 2
			color:scrollColor,
			type: "Scroll"
		};
		if(scrollEvent.x <= scrollWiggleRoom) {
			scrollEvent.left = true;
			scrollEvent.mouseDirections++;
		}
		if(scrollEvent.x >= (canvas.width - scrollWiggleRoom)) {
			scrollEvent.right = true;
			scrollEvent.mouseDirections++;
		}
		if(scrollEvent.y <= scrollWiggleRoom) {
			scrollEvent.up = true;
			scrollEvent.mouseDirections++;
		}
		if(scrollEvent.y >= (canvas.height - scrollWiggleRoom)) {
			scrollEvent.down = true;
			scrollEvent.mouseDirections++;
		}
		
		if(scrollEvent.mouseDirections) {
			animations.staticEvents.scroll = scrollEvent;
		} else {
			delete animations.staticEvents.scroll;
		}
	}
	
	function handleKeyPress(event) {
		var keyPressEvent = {
			char : String.fromCharCode(event.charCode),
			charCase : event.char,
			type: "KeyPress"
			
		};
		if(event.shiftKey) {
			handleKeyPress.charCase = handleKeyPress.charCase.toUpperCase();
		}
		handleEvent(keyPressEvent);
	}
	
	function handleKeyDown(event) {
		keysDown[event.keyCode] = event;
	}
	
	function handleKeyUp(event) {
		delete keysDown[event.keyCode];
	}
	
	//Creates a Command for the gameEngine, passes on the animation if one exists
	function handleEvent(event) {
		event.owner = TacoGame.Player.id;
		
		if(event.color) {
			var eventClone = {};
			for(var i in event) {
				eventClone[i] = event[i];
			}
			handleFade(eventClone);
		}
		//Commands are select, move attack, or hotkey
		TacoGame.WorldSimulator.queueCommand(TacoGame.createCommand(event));
	}
	
	// Handles when a user gets the cursor locked or unlocked by the game
	function handlePointerLock(event) {
		
		if (document[helper.pointerLockElement]) {
			mouse.locked = true;
			for(var i = 0; i < events.length; i++) {
				window.addEventListener(events[i].name, events[i].handler);
			}
		} else {
			mouse.locked = false;
			keysDown = {};
			for(var i = 0; i < events.length; i++) {
				window.removeEventListener(events[i].name, events[i].handler);
			}
		}
	}
	
	function requestPointerLock(event) {
		canvas[helper.requestPointerLock]();
		if(!mouse.locked) {
			mouse.rX = event.clientX;
			mouse.rY = event.clientY;
		}
	}
	
	return {
		getInteractions : function() {
			return animations;
		},
		init: function() {
			
			canvas = document.getElementById('gameScreen');
			if(canvas.mozRequestPointerLock) {
				helper = browserDependants.moz;
			} else if (canvas.webkitRequestPointerLock) {
				helper = browserDependants.webkit;			
			}
			
			window.addEventListener('click', requestPointerLock, false);
			window.addEventListener(helper.pointerlockchange, handlePointerLock, false);
			setInterval(handleScroll, 20);
			 
			
		},
		keysDown : keysDown
	}
}

window.addEventListener("load", TacoGame.UserInput.init);