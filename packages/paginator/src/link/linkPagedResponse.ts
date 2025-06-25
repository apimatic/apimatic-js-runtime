import { PagedResponse } from '../pagedResponse';

export interface LinkPagedResponse<TItem, TPage>
  extends PagedResponse<TItem, TPage> {
  nextLink: string | null;
}

export function createLinkPagedResponse(
  response: PagedResponse<any, any> | null
): LinkPagedResponse<any, any> {
  if (isLinkPagedResponse(response)) {
    return response;
  }
  throw new Error('Unable to create instance of LinkPagedResponse');
}

export function isLinkPagedResponse(
  response: PagedResponse<any, any> | null
): response is LinkPagedResponse<any, any> {
  return response !== null && 'nextLink' in response;
}
