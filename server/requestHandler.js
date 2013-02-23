
var api = require('./availableRequests');
/**
 * @params object request {
 *	string r request to the server
 *	mixed p params to the request
 * }
 * @returns mixed response the response of the client
 */
exports.handle = function(request, lib) {
	request.response = "";
	if(api[request.r.lib]) {
		request.response = api[request.r.lib][request.r.func](request.p, lib);
		return request;
	}
	return request;
}
