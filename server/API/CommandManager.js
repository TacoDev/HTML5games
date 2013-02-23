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
};
exports.queueCommand = commandManager.queueCommand;