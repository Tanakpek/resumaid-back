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
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("@src/routes/users"));
const auth_1 = require("@src/routes/auth");
const scraping_1 = __importDefault(require("@src/routes/scraping"));
const mongoose_1 = __importDefault(require("mongoose"));
const check_auth_1 = require("@src/middleware/check-auth");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const cookieParser = require("cookie-parser");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(cookieParser());
const cors = require('cors');
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
    methods: 'GET, POST, PATCH, DELETE',
}));
const usersController = new user_controller_1.UsersController();
app.use('/login', auth_1.loginRoutes);
app.use('/logout', auth_1.logoutRoutues);
app.use(check_auth_1.checkAuth);
app.use('/scraping', scraping_1.default);
app.use('/users', users_1.default);
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    process.exit();
}));
const httpsOptions = {
    key: fs_1.default.readFileSync('./src/utils/services/ssl/cert.pem'),
    cert: fs_1.default.readFileSync('./src/utils/services/ssl/cert.pem')
};
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => console.log("database connected successfully"));
const server = https_1.default.createServer(httpsOptions, app).listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Server running at ' + port);
}));
