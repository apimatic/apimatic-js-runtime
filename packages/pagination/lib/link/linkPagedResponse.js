"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLinkPagedResponse = exports.createLinkPagedResponse = void 0;
function createLinkPagedResponse(response) {
    if (isLinkPagedResponse(response)) {
        return response;
    }
    throw new Error('Unable to create instance of LinkPagedResponse');
}
exports.createLinkPagedResponse = createLinkPagedResponse;
function isLinkPagedResponse(response) {
    return response !== null && 'nextLink' in response;
}
exports.isLinkPagedResponse = isLinkPagedResponse;
