"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkPagination = void 0;
var tslib_1 = require("tslib");
var utilities_1 = require("../utilities");
var LinkPagination = /** @class */ (function () {
    function LinkPagination(nextLinkPointer) {
        this.nextLinkValue = null;
        this.nextLinkPointer = nextLinkPointer;
    }
    LinkPagination.prototype.tryPreparingRequest = function (state) {
        var e_1, _a;
        if (state.response === null) {
            this.nextLinkValue = null;
            return true;
        }
        var nextLink = (0, utilities_1.getValueByJsonPointer)(state.response, this.nextLinkPointer);
        if (nextLink == null) {
            return false;
        }
        this.nextLinkValue = nextLink;
        try {
            for (var _b = tslib_1.__values(Object.entries((0, utilities_1.extractQueryParams)(nextLink))), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), pointer = _d[0], setter = _d[1];
                state.request = state.requestUpdater(state.request)(pointer, setter);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    };
    LinkPagination.prototype.applyMetaData = function (response) {
        return tslib_1.__assign(tslib_1.__assign({}, response), { nextLink: this.nextLinkValue });
    };
    return LinkPagination;
}());
exports.LinkPagination = LinkPagination;
