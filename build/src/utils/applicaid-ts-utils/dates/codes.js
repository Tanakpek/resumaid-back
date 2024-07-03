"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toString = exports.StringToISO = void 0;
const moment_1 = __importDefault(require("moment"));
const StringToISO = (date) => {
    let dateObj;
    if (date === 'PRESENT') {
        return 'PRESENT';
    }
    try {
        dateObj = (0, moment_1.default)(date, "MMMM YYYY");
    }
    catch (error) {
        console.warn('Invalid date 1st try');
    }
    if (!dateObj) {
        try {
            dateObj = (0, moment_1.default)(date, "YYYY");
        }
        catch (error) {
            console.warn('Invalid date 2nd try');
        }
    }
    if (!dateObj) {
        try {
            dateObj = (0, moment_1.default)(date, "MMM YYYY");
        }
        catch (error) {
            console.warn('Invalid date 3rd try');
        }
    }
    try {
        const unixTimestamp = dateObj.unix();
        const res = (new Date(unixTimestamp * 1000)).toISOString();
        return res;
    }
    catch (_a) {
        return null;
    }
};
exports.StringToISO = StringToISO;
const toString = (date) => {
};
exports.toString = toString;
