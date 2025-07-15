function createLinkPagedResponse(response) {
  if (isLinkPagedResponse(response)) {
    return response;
  }
  throw new Error('Unable to create instance of LinkPagedResponse');
}
function isLinkPagedResponse(response) {
  return response !== null && 'nextLink' in response;
}
export { createLinkPagedResponse, isLinkPagedResponse };