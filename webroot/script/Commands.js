
TacoGame.UserInput.UserCommand = function (event, commit, revert) {
	var me = this;
	this.creationTime = (new Date()).getTime();
	this.applyTime = null;
	this.state = "pending";
	this.event = event;
	commit = commit || function() {};
	revert = revert || function() {};
	
	this.fix = function (command) {
		this.creationTime = command.creationTime;
		this.applyTime = command.applyTime;
		this.state = command.state;
		this.event = event;	
	}
	
	this.commit = function() {
		if (this.applyTime === null) {
			this.applyTime = (new Date()).getTime();
		}
		this.state = "commited";
		commit();
	}
	
	this.revert = function() {
		this.state = "pending";
		revert();
	}
	
	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return true;
	}
}

//Translate this into select or move
TacoGame.UserInput.UserCommandClick = function (event) {
	TacoGame.UserInput.UserCommand.call(this, event, commit);

	if (event.right) {
		if (TacoGame.Map.isUnitSelected()) {
			event.type = "Move";
			return new TacoGame.UserInput.UserCommandMove(event);
		} else {
			TacoGame.Map.deselectEntities();
		}
	}
	//When the user does the action
	function commit() {
		TacoGame.Map.selectEntities(new TacoGame.Rectangle(event.x - 4, event.y - 4, 8, 8), event.shift);
	}
	
	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return true;
	}
}
TacoGame.UserInput.UserCommandClick.prototype = new TacoGame.UserInput.UserCommand();


TacoGame.UserInput.UserCommandkeypress = function (event) {
	TacoGame.UserInput.UserCommand.call(this, event);
}
TacoGame.UserInput.UserCommandkeypress.prototype = new TacoGame.UserInput.UserCommand();


TacoGame.UserInput.UserCommandMove = function (event) {
	TacoGame.UserInput.UserCommand.call(this, event, commit);

	//When the user does the action
	function commit() {
		TacoGame.Map.setDestination(event);
	}
	
	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return true;
	}
}
TacoGame.UserInput.UserCommandMove.prototype = new TacoGame.UserInput.UserCommand();


TacoGame.UserInput.UserCommandSelect = function (event) {
	TacoGame.UserInput.UserCommand.call(this, event, commit);
	//Check if this command needs to be synced with others
	function commit() {
		TacoGame.Map.selectEntities(new TacoGame.Rectangle(event.x, event.y, event.width, event.height), event.shift);
	}
	
	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return true;
	}
}
TacoGame.UserInput.UserCommandSelect.prototype = new TacoGame.UserInput.UserCommand();

TacoGame.UserInput.UserCommandKeypress = function (event) {
	TacoGame.UserInput.UserCommand.call(this, event);
}
TacoGame.UserInput.UserCommandKeypress.prototype = new TacoGame.UserInput.UserCommand();

TacoGame.UserInput.UserCommandScroll = function (event) {
	TacoGame.UserInput.UserCommand.call(this, event, commit, revert);
	
	//When the user does the action
	function commit() {
		TacoGame.Map.scrollViewPort({up:event.up,down:event.down,right:event.right,left:event.left});
	}
	
	//To undo an action
	function revert() {
		TacoGame.Map.scrollViewPort({up:event.down,down:event.up,right:event.left,left:event.right});
	}
}
TacoGame.UserInput.UserCommandScroll.prototype = new TacoGame.UserInput.UserCommand();