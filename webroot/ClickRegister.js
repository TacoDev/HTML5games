TacoGame.ClickRegister = new function (){
	var registrants = [];
	function Registant(polygon, _click, _command){
		this.polygon;
		this.eventType = _click || TacoGame.UserInput.CLICK;
		if(!_command){
			throw new Error("you must register a command");
		}
		this.command = _command;
	}
	
	function RegistrantFactory(polygon, eventType, command){
		return new Registant(polygon, eventType, command);
	}
	function addRegistrant(registrant){
		registrants.push(registrant);
	}
	
	function fireEvents(event){
		for(var i = 0; i < registrants.length; i++){
			if(registrants[i].eventType == event.type
				&& Math.isPointInPolygon(registrants[i].polygon, event) ){
				
				registrants[i].command(event);			
			}
		}
	}
	
	this.fireEvents = fireEvents;
	this.addRegistrant = addRegistrant;
	this.RegistrantFactory = RegistrantFactory;
	
};