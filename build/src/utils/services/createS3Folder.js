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
exports.createS3Folder = exports.generateS3PresignedURL = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3Configuration = {
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_KEY || 'fail',
    secretAccessKey: process.env.AWS_BUCKET_SECRET || 'fail'
  },
  region: process.env.AWS_REGION || 'us-west-2'
};
const s3 = new client_s3_1.S3Client(s3Configuration);
const generateS3PresignedURL = (BUCKET, Key) => __awaiter(void 0, void 0, void 0, function* () {
  const command = new client_s3_1.PutObjectCommand({ Bucket: BUCKET, Key: Key });
  const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600
  });
  return url;
});
exports.generateS3PresignedURL = generateS3PresignedURL;
const createS3Folder = (folderName, metadata) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const input = {
      Body: "",
      Bucket: "gb-cvs",
      Key: folderName,
      metadata: metadata
    };
    const command = new client_s3_1.PutObjectCommand(input);
    const response = yield s3.send(command);
    return response;
  }
  catch (e) {
    console.error(e);
  }
});
exports.createS3Folder = createS3Folder;