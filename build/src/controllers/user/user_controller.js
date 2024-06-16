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
exports.UsersController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../../../../src/models/user/User"));
class UsersController {
  constructor() {
  }
  createUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
      const hashedPassword = yield bcrypt_1.default.hash(user.password, 10);
      try {
        const data = {
          email: user.email,
          name: user.name,
          given_name: user.given_name,
          family_name: user.family_name
        };
        const userdata = Object.assign(Object.assign({}, data), { password: hashedPassword });
        let new_user = yield User_1.default.create(userdata);
        new_user = yield new_user.save();
        return new_user;
      }
      catch (e) {
        console.error(e);
      }
      return false;
    });
  }
  getUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        const u = yield User_1.default.findById(id);
        return u;
      }
      catch (e) {
        console.log(e);
        return false;
      }
    });
  }
  deleteUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        yield User_1.default.deleteOne({ id: id });
      }
      catch (e) {
        console.error(e);
      }
    });
  }
  loginEmail(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
      const u = yield User_1.default.findOne({ email: email });
      if (u === null) {
        return false;
      } else
      {
        try {
          const match = yield bcrypt_1.default.compare(password, u.password);
          if (match) {
            return u.id;
          } else
          {
            return false;
          }
        }
        catch (e) {
          return false;
        }
      }
    });
  }
}
exports.UsersController = UsersController;