"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColor = void 0;
function getColor(tokens, maxTokens) {
    const red = Math.floor(255 * (1 - tokens / maxTokens)).toString(16).padStart(2, '0');
    const green = Math.floor(255 * (tokens / maxTokens)).toString(16).padStart(2, '0');
    const blue = Math.floor(151 - (1 - tokens / maxTokens)).toString(16).padStart(2, '0');
    const redHex = parseInt(red).toString(16).padStart(2, '0');
    const greenHex = parseInt(green).toString(16).padStart(2, '0');
    const blueHex = parseInt(blue).toString(16).padStart(2, '0');
    return `#${red}${green}${blue}`;
}
exports.getColor = getColor;
