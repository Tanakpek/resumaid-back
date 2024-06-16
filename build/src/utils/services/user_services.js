"use strict";
var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {return value instanceof P ? value : new P(function (resolve) {resolve(value);});}
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {try {step(generator.next(value));} catch (e) {reject(e);}}
    function rejected(value) {try {step(generator["throw"](value));} catch (e) {reject(e);}}
    function step(result) {result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);}
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleUserInfo = exports.getGoogleAuthTokens = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const qs_1 = __importDefault(require("qs"));
dotenv_1.default.config();
const vars_1 = require("../../config/vars");
const getGoogleAuthTokens = (code) => __awaiter(void 0, void 0, void 0, function* () {
  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: vars_1.GOOGLE_OAUTH_CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: vars_1.GOOGLE_OAUTH_REDIRECT_URI,
    grant_type: 'authorization_code'
  };
  try {
    const response = yield axios_1.default.post(url, qs_1.default.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  }
  catch (e) {
    console.error(e);
  }
});
exports.getGoogleAuthTokens = getGoogleAuthTokens;
const getGoogleUserInfo = (id_token, access_token) => __awaiter(void 0, void 0, void 0, function* () {
  var _a;
  try {
    const res = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?${id_token}`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    return res;
  }
  catch (e) {
    console.error((_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data);
  }
});
exports.getGoogleUserInfo = getGoogleUserInfo;