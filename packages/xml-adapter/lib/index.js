"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlSerialization = void 0;
var tslib_1 = require("tslib");
var xml2js_1 = require("xml2js");
var XmlSerialization = /** @class */ (function () {
    function XmlSerialization() {
    }
    XmlSerialization.prototype.xmlSerialize = function (rootName, value) {
        var _a;
        var builder = new xml2js_1.Builder();
        return builder.buildObject((_a = {}, _a[rootName] = value, _a));
    };
    XmlSerialization.prototype.xmlDeserialize = function (rootName, xmlString) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var parser;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parser = new xml2js_1.Parser({ explicitArray: false });
                        return [4 /*yield*/, parser.parseStringPromise(xmlString)];
                    case 1: return [2 /*return*/, (_a.sent())[rootName]];
                }
            });
        });
    };
    return XmlSerialization;
}());
exports.XmlSerialization = XmlSerialization;
