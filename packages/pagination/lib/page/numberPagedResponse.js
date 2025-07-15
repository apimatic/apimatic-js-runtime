"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumberPagedResponse = exports.createNumberPagedResponse = void 0;
function createNumberPagedResponse(response) {
    if (isNumberPagedResponse(response)) {
        return response;
    }
    throw new Error('Unable to create instance of NumberPagedResponse');
}
exports.createNumberPagedResponse = createNumberPagedResponse;
function isNumberPagedResponse(response) {
    return response !== null && 'pageNumber' in response;
}
exports.isNumberPagedResponse = isNumberPagedResponse;
