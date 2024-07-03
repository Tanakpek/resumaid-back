"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { ObjectId } = mongoose_1.default.Schema;
const userDetailsSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "full name is required"],
        trim: true,
        text: true,
    },
    family_name: {
        type: String,
        required: [true, "family name is required"],
        trim: true,
        text: true,
    },
    given_name: {
        type: String,
        required: [true, "given name is required"],
        trim: true,
        text: true,
    },
    bio: {
        type: String,
        default: "",
        trim: true,
        text: true,
    },
    email: {
        type: String,
        required: [true, "email is required"],
        trim: true,
        unique: true,
    },
    linkedin: {
        type: String,
        default: "",
    },
    github: {
        type: String,
        default: "",
    },
    personal_website: {
        type: String,
        default: "",
    },
    phone_number: {
        type: String,
        default: "",
    }
}, {
    timestamps: true,
    _id: false,
});
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "full name is required"],
        trim: true,
        text: true,
    },
    family_name: {
        type: String,
        required: [true, "family name is required"],
        trim: true,
        text: true,
    },
    given_name: {
        type: String,
        required: [true, "given name is required"],
        trim: true,
        text: true,
    },
    bio: {
        type: String,
        default: "",
        trim: true,
        text: true,
    },
    email: {
        type: String,
        required: [true, "email is required"],
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: [true, "password is required"],
    },
    email_verified: {
        type: Boolean,
        default: false,
    },
    cv_uploaded: {
        type: Boolean,
        default: false,
    },
    linkedin: {
        type: String,
        default: "",
    },
    github: {
        type: String,
        default: "",
    },
    personal_website: {
        type: String,
        default: "",
    },
    phone_number: {
        type: String,
        default: "",
    },
    cv: {
        type: ObjectId,
        ref: "CV"
    },
    details: {
        type: userDetailsSchema,
    }
}, {
    timestamps: true,
});
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
const User = mongoose_1.default.model("User", userSchema, 'applicaid_users');
exports.default = User;
