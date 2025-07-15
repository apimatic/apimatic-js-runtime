"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBuffer = exports.getStreamData = void 0;
var tslib_1 = require("tslib");
var convert_to_stream_1 = require("@apimatic/convert-to-stream");
/**
 * Get streaming data from a given URL.
 * @param client Instance of HttpClient to be used.
 * @param url URL from which to create the readable stream.
 * @returns Stream of data fetched from the URL.
 * @throws Error if unable to retrieve data from the URL.
 */
function getStreamData(client, url) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var res;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client({ method: 'GET', url: url, responseType: 'stream' })];
                case 1:
                    res = _a.sent();
                    if (res.statusCode !== 200 || typeof res.body === 'string') {
                        throw new Error("Unable to retrieve streaming data from ".concat(url));
                    }
                    return [2 /*return*/, res.body];
            }
        });
    });
}
exports.getStreamData = getStreamData;
/**
 * Convert a NodeJS ReadableStream or Blob to a Buffer.
 * @param input NodeJS ReadableStream or Blob to convert.
 * @returns Promise resolving to a Buffer containing the input data.
 */
function toBuffer(input) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var jsonString;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (input === undefined) {
                        throw new Error('Unsupported input type. Expected a Blob or ReadableStream.');
                    }
                    return [4 /*yield*/, (0, convert_to_stream_1.convertFromStream)(input)];
                case 1:
                    jsonString = _a.sent();
                    return [2 /*return*/, Buffer.from(jsonString)];
            }
        });
    });
}
exports.toBuffer = toBuffer;
