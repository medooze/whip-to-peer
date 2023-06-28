const Express	= require("express");

//Create new router for the WHIP resources
const resources = Express.Router();

resources.param("resourceId", (request, response, next, resourceId) => {
	//Get resource object by id
	const resource = request.resources(resourceId);
	//If not found
	if (!resource)
		//Error
		return response.status(404).send("Resource not found");
	//Store resource object
	request.resource = resource;
	next();
});

const resource  = resources.route("/:resourceId");

//PATCH
resource.patch(Utils.requireContentType({type:"application/trickle-ice-sdpfrag"}));
resource.patch((request, response) => {
	//Do nothing
	response.sendStatus(204);
});


//DELETE
resource.delete((request, response) => {
	//Get resource rom request
	const { resource } = request;
	//Stop it
	resource.destroy();

	//Done
	response.sendStatus(200);
});

module.exports = resources;