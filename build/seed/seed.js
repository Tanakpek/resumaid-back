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
const user_controller_1 = require("@src/controllers/user/user_controller");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const CV_1 = __importDefault(require("@src/models/cv/CV"));
const fs_1 = __importDefault(require("fs"));
const User_1 = __importDefault(require("@src/models/user/User"));
dotenv_1.default.config();
const usersController = new user_controller_1.UsersController();
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    process.exit();
}));
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('connected to db');
    yield User_1.default.deleteMany({});
    yield CV_1.default.deleteMany({});
    yield fs_1.default.readFile('seed/data/seed_1.json', 'utf8', (err, data) => __awaiter(void 0, void 0, void 0, function* () {
        const user = JSON.parse(data);
        let cv = user.cv;
        cv = yield CV_1.default.create(cv);
        user.cv = cv;
        yield User_1.default.create(user);
        yield mongoose_1.default.connection.close();
    }));
}));
