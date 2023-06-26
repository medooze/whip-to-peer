const Express		= require('express');
const Utils		= require("../utils");
const BodyParser	= require("body-parser");

//Create new router for the WHIP endpoints
const endpoints = Express.Router();

//Body parsers
endpoints.use(BodyParser.raw({ type: "application/sdp" }));
endpoints.use(Utils.parseSDPBody({ type: "application/sdp", validate: true }));
endpoints.param("endpointId", (request, response, next, endpointId) => {
	//Get endpoint object by id
	const endpoint = request.endpoints.get(endpointId);
	//If not found
	if (!endpoint)
		//Error
		return response.status(404).send("Resource not found");
	//Store endpoint object
	request.endpoint = endpoint;
	next();
});

const endpoint  = endpoints.route("/:endpointId");

//POST
endpoint.post(Utils.requireContentType({type:"application/sdp"}));
endpoint.post(Utils.wrapAsync(async (request, response) => {
	//Get sdp ofer
	const { sdp } = request;
	
	//Create resource
	const resource = await request.endpoint.create(sdp);
	//Add location to the new resource
	response.location("resources/" + resource.id);
	
	//Done
	response.type("application/sdp");
	response.status(201).send(resource.answer);
}));

module.exports = endpoints;
