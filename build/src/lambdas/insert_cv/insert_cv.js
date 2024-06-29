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
const util_1 = require("util");
const delay = (0, util_1.promisify)(setTimeout);
const CV_1 = __importDefault(require("../../../../src/models/cv/CV"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../../../../src/models/user/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const lambda_helpers_1 = require("../../../../src/utils/lambda_helpers");
dotenv_1.default.config();
const handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
  console.log('aws lambda handler called');
  yield mongoose_1.default.
  connect(process.env.MONGO_URI).
  then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("database connected successfully");
    try {
      console.log(event);
      const data = JSON.parse(event);
      data['user'] = data['user'].split('_cv')[0];
      data['cv_object']['email'] = data['user'];
      data['cv_object']['education'].forEach((element) => {
        element['immutable'] = true;
      });
      data['cv_object']['achievements_and_awards'] = (0, lambda_helpers_1.makeImmutable)(data['cv_object']['achievements_and_awards']);
      data['cv_object']['professional_certifications'] = (0, lambda_helpers_1.makeImmutable)(data['cv_object']['professional_certifications']);
      data['cv_object']['skills'] = (0, lambda_helpers_1.makeImmutable)(data['cv_object']['skills']);
      data['cv_object']['languages'] = (0, lambda_helpers_1.makeImmutable)(data['cv_object']['languages']);
      Object.values(data['cv_object']['projects']).forEach((element) => {
        element['immutable'] = true;
        element['takeaways'] = (0, lambda_helpers_1.makeImmutable)(element['takeaways']);
      });
      Object.values(data['cv_object']['work']).forEach((element) => {
        element['immutable'] = true;
        element['takeaways'] = (0, lambda_helpers_1.makeImmutable)(element['takeaways']);
      });
      data['cv_object']['volunteer'].forEach((element) => {
        element['immutable'] = true;
        element['takeaways'] = (0, lambda_helpers_1.makeImmutable)(element['takeaways']);
      });
      const cv = new CV_1.default(data['cv_object']);
      yield cv.save();
      yield User_1.default.findByIdAndUpdate(data['user'], { cv: cv._id });
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'all good'
        })
      };
    }
    catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: err
        })
      };
    }
  })).catch((err) => {
    console.log("error connecting to mongodb", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err
      })
    };
  });
});
exports.handler = handler;