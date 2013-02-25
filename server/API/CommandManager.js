/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var commandManager = new function() {

	var events = require('./EventHandler');
	var order = 0;
	var me = this;

	this.queueCommand = function(request, lib) {
		order++;
		request.order = order;
		events.fireEvent("commandQueued", request);
	};
	
	this.addUnit = function(newUnit, lib) {
		events.fireEvent("addUnit", newUnit);
	};
	
	this.getUnits = function() {
		events.fireEvent("resendUnits", {});
	};
	
	this.removeUnit = function(unitId, lib) {
		events.fireEvent("removeUnit", unitId);
	};
};
exports.queueCommand = commandManager.queueCommand;
exports.addUnit = commandManager.addUnit;
exports.getUnits = commandManager.getUnits;
exports.removeUnit = commandManager.removeUnit;