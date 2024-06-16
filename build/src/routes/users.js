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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const user_controller_1 = require("../../../src/controllers/user/user_controller");
const createS3Folder_1 = require("../../../src/utils/services/createS3Folder");
const usersController = new user_controller_1.UsersController();
const router = (0, express_1.Router)();
router.get('/profile', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const user = yield usersController.getUser(req.session.userId);
    return res.status(200).json(user);
  }
  catch (e) {
    console.log(e);
    res.status(500).send('There was an error, please try again later');
  }
}));
router.post('/cv_url', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    const user = yield usersController.getUser(req.session.userId);
    console.log('hiyah');
    const url = yield (0, createS3Folder_1.generateS3PresignedURL)(process.env.AWS_BUCKET_NAME, user.email);
    console.log(url);
    return res.status(200).json({ upload_location: url });
  }
  catch (e) {
    console.log(e);
  }
}));
router.post('/', [
(0, express_validator_1.check)('email').isEmail(),
(0, express_validator_1.check)('name').notEmpty(),
(0, express_validator_1.check)("password").notEmpty()],
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
  try {
    if ((0, express_validator_1.validationResult)(req).isEmpty()) {
      const user = req.body;
      const newuser = yield usersController.createUser(user);
      if (newuser) {
        const id = newuser;
        const folder = yield (0, createS3Folder_1.createS3Folder)(id.email);
        console.log(folder);
        if (!folder) {
          yield usersController.deleteUser(id.id);
          res.status(500).send('User not created');
        }
        req.session.userId = id;
        console.log('created user');
        res.status(200);
      } else
      {
        res.status(500).send('User not created');
      }
    } else
    {
      res.status(500).send('User not created');
    }
  }
  catch (e) {
    res.status(500).send('There was an error, please try again later');
  }
}));
exports.default = router;