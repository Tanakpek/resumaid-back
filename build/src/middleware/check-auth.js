"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helper_classes_1 = require("src/utils/helper_classes");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const checkAuth = (req, res, next) => {
    var _a, _b;
    try {
        let token = (_b = (_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.split(' ')[1];
        token = req.cookies.token;
        if (!token) {
            throw new Error('Authentication failed!, No Token Provided');
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (typeof decodedToken === 'string') {
            throw new Error('Authentication failed!');
        }
        req['userData'] = { userId: decodedToken.id, email: decodedToken.email };
        next();
    }
    catch (err) {
        const error = new helper_classes_1.HttpError('Authentication failed!', 401);
        console.log(error);
        res.sendStatus(401);
        return;
    }
};
exports.checkAuth = checkAuth;
