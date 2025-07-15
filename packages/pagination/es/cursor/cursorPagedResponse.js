function createCursorPagedResponse(response) {
  if (isCursorPagedResponse(response)) {
    return response;
  }
  throw new Error('Unable to create instance of CursorPagedResponse');
}
function isCursorPagedResponse(response) {
  return response !== null && 'nextCursor' in response;
}
export { createCursorPagedResponse, isCursorPagedResponse };