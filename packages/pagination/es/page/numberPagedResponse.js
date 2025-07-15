function createNumberPagedResponse(response) {
  if (isNumberPagedResponse(response)) {
    return response;
  }
  throw new Error('Unable to create instance of NumberPagedResponse');
}
function isNumberPagedResponse(response) {
  return response !== null && 'pageNumber' in response;
}
export { createNumberPagedResponse, isNumberPagedResponse };