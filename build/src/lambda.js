var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require("dotenv").config();
exports.handler = (event) => __awaiter(this, void 0, void 0, function* () {
    console.log('aws lambda handler called');
    if (!process.env.RUN_PATH) {
        console.log("RUN_PATH env variable not set");
        return 500;
    }
    const run_path = process.env.RUN_PATH;
    const filePath = `${run_path}`;
    console.log("Main runtime file path is: ", filePath);
    console.log("Current Directory:", process.cwd());
    const handler = require(filePath).handler;
    console.log(handler);
    yield handler(event);
});
