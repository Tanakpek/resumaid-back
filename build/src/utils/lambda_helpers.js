"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeImmutable = void 0;
const makeImmutable = (obj) => {
    return obj.map((value) => {
        return { immutable: true, value: value };
    });
};
exports.makeImmutable = makeImmutable;
