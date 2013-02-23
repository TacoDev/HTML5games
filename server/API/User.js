/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
 
var userController = new function() {
/*
	var user = {
		name: "",
		email: "",
		password: "",
		displayName: "",
		guid: ""
	};
*/

	var crypto = require('mongodb');
	var me = this;
	
	function checkParams(obj, lib) {
		if(obj.name && obj.email && obj.password && obj.displayName) {
			return true;
		}
		return false;
	}
//http://nodejs.org/api/crypto.html#crypto_crypto
	this.save = function(request, lib) {
		if(checkParams(request, lib)) {
			//check to see if new user
		}
	}

	this.get = function(request, lib) {
	}

	this.archive = function(name, data) {
	}
}
exports.saveUser = userController.save;
exports.getUser = userController.get;
exports.deleteUser = userController.archive;