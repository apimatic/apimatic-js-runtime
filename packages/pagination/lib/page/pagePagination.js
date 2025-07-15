"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagePagination = void 0;
var tslib_1 = require("tslib");
var PagePagination = /** @class */ (function () {
    function PagePagination(pagePointer) {
        this.pageNumber = '1';
        this.pagePointer = pagePointer;
    }
    PagePagination.prototype.tryPreparingRequest = function (state) {
        var _this = this;
        var isUpdated = false;
        state.request = state.requestUpdater(state.request)(this.pagePointer, function (value) {
            if (state.response === null) {
                isUpdated = true;
                if (value === undefined || value === null) {
                    _this.pageNumber = '1';
                    return value;
                }
                _this.pageNumber = String(value);
                return value;
            }
            var numericValue = +(value !== null && value !== void 0 ? value : 1);
            var newPage = numericValue + 1;
            _this.pageNumber = newPage.toString();
            isUpdated = true;
            return newPage;
        });
        return isUpdated;
    };
    PagePagination.prototype.applyMetaData = function (response) {
        return tslib_1.__assign(tslib_1.__assign({}, response), { pageNumber: this.pageNumber });
    };
    return PagePagination;
}());
exports.PagePagination = PagePagination;
