
TacoGame.UserInput.UserCommand = function () {
	this.creationTime = (new Date()).getTime();
	this.applyTime = null;
	this.state = "pending";
	
	this.commit = function() {
		if (this.applyTime === null) {
			this.applyTime = (new Date()).getTime();
		}
		this.state = "commited";
	}
	
	this.revert = function() {
		this.state = "pending";
	}
}

//Translate this into select or move
TacoGame.UserInput.UserCommandClick = function (event) {
	var commandBase = new TacoGame.UserInput.UserCommand();

	if (event.right) {
		if (TacoGame.Map.isUnitSelected()) {
			return new TacoGame.UserInput.UserCommandMove(event);
		} else {
			TacoGame.Map.deselectEntities();
		}
	}
	//When the user does the action
	this.commit = function() {
		commandBase.commit();
		TacoGame.Map.selectEntities(new TacoGame.Rectangle(event.x - 8, event.y - 8, 16, 16), event.shift);
	}
	
	//To undo an action
	this.revert = function() {
		commandBase.revert();
	}
	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return false;
	}
}
//Translate this into select or move
TacoGame.UserInput.UserCommandkeypress = function (event) {

	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return true;
	}
}

TacoGame.UserInput.UserCommandMove = function (event) {
	var commandBase = new TacoGame.UserInput.UserCommand();

	//When the user does the action
	this.commit = function() {
		commandBase.commit();
		TacoGame.Map.setDestination(event);
	}
	
	//To undo an action
	this.revert = function() {
		commandBase.revert();
	}
	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return false;
	}
}


TacoGame.UserInput.UserCommandSelect = function (event) {
	var commandBase = new TacoGame.UserInput.UserCommand();
	//Check if this command needs to be synced with others
	this.commit = function() {
		commandBase.commit();
		TacoGame.Map.selectEntities(new TacoGame.Rectangle(event.x, event.y, event.width, event.height), event.shift);
	}
	
	//To undo an action
	this.revert = function() {
		commandBase.revert();
	}
	
	this.needsSync = function() {
		return false;
	}
}

TacoGame.UserInput.UserCommandKeypress = function (event) {
	var commandBase = new TacoGame.UserInput.UserCommand ();
	
	
	//When the user does the action
	this.commit = function() {
		commandBase.commit();
	}
	
	//To undo an action
	this.revert = function() {
		commandBase.revert();
	}
	
	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return false;
	}
}
TacoGame.UserInput.UserCommandScroll = function (event) {
	var commandBase = new TacoGame.UserInput.UserCommand ();
	
	//When the user does the action
	this.commit = function() {
		commandBase.commit();
		TacoGame.Map.scrollViewPort({up:event.up,down:event.down,right:event.right,left:event.left});
	}
	
	//To undo an action
	this.revert = function() {
		commandBase.revert();
		TacoGame.Map.scrollViewPort({up:event.down,down:event.up,right:event.left,left:event.right});
	}
	
	//Check if this command needs to be synced with others
	this.needsSync = function() {
		return false;
	}
}