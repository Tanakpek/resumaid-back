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
exports.logoutRoutues = exports.loginRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_controller_1 = require("@src/controllers/user/user_controller");
const dotenv_1 = __importDefault(require("dotenv"));
const vars_1 = require("@src/config/vars");
const user_services_1 = require("@src/utils/services/user_services");
const createS3Folder_1 = require("@src/utils/services/createS3Folder");
dotenv_1.default.config();
const usersController = new user_controller_1.UsersController();
const bucket_name = process.env.AWS_BUCKET_NAME;
const router = (0, express_1.Router)();
router.post('/email', [
    (0, express_validator_1.check)('email').isEmail(),
    (0, express_validator_1.check)('password').notEmpty()
], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, express_validator_1.validationResult)(req).isEmpty()) {
        const { email, password } = req.body;
        const login = yield usersController.loginEmail(email, password);
        if (login) {
            const token = jsonwebtoken_1.default.sign({ id: login }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('logged  in');
            res.status(200).json({ token: token, id: login });
        }
        else {
            res.status(500).send('Invalid credentials');
        }
    }
    else {
        res.status(500).send('User not found');
    }
}));
router.get('/email', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    const { email, password } = req.body;
    const login = yield usersController.loginEmail(email, password);
    if (login) {
        const token = jsonwebtoken_1.default.sign({ id: login }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
        console.log('logged  in');
        res.status(200).json({ token: token, id: login });
    }
    else {
        res.status(500).send('Invalid credentials');
    }
}));
router.get('/oauth', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const code = req.query.code;
        const { id_token, access_token } = yield (0, user_services_1.getGoogleAuthTokens)(code);
        const user_info = yield (0, user_services_1.getGoogleUserInfo)(id_token, access_token);
        const login = yield usersController.loginEmail(user_info === null || user_info === void 0 ? void 0 : user_info.data.email, user_info === null || user_info === void 0 ? void 0 : user_info.data.id);
        if (login) {
            const token = jsonwebtoken_1.default.sign({ id: login.id, email: login.email, name: login.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
            res.setHeader('Authorization', `Bearer ${token}`);
            res.redirect(`${vars_1.ORIGIN}/profile`);
            return;
        }
        const user = {
            email: user_info === null || user_info === void 0 ? void 0 : user_info.data.email,
            name: user_info === null || user_info === void 0 ? void 0 : user_info.data.name,
            given_name: user_info === null || user_info === void 0 ? void 0 : user_info.data.given_name,
            family_name: user_info === null || user_info === void 0 ? void 0 : user_info.data.family_name,
            password: user_info === null || user_info === void 0 ? void 0 : user_info.data.id,
            cv_uploaded: false,
            details: {}
        };
        if (!(user_info === null || user_info === void 0 ? void 0 : user_info.data.verified_email)) {
            res.status(500).send('Email not verified');
            return;
        }
        const user_email = yield usersController.createUser(user);
        if (user_email) {
            yield (0, createS3Folder_1.createS3Folder)(user.email);
            const token = jsonwebtoken_1.default.sign({ id: user_email.id, email: user_email.email, name: user_email.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
            yield req.session.save();
            res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
            res.setHeader('Authorization', `Bearer ${token}`);
            console.log(res.getHeaders());
            res.redirect(`${vars_1.ORIGIN}/profile`);
            return;
        }
    }
    catch (e) {
        console.log('oauth login fuckup');
        console.log(e);
        return res.redirect(`${vars_1.ORIGIN}/auth`);
    }
    res.status(200).send('ok');
}));
const logout_router = (0, express_1.Router)();
logout_router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield req.session.destroy(() => {
        res.redirect(`${vars_1.ORIGIN}/login`);
    });
}));
exports.loginRoutes = router;
exports.logoutRoutues = logout_router;
