"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCursorPagedResponse = exports.createCursorPagedResponse = void 0;
function createCursorPagedResponse(response) {
    if (isCursorPagedResponse(response)) {
        return response;
    }
    throw new Error('Unable to create instance of CursorPagedResponse');
}
exports.createCursorPagedResponse = createCursorPagedResponse;
function isCursorPagedResponse(response) {
    return response !== null && 'nextCursor' in response;
}
exports.isCursorPagedResponse = isCursorPagedResponse;
