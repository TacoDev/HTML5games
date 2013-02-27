/**
 * 
 */
exports.database = new function() {
	var dbName = 'visaevus';
	var dbPort = 27017;
	var dbIP = "192.168.1.144";
	var db = null;
	
	var mongodb = require('mongodb');
	new mongodb.Db(dbName, new mongodb.Server(dbIP, dbPort, {}), {safe:false}).open(openDB);

	function openDB(error, _db) {
		if(error) throw error;
		db = _db;
	}
	
	function getCollection(name){
		return new mongodb.Collection(db, name);
	}
	
	this.getCollection = getCollection;
};
