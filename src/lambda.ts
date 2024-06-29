require("dotenv").config();

exports.handler = async (event:any) => {
	console.log('aws lambda handler called');
	if (!process.env.RUN_PATH) {
		console.log("RUN_PATH env variable not set");
		return 500
	}

	const run_path = process.env.RUN_PATH; // e.g. bybit/private/bybit_spot-http(.ts/.js)
	const filePath = `${run_path}`;
	console.log("Main runtime file path is: ", filePath);
	console.log("Current Directory:", process.cwd());

	const handler = require(filePath).handler;
	console.log(handler)
	await handler(event);
};





