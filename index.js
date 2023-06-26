const HTTP = require("http");
const Express = require("express");
const { randomUUID } = require("crypto");
const WebSocketServer = require("websocket").server;
const TransactionManager = require("transaction-manager");

const Port = 8084;

//Create rest api
const rest = Express();

//Endpoint maps
const endpoints = new Map();
const resources = new Map();

//Add to all requests
rest.use('*', (request, response, next) =>
{
	request.endpoints = endpoints;
	request.resources = resources;
	next();
});

rest.use(Express.static("www"));

//Add apis
rest.use("/whip", require("./api/whip/index.js"));

//Create http server
const httpServer = HTTP.createServer(undefined, rest);

//Create ws server
const ws = new WebSocketServer({
	httpServer: httpServer,
	autoAcceptConnections: false,
	keepalive: true,
	keepaliveInterval: 30,
});

// start webserver
httpServer.listen(Port);


//Porcess ws requests
ws.on("request", (request) =>
{
	let uuid;

	//Accept connection
	const connection = request.accept();

	//Create new transaction manager
	const tm = new TransactionManager(connection);

	//Commands
	tm.on("cmd", (cmd) =>
	{
		//Check command name
		switch (cmd.name)
		{
			case "register":
			{
				//If already registered
				if (uuid)
					//Remove uuid
					endpoints.delete(uuid);

				//Get uuid
				uuid = cmd.data.uuid || randomUUID()

				//Make sure we are not overriding one
				if (endpoints.has(uuid))
					throw Error("UUID already assigned");

				//Store uuid 
				endpoints.set(uuid, {
					create: async (offer) =>
					{
						resources.delete(this.resourceId);
						const { answer } = await tm.cmd("create", { offer });
						const id = this.resourceId = randomUUID();
						resources.set(id, this);
						return { id, answer };
					},
					destroy: async () =>
					{
						resources.delete(this.resourceId);
						await tm.cmd("destroy");
					}
				});
				//Send back uuid
				cmd.accept({ uuid });
				break;
			}
			case "unregister":
			{
				//Remove uuid
				endpoints.delete(uuid);
				resources.delete(endpoint.resourceId);
			}
		}
	});

	//Close on disconnect
	connection.on("close", () =>
	{
		//Remove uuid
		endpoints.delete(uuid);
	});
});