import { __assign } from '../_virtual/_tslib.js';
import { getValueByJsonPointer } from '../utilities.js';
var CursorPagination =
/*#__PURE__*/
/** @class */
function () {
  function CursorPagination(currentCursorPointer, nextCursorPointer) {
    this.nextCursorValue = null;
    this.currentCursorPointer = currentCursorPointer;
    this.nextCursorPointer = nextCursorPointer;
  }
  CursorPagination.prototype.tryPreparingRequest = function (state) {
    var _this = this;
    var isUpdated = false;
    state.request = state.requestUpdater(state.request)(this.currentCursorPointer, function (value) {
      if (state.response === null) {
        isUpdated = true;
        if (value === undefined) {
          _this.nextCursorValue = null;
          return value;
        }
        _this.nextCursorValue = value;
        return value;
      }
      var nextCursor = getValueByJsonPointer(state.response, _this.nextCursorPointer);
      if (nextCursor === null) {
        return value;
      }
      _this.nextCursorValue = nextCursor;
      isUpdated = true;
      return nextCursor;
    });
    return isUpdated;
  };
  CursorPagination.prototype.applyMetaData = function (response) {
    return __assign(__assign({}, response), {
      nextCursor: this.nextCursorValue
    });
  };
  return CursorPagination;
}();
export { CursorPagination };