function createOffsetPagedResponse(response) {
  if (isOffsetPagedResponse(response)) {
    return response;
  }
  throw new Error('Unable to create instance of OffsetPagedResponse');
}
function isOffsetPagedResponse(response) {
  return response !== null && 'offset' in response;
}
export { createOffsetPagedResponse, isOffsetPagedResponse };