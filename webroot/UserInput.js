
TacoGame.UserInput = new function () {
	
	var wiggleRoom = 8;
	var scrollWiggleRoom = 16;
	var animationLengthMs = 100;
	var animationSteps = 10;
	var clickPosition = null;
	var dragRectangle = null;
	var scrollEvent = {up:false,down:false,right:false,left:false};
	var canvas;
	var animations = [];
	animations.staticEvents = {};
	var selectColor = "#00FF00";
	var attackColor = "#FF0000";
	var scrollColor = "#00FF00";
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
			dragRectangle.width = Math.abs(event.clientX - clickPosition.x);
			dragRectangle.height = Math.abs(event.clientY - clickPosition.y);
			dragRectangle.x = Math.min(event.clientX, clickPosition.x);
			dragRectangle.y = Math.min(event.clientY, clickPosition.y);
		}
	}
	
	function endDrag(event) {
		window.removeEventListener("mousemove", updateDrag);
		delete animations.staticEvents.drag;
		if(dragRectangle === null) {
			return;
		}
		dragRectangle.width = Math.abs(event.clientX - clickPosition.x);
		dragRectangle.height = Math.abs(event.clientY - clickPosition.y);
		dragRectangle.x = Math.min(event.clientX, clickPosition.x);
		dragRectangle.y = Math.min(event.clientY, clickPosition.y);
		
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
	
	function handleScroll() {
		if(animations.staticEvents.scroll) {
			var color = animations.staticEvents.scroll.color;
			delete animations.staticEvents.scroll.color;
			handleEvent(animations.staticEvents.scroll);
			animations.staticEvents.scroll.color = color;
		}
	}
	
	function checkForScroll(event) {
		scrollEvent = {
			up:false,
			down:false,
			right:false,
			left:false,
			x:event.clientX,
			y:event.clientY,
			directions:0, //Max is 2
			color:scrollColor,
			type: "Scroll"
		};
		if(event.clientX <= scrollWiggleRoom) {
			scrollEvent.left = true;
			scrollEvent.directions++;
		}
		if(event.clientX >= (canvas.width - scrollWiggleRoom)) {
			scrollEvent.right = true;
			scrollEvent.directions++;
		}
		if(event.clientY <= scrollWiggleRoom) {
			scrollEvent.up = true;
			scrollEvent.directions++;
		}
		if(event.clientY >= (canvas.height - scrollWiggleRoom)) {
			scrollEvent.down = true;
			scrollEvent.directions++;
		}
		
		if(scrollEvent.directions) {
			animations.staticEvents.scroll = scrollEvent;
		} else {
			delete animations.staticEvents.scroll;
		}
	}
	
	function handleKeyPress(event) {
		event.type = "Keypress";
		handleEvent(event);
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
		TacoGame.WorldSimulator.queueCommand(new TacoGame.UserInput["UserCommand" + event.type](event));
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
			window.addEventListener("mousemove", checkForScroll);
			window.addEventListener("mousedown", handleDrag);
			window.addEventListener("mouseup", endDrag);
			window.addEventListener("click", handleLeftClick);
			window.addEventListener("contextmenu", handleRightClick);
			window.addEventListener("keydown", handleKeyDown);
			window.addEventListener("keyup", handleKeyUp);
			window.addEventListener("keypress", handleKeyPress);
			setInterval(handleScroll, 1/30 * 1000);
		}
	}
}

window.addEventListener("load", TacoGame.UserInput.init);