"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffsetPagination = void 0;
var tslib_1 = require("tslib");
var OffsetPagination = /** @class */ (function () {
    function OffsetPagination(offsetPointer) {
        this.pageOffset = '0';
        this.offsetPointer = offsetPointer;
    }
    OffsetPagination.prototype.tryPreparingRequest = function (state) {
        var _this = this;
        var isUpdated = false;
        state.request = state.requestUpdater(state.request)(this.offsetPointer, function (value) {
            var _a, _b;
            if (state.response === null) {
                isUpdated = true;
                if (value === undefined || value === null) {
                    _this.pageOffset = '0';
                    return value;
                }
                _this.pageOffset = String(value);
                return value;
            }
            var dataLength = (_b = (_a = state.response) === null || _a === void 0 ? void 0 : _a.items.length) !== null && _b !== void 0 ? _b : 0;
            var numericValue = +(value !== null && value !== void 0 ? value : 0);
            var newOffset = numericValue + dataLength;
            _this.pageOffset = String(newOffset);
            isUpdated = true;
            return newOffset;
        });
        return isUpdated;
    };
    OffsetPagination.prototype.applyMetaData = function (response) {
        return tslib_1.__assign(tslib_1.__assign({}, response), { offset: this.pageOffset });
    };
    return OffsetPagination;
}());
exports.OffsetPagination = OffsetPagination;
