"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const delay = (0, util_1.promisify)(setTimeout);
const CV_1 = __importDefault(require("../../models/cv/CV"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../../models/user/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    mongoose_1.default
        .connect(process.env.MONGO_URI)
        .then(() => console.log("database connected successfully"));
    console.log(process.env.MONGO_URI);
    const cv = yield CV_1.default.findOne({ email: 'a' });
    console.log(cv);
    yield User_1.default.findOneAndUpdate({ email: 'akpektan@gmail.com' }, { $set: { cv: cv._id, cv_uploaded: true } });
});
main();
