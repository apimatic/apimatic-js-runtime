import { __awaiter, __generator } from 'tslib';
import { Builder, Parser } from 'xml2js';
var XmlSerialization =
/*#__PURE__*/
/** @class */
function () {
  function XmlSerialization() {}
  XmlSerialization.prototype.xmlSerialize = function (rootName, value) {
    var _a;
    var builder = new Builder();
    return builder.buildObject((_a = {}, _a[rootName] = value, _a));
  };
  XmlSerialization.prototype.xmlDeserialize = function (rootName, xmlString) {
    return __awaiter(this, void 0, void 0, function () {
      var parser;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            parser = new Parser({
              explicitArray: false
            });
            return [4 /*yield*/, parser.parseStringPromise(xmlString)];
          case 1:
            return [2 /*return*/, _a.sent()[rootName]];
        }
      });
    });
  };
  return XmlSerialization;
}();
export { XmlSerialization };