"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorPagination = void 0;
var tslib_1 = require("tslib");
var utilities_1 = require("../utilities");
var CursorPagination = /** @class */ (function () {
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
            var nextCursor = (0, utilities_1.getValueByJsonPointer)(state.response, _this.nextCursorPointer);
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
        return tslib_1.__assign(tslib_1.__assign({}, response), { nextCursor: this.nextCursorValue });
    };
    return CursorPagination;
}());
exports.CursorPagination = CursorPagination;
