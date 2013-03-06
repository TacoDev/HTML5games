
TacoGame.Commands = {};
TacoGame.Commands.UserCommand = function (event, commit, revert) {
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
	
	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return false;
	}
}

TacoGame.createCommand = function(event) {
	return new TacoGame.Commands["UserCommand" + event.type](event)
}

//Translate this into select or move
TacoGame.Commands.UserCommandClick = function (event) {
	TacoGame.Commands.UserCommand.call(this, event, commit);

	if (event.right) {
		if (TacoGame.Map.isUnitSelected()) {
			event.type = "Move";
			return TacoGame.createCommand(event);
		} else {
			TacoGame.Map.deselectEntities();
		}
	}
	//When the user does the action
	function commit() {
		TacoGame.Map.selectEntities(new TacoGame.Rectangle(event.x - 4, event.y - 4, 8, 8), event.shift, true);
	}
}

TacoGame.Commands.UserCommandKeyPress = function (event) {
	TacoGame.Commands.UserCommand.call(this, event, commit);
	
	function commit() {
		TacoGame.Map.keyPressed(event);
	}
}

TacoGame.Commands.UserCommandMove = function (event) {
	TacoGame.Commands.UserCommand.call(this, event, commit);

	//When the user does the action
	function commit() {
		TacoGame.Map.setDestination(event);
	}
}

TacoGame.Commands.UserCommandSelect = function (event) {
	TacoGame.Commands.UserCommand.call(this, event, commit);
	//Check if this command needs to be synced with others
	function commit() {
		TacoGame.Map.selectEntities(new TacoGame.Rectangle(event.x, event.y, event.width, event.height), event.shift, false);
	}
}

TacoGame.Commands.UserCommandScroll = function (event) {
	TacoGame.Commands.UserCommand.call(this, event, commit);
	
	//When the user does the action
	function commit() {
		TacoGame.Map.scrollViewPort({up:event.up,down:event.down,right:event.right,left:event.left});
	}
}


TacoGame.Commands.UserCommandMoveUnit = function (event) {
	TacoGame.Commands.UserCommand.call(this, event, commit);
	
	//When the user does the action
	function commit() {
		TacoGame.Map.setUnitDestination(event.unit, event.end, event.startTime);
	}
	
	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return true;
	}
}

TacoGame.Commands.UserCommandEntityAction = function (event) {
	TacoGame.Commands.UserCommand.call(this, event, commit);

	
	//When the user does the action
	function commit() {
		TacoGame.Map.applyAction(event.unit, event.action);
	}
	
	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return true;
	}
}