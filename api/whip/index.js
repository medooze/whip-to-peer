const Express	= require("express");
const Utils	= require("./utils");

//This is the whip server api 
const api = Express();

//Allow CORS
api.use(Utils.allowCORS);

api.set("trust proxy", true);
api.set("etag", false)
api.set("x-powered-by", false);

//Add apis
api.use("/endpoints"	, require("./routes/Endpoint"));
api.use("/resources"	, require("./routes/Resource"));

//Export api
module.exports = api;
