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
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const dotenv_1 = __importDefault(require("dotenv"));
const vars_1 = require("@src/config/vars");
const scrape_instruction_controller_1 = require("@src/controllers/scraper/scrape_instruction_controller");
const User_1 = __importDefault(require("@src/models/user/User"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const scrape_instruction_controller = new scrape_instruction_controller_1.ScrapeInstructionsController();
router.get('/instructions/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const instructions = yield scrape_instruction_controller.getScrapeInstructions();
        if (!instructions) {
            res.status(500).send('instructions not found');
            return;
        }
        return res.status(200).json(instructions);
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/resume/', [
    (0, express_validator_1.body)('description').isString(),
    (0, express_validator_1.body)('description').isLength({ min: 10 }),
    (0, express_validator_1.body)('job_title').isString(),
    (0, express_validator_1.body)('job_title').isLength({ min: 5 }),
    (0, express_validator_1.body)('company').isString(),
    (0, express_validator_1.body)('company').isLength({ min: 2 }),
    (0, express_validator_1.body)('job_id').isString(),
    (0, express_validator_1.body)('job_board').isString(),
], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.userData.userId).populate('cv');
        const cv = user.cv;
        const fileResponse = yield (0, axios_1.default)(vars_1.DATA_API_URL + '/api/v1/generate/cover_letter/', {
            method: 'post',
            responseType: 'stream',
            data: Object.assign(Object.assign({}, req.body), { cv })
        });
        console.log('here we are');
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/cover/', [], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.userData.userId).populate('cv');
        const cv = user.cv;
        console.log(Object.assign(Object.assign({}, req.body), { cv }));
        const fileResponse = yield (0, axios_1.default)(vars_1.DATA_API_URL + '/api/v1/generate/cover_letter/', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            data: Object.assign(Object.assign({}, req.body), { cv })
        });
        console.log(fileResponse);
        console.log('here we are');
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
exports.default = router;
