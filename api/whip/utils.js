//Make sure promise rejections get to Express (use in async functions)
const wrapAsync = fn => (...args) => fn(...args).catch(args[2]);

function allowCORS(request, response, next)
{
	response.header("Access-Control-Allow-Origin", request.get("origin"));
	response.header("Access-Control-Allow-Headers", "Authorization, Content-Type, Location, Link");
	response.header("Access-Control-Expose-Headers", "Location");
	response.header("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS, PATCH");
	response.header("Access-Control-Allow-Credentials", "true");
	next();
}

function checkJSONBody(request, response, next)
{
	// hack to prevent BodyParser.json() from accepting an empty body and parsing as {}
	if (request.is("json") && parseInt(request.headers["content-length"]) === 0)
		//Error
		return response.status(400).send("Invalid body");
	next();
}

function requireContentType(params)
{
	//Return middleware
	return (request, response, next) => {
		//Check content type
		if (!request.is(params.type))
			//Error
			return response.status(415).send("Unexpected body type");
		next();
	};
}

function parseSDPBody(params)
{
	//Return middleware
	return (request, response, next) => {
		
		//Check the request is from the correct content type
		if (request.is(params.type))
		{
			//Ensure it is a non empty string
			if (!request.body.length || parseInt(request.headers["content-length"]) === 0)
				//Error
				return response.status(400).send("Malformed SDP");
			//Get body as text
			const body = Buffer.isBuffer(request.body) ? request.body.toString() : request.body;
			//Done
			request.sdp = body;
		}
		next();
	}
}

function requireBearerToken(request, response, next)
{
	//Get athorization header
	const authorization = request.headers.authorization;

	if (!authorization)
		return response.status(403).send("Missing Authorization header");

	//Get token from header
	const bearer = authorization.split(" ");

	//Check bearer token syntax
	if (bearer.length !== 2 || bearer[0] !== "Bearer")
		//Error
		return response.status(403).send("Not a bearer token");

	//Store token in the request
	request.token = bearer[1];

	//Done
	next();
}

module.exports = {
	wrapAsync,
	allowCORS,
	checkJSONBody,
	parseSDPBody,
	requireContentType,
	requireBearerToken,
};
