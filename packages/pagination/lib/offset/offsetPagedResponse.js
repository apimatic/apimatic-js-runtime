"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOffsetPagedResponse = exports.createOffsetPagedResponse = void 0;
function createOffsetPagedResponse(response) {
    if (isOffsetPagedResponse(response)) {
        return response;
    }
    throw new Error('Unable to create instance of OffsetPagedResponse');
}
exports.createOffsetPagedResponse = createOffsetPagedResponse;
function isOffsetPagedResponse(response) {
    return response !== null && 'offset' in response;
}
exports.isOffsetPagedResponse = isOffsetPagedResponse;
